import {
  h,
  Component,
  Fragment,
} from 'preact';
import { route } from 'preact-router';
import API from '@3dlook/saia-sdk/lib/api';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Camera from '@3dlook/camera/src/Camera';

import actions from '../../store/actions';
import FlowService from '../../services/flowService';
import { store } from '../../store';
import {
  send,
  transformRecomendations,
  wait,
  mobileFlowStatusUpdate,
  isMobileDevice,
  getAsset,
} from '../../helpers/utils';
import {
  gaUploadOnContinue,
  gaOpenCameraFrontPhoto,
  gaOpenCameraSidePhoto,
} from '../../helpers/ga';
import {
  Preloader,
  Stepper,
  UploadBlock,
  Requirements,
} from '../../components';

import './Upload.scss';

let isPhoneLocked = false;
let isRefreshed = false;

/**
 * Upload page component.
 */
class Upload extends Component {
  constructor(props) {
    super(props);

    this.init(props);

    this.state = {
      isFrontImageValid: true,
      isSideImageValid: true,

      // image errors
      frontImagePose: null,
      sideImagePose: null,

      isPending: false,

      // photoType: 'front',
      // isPhotoExample: false,

      // activeTab: props.frontImage && !props.sideImage ? 'side' : 'front',
    };

    const { setPageReloadStatus } = props;

    this.reloadListener = () => {
      isRefreshed = true;
      setPageReloadStatus(true);
    };

    window.addEventListener('unload', this.reloadListener);
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps);
  }

  componentWillUnmount() {
    const { setCamera } = this.props;

    setCamera(null);

    if (this.unsubscribe) this.unsubscribe();

    clearInterval(this.timer);

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('webkitvisibilitychange', this.handleVisibilityChange);
    window.removeEventListener('unload', this.reloadListener);
    window.removeEventListener('offline', this.setOfflineStatus);
  }

  componentDidMount() {
    const {
      camera,
      setIsNetwork,
      isNetwork,
      token,
      flowId,
      pageReloadStatus,
      isFromDesktopToMobile,
    } = this.props;

    window.addEventListener('offline', this.setOfflineStatus);

    // if camera is active when page refreshed
    if (camera) {
      const { setCamera } = this.props;

      setCamera(null);
    }

    if (!isNetwork) {
      // after not found page, if was network error
      setIsNetwork(true);
    }

    if (token && flowId && !this.flow) {
      this.flow = new FlowService(token);
      this.flow.setFlowId(flowId);

      // PAGE RELOAD: update flowState and set lastActiveDate for desktop loader
      if (pageReloadStatus && isFromDesktopToMobile) {
        const { flowState, setPageReloadStatus } = this.props;

        setPageReloadStatus(false);

        mobileFlowStatusUpdate(this.flow, flowState);
      }
    }
  }

  init(props) {
    const { token } = props;

    if (token && !this.api) {
      this.api = new API({
        host: `${API_HOST}/api/v2/`,
        key: token,
      });
    }
  }

  /**
   * Save front image to state
   */
  saveFrontFile = (file) => {
    const {
      addFrontImage,
      setHeaderIconsStyle,
      setCamera,
      camera,
      isTableFlow,
      hardValidation,
    } = this.props;

    setHeaderIconsStyle('default');
    addFrontImage(file);

    if (isTableFlow) {
      if (camera) {
        if (!(hardValidation.front && !hardValidation.side)) {
          this.triggerSideImage();
        }
      }
    } else {
      setCamera(null);
    }
  }

  /**
   * Save side image to state
   */
  saveSideFile = (file) => {
    const {
      addSideImage,
      isMobile,
      setHeaderIconsStyle,
      setCamera,
      isTableFlow,
    } = this.props;

    setHeaderIconsStyle('default');

    if (!isTableFlow) {
      setCamera(null);
    }

    if (isMobile) {
      this.unsubscribe = store.subscribe(() => {
        const state = store.getState();

        if (state.frontImage && state.sideImage) {
          this.unsubscribe();
          this.onNextButtonClick(null, state);
        }
      });
    }

    addSideImage(file);
  }

  turnOffCamera = () => {
    const { setCamera } = this.props;

    setCamera(null);
  }

  /**
   * On next button click handler
   *
   * @async
   */
  onNextButtonClick = async (e, props = this.props) => {
    if (e) {
      e.preventDefault();
    }

    const {
      frontImage,
      sideImage,
      height,
      gender,
      brand,
      bodyPart,
      isFromDesktopToMobile,
      phoneNumber,
      productUrl,
      deviceCoordinates,
    } = props;

    let { personId } = props;

    const {
      setRecommendations,
      setHardValidation,
      addFrontImage,
      addSideImage,
      setPersonId,
      setMeasurements,
      setBodyType,
      origin,
      email,
      weight,
      setProcessingStatus,
      taskId,
      setTaskId,
      isTableFlow,
      sizeChartUUID,
    } = this.props;

    try {
      if (!frontImage) {
        this.setState({
          isFrontImageValid: false,
        });
      }

      if (!sideImage) {
        this.setState({
          isSideImageValid: false,
        });
      }

      if (!frontImage || !sideImage) {
        return;
      }

      // is phone locked detect
      let hidden;
      let visibilityChange;

      if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
      } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
      }

      this.handleVisibilityChange = async () => {
        if (document[hidden]) {
          isPhoneLocked = true;

          await window.location.reload();
        }
      };

      document.addEventListener(visibilityChange, this.handleVisibilityChange);

      this.setState({
        isFrontImageValid: !!frontImage,
        isSideImageValid: !!sideImage,
        isPending: true,
      });

      let taskSetId;

      // use only real images
      // ignore booleans for mobile flow
      const images = {};

      if (frontImage !== true) {
        images.frontImage = frontImage;
      }

      if (sideImage !== true) {
        images.sideImage = sideImage;
      }

      const photoFlowType = isTableFlow ? 'hand' : 'friend';

      if (!personId) {
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({
            processStatus: 'Initiating Profile Creation',
          });
        }

        setProcessingStatus('Initiating Profile Creation');

        const createdPersonId = await this.api.person.create({
          gender,
          height,
          email,
          photoFlowType,
          ...(weight && { weight }),
          measurementsType: 'all',
        });

        setPersonId(createdPersonId);
        personId = createdPersonId;

        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({
            processStatus: 'Profile Creation Completed!',
          });
        }

        setProcessingStatus('Profile Creation Completed!');
        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Uploading' });
        }

        setProcessingStatus('Photo Uploading');

        taskSetId = await this.api.person.updateAndCalculate(createdPersonId, {
          ...images,
          deviceCoordinates: { ...deviceCoordinates },
          measurementsType: 'all',
        });

        setTaskId(taskSetId);

        await wait(1000);

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({
            processStatus: 'Photo Upload Completed!',
          });
        }

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      } else {
        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({ processStatus: 'Photo Uploading' });
        }

        setProcessingStatus('Photo Uploading');

        await this.api.person.update(personId, {
          ...images,
          photoFlowType,
          deviceCoordinates: { ...deviceCoordinates },
        });

        await wait(1000);

        // do not calculate again id page reload
        if (!taskId) {
          taskSetId = await this.api.person.calculate(personId);

          setTaskId(taskSetId);
        } else {
          taskSetId = taskId;
        }

        if (isFromDesktopToMobile) {
          this.flow.updateLocalState({
            processStatus: 'Photo Upload Completed!',
          });
        }

        setProcessingStatus('Photo Upload Completed!');
        await wait(1000);
      }

      if (isFromDesktopToMobile) {
        this.flow.updateLocalState({
          processStatus: 'Calculating your Measurements',
        });
      }

      setProcessingStatus('Calculating your Measurements');

      const person = await this.api.queue.getResults(taskSetId, 4000, personId);

      await wait(1000);

      if (isFromDesktopToMobile) {
        this.flow.updateLocalState({ processStatus: 'Sending Your Results' });
      }

      setProcessingStatus('Sending Your Results');
      await wait(1000);

      const measurements = {
        hips: person.volume_params.high_hips,
        chest: person.volume_params.chest,
        waist: person.volume_params.waist,
        thigh: person.volume_params.thigh,
        low_hips: person.volume_params.low_hips,
        inseam: person.front_params.inseam,
        gender,
        height,
      };

      setBodyType(person.volume_params.body_type);
      setMeasurements(measurements);

      await this.flow.updateState({
        measurements,
        bodyType: person.volume_params.body_type,
      });

      if (isFromDesktopToMobile) {
        localStorage.setItem(
          'saia-pf-widget-data',
          JSON.stringify(measurements),
        );
      }

      let recommendations;
      let originalRecommendations;

      if (brand && bodyPart && !sizeChartUUID) {
        originalRecommendations = await this.api.sizechart.getSize({
          gender,
          hips: person.volume_params.high_hips,
          chest: person.volume_params.chest,
          waist: person.volume_params.waist,
          thigh: person.volume_params.thigh,
          low_hips: person.volume_params.low_hips,
          inseam: person.front_params.inseam,
          brand,
          body_part: bodyPart,
        });
      } else if (sizeChartUUID) {
        originalRecommendations = await this.api.sizechart.getSize({
          gender,
          hips: person.volume_params.high_hips,
          chest: person.volume_params.chest,
          waist: person.volume_params.waist,
          low_hips: person.volume_params.low_hips,
          brand: 'placeholder',
          body_part: 'placeholder',
          uuid: sizeChartUUID,
        });
      } else {
        originalRecommendations = await this.api.product.getRecommendations({
          gender,
          hips: person.volume_params.high_hips,
          chest: person.volume_params.chest,
          waist: person.volume_params.waist,
          thigh: person.volume_params.thigh,
          low_hips: person.volume_params.low_hips,
          inseam: person.front_params.inseam,
          url: productUrl,
        });
      }

      if (originalRecommendations) {
        recommendations = transformRecomendations(originalRecommendations);

        setRecommendations(recommendations);
      }

      send('recommendations', recommendations, origin);

      gaUploadOnContinue();

      if (
        !recommendations
        || (!recommendations.normal
          && !recommendations.tight
          && !recommendations.loose)
      ) {
        route('/not-found', true);
        // ok, show just recommendations
      } else {
        const { id } = person;

        const customerData = {};

        if (phoneNumber) {
          customerData.phone = phoneNumber;
        }

        send(
          'data',
          {
            ...measurements,
            personId,
          },
          origin,
        );

        await this.flow
          .updateState({
            saiaPersonId: id,
          })
          .then(() => {
            route('/results', true);
          });
      }
    } catch (error) {
      if (!isPhoneLocked) {
        // hard validation part
        if (
          error
          && error.response
          && error.response.data
          && error.response.data.sub_tasks
        ) {
          const subTasks = error.response.data.sub_tasks;

          const frontTask = subTasks.filter(
            (item) => item.name.indexOf('front_') !== -1,
          )[0];
          const sideTask = subTasks.filter(
            (item) => item.name.indexOf('side_') !== -1,
          )[0];
          const measurementError = subTasks.filter(
            (item) => item.name.indexOf('measurement_') !== -1,
          )[0];

          setHardValidation({
            front: frontTask.message,
            side: sideTask.message,
            ...(measurementError && { measurementError: true }),
          });

          // reset front image if there is hard validation error
          // in the front image
          if (frontTask.message) {
            addFrontImage(null);
          }

          // reset side image if there is hard validation error
          // in the side image
          if (sideTask.message) {
            addSideImage(null);
          }

          if (measurementError) {
            addFrontImage(null);
            addSideImage(null);
          }

          route('/hard-validation', true);
        } else if (error && error.response && error.response.status === 400) {
          route('/not-found', true);
        } else if (error && error.response && error.response.data) {
          const {
            detail,
            brand: brandError,
            body_part: bodyPartError,
          } = error.response.data;
          alert(detail || brandError || bodyPartError);
          route('/not-found', true);
        } else {
          if (error.message.includes('is not specified')) {
            const { returnUrl } = this.props;

            alert('Oops...\nThe server lost connection...\nPlease restart widget flow on the desktop or start again on mobile');

            window.location.href = returnUrl;

            return;
          }

          // for iphone after page reload
          await wait(2000);

          if (isRefreshed) return;

          console.error(error);

          route('/not-found', true);
        }
      }
    }
  }

  triggerFrontImage = () => {
    const { setCamera } = this.props;

    gaOpenCameraFrontPhoto();

    setCamera('front');
  }

  triggerSideImage = () => {
    const { setCamera } = this.props;

    gaOpenCameraSidePhoto();

    setCamera('side');
  }

  openPhotoExample = (photoType) => {
    this.setState({
      isPhotoExample: true,
      photoType,
    });
  }

  closePhotoExample = () => {
    this.setState({
      isPhotoExample: false,
    });
  }

  setOfflineStatus = () => {
    const { setIsNetwork } = this.props;

    setIsNetwork(false);

    alert('Check your internet connection and try again');

    route('/not-found', true);
  }

  disableTableFlow = () => {
    const { setIsTableFlowDisabled, setIsTableFlow, setCamera } = this.props;

    setCamera(null);
    setIsTableFlowDisabled(true);
    setIsTableFlow(false);
  }

  setDeviceCoordinates = (coords) => {
    const {
      addFrontDeviceCoordinates,
      addSideDeviceCoordinates,
      camera,
    } = this.props;

    if (camera === 'front') {
      addFrontDeviceCoordinates(coords);
    } else {
      addSideDeviceCoordinates(coords);
    }
  }

  render() {
    const isDesktop = !isMobileDevice();

    const {
      isPending,
      isFrontImageValid,
      isSideImageValid,
      frontImagePose,
      frontImageBody,
      sideImagePose,
      sideImageBody,
    } = this.state;

    const {
      frontImage,
      sideImage,
      gender,
      camera,
      sendDataStatus,
      isMobile,
      isPhotosFromGallery,
      isTableFlow,
      hardValidation,
    } = this.props;

    let title;
    let frontActive = false;
    let sideActive = false;

    if (isTableFlow) {
      title = 'requirements';
      frontActive = (!frontImage && !sideImage) || (!frontImage && sideImage);
      sideActive = frontImage && !sideImage;
    } else if ((!frontImage && !sideImage) || (!frontImage && sideImage)) {
      title = 'Take Front photo';
      frontActive = true;
    } else if (frontImage && !sideImage) {
      title = 'Take Side photo';
      sideActive = true;
    }

    return (
      <div className="screen active">
        {isDesktop ? (
          <div className="tutorial__desktop-msg">
            <h2>Please open this link on your mobile device</h2>
          </div>
        ) : (
          <Fragment>
            <Stepper steps="9" current={frontActive ? 7 : 8} />

            <div className="screen__content upload">
              <h3 className="screen__title upload__title">
                {title}

                <div className="upload__upload-file">
                  <UploadBlock
                    className={classNames({
                      active: frontActive,
                    })}
                    gender={gender}
                    type="front"
                    validation={{ pose: frontImagePose, body: frontImageBody }}
                    change={this.saveFrontFile}
                    isValid={isFrontImageValid}
                    value={frontImage}
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
                  />
                  <UploadBlock
                    className={classNames({
                      active: sideActive,
                    })}
                    gender={gender}
                    type="side"
                    validation={{ pose: sideImagePose, body: sideImageBody }}
                    change={this.saveSideFile}
                    isValid={isSideImageValid}
                    value={sideImage}
                    openPhotoExample={this.openPhotoExample}
                    photosFromGallery={isPhotosFromGallery}
                  />
                </div>
              </h3>

              <Requirements
                isTableFlow={isTableFlow}
                video={isTableFlow && getAsset(true, gender, 'videoExample')}
                photoBg={!isTableFlow && getAsset(false, gender, frontActive ? 'frontExample' : 'sideExample')}
              />
            </div>
            <div className="screen__footer">
              <button
                className={classNames('button', 'upload__front-image-btn', {
                  active: frontActive,
                })}
                onClick={this.triggerFrontImage}
                type="button"
              >
                Let&apos;s start
              </button>

              <button
                className={classNames('button', 'upload__side-image-btn', {
                  active: sideActive,
                })}
                onClick={this.triggerSideImage}
                type="button"
              >
                Let&apos;s start
              </button>
            </div>
          </Fragment>
        )}

        {/* {isPhotoExample ? ( */}
        {/*  <PhotoExample photoType={photoType} closePhotoExample={this.closePhotoExample} /> */}
        {/* ) : null} */}

        <Preloader
          isActive={isPending}
          status={sendDataStatus}
          isMobile={isMobile}
          gender={gender}
        />

        {camera ? (
          <Camera
            type={camera}
            gender={gender}
            saveFront={this.saveFrontFile}
            saveSide={this.saveSideFile}
            isTableFlow={isTableFlow}
            hardValidation={hardValidation}
            disableTableFlow={this.disableTableFlow}
            turnOffCamera={this.turnOffCamera}
            setDeviceCoordinates={this.setDeviceCoordinates}
          />
        ) : null}
      </div>
    );
  }
}

export default connect((state) => state, actions)(Upload);

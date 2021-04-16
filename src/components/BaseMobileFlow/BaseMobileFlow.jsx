import { h, Component } from 'preact';

import FlowService from '../../services/flowService';
import {
  getSearchParam,
  isMobileDevice,
  parseGetParams
} from '../../helpers/utils';

/**
 * Mobile flow page component
 */
class BaseMobileFlow extends Component {
  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  componentDidMount() {
    const {
      setFlowId,
      setBrand,
      setBodyPart,
      setProductUrl,
      setToken,
      setIsMobile,
      matches,
      addHeight,
      addGender,
      addFrontImage,
      addSideImage,
      setPersonId,
      setIsFromDesktopToMobile,
      setReturnUrl,
      setWidgetUrl,
      setRecommendations,
      setBodyType,
      setFakeSize,
      setEmail,
      setPhoneNumber,
      setProductId,
      setUnits,
      setWeight,
      resetState,
      setIsPhotosFromGallery,
      setSizeChartUUID,
    } = this.props;

    if (!isMobileDevice()) {
      setIsMobile(false);

      return;
    }

    const token = getSearchParam(window.location.search, 'key') || API_KEY || parseGetParams().key;
    setToken(token);

    if (!matches.id) { return; }

    this.flow = new FlowService(token);

    resetState();

    this.flow.resetGlobalState();

    setToken(token);
    setFlowId(matches.id);

    this.flow.setFlowId(matches.id);

    return this.flow.get()
      .then((flowStateResult) => {
        const brand = flowStateResult.state.brand || TEST_BRAND;
        const bodyPart = flowStateResult.state.bodyPart || TEST_BODY_PART;
        const photosFromGallery = flowStateResult.state.photosFromGallery || false;

        if (photosFromGallery) {
          setIsPhotosFromGallery(true);
        }

        setPersonId(flowStateResult.person);
        setBrand(brand);
        setBodyPart(bodyPart);
        setProductUrl(flowStateResult.state.productUrl);
        setIsMobile(isMobileDevice());
        addHeight(flowStateResult.state.height);
        setWeight(flowStateResult.state.weight);
        addGender(flowStateResult.state.gender);
        addFrontImage(flowStateResult.state.frontImage);
        addSideImage(flowStateResult.state.sideImage);
        setIsFromDesktopToMobile(true);
        setWidgetUrl(flowStateResult.state.widgetUrl);
        setReturnUrl(flowStateResult.state.returnUrl);
        setRecommendations(flowStateResult.state.recommendations);
        setBodyType(flowStateResult.state.bodyType);
        setFakeSize(flowStateResult.state.fakeSize);
        setEmail(flowStateResult.state.email);
        setPhoneNumber(flowStateResult.state.phoneNumber);
        setProductId(flowStateResult.state.productId);
        setUnits(flowStateResult.state.units);
        setSizeChartUUID(flowStateResult.state.size_chart_uuid);
      });
  }
}

export default BaseMobileFlow;

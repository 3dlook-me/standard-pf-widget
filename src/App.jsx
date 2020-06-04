import { h, render, Component } from 'preact';
import Router from 'preact-router';
import { createHashHistory } from 'history';
import { Provider } from 'react-redux';

// main file have to be here
import './scss/_index.scss';

import { store } from './store';
import { gaStart } from './helpers/ga';
import { updateInternetStatus } from './helpers/utils';
import { Header, Help } from './components';
import {
  Welcome,
  Email,
  GenderContainer,
  HeightContainer,
  WeightContainer,
  QRCodeContainer,
  Tutorial,
  Upload,
  QRCodeHelp,
  Results,
  HardValidation,
  NotFound,
  MobileFlow,
  Browser,
  CameraModeSelection,
  HowToTakePhotos,
} from './containers';

import landscapeView from './images/landscape-view.svg';

console.log(`%cVERSION: ${VERSION}, COMMITHASH: ${COMMITHASH}, BRANCH: ${BRANCH}`, 'background: #f00; color: #fff; font-size: 20px;');

class App extends Component {
  constructor(props) {
    super(props);

    gaStart();
  }

  componentDidMount() {
    window.addEventListener('online', updateInternetStatus);
    window.addEventListener('offline', updateInternetStatus);
  }

  render() {
    return (
      <Provider store={store}>
        <div className="landscape-view">
          <figure className="landscape-view__img">
            <img src={landscapeView} alt="landscapeView" />
          </figure>
          <p className="landscape-view__txt">Please turn your device</p>
        </div>
        <div className="widget-container widget-container--no-bg">
          <Header help={this.toggleHelp} />
          <Help />

          <Router history={createHashHistory()}>
            <Welcome path="/" />
            <Email path="/email" />
            <GenderContainer path="/gender" />
            <HeightContainer path="/height" />
            <WeightContainer path="/weight" />
            <QRCodeContainer path="/qrcode" />
            <QRCodeHelp path="/qrcode-help" />
            <CameraModeSelection path="/camera-mode-selection" />
            <HowToTakePhotos path="/how-to-take-photos" />
            <Upload path="/upload" />
            <Tutorial path="/tutorial" />
            <HardValidation path="/hard-validation" />
            <NotFound path="/not-found" />
            <Results path="/results" />
            <MobileFlow path="/mobile/:id" />
            <Browser path="/browser" />
          </Router>
        </div>
      </Provider>
    );
  }
}

render(<App />, document.body);

export default App;

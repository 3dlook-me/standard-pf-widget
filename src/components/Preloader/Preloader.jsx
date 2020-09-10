import { h } from "preact";
import classNames from "classnames";

import "./Preloader.scss";
import firstStageFemale from "../../images/stage_1.svg";
import secondStageFemale from "../../images/stage_2.svg";
import thirdStageFemale from "../../images/stage_3.svg";
import indicator from "../../images/line.svg";
import spinner from "../../images/loader-for-phone.svg";
import phone from "../../images/phone-for-loader.svg";

import stageMale from "../../images/friend_male_front.png";

/**
 * Preloader component
 */
const Preloader = ({ isActive, status, isMobile, gender }) => (
  <div className={`preloader ${isActive ? "active" : ""}`}>
    <div
      className={classNames("preloader__instructions", {
        "preloader__instructions--active": !isMobile && status === "",
      })}
    >
      <div className="preloader__instructions-phone-wrap">
        <img
          className="preloader__instructions-phone"
          src={phone}
          alt="phone"
        />
        <img
          className="preloader__instructions-spinner"
          src={spinner}
          alt="spinner"
        />
      </div>
      <p>
        Follow instructions on
        <b> your mobile phone</b>
        <br />
        to get your perfect fit
      </p>
    </div>

    <div className="preloader__title-wrap">
      <h2 className="preloader__title screen__title">The magic is happening</h2>

      <p className="preloader__status">{status}</p>
    </div>

    <div className="preloader__animation">
      <img
        className="preloader__animation-stage preloader__animation-stage--first"
        src={gender === "female" ? firstStageFemale : stageMale}
        alt="stage-1"
      />
      <img
        className="preloader__animation-stage preloader__animation-stage--second"
        src={gender === "female" ? secondStageFemale : stageMale}
        alt="stage-2"
      />
      <img
        className="preloader__animation-stage preloader__animation-stage--third"
        src={gender === "female" ? thirdStageFemale : stageMale}
        alt="stage-3"
      />
      <img
        className="preloader__animation-indicator"
        src={indicator}
        alt="line"
      />
    </div>

    {isMobile ? (
      <div className="preloader__warning-block">
        <div className="preloader__warning-icon">×</div>
        <p className="preloader__warning-txt">
          Please
          <b> do not lock your phone, </b>
          we are computing your measurements! &#128522;
        </p>
      </div>
    ) : (
      <p className="preloader__text">
        <span>
          It might take us up to
          <b> one minute </b>
          to find your perfect fit. Thanks for being patient!
        </span>
      </p>
    )}
  </div>
);

export default Preloader;

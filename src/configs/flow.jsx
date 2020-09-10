import femaleTableVideo from "../video/table-flow-example.mp4";
import femaleFriendVideo from "../video/friend-flow-example.mp4";
import maleTableVideo from "../video/table-flow-male-example.mp4";
import maleFriendVideo from "../video/friend-flow-male-example.mp4";

import femaleTableRequirementsVideo from "../video/table-flow-requirements.mp4";

import femaleFriendImgFront from "../images/friend_front.png";
import femaleFriendImgSide from "../images/friend_side.png";
import maleFriendImgFront from "../images/friend_male_front.png";
import maleFriendImgSide from "../images/friend_male_side.png";

import exampleSideFemale from "../images/HV-side.png";
import exampleFrontFemale from "../images/HV-front.png";

export const flow = {
  femaleTable: {
    video: femaleTableVideo,
    videoRequirements: femaleTableRequirementsVideo,
    exampleFrontImg: exampleFrontFemale,
    exampleSideImg: exampleSideFemale,
  },
  femaleFriend: {
    video: femaleFriendVideo,
    imgFront: femaleFriendImgFront,
    imgSide: femaleFriendImgSide,
  },
  maleTable: {
    video: maleTableVideo,
    videoRequirements: maleFriendVideo,
    exampleFrontImg: maleFriendImgFront,
    exampleSideImg: maleFriendImgSide,
  },
  maleFriend: {
    video: maleFriendVideo,
    imgFront: maleFriendImgFront,
    imgSide: maleFriendImgSide,
  },
};

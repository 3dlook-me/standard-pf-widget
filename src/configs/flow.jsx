import hardValdiationSideF from '../images/side-female.png';
import hardValdiationSideM from '../images/side-male.png';
import hardValdiationFrontF from '../images/front-female.png';
import hardValdiationFrontM from '../images/front-male.png';

import howToTakePhotosFriendVideoM from '../video/friend-flow-example.mp4';
import howToTakePhotosFriendVideoF from '../video/friend-flow-example.mp4';
import howToTakePhotosTableVideoM from '../video/table-flow-example.mp4';
import howToTakePhotosTableVideoF from '../video/table-flow-example.mp4';

import uploadFrontExampleF from '../images/friend_front_female.png';
import uploadFrontExampleM from '../images/friend_front_male.png';
import uploadSideExampleF from '../images/friend_side_female.png';
import uploadSideExampleM from '../images/friend_side_male.png';
import uploadVideoExampleM from '../video/table-flow-requirements-male.mp4';
import uploadVideoExampleF from '../video/table-flow-requirements-female.mp4';

export const flowScreens = {
  howToTakePhotos: {
    friendFlow: {
      male: {
        video: howToTakePhotosFriendVideoM,
      },
      female: {
        video: howToTakePhotosFriendVideoF,
      },
    },
    tableFlow: {
      male: {
        video: howToTakePhotosTableVideoM,
      },
      female: {
        video: howToTakePhotosTableVideoF,
      },
    },
  },
  upload: {
    friendFlow: {
      male: {
        frontExample: uploadFrontExampleM,
        sideExample: uploadSideExampleM,
      },
      female: {
        frontExample: uploadFrontExampleF,
        sideExample: uploadSideExampleF,
      },
    },
    tableFlow: {
      male: {
        videoExample: uploadVideoExampleM,
      },
      female: {
        videoExample: uploadVideoExampleF,
      },
    },
  },
  hardValidation: {
    friendFlow: {
      male: {
        front: hardValdiationFrontM,
        side: hardValdiationSideM,
      },
      female: {
        front: hardValdiationFrontF,
        side: hardValdiationSideF,
      },
    },
    tableFlow: {
      male: {
        front: hardValdiationFrontM,
        side: hardValdiationSideM,
      },
      female: {
        front: hardValdiationFrontM,
        side: hardValdiationSideM,
      },
    },
  },
};

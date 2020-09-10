import { flow } from '../../configs/flow';

export const getVideo = (flowCamera, gender) => {
  const flowCameraKey = flowCamera ? 'Table' : 'Friend';

  return flow[`${gender}${flowCameraKey}`]
    ? flow[`${gender}${flowCameraKey}`].video
    : flow.femaleTable.video;
};

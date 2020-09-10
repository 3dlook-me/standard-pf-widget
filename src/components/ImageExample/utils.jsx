import { flow } from '../../configs/flow';

export const getImgExample = (mode, gender) => {
  const modeKey = mode === 'side' ? 'Side' : 'Front';

  return flow[`${gender}Table`][`example${modeKey}Img`];
};

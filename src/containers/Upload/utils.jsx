import { flow } from '../../configs/flow';

export const getImg = (isFrontImg, gender) => {
  const modeImg = isFrontImg ? 'Front' : 'Side';

  return flow[`${gender}Friend`]
    ? flow[`${gender}Friend`][`img${modeImg}`]
    : null;
};

export const getVideoRequirements = (gender) =>
  flow[`${gender}Table`] ? flow[`${gender}Table`].videoRequirements : null;

const colorPallet = new Array('#b2cbe4', '#e3b1ca', '#e3cab1', '#b1e3ca');

const getNextColor = (nowColor) => {
  for (let i = 0; i < colorPallet.length; i++) {
    if (nowColor == colorPallet[i]) return colorPallet[++i % colorPallet.length];
  }
  return colorPallet[0];
};
const getPrevColor = (nowColor) => {
  for (let i = 0; i < colorPallet.length; i++) {
    if (nowColor == colorPallet[i]) return colorPallet[(--i + colorPallet.length) % colorPallet.length];
  }
  return colorPallet[0];
};

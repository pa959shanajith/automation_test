import { browsers } from "./mockData";

export const getBrowser = (browser) => {
  let browsersArr = [];
  browsers.forEach((el) => {
    if (browser.includes(el?.key)) {
      browsersArr.push(el?.name);
    }
  });
  return browsersArr;
};

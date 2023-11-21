import { browsers } from "./mockData";

export const getBrowser = (browser = []) => {
  let browsersArr = [];
  browsers.forEach((el) => {
    if (Array.isArray(browser) && browser.includes(el?.key)) {
      browsersArr.push(el?.name);
    }
  });
  return browsersArr;
};

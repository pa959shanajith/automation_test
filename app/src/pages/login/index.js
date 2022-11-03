import React from 'react';
import LoginPage from './containers/LoginPage'
import BasePage from './containers/BasePage'
import ServiceBell from "@servicebell/widget";

/*Component App
  use: defines components for each url
*/

const Login = () => {
  return (
      <LoginPage/>
  );
}

const Base = () => {
  ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
  return (
      <BasePage/>
  );
}

export {Base};
export default Login;
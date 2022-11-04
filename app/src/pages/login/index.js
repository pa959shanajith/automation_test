import React from 'react';
import LoginPage from './containers/LoginPage'
import BasePage from './containers/BasePage'

/*Component App
  use: defines components for each url
*/

const Login = () => {
  return (
      <LoginPage/>
  );
}

const Base = () => {
  return (
      <BasePage/>
  );
}

export {Base};
export default Login;
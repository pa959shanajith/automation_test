import * as headerApi from '../api';
import { persistor } from '../../../reducer'

    /* 
        Method : RedirectPage(arg: useHistory instance)
        Uses: Redirects user to base page
        Props :
            useHistory instance
    */

const RedirectPage = (history) => {

    persistor.purge();
    window.localStorage.clear();
    headerApi.logoutUser()
    .then(data=>{
        history.push('/')
    })
    .catch(error => {
        console.error("Failed to logout user\nCause:", error);
    });
}

export default RedirectPage;
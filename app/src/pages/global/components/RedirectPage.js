import * as headerApi from '../api';


const RedirectPage = (history) => {

    window.localStorage.clear();
    headerApi.logoutUser()
    .then(data=>{
        console.log(data)
        history.push('/')
    })
    .catch(error => {
        console.error("Failed to logout user\nCause:", error);
    });
}

export default RedirectPage;
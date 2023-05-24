import { logoutUser } from '../api';

    /* 
        Method : RedirectPage
        Uses: Redirects user to Base Page
        Props :
            useHistory instance
            args: reason for redirecting page (Default Reason: Invalid Session)
                    Reasons allowed: 
                        1. dereg (received from Socket)
                        2. session (received from Socket)
                        3. InvalidSesson (Default)
                        4. logout (on Logout)
                        5. screenMismatch (When URL is manipulated)
                        6. userPrefHandle (On Decline/Fail to Accept Agreement)
    */

const RedirectPage = (navigate, args = { reason: "invalidSession" }) => {

    window.localStorage.clear();
    window.sessionStorage.clear();

    window.sessionStorage["logoutFlag"] = JSON.stringify(args);

    logoutUser()
    .then(data=>{
        navigate('/')
    })
    .catch(error => {
        console.error("Failed to logout user\nCause:", error);
    });
}

export default RedirectPage;
import React, { useState, useEffect } from 'react'
import { ScreenOverlay, Messages as MSG, VARIANT, setMsg } from '../../global'
import SaucelabsDeleteModal from '../components/SaucelabsDeleteModal'
import { Header, FormInput } from '../components/AllFormComp'
import { getDetails_SAUCELABS, manageSaucelabsDetails } from '../api'

import classes from '../styles/UserSaucelabConfig.module.scss'

/*Component UserSaucelabsConfig
  use: Settings middle screen for User Saucelabs Configuration. 
  props: resetMiddleScreen and setMiddleScreen
*/

const UserSaucelabsConfig = (props) => {
    const [createSaucelabs, setCreateSaucelabs] = useState(true);
    const [SaucelabsURL, setSaucelabsURL] = useState('');
    const [SaucelabsUsername, setSaucelabsUsername] = useState('');
    const [SaucelabsAPI, setSaucelabsAPI] = useState('');
    const [isValidURL, setIsValidURL] = useState(true);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidAPI, setIsValidAPI] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        getSaucelabsDetails();
    }, [props.resetMiddleScreen["SauceLabConfigure"]])

    const getSaucelabsDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_SAUCELABS()
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                setSaucelabsURL('');
                setSaucelabsUsername('');
                setSaucelabsAPI('');
                setCreateSaucelabs(true);
            }
            else{
                const url = data.SaucelabsURL;
                const username = data.SaucelabsUsername;
                const key = data.Saucelabskey;
                setSaucelabsURL(url);
                setSaucelabsUsername(username);
                setSaucelabsAPI(key);
                setCreateSaucelabs(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    const manageDetails = async (action, SaucelabsObj) =>{
        try{
            setLoading('Updating...');
            var data = await manageSaucelabsDetails(action, SaucelabsObj);
            setLoading(false);
            if(data.error){
                setMsg(data.error);
                return;
            }
            setCreateSaucelabs(false);
            setMsg(MSG.CUSTOM(`The Saucelabs configuration was successfully ${action}d!!`, VARIANT.SUCCESS));
           getSaucelabsDetails();
        }catch(e){
            setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
        }
    }

    const SubmitHandler = (event) => {
        event.preventDefault();
        let isValid = true;
        if (!validate(SaucelabsUsername, 'NAME', setIsValidUsername)) {
            isValid = false;
        }
        if (!validate(SaucelabsURL, 'URL', setIsValidURL)) {
            isValid = false;
        }
        if (!validate(SaucelabsAPI, 'API', setIsValidAPI)) {
            isValid = false;
        }
        if (!isValid) {
           setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
            return;
        }
        var action = ""; 
        if (createSaucelabs) {
            action="create";
        } else {
            action="update";
        }
        var SaucelabsObj = {
            SaucelabsURL: SaucelabsURL,
            SaucelabsUsername: SaucelabsUsername,
            SaucelabsAPI: SaucelabsAPI
        }
        manageDetails(action, SaucelabsObj);
    }

    return (
        <>
            {showDelete? <SaucelabsDeleteModal confirmDelete={()=>{setShowDelete(false); manageDetails('delete', {});}} cancelDelete={()=>{setShowDelete(false);}} />: null}
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Header heading="saucelab Configuration" />
            <form onSubmit={SubmitHandler} className={classes["Saucelab-form"]}>
                <div className={classes["action-div"]}>
                    <button data-test="main-button-test" type="submit" className={classes["action-button"]}>{createSaucelabs?'Create':'Update'}</button>
                    <button data-test="delete-test" disabled={createSaucelabs} className={classes["action-button"]} onClick={(e)=>{e.preventDefault();setShowDelete(true);}}>Delete</button>
                </div>
                <div className={classes["Saucelab-fields"]}>
                    <div className={`col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Saucelabs-URL">SauceLabs Remote URL</label>
                        <FormInput data-test="url-test" type="text" id="Saucelabs-URL" placeholder="Enter SauceLabs Remote URL" className={`${classes["Saucelabs-url"]} ${classes["all-inputs"]} ${!isValidURL ? classes["invalid"] : ""}`} value={SaucelabsURL} onChange={(event) => { setSaucelabsURL(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Saucelabs-username">SauceLabs Username</label>
                        <FormInput data-test="username-test" type="text" id="Saucelabs-username" placeholder="Enter SauceLabs Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={SaucelabsUsername} onChange={(event) => { setSaucelabsUsername(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Saucelabs-API">SauceLabs Access Key</label>
                        <FormInput data-test="api-test" type="text" id="Saucelabs-API" placeholder="Enter SauceLabs Access Key" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidAPI ? classes["invalid"] : ""}`} value={SaucelabsAPI} onChange={(event) => { setSaucelabsAPI(event.target.value) }} />
                    </div>
                </div>
            </form>
        </>
    )
}

const validate = (value, id, update) => {
    var regex;
    if (id === "URL") {
        regex = /^https:\/\//g;
        if (regex.test(value)) {
            update(true);
            return true;
        }
        update(false);
        return false;
    }
    else {
        if (value.trim().length > 0) {
            update(true);
            return true;
        }
        else {
            update(false);
            return false;
        }
    }
}



export default UserSaucelabsConfig;
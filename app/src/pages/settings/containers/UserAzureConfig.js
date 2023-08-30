import React, { useState, useEffect } from 'react'
import { ScreenOverlay, Messages as MSG, VARIANT, setMsg } from '../../global'

import AzureDeleteModal from '../components/AzureDeleteModel'
import { Header, FormInput } from '../components/AllFormComp'
import { getDetails_Azure, manageAzureDetails } from '../api'

import classes from '../styles/UserAzureConfig.module.scss'
// import { getDetails_ADO } from '../../../../../server/controllers/admin'

/*Component UserJiraConfig
  use: Settings middle screen for User Jira Configuration. 
  props: resetMiddleScreen and setMiddleScreen
*/

const UserAzureConfig = (props) => {
    const [createAzure, setCreateAzure] = useState(true);
    const [AzureURL, setAzureURL] = useState('');
    const [AzureUsername, setAzureUsername] = useState('');
    const [AzurePAT, setAzurePAT] = useState('');
    const [isValidURL, setIsValidURL] = useState(true);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidPAT, setIsValidPAT] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        getAzureDetails();
    }, [props.resetMiddleScreen["AzureConfigure"]])

    const getAzureDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_Azure();
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                setAzureURL('');
                setAzureUsername('');
                setAzurePAT('');
                setCreateAzure(true);
            }
            else{
                const url = data.AzureURL;
                const username = data.AzureUsername;
                const PAT = data.AzurePAT;
                setAzureURL(url);
                setAzureUsername(username);
                setAzurePAT(PAT);
                setCreateAzure(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    const manageDetails = async (action, AzureObj) =>{
        try{
            setLoading('Updating...');
            var data = await manageAzureDetails(action, AzureObj);
            setLoading(false);
            if(data.error){
                setMsg(data.error);
                return;
            }
            setCreateAzure(false);
            setMsg(MSG.CUSTOM(`The Azure DevOps configuration was successfully ${action}d!!`, VARIANT.SUCCESS));
           getAzureDetails();
        }catch(e){
            setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
        }
    }

    const SubmitHandler = (event) => {
        event.preventDefault();
        let isValid = true;
        if (!validate(AzureUsername, 'NAME', setIsValidUsername)) {
            isValid = false;
        }
        if (!validate(AzureURL, 'URL', setIsValidURL)) {
            isValid = false;
        }
        if (!validate(AzurePAT, 'PAT', setIsValidPAT)) {
            isValid = false;
        }
        if (!isValid) {
           setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
            return;
        }
        var action = ""; 
        if (createAzure) {
            action="create";
        } else {
            action="update";
        }
        var AzureObj = {
            AzureURL: AzureURL,
            AzureUsername: AzureUsername,
            AzurePAT: AzurePAT
        }
        manageDetails(action, AzureObj);
    }

    return (
        <>
            {showDelete? <AzureDeleteModal confirmDelete={()=>{setShowDelete(false); manageDetails('delete', {});}} cancelDelete={()=>{setShowDelete(false);}} />: null}
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Header heading="Azure DevOps Configuration" />
            <form onSubmit={SubmitHandler} className={classes["Azure-form"]}>
                <div className={classes["action-div"]}>
                    <button data-test="main-button-test" type="submit" className={classes["action-button"]}>{createAzure?'Create':'Update'}</button>
                    <button data-test="delete-test" disabled={createAzure} className={classes["action-button"]} onClick={(e)=>{e.preventDefault();setShowDelete(true);}}>Delete</button>
                </div>
                <div className={classes["Azure-fields"]}>
                    <div className={`col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Azure-URL">Azure DevOps URL</label>
                        <FormInput data-test="url-test" type="text" id="Azure-URL" placeholder="Enter Azure DevOps URL" className={`${classes["Azure-url"]} ${classes["all-inputs"]} ${!isValidURL ? classes["invalid"] : ""}`} value={AzureURL} onChange={(event) => { setAzureURL(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Azure-username">Azure DevOps Username</label>
                        <FormInput data-test="username-test" type="text" id="Azure-username" placeholder="Enter Azure DevOps Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={AzureUsername} onChange={(event) => { setAzureUsername(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Azure-Password">Azure DevOps PAT </label>
                        <FormInput data-test="api-test" type="password" id="Azure-Password" placeholder="Enter Azure DevOps PAT " className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidPAT ? classes["invalid"] : ""}`} value={AzurePAT} onChange={(event) => { setAzurePAT(event.target.value) }} />
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



export default UserAzureConfig;
import React, { useState, useEffect } from 'react'
import { ScreenOverlay, Messages as MSG, VARIANT, setMsg } from '../../global'
import JiraDeleteModal from '../components/JiraDeleteModal'
import { Header, FormInput } from '../components/AllFormComp'
import { getDetails_JIRA, manageJiraDetails } from '../api'

import classes from '../styles/UserJiraConfig.module.scss'

/*Component UserJiraConfig
  use: Settings middle screen for User Jira Configuration. 
  props: resetMiddleScreen and setMiddleScreen
*/

const UserJiraConfig = (props) => {
    const [createJira, setCreateJira] = useState(true);
    const [jiraURL, setJiraURL] = useState('');
    const [jiraUsername, setJiraUsername] = useState('');
    const [jiraAPI, setJiraAPI] = useState('');
    const [isValidURL, setIsValidURL] = useState(true);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidAPI, setIsValidAPI] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    useEffect(() => {
        getJiraDetails();
    }, [props.resetMiddleScreen["jiraConfigure"]])

    const getJiraDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_JIRA()
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                setJiraURL('');
                setJiraUsername('');
                setJiraAPI('');
                setCreateJira(true);
            }
            else{
                const url = data.jiraURL;
                const username = data.jiraUsername;
                const key = data.jirakey;
                setJiraURL(url);
                setJiraUsername(username);
                setJiraAPI(key);
                setCreateJira(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    const manageDetails = async (action, jiraObj) =>{
        try{
            setLoading('Updating...');
            var data = await manageJiraDetails(action, jiraObj);
            setLoading(false);
            if(data.error){
                setMsg(data.error);
                return;
            }
            setCreateJira(false);
            setMsg(MSG.CUSTOM(`The JIRA configuration was successfully ${action}d!!`, VARIANT.SUCCESS));
           getJiraDetails();
        }catch(e){
            setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
        }
    }

    const SubmitHandler = (event) => {
        event.preventDefault();
        let isValid = true;
        if (!validate(jiraUsername, 'NAME', setIsValidUsername)) {
            isValid = false;
        }
        if (!validate(jiraURL, 'URL', setIsValidURL)) {
            isValid = false;
        }
        if (!validate(jiraAPI, 'API', setIsValidAPI)) {
            isValid = false;
        }
        if (!isValid) {
           setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
            return;
        }
        var action = ""; 
        if (createJira) {
            action="create";
        } else {
            action="update";
        }
        var jiraObj = {
            jiraURL: jiraURL,
            jiraUsername: jiraUsername,
            jiraAPI: jiraAPI
        }
        manageDetails(action, jiraObj);
    }

    return (
        <>
            {showDelete? <JiraDeleteModal confirmDelete={()=>{setShowDelete(false); manageDetails('delete', {});}} cancelDelete={()=>{setShowDelete(false);}} />: null}
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Header heading="Jira Configuration" />
            <form onSubmit={SubmitHandler} className={classes["jira-form"]}>
                <div className={classes["action-div"]}>
                    <button data-test="main-button-test" type="submit" className={classes["action-button"]}>{createJira?'Create':'Update'}</button>
                    <button data-test="delete-test" disabled={createJira} className={classes["action-button"]} onClick={(e)=>{e.preventDefault();setShowDelete(true);}}>Delete</button>
                </div>
                <div className={classes["jira-fields"]}>
                    <div className={`col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Jira-URL">Jira URL</label>
                        <FormInput data-test="url-test" type="text" id="Jira-URL" placeholder="Enter Jira URL" className={`${classes["jira-url"]} ${classes["all-inputs"]} ${!isValidURL ? classes["invalid"] : ""}`} value={jiraURL} onChange={(event) => { setJiraURL(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Jira-username">Jira Username</label>
                        <FormInput data-test="username-test" type="text" id="Jira-username" placeholder="Enter Jira Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={jiraUsername} onChange={(event) => { setJiraUsername(event.target.value) }} />
                    </div>
                    <div className={` col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Jira-API">Jira API Key</label>
                        <FormInput data-test="api-test" type="text" id="Jira-API" placeholder="Enter Jira API Key" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidAPI ? classes["invalid"] : ""}`} value={jiraAPI} onChange={(event) => { setJiraAPI(event.target.value) }} />
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



export default UserJiraConfig;
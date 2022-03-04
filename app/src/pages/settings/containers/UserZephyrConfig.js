import React, { useState, useEffect } from 'react';
import { ScreenOverlay, Messages as MSG, VARIANT, setMsg } from '../../global';
import ZephyrDeleteModal from '../components/ZephyrDeleteModal';
import { Header, FormInput } from '../components/AllFormComp';
import { getDetails_ZEPHYR, manageZephyrDetails } from '../api';

// import classes from '../styles/UserZephyrConfig.module.scss';
import classes from '../styles/UserJiraConfig.module.scss'

/*Component UserZephyrConfig
  use: Settings middle screen for User Zephyr Configuration. 
  props: resetMiddleScreen and setMiddleScreen
*/

const UserZephyrConfig = (props) => {
    const [createZephyr, setCreateZephyr] = useState(true);
    const [zephyrURL, setZephyrURL] = useState('');
    const [zephyrUsername, setZephyrUsername] = useState('');
    const [zephyrPassword, setZephyrPassword] = useState('');
    const [zephyrToken, setZephyrToken] = useState('');
    const [isValidURL, setIsValidURL] = useState(true);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidToken, setIsValidToken] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [authType, setAuthType] = useState('basic');

    useEffect(() => {
        getZephyrDetails();
    }, [props.resetMiddleScreen["zephyrConfigure"]])

    const getZephyrDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_ZEPHYR()
            setLoading(false);
            if (data.error) { setMsg(data.error); return; }
            if(data==="empty"){
                setZephyrURL('');
                setZephyrUsername('');
                setZephyrPassword('');
                setZephyrToken('');
                setCreateZephyr(true);
            }
            else{
                const url = (data.zephyrURL) ? data.zephyrURL : '';
                const username = (data.zephyrUsername) ? data.zephyrUsername : '';
                const password = (data.zephyrPassword) ? data.zephyrPassword : '';
                const token = (data.zephyrToken) ? data.zephyrToken : '';
                setZephyrURL(url);
                setZephyrUsername(username);
                setZephyrPassword(password);
                setZephyrToken(token);
                setCreateZephyr(false);
            }
        } catch (error) {
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    const manageDetails = async (action, zephyrObj) =>{
        try{
            setLoading('Updating...');
            var data = await manageZephyrDetails(action, zephyrObj);
            setLoading(false);
            if(data.error){
                setMsg(data.error);
                return;
            }
            setCreateZephyr(false);
            setMsg(MSG.CUSTOM(`The Zephyr configuration is successfully ${action}d!!`, VARIANT.SUCCESS));
           getZephyrDetails();
        }catch(e){
            setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
        }
    }

    const SubmitHandler = (event) => {
        event.preventDefault();
        let isValid = true;
        if (!validate(zephyrURL, 'URL', setIsValidURL)) {
            isValid = false;
        }
        if (authType==="basic" && !validate(zephyrUsername, 'USERNAME', setIsValidUsername)) {
            isValid = false;
        }
        if (authType==="basic" && !validate(zephyrPassword, 'PASSWORD', setIsValidPassword)) {
            isValid = false;
        }
        if (authType !="basic" && !validate(zephyrToken, 'TOKEN', setIsValidToken)) {
            isValid = false;
        }
        if (!isValid) {
           setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
            return;
        }
        let action = ""; 
        if (createZephyr) {
            action="create";
        } else {
            action="update";
        }
        let zephyrObj = {
            zephyrUrl: zephyrURL
        }
        if(zephyrUsername && zephyrPassword){
            zephyrObj['zephyrUsername'] = zephyrUsername;
            zephyrObj['zephyrPassword'] = zephyrPassword;
        } 
        if(zephyrToken) {
            zephyrObj['zephyrToken'] = zephyrToken;
        }
        manageDetails(action, zephyrObj);
    }

    return (
        <>
            {showDelete? <ZephyrDeleteModal confirmDelete={()=>{setShowDelete(false); manageDetails('delete', {});}} cancelDelete={()=>{setShowDelete(false);}} />: null}
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Header heading="Zephyr Configuration" />
            <form onSubmit={SubmitHandler} className={classes["jira-form"]}>
                <div className={classes["action-div"]}>
                    <button data-test="main-button-test" type="submit" className={classes["action-button"]}>{createZephyr?'Create':'Update'}</button>
                    <button data-test="delete-test" disabled={createZephyr} className={classes["action-button"]} onClick={(e)=>{e.preventDefault();setShowDelete(true);}}>Delete</button>
                </div>
                <div className={classes["jira-fields"]}>
                    <div className={`col-xs-9 ${classes["form-group"]}`}>
                        <label>Authentication Type</label>
                        <div>
                            <label className="authTypeRadio ilm__leftauth">
                                <input type="radio" value="basic" checked={authType==="basic"} onChange={()=>{setAuthType("basic")}}/>
                                <span>Basic</span>
                            </label>
                            <label className="authTypeRadio">
                                <input type="radio" value="token" checked={authType==="token"} onChange={()=>{setAuthType("token")}}/>
                                <span>Token</span>
                            </label>
                        </div>
                    </div>
                    <div className={`col-xs-9 ${classes["form-group"]}`}>
                        <label htmlFor="Zephyr-URL">Zephyr URL</label>
                        <FormInput data-test="url-test" type="text" id="Zephyr-URL" placeholder="Enter Zephyr URL" className={`${classes["all-inputs"]} ${!isValidURL ? classes["invalid"] : ""}`} value={zephyrURL} onChange={(event) => { setZephyrURL(event.target.value) }} />
                    </div>
                    {
                        authType==="basic" ? <>
                            <div className={` col-xs-9 ${classes["form-group"]}`}>
                                <label htmlFor="Zephyr-username">Zephyr Username</label>
                                <FormInput data-test="username-test" type="text" id="Zephyr-username" placeholder="Enter Zephyr Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={zephyrUsername} onChange={(event) => { setZephyrUsername(event.target.value) }} />
                            </div>
                            <div className={` col-xs-9 ${classes["form-group"]}`}>
                                <label htmlFor="Zephyr-Password">Zephyr Password</label>
                                <FormInput data-test="api-test" type="password" id="Zephyr-Password" placeholder="Enter Zephyr Password" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidPassword ? classes["invalid"] : ""}`} value={zephyrPassword} onChange={(event) => { setZephyrPassword(event.target.value) }} />
                            </div>
                        </> : <div className={` col-xs-9 ${classes["form-group"]}`}>
                            <label htmlFor="Zephyr-Token">Zephyr Token</label>
                            <FormInput data-test="api-test" type="text" id="Zephyr-Token" placeholder="Enter Zephyr Token" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidToken ? classes["invalid"] : ""}`} value={zephyrToken} onChange={(event) => { setZephyrToken(event.target.value) }} />
                        </div>
                    }
                </div>
            </form>
        </>
    )
}

const validate = (value, id, update) => {
    var regex;
    if (id === "URL") {
        regex = /^https?:\/\//g;
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



export default UserZephyrConfig;
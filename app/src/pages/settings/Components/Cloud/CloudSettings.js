import React, { useCallback, useEffect, useState, useRef } from "react";
import "../../styles/manageIntegrations.scss";
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { getDetails_SAUCELABS, manageSaucelabsDetails, getDetails_BROWSERSTACK,manageBrowserstackDetails } from '../../api'
import classes from "../../styles/CloudSettings.scss"
import SaucelabsDeleteModal from "./SaucelabsDeleteModal";
import BrowserstackDeleteModal from "../BrowserstackDeleteModal";
import {Messages as MSG, setMsg} from '../../../global';
import ScreenOverlay from '../../../global/components/ScreenOverlay';
import { Toast } from "primereact/toast";
import { saveSauceLabData, saveBrowserstackData } from '../../../execute/api';
import { useDispatch, useSelector } from 'react-redux';
import { screenType, saucelabsInitialState,browserstackInitialState} from '../../settingSlice';








const CloudSettings = () => {

    const [createSaucelabs, setCreateSaucelabs] = useState(true);
    const [createBrowserstack, setCreateBrowserstack] = useState(true);
    const [SaucelabsURL, setSaucelabsURL] = useState('');
    const [BrowserstackAPI, setBrowserstackAPI] = useState('');
    const [BrowserstackUsername, setBrowserstackUsername] = useState('');
    const [SaucelabsUsername, setSaucelabsUsername] = useState('');
    const [SaucelabsAPI, setSaucelabsAPI] = useState('');
    const toast = useRef(null);
    const [isValidURL, setIsValidURL] = useState(true);
    const [isValidUsername, setIsValidUsername] = useState(true);
    const [isValidAPI, setIsValidAPI] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showBrowserstackDelete, setShowBrowserstackDelete] = useState(false)
    const [uploadapk, setUploadapk ] = useState('');
    const [apkname, setapkname] = useState('');
    const [uploadapkValues, setUploadapkfile] = useState({});
    const [uploadapkBS, setUploadapkBS ] = useState('');
    const [apkNameBS, setapkNameBS] = useState('');
    const [uploadapkValuesBS, setUploadapkfileBS] = useState({});

    useEffect(() => {
        getSaucelabsDetails();
        getBrowserstackDetails();
    }, []); 
    
    const dispatchAction = useDispatch();
    const selectedscreen = useSelector(state => state.setting.screenType);
    const saucelablogin = useSelector(state=>state.setting.saucelabsInitialState);
    const browserstack = useSelector(state=>state.setting.browserstackInitialState);
    


    const getSaucelabsDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_SAUCELABS()
            setLoading(false);
            if (data.error) {return; }
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
            ;
        }
    }

    const getBrowserstackDetails = async () =>{
        try {
            setLoading("Loading...")
            const data = await getDetails_BROWSERSTACK()
            setLoading(false);
            if (data.error) {return; }
            if(data==="empty"){
                setBrowserstackUsername('');
                setBrowserstackAPI('');
                setCreateBrowserstack(true);
            }
            else{
                const username = data.BrowserstackUsername;
                const key = data.Browserstackkey;
                setBrowserstackUsername(username);
                setBrowserstackAPI(key);
                setCreateBrowserstack(false);
            }
        } catch (error) {
            ;
        }
    }

    const handleLogin = (name, value) => {
        switch (selectedscreen.name) {
            case 'saucelab':
                dispatchAction(saucelabsInitialState({ fieldName: name, value }));
                break;
            case 'browserstack':
                dispatchAction(browserstackInitialState({ fieldName: name, value }));
                break;
            // case 'Azure DevOps':
            //     dispatchAction(AzureLogin({ fieldName: name, value }));
            //     break;
            // case 'ALM':
            //     break;
            // case 'qTest':
            //     break;
            default:
                break;
        }

    }

    const handleScreenType = (value) => {
        dispatchAction(screenType(value))
    }

    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }
    
      const toastSuccess = (successMessage) => {
        if (successMessage && successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
      }

    const saucelabapkuploadhandler = event => {
        let value = event.target.value.trim();
        const uploadapk = value.toString().replaceAll('"', "");
        setUploadapk(uploadapk)
    }

    const browserStackapkuploadhandler = event => {
        let value = event.target.value.trim();
        const uploadapkBS = value.toString().replaceAll('"', "");
        setUploadapkBS(uploadapkBS)
    }

    const apknamehandler = (event) => {
        setapkname(event.target.value);
        setUploadapkfile(event.target.value);
    }   
    
    const apknamehandlerBS = (event) => {
        setapkNameBS(event.target.value);
        setUploadapkfileBS(event.target.value);
    }
    const isUploadButtonVisible = apkname && uploadapk;

    const isUploadButtonVisibleBS = apkNameBS && uploadapkBS;

    const handleUpload = async (event) => {
        event.preventDefault();
        try {
                setLoading("Uploading...")
                const data = await saveSauceLabData( 
                    {                    
                        "SauceLabPayload" : {
                            "uploadApkValues":{
                                "apkName": apkname,
                                "apkPath":uploadapk,
                            },
                            "SaucelabsURL":SaucelabsURL,
                            "Saucelabskey":SaucelabsAPI,
                            "SaucelabsUsername":SaucelabsUsername,
                            "query":"sauceMobileUploadDetails"
                }})
                setLoading(false)
                console.log(data)
                if (data == "name"){
                    toastSuccess(MSG.SETTINGS.ERR_UPLOAD_APK)
                }
                else {
                    toastError(MSG.SETTINGS.SUCC_UPLOAD_APK) 
                }
            }
        catch {
            console.log('some error occured')
        }
    };

    const handleUpload_BS = async (event) => {
            event.preventDefault();
            try {
                    setLoading("Uploading...")
                    const data = await saveBrowserstackData( 
                        {                    
                            "BrowserstackPayload" : {
                                "uploadApkValuesBS":{
                                    "apkName": apkNameBS,
                                    "apkPath":uploadapkBS,
                                },
                                "BrowserstackUsername": BrowserstackUsername,
                                "Browserstackkey": BrowserstackAPI,
                                "action":"BrowserStackMobileUploadDetails"
                    }})
                    setLoading(false)
                    if (data === 'Apk Uploaded Successfully'){
                        toastSuccess(MSG.SETTINGS.SUCC_UPLOAD_APK)
                    }
                    else {
                        toastError(MSG.SETTINGS.ERR_UPLOAD_APK) 
                    }
                }
            catch {
                console.log('some error occured')
            }
        };

    const manageDetails = async (action, SaucelabsObj) =>{
         try{
            setLoading('Updating...');
            var data = await manageSaucelabsDetails(action, SaucelabsObj);
            setLoading(false);
            if(data.error){
                toast.current.show({
                  severity: 'error',
                  summary: 'Error',
                  detail: data.error,
                  life: 5000
                });
                return;
            }
            setCreateSaucelabs(false);
                toast.current.show({
                  severity: 'success',
                  summary: 'Success',
                  detail: `The Saucelabs configuration was successfully ${action}d!!`,
                  life: 5000
                });
           getSaucelabsDetails();
        }catch(e){
            setMsg(MSG.SETTINGS.ERR_ENTER_VALID_CRED);
        }
    }

    const manageDetailsBrowserstack = async (action, BrowserstackObj) =>{
        try{
           setLoading('Updating...');
           var data = await manageBrowserstackDetails(action, BrowserstackObj);
           setLoading(false);
           if(data.error){
               toast.current.show({
                 severity: 'error',
                 summary: 'Error',
                 detail: data.error,
                 life: 5000
               });
               return;
           }
           setCreateBrowserstack(false);
               toast.current.show({
                 severity: 'success',
                 summary: 'Success',
                 detail: `The Browsersatck configuration was successfully ${action}d!!`,
                 life: 5000
               });
               getBrowserstackDetails();
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
        if (!isValid){
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail:"Enter Valid Credentials",
              life: 5000
            });
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

    const SubmitHandlerBrowserstack = (event) => {
        event.preventDefault();
        let isValid = true;
        if (!validate(BrowserstackUsername, 'NAME', setIsValidUsername)) {
            isValid = true;
        }
        if (!validate(BrowserstackAPI, 'URL', setIsValidAPI)) {
            isValid = true;
        }
        if (!isValid){
            toast.current.show({
              severity: 'error',
              summary: 'Error',
              detail:"Enter Valid Credentials",
              life: 5000
            });
            return;
        }
        var action = ""; 
        if (createBrowserstack) {
            action="create";
        } else {
            action="update";
        }
        var BrowserstackObj = {
            BrowserstackUsername: BrowserstackUsername,
            BrowserstackAPI: BrowserstackAPI
        }
        manageDetailsBrowserstack(action, BrowserstackObj);
    }
  

    return (
        
        <>
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        {showDelete? <SaucelabsDeleteModal show={showDelete} confirmDelete={()=>{setShowDelete(false); manageDetails('delete', {});}} cancelDelete={()=>{setShowDelete(false);}} />: null}
        {showBrowserstackDelete? <BrowserstackDeleteModal show={showBrowserstackDelete} confirmDelete={()=>{setShowBrowserstackDelete(false); manageDetailsBrowserstack('delete', {});}} cancelDelete={()=>{setShowBrowserstackDelete(false);}} />: null}
        {loading ? <ScreenOverlay content={loading} /> : null}
        <div className="login_container_integrations">
                <div className="side-panel">
                    <div className={`icon-wrapper ${selectedscreen?.name === 'saucelab' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'saucelab', code: 'sl' })} >
                        <span><img src="static/imgs/Saucelabs-1.png" className="img__azure"></img></span>
                        <span className="text__saucelabs">SauceLabs</span>
                    </div>
                    <div className={`icon-wrapper ${selectedscreen?.name === 'browserstack' ? 'selected' : ''}`} onClick={() => handleScreenType({ name: 'browserstack', code: 'st' })}>
                        <span><img src="static/imgs/browserstack_icon 48x48.svg" className="img__alm"></img></span>
                        <span className="text__browserstack">BrowserStack</span>
                    </div>
                </div>
        </div>
         

                
            
            <Card className="card__login__cloud">
            {selectedscreen.name==="saucelab" ?( 
            <div>
                <div className="input-cls1">
                    <span>SauceLab Remote URL <span style={{ color: 'red' }}>*</span></span>
                    <span style={{ marginLeft: '1.5rem' }}>
                    <InputText  style={{ width: '25rem', height: '2.5rem' }} data-test="url-test" type="text" id="Saucelabs-URL" placeholder="Enter SauceLabs Remote URL" className={`${classes["Saucelabs-url"]} ${classes["all-inputs"]} ${!isValidURL ? classes["invalid"] : ""}`} value={SaucelabsURL} onChange={(event) => { setSaucelabsURL(event.target.value) }}  />
                        {/* <label htmlFor="username">Username</label> */}
                    </span>
                </div>
                <div className="input-cls1">
                    <span>SauceLabs Username <span style={{ color: 'red' }}>*</span></span>
                    <span style={{ marginLeft: '1.5rem' }}>
                    <InputText  style={{ width: '25rem', height: '2.5rem', marginLeft:'0.8rem' }} data-test="username-test" type="text" id="Saucelabs-username" placeholder="Enter SauceLabs Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={SaucelabsUsername} onChange={(event) => { setSaucelabsUsername(event.target.value) }} />
                        {/* <label htmlFor="username">Username</label> */}
                    </span>
                </div>
                <div className="input-cls1">
                    <span>SauceLabs Access Key <span style={{ color: 'red' }}>*</span></span>
                    <span style={{ marginLeft: '1.5rem' }}>
                    <InputText  style={{ width: '25rem', height: '2.5rem',marginLeft:'0.4rem' }} data-test="api-test" type="text" id="Saucelabs-API" placeholder="Enter SauceLabs Access Key" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidAPI ? classes["invalid"] : ""}`} value={SaucelabsAPI} onChange={(event) => { setSaucelabsAPI(event.target.value) }}  />
                        {/* <label htmlFor="username">Username</label> */}
                    </span>
                </div>
                <div className="login__div" style={{ marginBottom: '15px' }}>
                    <Button  onClick={(event) => {SubmitHandler(event);event.preventDefault(event);}} className="saucelabs-action">
                    {/* <Button  onClick={(e)=>SubmitHandler(e)} className="saucelabs-action"> */}
                    {createSaucelabs?'Create':'Update'}
                    </Button>
                    <Button data-test="delete-test"  className="saucelabs-delete" onClick={(e)=>{e.preventDefault();setShowDelete(true);}}>Delete</Button>
                </div>
            </div>):""}
            {selectedscreen.name==="saucelab" && (
            <div>
                <div>
                    <hr /> {/* Add this line to create a horizontal line */}
                    <span style={{ fontWeight: 'bold' }}> Native Mobile Test App Resources </span>
                </div>
                <Toast ref={toast} position="bottom-center" />
                <div className="apk__name">
                    <span> Enter APK details <span style={{ color: 'red' }}></span></span>
                    <span style={{ marginLeft: '1.5rem' }}></span>
                        <InputText style={{ width: '20rem', height: '2.5rem' }} type="text" id="Additional-Input" placeholder="Enter apk name" className={`${classes["first_name"]} ${classes["all-inputs"]}`} value={apkname} onChange={apknamehandler} />
                    <div className="apk__path">
                        <InputText style={{ width: '20rem', height: '2.5rem' }} type="text" id="Saucelabs-APK" placeholder="Enter apk Path" className={`${classes["first_name"]} ${classes["all-inputs"]}`} value={uploadapk} onChange={saucelabapkuploadhandler} disabled={!apkname} />&#160;
                        {isUploadButtonVisible && <Button data-test="upload-btn"  className="action-button" onClick={(event)=>handleUpload(event)}>Upload</Button>}
                    </div>    
                </div>
            </div>
            )} 

                {selectedscreen.name === "browserstack" ? (
                    <div>
                        <div className="input-cls1">
                            <span>Browserstack Username <span style={{ color: 'red' }}>*</span></span>
                            <span style={{ marginLeft: '1.5rem' }}>
                            <InputText  style={{ width: '25rem', height: '2.5rem', marginLeft:'0.8rem' }} data-test="username-test" type="text" id="Saucelabs-username" placeholder="Enter Browserstack Username" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidUsername ? classes["invalid"] : ""}`} value={BrowserstackUsername} onChange={(event) => { setBrowserstackUsername(event.target.value) }} />
                                {/* <label htmlFor="username">Username</label> */}
                            </span>
                        </div>
                        <div className="input-cls1">
                            <span>Browsersatck Access Key<span style={{ color: 'red' }}>*</span></span>
                            <span style={{ marginLeft: '1.5rem' }}>
                            <InputText  style={{ width: '25rem', height: '2.5rem',marginLeft:'0.4rem' }} data-test="api-test" type="text" id="Saucelabs-API" placeholder="Enter Browserstack Access Key" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidAPI ? classes["invalid"] : ""}`} value={BrowserstackAPI} onChange={(event) => { setBrowserstackAPI(event.target.value) }}  />
                                {/* <label htmlFor="username">Username</label> */}
                            </span>
                        </div>
                        <div className="input-cls1">
                            {/* <span>SauceLabs Access Key <span style={{ color: 'red' }}>*</span></span> */}
                            <span style={{ marginLeft: '1.5rem' }}>
                                {/* <InputText style={{ width: '25rem', height: '2.5rem', marginLeft: '0.4rem' }} data-test="api-test" type="text" id="Saucelabs-API" placeholder="Enter SauceLabs Access Key" className={`${classes["first_name"]} ${classes["all-inputs"]} ${!isValidAPI ? classes["invalid"] : ""}`} value={SaucelabsAPI} onChange={(e) => handleLogin('api', e.target.value)} /> */}
                                {/* <label htmlFor="username">Username</label> */}
                            </span>
                        </div>
                        <div className="login__div" style={{ marginBottom: '15px' }}>
                            <Button onClick={(event) => { SubmitHandlerBrowserstack(event); event.preventDefault(event); }} className="saucelabs-action">
                                {/* <Button  onClick={(e)=>SubmitHandler(e)} className="saucelabs-action"> */}
                                {createBrowserstack ? 'Create' : 'Update'}
                            </Button>
                            <Button data-test="delete-test" className="saucelabs-delete" onClick={(e) => { e.preventDefault(); setShowBrowserstackDelete(true); }}>Delete</Button>
                        </div>
                    </div>) : ""}
                    {selectedscreen.name==="browserstack" && (
                <div>
                    <div>
                        <hr /> {/* Add this line to create a horizontal line */}
                        <span style={{ fontWeight: 'bold' }}> Native Mobile Test App Resources </span>
                    </div>
                    <Toast ref={toast} position="bottom-center" />
                    <div className="apk__name">
                        <span> Enter APK details <span style={{ color: 'red' }}></span></span>
                        <span style={{ marginLeft: '1.5rem' }}></span>
                            <InputText style={{ width: '20rem', height: '2.5rem' }} type="text" id="Additional-Input" placeholder="Enter apk name" className={`${classes["first_name"]} ${classes["all-inputs"]}`} value={apkNameBS} onChange={apknamehandlerBS} />
                        <div className="apk__path">
                            <InputText style={{ width: '20rem', height: '2.5rem' }} type="text" id="BrowseStack-APK" placeholder="Enter apk Path" className={`${classes["first_name"]} ${classes["all-inputs"]}`} value={uploadapkBS} onChange={browserStackapkuploadhandler} disabled={!apkNameBS} />&#160;
                            {isUploadButtonVisibleBS && <Button data-test="upload-btn"  className="action-button" onClick={(event)=>handleUpload_BS(event)}>Upload</Button>}
                        </div>    
                    </div>
                </div>
                )}

            </Card>
          
       
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

export default React.memo(CloudSettings);

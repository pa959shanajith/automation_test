import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import DropDownList from '../../global/components/DropDownList';
import {getDetails_SAUCELABS} from '../api';
import { Messages as MSG, setMsg} from '../../global';
import { InputSwitch } from 'primereact/inputswitch';
import AvoModal from '../../../globalComponents/AvoModal';
import { Dropdown } from 'primereact/dropdown';
import { log } from 'async';



const SauceLabLogin = React.memo(({ setLoading, displayBasic4, onHidedia, handleSubmit1,setSauceLabUser }) => {

    const [defaultValues, setDefaultValues] = useState({});
    const [isEmpty, setIsEmpty] = useState(false);



    const getSaucelabsDetails = async () => {
        try {
            const data = await getDetails_SAUCELABS()
            if (data.error) { setMsg(data.error); return; }
            if (data !== "empty") {
                setIsEmpty(true);
                setDefaultValues(data);
                setSauceLabUser(data);
            } else {
                setIsEmpty(false);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setMsg(MSG.GLOBAL.ERR_SOMETHING_WRONG);
        }
    }

    useEffect(() => {
        getSaucelabsDetails();
    }, [])

    // return (
    //     <>
    //         <AvoModal className='Saucelabs_dialog' header='Saucelabs login' visible={displayBasic4}  onModalBtnClick={()=>onHidedia('displayBasic4')}
    //         content={
    //             <>
    //             <form id='Saucelabs-form'>
    //                 <div className='Saucelabs_input'>
    //                     <div className="flex flex-row">
    //                         <InputText value={defaultValues.SaucelabsURL} type="text" id="Saucelabs-URL"
    //                             name="Saucelabs-URL"
    //                             placeholder="Enter Saucelabs Remote URL"
    //                             onChange={(event) => {
    //                                 setDefaultValues({ ...defaultValues, SaucelabsURL: event.target.value });
    //                                 setSauceLabUser({ ...defaultValues, SaucelabsURL: event.target.value });
    //                             }}
    //                             className="saucelabs_input" />
    //                     </div>
    //                     <div className="flex flex-row">
    //                         <InputText value={defaultValues.SaucelabsUsername} type="text" id="Saucelabs-username" name="aucelabs-username" placeholder="Enter Saucelabs username"
    //                             onChange={(event) => {
    //                                 setDefaultValues({ ...defaultValues, SaucelabsUsername: event.target.value });
    //                                 setSauceLabUser({ ...defaultValues, SaucelabsUsername: event.target.value });
    //                             }}
    //                             className="saucelabs_input_URL" />
    //                     </div>
    //                     <div className="flex flex-row">
    //                         <InputText value={defaultValues.Saucelabskey} type="text" id="Saucelabs-API" name="Saucelabs-API" placeholder="Enter Saucelabs Access key"
    //                             onChange={(event) => {
    //                                 setDefaultValues({ ...defaultValues, Saucelabskey: event.target.value });
    //                                 setSauceLabUser({ ...defaultValues, Saucelabskey: event.target.value });
    //                             }}
    //                             className="saucelabs_input_Accesskey" />
    //                     </div>
    //                     <div>
    //                         {isEmpty && defaultValues.SaucelabsURL && defaultValues.SaucelabsUsername && defaultValues.Saucelabskey ? "" : <div data-test="intg_log_error_span" className="saucelabs_ilm__error_msg">Save Credentials in Settings for Auto Login </div>}
    //                     </div>
                        
    //                 </div>
    //             </form>
    //                 <Button id='Saucelabs_submit' label="Submit"
    //                 onClick={() => handleSubmit1(defaultValues)}
                    
    //             />
                
    //             </>
                
    //         }headerTxt='Saucelabs login' modalSytle={{
    //             width: "39vw",
    //             height: "44vh",
    //             background: "#FFFFFF",
    //             minWidth: "38rem",
    //           }}/>
            
            
    //     </>
    // )
});

const SauceLabsExecute = React.memo(({ mobileDetails, selectProjects, browserDetails, displayBasic4, onHidedia, showSauceLabs,
    changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder, selectedProject,
    availableICE, smartMode, selectedICE, setSelectedICE, sauceLab, dataExecution, sauceLabUser, browserlist, CheckStatusAndExecute, iceNameIdMap, currentSelectedItem  }) => {
    
    const [newOsNames, setNewOsNames] = useState([])
    const [selectedOS, setSelectedOS] = useState('');
    const [browserVersions, setBrowserVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState('');
    const [saucelabBrowsers, setSaucelabBrowsers] = useState([]);
    const [selectedSaucelabBrowser, setSelectedSaucelabBrowser] = useState('');
    const [platforms, setPlatforms] = useState([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState('');
    const [selectedMobileVersion, setSelectedMobileVersion] = useState('');
    const [selectedEmulator, setSelectedEmulator] = useState('');
    const [emulator, setEmulator] = useState([]);
    const [platformVersions, setPlatformVersions] = useState([]);
    const [showRealdevice, setShowRealdevice] = useState('emulator');
    const [selectApk, setSelectApk] = useState('');
    const [appPackageName,setAppPackageName] = useState('');
    const [appActivityName, setAppActivityName] = useState('');


    useEffect(() => {
        setSelectedPlatforms('')
        setSelectedMobileVersion('')
        setSelectedEmulator('')
        setShowRealdevice('emulator')
        setPlatforms([])
        setPlatformVersions([])
        setEmulator([])
        setSelectApk([])
        setAppActivityName([])
        if (Object.keys(browserDetails).length) {
            setNewOsNames(browserDetails.os_names.map((element, index) => {
                return { key: element, text: element, title: element, index: index };
            }))
            setSaucelabBrowsers(Object.keys(browserDetails.browser).map((element, index) => {
                return { key: element, text: element, title: element, index: index };
            }));
        }
        if (mobileDetails && Object.keys(mobileDetails).length && Object.keys(mobileDetails[showRealdevice]).length) {
            setPlatforms(Object.keys(mobileDetails[showRealdevice]).map((element, index) => {
                return {
                    key: element,
                    text: element,
                    title: element,
                    index: index
                }
            }));
        }
    }, [browserDetails, mobileDetails])

    const onOsChange = async (option) => {
        setSelectedOS(option.key)
        setSaucelabBrowsers([]);
        setSelectedSaucelabBrowser('');
        setBrowserVersions([]);
        setSelectedVersion('');
          let arrayBrowser = []
          let index = 0;
          for (let browser in browserDetails.browser) {
            if(option.key.split(' ')[0] == 'Windows' && browserDetails.browser[browser][option.key]?.length){
                arrayBrowser.push({
                    key: browser,
                    text: browser,
                    title: browser,
                    index: index
                  });
                index++;
            } else if(option.key.split(' ')[0] == 'Mac' && browser == 'Google Chrome') {
                arrayBrowser.push({
                    key: browser,
                    text: browser,
                    title: browser,
                    index: index
                  });
                  index++;
            }else if(option.key.split(' ')[0] == 'Linux' && browserDetails.browser[browser][option.key]?.length){
              arrayBrowser.push({
                    key: browser,
                    text: browser,
                    title: browser,
                    index: index
                  });
                  index++;
            }
          }
          setSaucelabBrowsers(arrayBrowser);
    }

    const onSaucelabBrowserChange = async (option) => {
        setBrowserVersions([]);
        setSelectedVersion('');
        setSelectedSaucelabBrowser(option.key);
        if (browserDetails && Object.keys(browserDetails).length) {
            let findBrowserVersion = browserDetails.browser[option.key][selectedOS].map((element, index) => {
                return (
                    {
                        key: element,
                        text: element,
                        title: element,
                        index: index
                    }
                )
            });
            setBrowserVersions(findBrowserVersion.sort((a, b) => {
                return Number(a.key) - Number(b.key);
            }));
        }
    }
    const onVersionChange = async (option) => {
        setSelectedVersion(option.key)
    }
    const onApkChange = async (option) => {
        setSelectApk(option.value);
        setAppPackageName(option.value.text);
    }

    const onMobilePlatformChange = async (option) => {
        setSelectedPlatforms(option.key)
        setSelectedMobileVersion('')
        setSelectedEmulator('')
        setEmulator([])
        let findMobileVersions = Object.keys(mobileDetails[showRealdevice][option.key]).map((element, index) => {
            let each_version = option.key + " " + element
            return (
                {
                    key: each_version, 
                }
            )
        });
        setPlatformVersions(findMobileVersions.sort((a, b) => {
            return Number(a.key.split(' ')[1]) - Number(b.key.split(' ')[1])
        }));
    }

    const onMobileVersionChange = (option) => {
        setSelectedMobileVersion(option.key);
        setSelectedEmulator('')
        setEmulator([])
        let findEmulator = mobileDetails[showRealdevice][selectedPlatforms][option.key.split(" ")[1]].map((element, index) => ({
            key: element,
            text: element,
            title: element,
            index: index
        }))
        setEmulator(findEmulator);
    }
    const onEmulatorChange = async (option) => {
        setSelectedEmulator(option.key)
    }
    const onToggle = () =>{
        showRealdevice == 'emulator' ? setShowRealdevice('real_devices') : setShowRealdevice('emulator')
        setSelectedPlatforms('');
        setSelectedMobileVersion('')
        setPlatformVersions([])
        setSelectedEmulator('')
        setEmulator([])
    }
    const [checked, setChecked] = useState(false);
    
    return (
        <>
            <AvoModal id='SauceLab_Integration' customClass="saucelab_model" header='SauceLabs Integration' visible={displayBasic4} onModalBtnClick={() => onHidedia('displayBasic4')}
            content={
                <>
                {showSauceLabs && <>
                <div className='saucelab_toggle_button'>
                    <label className='toggle_saucelabs_emulator'>Emulator </label>
                <div className='toggle_saucelabs'> <InputSwitch checked={checked} onChange={(e) =>{setChecked(e.value);onToggle()}}/></div>
                    <label className='toggle_saucelabs_realdevice'>Real Devices </label>  
                    </div>  
                </>}


                {showSauceLabs &&
                    <>
                        <div><h3>Platforms</h3></div>
                        <Dropdown
                            // noItemsText={[]}
                            filter
                            onChange={(e)=>onMobilePlatformChange(e.value)}
                            options={platforms}
                            value={selectedPlatforms}
                            valueTemplate={selectedPlatforms}
                            // width='15rem'
                            placeholder='Select Platform'
                            className='saucelab_dropDown'
                            optionLabel='key'
                        />
                    </>}
                {!showSauceLabs && <>
                    <div className='os_name'><h3>Operating Systems</h3></div>
                    <Dropdown
                        // noItemsText={[]}
                        filter
                        onChange={(e) => onOsChange(e.value)}
                        options={newOsNames}
                        value={selectedOS}
                        valueTemplate={selectedOS}
                        // width='15rem'
                        placeholder='Select OS'
                        optionLabel='key'
                        className='saucelab_dropDown'
                        // calloutMaxHeight='12rem'
                    />
                </>}
                {!showSauceLabs &&
                    <>
                        <div className='os_name'><h3>Browsers</h3></div>
                        <Dropdown
                            // noItemsText={[]}
                            filter
                            disabled={selectedOS == ''}
                            onChange={(e)=>onSaucelabBrowserChange(e.value)}
                            options={saucelabBrowsers}
                            value={selectedSaucelabBrowser}
                            valueTemplate={selectedSaucelabBrowser}
                            optionLabel='key'
                            className='saucelab_dropDown'
                            // width='15rem'
                            placeholder='Select Browser'
                            // calloutMaxHeight='12rem'
                        />
                    </>}
                {showSauceLabs &&
                    <>
                        <div className='os_name'><h3>Versions</h3></div>
                        <Dropdown
                            // noItemsText={[]}
                            filter
                            disabled={selectedPlatforms == ''}
                            onChange={(e)=>onMobileVersionChange(e.value)}
                            options={platformVersions}
                            value={selectedMobileVersion}
                            optionLabel='key'
                            valueTemplate={selectedMobileVersion}
                            // width='15rem'
                            placeholder={'Select ' + selectedPlatforms + ' Versions'}
                            className='saucelab_dropDown'
                            // calloutMaxHeight='12rem'
                        />
                    </>}

                {!showSauceLabs &&
                    <>
                        <div className='os_name'><h3>Versions</h3></div>
                        <Dropdown
                            // noItemsText={[]}
                            filter
                            disabled={selectedSaucelabBrowser == ''}
                            onChange={(e)=>onVersionChange(e.value)}
                            options={browserVersions}
                            value={selectedVersion}
                            valueTemplate={selectedVersion}
                            className='saucelab_dropDown'
                            optionLabel='key'
                            // width='15rem'
                            placeholder='Select Versions'
                            // calloutMaxHeight='12rem'
                        />
                    </>}
                {showSauceLabs &&
                    <>
                        <div className='os_name'><h3>{showRealdevice == 'emulator'?"Emulator":'Real Devices'}</h3></div>
                        <Dropdown
                            // noItemsText={[]}
                            filter
                            onChange={(e)=>onEmulatorChange(e.value)}
                            options={emulator}
                            value={selectedEmulator}
                            className='saucelab_dropDown'
                            valueTemplate={selectedEmulator}
                            disabled={selectedMobileVersion == ''}
                            // width='15rem'
                            optionLabel='key'
                            placeholder={showRealdevice == 'emulator'?"Select Emulator":'Select Real Devices'}
                            // calloutMaxHeight='12rem'
                        />
                    </>}
                {selectProjects === 'MobileApp' &&
                    <>
                        <div className='os_name'><h3>UploadedApk</h3></div>
                        <Dropdown
                            filter
                            disabled={selectedPlatforms == ''}
                            onChange={(e) => onApkChange(e)}
                            // options={mobileDetails?.stored_files && mobileDetails?.stored_files.map((el) => ({ key: el?.name, text :el?.name, title: el?.name, index: el?.id }))}
                            options={mobileDetails?.stored_files && mobileDetails?.stored_files.map((el) => ({ key: el?.name, text :el?.appPackageName, title: el?.name, index: el?.id }))}
                            value={selectApk}
                            // valueTemplate={selectApk}
                            placeholder='Select apk'
                            optionLabel='key'
                            className="w-full md:w-10rem"
                        />
                    </>}
                <div>
                <div className="ice_container">
                    <div className="ice_status">
                      <span className="available"></span>
                      <span>Available</span>
                      <span className="unavailable"></span>
                      <span>Unavailable</span>
                      <span className="dnd"></span>
                      <span>Do Not Disturb</span>
                    </div>
                    <DropDownList
                      poolType={poolType}
                      ExeScreen={ExeScreen}
                      inputErrorBorder={inputErrorBorder}
                      setInputErrorBorder={setInputErrorBorder}
                      placeholder={"Search"}
                      data={availableICE}
                      smartMode={ExeScreen === true ? smartMode : ""}
                      selectedICE={selectedICE}
                      setSelectedICE={setSelectedICE}
                      className="saucelabs_ICE"
                    />
                  </div>
               

                
                </div>

                <Button label="Execute" title="Execute" className="Sacuelab_execute_button" onClick={async () => {

                    dataExecution.type = (ExeScreen === true ? ((smartMode === "normal") ? "" : smartMode) : "")
                    dataExecution.poolid = ""
                    if ((ExeScreen === true ? smartMode : "") !== "normal") dataExecution.targetUser = Object.keys(selectedICE).filter((icename) => selectedICE[icename]);
                    else dataExecution.targetUser = selectedICE

                    dataExecution['executionEnv'] = 'saucelabs'
                    dataExecution['saucelabDetails'] = sauceLabUser
                    if (!showSauceLabs) {
                        dataExecution['platform'] = selectedOS;
                        dataExecution['browserVersion'] = selectedVersion;
                        dataExecution["browserType"] = [browserlist.filter((element, index) => element.text == selectedSaucelabBrowser)[0].key]
                    } else {
                        dataExecution["browserType"] = ['1']
                        dataExecution['mobile'] = {
                            "platformName": selectedPlatforms,
                            "browserName": "Chrome",
                            "deviceName": selectedEmulator,
                            "platformVersion": selectedMobileVersion.split(" ")[1],
                            "uploadedApk": selectApk,
                            "appPackageName": appPackageName,
                            "appActivity" : appActivityName
                        }
                    }

                    CheckStatusAndExecute(dataExecution, iceNameIdMap);
                    setNewOsNames([]);
                    setBrowserVersions([]);
                    setSaucelabBrowsers([]);
                    setSelectedOS('');
                    setSelectedVersion('');
                    setSelectedSaucelabBrowser('');
                    setPlatforms([]);
                    setEmulator([]);
                    setPlatformVersions([]);
                    setSelectedPlatforms('');
                    setSelectedMobileVersion('');
                    setSelectedEmulator('');
                    setSelectApk([]);

                    onHidedia('displayBasic4');
                }
                }
                    autoFocus />


                <Button id='Saucelabs_cancel' text  size='small' className='Saucelabs_cancel' label="Cancel"  onClick={() => onHidedia('displayBasic4')} />

            </>
            } headerTxt='SauceLabs Integration' modalSytle={{
                width: "38vw",
                height: "75vh",
                background: "#FFFFFF",
                }}/>
            
        </>      
    )
})

export {SauceLabLogin,SauceLabsExecute};
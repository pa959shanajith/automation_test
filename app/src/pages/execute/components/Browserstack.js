import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import DropDownList from '../../global/components/DropDownList';
import { getDetails_BROWSERSTACK } from '../api';
import { Messages as MSG, setMsg } from '../../global';
import AvoModal from '../../../globalComponents/AvoModal';
import { Dropdown } from 'primereact/dropdown';
const BrowserstackLogin = React.memo(({ setLoading, displayBasic6, onHidedia, handleBrowserstackSubmit,setBrowserstackUser }) => {
    const [defaultValues, setDefaultValues] = useState({});
    const [isEmpty, setIsEmpty] = useState(false);
    const getBrowserstackDetails = async () => {
        try {
            setLoading("Loading...")
            const data = await getDetails_BROWSERSTACK()
            if (data.error) { setMsg(data.error); return; }
            if (data !== "empty") {
                setIsEmpty(true);
                setDefaultValues(data);
                setBrowserstackUser(data);
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
        getBrowserstackDetails();
    }, [])
    return (
        <>
            <AvoModal id='Browserstack_dialog' header='Browserstack login' visible={displayBasic6}
                onModalBtnClick={() => onHidedia('displayBasic6')}
            content={
            <>
                <form id='Browserstack-form'>
                    <div className='Browserstack_input'>
                        <div className="flex flex-row">
                            {/* <FormInput value={defaultValues.BrowserstackURL} type="text" id="Browserstack-URL"
                                name="Browserstack-URL"
                                placeholder="Enter Saucelabs Remote URL"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, BrowserstackURL: event.target.value })
                                }}
                                className="saucelabs_input" /> */}
                        </div>
                        <div className="flex flex-row">
                            <InputText value={defaultValues.BrowserstackUsername} type="text" id="Browserstack-username" name="Browserstack-username" placeholder="Enter Browserstack username"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, BrowserstackUsername: event.target.value })
                                }}
                                className="Browserstack_input_URL" />
                        </div>
                        <div className="flex flex-row">
                            <InputText value={defaultValues.Browserstackkey} type="text" id="Browserstack-API" name="Browserstack-API" placeholder="Enter Browserstack Access key"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, Browserstackkey: event.target.value })
                                }}
                                className="Borwserstack_input_Accesskey" />
                        </div>
                        <div>
                            {isEmpty && defaultValues.BrowserstackUsername && defaultValues.Browserstackkey ? "" : <div data-test="intg_log_error_span" className="Browserstack_ilm__error_msg">Save Credentials in Settings for Auto Login </div>}
                        </div>
                    </div>
                </form>
                
                <Button id='Browserstack_submit' label="Submit"
                    onClick={() => handleBrowserstackSubmit(defaultValues)}
                />
                </>}headerTxt='Browserstack login' modalSytle={{
                width: "39vw",
                height: "44vh",
                background: "#FFFFFF",
                minWidth: "38rem",
              }}/>
                
            
        </>
    )
});
const BrowserstackExecute = React.memo(({ browserstackBrowserDetails, selectProjects, mobileDetailsBrowserStack, displayBasic7, onHidedia,changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
    smartMode, selectedICE, setSelectedICE,availableICE, dataExecution, browserlist, CheckStatusAndExecute, iceNameIdMap,browserstackUser,showBrowserstack }) => {
    const [newOsNames, setNewOsNames] = useState([])
    const [selectedOS, setSelectedOS] = useState('');
    const [browserstackOsVersion, setBrowserstackOsVersion] = useState([]);
    const [selectedOsVersions, setSelectedOsVersions] = useState('');
    const [selectedBrowserVersions, setSelectedBrowserVersions] = useState('');
    const [browserstackBrowsers, setBrowserstackBrowsers] = useState([]);
    const [selectedBrowserVersionsDetails, setSelectedBrowserVersionsDetails] = useState('');
    const [selectedBrowserVerionDetails, setselectedBrowserVerionDetails] = useState([]);
    const [selectedMobilePlatforms, setSelectedMobilePlatforms] = useState('');
    const [selectedMobileVersion, setSelectedMobileVersion] = useState('');
    const [selectedDevices, setSelectedDevices] = useState('');
    const [selectDevices, setDevices] = useState([]);
    const [selectPlatforms, setPlatforms] = useState([]);
    const [mobileVersion, setMobileVersion] = useState([]);
    const [selectApk, setSelectApk] = useState('');
    const [selectedApk, setApk] = useState([]);
     
    useEffect(() => {
        setNewOsNames([]);
        setselectedBrowserVerionDetails([]);
        setBrowserstackOsVersion([]);
        setBrowserstackBrowsers([]);
        setSelectedBrowserVersions('');
        setSelectedOsVersions('');
        setSelectedOS('');
        setSelectedBrowserVersionsDetails('');
        setSelectedMobilePlatforms('');
        setSelectedMobileVersion('');
        setSelectedDevices('');
        setSelectApk('');
        setDevices([]);
        setPlatforms([]);
        setApk([]);
      
        if (Object.keys(browserstackBrowserDetails).length) {
          const osNamesArray = Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
            key: key,
            text: key,
            title: key,
            index: index,
            versions: value, // Add the versions array to each OS object
          }));
      
          setNewOsNames(osNamesArray);
          setBrowserstackOsVersion(
            Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
              key: key,
              text: key,
              title: key,
              index: index,
            })
          ));
        }
      
        if (mobileDetailsBrowserStack && Object.keys(mobileDetailsBrowserStack).length) {
          const platformArray = Object.entries(mobileDetailsBrowserStack.devices).map(([key, value], index) => ({
            key: key,
            text: key,
            title: key,
            index: index,
            versions: value,
            name:value,
          }));
          setPlatforms(platformArray);
        }
      }, [browserstackBrowserDetails, mobileDetailsBrowserStack]);
      
      
              
    const onOsChange = async (option) => {
        setselectedBrowserVerionDetails([])
        setBrowserstackOsVersion([])
        setBrowserstackBrowsers([])
        setSelectedBrowserVersions('')
        setSelectedOsVersions('')
        setSelectedBrowserVersionsDetails('')
        setSelectedOS(option.key)
        let arrayOS_names = []
            if(browserstackBrowserDetails.os_names[option.key]?.length) {
                let getValue = browserstackBrowserDetails.os_names[option.key]
                getValue.forEach((element,index) => {
                    arrayOS_names.push({
                        key: element,
                        text: element,
                        title: element,
                        index: index
                    });
                });
            }
            setBrowserstackOsVersion(arrayOS_names)
    }
    const onOsVersionChange = (option) => {
        setBrowserstackBrowsers([])
        setselectedBrowserVerionDetails([])
        setSelectedBrowserVersions('')
        setSelectedOsVersions(option.key)
        let arrayBrowser = []
        let os_name = selectedOS.concat(" ", option.key);
        if (Object.entries(browserstackBrowserDetails.browser).length){
            Object.entries(browserstackBrowserDetails.browser).forEach(([browser, os_version]) => {
               Object.entries(os_version).forEach(([os_version_key, browser_version]) => {
                    if (os_version_key === os_name) {
                        arrayBrowser.push({
                            key: browser,
                            text: browser,
                            title: browser
                        });
                    }
               }); 
            });
        }
        setBrowserstackBrowsers(arrayBrowser)
        }
        const onBrowserSelect = (option) => {
            setselectedBrowserVerionDetails([])
            setSelectedBrowserVersionsDetails('')
            setSelectedBrowserVersions('')
            setSelectedBrowserVersions(option.key)
            let arrayBrowserVersion = []
            let os_name = selectedOS.concat(" ", selectedOsVersions);
            if(Object.entries(browserstackBrowserDetails.browser[option.key]).length) {
                if (Object.entries(browserstackBrowserDetails.browser[option.key][os_name]).length) {
                    browserstackBrowserDetails.browser[option.key][os_name].forEach((element,index) => {
                        arrayBrowserVersion.push({
                            key: element,
                            text: element,
                            title: element,
                            index: index
                        });
                    });
                }
            }
            setselectedBrowserVerionDetails(arrayBrowserVersion)
        }
        
        const onBrowserVersionChange = (option) =>{
            setSelectedBrowserVersionsDetails(option.key)
        }

        const onMobilePlatformChange = async (option) => {
            setSelectedMobilePlatforms(option.key)
            setSelectedMobileVersion('')
            setSelectedDevices('')
            setDevices([])
            let findVersions = Object.keys(mobileDetailsBrowserStack.devices[option.key]).map((element, index) => ({
                key: element,
                text: element,
                title: element,
                index: index,
                name:element,
            }))
            setMobileVersion(findVersions);
        }
        
        const onMobileVersionChange = (option) => {
            setSelectedMobileVersion(option.key);
            setSelectedDevices('')
            setDevices([])
            let findDevices = Object.values(mobileDetailsBrowserStack.devices[selectedMobilePlatforms][option.key]).map((element, index) => ({
                key: element,
                text: element,
                title: element,
                index: index,
                name:element,
            }))
            setDevices(findDevices);
        }

        const onDeviceChange = async (option) => {
            setSelectedDevices(option.key)
        }

        const onApkChange = async (option) => {
            setSelectedMobileVersion(option.key);
            setSelectedDevices('')
            setDevices([])
            setSelectApk([])
            let findapk = Object.entries(mobileDetailsBrowserStack.stored_files[option.key]).map(([key, value], index) => ({
                key: key,
                text: key,
                title: key,
                index: index,
                versions: value,
                name:value,
            }))
            setApk(findapk);
        }    
    
    return (
        <>
            <AvoModal  header='Browserstack Integration' visible={displayBasic7} onModalBtnClick={() => onHidedia('displayBasic7')}
                
            content={
                <>
                {!showBrowserstack && <> 
                    <div><h6>Operating Systems</h6></div>
                    <Dropdown
                        // noItemsText={[]}
                        onChange={(e)=>onOsChange(e.value)}
                        options={newOsNames}
                        value={selectedOS}
                        valueTemplate={selectedOS}
                        filter
                        // width='15rem'
                        optionLabel='key'
                        placeholder='select OS'
                        // calloutMaxHeight='12rem'
                    />
                    </>}
    
                    {!showBrowserstack && <>
                    <div><h6>Operating Systems Versions</h6></div>
                    <Dropdown
                        // noItemsText={[]}
                        disabled={selectedOS == ''}
                        onChange={(e)=>onOsVersionChange(e.value)}
                        options={browserstackOsVersion}
                        value={selectedOsVersions}
                        valueTemplate={selectedOsVersions}
                        filter
                        // width='15rem'
                        optionLabel='key'
                        placeholder='select OS Versions'
                        // calloutMaxHeight='12rem'
                    />
                    </>}
    
                    {!showBrowserstack && <>   
                    <div><h6>Browsers</h6></div>
                    <Dropdown
                        // noItemsText={[]}
                        disabled={selectedOsVersions == ''}
                        onChange={(e)=>onBrowserSelect(e.value)}
                        options={browserstackBrowsers}
                        value={selectedBrowserVersions}
                        filter
                        valueTemplate={selectedBrowserVersions}
                        // width='15rem'
                        optionLabel='key'
                        placeholder='select Browsers'
                        // calloutMaxHeight='12rem'
                    />
                    </>}
    
                    {!showBrowserstack && <>
                    <div><h6>Browser Versions</h6></div>
                    <Dropdown
                        // noItemsText={[]}
                        disabled={selectedBrowserVersions == ''}
                        onChange={(e)=>onBrowserVersionChange(e.value)}
                        options={selectedBrowserVerionDetails}
                        value={selectedBrowserVersionsDetails}
                        valueTemplate={selectedBrowserVersionsDetails}
                        filter
                        // width='15rem'
                        optionLabel='key'
                        placeholder='select Browser Versions'
                        // calloutMaxHeight='10rem'
                    />
                    </>}

                    {showBrowserstack && <>   
                    <div><h6>Platform</h6></div>
                    <Dropdown 
                        onChange={(e)=>onMobilePlatformChange(e.value)}
                        options={selectPlatforms}
                        value={selectedMobilePlatforms}
                        filter
                        valueTemplate={selectedMobilePlatforms}                    
                        optionLabel='key'
                        placeholder='select platform'
                    />
                    </>}

                    {showBrowserstack && <>   
                    <div><h6>versions</h6></div>
                    <Dropdown
                        onChange={(e)=>onMobileVersionChange(e.value)}
                        options={mobileVersion}
                        value={selectedMobileVersion}
                        filter
                        valueTemplate={selectedMobileVersion}
                        optionLabel='key'
                        placeholder='select version'
                    />
                    </>}

                    {showBrowserstack && <>   
                    <div><h6>devices</h6></div>
                    <Dropdown
                        onChange={(e)=>onDeviceChange(e.value)}
                        options={selectDevices}
                        value={selectedDevices}
                        filter
                        valueTemplate={selectedDevices}
                        optionLabel='key'
                        placeholder='select device'
                    />
                    </>}

                    {selectProjects === 'MobileApp' && <>   
                    <div><h6>uploaded apk</h6></div>
                    <Dropdown
                        onChange={(e)=>onApkChange(e.value)}
                        options={selectedApk}
                        value={selectApk}
                        filter
                        valueTemplate={selectApk}
                        optionLabel='key'
                        placeholder='select apk'
                        className="w-full md:w-10rem"
                    />
                    </>}

                <div>
                    <div>
                <div className="legends-container">
                      <div className="legend">
                        <span id="status" className="status-available1"></span>
                        <span className="legend-texta">Available</span>
                      </div>
                      <div className="legend">
                        <span id="status" className="status-unavailable"></span>
                        <span className="legend-text2">Unavailable</span>
                      </div>
                      <div className="legend">
                        <span id="status" className="status-dnd"></span>
                        <span className="legend-text1">Do Not Disturb</span>
                      </div>
                    </div>
                    </div>
                    <div className='adminControl-ice-sauce'>
                        <div className='sauce_ICEsearch'>
                            <span className="leftControl_sauce" title="Token Name"></span>
                            <DropDownList poolType={poolType} ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder} placeholder={'Select Avo Assure Client'} data={availableICE} smartMode={(ExeScreen === true ? smartMode : '')} selectedICE={selectedICE} setSelectedICE={setSelectedICE}  />
                        </div>
                    </div>
                </div>
                <Button label="Execute" title="Execute" className="Sacuelab_execute_button" onClick={async () => {
                    dataExecution.type = (ExeScreen === true ? ((smartMode === "normal") ? "" : smartMode) : "")
                    dataExecution.poolid = ""
                    if ((ExeScreen === true ? smartMode : "") !== "normal") dataExecution.targetUser = Object.keys(selectedICE).filter((icename) => selectedICE[icename]);
                    else dataExecution.targetUser = selectedICE
                    dataExecution['executionEnv'] = 'browserstack'
                    dataExecution['browserstackDetails'] = browserstackUser
                    if (!showBrowserstack) {
                        dataExecution['os'] = selectedOS;
                        dataExecution['osVersion'] = selectedOsVersions;
                        dataExecution['browserVersion'] = selectedBrowserVersionsDetails
                        dataExecution['browserName'] = selectedBrowserVersions;
                        dataExecution["browserType"] = [browserlist.filter((element, index) => element.text == selectedBrowserVersions)[0].key]
                    } else {
                        dataExecution["browserType"] = ['1']
                        dataExecution['mobile'] = {
                            "platformName": selectedMobilePlatforms,
                            "deviceName": selectedDevices,
                            "platformVersion": selectedMobileVersion,
                            "uploadedApk": selectedApk
                            
                        }
                    }        
                    CheckStatusAndExecute(dataExecution, iceNameIdMap);
                    setNewOsNames([]);
                    setSelectedOS('');
                    onHidedia('displayBasic7');
                    }
                    }
                    autoFocus />
                    <Button id='Saucelabs_cancel' className='Saucelabs_cancel' label="Cancel" onClick={() => onHidedia('displayBasic7')} />
                </>}
                headerTxt='Browserstack Integration' modalSytle={{
                    width: "45vw",
                    height: "67vh",
                    background: "#FFFFFF",
                    }}/>
        </>
    )
})
export { BrowserstackLogin, BrowserstackExecute };
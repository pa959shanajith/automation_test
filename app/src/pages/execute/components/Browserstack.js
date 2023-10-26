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
                
                <Button id='Saucelabs_submit' label="Submit"
                    onClick={() => handleBrowserstackSubmit(defaultValues)}
                />
                </>}headerTxt='BrowserStack login' modalSytle={{
                width: "39vw",
                height: "44vh",
                background: "#FFFFFF",
                minWidth: "38rem",
              }}/>
                
            
        </>
    )
});
const BrowserstackExecute = React.memo(({ browserstackBrowserDetails, displayBasic7, onHidedia,changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
    smartMode, selectedICE, setSelectedICE,availableICE, dataExecution, browserlist, CheckStatusAndExecute, iceNameIdMap,browserstackUser,showBrowserstack }) => {
    const [newOsNames, setNewOsNames] = useState([])
    const [selectedOS, setSelectedOS] = useState('');
    const [browserstackOsVersion, setBrowserstackOsVersion] = useState([]);
    const [selectedOsVersions, setSelectedOsVersions] = useState('');
    const [selectedBrowserVersions, setSelectedBrowserVersions] = useState('');
    const [browserstackBrowsers, setBrowserstackBrowsers] = useState([]);
    const [selectedBrowserVersionsDetails, setSelectedBrowserVersionsDetails] = useState('');
    const [selectedBrowserVerionDetails, setselectedBrowserVerionDetails] = useState([]);
     
    useEffect(() => {
        setNewOsNames([])
        setselectedBrowserVerionDetails([])
        setBrowserstackOsVersion([])
        setBrowserstackBrowsers([])
        setSelectedBrowserVersions('')
        setSelectedOsVersions('')
        setSelectedOS('')
        setSelectedBrowserVersionsDetails('')
        if (Object.keys(browserstackBrowserDetails).length) {
            const osNamesArray = Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
                key: key,
                text: key,
                title: key,
                index: index,
                versions: value, // Add the versions array to each OS object
              }));
          
              setNewOsNames(osNamesArray);
            
              setBrowserstackOsVersion(Object.entries(browserstackBrowserDetails.os_names).map(([key, value], index) => ({
                    key: key,
                    text: key,
                    title: key,
                    index: index,
                  })));
                }
              }, [browserstackBrowserDetails]);
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
    
    return (
        <>
            <AvoModal customClass='browserstack_modal'  header='Browserstack Integration' visible={displayBasic7} onModalBtnClick={() => onHidedia('displayBasic7')}
                
            content={
            <>
                <div className='os_name'><h3>Operating Systems</h3></div>
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
                    className='browserstack_dropdown'
                    // calloutMaxHeight='12rem'
                />
                <div className='os_name'><h3>Operating Systems Versions</h3></div>
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
                    className='browserstack_dropdown'
                    // calloutMaxHeight='12rem'
                />
                <div className='os_name'><h3>Browsers</h3></div>
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
                    className='browserstack_dropdown'
                    // calloutMaxHeight='12rem'
                />
                <div className='os_name'><h3>Browser Versions</h3></div>
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
                    className='browserstack_dropdown'
                    // calloutMaxHeight='10rem'
                />
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
                    dataExecution['executionEnv'] = 'browserstack'
                    dataExecution['browserstackDetails'] = browserstackUser
                    if (!showBrowserstack) {
                        dataExecution['os'] = selectedOS;
                        dataExecution['osVersion'] = selectedOsVersions;
                        dataExecution['browserVersion'] = selectedBrowserVersionsDetails
                        dataExecution['browserName'] = selectedBrowserVersions;
                        dataExecution["browserType"] = [browserlist.filter((element, index) => element.text == selectedBrowserVersions)[0].key]
                    }
                    CheckStatusAndExecute(dataExecution, iceNameIdMap);
                    setNewOsNames([]);
                    setSelectedOS('');
                    onHidedia('displayBasic7');
                    }
                    }
                    autoFocus />
                    <Button id='Saucelabs_cancel' text className='Saucelabs_cancel' size='small' label="Cancel" onClick={() => onHidedia('displayBasic7')} />
                </>}
                headerTxt='BrowserStack Integration' modalSytle={{
                    width: "40vw",
                    height: "87vh",
                    background: "#FFFFFF",
                    }}/>
        </>
    )
})
export { BrowserstackLogin, BrowserstackExecute };
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
import DropDownList from '../../global/components/DropDownList';
import { getDetails_BROWSERSTACK } from '../api';
import { Messages as MSG, setMsg } from '../../global';
import AvoModal from '../../../globalComponents/AvoModal';
import { Dropdown } from 'primereact/dropdown';
import { TabView, TabPanel } from 'primereact/tabview';
import 'primeicons/primeicons.css';
import ParllelExicution from '../components/ParllelExicution';
import { color } from 'd3';



import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
//import Button from '@mui/material/Button';

const BrowserstackLogin = React.memo(({ setLoading, displayBasic6, onHidedia, handleBrowserstackSubmit, setBrowserstackUser, browserstackValues, setBrowserstackValues }) => {
    // const [defaultValues, setDefaultValues] = useState({});
    const [isEmpty, setIsEmpty] = useState(false);
    const getBrowserstackDetails = async () => {
        try {
            setLoading("Loading...")
            const data = await getDetails_BROWSERSTACK()
            if (data.error) { setMsg(data.error); return; }
            if (data !== "empty") {
                setIsEmpty(true);
                setBrowserstackValues(data);
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
                                    <InputText value={browserstackValues.BrowserstackUsername} type="text" id="Browserstack-username" name="Browserstack-username" placeholder="Enter Browserstack username"
                                        onChange={(event) => {
                                            setBrowserstackValues({ ...browserstackValues, BrowserstackUsername: event.target.value })
                                        }}
                                        className="Browserstack_input_URL" />
                                </div>
                                <div className="flex flex-row">
                                    <InputText value={browserstackValues.Browserstackkey} type="text" id="Browserstack-API" name="Browserstack-API" placeholder="Enter Browserstack Access key"
                                        onChange={(event) => {
                                            setBrowserstackValues({ ...browserstackValues, Browserstackkey: event.target.value })
                                        }}
                                        className="Borwserstack_input_Accesskey" />
                                </div>
                                <div>
                                    {isEmpty && browserstackValues.BrowserstackUsername && browserstackValues.Browserstackkey ? "" : <div data-test="intg_log_error_span" className="Browserstack_ilm__error_msg">Save Credentials in Settings for Auto Login </div>}
                                </div>
                            </div>
                        </form>

                        <Button id='Saucelabs_submit' label="Submit"
                            onClick={() => handleBrowserstackSubmit(browserstackValues)}
                        />
                    </>} headerTxt='BrowserStack login' modalSytle={{
                        width: "39vw",
                        height: "44vh",
                        background: "#FFFFFF",
                        minWidth: "38rem",
                    }} />


        </>
    )
});
const BrowserstackExecute = React.memo(({ browserstackBrowserDetails, selectProjects, mobileDetailsBrowserStack, displayBasic7, onHidedia, changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
    smartMode, selectedICE, setSelectedICE, availableICE, dataExecution, browserlist, CheckStatusAndExecute, iceNameIdMap, browserstackUser, showBrowserstack, setBrowserstackValues, browserstackValues }) => {
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
    const [selectApkId, setSelectApkId] = useState('');

    const [activeIndex, setActiveIndex] = useState(0);
    const steps = [
        {
            label: "",
            description: ` Visualize testcases through mindmaps, capture elements and design test steps. `,
            title: (
                 <div className="center-continer-cls">
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} classname="tab_cls">
                <TabPanel header="Normal Execution" rightIcon="pi pi-info-circle ml-2">
                    <div classname="normal-exicution_cls"  style={{ border: '2px solid #E0E0E0', borderRadius: "5px",padding:"5px 5px 30px 5px" }}> 
                    
                        <h3 className='m-3'>Select Combinations <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h3>
                        {!showBrowserstack && (
                            <div className="dropdown-container m-3">
                                <div>
                                    <div className='os_name'><h4>Operating Systems</h4></div>
                                    <Dropdown
                                        onChange={(e) => onOsChange(e.value)}
                                        options={newOsNames}
                                        value={selectedOS}
                                        valueTemplate={selectedOS}
                                        filter
                                        optionLabel='key'
                                        placeholder='select OS'
                                        className='browserstack_dropdown'
                                    />
                                </div>
                                <div>
                                    <div className='os_name'><h4>Operating Systems Versions</h4></div>
                                    <Dropdown
                                        disabled={selectedOS == ''}
                                        onChange={(e) => onOsVersionChange(e.value)}
                                        options={browserstackOsVersion}
                                        value={selectedOsVersions}
                                        valueTemplate={selectedOsVersions}
                                        filter
                                        optionLabel='key'
                                        placeholder='select OS Versions'
                                        className='browserstack_dropdown'
                                    />
                                </div>

                                <div>
                                    <div className='os_name'><h4>Browsers</h4></div>
                                    <Dropdown
                                        disabled={selectedOsVersions == ''}
                                        onChange={(e) => onBrowserSelect(e.value)}
                                        options={browserstackBrowsers}
                                        value={selectedBrowserVersions}
                                        filter
                                        valueTemplate={selectedBrowserVersions}
                                        optionLabel='key'
                                        placeholder='select Browsers'
                                        className='browserstack_dropdown'
                                    />
                                </div>
                                <div>
                                    <div className='os_name'><h4>Browser Versions</h4></div>
                                    <Dropdown
                                        disabled={selectedBrowserVersions == ''}
                                        onChange={(e) => onBrowserVersionChange(e.value)}
                                        options={selectedBrowserVerionDetails}
                                        value={selectedBrowserVersionsDetails}
                                        valueTemplate={selectedBrowserVersionsDetails}
                                        filter
                                        optionLabel='key'
                                        placeholder='select Browser Versions'
                                        className='browserstack_dropdown'
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </TabPanel>
                <TabPanel header="Parallel Execution" rightIcon="pi pi-info-circle ml-2">
                    <div>
                        <ParllelExicution />
                    </div>
                </TabPanel>
            </TabView>
        </div>)},

        {
            label: ' ',
            description: `View and analyze executed test automations.`,
            title:  <div style={{ padding: "0px 20px " ,position:"relative",top:"-70%"}}>

            <div className="ice_container">
                <div className="ice_status">
                    <span className="status">Status:</span>
                    <span className="available"></span>
                    <span>Available</span>
                    <span className="unavailable"></span>
                    <span>Unavailable</span>
                    <span className="dnd"></span>
                    <span>Do Not Disturb</span>
                </div>
                <h3 className='m-3'>Select Avo Assure Client  to start the exicution <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h3>
                <div className='m-3'>
                    <h4 >Avo Assure Client</h4>
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
                        className="saucelabs_ICE "
                       
                    />
                     <i  className="pi pi-angle-down" style={{fontSize: "20px", position: "relative", top: "-33px",left: "271px"}}/>
                </div>


            </div>
        </div>
        },
    ];

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
                name: value,
            }));
            let findapk = Object.keys(mobileDetailsBrowserStack.stored_files).map((element, index) => ({
                key: element,
                text: element,
                title: element,
                index: element,
                versions: element,
                name: element,
                id: mobileDetailsBrowserStack.stored_files[element],
            }))
            setApk(findapk);
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
        if (browserstackBrowserDetails.os_names[option.key]?.length) {
            let getValue = browserstackBrowserDetails.os_names[option.key]
            getValue.forEach((element, index) => {
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
        if (Object.entries(browserstackBrowserDetails.browser).length) {
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
        if (Object.entries(browserstackBrowserDetails.browser[option.key]).length) {
            if (Object.entries(browserstackBrowserDetails.browser[option.key][os_name]).length) {
                browserstackBrowserDetails.browser[option.key][os_name].forEach((element, index) => {
                    arrayBrowserVersion.push({
                        key: element,
                        text: element,
                        title: element,
                        index: index
                    });
                });
            }
        }
        setselectedBrowserVerionDetails(arrayBrowserVersion.sort((a, b) => {
            return Number(b.key) - Number(a.key);
        }));
    }

    const onBrowserVersionChange = (option) => {
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
            name: element,
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
            name: element,
        }))
        setDevices(findDevices);
    }

    const onDeviceChange = async (option) => {
        setSelectedDevices(option.key)
    }

    const onApkChange = async (option) => {
        setSelectApk(option.key)
        setSelectApkId(option.id)
    }

    return (
        <>
            <AvoModal customClass='browserstack_modal' header='Browserstack Integration' visible={true} onModalBtnClick={() => onHidedia('displayBasic7')}//displayBasic7

                content={
                    <>
                        <Box>
                            <Stepper orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={step.label} expanded={true}>
                                        <StepLabel className='stepLabel'>
                                                 {step.label}
                                                   {/* <Button  className={step.title==='Execute'?'verticalbuttonE':step.title==='Report'?'verticalbuttonR':'verticalbutton'}
                              value={step.title}
                              onClick={(e)=>handleNext(e.target.value)}
                              // disabled={
                              //           (step.title==="Execute" && activeStep < 1) || (step.title==="Report" && activeStep < 2)} 
                              >{step.title}</Button> */}
                                                    {/* <NavigateNextIcon className='verticalicon'/> */}
                                                    {/* {console.log(e.target.value)} */}
                                            
                                            
                                        </StepLabel>
                                        <StepContent   >{step.title} </StepContent>
                                    </Step>
                                ))
                                }

                            </Stepper>
                        </Box>


                        {/* <div className="center-continer-cls">
                            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} classname="tab_cls">
                                <TabPanel header="Normal Execution" rightIcon="pi pi-info-circle ml-2">
                                    <div classname="normal-exicution_cls" style={{ border: '2px solid #EEE', borderRadius: "5px" }}>
                                        <h3 className='m-3'>Select Combinations <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h3>
                                        {!showBrowserstack && (
                                            <div className="dropdown-container m-3">
                                                <div>
                                                    <div className='os_name'><h4>Operating Systems</h4></div>
                                                    <Dropdown
                                                        onChange={(e) => onOsChange(e.value)}
                                                        options={newOsNames}
                                                        value={selectedOS}
                                                        valueTemplate={selectedOS}
                                                        filter
                                                        optionLabel='key'
                                                        placeholder='select OS'
                                                        className='browserstack_dropdown'
                                                    />
                                                </div>
                                                <div>
                                                    <div className='os_name'><h4>Operating Systems Versions</h4></div>
                                                    <Dropdown
                                                        disabled={selectedOS == ''}
                                                        onChange={(e) => onOsVersionChange(e.value)}
                                                        options={browserstackOsVersion}
                                                        value={selectedOsVersions}
                                                        valueTemplate={selectedOsVersions}
                                                        filter
                                                        optionLabel='key'
                                                        placeholder='select OS Versions'
                                                        className='browserstack_dropdown'
                                                    />
                                                </div>

                                                <div>
                                                    <div className='os_name'><h4>Browsers</h4></div>
                                                    <Dropdown
                                                        disabled={selectedOsVersions == ''}
                                                        onChange={(e) => onBrowserSelect(e.value)}
                                                        options={browserstackBrowsers}
                                                        value={selectedBrowserVersions}
                                                        filter
                                                        valueTemplate={selectedBrowserVersions}
                                                        optionLabel='key'
                                                        placeholder='select Browsers'
                                                        className='browserstack_dropdown'
                                                    />
                                                </div>
                                                <div>
                                                    <div className='os_name'><h4>Browser Versions</h4></div>
                                                    <Dropdown
                                                        disabled={selectedBrowserVersions == ''}
                                                        onChange={(e) => onBrowserVersionChange(e.value)}
                                                        options={selectedBrowserVerionDetails}
                                                        value={selectedBrowserVersionsDetails}
                                                        valueTemplate={selectedBrowserVersionsDetails}
                                                        filter
                                                        optionLabel='key'
                                                        placeholder='select Browser Versions'
                                                        className='browserstack_dropdown'
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabPanel>
                                <TabPanel header="Parallel Execution" rightIcon="pi pi-info-circle ml-2">
                                    <div>
                                        <ParllelExicution />
                                    </div>
                                </TabPanel>
                            </TabView>
                        </div> */}
                        {/* {!showBrowserstack && <> 
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
                    </>}
    
                    {!showBrowserstack && <>
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
                    </>}
    
                    {!showBrowserstack && <>   
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
                    </>}
    
                    {!showBrowserstack && <>
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
                    </>} */}

                        {showBrowserstack && <>
                            <div className='os_name'><h3>Platform</h3></div>
                            <Dropdown
                                onChange={(e) => onMobilePlatformChange(e.value)}
                                options={selectPlatforms}
                                value={selectedMobilePlatforms}
                                filter
                                valueTemplate={selectedMobilePlatforms}
                                optionLabel='key'
                                placeholder='select platform'
                                className='browserstack_dropdown'
                            />
                        </>}

                        {showBrowserstack && <>
                            <div className='os_name'><h3>Versions</h3></div>
                            <Dropdown
                                disabled={selectedMobilePlatforms == ''}
                                onChange={(e) => onMobileVersionChange(e.value)}
                                options={mobileVersion}
                                value={selectedMobileVersion}
                                filter
                                valueTemplate={selectedMobileVersion}
                                optionLabel='key'
                                placeholder='select version'
                                className='browserstack_dropdown'
                            />
                        </>}

                        {showBrowserstack && <>
                            <div className='os_name'><h3>devices</h3></div>
                            <Dropdown
                                disabled={selectedMobileVersion == ''}
                                onChange={(e) => onDeviceChange(e.value)}
                                options={selectDevices}
                                value={selectedDevices}
                                filter
                                valueTemplate={selectedDevices}
                                optionLabel='key'
                                placeholder='select device'
                                className='browserstack_dropdown'
                            />
                        </>}

                        {selectProjects === 'MobileApp' && <>
                            <div className='os_name'><h3>uploaded apk</h3></div>
                            <Dropdown
                                disabled={selectedDevices == ''}
                                onChange={(e) => onApkChange(e.value)}
                                options={selectedApk}
                                value={selectApk}
                                filter
                                valueTemplate={selectApk}
                                optionLabel='key'
                                placeholder='select apk'
                                className='browserstack_dropdown'
                            // className="w-full md:w-10rem"
                            />
                        </>}

                        {/* <div style={{ padding: "0px 20px " }}>

                            <div className="ice_container">
                                <div className="ice_status">
                                    <span className="status">Status:</span>
                                    <span className="available"></span>
                                    <span>Available</span>
                                    <span className="unavailable"></span>
                                    <span>Unavailable</span>
                                    <span className="dnd"></span>
                                    <span>Do Not Disturb</span>
                                </div>
                                <h3 className='m-3'>Select Avo Assure Client  to start the exicution <span style={{ fontSize: '1em', color: "red", marginLeft: "-5px" }}>*</span></h3>
                                <div className='m-3'>
                                    <h4 >Avo Assure Client</h4>
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
                                        className="saucelabs_ICE "
                                    />
                                </div>


                            </div>
                        </div> */}
                        {/* <Button label="Execute" title="Execute" className="Sacuelab_execute_button" disabled = {selectedICE == ''} onClick={async () => {
                    dataExecution.type = (ExeScreen === true ? ((smartMode === "normal") ? "" : smartMode) : "")
                    dataExecution.poolid = ""
                    if ((ExeScreen === true ? smartMode : "") !== "normal") dataExecution.targetUser = Object.keys(selectedICE).filter((icename) => selectedICE[icename]);
                    else dataExecution.targetUser = selectedICE
                    dataExecution['executionEnv'] = 'browserstack'
                    dataExecution['browserstackDetails'] = browserstackUser && browserstackValues;
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
                            "uploadedApk": selectApkId,
                            "browserName": "Chrome"
                            
                        }
                    }        
                    CheckStatusAndExecute(dataExecution, iceNameIdMap);
                    setNewOsNames([]);
                    setSelectedOS('');
                    onHidedia('displayBasic7');
                    }
                    }
                    autoFocus />
                    <Button id='Saucelabs_cancel' text className='Saucelabs_cancel' size='small' label="Cancel" onClick={() => onHidedia('displayBasic7')} /> */}
                    </>}
                headerTxt='BrowserStack Integration' modalSytle={{
                    width: "65vw",
                    height: "auto",
                    background: "#FFFFFF",
                }}
                footerType="Execute" />
        </>
    )
})
export { BrowserstackLogin, BrowserstackExecute };
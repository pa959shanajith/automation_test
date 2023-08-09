import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FormInput } from '../../settings/components/AllFormComp';
import { SearchDropdown } from '@avo/designcomponents';
import DropDownList from '../../global/components/DropDownList';
import {getDetails_SAUCELABS} from '../../settings/api';
import { Messages as MSG, setMsg} from '../../global';
import {Toggle} from '@avo/designcomponents';


const SauceLabLogin = React.memo(({ setLoading, displayBasic4, onHide, handleSubmit,setSauceLabUser }) => {

    const [defaultValues, setDefaultValues] = useState({});
    const [isEmpty, setIsEmpty] = useState(false);

    const getSaucelabsDetails = async () => {
        try {
            setLoading("Loading...")
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

    return (
        <>
            <Dialog id='Saucelabs_dialog' header='Saucelabs login' visible={displayBasic4}
                onHide={() => onHide('displayBasic4')}
            >
                <form id='Saucelabs-form'>
                    <div className='Saucelabs_input'>
                        <div className="flex flex-row">
                            <FormInput value={defaultValues.SaucelabsURL} type="text" id="Saucelabs-URL"
                                name="Saucelabs-URL"
                                placeholder="Enter Saucelabs Remote URL"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, SaucelabsURL: event.target.value });
                                    setSauceLabUser({ ...defaultValues, SaucelabsURL: event.target.value });
                                }}
                                className="saucelabs_input" />
                        </div>
                        <div className="flex flex-row">
                            <FormInput value={defaultValues.SaucelabsUsername} type="text" id="Saucelabs-username" name="aucelabs-username" placeholder="Enter Saucelabs username"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, SaucelabsUsername: event.target.value });
                                    setSauceLabUser({ ...defaultValues, SaucelabsUsername: event.target.value });
                                }}
                                className="saucelabs_input_URL" />
                        </div>
                        <div className="flex flex-row">
                            <FormInput value={defaultValues.Saucelabskey} type="text" id="Saucelabs-API" name="Saucelabs-API" placeholder="Enter Saucelabs Access key"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, Saucelabskey: event.target.value });
                                    setSauceLabUser({ ...defaultValues, Saucelabskey: event.target.value });
                                }}
                                className="saucelabs_input_Accesskey" />
                        </div>
                        <div>
                            {isEmpty && defaultValues.SaucelabsURL && defaultValues.SaucelabsUsername && defaultValues.Saucelabskey ? "" : <div data-test="intg_log_error_span" className="saucelabs_ilm__error_msg">Save Credentials in Settings for Auto Login </div>}
                        </div>
                    </div>
                </form>
                <Button id='Saucelabs_submit' label="Submit"
                    onClick={() => handleSubmit(defaultValues)}
                />
            </Dialog>
        </>
    )
});

const SauceLabsExecute = React.memo(({ mobileDetails, browserDetails, displayBasic5, onHide, showSauceLabs,
    changeLable, poolType, ExeScreen, inputErrorBorder, setInputErrorBorder,
    availableICE, smartMode, selectedICE, setSelectedICE, sauceLab, dataExecution, sauceLabUser, browserlist, CheckStatusAndExecute, iceNameIdMap }) => {
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

    useEffect(() => {
        setSelectedPlatforms('')
        setSelectedMobileVersion('')
        setSelectedEmulator('')
        setShowRealdevice('emulator')
        setPlatforms([])
        setPlatformVersions([])
        setEmulator([])
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
                    text: each_version,
                    title: each_version,
                    index: index
                }
            )
        });
        setPlatformVersions(findMobileVersions.sort((a, b) => {
            return Number(a.key.split(' ')[1]) - Number(b.key.split(' ')[1])
        }));
    }

    const onMobileVersionChange = (option) => {
        setSelectedMobileVersion(option.text);
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

    return (
        <>
            <Dialog id='SauceLab_Integration' header='SauceLabs Integration' visible={displayBasic5} onHide={() => onHide('displayBasic5')}>
            {showSauceLabs && <>
            <div className='saucelab_toggle_button'>
                <label className='toggle_saucelabs_emulator'>Emulator </label>
               <div className='toggle_saucelabs'> <Toggle onClick={onToggle}/></div>
                <label className='toggle_saucelabs_realdevice'>Real Devices </label>  
                </div>  
            </>}


                {showSauceLabs &&
                    <>
                        <div><h6>Platforms</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            onChange={onMobilePlatformChange}
                            options={platforms}
                            selectedKey={selectedPlatforms}
                            width='15rem'
                            placeholder='select Platform'
                            calloutMaxHeight='12rem'
                        />
                    </>}
                {!showSauceLabs && <>
                    <div><h6>Operating Systems</h6></div>
                    <SearchDropdown
                        noItemsText={[]}
                        onChange={onOsChange}
                        options={newOsNames}
                        selectedKey={selectedOS}
                        width='15rem'
                        placeholder='select OS'
                        calloutMaxHeight='12rem'
                    />
                </>}
                {!showSauceLabs &&
                    <>
                        <div><h6>Browsers</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            disabled={selectedOS == ''}
                            onChange={onSaucelabBrowserChange}
                            options={saucelabBrowsers}
                            selectedKey={selectedSaucelabBrowser}
                            width='15rem'
                            placeholder='select Browser'
                            calloutMaxHeight='12rem'
                        />
                    </>}
                {showSauceLabs &&
                    <>
                        <div><h6>Versions</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            disabled={selectedPlatforms == ''}
                            onChange={onMobileVersionChange}
                            options={platformVersions}
                            selectedKey={selectedMobileVersion}
                            width='15rem'
                            placeholder={'select ' + selectedPlatforms + ' versions'}
                            calloutMaxHeight='12rem'
                        />
                    </>}

                {!showSauceLabs &&
                    <>
                        <div><h6>Versions</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            disabled={selectedSaucelabBrowser == ''}
                            onChange={onVersionChange}
                            options={browserVersions}
                            selectedKey={selectedVersion}
                            width='15rem'
                            placeholder='select Versions'
                            calloutMaxHeight='12rem'
                        />
                    </>}
                {showSauceLabs &&
                    <>
                        <div><h6>{showRealdevice == 'emulator'?"Emulator":'Real Devices'}</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            onChange={onEmulatorChange}
                            options={emulator}
                            selectedKey={selectedEmulator}
                            disabled={selectedMobileVersion == ''}
                            width='15rem'
                            placeholder={showRealdevice == 'emulator'?"Select Emulator":'Select Real Devices'}
                            calloutMaxHeight='12rem'
                        />
                    </>}
                <div>
                    <div>
                        <div className='adminControl-ice-saucelabs'>
                            <div className='adminControl-ice popup-content popup-content-status'>
                                <ul className={changeLable ? "e__IceStatusExecute" : "e__IceStatusSchedule"}>
                                    <li className="popup-li">
                                        <label title='available' className="available_sauce">
                                            <span id='status' className="status-available"></span>
                                            Available
                                        </label>
                                        <label title='unavailable' className="unavailable_sauce">
                                            <span id='status' className="status-unavailable" ></span>
                                            Unavailable
                                        </label>
                                        <label title='do not disturb' className="dnd_sauce">
                                            <span id='status' className="status-dnd"></span>
                                            Do Not Disturb
                                        </label>
                                    </li>
                                </ul>

                            </div>
                        </div>
                    </div>

                    <div className='adminControl-ice-sauce'>
                        <div className='sauce_ICEsearch'>
                            <span className="leftControl_sauce" title="Token Name"></span>
                            <DropDownList poolType={poolType} ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder} placeholder={'Select Avo Assure Client'} data={availableICE} smartMode={(ExeScreen === true ? smartMode : '')} selectedICE={selectedICE} setSelectedICE={setSelectedICE} sauceLab={sauceLab} />
                        </div>
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
                            "platformVersion": selectedMobileVersion.split(" ")[1]
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

                    onHide('displayBasic5');
                }
                }
                    autoFocus />


                <Button id='Saucelabs_cancel' className='Saucelabs_cancel' label="Cancel" onClick={() => onHide('displayBasic5')} />

            </Dialog>
        </>
    )
})

export {SauceLabLogin,SauceLabsExecute};
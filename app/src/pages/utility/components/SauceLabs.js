import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FormInput } from '../../settings/components/AllFormComp';
import { SearchDropdown } from '@avo/designcomponents';
import DropDownList from '../../global/components/DropDownList';
import {getDetails_SAUCELABS} from '../../settings/api';
import { Messages as MSG, setMsg} from '../../global';


const SauceLabLogin = React.memo(({ setLoading, displayBasic4, onHide, handleSubmit }) => {

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
                                    setDefaultValues({ ...defaultValues, SaucelabsURL: event.target.value })
                                }}
                                className="saucelabs_input" />
                        </div>
                        <div className="flex flex-row">
                            <FormInput value={defaultValues.SaucelabsUsername} type="text" id="Saucelabs-username" name="aucelabs-username" placeholder="Enter Saucelabs username"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, SaucelabsUsername: event.target.value })
                                }}
                                className="saucelabs_input_URL" />
                        </div>
                        <div className="flex flex-row">
                            <FormInput value={defaultValues.Saucelabskey} type="text" id="Saucelabs-API" name="Saucelabs-API" placeholder="Enter Saucelabs Access key"
                                onChange={(event) => {
                                    setDefaultValues({ ...defaultValues, Saucelabskey: event.target.value })
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
    availableICE, smartMode, selectedICE, setSelectedICE, sauceLab, dataExecution, defaultValues, browserlist, CheckStatusAndExecute, iceNameIdMap }) => {
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

    useEffect(() => {
        if (Object.keys(browserDetails).length) {
            setNewOsNames(browserDetails.os_names.map((element, index) => {
                return { key: element, text: element, title: element, index: index };
            }))
            setSaucelabBrowsers(Object.keys(browserDetails.browser).map((element, index) => {
                return { key: element, text: element, title: element, index: index };
            }));
        }
        if (Object.keys(mobileDetails).length) {
            setPlatforms(Object.keys(mobileDetails).map((element, index) => {
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
        setBrowserVersions([]);
        setSelectedVersion('');
        if (selectedSaucelabBrowser != '') {
            if (browserDetails && Object.keys(browserDetails).length) {
                let findBrowserVersion = browserDetails.browser[selectedSaucelabBrowser][option.key].map((element, index) => {
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
        let findMobileVersions = Object.keys(mobileDetails[option.key]).map((element, index) => {
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
        setPlatformVersions(findMobileVersions);
    }

    const onMobileVersionChange = (option) => {
        setSelectedMobileVersion(option.text);
        setSelectedEmulator('')
        setEmulator([])
        let findEmulator = mobileDetails[selectedPlatforms][option.key.split(" ")[1]].map((element, index) => ({
            key: element,
            text: element,
            title: element,
            index: index
        }))
        setEmulator(findEmulator);
        console.log(findEmulator);
    }
    const onEmulatorChange = async (option) => {
        setSelectedEmulator(option.key)
    }

    return (
        <>
            <Dialog id='SauceLab_Integration' header='SauceLab Intergration' visible={displayBasic5} onHide={() => onHide('displayBasic5')}>


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
                        />
                    </>}
                {!showSauceLabs && <>
                    <div><h6>Operating System</h6></div>
                    <SearchDropdown
                        noItemsText={[]}
                        onChange={onOsChange}
                        options={newOsNames}
                        selectedKey={selectedOS}
                        width='15rem'
                        placeholder='select OS'
                    />
                </>}
                {!showSauceLabs &&
                    <>
                        <div><h6>Browser</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            disabled={selectedOS == ''}
                            onChange={onSaucelabBrowserChange}
                            options={saucelabBrowsers}
                            selectedKey={selectedSaucelabBrowser}
                            width='15rem'
                            placeholder='select Browser'
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
                            placeholder='select android versions'
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
                        />
                    </>}
                {showSauceLabs &&
                    <>
                        <div><h6>Emulator</h6></div>
                        <SearchDropdown
                            noItemsText={[]}
                            onChange={onEmulatorChange}
                            options={emulator}
                            selectedKey={selectedEmulator}
                            disabled={selectedMobileVersion == ''}
                            width='15rem'
                            placeholder='select Emulator'
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
                    dataExecution['saucelabDetails'] = defaultValues
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


                <Button id='Saucelabs_cancel' className='Saucelabs_cancel' label="cancel" onClick={() => onHide('displayBasic5')} />

            </Dialog>
        </>
    )
})

export {SauceLabLogin,SauceLabsExecute};
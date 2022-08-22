import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, IntegrationDropDown } from '../../global';
import { fetchProjects, fetchAvoAgentAndAvoGridList, storeConfigureKey } from '../api';
import { useSelector } from 'react-redux';
import { SearchDropdown, TextField, Toggle, MultiSelectDropdown } from '@avo/designcomponents';


// import classes from "../styles/DevOps.scss";
import "../styles/DevOps.scss";
import ReleaseCycleSelection from './ReleaseCycleSelection';
import { prepareOptionLists } from './DevOpsUtils';
import DevOpsModuleList from './DevOpsModuleList';

const DevOpsConfig = props => {
    // const reportData = useSelector(state => state.viewReport.reportData);
    const reportData = {hasData: false};
    const [api, setApi] = useState("Execution");
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [configName, setConfigName] = useState("");
    const [dataDict, setDict] = useState({});
    const [integrationConfig, setIntegrationConfig] = useState(props.currentIntegration);
    const [icepoollist, setIcepoollist] = useState([]);
    const [browserlist, setBrowserlist] = useState([
        {
            key: '0',
            text: 'Internet Exploror'
        },{
            key: '1',
            text: 'Google Chrome'
        },{
            key: '2',
            text: 'Mozilla Firefox'
        },{
            key: '3',
            text: 'Microsoft Edge'
        },{
            key: '4',
            text: 'Edge Chromium'
        }
    ]);
    const [integration,setIntegration] = useState(props.currentIntegration.executionRequest ? props.currentIntegration.executionRequest.integration : {
        alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""}
    });
    const [showIntegrationModal,setShowIntegrationModal] = useState(false)
    const [dataUpdated, setDataUpdated] = useState(false);
    const integrationlist = [
        {
            key: 'qTest',
            text: 'qTest'
        }, {
            key: 'ALM',
            text: 'ALM'
        }, {
            key: 'Zephyr',
            text: 'Zephyr'
        }
    ];
    const [moduleScenarioList, setModuleScenarioList] = useState([]);
    const [selectedExecutionType, setSelectedExecutionType] = useState('normalExecution');
    const syncScenarioChange = (value) => {
        setShowIntegrationModal(value);
        setIntegrationConfig({...integrationConfig, integration: value});
    }
    useEffect(()=> {
        (async()=>{
            props.setLoading('Please Wait...');
            const gridAgentList = await fetchAvoAgentAndAvoGridList({
                query: 'all'
            });
            console.log(gridAgentList);
            if(gridAgentList.error) {
                if(gridAgentList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(gridAgentList.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching PoolsList",VARIANT.ERROR));
                }
            }else {
                setIcepoollist([ ...gridAgentList.avoagents.filter((agent) => agent.status === 'active').map((agent) => ({key: agent._id, text: agent.Hostname})), ...gridAgentList.avogrids.map((grid) => ({key: grid._id, text: grid.name})) ]);
            }
            const reportResponse = await fetchProjects({ readme: "projects" });
            if (reportResponse.error) {
                console.error(reportResponse.error);
                setMsg(MSG.REPORT.ERR_FETCH_PROJECT);
            }
            else {
                const [projList, newDict] = prepareOptionLists(reportResponse);
                let newSelectValues = [...integrationConfig.selectValues];
                newSelectValues[0].list = projList;

                if(props.currentIntegration.name !== '') {
                    console.log(props.currentIntegration.executionRequest);
                    console.log('props.currentIntegration.executionRequest');
                    // proj
                    newSelectValues[0]['selected'] = props.currentIntegration.executionRequest.suitedetails[0].projectid;
                    newSelectValues[0]['selectedName'] = props.currentIntegration.executionRequest.suitedetails[0].projectname;

                    // rel
                    newSelectValues[1]['disabled'] = false;
                    newSelectValues[1]['list'] = newDict[props.currentIntegration.executionRequest.suitedetails[0].projectid].relList;
                    newSelectValues[1]['selected'] = props.currentIntegration.executionRequest.suitedetails[0].releaseid;
                    newSelectValues[1]['selectedName'] = props.currentIntegration.executionRequest.suitedetails[0].releaseid;

                    //cyc
                    newSelectValues[2]['disabled'] = false;
                    newSelectValues[2]['list'] = newDict[props.currentIntegration.executionRequest.suitedetails[0].projectid].relDict[props.currentIntegration.executionRequest.suitedetails[0].releaseid].cycList;
                    newSelectValues[2]['selected'] = props.currentIntegration.executionRequest.suitedetails[0].cycleid;
                    newSelectValues[2]['selectedName'] = props.currentIntegration.executionRequest.suitedetails[0].cyclename;

                    const projId = newSelectValues[0]['selected'];
                    const relName = newSelectValues[1]['selected'];
                    const cycId = newSelectValues[2]['selected'];
                    props.currentIntegration.executionRequest.batchname !== '' && setSelectedExecutionType('batchExecution');
                }
                
                setDict(newDict);
                setIntegrationConfig({...integrationConfig, selectValues: newSelectValues});
            }
            props.setLoading(false);
        })()
    }, []);
    useEffect(()=> {
        let isUpdated = false;
        console.log(integrationConfig);
        Object.keys(integrationConfig).some(element => {
            if(typeof(integrationConfig[element]) === 'string' && integrationConfig[element] !== props.currentIntegration[element]) {
                isUpdated = true;
                return true;
            } else if(typeof(integrationConfig[element]) === 'object' && element === 'scenarioList' && (integrationConfig[element].length !== props.currentIntegration[element].length || integrationConfig[element].some((scenario) => { return !props.currentIntegration[element].includes(scenario) }) )) {
                isUpdated = true;
                return true;
            }
        });
        if (dataUpdated !== isUpdated) setDataUpdated(isUpdated);
    }, [integrationConfig]);

    const copyKeyUrlFunc = (id) => {
        const data = document.getElementById(id).value;
        if (!data) {
            setApiKeyCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setApiKeyCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById(id);
        x.select();
        document.execCommand('copy');
        setApiKeyCopyToolTip("Copied!");
        setTimeout(() => {
            setApiKeyCopyToolTip("Click to Copy");
        }, 1500);
    }
    const handleNewSelect = fieldIndex => (selectedKey) => {
        let newSelectValues = [...integrationConfig.selectValues];
        if (fieldIndex === 0) {
            newSelectValues[0]['selected'] = selectedKey.key;
            newSelectValues[0]['selectedName'] = selectedKey.text;
            newSelectValues[1]['disabled'] = false;
            newSelectValues[1]['list'] = dataDict[selectedKey.key].relList;
            newSelectValues[1]['selected'] = ""; 
            newSelectValues[2]['selected'] = ""; newSelectValues[2]['list'] = []; newSelectValues[2]['disabled'] = true;
        }
        else if (fieldIndex === 1) {
            newSelectValues[1]['selected'] = selectedKey.key;
            newSelectValues[1]['selectedName'] = selectedKey.text;
            newSelectValues[2]['disabled'] = false;
            newSelectValues[2]['list'] = dataDict[newSelectValues[0]['selected']].relDict[selectedKey.key].cycList;
            newSelectValues[2]['selected'] = ""; 
        }
        else if (fieldIndex === 2) {
            newSelectValues[2]['selected'] = selectedKey.key;
            newSelectValues[2]['selectedName'] = selectedKey.text;

            const projId = newSelectValues[0]['selected'];
            const relName = newSelectValues[1]['selected'];
            const cycId = newSelectValues[2]['selected'];
        }
        setIntegrationConfig({...integrationConfig, selectValues: newSelectValues});
    }

    const handleConfigSave = async () => {
        const batchInfo = moduleScenarioList['normalExecution'].filter((module) => {
            return module.scenarios.some(scenario => {
                return integrationConfig.scenarioList.includes(scenario._id)
            });
        }).map((module) => {
            return({
                scenarioTaskType: "disable",
                testsuiteName: module.name,
                testsuiteId: module.moduleid,
                batchname: (selectedExecutionType === 'batchExecution') ? module.batchname : "",
                versionNumber: 0,
                appType: "Web",
                domainName: "Banking",
                projectName: integrationConfig.selectValues[0].selectedName,
                projectId: integrationConfig.selectValues[0].selected,
                releaseId: integrationConfig.selectValues[1].selected,
                cycleName: integrationConfig.selectValues[2].selectedName,
                cycleId: integrationConfig.selectValues[2].selected,
                suiteDetails: module.scenarios.filter((scenario) => integrationConfig.scenarioList.includes(scenario._id)).map((scenario) => ({
                    condition: 0,
                    dataparam: [""],
                    scenarioName: scenario.name,
                    scenarioId: scenario._id,
                    accessibilityParameters: []
                }))
            });
        });
        props.setLoading('Please Wait...');
        const storeConfig = await storeConfigureKey({
            type: "",
            poolid: "",
            targetUser: "",
            source: "task",
            exectionMode: "serial",
            executionEnv: "default",
            browserType: integrationConfig.browsers,
            configurename: integrationConfig.name,
            executiontype: integrationConfig.executionType,
            configurekey: integrationConfig.key,
            exectionmode: integrationConfig.exectionMode,
            avoagents: (integrationConfig.avoAgentGrid && integrationConfig.avoAgentGrid.length > 0) ? [integrationConfig.avoAgentGrid] : [],
            integration: integration,
            batchInfo: batchInfo,
            scenarioFlag: false
        });
        if(storeConfig.status !== 'pass') {
            if(storeConfig.error.CONTENT) {
                setMsg(MSG.CUSTOM(storeConfig.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Something Went Wrong",VARIANT.ERROR));
            }
        }else {
            props.showMessageBar( `Configuration ${(props.currentIntegration.name == '') ? 'Create' : 'Update'}d Successfully` , 'SUCCESS');
            props.setCurrentIntegration(false);
        }
        props.setLoading(false);
    }
    const displayError = (error) =>{
        props.setLoading(false)
        setMsg(error)
    }
    const setshowModal = (status) => {
        setShowIntegrationModal(status);
    }

    return (<>
        { showIntegrationModal ? 
            <IntegrationDropDown
                setshowModal={setshowModal}
                type={showIntegrationModal} 
                showIntegrationModal={showIntegrationModal} 
                appType='' 
                setCredentialsExecution={setIntegration}
                integrationCred={integration}
                displayError={displayError}
                browserTypeExe={integrationConfig.browsers}
            />
        :null}
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                { props.currentIntegration.name === '' ? 'Create New' : 'Update'} Configuration
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => handleConfigSave()} >{props.currentIntegration.name == '' ? 'Save' : 'Update'}</button>
            <button data-test="submit-button-test" onClick={() => props.setCurrentIntegration(false)} >{dataUpdated ? 'Cancel' : 'Back'}</button>
            <div className="devOps_config_name">
                <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Configuration Name : </span>
                &nbsp;&nbsp;
                <span className="api-ut__inputLabel">
                    <TextField value={integrationConfig.name} width='150%' label="" standard={true} onChange={(event) => setIntegrationConfig({...integrationConfig, name: event.target.value})} autoComplete="off" placeholder="Enter Configuration Name" />
                </span>
            </div>
        </div>
        <div>
        {
            integrationConfig.selectValues && integrationConfig.selectValues.length > 0  && <ReleaseCycleSelection selectValues={integrationConfig.selectValues} handleSelect={handleNewSelect} />
        }
        </div>
        {
            <div style={{ display: 'flex', justifyContent:'space-between' }}>
                <div className="devOps_module_list">
                    <DevOpsModuleList setLoading={props.setLoading} integrationConfig={integrationConfig} setIntegrationConfig={setIntegrationConfig} moduleScenarioList={moduleScenarioList} setModuleScenarioList={setModuleScenarioList} selectedExecutionType={selectedExecutionType} setSelectedExecutionType={setSelectedExecutionType} />
                </div>
                <div className="devOps_pool_list">
                    <div style={{ marginTop: '0' }}>
                        <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Agent / Avo Grid : </label>
                        <SearchDropdown
                            calloutMaxHeight="30vh"
                            noItemsText={'Avo Agent / Avo Grid is empty'}
                            onChange={(selectedIce) => setIntegrationConfig({...integrationConfig, avoAgentGrid: selectedIce.key})}
                            options={icepoollist}
                            placeholder="Select Avo Agent or Avo Grid"
                            selectedKey={integrationConfig.avoAgentGrid}
                            width='54%'
                        />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_browser">Select Browsers : </label>
                        <MultiSelectDropdown
                            hideSelectAll
                            noItemsText={'No Browser available'}
                            onSelectKeysChange={(selectedBrowsers) => setIntegrationConfig({...integrationConfig, browsers: selectedBrowsers})}
                            options={browserlist}
                            placeholder="Select Browsers"
                            searchPlaceholder="Search Browser Name"
                            selectedKeys={integrationConfig.browsers}
                            width='54%'
                            />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_integration">Integration : </label>
                        <SearchDropdown
                            disabled={integrationConfig.browsers && integrationConfig.browsers.length === 0}
                            calloutMaxHeight="30vh"
                            noItemsText={'No Integration available'}
                            onChange={(selectedIntegration) => syncScenarioChange(selectedIntegration.key) }
                            options={integrationlist}
                            placeholder="Select Integration"
                            selectedKey={integrationConfig.integration}
                            width='54%'
                        />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Asynchronous </label>
                            <Toggle checked={integrationConfig.executionType == 'synchronous'} onChange={() => setIntegrationConfig({...integrationConfig, executionType: (integrationConfig.executionType === 'synchronous') ? 'asynchronous' : 'synchronous' })} label="" inlineLabel={true} />
                            <label>Synchronous </label>
                        </div>
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution_mode">Execution Mode : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Non-Headless </label>
                            <Toggle checked={integrationConfig.executionMode == 'headless'} onChange={() => setIntegrationConfig({...integrationConfig, executionMode: (integrationConfig.executionMode === 'headless') ? 'non-headless' : 'headless' })} label="" inlineLabel={true} />
                            <label>Headless </label>
                        </div>
                    </div>
                    <div className='devOps_seperation'>
                    </div>
                    <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_url">DevOps Integration API url : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={props.url} id='api-url' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/executeAutomation' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div>
                    <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_key">Configuration Key : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={integrationConfig.key} id='devops-key' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='Configuration Key' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('devops-key') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div>
                </div>
            </div>
        }
    </>);
}


export default DevOpsConfig;
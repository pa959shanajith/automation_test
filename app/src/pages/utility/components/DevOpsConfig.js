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
    const reportData = {hasData: false};
    const [api, setApi] = useState("Execution");
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [configName, setConfigName] = useState("");
    const [dataDict, setDict] = useState({});
    const dataParametersCollection = [];
    const [error, setError] = useState({});
    if(props.currentIntegration && props.currentIntegration.executionRequest && props.currentIntegration.executionRequest.batchInfo){
        if(props.currentIntegration.selectedModuleType === 'normalExecution')
            for (let info of props.currentIntegration.executionRequest.batchInfo) {
                for(let suite of info.suiteDetails) 
                    dataParametersCollection.push({
                        scenarioId: suite.scenarioId,
                        name: suite.scenarioName,
                        dataparam: suite.dataparam[0],
                        condition: suite.condition
                    })
            }
        else if(props.currentIntegration.selectedModuleType === 'batchExecution')
            for (let info of props.currentIntegration.executionRequest.batchInfo) {
                for(let suite in info.suiteDetails) 
                    dataParametersCollection.push({
                        scenarioId: info.batchname+info.testsuiteId+info.suiteDetails[suite].scenarioId,
                        name: info.suiteDetails[suite].scenarioName,
                        dataparam: info.suiteDetails[suite].dataparam[0],
                        condition: info.suiteDetails[suite].condition
                    });
            }
        else
            for (let info of props.currentIntegration.executionRequest.batchInfo) {
                for(let suite in info.suiteDetails)
                    dataParametersCollection.push({
                        scenarioId: info.batchname+info.testsuiteId+suite+info.suiteDetails[suite].scenarioId,
                        name: info.suiteDetails[suite].scenarioName,
                        dataparam: info.suiteDetails[suite].dataparam[0],
                        condition: info.suiteDetails[suite].condition
                    });
            }
    }
    const [integrationConfig, setIntegrationConfig] = useState({
        ...props.currentIntegration,
        dataParameters: dataParametersCollection
    });
    const [icepoollist, setIcepoollist] = useState([
        { key: 'cicdanyagentcanbeselected', text: 'Any Agent' },
    ]);
    const [browserlist, setBrowserlist] = useState([
        {
            key: '3',
            text: 'Internet Explorer'
        },{
            key: '1',
            text: 'Google Chrome'
        },{
            key: '2',
            text: 'Mozilla Firefox'
        },{
            key: '7',
            text: 'Microsoft Edge'
        },{
            key: '8',
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
    const [selectedExecutionType, setSelectedExecutionType] = useState(props.currentIntegration.selectedModuleType);
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
            if(gridAgentList.error) {
                if(gridAgentList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(gridAgentList.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching PoolsList",VARIANT.ERROR));
                }
            }else {
                setIcepoollist([
                    { key: 'cicdanyagentcanbeselected', text: 'Any Agent' },
                    ...gridAgentList.avoagents.filter((agent) => agent.status === 'active').map((agent) => ({key: 'a_'+agent.Hostname, text: agent.Hostname})),
                    ...gridAgentList.avogrids.map((grid) => ({key: 'g_'+grid._id, text: grid.name}))
                ]);
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
                    const projSetDetails = props.currentIntegration.executionRequest.batchInfo[0];
                    // proj
                    newSelectValues[0]['selected'] = projSetDetails.projectId;
                    newSelectValues[0]['selectedName'] = projSetDetails.projectName;

                    // rel
                    newSelectValues[1]['disabled'] = false;
                    newSelectValues[1]['list'] = newDict[projSetDetails.projectId].relList;
                    newSelectValues[1]['selected'] = projSetDetails.releaseId;
                    newSelectValues[1]['selectedName'] = projSetDetails.releaseId;

                    //cyc
                    newSelectValues[2]['disabled'] = false;
                    newSelectValues[2]['list'] = newDict[projSetDetails.projectId].relDict[projSetDetails.releaseId].cycList;
                    newSelectValues[2]['selected'] = projSetDetails.cycleId;
                    newSelectValues[2]['selectedName'] = projSetDetails.cycleName;

                    const projId = newSelectValues[0]['selected'];
                    const relName = newSelectValues[1]['selected'];
                    const cycId = newSelectValues[2]['selected'];
                }
                setDict(newDict);
                setIntegrationConfig({...integrationConfig, selectValues: newSelectValues});
            }
            props.currentIntegration && props.currentIntegration.executionRequest && setIntegrationConfig({...integrationConfig, avoAgentGrid: (props.currentIntegration.executionRequest.avogridId === "") ? ((props.currentIntegration.executionRequest.avoagents.length > 0) ? 'a_'+props.currentIntegration.executionRequest.avoagents[0] : 'cicdanyagentcanbeselected') : 'g_'+props.currentIntegration.executionRequest.avogridId});
            props.setLoading(false);
        })()
    }, []);
    useEffect(()=> {
        let isUpdated = false;
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
    const getScenarioParams = (scenarioId) => {
        let data = {
            dataparam: '',
            condition: 0
        };
        for(let scenario of integrationConfig.dataParameters) {
            if(scenario.scenarioId === scenarioId) data = scenario;
        }
        return data;
    }
    const handleConfigSave = async () => {
        if(integrationConfig.name === ''){
            setError({
                ...error,
                name: 'Please Enter Configuration Name'
            });
            return;
        }
        if(integrationConfig.browsers.length < 1) {
            setMsg(MSG.CUSTOM("Please Select atleast one Browser",VARIANT.ERROR));
            return;
        }
        if(props.currentIntegration.selectValues[2].selected === '') {
            setMsg(MSG.CUSTOM("Please Select Project/Release/Cycle",VARIANT.ERROR));
            return;
        }
        let batchInfo = [];
        if(selectedExecutionType === 'normalExecution')
            batchInfo = moduleScenarioList[selectedExecutionType].filter((module) => {
                    return module.scenarios.some(scenario => {
                        return integrationConfig.scenarioList.includes(scenario._id)
                    });
                }).map((module) => {
                    return({
                        scenarioTaskType: "disable",
                        testsuiteName: module.name,
                        testsuiteId: module.moduleid,
                        batchname: "",
                        versionNumber: 0,
                        appType: "Web",
                        domainName: "Banking",
                        projectName: integrationConfig.selectValues[0].selectedName,
                        projectId: integrationConfig.selectValues[0].selected,
                        releaseId: integrationConfig.selectValues[1].selected,
                        cycleName: integrationConfig.selectValues[2].selectedName,
                        cycleId: integrationConfig.selectValues[2].selected,
                        suiteDetails: module.scenarios.filter((scenario) => integrationConfig.scenarioList.includes(scenario._id)).map((scenario) => ({
                            condition: getScenarioParams(scenario._id).condition,
                            dataparam: [getScenarioParams(scenario._id).dataparam],
                            scenarioName: scenario.name,
                            scenarioId: scenario._id,
                            accessibilityParameters: []
                        }))
                    });
                });
        else if(selectedExecutionType === 'e2eExecution')
            batchInfo = moduleScenarioList[selectedExecutionType].filter((module) => {
                    return module.scenarios.some((scenario, index) => {
                        return integrationConfig.scenarioList.includes(module.batchname+module.moduleid+index+scenario._id)
                    });
                }).map((module) => {
                    return({
                        scenarioTaskType: "disable",
                        testsuiteName: module.name,
                        testsuiteId: module.moduleid,
                        batchname: "",
                        versionNumber: 0,
                        appType: "Web",
                        domainName: "Banking",
                        projectName: integrationConfig.selectValues[0].selectedName,
                        projectId: integrationConfig.selectValues[0].selected,
                        releaseId: integrationConfig.selectValues[1].selected,
                        cycleName: integrationConfig.selectValues[2].selectedName,
                        cycleId: integrationConfig.selectValues[2].selected,
                        suiteDetails: module.scenarios.filter((scenario, index) => integrationConfig.scenarioList.includes(module.batchname+module.moduleid+index+scenario._id)).map((scenario, index) => ({
                            condition: getScenarioParams(module.batchname+module.moduleid+index+scenario._id).condition,
                            dataparam: [getScenarioParams(module.batchname+module.moduleid+index+scenario._id).dataparam],
                            scenarioName: scenario.name,
                            scenarioId: scenario._id,
                            accessibilityParameters: []
                        }))
                    });
                });
        else
            for (let batchModules in moduleScenarioList['batchExecution'])
                batchInfo.push(...moduleScenarioList['batchExecution'][batchModules].filter((module) => {
                    return module.scenarios.some((scenario, index) => {
                        return integrationConfig.scenarioList.includes(module.batchname+module.moduleid+index+scenario._id)
                    });
                }).map((module) => {
                    return({
                        scenarioTaskType: "disable",
                        testsuiteName: module.name,
                        testsuiteId: module.moduleid,
                        batchname: module.batchname,
                        versionNumber: 0,
                        appType: "Web",
                        domainName: "Banking",
                        projectName: integrationConfig.selectValues[0].selectedName,
                        projectId: integrationConfig.selectValues[0].selected,
                        releaseId: integrationConfig.selectValues[1].selected,
                        cycleName: integrationConfig.selectValues[2].selectedName,
                        cycleId: integrationConfig.selectValues[2].selected,
                        suiteDetails: module.scenarios.map((scenario, index) => ({
                            condition: getScenarioParams(module.batchname+module.moduleid+index+scenario._id).condition,
                            dataparam: [getScenarioParams(module.batchname+module.moduleid+index+scenario._id).dataparam],
                            scenarioName: scenario.name,
                            scenarioId: scenario._id,
                            accessibilityParameters: []
                        })).filter((scenario, index) => integrationConfig.scenarioList.includes(module.batchname+module.moduleid+index+scenario.scenarioId))
                    });
                }));
        if(batchInfo.length < 1) {
            setMsg(MSG.CUSTOM("Please Select atleast one Scenario",VARIANT.ERROR));
            return;
        }
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
            selectedModuleType: selectedExecutionType,
            configurekey: integrationConfig.key,
            isHeadless: integrationConfig.isHeadless,
            avogridId: (integrationConfig.avoAgentGrid && integrationConfig.avoAgentGrid !== '' && integrationConfig.avoAgentGrid !== "cicdanyagentcanbeselected" && integrationConfig.avoAgentGrid.slice(0,2) === 'g_') ? integrationConfig.avoAgentGrid.slice(2) : '',
            avoagents: (integrationConfig.avoAgentGrid && integrationConfig.avoAgentGrid !== '' && integrationConfig.avoAgentGrid !== "cicdanyagentcanbeselected" && integrationConfig.avoAgentGrid.slice(0,2) === 'a_') ? [integrationConfig.avoAgentGrid.slice(2)] : [],
            integration: integration,
            batchInfo: batchInfo,
            donotexe: integrationConfig.notexe,
            scenarioFlag: false
        });
        if(storeConfig !== 'success') {
            if(storeConfig && storeConfig.error && storeConfig.error.CONTENT) {
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
                    <TextField value={integrationConfig.name} width='150%' label="" standard={true} onChange={(event) => setIntegrationConfig({...integrationConfig, name: event.target.value})} autoComplete="off" placeholder="Enter Configuration Name"
                        errorMessage={(integrationConfig.name === '' && error.name && error.name !== '') ?  error.name : null}
                    />
                </span>
            </div>
        </div>
        <div>
        {
            integrationConfig.selectValues && integrationConfig.selectValues.length > 0  && <ReleaseCycleSelection selectValues={integrationConfig.selectValues} handleSelect={handleNewSelect} isEditing={props.currentIntegration.name !== ''} />
        }
        </div>
        {
            <div style={{ display: 'flex', justifyContent:'space-between' }}>
                <div className="devOps_module_list">
                    <DevOpsModuleList setLoading={props.setLoading} integrationConfig={integrationConfig} setIntegrationConfig={setIntegrationConfig} moduleScenarioList={moduleScenarioList} setModuleScenarioList={setModuleScenarioList} selectedExecutionType={selectedExecutionType} setSelectedExecutionType={setSelectedExecutionType} isEditing={props.currentIntegration.name !== ''} />
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
                            <Toggle checked={integrationConfig.isHeadless} onChange={() => setIntegrationConfig({...integrationConfig, isHeadless: !integrationConfig.isHeadless })} label="" inlineLabel={true} />
                            <label>Headless </label>
                        </div>
                    </div>
                    <div className='devOps_seperation'>
                    </div>
                    <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_url">DevOps Integration API url : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={props.url} id='api-url' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/execAutomation' />
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
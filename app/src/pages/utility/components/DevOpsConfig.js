import React, { useEffect, useState, useRef} from 'react';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, IntegrationDropDown } from '../../global';
import { fetchProjects, fetchAvoAgentAndAvoGridList, storeConfigureKey } from '../api';
import { SearchDropdown, TextField, Toggle, MultiSelectDropdown } from '@avo/designcomponents';

import ReactTooltip from 'react-tooltip';
// import classes from "../styles/DevOps.scss";
import "../styles/DevOps.scss";
// import ReleaseCycleSelection from './ReleaseCycleSelection';
import { prepareOptionLists } from './DevOpsUtils';
import DevOpsModuleList from './DevOpsModuleList';

const DevOpsConfig = props => {
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [dataDict, setDict] = useState({});
    const dataParametersCollection = [];
    const [error, setError] = useState({});
    const[initialFilteredModuleList,setinitialFilteredModuleList]=useState(null);
    const [showSelectBrowser, setShowSelectBrowser] = useState(false);
    const [text, setText] = useState(props.currentIntegration.name);
    const notexe = useRef(
        props.currentIntegration.executionRequest != undefined ? props.currentIntegration.executionRequest.donotexe.current : {}
        );
    useEffect(() => {
        props.projectIdTypesDicts[props.currentIntegration.selectValues[0].selected] === "Web" ? setShowSelectBrowser(true) : setShowSelectBrowser(false)
    }, [props.currentIntegration.selectValues[0].selected])

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
    const [moduleState, setModuleState] = useState({
        checked: props.currentIntegration.scenarioList,
        expanded: []
    });
    const [moduleList, setModuleList] = useState([]);
    const [filteredModuleList, setFilteredModuleList] = useState([]);
    const handleExecutionTypeChange = (selectedType) => {
        notexe['current'] = {}
        const selectedKey = selectedType;
        let filteredNodes = [];
        if(selectedKey === 'normalExecution') {
            filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length) > 0 } ).map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                        event.preventDefault();
                        onClick('displayMaximizable');
                        onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
                };
                if(module.scenarios && module.scenarios.length > 0) {
                    const moduleChildren = module.scenarios.map((scenario) => {
                        return ({
                            value: scenario._id,
                            label: scenario.name
                        })
                    });
                    filterModule['children'] = moduleChildren;
                }
                return filterModule;
            });
        } else if(selectedKey === 'e2eExecution') {
            filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length) > 0 } ).map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label:<div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                        event.preventDefault();
                        onClick('displayMaximizable');
                        onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
                };
                if(module.scenarios && module.scenarios.length > 0) {
                    const moduleChildren = module.scenarios.map((scenario, index) => {
                        return ({
                            value: module.batchname+module.moduleid+index+scenario._id,
                            label: scenario.name
                        })
                    });
                    filterModule['children'] = moduleChildren;
                }
                return filterModule;
            });
        }
        else if(selectedKey === 'batchExecution') {
            const batchData = moduleScenarioList['batchExecution'];
            filteredNodes = Object.keys(batchData).map((batch) => {
                let filterBatch = {
                    value: batch,
                    label: batch,
                };
                if(batchData[batch].length > 0) {
                    filterBatch['children'] = batchData[batch].filter((module) => { return (module.scenarios && module.scenarios.length) > 0 > 0 } ).map((module) => {
                        let filterModule = {
                            value: module.moduleid,
                            label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                event.preventDefault();
                                onClick('displayMaximizable');
                                onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
                        };
                        if(module.scenarios && module.scenarios.length > 0) {
                            const moduleChildren = module.scenarios.map((scenario, index) => {
                                return ({
                                    value: batch+module.moduleid+index+scenario._id,
                                    label: scenario.name
                                })
                            });
                            filterModule['children'] = moduleChildren;
                        }
                        return filterModule;
                    });
                }
                return filterBatch;
            });
        }
        setSelectedExecutionType(selectedKey);
        setModuleList(filteredNodes);
        setFilteredModuleList(filteredNodes);
        setinitialFilteredModuleList(filteredNodes);
        setModuleState({expanded: [], checked: []});
        setIntegrationConfig({ ...props.currentIntegration, scenarioList: [], dataParameters: [] });
    }
    const [modalContent, setModalContent] = useState(false);
    const onDataParamsIconClick1 = (ModuleId, name) => {
        if(integrationConfig.dataParameters.some((data) => data.Id === ModuleId)) {
            let paramIndex = integrationConfig.dataParameters.findIndex((data) => data.ModuleId === ModuleId);
            setModalContent(integrationConfig.dataParameters[paramIndex]);
        } else {
            setModalContent({
                moduleId: ModuleId,
                name: name,
                dataparam: '',
                condition: 0
            })
        }
    }
    const [icepoollist, setIcepoollist] = useState([
        { key: 'cicdanyagentcanbeselected', text: 'Any Agent' },
    ]);
    const [browserlist, setBrowserlist] = useState([
        // {
        //     key: '3',
        //     text: 'Internet Explorer'
        // }
        {
            key: '1',
            text: 'Google Chrome'
        },{
            key: '2',
            text: 'Mozilla Firefox'
        },{
            key: '7',
            text: 'Microsoft Edge'
        }
        // {
        //     key: '8',
        //     text: 'Edge Chromium'
        // }
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
    const handleConfigSave = async (checkForButton) => {
        if(text === ''){
            setError({
                ...error,
                name: 'Please Enter Profile Name'
            });
            return;
        }
        if(integrationConfig.browsers.length < 1 && props.projectIdTypesDicts[props.currentIntegration.selectValues[0].selected] === "Web") {
            setMsg(MSG.CUSTOM("Please select atleast one Browser",VARIANT.ERROR));
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
                        appType: props.projectIdTypesDicts[props.currentIntegration.selectValues[0].selected],
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
                        batchname: module.batchname,
                        versionNumber: 0,
                        appType: props.projectIdTypesDicts[props.currentIntegration.selectValues[0].selected],
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
                        appType: props.projectIdTypesDicts[props.currentIntegration.selectValues[0].selected],
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
            setMsg(MSG.CUSTOM("Please select atleast one Scenario",VARIANT.ERROR));
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
            configurename: text,
            executiontype: integrationConfig.executionType,
            selectedModuleType: selectedExecutionType,
            configurekey: integrationConfig.key,
            isHeadless: integrationConfig.isHeadless,
            avogridId: (integrationConfig.avoAgentGrid && integrationConfig.avoAgentGrid !== '' && integrationConfig.avoAgentGrid !== "cicdanyagentcanbeselected" && integrationConfig.avoAgentGrid.slice(0,2) === 'g_') ? integrationConfig.avoAgentGrid.slice(2) : '',
            avoagents: (integrationConfig.avoAgentGrid && integrationConfig.avoAgentGrid !== '' && integrationConfig.avoAgentGrid !== "cicdanyagentcanbeselected" && integrationConfig.avoAgentGrid.slice(0,2) === 'a_') ? [integrationConfig.avoAgentGrid.slice(2)] : [],
            integration: integration,
            batchInfo: batchInfo,
            donotexe: checkForButton == '' ? integrationConfig.notexe : integrationConfig.executionRequest.donotexe,
            scenarioFlag: false
        });
        if(storeConfig !== 'success') {
            if(storeConfig && storeConfig.error && storeConfig.error.CONTENT) {
                setMsg(MSG.CUSTOM(storeConfig.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Something Went Wrong",VARIANT.ERROR));
            }
        }else {
            props.showMessageBar( `Execution profile ${(props.currentIntegration.name == '') ? 'Create' : 'Update'}d successfully.` , 'SUCCESS');
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

 const [displayMaximizable, setDisplayMaximizable] = useState(false);
 const [position, setPosition] = useState('center');
    
        const dialogFuncMap = {
        
            'displayMaximizable': setDisplayMaximizable,
           
        }
    
        const onClick = (name, position) => {
            dialogFuncMap[`${name}`](true);
    
            if (position) {
                setPosition(position);
            }
        }
    
        const onHide = (name) => {
            dialogFuncMap[`${name}`](false);
        }
    const HandleTextValue =(value)=>{
    setIntegrationConfig({...integrationConfig, name:value})
    setText(value)
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
                { props.currentIntegration.name === '' ? 'Create' : 'Update'} Execution Profile: {props.currentIntegration.selectValues[0].selectedName}
            </span>
        </div>
        <div className="api-ut__btnGroup">
        <button data-test="submit-button-test" className='submit-button-test_update' onClick={() => handleConfigSave(props.currentIntegration.name)} >{props.currentIntegration.name == '' ? 'Save' : 'Update'}</button>
            <button data-test="submit-button-test " className='submit-button-test_back'  onClick={() => props.setCurrentIntegration(false)} >{dataUpdated ? 'Cancel' : '  Back'}</button>
            {/* <div className="devOps_config_name" style={{marginRight:'101vh'}}>
                <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Profile Name : </span>
                &nbsp;&nbsp;
                <span className="api-ut__inputLabel">
                    <TextField value={integrationConfig.name} width='150%' label="" standard={true} onChange={(event) => setIntegrationConfig({...integrationConfig, name: event.target.value})} autoComplete="off" placeholder="Enter Profile Name"
                        errorMessage={(integrationConfig.name === '' && error.name && error.name !== '') ?  error.name : null}
                    />
                </span>
            </div> */}
        </div>
         <div className="devOps_config_name devOps_config_name1"  >
                <span className="api-ut__inputLabel inputLabel1" >Profile Name : </span>
                &nbsp;&nbsp;
                <span className="api-ut__inputLabel">
                    <TextField value={text} width='150%' label="" standard={true} onChange={(event) => HandleTextValue(event.target.value)} autoComplete="off" placeholder="Enter Profile Name"
                        errorMessage={(text === '' && error.name && error.name !== '') ?  error.name : null}
                    />
                </span>
            </div>
            <div className="radiobutton_config" > 
                        <input type='radio' id='Normal' className='radioinputs' data-for="Normal" data-tip="Click here to execute Normal modules"  value='normalExecution' disabled={props.currentIntegration.disable} onChange={()=>handleExecutionTypeChange('normalExecution')}  selectedKey={selectedExecutionType} checked={selectedExecutionType === 'normalExecution'}/><p data-for="Normal" data-tip=" Click here to select Normal module(s)"   className='radioinputsP'>&nbsp;Normal module(s)</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<ReactTooltip id="Normal" effect="solid" backgroundColor="black" />
                        <input type='radio' id='Batch' className='radioinputs' data-for="Batch" data-tip="Click here to execute Batch of modules" value='batchExecution' disabled ={props.currentIntegration.disable} onChange={()=>handleExecutionTypeChange('batchExecution')}  selectedKey={selectedExecutionType} checked={selectedExecutionType === 'batchExecution'}/><p data-for="Batch" data-tip="Click here to select batch module(s)"  className='radioinputsP'>&nbsp;Batch module(s)&nbsp;&nbsp;&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<ReactTooltip id="Batch" effect="solid" backgroundColor="black" />
                        <input type='radio' id="E2E" className='radioinputs' data-for="E2E" data-tip="Click here to execute end to end flows" value='e2eExecution' disabled ={props.currentIntegration.disable} onChange={() => handleExecutionTypeChange('e2eExecution')} selectedKey={selectedExecutionType} checked={selectedExecutionType === 'e2eExecution'}/><p  data-for="E2E" data-tip=" Click here to select E2E flows"  className='radioinputsP'>&nbsp;E2E Flow&nbsp;&nbsp;&nbsp;&nbsp;</p><ReactTooltip id="E2E" effect="solid" backgroundColor="black" />
                    </div> 
        {/* <div>
        {
            integrationConfig.selectValues && integrationConfig.selectValues.length > 0  && <ReleaseCycleSelection selectValues={integrationConfig.selectValues} handleSelect={handleNewSelect} isEditing={props.currentIntegration.name !== ''} />
        }
        </div> */}
        {
            <div className="devOps_module_list_div" >
                <div className="devOps_module_list">
                    <DevOpsModuleList setLoading={props.setLoading} integrationConfig={integrationConfig} setIntegrationConfig={setIntegrationConfig} moduleScenarioList={moduleScenarioList} setModuleScenarioList={setModuleScenarioList} selectedExecutionType={selectedExecutionType} setSelectedExecutionType={setSelectedExecutionType} handleExecutionTypeChange={handleExecutionTypeChange} filteredModuleList={filteredModuleList} setFilteredModuleList={setFilteredModuleList} onDataParamsIconClick1={onDataParamsIconClick1} setModalContent ={setModalContent} modalContent={modalContent} setBrowserlist={setBrowserlist} onClick={onClick} onHide={onHide} displayMaximizable={displayMaximizable} showSelectBrowser={showSelectBrowser} showSelectedBrowserType={props.currentIntegration.selectedBrowserType} notexe={notexe} moduleList={moduleList} setModuleList={setModuleList} initialFilteredModuleList={initialFilteredModuleList} setinitialFilteredModuleList={setinitialFilteredModuleList} />
                </div>
                <div className="devOps_pool_list">
                    <div>
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
                    { (props.currentIntegration.selectedBrowserType || showSelectBrowser) && <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_browser">Browsers : </label>
                        <MultiSelectDropdown
                            hideSelectAll
                            noItemsText={'No Browser available'}
                            onSelectKeysChange={(selectedBrowsers) => setIntegrationConfig({...integrationConfig, browsers: selectedBrowsers})}
                            options={browserlist}
                            placeholder="Select"
                            searchPlaceholder="Search"
                            selectedKeys={integrationConfig.browsers}
                            width='53.5%'
                            />
                    </div> }
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
                    {/* <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Asynchronous </label>
                            <Toggle checked={integrationConfig.executionType == 'synchronous'} onChange={() => setIntegrationConfig({...integrationConfig, executionType: (integrationConfig.executionType === 'synchronous') ? 'asynchronous' : 'synchronous' })} label="" inlineLabel={true} />
                            <label>Synchronous </label>
                        </div>
                    </div> */}
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution_mode">Execution Mode : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Non-Headless </label>
                            <Toggle checked={integrationConfig.isHeadless} onChange={() => setIntegrationConfig({...integrationConfig, isHeadless: !integrationConfig.isHeadless })} label="" inlineLabel={true} />
                            <label>Headless </label>
                        </div>
                    </div>
                    {/* <div className='devOps_seperation'>
                    </div> */}
                    {/* <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_url">DevOps Integration API url : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={props.url} id='api-url' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/execAutomation' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div> */}
                    {/* <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_key">Configuration Key : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={integrationConfig.key} id='devops-key' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='Configuration Key' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('devops-key') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div> */}
                </div>
            </div>
        }
    </>);
}


export default DevOpsConfig;
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ScreenOverlay } from '../../global';
import { CheckBox, SearchDropdown, Tab, NormalDropDown, TextField, SearchBox } from '@avo/designcomponents';
import { fetchModules } from '../api';
import { Icon } from '@fluentui/react';
import "../../execute/styles/ExecuteTable.scss";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
// import { getTestsuiteByScenarioId } from '../../admin/api';
import MultiSelectDropDown from '../../execute/components/MultiSelectDropDown';
// import * as DesignApi from "../../design/api";
// import { RedirectPage } from '../../global';
import index from 'uuid-random';
import { readTestSuite_ICE } from '../../mindmap/api';
import { updateTestSuite_ICE } from '../../execute/api';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { text } from 'body-parser';
// import ExecuteContent from '../../execute/containers/ExecuteContent';
const DevOpsModuleList = ({ integrationConfig, setIntegrationConfig,filteredModuleList,setFilteredModuleList, moduleScenarioList, setModuleScenarioList, selectedExecutionType, setSelectedExecutionType, setLoading, onDataParamsIconClick1, setModalContent, modalContent, setBrowserlist,onClick, onHide,displayMaximizable }) => {
    const [moduleList, setModuleList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [moduleIds, setModuleIds] = useState();
    const [accessibilityParameters, setAccessibilityParameters] = useState([]);
    const [scenarioName, setScenarioName] = useState([]);
    const [dataParameter, setDataParameter] = useState([]);
    const [condition, setCondition] = useState([]);
    const [testSuiteIds, setTestSuiteId] = useState([]);
    // const [filteredList, setFilteredList] = useState(filteredModuleList);
    const [doNotExecute, setDoNotExecuteArr] = useState([]);
    const [scenarioIds, setScenarioIds] = useState([]);
    const [testSuiteName, setTestSuiteName] = useState();
    const[initialFilteredModuleList,setinitialFilteredModuleList]=useState(null);
   
    // const [filteredModuleList, setFilteredModuleList] = useState([]);
    const indeterminateStyle = {
        root: {
            '&[class ~= is-enabled]': {
                '.ms-Checkbox-checkbox': {
                    backgroundColor: '#613191',
                    ':hover': {
                        boxShadow: '0px 0.3px 0.9px rgba(0, 0, 0, 0.4), 0px 1.6px 3.6px rgba(0, 0, 0, 0.4)'
                    },
                    borderColor: '#613191',
                    content: 'url("static/imgs/partial-check-white.svg")',
                    padding: '15%'
                }
            }
        },
        checkbox: {
            borderWidth: '2px',
            borderRadius: '.1875rem',
            height: '14px',
            width: '14px'
        },
        checkmark: {
            width: '25%'
        }
    };
    const icons = {
        check: <img src="static/imgs/Checkbox-checked.png" alt="Checkbox-Checked"/>,
        uncheck: <img src="static/imgs/Checkbox-unchecked.png" alt="Checkbox-Unchecked"/>,
        halfCheck: <img src="static/imgs/Checkbox-intermediate.png" alt="Checkbox-Intermediate"/>,
        expandClose: <Icon iconName='chevron-down' styles={{root:{transform: "rotate(-90deg)"}}}/>,
        expandOpen: <Icon iconName='chevron-down' />,
        parentOpen: <></>,
        parentClose: <></>,
        leaf: <></>
    }
    const options = [
        {
            key: 'all',
            text: 'All'
        },
        {
            key: 'selected',
            text: 'Selected'
        },
        {
            key: 'unselected',
            text: 'Unselected'
        }
    ];
    const executionTypeOptions = [
        {
            key: 'normalExecution',
            text: 'Normal Execution'
        },
        {
            key: 'batchExecution',
            text: 'Batch Execution'
        },
        {
            key: 'e2eExecution',
            text: 'E2E Execution'
        }
    ];
    const [selectedTab, setSelectedTab] = useState('all');
    const [moduleState, setModuleState] = useState({
        checked: integrationConfig.scenarioList,
        expanded: []
    });
    const HandleTabChange = (tab) => {
        const key = tab.props.itemKey;
        if(key === 'all') setFilteredModuleList(moduleList);
        else if(key === 'selected'){
            let newFilteredList = [];
            if (selectedExecutionType === 'normalExecution' || selectedExecutionType === 'e2eExecution') {
                newFilteredList = moduleList.filter( (element) => {
                    let children = element.children.filter( (scenario) => {
                        return integrationConfig.scenarioList.includes(scenario.value)
                    });
                    return children.length > 0;
                }).map ( (element) => {
                    let children = element.children.filter( (scenario) => {
                        return integrationConfig.scenarioList.includes(scenario.value)
                    });
                    return ({
                        ...element,
                        children: children
                    });
                });
            } else if (selectedExecutionType === 'batchExecution') {
                newFilteredList = moduleList.filter((batch) => {
                    return batch.children.some((module) => {
                        return module.children.some((scenario) => {
                            return integrationConfig.scenarioList.includes(scenario.value)
                        });
                    })
                }).map ( (element) => {
                    let batchChildren = element.children.filter( (module) => {
                        return module.children.some( (scenario) => {
                            return integrationConfig.scenarioList.includes(scenario.value)
                        });
                    }).map( (module) => {
                        let children = module.children.filter( (scenario) => {
                            return integrationConfig.scenarioList.includes(scenario.value)
                        });
                        return ({
                            ...module,
                            children: children
                        });
                    });
                    return ({
                        ...element,
                        children: batchChildren
                    });
                });
            }
            setFilteredModuleList(newFilteredList);
        }
        else if(key === 'unselected') {
            let newFilteredList = [];
            if (selectedExecutionType === 'normalExecution' || selectedExecutionType === 'e2eExecution') {
                newFilteredList = moduleList.filter( (element) => {
                    let children = element.children.filter( (scenario) => {
                        return !integrationConfig.scenarioList.includes(scenario.value)
                    });
                    return children.length > 0;
                }).map ( (element) => {
                    let children = element.children.filter( (scenario) => {
                        return !integrationConfig.scenarioList.includes(scenario.value)
                    });
                    return ({
                        ...element,
                        children: children
                    });
                });
            } else if (selectedExecutionType === 'batchExecution') {
                newFilteredList = moduleList.filter((batch) => {
                    return batch.children.some((module) => {
                        return module.children.some((scenario) => {
                            return !integrationConfig.scenarioList.includes(scenario.value)
                        });
                    })
                }).map ( (element) => {
                    let batchChildren = element.children.filter( (module) => {
                        return module.children.some( (scenario) => {
                            return !integrationConfig.scenarioList.includes(scenario.value)
                        });
                    }).map( (module) => {
                        let children = module.children.filter( (scenario) => {
                            return !integrationConfig.scenarioList.includes(scenario.value)
                        });
                        return ({
                            ...module,
                            children: children
                        });
                    });
                    return ({
                        ...element,
                        children: batchChildren
                    });
                });
            }
            setFilteredModuleList(newFilteredList);
        }
        setSelectedTab(key);
    }
    const HandleTreeChange = (checked) => {
        if(selectedTab === 'all') setIntegrationConfig({ ...integrationConfig, scenarioList: checked });
        else if(selectedTab === 'selected') setIntegrationConfig({ ...integrationConfig, scenarioList: checked });
        else if(selectedTab === 'unselected') {
            setIntegrationConfig({ ...integrationConfig, scenarioList: [...integrationConfig.scenarioList, ...checked] });
            setModuleState({...moduleState, checked: [...integrationConfig.scenarioList, ...checked]});
            return;
        }
        setModuleState({...moduleState, checked: checked});
    }
    useEffect(()=>{
        (async() => {
            if (integrationConfig.selectValues[2].selected !== '') {
                setLoading('Please Wait...');
                const fetchedModuleList = await fetchModules({
                    "tab":'tabAssign',
                    "projectid":integrationConfig.selectValues[0].selected,
                    "cycleid":integrationConfig.selectValues[2].selected
                });
                if(fetchedModuleList.error) {
                    setMsg(MSG.CUSTOM("Error While Fetching Module List",VARIANT.ERROR));
                }else {
                    // <Icon iconName='input' />
                    let filteredNodes = [];
                    if(selectedExecutionType === 'normalExecution') {
                        filteredNodes = fetchedModuleList[selectedExecutionType].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                            let filterModule = {
                                value: module.moduleid,
                                label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                    event.preventDefault();
                                    onClick('displayMaximizable');
                                    onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
                            };
                            // console.log(module)
                            if(module.scenarios && module.scenarios.length > 0) {
                                const moduleChildren = module.scenarios.map((scenario) => {
                                    return ({
                                        value: scenario._id,
                                        // label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                        //     event.preventDefault();
                                        //     onDataParamsIconClick(scenario._id, scenario.name)}}/></div>
                                    })
                                });
                                filterModule['children'] = moduleChildren;
                            }
                            return filterModule;
                        });
                    } else if(selectedExecutionType === 'batchExecution') {
                        let flagCheckToUpdateNodeKey = false;
                        let newScenarioList = integrationConfig.scenarioList;
                        let newDataParams = integrationConfig.dataParameters;
                        const batchData = fetchedModuleList['batchExecution'];
                        filteredNodes = Object.keys(batchData).map((batch) => {
                            let filterBatch = {
                                value: batch,
                                label: batch,
                            };
                            if(batchData[batch].length > 0) {
                                filterBatch['children'] = batchData[batch].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                                    let filterModule = {  
                                        value: module.moduleid,
                                        label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                            event.preventDefault();
                                            onClick('displayMaximizable');
                                            onDataParamsIconClick1(batch+module.moduleid, module.name)}}/></div>
                                    };
                                    if(module.scenarios && module.scenarios.length > 0) {
                                        const moduleChildren = module.scenarios.map((scenario, index) => {
                                            if(newScenarioList.includes(batch+module.moduleid+scenario._id)) {
                                                flagCheckToUpdateNodeKey = true;
                                                const updateIndex = newScenarioList.indexOf(batch+module.moduleid+scenario._id);
                                                newScenarioList[updateIndex] = batch+module.moduleid+index+scenario._id;
                                                console.log('newScenarioList');
                                            }
                                            if(newDataParams.findIndex((param) => param.scenarioId === batch+module.moduleid+scenario._id) > -1) {
                                                flagCheckToUpdateNodeKey = true;
                                                const updateParamIndex = newDataParams.findIndex((param) => param.scenarioId === batch+module.moduleid+scenario._id);
                                                newDataParams[updateParamIndex].scenarioId = batch+module.moduleid+index+scenario._id;
                                                console.log('newDataParams');
                                            }
                                            return ({
                                                value: batch+module.moduleid+index+scenario._id,
                                                // label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                                //     event.preventDefault();
                                                //     onDataParamsIconClick(batch+module.moduleid+index+scenario._id, scenario.name)}}/></div>
                                            })
                                        });
                                        filterModule['children'] = moduleChildren;
                                    }
                                    return filterModule;
                                });
                            }
                            return filterBatch;
                        });
                        if(flagCheckToUpdateNodeKey) {
                            setIntegrationConfig({...integrationConfig, scenarioList: newScenarioList, dataParameters: newDataParams});
                        }
                    } else if(selectedExecutionType === 'e2eExecution') {
                        filteredNodes = fetchedModuleList[selectedExecutionType].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                            let filterModule = {
                                value: module.moduleid,
                                label:<div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                    event.preventDefault();
                                    onClick('displayMaximizable');
                                    onDataParamsIconClick1(module.batchname+module.moduleid, module.name)}}/></div>
                            };
                            if(module.scenarios && module.scenarios.length > 0) {
                                const moduleChildren = module.scenarios.map((scenario, index) => {
                                    return ({
                                        value: module.batchname+module.moduleid+index+scenario._id,
                                        // label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                        //     event.preventDefault();
                                        //     onDataParamsIconClick(module.batchname+module.moduleid+index+scenario._id, scenario.name)}}/></div>
                                    })
                                });
                                filterModule['children'] = moduleChildren;
                            }
                            return filterModule;
                        });
                    }
                    setModuleList(filteredNodes);
                    setFilteredModuleList(filteredNodes);
                    setinitialFilteredModuleList(filteredNodes);
                    setModuleScenarioList(fetchedModuleList);
                }
                setLoading(false);
            }
            if(modalContent){
            var payload = [{
                "releaseid": integrationConfig.selectValues[1].selected,
                "cycleid": integrationConfig.selectValues[2].selected,
                "testsuiteid": modalContent.moduleId,
                "testsuitename": modalContent.name,
                "projectidts": integrationConfig.selectValues[0].selected
                }]
                // console.log(modalContent.moduleId)
                // setModuleIds(modalContent.moduleId)
                const testSuiteData1 = await readTestSuite_ICE(payload)
                // console.log(Object.values(testSuiteData1)[0])
                const testSuiteData = Object.values(testSuiteData1)[0];
                setModuleIds(testSuiteData.testsuiteid)
                setTestSuiteName(testSuiteData.testsuitename)
                let scenarioNameArr = [], dataParameterArr = [], conditionArr = [], testSuiteIdArr = [], doNotExecuteArr = [], scenarioIdArr = []
                for (let i=0;i<testSuiteData.scenarioids.length;i++)
                {
                    scenarioNameArr.push(testSuiteData.scenarionames[i])
                    dataParameterArr.push(testSuiteData.dataparam[i])
                    conditionArr.push(testSuiteData.condition[i])
                    doNotExecuteArr.push(testSuiteData.executestatus[i])
                    scenarioIdArr.push(testSuiteData.scenarioids[i])
                }
                setScenarioName(scenarioNameArr)
                setDataParameter(dataParameterArr)
                setCondition(conditionArr)
                setTestSuiteId(testSuiteIdArr)
                setDoNotExecuteArr(doNotExecuteArr)
                setScenarioIds(scenarioIdArr)
            } 
        })()
    },[integrationConfig.selectValues[2].selected, modalContent]);
   

   const handleSearchChange = (value) => {
       let filteredItems = filteredModuleList.filter(element=>element.label.props.children[0].includes(value))
    //    console.log(filteredItems)
       // setFilteredList(filteredItems);
       setFilteredModuleList(filteredItems)
       setSearchText(value);

   }
    // const [scenario, setScenario] = useState(false);
    // },[integrationConfig.selectValues[2].selected]);
    const handleExecutionTypeChange = (selectedType) => {
        const selectedKey = selectedType.key;
        let filteredNodes = [];
        if(selectedKey === 'normalExecution') {
            filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label: module.name,
                };
                if(module.scenarios && module.scenarios.length > 0) {
                    const moduleChildren = module.scenarios.map((scenario) => {
                        return ({
                            value: scenario._id,
                            label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                event.preventDefault();
                                onDataParamsIconClick(scenario._id, scenario.name)}}/></div>
                        })
                    });
                    filterModule['children'] = moduleChildren;
                }
                return filterModule;
            });
        } else if(selectedKey === 'e2eExecution') {
            filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label: module.name,
                };
                if(module.scenarios && module.scenarios.length > 0) {
                    const moduleChildren = module.scenarios.map((scenario, index) => {
                        return ({
                            value: module.batchname+module.moduleid+index+scenario._id,
                            label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                event.preventDefault();
                                onDataParamsIconClick(module.batchname+module.moduleid+index+scenario._id, scenario.name)}}/></div>
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
                    filterBatch['children'] = batchData[batch].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                        let filterModule = {
                            value: module.moduleid,
                            label: module.name,
                        };
                        if(module.scenarios && module.scenarios.length > 0) {
                            const moduleChildren = module.scenarios.map((scenario, index) => {
                                return ({
                                    value: batch+module.moduleid+index+scenario._id,
                                    label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
                                        event.preventDefault();
                                        onDataParamsIconClick(batch+module.moduleid+index+scenario._id, scenario.name)}}/></div>
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
        setModuleState({expanded: [], checked: []});
        setIntegrationConfig({ ...integrationConfig, scenarioList: [], dataParameters: [] });
    }
    // const [modalContent, setModalContent] = useState(false);
    const onDataParamsIconClick = (scenarioId, name) => {
        if(integrationConfig.dataParameters.some((data) => data.scenarioId === scenarioId)) {
            let paramIndex = integrationConfig.dataParameters.findIndex((data) => data.scenarioId === scenarioId);
            setModalContent(integrationConfig.dataParameters[paramIndex]);
        } else {
            setScenario({
                scenarioId: scenarioId,
                name: name,
                dataparam: '',
                condition: 0
            })
        }
    }

   
    
    const renderFooter = (name) => {
            return (
                <div>
                    <Button label="Cancel"  onClick={() => onHide(name)} className="p-button-text" />
                    <Button label="Save"  onClick={async () => {const payload =  [{
                                "testsuiteid": moduleIds,
                                "testsuitename": testSuiteName,
                                "testscenarioids": scenarioIds,
                                "getparampaths": dataParameter,
                                "conditioncheck": condition,
                                "donotexecute": doNotExecute
                            }]
                            // console.log(payload)
                        await updateTestSuite_ICE(payload);
                        // let updatedParamCollection = integrationConfig.dataParameters;
                        // let paramIndex = updatedParamCollection.findIndex((data) => data.scenarioId === scenario.scenarioId);
                        //     if(paramIndex > -1){
                        //         updatedParamCollection[paramIndex] = scenario;
                        //         setIntegrationConfig({ ...integrationConfig, dataParameters: updatedParamCollection });
                        //     } else {
                        //             let newDataParameterArray = updatedParamCollection;
                        //             newDataParameterArray.push(scenario);
                        //         setIntegrationConfig({ ...integrationConfig, dataParameters: newDataParameterArray });
                        //     }
                        integrationConfig.dataParameters = dataParameter;
                        integrationConfig.condition = condition;
                        integrationConfig.scenarioList = scenarioIds;
                        setIntegrationConfig({...integrationConfig})
                        onHide(name)}} autoFocus />
                </div>
            );
        }

    return (
        <>

            {/* <Dialog
                hidden = {modalContent === false}
                onDismiss = {() => setModalContent(false)}
                title = {modalContent.name + ` : Execution Parameters`}
                minWidth = '60rem'
                confirmText = 'Save'
                declineText = 'Cancel'
                onDecline={() => setModalContent(false)}
                onConfirm = {async () => {
                    let updatedParamCollection = integrationConfig.dataParameters;
                    // const batchInfo = {"assignedTestScenarioIds": "",
                    //                     "assignedTime": "",
                    //                     "cycleid": "61fb99f03dca644ddfec183f",
                    //                     "projectidts": "61fb99f03dca644ddfec1840",
                    //                     "releaseid": "R3",
                    //                     "subTaskId": "620e10524edee7bbbba18297",
                    //                     "testsuiteid": "620e0ff14edee7bbbba1828d",
                    //                     "testsuitename": "Module_webTest",
                    //                     "versionnumber": 0
                    //                  }
                    // const data = await updateTestSuite_ICE(batchInfo);
                    let paramIndex = updatedParamCollection.findIndex((data) => data.scenarioId === modalContent.scenarioId);
                    if(paramIndex > -1){
                        updatedParamCollection[paramIndex] = modalContent;
                        setIntegrationConfig({ ...integrationConfig, dataParameters: updatedParamCollection });
                    } else {
                        let newDataParameterArray = updatedParamCollection;
                        newDataParameterArray.push(modalContent);
                        setIntegrationConfig({ ...integrationConfig, dataParameters: newDataParameterArray });
                    }
                    setModalContent(false);
                }} >
                    <div style={{ display: 'flex', flexDirection: 'column', height:'auto'}}>
                        {/* <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <h4 style={{marginRight: '1rem'}} >Module Name : </h4><h5>{modalContent.name}</h5>
                        </div> */}
                        {/* <ExecuteContent integrationConfig={integrationConfig} /> */}
                        {/* <div style={{display: 'flex'}}>
                            <div style={{ marginRight: '2rem' }}>
                                <TextField value = {modalContent.dataparam} onChange={(ev, newValue) => {
                                    if (newValue === '') setModalContent({...modalContent, dataparam: ''});
                                    if (newValue) setModalContent({...modalContent, dataparam: newValue.toString()});
                                }} label='Data Parameterization' width='30rem' standard={true} placeholder='Enter Data Paramterization' />
                            </div>
                            <NormalDropDown selectedKey={modalContent.condition} width='8rem' options={[
                            { key: 0, text: 'False'},
                            { key: 1, text: 'True' }
                            ]} label='Condition' onChange={(ev, option) =>setModalContent({...modalContent, condition: option.key })} />
                        </div> */}
                    
            {/* </Dialog> */} 
            {/* <Button label="Show" icon="pi pi-external-link" onClick={() => onClick('displayMaximizable')} /> */}
                <Dialog header={modalContent.name + ` : Execution Parameters`} visible={displayMaximizable} maximizable modal style={{ width: '70vw', height:'30vw' }} footer={renderFooter('displayMaximizable')} onHide={() => onHide('displayMaximizable')}>
                        <div className="e__batchSuites e__batchSuites_Max">
                                {/* <ScrollBar  thumbColor="rgb(51,51,51)" trackColor="rgb(211, 211, 211)" > */}
                                            {/* <div className='suiteNameTxt' ><span  className='taskname'> </span></div> */}
                                            <div className='exeDataTable testSuiteBatch'>
                                                <div className='executionDataTable' cellSpacing='0' cellPadding='0'>
                                                    <div className="e__table-head">
                                                        <div className="e__table-head-row">
                                                            <div className='e__contextmenu' id='contextmenu'></div>
                                                            <div className='e__selectAll' ><i title='Do Not Execute' aria-hidden='true' className='e__selectAll-exe'></i>
                                                            <input className='e-execute' type='checkbox' checked /></div>	
                                                            <div className='e__scenario'>Scenario Name</div>
                                                            <div className='e__param'>Data Parameterization</div>
                                                            <div className='e__condition'>Condition</div>
                                                            <div className='e__projectName' style={{width:'30vh'}}>Accesibility Standard</div>
                                                        </div>
                                                    </div>
                                                    <div className={'e__testScenarioScroll e__table-bodyContainer e__table-bodyContainer'}>
                                                        <ScrollBar thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" >
                                                        {scenarioName.map((e,i)=>
                                                            <div key={e.name} className={"e__table_row_status e__table_row  e__table_row"} style={{marginLeft:'-1vh'}}>   
                                                            <div className='e__table-col tabeleCellPadding e__contextmenu' style={{marginRight:'1vh'}} >{i+1}</div>
                                                            <div className='e__table-col tabeleCellPadding exe-ExecuteStatus'>
                                                            <input type='checkbox' onChange={e=>{e.target.checked ? doNotExecute[i]=0:doNotExecute[i]=1; setDoNotExecuteArr([...doNotExecute])}} title='Select to execute this scenario' className='doNotExecuteScenario e-execute' checked={!doNotExecute[i]}/>
                                                            </div>
                                                            <div className="tabeleCellPadding exe-scenarioIds e__table_scenaio-name" >{scenarioName[i]}</div>
                                                            <div className="e__table-col tabeleCellPadding exe-dataParam"><input className="e__getParamPath" onChange={(e)=>
                                                                {   dataParameter[i] = e.target.value;
                                                                    setDataParameter([...dataParameter])}} type="text" value = {dataParameter[i]}/></div>
                                                            <div className="e__table-col tabeleCellPadding exe-conditionCheck"><select onChange={(e)=>{condition[i]=e.target.value; setCondition([...condition])}} value={condition[i]} className={"conditionCheck form-control "+((condition[i]=== 0 || condition[i] === '0')?"alertRed":"alertGreen")}><option value={1}>True</option><option value={0}>False</option></select> </div>
                                                            <div className="exe__table-multiDropDown"><MultiSelectDropDown accessibilityParameters={accessibilityParameters} setAccessibilityParameters={setAccessibilityParameters} /></div>
                                                        </div>)
                                                        }
                            
                                                        </ScrollBar>
                                                    </div>
                                                </div>
                                            </div>
                                {/* </ScrollBar> */}
                        </div>
                    </Dialog>
            {
                (integrationConfig.selectValues && integrationConfig.selectValues.length> 0 && integrationConfig.selectValues[2].selected === '') ? <img src='static/imgs/select-project.png' className="select_project_img" /> : <>
                        <div className='devOps_module_list_filter'>
                            <Tab options={options} selectedKey={selectedTab} onLinkClick={HandleTabChange} />
                            <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => {setSearchText('');setFilteredModuleList(initialFilteredModuleList)}} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                            {/* <SearchDropdown
                                calloutMaxHeight="30vh"
                                noItemsText={'Loading...'}
                                onChange={handleExecutionTypeChange}
                                options={executionTypeOptions}
                                placeholder="Select Avo Agent or Avo Grid"
                                selectedKey={selectedExecutionType}
                                width='35%'
                            /> */}
                        </div>
                        <div id="moduleScenarioList" className="devOps_module_list_container">
                            <ScrollBar scrollId='moduleScenarioList' thumbColor="#929397" >
                            <CheckboxTree className='devOps_checkbox_tree' icons={icons} nodes={filteredModuleList} checked={moduleState.checked} expanded={moduleState.expanded} onCheck={HandleTreeChange} onExpand={(expanded) => setModuleState({checked: moduleState.checked}) } />
                            </ScrollBar>
                        </div>
                </>
            }    
        </>
    );
};
export default DevOpsModuleList;
import React, { useState, useEffect, useRef } from 'react';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ScreenOverlay,ModalContainer, Report } from '../../global';
import { CheckBox, SearchDropdown, Tab, NormalDropDown, TextField, SearchBox } from '@avo/designcomponents';
import { fetchModules } from '../api';
import { Icon } from '@fluentui/react';
import "../../execute/styles/ExecuteTable.scss";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import MultiSelectDropDown from '../../execute/components/MultiSelectDropDown';
import Handlebars from "handlebars";
import { readTestSuite_ICE } from '../../mindmap/api';
import { updateTestSuite_ICE,loadLocationDetails,readTestCase_ICE } from '../../execute/api';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';

const DevOpsModuleList = ({ integrationConfig, setIntegrationConfig,filteredModuleList,setFilteredModuleList, moduleScenarioList, setModuleScenarioList, selectedExecutionType, setSelectedExecutionType, setLoading, onDataParamsIconClick1, setModalContent, modalContent, setBrowserlist,onClick, onHide,displayMaximizable, showSelectBrowser, showSelectedBrowserType,notexe, moduleList, setModuleList, initialFilteredModuleList, setinitialFilteredModuleList }) => {
    // const [moduleList, setModuleList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [moduleIds, setModuleIds] = useState();
    const [accessibilityParameters, setAccessibilityParameters] = useState([]);
    const [scenarioName, setScenarioName] = useState([]);
    const [dataParameter, setDataParameter] = useState([]);
    const [condition, setCondition] = useState([]);
    const [testSuiteIds, setTestSuiteId] = useState([]);
    const [scenarioTaskType,setScenarioTaskType] = useState(integrationConfig.scenarioTaskType);
    const [doNotExecute, setDoNotExecuteArr] = useState([]);
    const [scenarioIds, setScenarioIds] = useState([]);
    const [testSuiteName, setTestSuiteName] = useState();
    const [appTypes, setAppTypes] = useState([]);
    const [scenarioDetails,setScenarioDetails] = useState({});
    const [showModal,setshowModal] = useState(false);
    const userInfo = useSelector(state=>state.login.userinfo);
    // const [filteredModuleList, setFilteredModuleList] = useState([]);
    const [accessibilityParametersValue, setAccessibilityParametersValue] = useState([]);
    
    const [notExeState, setNotExeState] = useState({...notexe.current});
    const [notExeInternalState, setNotExeInternalState] = useState([]);
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
            handleSearchChange('')
            setFilteredModuleList(initialFilteredModuleList)
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
            handleSearchChange('')
            setFilteredModuleList(initialFilteredModuleList)
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
    const HandleTreeChange = (checked,targetnode) => {

        //clicked on module
        if(targetnode.isLeaf){
            if(notexe.current[targetnode.parent.value] == undefined) {
                notexe.current[targetnode.parent.value] = []
                // setNotExeState({...notexe.current})
            }
            if(targetnode.checked){
                notexe.current[targetnode.parent.value].push(targetnode.index)
                // setNotExeState({...notexe.current})
            }
            else{
                const index = notexe.current[targetnode.parent.value].indexOf(targetnode.index);
                if (index > -1) { 
                    notexe.current[targetnode.parent.value].splice(index, 1);
                    // setNotExeState({...notexe.current})
                }
            }
        }
        else {
            //condition for clicking on batch
            if(targetnode.value === targetnode.label) {
                for(let module of targetnode.children) {
                    notexe.current[module.value] = []
                    for(let i = 0;i<module.children.length;i++){
                        notexe.current[module.value].push(i);
                        // setNotExeState({...notexe.current})
                    }
                }
            }
            else{
                if(targetnode.checked){
                    notexe.current[targetnode.value] = []
                    for(let i = 0;i<targetnode.children.length;i++){
                        notexe.current[targetnode.value].push(i);
                        // setNotExeState({...notexe.current})
                    }
                }
                else {
                    notexe.current[targetnode.value] = []
                    // setNotExeState({...notexe.current})
                }
            }
        }

        if(selectedTab === 'all') {
            if(searchText === '') setIntegrationConfig({ ...integrationConfig, scenarioList: checked, notexe });
            else {
                setIntegrationConfig({ ...integrationConfig, scenarioList: [...integrationConfig.scenarioList.filter((element) => !checked.includes(element)), ...checked], notexe });
                setModuleState({...moduleState, checked: [...integrationConfig.scenarioList.filter((element) => !checked.includes(element)), ...checked]});
                return;
            }
        }
        else if(selectedTab === 'selected') {
            setIntegrationConfig({ ...integrationConfig, scenarioList: checked, notexe });
        }
        else if(selectedTab === 'unselected') {
            setIntegrationConfig({ ...integrationConfig, scenarioList: [...integrationConfig.scenarioList, ...checked], notexe });
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
                                label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" title="Add / modify data parameterization, execution condition and select accessibility standards"  onClick={(event) => {
                                    event.preventDefault();
                                    onClick('displayMaximizable');
                                    setNotExeInternalState(notExeState[module.moduleid]?notExeState[module.moduleid]:[]);
                                    onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
                            }
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
                                        label: <div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" title="Add / modify data parameterization, execution condition and select accessibility standards"  onClick={(event) => {
                                            event.preventDefault();
                                            onClick('displayMaximizable');
                                            setNotExeInternalState(notExeState[module.moduleid]?notExeState[module.moduleid]:[]);
                                            onDataParamsIconClick1(module.moduleid, module.name)}}/></div>
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
                        if(flagCheckToUpdateNodeKey) {
                            setIntegrationConfig({...integrationConfig, scenarioList: newScenarioList, dataParameters: newDataParams});
                        }
                    } else if(selectedExecutionType === 'e2eExecution') {
                        filteredNodes = fetchedModuleList[selectedExecutionType].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
                            let filterModule = {
                                value: module.moduleid,
                                label:<div className="devOps_input_icon">{module.name}<img src={"static/imgs/input.png"} alt="input icon" title="Add / modify data parameterization, execution condition and select accessibility standards"  onClick={(event) => {
                                    event.preventDefault();
                                    onClick('displayMaximizable');
                                    setNotExeInternalState(notExeState[module.moduleid]?notExeState[module.moduleid]:[]);
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
                    const testSuiteData1 = await readTestSuite_ICE(payload)
                    const testSuiteData = Object.values(testSuiteData1)[0];
                    setModuleIds(testSuiteData.testsuiteid)
                    setTestSuiteName(testSuiteData.testsuitename)
                    let scenarioNameArr = [], dataParameterArr = [], conditionArr = [], testSuiteIdArr = [], doNotExecuteArr = [], scenarioIdArr = [], appTypeArr = [], accessibilityParametersArr = []
                    for (let i=0;i<testSuiteData.scenarioids.length;i++)
                    {
                        scenarioNameArr.push(testSuiteData.scenarionames[i])
                        dataParameterArr.push(testSuiteData.dataparam[i])
                        conditionArr.push(testSuiteData.condition[i])
                        doNotExecuteArr.push(testSuiteData.executestatus[i])
                        scenarioIdArr.push(testSuiteData.scenarioids[i])
                        appTypeArr.push(testSuiteData.apptypes[i])
                        if ("accessibilityParameters" in testSuiteData && testSuiteData.accessibilityParameters.length > 0) {
                            accessibilityParametersArr.push(testSuiteData.accessibilityParameters)
                        }
                    }
                    setScenarioName(scenarioNameArr)
                    setDataParameter(dataParameterArr)
                    setCondition(conditionArr)
                    setTestSuiteId(testSuiteIdArr)
                    setDoNotExecuteArr(doNotExecuteArr)
                    setScenarioIds(scenarioIdArr)
                    setAppTypes(appTypeArr)
                    setAccessibilityParameters(accessibilityParametersArr.length > 0 ? accessibilityParametersArr[0] : [])
                    setAccessibilityParametersValue(accessibilityParametersArr.length > 0 ? accessibilityParametersArr[0] : [])
                }
        })()
    },[integrationConfig.selectValues[2].selected, modalContent, notExeState]);


   const handleSearchChange = (value) => {
        let filteredItems = filteredModuleList.filter(element=>element.label.props.children[0].toLowerCase().includes(value.toLowerCase()))
        setFilteredModuleList(filteredItems)
        setSearchText(value);

   }
    // const [scenario, setScenario] = useState(false);
    // // const handleExecutionTypeChange = (selectedType) => {
    // //     notexe['current'] = {}
    // //     const selectedKey = selectedType.key;
    // //     let filteredNodes = [];
    // //     if(selectedKey === 'normalExecution') {
    // //         filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
    // //             let filterModule = {
    // //                 value: module.moduleid,
    // //                 label: module.name,
    // //             };
    // //             if(module.scenarios && module.scenarios.length > 0) {
    // //                 const moduleChildren = module.scenarios.map((scenario) => {
    // //                     return ({
    // //                         value: scenario._id,
    // //                         label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
    // //                             event.preventDefault();
    // //                             onDataParamsIconClick(scenario._id, scenario.name)}}/></div>
    // //                     })
    // //                 });
    // //                 filterModule['children'] = moduleChildren;
    // //             }
    // //             return filterModule;
    // //         });
    // //     } else if(selectedKey === 'e2eExecution') {
    // //         filteredNodes = moduleScenarioList[selectedKey].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
    // //             let filterModule = {
    // //                 value: module.moduleid,
    // //                 label: module.name,
    // //             };
    // //             if(module.scenarios && module.scenarios.length > 0) {
    // //                 const moduleChildren = module.scenarios.map((scenario, index) => {
    // //                     return ({
    // //                         value: module.batchname+module.moduleid+index+scenario._id,
    // //                         label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
    // //                             event.preventDefault();
    // //                             onDataParamsIconClick(module.batchname+module.moduleid+index+scenario._id, scenario.name)}}/></div>
    // //                     })
    // //                 });
    // //                 filterModule['children'] = moduleChildren;
    // //             }
    // //             return filterModule;
    // //         });
    // //     }
    // //     else if(selectedKey === 'batchExecution') {
    // //         const batchData = moduleScenarioList['batchExecution'];
    // //         filteredNodes = Object.keys(batchData).map((batch) => {
    // //             let filterBatch = {
    // //                 value: batch,
    // //                 label: batch,
    // //             };
    // //             if(batchData[batch].length > 0) {
    // //                 filterBatch['children'] = batchData[batch].filter((module) => { return (module.scenarios && module.scenarios.length > 0) } ).map((module) => {
    // //                     let filterModule = {
    // //                         value: module.moduleid,
    // //                         label: module.name,
    // //                     };
    // //                     if(module.scenarios && module.scenarios.length > 0) {
    // //                         const moduleChildren = module.scenarios.map((scenario, index) => {
    // //                             return ({
    // //                                 value: batch+module.moduleid+index+scenario._id,
    // //                                 label: <div className="devOps_input_icon">{scenario.name}<img src={"static/imgs/input.png"} alt="input icon" onClick={(event) => {
    // //                                     event.preventDefault();
    // //                                     onDataParamsIconClick(batch+module.moduleid+index+scenario._id, scenario.name)}}/></div>
    // //                             })
    // //                         });
    // //                         filterModule['children'] = moduleChildren;
    // //                     }
    // //                     return filterModule;
    // //                 });
    // //             }
    // //             return filterBatch;
    // //         });
    // //     }
    // //     setSelectedExecutionType(selectedKey);
    // //     setModuleList(filteredNodes);
    // //     setFilteredModuleList(filteredNodes);
    // //     setModuleState({expanded: [], checked: []});
    // //     setIntegrationConfig({ ...integrationConfig, scenarioList: [], dataParameters: [] });
    // // }
    // // const [modalContent, setModalContent] = useState(false);
    // const onDataParamsIconClick = (scenarioId, name) => {
    //     if(integrationConfig.dataParameters.some((data) => data.scenarioId === scenarioId)) {
    //         let paramIndex = integrationConfig.dataParameters.findIndex((data) => data.scenarioId === scenarioId);
    //         setModalContent(integrationConfig.dataParameters[paramIndex]);
    //     } else {
    //         setScenario({
    //             scenarioId: scenarioId,
    //             name: name,
    //             dataparam: '',
    //             condition: 0
    //         })
    //     }
    // }
    const loadLocationDetailsScenario = async (scenarioName, scenarioId) => {
		let data = await loadLocationDetails(scenarioName, scenarioId);
        if(data.error){displayError(data.error);return;}
        data["modalHeader"] = scenarioName;
        setScenarioDetails(data);
    } 
    const closeModal = () => {
        setshowModal(false);
    }
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
        return
    }
   
    
    const renderFooter = (name) => {
            return (
                <div>
                    <Button label="Cancel"  onClick={() => onHide(name)} className="p-button-rounded" />
                    <Button label="Save"  className='p-button-rounded' onClick={async () => {
                        notExeState[modalContent.moduleId] = notExeInternalState
                        setNotExeState({...notExeState});
                        const payload =  [{
                                "testsuiteid": moduleIds,
                                "testsuitename": testSuiteName,
                                "testscenarioids": scenarioIds,
                                "getparampaths": dataParameter,
                                "conditioncheck": condition,
                                // "donotexecute": notExeInternalState,
                                "accessibilityParameters": accessibilityParametersValue
                            }]
                        await updateTestSuite_ICE(payload);
            
                        integrationConfig.dataParameters = dataParameter;
                        integrationConfig.condition = condition;
                        // integrationConfig.scenarioList = scenarioIds;
                        setIntegrationConfig({...integrationConfig})
                        onHide(name)}} autoFocus />
                </div>
            );
        }
    const checkAll=(e)=>{
        if(notExeInternalState.length>0){
            setNotExeInternalState([])
        }else {
            setNotExeInternalState(scenarioName.map((sceName,idx)=>idx))
        }     
    }     

    const getAccessibilityParameters = (accessibilityParametersValue) => {	
        setAccessibilityParametersValue(accessibilityParametersValue);	
    }
    const handleKeyDown = (event)=>{
        if(event.key === 'Backspace'){
            if(searchText.length>0){
                let val=searchText.substring(0,searchText.length-1);
                let filteredItems = initialFilteredModuleList.filter(element=>element.label.props.children[0].toLowerCase().includes(val.toLowerCase()))
                setFilteredModuleList(filteredItems)
                setSearchText(val);
            }
            event.preventDefault();  
        }
   }
    return (
        <>

            <Dialog header={modalContent.name + ` : Execution Parameters`} className="devopsModList__Dialog" visible={displayMaximizable} maximizable modal style={{ width: '70vw', height:'30vw' }} footer={renderFooter('displayMaximizable')} onHide={() => onHide('displayMaximizable')}>
                        <div className="e__batchSuites e__batchSuites_Max">
                                {/* <ScrollBar  thumbColor="rgb(51,51,51)" trackColor="rgb(211, 211, 211)" > */}
                                            {/* <div className='suiteNameTxt' ><span  className='taskname'> </span></div> */}
                                            <div className='exeDataTable testSuiteBatch'>
                                                <div className='executionDataTable' cellSpacing='0' cellPadding='0'>
                                                    <div className="e__table-head">
                                                        <div className="e__table-head-row">
                                                            <div className='e__contextmenu' id='contextmenu'></div>
                                                            <div className='e__selectAll e__selectAll-name ' ><i title='Do Not Execute' aria-hidden='true' className='e__selectAll-exe'></i>
                                                            <input className='e-execute' type='checkbox' onChange={checkAll} checked={notExeInternalState.length>0 ? notExeInternalState.length===scenarioName.length:false} /></div>	
                                                            <div className='e__scenario'>Scenario Name</div>
                                                            <div className='e__param'>Data Parameterization</div>
                                                            <div className='e__condition'>Condition</div>
                                                            <div className='e__apptype' >App Type</div>
                                                            {(showSelectedBrowserType || showSelectBrowser) && <div className='e__accessibilityTesting'>Accessibility Standards</div> }
                                                        </div>
                                                    </div>
                                                    <div className={'e__table-bodyContainer'}>
                                                        <ScrollBar thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" >
                                                        {scenarioName.map((e,i)=>
                                                            <div key={e.name} className="e__table_row">   
                                                            <div className='e__table-col tabeleCellPadding e__contextmenu e__table-col1 '  >{i+1}</div>
                                                            <div className='e__table-col tabeleCellPadding exe-ExecuteStatus e__table-col2'>
                                                            <input type='checkbox' onChange={e=>{
                                                                if(e.target.checked){
                                                                        notExeInternalState.push(i);
                                                                        setNotExeInternalState([...notExeInternalState])
                                                                    
                                                                }
                                                                else{
                                                                        setNotExeInternalState([...notExeInternalState.filter((scenarioNo)=>scenarioNo!==i)])
                                                                    
                                                                }} } title='Select to execute this scenario' className='doNotExecuteScenario e-execute' defaultChecked={notExeInternalState.includes(i)?true:false}/>
                                                            </div>
                                                            <div title={scenarioName[i]} className="tabeleCellPadding exe-scenarioIds e__table_scenaio-name" onClick={()=>{loadLocationDetailsScenario(scenarioName[i],scenarioIds[i]);setshowModal(true);}}>{scenarioName[i]}</div>
                                                            <div className="e__table-col tabeleCellPadding exe-dataParam"><input className="e__getParamPath" onChange={(e)=>
                                                                {   dataParameter[i] = e.target.value;
                                                                    setDataParameter([...dataParameter])}} type="text" value = {dataParameter[i]}/></div>
                                                            <div className="e__table-col tabeleCellPadding exe-conditionCheck"><select onChange={(e)=>{condition[i]=e.target.value; setCondition([...condition])}} value={condition[i]} className={"conditionCheck form-control "+((condition[i]=== 0 || condition[i] === '0')?"alertRed":"alertGreen")}><option value={1}>True</option><option value={0}>False</option></select> </div>
                                                            <div title={details[appTypes[i]]}  className='e__table-col tabeleCellPadding exe-apptype'>
                                                                    <img src={"static/imgs/"+appTypes[i]+".png"} alt="apptype" className="e__table_webImg"/>
                                                                </div>
                                                            {(showSelectedBrowserType || showSelectBrowser) &&   
                                                            <div className="exe__table-multiDropDown"><MultiSelectDropDown accessibilityParameters={accessibilityParameters} setAccessibilityParameters={setAccessibilityParameters} getAccessibilityParameters={getAccessibilityParameters} /></div> }
                                                        </div>)
                                                        }
                            
                                                        </ScrollBar>
                                                    </div>
                                                </div>
                                            </div>
                                {/* </ScrollBar> */}
                        </div>
                        {showModal?
                            <ModalContainer title={scenarioDetails.modalHeader} footer={submitModalButtons(setshowModal)} close={closeModal} content={scenarioDetailsContent(scenarioDetails, userInfo, displayError)} />
                        :null} 
                    </Dialog>
            {
                (integrationConfig.selectValues && integrationConfig.selectValues.length> 0 && integrationConfig.selectValues[2].selected === '') ? <img src='static/imgs/select-project.png' className="select_project_img" /> : <>
                        <div className='devOps_module_list_filter'>
                            <Tab options={options} selectedKey={selectedTab} onLinkClick={HandleTabChange} />
                           {(selectedTab === 'all')?<SearchBox placeholder='Search' width='20rem' value={searchText} onClear={() => {handleSearchChange('');setFilteredModuleList(initialFilteredModuleList)}} onKeyDown={(event)=>{handleKeyDown(event)}} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />:""}
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
                        <div id="moduleScenarioList" className="devOps_module_list_container devOps_module_list_container_module">
                            <ScrollBar scrollId='moduleScenarioList' thumbColor="#929397" >
                            <CheckboxTree className='devOps_checkbox_tree' icons={icons} nodes={filteredModuleList} checked={moduleState.checked} expanded={moduleState.expanded} onCheck={HandleTreeChange} onExpand={(expanded) => setModuleState({checked: moduleState.checked, expanded: expanded}) } />
                            </ScrollBar>
                        </div>
                </>
            }    
        </>
    );
    
};
const submitModalButtons = (setshowModal) => {
    return(
        <button type="button" onClick={()=>{setshowModal(false);}} >Ok</button>
    )
}
const scenarioDetailsContent = (scenarioDetails, userInfo, displayError) => {
    return(
        <>
            <div className="scenarioDetails scenarioDetailsHeading">
                <div className="sDInnerContents">Test Case Name</div>
                <div className="sDInnerContents">Screen Name</div>
                <div className="sDInnerContents">Project Name</div>
            </div>
            <div id="scenarioDetailsContent" className="scenarioDetails scenarioDetailsContent scrollbar-inner">
                <ScrollBar thumbColor="#321e4f" >
                {scenarioDetails.screennames!==undefined?
                <>
                    {scenarioDetails.screennames.map((data,i)=>(
                        <div key={i} className="sDInnerContentsWrap">
                            <div className="sDInnerContents viewReadOnlyTC" onClick={()=>{testCaseDetails(scenarioDetails.testcasenames[i], scenarioDetails.testcaseids[i], userInfo, displayError)}} title={scenarioDetails.testcasenames[i]}>{scenarioDetails.testcasenames[i]}</div>
                            <div className="sDInnerContents" title={scenarioDetails.screennames[i]}>{scenarioDetails.screennames[i]}</div>
                            <div className="sDInnerContents" title={scenarioDetails.projectnames[i]}>{scenarioDetails.projectnames[i]}</div>
                        </div>
                    ))}
                </>
                :null}
                </ScrollBar>
            </div>
        </>
    )
}
const testCaseDetails = async (testCaseName, testCaseId, userInfo, displayError) => {
    try{
        const response = await readTestCase_ICE(userInfo,testCaseId, testCaseName, 0);
        if(response.error){displayError(response.error);return;}
        var template = Handlebars.compile(Report);
        var dat = template({
                name: [{
                        testcasename: response.testcasename
                    }
                ],
                rows: response.testcase
            });
        var newWindow = window.open();
        newWindow.document.write(dat);
    }catch(error) {
        console.log(error);
    }
}
const details = {
    "web":{"data":"Web","title":"Web","img":"web"},
    "webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
    "desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
    "oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
    "mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
    "mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
    "sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
    "system":{"data":"System","title":"System Apps","img":"desktop"},
    "mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"}
};
export default DevOpsModuleList;
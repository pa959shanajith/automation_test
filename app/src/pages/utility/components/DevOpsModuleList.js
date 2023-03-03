import React, { useState, useEffect } from 'react';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ScreenOverlay } from '../../global';
import { CheckBox, SearchDropdown, Tab, NormalDropDown, Dialog, TextField } from '@avo/designcomponents';
import { fetchModules } from '../api';
import { Icon } from '@fluentui/react';

import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
const DevOpsModuleList = ({ integrationConfig, setIntegrationConfig, moduleScenarioList, setModuleScenarioList, selectedExecutionType, setSelectedExecutionType, setLoading }) => {
    const [moduleList, setModuleList] = useState([]);
    const [filteredModuleList, setFilteredModuleList] = useState([]);
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
                        filteredNodes = fetchedModuleList[selectedExecutionType].map((module) => {
                            let filterModule = {
                                value: module.moduleid,
                                label: module.name,
                            };
                            if(module.scenarios.length > 0) {
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
                                filterBatch['children'] = batchData[batch].map((module) => {
                                    let filterModule = {
                                        value: module.moduleid,
                                        label: module.name,
                                    };
                                    if(module.scenarios.length > 0) {
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
                        if(flagCheckToUpdateNodeKey) {
                            setIntegrationConfig({...integrationConfig, scenarioList: newScenarioList, dataParameters: newDataParams});
                        }
                    } else if(selectedExecutionType === 'e2eExecution') {
                        filteredNodes = fetchedModuleList[selectedExecutionType].map((module) => {
                            let filterModule = {
                                value: module.moduleid,
                                label: module.name,
                            };
                            if(module.scenarios.length > 0) {
                                const moduleChildren = module.scenarios.map((scenario, index) => {
                                    console.log('useeffect : '+module.batchname+module.moduleid+index+scenario._id);
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
                    setModuleList(filteredNodes);
                    setFilteredModuleList(filteredNodes);
                    setModuleScenarioList(fetchedModuleList);
                }
                setLoading(false);
            }
        })()
    },[integrationConfig.selectValues[2].selected]);
    const handleExecutionTypeChange = (selectedType) => {
        const selectedKey = selectedType.key;
        let filteredNodes = [];
        if(selectedKey === 'normalExecution') {
            filteredNodes = moduleScenarioList[selectedKey].map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label: module.name,
                };
                if(module.scenarios.length > 0) {
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
            filteredNodes = moduleScenarioList[selectedKey].map((module) => {
                let filterModule = {
                    value: module.moduleid,
                    label: module.name,
                };
                if(module.scenarios.length > 0) {
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
                    filterBatch['children'] = batchData[batch].map((module) => {
                        let filterModule = {
                            value: module.moduleid,
                            label: module.name,
                        };
                        if(module.scenarios.length > 0) {
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
    const [modalContent, setModalContent] = useState(false);
    const onDataParamsIconClick = (scenarioId, name) => {
        if(integrationConfig.dataParameters.some((data) => data.scenarioId === scenarioId)) {
            let paramIndex = integrationConfig.dataParameters.findIndex((data) => data.scenarioId === scenarioId);
            setModalContent(integrationConfig.dataParameters[paramIndex]);
        } else {
            setModalContent({
                scenarioId: scenarioId,
                name: name,
                dataparam: '',
                condition: 0
            })
        }
    }
    return (
        <>
            <Dialog
                hidden = {modalContent === false}
                onDismiss = {() => setModalContent(false)}
                title = 'Scenario Data Parametrization'
                minWidth = '60rem'
                confirmText = 'Save'
                declineText = 'Cancel'
                onDecline={() => setModalContent(false)}
                onConfirm = {() => {
                    let updatedParamCollection = integrationConfig.dataParameters;
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
                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <h4 style={{marginRight: '1rem'}} >Scenario Name : </h4><h5>{modalContent.name}</h5>
                        </div>
                        <div style={{display: 'flex'}}>
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
                        </div>
                    </div>
            </Dialog>
            {
                (integrationConfig.selectValues && integrationConfig.selectValues.length> 0 && integrationConfig.selectValues[2].selected === '') ? <img src='static/imgs/select-project.png' className="select_project_img" /> : <>
                    <div className='devOps_module_list_filter'>
                        <Tab options={options} selectedKey={selectedTab} onLinkClick={HandleTabChange} />
                        <SearchDropdown
                            calloutMaxHeight="30vh"
                            noItemsText={'Loading...'}
                            onChange={handleExecutionTypeChange}
                            options={executionTypeOptions}
                            placeholder="Select Avo Agent or Avo Grid"
                            selectedKey={selectedExecutionType}
                            width='35%'
                        />
                    </div>
                    <div id="moduleScenarioList" className="devOps_module_list_container">
                        <ScrollBar scrollId='moduleScenarioList' thumbColor="#929397" >
                        <CheckboxTree className='devOps_checkbox_tree' icons={icons} nodes={filteredModuleList} checked={moduleState.checked} expanded={moduleState.expanded} onCheck={HandleTreeChange} onExpand={(expanded) => setModuleState({checked: moduleState.checked, expanded: expanded}) } />
                        </ScrollBar>
                    </div>
                </>
            }
        </>
    );
};
export default DevOpsModuleList;
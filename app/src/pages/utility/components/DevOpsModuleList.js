import React, { useState, useEffect } from 'react';
import { ScrollBar, Messages as MSG, setMsg, VARIANT } from '../../global';
import { CheckBox, SearchDropdown, Tab } from '@avo/designcomponents';
import { fetchModules } from '../api';
import { Icon } from '@fluentui/react';

import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
const DevOpsModuleList = ({ integrationConfig, setIntegrationConfig }) => {
    // const [moduleList, setModuleList] = useState(integrationConfig.scenarioList);
    const [moduleList, setModuleList] = useState([
        {
            value: 'Module 1',
            label: 'Module 1',
            children: [
                {
                    value: 'Module 1 Scenario 1',
                    label: 'Scenario 1'
                },
                {
                    value: 'Module 1 Scenario 2',
                    label: 'Scenario 2'
                },
                {
                    value: 'Module 1 Scenario 3',
                    label: 'Scenario 3',
                    children: [
                        {
                            value: 'Module 1 TestCase 1 Scenario 1',
                            label: 'TestCase 1'
                        },
                        {
                            value: 'Module 1 TestCase 2 Scenario 2',
                            label: 'TestCase 2'
                        },
                        {
                            value: 'Module 1 TestCase 3 Scenario 3',
                            label: 'TestCase 3'
                        }
                    ]
                }
            ]
        },
        {
            value: 'Module 2',
            label: 'Module 2',
            children: [
                {
                    value: 'Module 2 Scenario 1',
                    label: 'Scenario 1'
                },
                {
                    value: 'Module 2 Scenario 2',
                    label: 'Scenario 2'
                },
                {
                    value: 'Module 2 Scenario 3',
                    label: 'Scenario 3'
                }
            ]
        },
        {
            value: 'Module 3',
            label: 'Module 3',
            children: [
                {
                    value: 'Module 3 Scenario 1',
                    label: 'Scenario 3'
                },
                {
                    value: 'Module 3 Scenario 2',
                    label: 'Scenario 2'
                },
                {
                    value: 'Module 3 Scenario 3',
                    label: 'Scenario 3'
                }
            ]
        },
        {
            value: 'Module 4',
            label: 'Module 4',
            children: [
                {
                    value: 'Module 4 Scenario 1',
                    label: 'Scenario 1'
                },
                {
                    value: 'Module 4 Scenario 2',
                    label: 'Scenario 4'
                },
                {
                    value: 'Module 4 Scenario 3',
                    label: 'Scenario 3'
                }
            ]
        },
        {
            value: 'Module 5',
            label: 'Module 5',
            children: [
                {
                    value: 'Module 5 Scenario 1',
                    label: 'Scenario 1'
                },
                {
                    value: 'Module 5 Scenario 2',
                    label: 'Scenario 5'
                },
                {
                    value: 'Module 5 Scenario 3',
                    label: 'Scenario 3'
                }
            ]
        },
        {
            value: 'Module 6',
            label: 'Module 6',
            children: [
                {
                    value: 'Module 6 Scenario 1',
                    label: 'Scenario 6'
                },
                {
                    value: 'Module 6 Scenario 2',
                    label: 'Scenario 2'
                },
                {
                    value: 'Module 6 Scenario 3',
                    label: 'Scenario 6'
                }
            ]
        },
        {
            value: 'Module 7',
            label: 'Module 7',
            children: [
                {
                    value: 'Module 7 Scenario 1',
                    label: 'Scenario 1'
                },
                {
                    value: 'Module 7 Scenario 2',
                    label: 'Scenario 2'
                },
                {
                    value: 'Module 7 Scenario 3',
                    label: 'Scenario 3'
                }
            ]
        }
    ]);
    const [filteredModuleList, setFilteredModuleList] = useState(moduleList);
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
        check: <CheckBox checked={true} indeterminate={false} />,
        uncheck: <CheckBox checked={false} indeterminate={false} />,
        halfCheck: <CheckBox indeterminate={true} checked={false} styles={indeterminateStyle} />,
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
            key: 'Normal execution',
            text: 'Normal Execution'
        },
        {
            key: 'Batch execution',
            text: 'Batch Execution'
        },
        {
            key: 'E2E execution',
            text: 'E2E Execution'
        }
    ];
    const [selectedExecutionType, setSelectedExecutionType] = useState('Normal execution');
    const [selectedTab, setSelectedTab] = useState('all');
    const [moduleState, setModuleState] = useState({
        checked: integrationConfig.scenarioList,
        expanded: []
    });
    const HandleTabChange = (tab) => {
        const key = tab.props.itemKey;
        if(key === 'all') setFilteredModuleList(moduleList);
        else if(key === 'selected'){
            let newFilteredList = moduleList.filter( (element) => {
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
            setFilteredModuleList(newFilteredList);
        }
        else if(key === 'unselected') {
            let newFilteredList = moduleList.filter( (element) => {
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
                const moduleList = await fetchModules({
                    "tab":'tabAssign',
                    "projectid":integrationConfig.selectValues[0].selected,
                    "moduleid":integrationConfig.selectValues[1].selected,
                    "cycleid":integrationConfig.selectValues[2].selected
                });
                if(moduleList.error) {
                    setMsg(MSG.CUSTOM("Error While Fetching Module List",VARIANT.ERROR));
                }else {
                    console.log(moduleList);
                }
            }
        })()
    },[integrationConfig.selectValues[2].selected]);
    return (
        // <CheckboxTree className='devOps_checkbox_tree' icons={icons} nodes={filteredModuleList} checked={moduleState.checked} expanded={moduleState.expanded} onCheck={HandleTreeChange} onExpand={(expanded) => setModuleState({checked: moduleState.checked, expanded: expanded}) } />
        (integrationConfig.selectValues && integrationConfig.selectValues.length> 0 && integrationConfig.selectValues[2].selected === '') ? <img src='static/imgs/select-project.png' className="select_project_img" /> : <>
            <div className='devOps_module_list_filter'>
                <Tab options={options} selectedKey={selectedTab} onLinkClick={HandleTabChange} />
                <SearchDropdown
                    calloutMaxHeight="30vh"
                    noItemsText={'Loading...'}
                    onChange={(selectedType) => setSelectedExecutionType(selectedType.key)}
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
    );
};
export default DevOpsModuleList;
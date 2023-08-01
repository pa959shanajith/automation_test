import React, { useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { InputSwitch } from "primereact/inputswitch";
import "../styles/AzureContent.scss";
import { Tree } from 'primereact/tree';
import { Checkbox } from 'primereact/checkbox';
import { useSelector } from 'react-redux';


const AzureContent = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedWorkItem, setSelectedWorkItem] = useState(null);
    const [selectedtestplan, setSelectedtestplan] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const jiraTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            avoassure: 'AvoTestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            avoassure: 'Avo TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            avoassure: 'Avo TestCase 3'
        },
    ];

    const avoTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            jiraCase: 'Azure TestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            jiraCase: 'Azure TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            jiraCase: 'Azure TestCase 3'
        },
    ];

    const projects = [
        { name: 'Avo Design Components', code: 'NY' },
        { name: 'Avo Azure', code: 'RM' }
    ];
    const workItems = [
        { name: 'Story', code: 'NY' },
        { name: 'Testplans', code: 'RM' }
    ];
    const testplans = [
        { name: 'test1', code: 'NY' },
        { name: 'test2', code: 'RM' }
    ];

    //tree data///////////////////

    const data = [
        { id: 1, label: 'Item 1' },
        { id: 2, label: 'Item 2' },
        { id: 3, label: 'Item 3' },
        { id: 4, label: 'Item 4' },
        { id: 5, label: 'Item 5' },
    ];

    // const [data, setData] = useState([

    //     {

    //         key: "grandparent1",

    //         label: "Grandparent 1",

    //         children: [

    //             {

    //                 key: "parent1",

    //                 label: "Parent 1",

    //                 children: [

    //                     {

    //                         key: "children1",

    //                         label: "Children 1",

    //                         children: [

    //                             { key: "child1", label: "Child 1" },

    //                             { key: "child2", label: "Child 2" },

    //                         ],

    //                     }
    //                 ],

    //             },

    //         ],

    //     },

    //     {

    //         key: "grandparent2",

    //         label: "Grandparent 2",

    //         children: [

    //             {

    //                 key: "parent2",

    //                 label: "Parent 2",

    //                 children: [

    //                     {

    //                         key: "children1",

    //                         label: "Children 1",

    //                         children: [

    //                             { key: "child1", label: "Child 1" },

    //                             { key: "child2", label: "Child 2" },

    //                         ],

    //                     }
    //                 ],

    //             },

    //         ],

    //     },

    // ]);

    const avotestcases = [

        {

            key: "screnario1",

            label: "Scenario 1",

            children: [

                { key: "testCase1", label: "Testcase 1" },

                { key: "testCase2", label: "Testcase 2" },

            ],

        },

        {

            key: "screnario2",

            label: "Scenario 2",

            children: [

                { key: "testCase3", label: "Testcase 3" },

                { key: "testCase4", label: "Testcase 4" },

            ],

        }

    ]

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    const handleWorkItemChange = (e) => {
        setSelectedWorkItem(e.value);

        // If "testplans" is selected, reset the selectedTestPlan state to null
        if (e.value.name === 'Testplans') {
            setSelectedtestplan(null);
        }
    };

    //////////////////////////////////////// left side tree/////////////////////////////////////

    const TreeNodeCheckbox = (node) => {



        const onCheckboxChange = (e) => {

            setCheckedAvo((prevCheckedNodes) => {

                const updatedCheckedNodes = { ...prevCheckedNodes, [node.key]: e.checked };

                return updatedCheckedNodes;

            });

        };

        // Check if the node has children

        const hasChildren = node.children && node.children.length > 0;



        // Render checkboxes only for parent nodes

        if (hasChildren) {

            return (

                <>

                    {/* <input type="checkbox" /> */}

                    <div style={{ width: '100%' }}>

                        <Checkbox onChange={onCheckboxChange} checked={checkedAvo[node.key]} />

                        <span>{node.label}</span>

                        <i className="pi pi-times" style={{ float: 'right' }}></i>

                    </div>

                </>

            );

        }



        return (

            <>

                <div style={{ width: '100%' }}>

                    <span>{node.label}</span>

                    <i className="pi pi-times" style={{ float: 'right' }}></i>

                </div>

            </>

        );

    };

    const handleCheckboxChange = (e, id) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [id]: e.checked
        }));
    };


    return (
        <>
            <div>
                <div className="tab__cls">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                        <TabPanel header="Mapping">
                            <div className="data__mapping">
                                <div className="card_Azure1">
                                    <Card className="mapping_data_card_azure">
                                        <div className="dropdown_div">
                                            <div className="dropdown-map_azure">
                                                <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                <span className="release_span1"> Select Workitems<span style={{ color: 'red', left: '3rem' }}>*</span></span>
                                                {selectedWorkItem && selectedWorkItem.name === 'Testplans' && (
                                                    <span className="release_span2"> Select Testplans<span style={{ color: 'red' }}>*</span></span>)}

                                            </div>
                                            <div className="dropdown-map_azure">
                                                <Dropdown value={selectedProject} onChange={(e) => setSelectedProject(e.value)} options={projects} optionLabel="name"
                                                    placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project1" />
                                                <Dropdown value={selectedWorkItem} onChange={handleWorkItemChange} options={workItems} optionLabel="name"
                                                    placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release1" />
                                                {selectedWorkItem && selectedWorkItem.name === 'Testplans' && (
                                                    <Dropdown value={selectedtestplan} onChange={(e) => setSelectedtestplan(e.value)} options={testplans} optionLabel="name"
                                                        placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_release2" />)}
                                            </div>
                                        </div>
                                        {selectedWorkItem && selectedProject && (

                                            <div className="tree_data_card1">
                                                {data.map(item => (
                                                    <div key={item.id} className="azure__data__div">
                                                        <Checkbox
                                                            inputId={`${item.id}`}
                                                            checked={checkedItems[item.id] || false}
                                                            onChange={(e) => handleCheckboxChange(e, item.id)}
                                                        />
                                                        <label className="azure__name">{item.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>


                                <div>
                                    <div className="card_Azure2">
                                        <Card className="mapping_data_card_azure">
                                            <div className="dropdown_div">
                                                <div className="dropdown-map">
                                                    <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                </div>
                                                <div className="dropdown-map">
                                                    {/* <Dropdown  style={{ width: '11rem', height: '2.5rem' }}  className="dropdown_project" value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities}  placeholder="Select Project" /> */}
                                                    {/* <Dropdown value={selectedCity} onChange={(e) => (e.value)} options={cities} optionLabel="name"
                                                        placeholder="Select Project" style={{ width: '11rem', height: '2.5rem' }} className="dropdown_project" /> */}
                                                    <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                </div>

                                                <div className="avotest__data">

                                                    <Tree value={avotestcases} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                </div>
                                            </div>
                                            {/* {
                                                                selectedAvoproject ?
                                                                listofScenarios.map((e,i)=> (<div
                                                                    key={i}
                                                                    className={"scenario__listItem"}
                                                                    title={e.name}
                                                                    // onClick={(event) => { selectScenarioMultiple(event, e._id); }}
                                                                >
                                                                    {e.name}
                                                                </div>))
                                                                     :
                                                                    null

                                                            } */}
                                        </Card>
                                    </div>
                                </div>
                                <span> <Button label="Map" size="small" className="map_icon_cls"></Button></span>
                            </div>

                        </TabPanel>

                        <TabPanel header="View Mapping">
                            <div className="card2_viewmap">
                                <Card className="view_map_card">
                                    <div className="flex justify-content-flex-start toggle_btn">
                                        <span>Azure DevOps Testcase to Avo Assure Testcase</span>
                                        <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                        <span>Avo Assure Testcase to Azure DevOps Testcase</span>
                                    </div>

                                    {checked ? (<div className="accordion_testcase">
                                        <Accordion multiple activeIndex={0} >
                                            {avoTestCase.map((jiraCase) => (
                                                <AccordionTab header="Avo Assure Testcase">
                                                    <span>{jiraCase.jiraCase}</span>
                                                </AccordionTab>))}
                                        </Accordion>
                                    </div>

                                    ) : (

                                        <div className="accordion_testcase">
                                            <Accordion multiple activeIndex={0}>
                                                {jiraTestCase.map((testCase) => (
                                                    <AccordionTab header="Azure DevOps Testcase">
                                                        <span>{testCase.avoassure}</span>
                                                    </AccordionTab>))}
                                            </Accordion>
                                        </div>
                                    )}
                                </Card>
                            </div>

                        </TabPanel>

                    </TabView>
                </div>


            </div>


        </>
    )
}

export default AzureContent;

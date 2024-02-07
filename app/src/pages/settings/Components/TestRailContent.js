import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Tree } from 'primereact/tree';
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import { useSelector, useDispatch } from 'react-redux';
import * as api from '../api.js';
import { selectedProject, selectedIssue } from '../settingSlice';
import { getProjectsMMTS } from '../../design/api';
import { RedirectPage, Messages as MSG, setMsg } from '../../global';

const TestRailContent = ({ domainDetails }) => {
    // use states, refs
    const [testRailProjectsName, setTestRailProjectsName] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [disableIssue, setDisableIssue] = useState(true);
    const [updatedTreeData, setUpdatedTreeData] = useState([]);
    const [testRailNode, setTestRailNode] = useState({});
    const [avoSelected, setAvoSelected] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [testSuites, setTestSuites] = useState([]);
    const [testRailTreeData, setTestRailTreeData] = useState([]);
    const [testRailTestcaseData, setTestRailTestcaseData] = useState([]);
    const toast = useRef();

    // constants, variables
    const projectDetails = JSON.parse(localStorage.getItem("DefaultProject"));
    const dropDownStyle = { width: '11rem', height: '2.5rem' };
    let testrailDetails = {
        projectId: "",
        runId: ""
    };
    let projectType = 1;

    // use selectors
    const dispatch = useDispatch();
    const currentProject = useSelector(state => state.setting.selectedProject);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const currentIssue = useSelector(state => state.setting.selectedIssue);

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const setToast = (tag, summary, msg) => {
        toast.current.show({ severity: tag, summary: summary, detail: JSON.stringify(msg), life: 5000 });
    };

    const onDropdownChange = async (e, type) => {
        e.preventDefault();
        setDisableIssue(false);

        if (type === "project") {
            testrailDetails.projectId = e.value.id;
            dispatch(selectedProject(e.value));
            const projectPlans = await api.getProjectPlans({
                TestRailAction: "getTestPlans",
                projectId: testrailDetails.projectId
            });

            if (projectPlans.error)
                setToast("error", "Error", projectPlans.error);

            setTestPlans((plans) => projectPlans);
        } else if (type === "testplans") {
            dispatch(selectedIssue(e.value));
            const projectPlans = await api.getSuitesandRuns({
                TestRailAction: "getSuiteAndRunInfo",
                testPlanId: Number(e.value.id)
            });

            setTestSuites((testSuites) => projectPlans["entries"]);
        }
    };

    const checkboxTemplate = (node) => {
        if (node.testcaseType === "parent") {
            return <>
                <Checkbox
                    value={node}
                    checked={avoSelected.includes(node._id)}
                    onChange={(e) => handleNode(e, node)}
                />
                <span className="scenario_label">{node.name} - {node.testSuite?.name}</span>
            </>
        }
        else return <span className="scenario_label">{node.name}</span>
    };

    const handleNode = (e, node) => {
        console.log("node", node);
        if (e.checked) {
            setAvoSelected([...avoSelected, node._id])
        } else {
            const nodeIndex = avoSelected.indexOf(node._id);
            let newSelectedNodes = [...avoSelected];
            if (nodeIndex !== -1) {
                newSelectedNodes.splice(nodeIndex, 1);
            }
            setAvoSelected(newSelectedNodes);
        }
    };

    useEffect(() => {
        const fetchAvoModules = async () => {
            const getModulesData = await getProjectsMMTS(projectDetails.projectId);
            const testCasesList = getModulesData[0].mindmapList?.flatMap(({ scenarioList, ...rest }) => (
                scenarioList.map(scenario => ({
                    ...scenario,
                    children: [],
                    checked: false,
                    testcaseType: "parent",
                    testSuite: {
                        ...rest
                    }
                }))
            ));

            setUpdatedTreeData(() => testCasesList);
        };

        fetchAvoModules();
    }, []);

    useEffect(() => {
        const updatedData = testSuites?.map((node) => {
            return {
                ...node,
                key: "0",
                label: node.name,
                children: node?.runs?.map((run, index) => {
                    if (testSuites.length > 0) {
                        const fetchTestCases = async (run) => {

                            const { tests } = await api.getTestcases_Testrail({
                                TestRailAction: "getTestCases",
                                projectId: run?.project_id,
                                runId: run?.id
                            });

                            const namedTCs = tests?.map((testCase) => {
                                return {
                                    ...testCase,
                                    "name": testCase.title
                                }
                            });

                            console.log("namedTCs", namedTCs);

                            // setTestRailTestcaseData((testRailTestcaseData) => namedTCs);
                            setTestRailTestcaseData((testRailTestcaseData) => tests.children = namedTCs);
                        };

                        fetchTestCases(run);
                    }

                    return {
                        ...run,
                        children: testRailTestcaseData?.map((testCase) => {
                            return {
                                ...testCase,
                                "name": testCase.title
                            }
                        }),
                        key: `0-${index + 1}`,
                        label: [
                            <Checkbox
                                value={node}
                                checked={avoSelected.includes(node.id)}
                                onChange={(e) => handleNode(e, node)}
                            />,
                            <span className="scenario_label">{node.name}</span>
                        ],
                    }
                }),
                // children: node.children
            }
        });

        console.log("updatedData", updatedData);


        // if (testRailTestcaseData.length > 0) {
        //     const renamedTestCases = testRailTestcaseData.map((testCase) => {
        //         console.log("testCase", testCase);
        //         return {
        //             ...testCase,
        //             "name": testCase.title
        //         }
        //     });
        //     console.log("renamedTestCases", renamedTestCases);
        // }

        console.log("updatedData", updatedData);

        setTestRailTreeData((testRailTreeData) => updatedData);
    }, [testSuites]);

    useEffect(() => {
        setTestRailProjectsName(domainDetails?.projects);
    }, [domainDetails?.projects]);

    // console.log("currentProject", currentProject);
    // console.log("currentIssue", currentIssue);

    return (
        <div className="tab__cls">
            <div>
                <div className="tab__cls">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                        <TabPanel header="Mapping">
                            <div className="data__mapping">
                                <div className="card_data1">
                                    <Card className="mapping_data_card1">
                                        <div className="dropdown_div">
                                            <div className="dropdown-map1">
                                                <span>Select TestRail Projects <span style={{ color: 'red' }}>*</span></span>
                                                <span className="release_span">Select Test Plans <span style={{ color: 'red' }}>*</span></span>
                                                {/* {(currentProject?.suite_mode == 2 || currentProject?.suite_mode == 1) && <span className="release_span">Select Test Plans <span style={{ color: 'red' }}>*</span></span>} */}
                                            </div>
                                            <div className="dropdown-map2">
                                                <Dropdown style={dropDownStyle} className="dropdown_project" placeholder="Select Project" optionLabel="name" options={testRailProjectsName} value={currentProject} onChange={(e) => onDropdownChange(e, "project")} />
                                                <Dropdown style={dropDownStyle} className="dropdown_release" placeholder="Select TestPlan" optionLabel="name" options={testPlans} value={currentIssue} onChange={(e) => onDropdownChange(e, "testplans")} disabled={disableIssue} />
                                                {/* {(currentProject?.suite_mode == 2 || currentProject?.suite_mode == 1) && <Dropdown style={dropDownStyle} className="dropdown_release" placeholder="Select TestPlan" optionLabel="name" options={testPlans} value={currentIssue} onChange={(e) => onDropdownChange(e, "testplans")} disabled={disableIssue} />} */}
                                            </div>
                                        </div>
                                        <div className='zephyrdata-card1'>
                                            {
                                                testSuites.length > 0 &&
                                                <Tree
                                                    value={testRailTreeData}
                                                    selectionMode="single"
                                                    selectionKeys={testRailNode}
                                                />
                                            }
                                            {/* <div className="jira__paginator">
                                                <Paginator
                                                    first={currentZepPage - 1}
                                                    rows={itemsPerPage}
                                                    totalRecords={projectDetails.length}
                                                    onPageChange={(e) => setCurrentZepPage(e.page + 1)}
                                                    totalPages={totalPages} // Set the totalPages prop
                                                />
                                            </div> */}
                                        </div>
                                    </Card>
                                </div>
                                <div>
                                    <div className="card_data2">
                                        <Card className="mapping_data_card2">
                                            <div className="dropdown_div">
                                                <div className="dropdown-map">
                                                    <span>Project <span style={{ color: 'red' }}>*</span></span>
                                                </div>
                                                <div className="dropdown-map">
                                                    {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                    <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                                </div>

                                                <div>
                                                    <div className="avotest__data">
                                                        <Tree value={updatedTreeData} selectionMode="multiple" selectionKeys={avoSelected} nodeTemplate={checkboxTemplate} className="avoProject_tree" />
                                                    </div>
                                                    <div className="testcase__AVO__jira__paginator">
                                                        {/* <Paginator
                                                            first={indexOfFirstScenario}
                                                            rows={scenariosPerPage}
                                                            totalRecords={listofScenarios.length}
                                                            onPageChange={onPageAvoChange}
                                                        /> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                                <span>
                                    {/* <Button className="map__btn" label="Map" size="small" onClick={() => handleSync()} /> */}
                                </span>
                            </div>
                        </TabPanel>
                        <TabPanel header="View Mapping">
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    )
}

export default TestRailContent
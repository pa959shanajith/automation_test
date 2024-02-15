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
    const [updatedTreeData, setUpdatedTreeData] = useState([]);
    const [selectedTestRailNode, setSelectedTestRailNode] = useState("");
    const [avoSelected, setAvoSelected] = useState([]);
    const [projectSuites, setProjectSuites] = useState([]);
    const [sectionData, setSectionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trTreeData, setTrTreeData] = useState([]);

    const toast = useRef();

    // constants, variables
    const projectDetails = JSON.parse(localStorage.getItem("DefaultProject"));
    const dropDownStyle = { width: '11rem', height: '2.5rem' };

    // use selectors
    const dispatch = useDispatch();
    const currentProject = useSelector(state => state.setting.selectedProject);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);

    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const setToast = (tag, summary, msg) => {
        toast.current.show({ severity: tag, summary: summary, detail: JSON.stringify(msg), life: 5000 });
    };

    const onDropdownChange = async (e) => {
        e.preventDefault();
        dispatch(selectedProject(e.value));
        setLoading(true);

        const testrailTestSuites = await api.getSuitesTestrail_ICE({
            TestRailAction: "getSuites",
            projectId: e.value.id
        });
        setLoading(false);

        if (testrailTestSuites.error)
            setToast("error", "Error", testrailTestSuites.error);

        testrailTestSuites.length > 0 && setProjectSuites(testrailTestSuites);
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

    // Fetching AVO testcases
    useEffect(() => {
        setLoading(true);
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
        setLoading(false);
    }, []);

    // Fetching Testrail test suites, test  sections & test  cases
    useEffect(() => {
        setLoading(true);
        const fetchSections = async () => {
            try {
                const testSection = [];

                for (const suite of projectSuites) {
                    const sections = await api.getSectionsTestrail_ICE({
                        "projectId": currentProject.id,
                        "suiteId": suite.id,
                        "testrailAction": "getSections"
                    });

                    testSection.push({
                        ...suite,
                        children: sections || []
                    });
                }


                const fetchTestCases = async (projectId, suiteId, sectionId) => {
                    try {
                        const response = await api.getTestcasesTestrail_ICE({
                            projectId,
                            suiteId,
                            sectionId,
                            testrailAction: "getTestCases"
                        });

                        const testCaseDetails = [];

                        if (response.length > 0) {
                            for (const testCase of response) {
                                const testCaseWithType = {
                                    ...testCase,
                                    type: "testcase",
                                    name: testCase.title
                                };
                                testCaseDetails.push(testCaseWithType);
                            }
                        }

                        return testCaseDetails;
                    } catch (error) {
                        console.error("Error fetching test cases:", error);
                        return [];
                    }
                };


                const organizeSectionsIntoHierarchy = async (sections, parentId = null) => {
                    const result = [];

                    for (const section of sections) {
                        if (section.parent_id === parentId) {
                            const children = await organizeSectionsIntoHierarchy(sections, section.id);
                            const newItem = { ...section, children };

                            if (children.length === 0) {
                                newItem.type = "parent";
                                const { suite_id, id: sectionId } = newItem;
                                newItem.children = await fetchTestCases(currentProject.id, suite_id, sectionId);
                            }

                            result.push(newItem);
                        }
                    }

                    return result;
                }

                const testCaseData = [];

                for (const section of testSection) {
                    const organizedHierarchy = await organizeSectionsIntoHierarchy(section.children) || [];

                    testCaseData.push({
                        ...section,
                        children: organizedHierarchy
                    });
                };

                setSectionData((sectionData) => testCaseData);
                setLoading(false);
            }
            catch (error) {
                console.log(error);
            }
        };

        fetchSections();
    }, [projectSuites]);

    const treeCheckboxTemplate = (node) => {
        if (node?.type === "testcase") {
            return <>
                <Checkbox
                    value={node?.id}
                    checked={avoSelected.includes(node._id)}
                    onChange={(e) => handleNode(e, node)}
                />
                <span className="scenario_label">{node.name}</span>
            </>
        }
        else return <span className="scenario_label">{node.name}</span>
    };

    useEffect(() => {
        setTestRailProjectsName(domainDetails?.projects);
    }, [domainDetails?.projects]);

    return (
        <div className="tab__cls">
            <div className="tab__cls">
                <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                    <TabPanel header="Mapping">
                        <div className="data__mapping">
                            <div className="card_data1">
                                <Card className="mapping_data_card1">
                                    <div className="dropdown_div">
                                        <div className="dropdown-map1">
                                            <span>Select TestRail Projects <span style={{ color: 'red' }}>*</span></span>
                                        </div>
                                        <div className="dropdown-map2">
                                            <Dropdown style={dropDownStyle} className="dropdown_project" placeholder="Select Project" optionLabel="name" options={testRailProjectsName} value={currentProject} onChange={(e) => onDropdownChange(e)} />
                                        </div>
                                    </div>
                                    <div className='zephyrdata-card1'>
                                        {
                                            sectionData.length > 0 &&
                                            <Tree
                                                value={sectionData}
                                                // value={trTreeData}
                                                selectionMode="single"
                                                selectionKeys={selectedTestRailNode}
                                                onSelectionChange={(e) => setSelectedTestRailNode(e.value)}
                                                nodeTemplate={treeCheckboxTemplate}
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
    )
}

export default TestRailContent;
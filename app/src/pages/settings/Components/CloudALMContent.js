import React, { forwardRef, useEffect, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Paginator } from 'primereact/paginator';
import "../styles/CloudALMContent.scss";
import { useSelector, useDispatch } from 'react-redux';
import { Tree } from 'primereact/tree';
import { getProjectsMMTS, readTestSuite_ICE } from '../../design/api';
import { viewALM_MappedList_ICE } from '../../settings/api';
import { Messages as MSG, setMsg } from '../../global';
import { enableSaveButton, mappedPair, almavomapped } from "../settingSlice";
import { InputText } from 'primereact/inputtext';
import { v4 as uuid } from 'uuid';

const CloudALMContent = ({ activeIndex, handleTabChange, testCaseData: allCalmTestCaseData }) => {
    // states
    const [currentCalmPage, setCurrentCalmPage] = useState(1);
    const [selectedNodes, setSelectedNodes] = useState({});
    const [avoSelected, setAvoSelected] = useState([]);
    const [calmFilterValue, setCalmFilterValue] = useState("");
    const [avoFilterValue, setAvoFilterValue] = useState("");
    const [treeData, setTreeData] = useState([]);
    const [updatedTreeData, setUpdatedTreeData] = useState([]);
    const [almTestcases, setAlmTestcases] = useState([]);

    // selectors/redux
    const dispatch = useDispatch();
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const almavomappedData = useSelector((state) => state.setting.almavomapped);

    // constants, variables
    const calmItemsPerPage = 10;
    const _uuid = uuid();
    const projectDetails = JSON.parse(localStorage.getItem("DefaultProject"));
    const startIndex = (currentCalmPage - 1) * calmItemsPerPage;
    const endIndex = Math.min(startIndex + calmItemsPerPage, almTestcases.length);

    const onCALMPageChange = event => {
        setCurrentCalmPage(event.page + 1);
    };

    const handleClick = (calmTestId, calmTestname) => {
        setSelectedNodes({ calmTestId, calmTestname });
    };

    useEffect(() => {
        const _viewMappedDetails = almavomappedData?.filter((data) => data.projectname === reduxDefaultselectedProject.projectName).filter((details) => {
            if (details.testid[0] === selectedNodes?.calmTestId) {
                return details;
            }
        });
        const updatedDataCopy = [...updatedTreeData];

        _viewMappedDetails.forEach((details) => {
            if (details.testscenarioid.length > 0) {
                details.testscenarioid.map((data) => {
                    updatedDataCopy.map((updatedData) => {
                        if (updatedData._id === data) {
                            updatedData.children.push({
                                testcaseType: "children",
                                _id: details.testid[0],
                                name: details.testname[0]
                            });
                        }
                    });
                });
            }
        });

        updatedDataCopy?.forEach((updatedData) => {
            const uniqueChildren = [];
            if (updatedData?.children?.length > 0) {
                const idSet = new Set();
                updatedData.children.forEach((child) => {
                    if (!idSet.has(child._id)) {
                        uniqueChildren.push(child);
                        idSet.add(child._id);
                    }
                });
            }
            updatedData.children = uniqueChildren.filter((child) => child._id == selectedNodes.calmTestId);
        });
        setUpdatedTreeData((updatedTreeData) => updatedDataCopy);
    }, [selectedNodes?.calmTestId])

    const handleSync = async () => {
        let scenarioIdDetails = [];
        let popupMsg = false;
        let scenarioIdsList = [];
        let batchDetails = [];
        if (avoSelected.length === 0) {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
        }

        const data = updatedTreeData?.map((item) => {
            if (avoSelected.includes(item._id)) {
                scenarioIdDetails.push({ _id: item._id, name: item.name, testSuite: item.testSuite });
                scenarioIdsList.push(item._id);
                return { ...item, checked: true, children: [{ _id: selectedNodes.calmTestId, name: selectedNodes.calmTestname, testcaseType: "children" }] }
            } else {
                return { ...item, checked: false }
            }
        });

        const scenarioIdsGroup = Object.groupBy(scenarioIdDetails, (arr) => arr?.testSuite?.name);

        for (let key in scenarioIdsGroup) {
            const testSuiteId = scenarioIdsGroup[key]?.map((data) => data.testSuite?._id);
            const avoTestCaseDetails = {
                _id: scenarioIdsGroup[key]?.map((data) => data._id),
                name: scenarioIdsGroup[key]?.map((data) => data.name)
            };

            const reqObject = [{
                "releaseid": "r1",
                "cycleid": "643f8b543f8ee3f7fe70823a",
                "testsuiteid": testSuiteId[0],
                "testsuitename": key,
            }]

            const fetchTestSuiteId = await readTestSuite_ICE(reqObject);

            const obj = {
                "projectId": projectDetails.projectId, // avo proj id
                "projectName": projectDetails.projectName, // avo proj name
                "testsuiteid": fetchTestSuiteId[testSuiteId[0]]['testsuiteid'] || '', // avo test suite id
                "testsuitename": key, // avo test suite
                "testscenarioids": avoTestCaseDetails._id, // avo test case id of mentioned above
                "scenarioname": avoTestCaseDetails.name, // avo test case name of mentioned above
                "mindmapid": testSuiteId[0],
                "getparampaths": [
                    ""
                ],
                "conditioncheck": [
                    0
                ],
                "accessibilityParameters": [
                    []
                ]
            };

            batchDetails = [...batchDetails, obj];
        };

        const mappedData = {
            "mappedDetails": [
                {
                    "projectId": projectDetails.projectId,
                    "projectName": projectDetails.projectName,
                    "scenarioId": scenarioIdsList, // selected avo testcase ids
                    "itemType": "Test Case",
                    "testCaseName": [selectedNodes.calmTestname], // selected calm test case name
                    "testcaseId": [selectedNodes.calmTestId] // selected calm test case id
                }
            ],
            batchDetails,
            "configurekey": _uuid,
            "action": "saveSAP_ALMDetails_ICE"
        };

        setTreeData(data);
        if (popupMsg) setMsg(popupMsg);
        setSelectedNodes({});
        setAvoSelected([]);
        dispatch(enableSaveButton(true));
        dispatch(mappedPair(mappedData));
    };

    const handleNode = (e, node) => {
        if (e.checked) {
            setAvoSelected([...avoSelected, node._id])
        }
        else {
            const nodeIndex = avoSelected.indexOf(node._id);
            let newSelectedNodes = [...avoSelected];
            if (nodeIndex !== -1) {
                newSelectedNodes.splice(nodeIndex, 1);
            }
            setAvoSelected(newSelectedNodes);
        }
    };

    const treeCheckboxTemplate = (node) => {
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

    const handleFilter = (filterText, type) => {
        if (filterText.length > 0) {
            if (type === "calm") {
                setAlmTestcases((prevAlmTestcases) => allCalmTestCaseData.filter(almTestcase =>
                    almTestcase.name.toLowerCase().includes(filterText.toLowerCase())
                ));
                setCalmFilterValue(filterText);
            } else if (type === "avo") {
                setUpdatedTreeData(() => treeData.filter(treenode =>
                    treenode.name.toLowerCase().includes(filterText.toLowerCase())
                ));
                setAvoFilterValue(filterText);
            }
        } else {
            setUpdatedTreeData(treeData);
            setAlmTestcases(allCalmTestCaseData);
            setCalmFilterValue("");
            setAvoFilterValue("");
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
        const { user_id } = JSON.parse(localStorage.getItem("userInfo")) || "";

        const fetchMappedDetails = async () => {
            try {
                const getModulesData = await viewALM_MappedList_ICE({
                    user_id,
                    action: "viewALM_MappedList_ICE"
                });

                if (getModulesData && getModulesData.length > 0) {
                    dispatch(almavomapped(getModulesData));
                }
            } catch (error) {
                console.error("Error fetching mapped details:", error);
            }
        };

        fetchMappedDetails();
    }, []);




    useEffect(() => {
        setAlmTestcases(allCalmTestCaseData);
        setUpdatedTreeData(treeData);
    }, [allCalmTestCaseData, treeData]);

    return (
        <TabView className='tab__cls' activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
            <TabPanel header="Mapping" className='flex alignItems'>
                <div id='cardsDiv'>
                    <Card className='column calm_cards' style={{ justifyContent: "space-between" }}>
                        <div className='calmTestCasesCard'>
                            <div className='column'>
                                <div className='flex' id='projectName'>
                                    <p className='text-bold'>ALM Testcases:</p>
                                </div>
                                <span className="p-input-icon-left" style={{ width: "100%", marginBottom: "15px" }}>
                                    <i className="pi pi-search" />
                                    <InputText style={{ width: "100%" }} onChange={(e) => handleFilter(e.target.value, "calm")} value={calmFilterValue} placeholder="Search testcase" />
                                </span>
                                {
                                    almTestcases.length > 0 ? (
                                        almTestcases.slice(startIndex, endIndex).map((data, i) => (
                                            <span key={i} className={`test_tree_nodes ${selectedNodes.calmTestId == data._id && "selected"} leafId`} title={data.name} onClick={(e) => handleClick(data._id, data.name)}>
                                                {data.name}
                                            </span>
                                        ))
                                    ) : <div>No testcases present</div>
                                }
                            </div>
                            <Paginator
                                first={startIndex}
                                rows={calmItemsPerPage}
                                totalRecords={almTestcases.length}
                                onPageChange={onCALMPageChange}
                                pageLinkSize={3}
                            />
                        </div>
                    </Card>
                    <Card className='column calm_cards'>
                        <div className='flex' id='projectName'>
                            <p className='text-bold'>AVO Project:</p>
                            <p className="selected_projNameText text-bold">{reduxDefaultselectedProject.projectName}</p>
                        </div>
                        <span className="p-input-icon-left" style={{ width: "100%" }}>
                            <i className="pi pi-search" />
                            <InputText style={{ width: "100%" }} onChange={(e) => handleFilter(e.target.value, "avo")} value={avoFilterValue} placeholder="Search testcase" />
                        </span>
                        {
                            updatedTreeData.length > 0 &&
                            <div className="avotest__data">
                                <Tree value={updatedTreeData} selectionMode="multiple" selectionKeys={selectedNodes} nodeTemplate={treeCheckboxTemplate} className="avoProject_tree" />
                            </div>
                        }
                    </Card>
                </div>
                <Button id='map-btn' label="Map" size="small" onClick={() => handleSync()} />
            </TabPanel>
        </TabView>
    )
}
export default forwardRef(CloudALMContent);
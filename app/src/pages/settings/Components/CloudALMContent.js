import React, { forwardRef, useEffect, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Paginator } from 'primereact/paginator';
import "../styles/CloudALMContent.scss";
import { useSelector, useDispatch } from 'react-redux';
import { Tree } from 'primereact/tree';
import * as api from '../../design/api';
import { Messages as MSG, setMsg } from '../../global';
import { enableSaveButton, mappedPair } from "../settingSlice";
import { InputText } from 'primereact/inputtext';

const CloudALMContent = ({ activeIndex, handleTabChange, testCaseData: allCalmTestCaseData }) => {
    // states
    const [currentCalmPage, setCurrentCalmPage] = useState(1);
    const [selectedNodes, setSelectedNodes] = useState({});
    const [avoSelected, setAvoSelected] = useState([]);
    const [rows, setRows] = useState([]);
    const [calmFilterValue, setCalmFilterValue] = useState("");
    const [avoFilterValue, setAvoFilterValue] = useState("");
    const [treeData, setTreeData] = useState([]);
    const [almTestcases, setAlmTestcases] = useState([]);

    // selectors/redux
    const dispatch = useDispatch();
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);

    // constants, variables
    const calmItemsPerPage = 10;
    const projectDetails = JSON.parse(localStorage.getItem("DefaultProject"));
    const startIndex = (currentCalmPage - 1) * calmItemsPerPage;
    const endIndex = Math.min(startIndex + calmItemsPerPage, almTestcases.length);
    const mappedTestcasesData = [
        {
            "_id": "6593e8ff6921aa8860e8a81c",
            "host": "localhost:8443",
            "parentid": [
                "41",
                "41"
            ],
            "projectid": [
                3,
                3
            ],
            "query": "saveZephyrDetails_ICE",
            "releaseid": [
                5,
                5
            ],
            "testid": [
                "32",
                "79"
            ],
            "testname": [
                "Testcase1",
                "Testcase4"
            ],
            "testscenarioid": [
                "6592684a36fe1f9ecc0e159e"
            ],
            "testscenarioname": [
                "TestCase1"
            ],
            "treeid": [
                "22",
                "22"
            ],
            "type": "Zephyr"
        },
        {
            "_id": "65b1e9b8dc9eedd5f8115f34",
            "host": "localhost:8443",
            "parentid": [
                "41"
            ],
            "projectid": [
                3
            ],
            "query": "saveZephyrDetails_ICE",
            "releaseid": [
                5
            ],
            "reqdetails": [
                []
            ],
            "testid": [
                "32"
            ],
            "testname": [
                "Testcase1"
            ],
            "testscenarioid": [
                "65a91c770dc128a754a1adf4",
                "65a91ca30dc128a754a1adfc",
                "65a91c900dc128a754a1adf8"
            ],
            "testscenarioname": [
                "TestCase0",
                "TestCase2",
                "TestCase1"
            ],
            "treeid": [
                "22"
            ],
            "type": "Zephyr"
        }
    ];



    const onCALMPageChange = event => {
        setCurrentCalmPage(event.page + 1);
    };

    const handleClick = (id, name) => {
        setSelectedNodes({ id, name });
    }

    const handleSync = () => {
        let scenarioId = [];
        let popupMsg = false;
        if (avoSelected.length === 0) {
            popupMsg = MSG.INTEGRATION.WARN_SELECT_SCENARIO;
        }

        const data = treeData.map((item) => {
            if (avoSelected.includes(item._id)) {
                scenarioId.push(item._id);
                return { ...item, checked: true, children: [{ ...selectedNodes, testcaseType: "children" }] }
            } else {
                return { ...item, checked: false }
            }
        });

        const mappedData = {
            "mappedDetails": [
                {
                    "projectId": projectDetails.projectId,
                    "projectName": projectDetails.projectName,
                    "scenarioId": scenarioId,
                    "itemType": "Test Case",
                    "testCaseName": [selectedNodes.name],
                    "testcaseId": [selectedNodes.id]
                }
            ],
            "action": "saveSAP_ALMDetails_ICE"
        };

        setTreeData(data);
        if (popupMsg) setMsg(popupMsg);
        setSelectedNodes([]);
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
                <span className="scenario_label">{node.name}</span>
            </>
        }
        else return <span className="scenario_label">{node.name}</span>
    };

    // const handleUnSyncmappedData = async (items, testname) => {
    //     let filteredRows = [];
    //     for (let singleRow of rows) {
    //         const testCaseIdData = [];
    //         const testCaseNamesData = [];
    //         let unsyncedTestId;
    //         for (let testidIdx in singleRow.testid) {
    //             if (singleRow.testid[testidIdx] !== unsyncedTestId) {
    //                 testCaseIdData.push(singleRow.testid[testidIdx]);
    //                 testCaseNamesData.push(singleRow.testCaseNames[testidIdx]);
    //             }
    //         }
    //         if (testCaseIdData.length > 0)
    //             filteredRows.push({
    //                 ...singleRow,
    //                 testid: testCaseIdData,
    //                 testCaseNames: testCaseNamesData
    //             });
    //     }
    //     setRows(filteredRows);
    // };

    const handleFilter = (filterText, type) => {
        console.log("filterText", filterText);
        if (filterText.length) {
            if (type == "calm") {
                setAlmTestcases((prevAlmTestcases) => allCalmTestCaseData.filter(almTestcase =>
                    almTestcase.name.toLowerCase().includes(filterText.toLowerCase())
                ));
                setCalmFilterValue(filterText);
            } else if (type == "avo") {
                setTreeData((treeData) => treeData.filter(treenode =>
                    treenode.name.toLowerCase().includes(filterText.toLowerCase())
                ))
                setAvoFilterValue(filterText);
            }
        };
    };

    useEffect(() => {
        setAlmTestcases(allCalmTestCaseData);
    }, [allCalmTestCaseData]);

    useEffect(() => {
        const fetchAvoModules = async () => {
            const req = {
                tab: "createTab",
                projectid: projectDetails.projectId,
                version: 0,
                cycId: null,
                modName: "",
                moduleid: null
            };

            const getModulesData = await api.getModules(req);
            const defaultTreeData = [];

            getModulesData.map((element) => {
                if (element.type !== "endtoend") {
                    defaultTreeData.push({ ...element, "children": [], "checked": false, "testcaseType": "parent" });
                }
            });
            setTreeData(defaultTreeData);
        };

        fetchAvoModules();
    }, []);

    // useEffect(() => {
    //     let totalCounts = 0;
    //     let mappedScenarios = 0;
    //     let mappedTests = 0;
    //     let tempRow = [];

    //     mappedTestcasesData.forEach(mappedTestcase => {
    //         totalCounts = totalCounts + 1;
    //         mappedScenarios = mappedScenarios + mappedTestcase?.testscenarioname.length;
    //         mappedTests = mappedTests + mappedTestcase?.testname.length;
    //         tempRow.push({
    //             'testCaseNames': mappedTestcase?.testname,
    //             'scenarioNames': mappedTestcase?.testscenarioname,
    //             'mapId': mappedTestcase?._id,
    //             'scenarioId': mappedTestcase?.testscenarioid,
    //             'testid': mappedTestcase?.testid,
    //             "reqDetails": mappedTestcase?.reqdetails
    //         });
    //     });
    //     setRows(tempRow);
    // }, []);

    return (
        <TabView className='tab__cls' activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
            <TabPanel header="Mapping" className='flex'>
                <div id='cardsDiv'>
                    <Card className='column calm_cards' style={{ justifyContent: "space-between" }}>
                        <div className='calmTestCasesCard'>
                            <div className='column'>
                                <div className='flex' id='projectName'>
                                    <p>ALM Testcases:</p>
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText onChange={(e) => handleFilter(e.target.value, "calm")} value={calmFilterValue} placeholder="Search testcase" />
                                    </span>
                                </div>
                                {
                                    almTestcases.length > 0 ? (
                                        almTestcases.slice(startIndex, endIndex).map((data, i) => (
                                            <span key={i} className={`test_tree_nodes ${selectedNodes.name == data.name && "selected"} leafId`} title={data.name} onClick={(e) => handleClick(data._id, data.name)}>
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
                            <p>AVO Project:</p>
                            <p className="selected_projNameText">{reduxDefaultselectedProject.projectName}</p>
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText onChange={(e) => handleFilter(e.target.value, "avo")} value={avoFilterValue} placeholder="Search testcase" />
                            </span>
                        </div>
                        {
                            Boolean(treeData) &&
                            <div className="avotest__data">
                                <Tree value={treeData} selectionMode="multiple" selectionKeys={selectedNodes} nodeTemplate={treeCheckboxTemplate} className="avoProject_tree" />
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
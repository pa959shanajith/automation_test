import { React, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import { excelToZephyrMappings, zephyrTestcaseDetails_ICE } from '../api';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { InputSwitch } from "primereact/inputswitch";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import {
    resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, showOverlay
} from '../settingSlice';
import "../styles/ZephyrContent.scss";


const ZephyrContent = ({ visible, onHide, selectedscreen }) => {
    const uploadFileRef = useRef();
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectetestcase, setSelectedtestcase] = useState(null);
    const dispatchAction = useDispatch();
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [listofScenarios, setListofScenarios] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [importMap, setImportMap] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [selectSheet, setSelectSheet] = useState(null);
    const [selectZephyrProject, setSelectZephyrProject] = useState(null);
    const [selectZephyrRelease, setSelectZephyrRelease] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [error, setError] = useState('');
    const [fileUpload, setFiledUpload] = useState(undefined);
    const [sheetList, setSheetList] = useState([]);
    const dropdownRef = useRef();
    const [data, setData] = useState([
        {
            key: "grandparent1",
            label: "Grandparent 1",
            children: [
                {
                    key: "parent1",
                    label: "Parent 1",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
        {
            key: "grandparent2",
            label: "Grandparent 2",
            children: [
                {
                    key: "parent2",
                    label: "Parent 2",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
    ]);

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

    const testcaseAvo = [
        { name: 'testcase1', code: 'NY' },
        { name: 'testcase2', code: 'RM' },
        { name: 'testcase3', code: 'LDN' },
    ];

    const zephyrProj = [
        { name: 'project 1', code: 'NY' },
        { name: 'project 2', code: 'RM' },
        { name: 'project 3', code: 'LDN' },
        { name: 'project 4', code: 'IST' },
    ];

    const zephyrRelease = [
        { name: 'Release 1', code: 'NY' },
        { name: 'Release 2', code: 'RM' },
        { name: 'Release 3', code: 'LDN' },
        { name: 'Release 4', code: 'IST' },
    ];

    const zephyrTestCase = [
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
            Zephyr: 'Zephyr TestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            zephyr: 'Zephyr TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            zephyr: 'Zephyr TestCase 3'
        },
    ];


    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch })
    }


    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    const showLogin = () => {
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        dispatchAction(selectedProject(''));
        dispatchAction(selectedTestCase([]));
        setAvoProjectsList([]);
        setListofScenarios([]);
        dispatchAction(selectedAvoproject(''))
    };

    const TreeNodeCheckbox = (node) => {

        const onCheckboxChange = (e) => {
            setCheckedAvo((prevCheckedNodes) => {
                const updatedCheckedNodes = { ...prevCheckedNodes, [node.key]: e.checked };
                return updatedCheckedNodes;
            });
        };
        const hasChildren = node.children && node.children.length > 0;
        if (hasChildren) {
            return (
                <>
                    <div style={{ width: '100%' }}>
                        <Checkbox onChange={onCheckboxChange} checked={checkedAvo[node.key]} />
                        <span>{node.label}</span>
                        <i className="pi pi-times unmap__icon" style={{ float: 'right' }}></i>
                    </div>
                </>
            );
        }

        return (
            <>
                <div style={{ width: '100%' }}>
                    <span>{node.label}</span>
                    <i className="pi pi-times unmap__icon" style={{ float: 'right' }}></i>
                </div>
            </>
        );
    };


    const footerIntegrations = (
        <div className='btn-11'>
            {activeIndex === 0 && (
                <div className="btn__2">
                    <Button label="Save" severity="primary" className='btn1' />
                    <Button label="Back" onClick={showLogin} size="small" className="logout__btn" />
                </div>)}

            {activeIndex === 1 && (
                <Button label="Back" onClick={showLogin} size="small" className="cancel__btn" />)}

        </div>
    );

    const uploadFile = async ({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch }) => {
        var file = uploadFileRef.current.files[0]
        if (!file) {
            return;
        }
        var extension = file.name.substr(file.name.lastIndexOf('.') + 1)
        dispatch(showOverlay('Uploading...'));
        try {
            const result = await read(file)
            if (extension === 'xls' || extension === 'xlsx') {
                var res = await excelToZephyrMappings({ 'content': result, 'flag': "sheetname" })
                dispatch(showOverlay(''));
                if (res.error) { setError(res.error); return; }
                if (res.length > 0) {
                    setFiledUpload(result)
                    setSheetList(res)
                } else {
                    setError("File is empty")
                }
            }
            else {
                setError("File is not supported")
            }
            dispatch(showOverlay(''));
        } catch (err) {
            dispatch(showOverlay(''));
            setError("invalid File!")
        }
    }


    function read(file) {
        return new Promise((res, rej) => {
            var reader = new FileReader();
            reader.onload = function () {
                res(reader.result);
            }
            reader.onerror = () => {
                rej("fail")
            }
            reader.onabort = () => {
                rej("fail")
            }
            reader.readAsBinaryString(file);
        })
    }

    // const checkboxTemplate = (node) => {
    //     return (
    //         <div style={{ width: '100%' }}>
    //             <Checkbox
    //                 checked={selectedNodes.includes(node.key)}
    //                 onChange={() => onCheckboxChange(node.key)}
    //             />
    //             <span>{node.label} </span>
    //             <i className="pi pi-times" style={{ float: 'right' }}></i>
    //         </div>
    //     );
    // };
    const confirmPopupMsg = (
        <div> <p>Note : If you import already mapped testcases will be unmapped</p></div>
    )

    const importMappingFooter = (
        <>
        <Button label='Import' size='small' severity="primary"></Button>
        </>
    )

    // const onCheckboxChange = (nodeKey) => {
    //     const nodeIndex = selectedNodes.indexOf(nodeKey);
    //     const newSelectedNodes = [...selectedNodes];
    //     if (nodeIndex !== -1) {
    //         newSelectedNodes.splice(nodeIndex, 1);
    //     } else {
    //         newSelectedNodes.push(nodeKey);
    //     }
    //     setSelectedNodes(newSelectedNodes);
    // };



    return (
        <>
            <div ref={dropdownRef}>
                {/* <Dialog header={selectedscreen.name ? `Manage Integration: ${selectedscreen.name} Integration` : 'Manage Integrations'} className='zephyrDialog' visible={visible} style={{ width: '70vw', height: '45vw', overflowX: 'hidden' }} onHide={onHide} footer={footerIntegrations}> */}
                    <div>
                        <div className="tab__cls1">
                            {activeIndex === 0 && <img className='import_img' src="static/imgs/import_icon.svg" id="lll" onClick={() => setShowNote(true)} />}
                            <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                <TabPanel header="Mapping">
                                    <div className="zephyr__mapping">
                                        <div className="card_zephyr1">
                                            <Card className="mapping_zephyr_card1">
                                                <div className="dropdown_div1">
                                                    <div className="dropdown-zephyr1">
                                                        <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                        <span className="release_span"> Select Release<span style={{ color: 'red' }}>*</span></span>
                                                    </div>
                                                    <div className="dropdown-zephyr2">
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrProject} className="dropdown_project" options={zephyrProj} onChange={(e) => setSelectZephyrProject(e)} placeholder="Select Project" /> */}
                                                        <Dropdown value={selectZephyrProject} onChange={(e) => setSelectZephyrProject(e.value)} options={zephyrProj} optionLabel="name"
                                                            placeholder="Select a City" className="project_dropdown" />
                                                        <Dropdown value={selectZephyrRelease} onChange={(e) => setSelectZephyrRelease(e.value)} options={zephyrRelease} optionLabel="name"
                                                            placeholder="Select a City" className="release_dropdown" />
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrRelease} className="dropdown_release" options={zephyrRelease} onChange={(e) => setSelectZephyrRelease(e)} placeholder="Select Release" /> */}
                                                    </div>

                                                </div>
                                                {selectZephyrProject && selectZephyrRelease && (<div className='zephyrdata-card1'>
                                                    <Tree
                                                        value={data}
                                                        selectionMode="checkbox"
                                                        selectionKeys={selectedKeys}
                                                        onSelectionChange={(e) => setSelectedKeys(e.value)}
                                                    // nodeTemplate={nodeTemplate}

                                                    />
                                                </div>)}
                                            </Card>
                                        </div>

                                        <div>
                                            <div className="card_zephyr2">
                                                <Card className="mapping_zephyr_card2">
                                                    <div className="dropdown_div1">
                                                        <div className="dropdown-zephyr">
                                                            <span>Selected Project <span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-zephyr">
                                                            {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                            <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>

                                                        </div>

                                                        <div className="avotest__zephyr">
                                                            <Tree value={avotestcases} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                        <span>
                                            {/* <img className="map__btn__zephyr" src="static/imgs/map_button_icon.svg" /> */}
                                            <Button className="map__btn__zephyr" label='Map' severity='primary' size='small'></Button>
                                        </span>
                                    </div>


                                </TabPanel>

                                <TabPanel header="View Mapping">
                                    <Card className="view_map_zephyr">
                                        <div className="flex justify-content-flex-start toggle_btn">
                                            <span>Zephyr Testcase to Avo Assure Testcase</span>
                                            <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                            <span>Avo Assure Testcase to Zephyr Testcase</span>
                                        </div>

                                        {checked ? (<div className="accordion_testcase">
                                            <Accordion multiple activeIndex={0} >
                                                {avoTestCase.map((testcase) => (
                                                    <AccordionTab header="Avo Assure Testcase">
                                                        <span>{testcase.Zephyr}</span>
                                                    </AccordionTab>))}
                                            </Accordion>
                                        </div>

                                        ) : (

                                            <div className="accordion_testcase">
                                                <Accordion multiple activeIndex={0}>
                                                    {zephyrTestCase.map((testCase) => (
                                                        <AccordionTab header="Zephyr Testcase">
                                                            <span>{testCase.avoassure}</span>
                                                        </AccordionTab>))}
                                                </Accordion>
                                            </div>
                                        )}
                                    </Card>

                                </TabPanel>

                            </TabView>

                            <AvoConfirmDialog
                                visible={showNote}
                                onHide={() => setShowNote(false)}
                                showHeader={false}
                                message={confirmPopupMsg}
                                icon="pi pi-exclamation-triangle"
                                accept={() => { setImportMap(true); }} />

                        </div>
                    </div>
                    <Dialog header="Import mappings" visible={importMap} onHide={() => { setImportMap(false); setFiledUpload(undefined) }} style={{ height: fileUpload && selectZephyrProject ?'96vh':fileUpload ? '46vh' : '28vh', width: fileUpload && selectZephyrProject ?'36vw':fileUpload ? '39vw' : '28vw' }} footer={importMappingFooter}>
                        <div>
                            <div>
                                <label>Upload Excel File: </label>
                                <input type='file' accept=".xls, .xlsx" onChange={upload} ref={uploadFileRef} />
                            </div>
                            <div className='dropdown_lists'>
                                {fileUpload && (
                                    <>
                                        <div>
                                            <label>Select Sheet:</label>
                                            <Dropdown
                                                value={selectSheet}
                                                options={[...sheetList.map((sheet) => ({ label: sheet, value: sheet })),]}
                                                onChange={(e) => setSelectSheet(e.value)}
                                                placeholder="Select Sheet"
                                                className='excelSheet_dropdown'
                                            />
                                        </div>
                                        <div>
                                            <label>Select Project:</label>
                                            <Dropdown
                                                value={selectZephyrProject}
                                                onChange={(e) => setSelectZephyrProject(e.value)}
                                                options={zephyrProj}
                                                optionLabel="name"
                                                placeholder="Select Project"
                                                className='selectProject_dropdown'/>
                                                
                                        </div>
                                        <div>
                                            <label>Select Release:</label>
                                            <Dropdown
                                                value={selectZephyrRelease}
                                                onChange={(e) => setSelectZephyrRelease(e.value)}
                                                options={zephyrRelease}
                                                optionLabel="name"
                                                placeholder="Select Release"
                                                className='selectRelease_dropdown'/>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                {fileUpload && selectZephyrProject &&(
                                    <>
                                        <div>
                                            <div className='zephyrdata-card1 selectPhase'>
                                                <label>
                                                    Select Phase/Module
                                                </label>
                                                <Tree
                                                    value={data}
                                                    selectionMode="checkbox"
                                                    selectionKeys={selectedKeys}
                                                    onSelectionChange={(e) => setSelectedKeys(e.value)}

                                                />
                                            </div>
                                            <div>
                                            <label>Select AVO Project:</label>
                                            <Dropdown value={selectetestcase} onChange={(e) => setSelectedtestcase(e.value)} options={testcaseAvo} optionLabel="name" 
                placeholder="Select AVO Project" className='testcase_data_2'/>

                                            </div>
                                        </div>

                                    </>
                                )}
                            </div>
                        </div>
                    </Dialog>
                {/* </Dialog> */}
            </div>
        </>)
}
export default ZephyrContent;
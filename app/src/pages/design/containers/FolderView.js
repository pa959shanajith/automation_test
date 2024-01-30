import React, { useRef, useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/FolderView.scss'
import { Tooltip } from 'primereact/tooltip';
import { InputText } from 'primereact/inputtext';
import { Tree } from 'primereact/tree';
import { Toast } from 'primereact/toast';
import { getModules, getScreens, populateScenarios, getProjectList, saveE2EDataPopup, getProjectsMMTS, updateE2E } from '../api'
import { transformDataFromTreetoFolder, handlingTreeOfTestSuite } from './MindmapUtilsForOthersView';
import { screenData, typeOfOprationInFolder, selectedScreenOfStepSlice, } from '../designSlice';
import FolderViewRightContainer from './FolderViewRightContainer';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ContextMenu } from 'primereact/contextmenu';
import { CascadeSelect } from 'primereact/cascadeselect';
const FolderView = (props) => {
    const dispatch = useDispatch();
    const eventsOfFolder = useSelector(state => state.design.typeOfOprationInFolder);
    const moduleLists = useSelector(state => state.design.moduleList)
    const proj = useSelector(state => state.design.selectedProj)
    const [selectedNodeKey, setSelectedNodeKey] = useState('');
    const [selectedStepData, setSelectedStepData] = useState([]);
    const [childComponents, setChildComponents] = useState([]);
    const [expandedMainNode, setExpandedMainNode] = useState();
    const [screenDatapassing, setScreenDatapassing] = useState({});
    const [eventSelectData, setEventSelectData] = useState('');
    const [valueOfNewTS, setValueOfNewTS] = useState(null);
    const [testCaseVar, setTestCaseVar] = useState(null);
    const [modifiedDataToChange, setModifiedDataToChange] = useState(null);
    const [modifiedDataToAddNewTSG, setModifiedDataToAddNewTSG] = useState(null);
    const [passSelectedTSforRenaming, setPassSelectedTSforRenaming] = useState();
    const [editingOfTS, setEditingOfTS] = useState(true);
    const [createNewTS, setCreateNewTS] = useState(false);
    const [valueOfRenaming, setValueOfRenaming] = useState(null);
    const [renaming, setRenaming] = useState(false);
    const [tSIndex, setTSIndex] = useState();
    const [tCDataToRename, setTCDataToRename] = useState({});
    const [editingOfTC, setEditingOfTC] = useState(true);
    const [valueOfRenamingTC, setValueOfRenamingTC] = useState(null);
    const [renamingTC, setRenamingTC] = useState(true);
    const toast = useRef(null);
    const operationOnSuites = useRef(null);
    const operationOnCases = useRef(null);
    const operationOnTestSteps = useRef(null);
    moduledataForTree = [];

    // Assuming `moduleLists` and `childComponents` are defined somewhere before this code
    const onlyNormalSuites = moduleLists.filter(mod => mod.type === 'basic');

    // Function to handle new test suite
    // Loop through normal suites and add them to moduledataForTree
    for (let h = 0; h < onlyNormalSuites.length; h++) {
        moduledataForTree.push({
            key: h,
            label: [
                <img src="static/imgs/moduleIcon.png" alt="modules" />,
                <div style={{
                    width: '10rem',
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>
                    {renaming && h === passSelectedTSforRenaming.node.key ? <> <InputText className='inputOfTS'
                        value={valueOfRenaming}

                        // placeholder=""
                        onChange={(e) => setValueOfRenaming(e.target.value)}
                        onBlur={() => { if (valueOfRenaming?.length > 0) { setRenaming(false); } }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setRenaming(false);
                                setValueOfRenaming(e.target.value);
                                setTSIndex(h)
                                dispatch(typeOfOprationInFolder({ reNamingOfTS: [valueOfRenaming, onlyNormalSuites[h]._id] }))
                            }
                        }}
                        autoFocus
                    /> </> :
                        <>
                            {valueOfRenaming !== null && valueOfRenaming?.length > 0 && h === passSelectedTSforRenaming.node.key && h === tSIndex ? valueOfRenaming : onlyNormalSuites[h].name}

                        </>
                    }
                </div>,
                <Button
                    label="..."
                    value={h}
                    onMouseDownCapture={(e) => { operationOnSuites.current.show(e); }}
                    // onClick={()=>receivingfullTreeDataOnClickOfMoreButton(h)}
                    className='buttonForMoreTestSuites'
                    text
                />
            ],
            data: [{
                layer: "layer_1",
                testSuitName: onlyNormalSuites[h].name,
                testSuitId: onlyNormalSuites[h]._id,
                childOfTestSuit: [childComponents && childComponents[h] && childComponents[h].length && childComponents[h][0].length ? childComponents[h][0] : [{}]]
            }],
            children: childComponents && childComponents[h] && childComponents[h].length && childComponents[h][0].length ? childComponents[h][0] : [{}],
            // edit:(newValue)=>receivingfullTreeDataOnClickOfMoreButton(h,newValue)
        });

    }

    // UI to create new Test Suite
    if (createNewTS) {
        const newObject = {
            key: onlyNormalSuites.length,
            label: [
                <img src="static/imgs/moduleIcon.png" alt="modules" />,
                <div style={{
                    width: '13rem',
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }}>{editingOfTS ? <InputText className='inputOfTS'
                    value={valueOfNewTS}
                    // placeholder=""
                    onChange={(e) => setValueOfNewTS(e.target.value)}
                    onBlur={() => { if (valueOfNewTS?.length > 0) { setEditingOfTS(false); dispatch(typeOfOprationInFolder({ createNewTestSuit: valueOfNewTS })) } }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setEditingOfTS(false);
                            setValueOfNewTS(e.target.value);
                            dispatch(typeOfOprationInFolder({ createNewTestSuit: valueOfNewTS }))
                        }
                    }}
                    autoFocus
                /> : valueOfNewTS}</div>,
                <Button label="..." className='buttonForMoreTestSuites' text />
            ],
            data: [{}],
            children: [{}]
        };

        moduledataForTree.unshift(newObject);
    }

    let moduledataForTree;


    const onExpandOfNode = async (event) => {
        dispatch(typeOfOprationInFolder({ onExpand: event.node }))


        let suitId = event.node.data[0]?.testSuitId;
        //key of opened (toggled) suit
        let key = event.node.key
        var req = {
            tab: "createTab",
            projectid: proj,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: suitId
        }
        try {
            var res = await getModules(req)
        }
        catch (error) {
            console.log("error while fetching getModules", error)
        }


        // Call the function to update the data
        const modifiedData = transformDataFromTreetoFolder(res);
        setModifiedDataToChange(modifiedData)
        setModifiedDataToAddNewTSG(modifiedData)
        setSelectedStepData(modifiedData.children)
        const testCases = handlingTreeOfTestSuite(key, modifiedData, operationOnCases, operationOnTestSteps)

        const multiSuitChild = { ...childComponents, [key]: [testCases] };
        setChildComponents(multiSuitChild)
        // }
    };
    const onCollapse = (event) => {
        dispatch(typeOfOprationInFolder({ onCollapse: event.node }))
        // toast.current.show({ severity: 'warn', summary: 'Node Collapsed' });
        const node = event.node;
        if (node && node.key === expandedMainNode) {
            setExpandedMainNode(null);
        }
    };

    const onSelect = async (event) => {

        dispatch(typeOfOprationInFolder({ onSelect: event.node }))
        setEventSelectData(event.node.data[0])
        setPassSelectedTSforRenaming(event);
        setTCDataToRename(event.node);
        var dispatchingScreenOfSelectedStep = {};
        for (let i = 0; i < selectedStepData?.length; i++) {
            for (let j = 0; j < selectedStepData[i].children.length; j++) {
                if (selectedStepData[i].children[j]._id === event?.node?.data[0]?.testStepGroupId) {
                    setScreenDatapassing(selectedStepData[i].children[j]);
                    dispatchingScreenOfSelectedStep = selectedStepData[i].children[j]
                    break;
                }
            }

        }

        let suitId = event.node.data[0]?.testSuitId;
        //key of opened (toggled) suit
        let key = event.node.key
        var req = {
            tab: "createTab",
            projectid: proj,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: suitId
        }
        try {
            var res = await getModules(req)

        }
        catch (error) {
            console.log("error while fetching getModules", error)
        }


        // Call the function to update the data
        const modifiedData = transformDataFromTreetoFolder(res);
        setModifiedDataToChange(modifiedData);
        const testCases = handlingTreeOfTestSuite(key, modifiedData, operationOnCases, operationOnTestSteps)

        setTestCaseVar(testCases)
        dispatch(selectedScreenOfStepSlice(testCases))
        // setChildComponents(testCases)



    };

    const onUnselect = (event) => {
        dispatch(typeOfOprationInFolder({ onUnselect: event.node }))
    };
    // context Menu function
    const menuItemsTestSuite = [
        { label: 'Add Testcase', icon: <img src="static/imgs/add-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} />, command: () => { addNewTestCase(); } },
        { label: 'Add Multiple Testcases', icon: <img src="static/imgs/addmultiple-icon.png" alt='addmultiple icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { label: 'Debug', icon: <img src="static/imgs/Execute-icon.png" alt="execute" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { separator: true },
        { label: 'Rename', icon: <img src="static/imgs/edit-icon.png" alt="rename" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} />, command: () => { setRenaming(true); } },
    ];
    const menuItemsTestCase = [
        { label: 'Add Test Steps Groups', icon: <img src="static/imgs/add-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} />, command: () => { dispatch(typeOfOprationInFolder({ addNewTestStepGroup: true })) } },
        { label: 'Add Multiple Test Steps Groups', icon: <img src="static/imgs/addmultiple-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { separator: true },
        { label: 'Avo Genius (Smart Recorder)', icon: <img src="static/imgs/genius-icon.png" alt="genius" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { label: 'Debug', icon: <img src="static/imgs/Execute-icon.png" alt="execute" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { label: 'Impact Analysis ', icon: <img src="static/imgs/brain.png" alt="execute" style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { separator: true },
        { label: 'Rename', icon: <img src="static/imgs/edit-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} />, command: () => { setValueOfRenamingTC(""); setRenamingTC(true); handleRenamingTC(); } },
        { label: 'Delete', icon: <img src="static/imgs/delete-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },

    ];
    const menuItemsTestStepGroup = [
        { label: 'Rename', icon: <img src="static/imgs/edit-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },
        { label: 'Delete', icon: <img src="static/imgs/delete-icon.png" alt='add icon' style={{ height: "25px", width: "25px", marginRight: "0.5rem" }} /> },

    ];

    const addNewTestCase = () => {
        const newTestCaseElement = {
            key: null,
            label: [
                <img src="static/imgs/node-scenarios.svg" alt="TestCase" />,
                <div></div>,
            ],
            data: [{
                testCaseName: null,

                addTestCase: true
            }],
            children: [],
        };
        setTestCaseVar([...testCaseVar, newTestCaseElement]);
        dispatch(selectedScreenOfStepSlice([...testCaseVar, newTestCaseElement]));

    }

    async function receivingfullTreeDataOnClickOfMoreButton() {
        // let reNamingInput = <div><InputText className='inputOfTS'
        //     value={valueOfRenaming}
        //     // placeholder=""
        //     onChange={(e) => setValueOfRenaming(e.target.value)}
        //     onBlur={() => { if (valueOfRenaming?.length > 0) { setRenaming(false); } }}
        //     onKeyDown={(e) => {
        //         if (e.key === 'Enter') {
        //             setRenaming(false);
        //             setValueOfRenaming(e.target.value);

        //         }
        //     }}
        //     autoFocus
        // /></div>
        let reNamingInput = [
            <img src="static/imgs/moduleIcon.png" alt="modules" />,
            <div style={{
                width: '10rem',
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}><InputText className='inputOfTS'
                value={valueOfRenaming}
                // placeholder=""
                onChange={(e) => setValueOfRenaming(e.target.value)}
                onBlur={() => { if (valueOfRenaming?.length > 0) { setRenaming(false); } }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setRenaming(false);
                        setValueOfRenaming(e.target.value);
                    }
                }}
                autoFocus
                />
            </div>,
            <Button
                label="..."
                className='buttonForMoreTestSuites'
                text
            />
        ]
        moduledataForTree[passSelectedTSforRenaming.node.key].label = reNamingInput;

        // let suitData = onlyNormalSuites[key]
        // if (suitData) {
        //     let suitId = suitData._id;
        //     var req = {
        //         tab: "createTab",
        //         projectid: proj,
        //         version: 0,
        //         cycId: null,
        //         modName: "",
        //         moduleid: suitId
        //     }
        //     try {
        //         var res = await getModules(req)
        //     }
        //     catch (error) {
        //         console.log("error while fetching getModules", error)
        //     }
        //     const modifiedData = transformDataFromTreetoFolder(res);
        //     const testCases = handlingTreeOfTestSuite(key, modifiedData)
        //     const moduleAndItsTreeChild = [];
        //     moduleAndItsTreeChild[0] = suitData;
        //     moduleAndItsTreeChild[1] = testCases

        // }


    }
    let recievingRenamingData;
    function handleRenamingTC() {
        const selectedTCToRename = passSelectedTSforRenaming?.node
        const keyTS = selectedTCToRename?.key?.slice(0, 1)
        const renamingTCIndex = selectedTCToRename?.key?.slice(2 - 3);
        //    setValueOfRenamingTC(selectedTCToRename.data[0].testCaseName)
        setRenamingTC(true);
        setValueOfRenamingTC(null)
        const renameTC = [
            <img src="static/imgs/node-scenarios.svg" alt="modules" />,
            <div style={{
                width: '10rem',
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}> {renamingTC ? <> <InputText className='inputOfTC'
                value={valueOfRenamingTC}
                // placeholder=""
                onChange={(e) => setValueOfRenamingTC(e.target.value)}
                onBlur={() => { if (valueOfRenamingTC?.length > 0) { setRenamingTC(false); } }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        setRenamingTC(false);
                        setValueOfRenamingTC(e.target.value);
                        handleRenamingTC
                    }
                }}
                autoFocus
            /> </> : valueOfRenamingTC}</div>, <Button onMouseDownCapture={(e) => { operationOnCases.current.show(e) }} className='buttonForMoreTestCases' label="..." text />
        ];
        if (valueOfRenamingTC !== null) {
            recievingRenamingData = valueOfRenamingTC;
            dispatch(typeOfOprationInFolder({ reNamingOfTestCase: [valueOfRenamingTC, renamingTCIndex] }))
        };
        let pushingInputToTC = [];
        pushingInputToTC.push(handlingTreeOfTestSuite(selectedTCToRename?.key, modifiedDataToChange, operationOnCases, operationOnTestSteps, renameTC, recievingRenamingData))
        setChildComponents({ ...childComponents, [keyTS]: pushingInputToTC })
    }
    useEffect(() => {
        if (!renamingTC) { handleRenamingTC() }

    }, [renamingTC])


    return (
        <>
            <div className='folderViewLeftContainer'>
                {/* <h1>folder view</h1> */}
                <ContextMenu model={menuItemsTestSuite} ref={operationOnSuites} />
                <ContextMenu model={menuItemsTestCase} ref={operationOnCases} />
                <ContextMenu model={menuItemsTestStepGroup} ref={operationOnTestSteps} />
                <div className='normalModuleSection'>
                    <div className='ModuleTitleAndPlusBtn commonClass'>
                        <img src="static/imgs/moduleLayerIcon.png" alt="moduleLayerIcon" />
                        <h3 className="normalModHeadLine">Test Suite Folder</h3>
                        <img className="" src="static/imgs/import_new_18x18_icon.svg" ></img>
                        <img className="plusNormal" onClick={() => { setCreateNewTS(true); }} src="static/imgs/plusNew.png" alt="NewModules" />
                        <Tooltip target=".custom-target-icon" content=" Create Test Suite" position="bottom" />
                    </div>
                    <div className='searchNormal'>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search" title=' Search for Test Suite' />
                        </span>
                    </div>
                    <div className='treeNormal'>
                        <div className="card flex justify-content-center">
                            <Toast ref={toast} />
                            <Tree value={moduledataForTree} selectionMode="single" selectionKeys={selectedNodeKey} onSelectionChange={(e) => { setSelectedNodeKey(e.value); }}
                                onExpand={onExpandOfNode} onCollapse={onCollapse} onSelect={onSelect} onUnselect={onUnselect} expandedKeys={expandedMainNode !== null ? [expandedMainNode] : []} className="w-full md:w-30rem" />

                        </div>
                    </div>
                </div>
                {/* <FolderViewControlBox/> */}
                <div className='E2ESection'>
                    <div className='E2ETitleAndPlusBtn commonClass'>
                        <img src="static/imgs/moduleLayerIcon.png" alt="moduleLayerIcon" />
                        <h3 className="normalModHeadLine">End to End Flow</h3>
                        {/* <img className="" src="static/imgs/import_new_18x18_icon.svg" ></img> */}
                        <img className=" " src="static/imgs/plusNew.png" alt="NewModules" />
                        <Tooltip target=".custom-target-icon" content=" Create Test Suite" position="bottom" />
                    </div>
                    <div className='searchE2E'>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText placeholder="Search" title=' Search for Test Suite' />
                        </span>
                    </div>
                    <div className='treeE2E'>
                        <div className="card" style={{ alignItems: "center", display: "flex", justifyContent: "center" }}>
                            <Card style={{ width: "21.5rem", height: "7rem" }}>
                                {/* <Button label='Save' onClick={modifyingStepGroupToParent} /> */}
                            </Card>
                        </div>
                    </div>
                </div>


            </div>
            <FolderViewRightContainer modifiedData={modifiedDataToChange} modifiedDataToAddNewTSG={modifiedDataToAddNewTSG} setBlockui={props.setBlockui} screenDatapassing={screenDatapassing} eventSelectData={eventSelectData} />
        </>
    )
}
export default FolderView;



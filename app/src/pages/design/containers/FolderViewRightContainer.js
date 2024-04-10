import React, { useRef, useEffect, useState, Fragment } from 'react';
import '../styles/FolderViewRightContainer.scss'
import { useSelector, useDispatch } from 'react-redux';
import { getModules, getScreens, populateScenarios, getProjectList, saveE2EDataPopup, getProjectsMMTS, updateE2E } from '../api'
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { screenData, typeOfOprationInFolder, selectedScreenOfStepSlice, } from '../designSlice';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import CaptureModal from '../containers/CaptureScreenForFolderView';
import DesignModal from '../containers/DesignTestStepForFolderView.js';
import { TabView, TabPanel } from 'primereact/tabview';
import SaveMapButton from '../components/SaveMapButton';
import { InputText } from 'primereact/inputtext';
import { transformDataFromTreetoFolder } from './MindmapUtilsForOthersView';

const FolderViewRightContainer = (props) => {
    const dispatch = useDispatch();
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [createnew, setCreateNew] = useState(false)
    const [verticalLayout, setVerticalLayout] = useState(true)
    const [valueOfNewAddedCase, setValueOfNewAddedCase] = useState(null)
    const [editing, setEditing] = useState(true)
    const [valueOfNewAddedstepGrp, setValueOfNewAddedstepGrp] = useState(null)
    const [editingOfStep, setEditingOfStep] = useState(true)
    const [parentScreenData, setParentScreenData] = useState(null);
    const [showTCList, setShowTCList] = useState([]);
    const [selectedTSToAddnewTC, setSelectedTSToAddnewTC] = useState('');
    const eventsOfFolder = useSelector(state => state.design.typeOfOprationInFolder);
    const selectedScreen = useSelector(state => state.design.selectedScreenOfStepSlice);
    const projectAppType = useSelector((state) => state.landing.defaultSelectProject);

    let selectedProject = JSON.parse(localStorage.getItem('DefaultProject'));


    let Proj = projectAppType;
    if (selectedProject) {
        Proj = selectedProject;
    }
    useEffect(() => {
        if (eventsOfFolder?.onSelect?.data[0]?.layer === "layer_1") {
            if (selectedTSToAddnewTC !== eventsOfFolder?.onSelect?.data[0]?.testSuitId) {
                handlingSelectedNode()
            }
        }
    }, [eventsOfFolder?.onSelect])
    useEffect(() => {
        if (eventsOfFolder.addNewTestCase === true) {
            handleAddnewTestCases()
            // setValueOfNewAddedCase(null)
        }
    }, [eventsOfFolder.addNewTestCase === true])
    useEffect(() => {
        if (eventsOfFolder.createNewTestSuit !== null) {
            if (eventsOfFolder.createNewTestSuit.length) {
                modifyingStepGroupToParentAndSaveFun()
            }
        }
        if (eventsOfFolder.reNamingOfTS !== null) {
            if (eventsOfFolder.reNamingOfTS[0].length) {
                handleRenamingNodes()
            }
        }
        if (eventsOfFolder.reNamingOfTestCase !== null) {
            if (eventsOfFolder.reNamingOfTestCase[0].length) {
                handleRenamingNodes()
            }
        }
    }, [eventsOfFolder.createNewTestSuit, eventsOfFolder.reNamingOfTS, eventsOfFolder.reNamingOfTestCase]);

    const eventLayer = eventsOfFolder.onSelect?.data[0]?.layer
    const handlingBreadCrumb = () => {
        let itemsOf = [];
        // alert('hello')
        if (eventLayer === "layer_1" || eventLayer === "layer_2" || eventLayer === "layer_3") {
            itemsOf.push({ label: eventsOfFolder?.onSelect?.data[0]?.testSuitName });
            if (eventLayer === "layer_2" || eventLayer === "layer_3") {
                itemsOf.push({ label: eventsOfFolder?.onSelect?.data[0]?.testCaseName });
            }
            if (eventLayer === "layer_3") {
                itemsOf.push({ label: eventsOfFolder?.onSelect?.label[1] });
            }


        }
        return (itemsOf);
    }
    async function handlingSelectedNode() {
        if (eventsOfFolder?.onSelect?.data[0]?.layer === "layer_1") {
            setSelectedTSToAddnewTC(eventsOfFolder?.onSelect?.data[0]?.testSuitId)
            let suitID = eventsOfFolder?.onSelect?.data[0]?.testSuitId
            var req = {
                tab: "createTab",
                projectid: Proj,
                version: 0,
                cycId: null,
                modName: "",
                moduleid: suitID
            }
            try {
                var res = await getModules(req)

            }
            catch (error) {
                console.log("error while fetching getModules", error)
            }
            const modifiedData = transformDataFromTreetoFolder(res);
            setShowTCList(modifiedData.children);
        }
        // if (eventsOfFolder.addNewTestCase === true) {
        //     const newTCData = {

        //     }
        //     showTCList.push(newTCData)
        //     // setShowTCList(...showTCList,newTCData)
        // }


    }
    function handleAddnewTestCases() {
        // if (eventsOfFolder.addNewTestCase === true && editing === true) {
        let newTCData = { newTC: true }
        setShowTCList([...showTCList, newTCData])
        // }

    }
    function handleAddedTC() {
        if (valueOfNewAddedCase !== null && valueOfNewAddedCase.length) {
            let addedNewTCName = { name: valueOfNewAddedCase }
            let tempListOfNewTC = [...showTCList];
            const data = tempListOfNewTC.splice(tempListOfNewTC.length - 1, 1, addedNewTCName);
            setShowTCList(tempListOfNewTC)
            setValueOfNewAddedCase(null)
            setEditing(true);
        }
    }
    function passingTSGDataTolist() {


    }
    const items = handlingBreadCrumb();
    //     console.log("modulkeList",props.modifiedDataToAddNewTSG)
    //     if( props.modifiedDataToAddNewTSG.children?.length){
    //         const data = props.modifiedDataToAddNewTSG;
    //     const selectedTCForAddingTSG =data.children._id.find(eventsOfFolder.onSelect.data[0].testCaseId)
    //     console.log("selectedTC",selectedTCForAddingTSG)
    // }
    //here the screen will be directly fetched to testCases from parent of TSG.
    const extractingScreenFromTSG = () => {
        const data = eventsOfFolder.onSelect.data[0].layer === 'layer_1' ? props.modifiedData : props.modifiedDataToAddNewTSG;
        for (let cases = 0; cases < data?.children?.length; cases++) {
            //here every TestCases will looped
            for (let steps = 0; steps < data.children[cases].children.length; steps++) {
                //here every TestStepGroup looped for screen 
                let parentScreen = []
                parentScreen = data.children[cases].children[steps].parent;
                parentScreen.parent.id = data?.children[cases].id;
                data.children[cases].children[steps] = parentScreen;
                // setStepKey(steps)
            }

            data.children[cases] = data?.children[cases]
        }
        return data;
    }

    //modifying testStepGroup to screen and step, also making data to save
    const modifyingStepGroupToParentAndSaveFun = () => {
        // const data = props.modifiedDataToAddNewTSG;
        // console.log("data",data)


        if (eventsOfFolder.createNewTestSuit === null) {
            // const data = eventsOfFolder.onSelect.data[0].layer === 'layer_1' ? props.modifiedData : props.modifiedDataToAddNewTSG;
            const data = extractingScreenFromTSG();
            const selectedTCForAddingTSG = data.children.find((e) => e._id === eventsOfFolder.onSelect.data[0].testCaseId)

            data.id = 0;
            data.display_name = data.name
            if (eventsOfFolder.onSelect.data[0].layer === 'layer_2') {
                const findingIndexOfTCToAddTSG = data.children.findIndex((e) => e._id === selectedTCForAddingTSG._id)
                let TSuitChild = data.children;
                let TCChildLength = 0;
                let screenChildLength = 0;

                for (let i = 0; i < TSuitChild.length; i++) {
                    TCChildLength += TSuitChild[i].children.length;

                    const TCChild = TSuitChild[i].children;
                    for (let j = 0; j < TCChild.length; j++) {
                        screenChildLength += TCChild[j].children.length;
                    }
                }
                const gettingLengthOfAllNode = data.children.length + TCChildLength + screenChildLength

                const newTestStep = {
                    childIndex: 1,// adding from TSG to TSG has to handle it should change
                    cidxch: "true",
                    children: [],
                    id: gettingLengthOfAllNode + 2,//data.children.length + selectedTCForAddingTSG.children.length + 2,//adding from TSG to TSG has to handle
                    cidxch: "true",
                    name: valueOfNewAddedstepGrp,
                    display_name: valueOfNewAddedstepGrp.slice(0, 10),
                    projectID: data.projectID,
                    reuse: true,
                    state: "created",
                    stepsLen: 0,
                    task: null,
                    taskexists: null,
                    type: "testcases",
                    _id: null,
                    path: ""
                }

                const newScreenData = {
                    childIndex: selectedTCForAddingTSG.children.length + 1,//check
                    children: [],
                    cidxch: "true",
                    id: gettingLengthOfAllNode + 1,//data.children.length + selectedTCForAddingTSG.children.length + 1,//check
                    name: valueOfNewAddedstepGrp,
                    display_name: valueOfNewAddedstepGrp.slice(0, 10),
                    objLen: 0,//check
                    parent: selectedTCForAddingTSG,
                    projectID: data.projectID,
                    reuse: true,
                    state: "created",
                    task: null,
                    taskexists: null,
                    type: "screens",
                    _id: null,
                    path: ""
                }
                newScreenData.children.push(newTestStep);
                newTestStep.parent = newScreenData;
                newTestStep.screenname = newScreenData.name;

                data.children[findingIndexOfTCToAddTSG].children.push(newScreenData);
            }

            if (eventsOfFolder.onSelect.data[0].layer === 'layer_1') {
                const newTestCase = {
                    childIndex: data.children.length + 1,
                    cidxch: "true",
                    children: [],
                    display_name: valueOfNewAddedCase.slice(0, 10),
                    id: data.children.length + 1,
                    name: valueOfNewAddedCase,
                    parent: data,
                    projectID: data.projectID,
                    reuse: false,
                    state: "created",
                    task: null,
                    taskexists: null,
                    type: "scenarios",
                    _id: null,
                    path: ''
                }
                data.children[data.children.length] = newTestCase;
            }
            setParentScreenData(data)
        }
        if (eventsOfFolder.createNewTestSuit !== null) {
            if (eventsOfFolder.createNewTestSuit.length) {
                const createNewTestSuite = {
                    childIndex: 0,
                    cidxch: "true",
                    children: [],
                    display_name: eventsOfFolder.createNewTestSuit,
                    id: 0,
                    name: eventsOfFolder.createNewTestSuit,
                    parent: null,
                    projectID: Proj.projectId,
                    reuse: false,
                    state: "created",
                    task: null,
                    taskexists: null,
                    type: "modules",
                    _id: null,
                }
                setParentScreenData(createNewTestSuite)
            }
        }



    }
    function handleRenamingNodes() {
        // const data = eventsOfFolder.onSelect.data[0].layer === 'layer_1' ? props.modifiedData : props.modifiedDataToAddNewTSG;
        const data = extractingScreenFromTSG();
        if (eventsOfFolder?.reNamingOfTS !== null && eventsOfFolder.reNamingOfTS[0].length) {
            data.original_name = data.name;
            data.name = eventsOfFolder.reNamingOfTS[0];
            data.rnm = true;
        }
        if (eventsOfFolder?.reNamingOfTestCase !== null && eventsOfFolder.reNamingOfTestCase[0].length > 0) {
            // const renamedTestCase = data.children.find((e)=>e._id ===eventsOfFolder.reNamingOfTestCase[1] )
            data.children[eventsOfFolder.reNamingOfTestCase[1]].name = eventsOfFolder.reNamingOfTestCase[0]
        }

        setParentScreenData(data);

    }
    // function handleRenamingTC () {
    //     const data = eventsOfFolder.onSelect.data[0].layer === 'layer_1' ? props.modifiedData : props.modifiedDataToAddNewTSG;
    //     data.original_name = data.name;
    //     data.name = eventsOfFolder.reNamingOfTS[0];
    //     data.rnm = true;
    //     setParentScreenData(data);

    // }


    function handleSaveButton() {

    }

    return (
        <div className='folderViewRightMaincontainer'>
            <div className="card">
                <Card>
                    {/* {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_3" ?
                        null :
                        <div style={{ display: eventLayer === "layer_1" || eventLayer === "layer_2" || eventLayer === "layer_3" ? "" : "none" }} className='BreadOfRightSide'>
                            <BreadCrumb model={items} className='brdcmb' />
                        </div >} */}
                    {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_1" || eventsOfFolder?.onSelect?.data[0]?.layer === "layer_2" ?
                        <div className='childOfSuites'>

                            {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_1" ? (
                                // {console.log("showTCList",showTCList)}
                                showTCList.map((e, i) => {
                                    return (
                                        <div className='testCaseList'>
                                            <img className='testCaseImg' src="static/imgs/node-scenarios.svg" alt="node-scenarios" />

                                            {eventsOfFolder.addNewTestCase === true && editing === true && e.newTC === true ?
                                                <InputText className='inputOfCase' value={valueOfNewAddedCase}
                                                    // placeholder=" "
                                                    onChange={(e) => { setValueOfNewAddedCase(e.target.value) }}
                                                    onBlur={() => { if (valueOfNewAddedCase !== null && valueOfNewAddedCase.length > 0) { { setEditing(false); } } }}
                                                    // Handle click outside the input
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setEditing(false)
                                                            setValueOfNewAddedCase(e.target.value);
                                                            dispatch(typeOfOprationInFolder({ addNewTestCase: false }))
                                                            modifyingStepGroupToParentAndSaveFun()
                                                            handleAddedTC()

                                                            // modifyingStepGroupToParentAndSaveFun()
                                                            // addNewTestCase()
                                                        }
                                                        else {
                                                            // setValueOfNewAddedCase(e.target.value);
                                                            // modifyingStepGroupToParent(); 
                                                        }
                                                    }}
                                                    autoFocus /> : null}
                                            {eventsOfFolder.addNewTestCase === false && editing === false && e.newTC === true ? <h3 className='testCaseTxt' key={i}>{valueOfNewAddedCase}</h3> : <h3 className='testCaseTxt' key={i}>{e.name}</h3>}</div>
                                    )


                                }
                                    // showTCList.map((e, i) => {
                                    //     return(
                                    //         <h3 className='testCaseTxt' key={i}>{e.name}</h3>
                                    //     )
                                    // }
                                )) : null}
                            {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_2" ? (
                                <>

                                    {eventsOfFolder.onSelect.children.map((stepGrp, i) => (
                                        <div className='testCaseList' key={i}>
                                            <img className='testCaseImg' src="static/imgs/testStepGroup.png" alt="testStepGroup" />
                                            {/* {eventsOfFolder?.addNewTestStepGroup === true && editingOfStep === true && e.newTSG === true ?
                                                <InputText className='inputOfCase' value={valueOfNewAddedstepGrp}
                                                    // placeholder=" "
                                                    onChange={(e) => { setValueOfNewAddedstepGrp(e.target.value) }}
                                                    onBlur={() => { if (valueOfNewAddedstepGrp !== null && valueOfNewAddedstepGrp.length > 0) { { setEditingOfStep(false); } } }}
                                                    // Handle click outside the input
                                                    onKeyDown={(e) => {
                                                        ``
                                                        if (e.key === 'Enter') {
                                                            setEditingOfStep(false)
                                                            setValueOfNewAddedstepGrp(e.target.value);
                                                            dispatch(typeOfOprationInFolder({ addNewTestStepGroup: false }))
                                                            // modifyingStepGroupToParentAndSaveFun()
                                                            handleAddedTC()

                                                            // modifyingStepGroupToParentAndSaveFun()
                                                            // addNewTestCase()
                                                        }
                                                        else {
                                                            // setValueOfNewAddedCase(e.target.value);
                                                            // modifyingStepGroupToParent(); 
                                                        }
                                                    }}
                                                    autoFocus /> : null}
                                            {eventsOfFolder.addNewTestStepGroup === false && editingOfStep === false && e.newTSG === true ? <h3 className='testCaseTxt' key={i}>{valueOfNewAddedstepGrp}</h3> : <h3 className='testCaseTxt' key={i}>{stepGrp?.data[0]?.testStepGroupName}</h3>} */}
                                            <h3 className='testCaseTxt'>{stepGrp?.data[0]?.testStepGroupName}</h3>
                                        </div>
                                    ))}
                                    {eventsOfFolder?.addNewTestStepGroup === true ? (
                                        <>
                                            {editingOfStep === true ? (
                                                <div className='testCaseList'>
                                                    <img className='testCaseImg' src="static/imgs/testStepGroup.png" alt="testStepGroup" />
                                                    <InputText className='inputOfStepGrp'
                                                        value={valueOfNewAddedstepGrp}
                                                        // placeholder="enterNewTestStepGroup"
                                                        onChange={(e) => setValueOfNewAddedstepGrp(e.target.value)}
                                                        onBlur={() => { if (valueOfNewAddedstepGrp?.length > 0) setEditingOfStep(false); }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                setEditingOfStep(false);
                                                                setValueOfNewAddedstepGrp(e.target.value);
                                                                modifyingStepGroupToParentAndSaveFun();
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                </div>) : <div className='testCaseList'>
                                                <img className='testCaseImg' src="static/imgs/testStepGroup.png" alt="testStepGroup" />
                                                <h3 className='testCaseTxt'>{valueOfNewAddedstepGrp}</h3>
                                            </div>}
                                        </>
                                    ) : null}
                                </>
                            ) : null}



                        </div> :
                        <div className='tabOfCaptureAndDesign'>

                            {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_3" ?
                                <div style={{ display: 'flex' }} className='breadAndTabViews'>
                                    <div className='BreadOfRightSide'>
                                        <BreadCrumb model={items} className='brdcmb' />
                                    </div>
                                    <TabView className='tabViews'>
                                        <TabPanel header="Capture Elements">
                                            <CaptureModal visibleCaptureElement={visibleCaptureElement} setVisibleCaptureElement={setVisibleCaptureElement} fetchingDetails={props.screenDatapassing.parent} />
                                        </TabPanel>
                                        <TabPanel header="Design Test Steps">
                                            <DesignModal fetchingDetails={props.screenDatapassing} appType={Proj.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} />
                                        </TabPanel>
                                    </TabView>
                                </div>
                                // <div className='centerField' >
                                //     <div className='centerButtons'>
                                //         <Button className="ButOfCapture" onClick={() => setVisibleCaptureElement(true)} label="Capture Elements" />
                                //         <Button className="ButOfDesign" onClick={() => setVisibleDesignStep(true)} label="Design Test Steps" />
                                //     </div>
                                // </div> 
                                : null}</div>}
                    {/* <Button onClick={() => handleSaveButton()} className="saveButton" label='Save' /> */}
                    <SaveMapButton setBlockui={props.setBlockui} createnew={createnew} verticalLayout={verticalLayout} dNodesFolder={parentScreenData} />
                    {/* <Button style={{width:'7rem',height:"3rem"}} className=""  label="cancel" />
                                <Button style={{width:'7rem',height:"3rem"}}className=""  label="save" /> */}

                    {/* list of children components on right container */}
                    {/* <div className="col-12">
                <div className="flex flex-column xl:flex-row xl:align-items-center p-4 gap-4">
                    <img className="w-9 sm:w-16rem xl:w-4rem shadow-2 block xl:block mx-auto border-round" src="static/imgs/node-scenarios.svg" alt="productName" />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="text-2xl font-bold text-900">scenari0001</div>
                        </div>
                    </div>
                </div>
                </div> */}
                </Card>
            </div>
        </div>
    )

}
export default FolderViewRightContainer;
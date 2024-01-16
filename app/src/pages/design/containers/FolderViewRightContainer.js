import React, { useRef, useEffect, useState, Fragment } from 'react';
import '../styles/FolderViewRightContainer.scss'
import { useSelector, useDispatch } from 'react-redux';
import { getModules, getScreens, populateScenarios, getProjectList, saveE2EDataPopup, getProjectsMMTS, updateE2E } from '../api'
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Rating } from 'primereact/rating';
import { Tag } from 'primereact/tag';
import CaptureModal from '../containers/CaptureScreenForFolderView';
import DesignModal from '../containers/DesignTestStepForFolderView.js';
import { TabView, TabPanel } from 'primereact/tabview';
import SaveMapButton from '../components/SaveMapButton';
import { InputText } from 'primereact/inputtext';

const FolderViewRightContainer = (props) => {
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [createnew, setCreateNew] = useState(false)
    const [verticalLayout, setVerticalLayout] = useState(true)
    const [valueOfNewAddedCase, setValueOfNewAddedCase] = useState(null)
    const [editing, setEditing] = useState(true)
    const [valueOfNewAddedstepGrp, setValueOfNewAddedstepGrp] = useState(null)
    const [editingOfStep, setEditingOfStep] = useState(true)
    const [parentScreenData, setParentScreenData] = useState(null);
    const eventsOfFolder = useSelector(state => state.design.typeOfOprationInFolder);
    const selectedScreen = useSelector(state => state.design.selectedScreenOfStepSlice);
    const projectAppType = useSelector((state) => state.landing.defaultSelectProject);

    let selectedProject = JSON.parse(localStorage.getItem('DefaultProject'));
    let Proj = projectAppType;
    if (selectedProject) {
        Proj = selectedProject;
    }

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
    const items = handlingBreadCrumb();
    //     console.log("modulkeList",props.modifiedDataToAddNewTSG)
    //     if( props.modifiedDataToAddNewTSG.children?.length){
    //         const data = props.modifiedDataToAddNewTSG;
    //     const selectedTCForAddingTSG =data.children._id.find(eventsOfFolder.onSelect.data[0].testCaseId)
    //     console.log("selectedTC",selectedTCForAddingTSG)
    // }
    //modifying testStepGroup to screen and step, also making data to save
    const modifyingStepGroupToParentAndSaveFun = () => {
        // const data = props.modifiedDataToAddNewTSG;
        // console.log("data",data)



        const data = eventsOfFolder.onSelect.data[0].layer === 'layer_1' ? props.modifiedData : props.modifiedDataToAddNewTSG;
        const selectedTCForAddingTSG = data.children.find((e) => e._id === eventsOfFolder.onSelect.data[0].testCaseId)

        console.log("selectedTC", selectedTCForAddingTSG)
        data.id = 0;
        data.display_name = data.name
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
            console.log("screen", data.children[0].children[0])
        }
        if (eventsOfFolder.onSelect.data[0].layer === 'layer_2') {
            const findingIndexOfTCToAddTSG = data.children.findIndex((e) => e._id === selectedTCForAddingTSG._id)
            console.log("addingNewStepGrpToTC", findingIndexOfTCToAddTSG)
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
            console.log("Total TCChildLength:", TCChildLength);
            console.log("Total screenChildLength:", screenChildLength);
            console.log("Total nodeLength:", gettingLengthOfAllNode);
            //         childIndex: 1
            // children: []
            // cidxch: "true"
            // display_name: "TestSteps1"
            // id: 3
            // name: "TestSteps1"
            // parent: {id: 2, children: Array(0), y: 443, x: 90, parent: {…}, …}
            // path: ""
            // state: "created"
            // type: "testcases"
            // mapTS
            // childIndex
            // : 
            // 1
            // cidxch
            // : 
            // "true"
            // id
            // : 
            // 6
            // name
            // : 
            // "TSG0006"
            // oid
            // : 
            // null
            // orig_name
            // : 
            // null
            // pid   /////// actual == 5
            // : 
            // undefined
            // pid_c
            // : 
            // undefined
            // projectID
            // : 
            // "657c2d9bce3c0be6ba4bf032"
            // renamed
            // : 
            // false
            // screenname  /////actual ==  screen2
            // : 
            // undefined
            // state
            // : 
            // "created"
            // task
            // : 
            // null
            // taskexists
            // : 
            // null
            // type
            // : 
            // "testcases"
            // _id
            // : 
            // null
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
            //         screen {
            //             childIndex: 1
            // children: [{…}]
            // cidxch: "true"
            // display_name: "Screen1"
            // id: 2
            // name: "Screen1"
            // parent: {_id: '659ee64aa698ffaf57ecd6d7', childIndex: 1, children: Array(0), name: 'TestCase1csc', projectID: '657c2d9bce3c0be6ba4bf032', …}
            // path: ""
            // state: "created"
            // type: "screens"

            //         }
            //             mapScreen
            //             childIndex
            // : 
            // 1
            // cidxch
            // : 
            // null  ////true
            // id
            // : 
            // 5
            // name
            // : 
            // "TSG0006"
            // oid
            // : 
            // null
            // orig_name
            // : 
            // null
            // pid
            // : 
            // 2
            // pid_c
            // : 
            // undefined
            // projectID
            // : 
            // "657c2d9bce3c0be6ba4bf032"
            // renamed
            // : 
            // false
            // state
            // : 
            // "created"
            // task
            // : 
            // null
            // taskexists
            // : 
            // null
            // type
            // : 
            // "screens"
            // _id
            // : 
            // null
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
        const createNewTestSuite = {
            childIndex: 0,
            cidxch: "true",
            children: [],
            display_name: '',
            id: 0,
            name: '',
            parent: null,
            projectID: data.projectID,
            reuse: false,
            state: "created",
            task: null,
            taskexists: null,
            type: "modules",
            _id: null,
        }

        setParentScreenData(data)

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
                                selectedScreen?.map((e, i) => {
                                    return (
                                        <div className='testCaseList'>
                                            <img className='testCaseImg' src="static/imgs/node-scenarios.svg" alt="node-scenarios" />
                                            {e?.data[0]?.addTestCase === true && editing === true ?
                                                <InputText className='inputOfCase' value={valueOfNewAddedCase}
                                                    placeholder="enterNewTestCaseName"
                                                    onChange={(e) => { setValueOfNewAddedCase(e.target.value); }}
                                                    onBlur={() => { if (valueOfNewAddedCase.length > 0) { { setEditing(false); } } }}
                                                    // Handle click outside the input
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setEditing(false)
                                                            setValueOfNewAddedCase(e.target.value);
                                                            modifyingStepGroupToParentAndSaveFun()
                                                            // addNewTestCase()
                                                        }
                                                        else {
                                                            // setValueOfNewAddedCase(e.target.value);
                                                            // modifyingStepGroupToParent(); 
                                                        }
                                                    }}
                                                    autoFocus /> : null}
                                            {e?.data[0]?.addTestCase === true && editing === false ? <h3 className='testCaseTxt' key={i}>{valueOfNewAddedCase}</h3> : <h3 className='testCaseTxt' key={i}>{e?.data[0]?.testCaseName}</h3>}</div>
                                    )


                                })) : null}
                            {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_2" ? (
                                <>

                                    {eventsOfFolder.onSelect.children.map((stepGrp, i) => (
                                        <div className='testCaseList' key={i}>
                                            <img className='testCaseImg' src="static/imgs/testStepGroup.png" alt="testStepGroup" />
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
                                                        placeholder="enterNewTestStepGroup"
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
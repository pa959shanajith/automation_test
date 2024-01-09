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


    //modifying testStepGroup to screen and step, also making data to save
    const modifyingStepGroupToParentAndSaveFun = () => {
        const data = props.modifiedData;

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
        data.id = 0;
        data.display_name = data.name
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
        setParentScreenData(data)

    }


    return (
        <div className='folderViewRightMaincontainer'>
            <div className="card">
                <Card>
                    {eventsOfFolder?.onSelect?.data[0]?.layer === "layer_3" ?
                        null :
                        <div style={{ display: eventLayer === "layer_1" || eventLayer === "layer_2" || eventLayer === "layer_3" ? "" : "none" }} className='BreadOfRightSide'>
                            <BreadCrumb model={items} className='brdcmb' />
                        </div >}
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
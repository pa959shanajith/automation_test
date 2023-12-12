import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import './ALMIntegration.scss';
import { Tooltip } from "primereact/tooltip";
import { getAvoDetails, saveSAP_ALMDetails_ICE } from './pages/settings/api';

const AMLIntegration = props => {
    const selectedProject = JSON.parse(localStorage.getItem('DefaultProject'));
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [scenarioList, setScenarioList] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [mapApiIData, setMapApiIData] = useState({});

    useEffect(() => {
        (async () => {
            if (userInfo && userInfo?.user_id !== '' && props.almDialogVisible) {
                fetchProject();
            }
        })();
    }, [props.almDialogVisible]);

    const fetchProject = async () => {
        const projectScenario = await getAvoDetails(userInfo?.user_id);
        if (projectScenario.error)
            // setToast("error", "Error", projectScenario.error);
            console.log(projectScenario);
        else if (projectScenario === "unavailableLocalServer")
            console.log(projectScenario);
        // setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (projectScenario === "scheduleModeOn")
            console.log(projectScenario);
        // setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (projectScenario === "Invalid Session") {
            console.log(projectScenario);
            // setToast("error", "Error", 'Invalid Session');
        }
        else if (projectScenario && projectScenario.avoassure_projects && projectScenario.avoassure_projects.length) {
            console.log(projectScenario.avoassure_projects);
            const scenarioList = projectScenario.avoassure_projects.filter((el, i) => { return el.project_id === selectedProject?.projectId });
            // if(el.project_id === selectedProject?.projectId){
            //     return 
            // }
            let removeDuplicates = new Set(scenarioList)
            console.log("scenarioList", scenarioList[0].scenario_details);
            console.log("scenarioList", removeDuplicates);

            setScenarioList(scenarioList[0].scenario_details === '' ? [] : scenarioList[0].scenario_details);
            // setAvoProjectsList(projectScenario.avoassure_projects);
            // onAvoProjectChange(projectScenario.avoassure_projects);
            // setSelectedRel(releaseId);  
            // clearSelections();
        }
    }

    console.log("props.almTestcaseData", props.almTestcaseData);
    // {Object.keys(webSocketRes).map((key) => (
    //     <div key={key}>
    //         <strong>{key}:</strong> {JSON.stringify(webSocketRes[key])}
    //     </div>
    // ))}

    const onChangeScenarioCheck = (e) => {
        // let _selectedCategories = [...selectedCategories];
        if (e.checked)
            setSelectedCategories(e.value);
            // _selectedCategories.push(e.value);
        else 
            setSelectedCategories('');
    }

    const onClickMapping = () => {
        let mappingScenario = {
            "mappedDetails": [
                {
                    "projectId": props.almTestcaseData?.project,
                    "projectName": props.almTestcaseData?.projectName,
                    "scenarioId": [selectedCategories],
                    "itemType": "Test Case",
                    "testCaseName": props.almTestcaseData?.testCaseName,
                    "testCaseDescription": props.almTestcaseData?.testCaseDescription
                }
            ],
            "action": "saveSAP_ALMDetails_ICE",
            "testcaseId": props.almTestcaseData?.testcaseId
        }
        setMapApiIData(mappingScenario);
        console.log('mapApiIData', mappingScenario);
    }

    const onClickSaveALM = async() => {
        const almData = await saveSAP_ALMDetails_ICE(mapApiIData);
        console.log("almData", almData);
        if(almData.error){
            console.log("error");
        }
        if(almData.data === 'success'){
            console.log("success");
        }
        props.almDialogHide();
    }
    const almFooter = () => (
        <>
            <Button size='small' label='Cancel' onClick={props.almDialogHide} disabled={false} text></Button>
            <Button size='small' label='Save' onClick={onClickSaveALM} disabled={false}></Button>
        </>
    )

    return (

        <div>
            <Dialog header="Response socket" style={{ height: "45rem", width: "60rem" }} visible={props.almDialogVisible} onHide={props.almDialogHide} footer={almFooter}>
                <div className='alm_integration_main_conatiner'>
                    {/* ALM Details */}
                    <div className="alm_details_container card">
                        {/* title="ALM Details" */}
                        <div className="flex flex-column  pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Project ID</label>
                            <InputText
                                data-test="projectId"
                                value={props.almTestcaseData?.project}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>

                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Project Name</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.projectName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Scope Name</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.scopeName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Process</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.process}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Process Name</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.processName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Testcase Name</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.testCaseName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                // id="password"
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <Tooltip target={'.testcase_description'} content={props.almTestcaseData?.testCaseDescription} />
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Testcase Description</label>
                            <InputText
                                // data-test="password"
                                value={props.almTestcaseData?.testCaseDescription}
                                className={`w-full md:w-20rem p-inputtext-sm testcase_description`}
                                // onChange={(event) => { passwordChange(event.target.value) }}
                                // type={showNewPassword ? "text" : "password"}
                                // autoComplete="new-password"
                                // name="passWord"
                                id="testcase_description"
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="alm_details_container card">
                        {/* title="ALM Details" */}
                        <div className="flex flex-column gap-2">
                            <div className="flex flex-column pl-4 pt-2  pb-2">
                                <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Avo Assure Project<span className="text-red-500"> *</span></label>
                                <InputText
                                    // data-test="password"
                                    value={selectedProject?.projectName}
                                    className={`w-full md:w-20rem p-inputtext-sm`}
                                    // onChange={(event) => { passwordChange(event.target.value) }}
                                    type={"text"}
                                    autoComplete="off"
                                    // name="passWord"
                                    id="selected_project_name"
                                    // maxLength="16"
                                    // placeholder='Enter Password'
                                    disabled={true}
                                />

                                {/* <Dropdown
                                    // data-test="userTypeDropdown"
                                    // id="userTypes-create"
                                    // value={type}
                                    className='w-full md:w-10rem p-inputtext-sm'
                                    options={{ name: selectedProject.projectName, value: selectedProject.projectId }}
                                    // onChange={(event) => { props.click(); props.selectUserType({ type: event.target.value }); dispatch(AdminActions.UPDATE_TYPE(event.target.value)) }}
                                    // optionLabel="name"
                                    disabled={True}
                                /> */}
                            </div>

                            <span className='pl-4 pt-2 pb-2' style={{ fontSize: 'smaller', fontWeight: '500', color: 'lightgrey' }}>Select a testcase to map</span>

                            <div className="test_list pl-4 pt-2 pb-2">
                                {scenarioList.length > 0 ? scenarioList.map(element => (
                                    <div key={element._id} className="flex align-items-center pb-4">
                                    <Checkbox inputId={element._id}
                                     name="element" 
                                     value={element._id} 
                                     onChange={onChangeScenarioCheck} 
                                     checked={element._id === selectedCategories} />
                                    <label htmlFor={element.name} className="ml-2">
                                        {element.name}
                                    </label>
                                    </div>)
                                ) : "No testcases Found" 

                                    
                                    // <label>{element.name !=='' ? element.name : 'No testcases found'}</label>
                                    // <div>
                                        
                                    //     {/* <span className="leafId">{data.code}</span>
                                    //     <span className="test__tcName" title={data.summary}>{data.summary.trim().length > 35 ? data.summary.substr(0, 35) + "..." : data.summary} </span> */}
                                    //     <span className="test_list pl-2" >{scenario.name}</span>
                                    // </div>  
                                }

                            </div>
                        </div>
                    </div>

                    <div className="map-btn">
                        <Button size='small' label='Map' onClick={onClickMapping} disabled={false}></Button>
                    </div>
                </div>
            </Dialog>
        </div>

    )

}
export default AMLIntegration;
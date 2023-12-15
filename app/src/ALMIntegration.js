import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import './ALMIntegration.scss';
import { Tooltip } from "primereact/tooltip";
import { getAvoDetails, saveSAP_ALMDetails_ICE } from './pages/settings/api';
import {Messages as MSG} from './pages/global';

const AMLIntegration = props => {
    const selectedProject = JSON.parse(localStorage.getItem('DefaultProject'));
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [scenarioList, setScenarioList] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [mapApiIData, setMapApiIData] = useState({});
    const [mapBtnDisabled, setMapBtnDisabled] = useState(true);
 
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
            props.toastError("error", "Error", projectScenario.error);
        else if (projectScenario === "unavailableLocalServer")
            props.toastError("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (projectScenario === "scheduleModeOn")
            props.toastError("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (projectScenario === "Invalid Session") {
            props.toastError("error", "Error", 'Invalid Session');
        }
        else if (projectScenario && projectScenario.avoassure_projects && projectScenario.avoassure_projects.length) {
            const scenarioList = projectScenario.avoassure_projects.filter((el, i) => { return el.project_id === selectedProject?.projectId });
            setScenarioList(scenarioList[0].scenario_details === '' ? [] : scenarioList[0].scenario_details);
        }
    }

    const onChangeScenarioCheck = (e) => {
        if (e.checked)
            setSelectedCategories(e.value);
        else 
            setSelectedCategories('');
        setMapBtnDisabled(false);
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
        setMapBtnDisabled(true);
    }

    const onClickSaveALM = async () => {
        const almData = await saveSAP_ALMDetails_ICE(mapApiIData);
        if (almData !== 'success' ) {
            props.toastError("Something went wrong")
        }
        if (almData === 'success') {
            props.toastSuccess("Testcase mapped successfully")
        }
        props.almDialogHide();
        setSelectedCategories("");
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
                    <div className="alm_details_container card">
                        {/* --------------------------- title="ALM Details"--------------------------- */}
                        <div className="flex flex-column  pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Project ID</label>
                            <InputText
                                data-test="projectId"
                                value={props.almTestcaseData?.project}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>

                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Project Name</label>
                            <InputText
                                value={props.almTestcaseData?.projectName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Scope Name</label>
                            <InputText
                                value={props.almTestcaseData?.scopeName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Process</label>
                            <InputText
                                value={props.almTestcaseData?.process}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Process Name</label>
                            <InputText
                                value={props.almTestcaseData?.processName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Testcase Name</label>
                            <InputText
                                value={props.almTestcaseData?.testCaseName}
                                className={`w-full md:w-20rem p-inputtext-sm`}
                                type={"text"}
                                disabled={true}
                            />
                        </div>
                        <div className="flex flex-column pl-4 pt-1 pb-1">
                            <Tooltip target={'.testcase_description'} content={props.almTestcaseData?.testCaseDescription} />
                            <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Testcase Description</label>
                            <InputText
                                value={props.almTestcaseData?.testCaseDescription}
                                className={`w-full md:w-20rem p-inputtext-sm testcase_description`}
                                type={"text"}
                                id="testcase_description"
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="alm_details_container card">
                        {/* ---------------------------- Scenario details ---------------------------- */}
                        <div className="flex flex-column gap-2">
                            <div className="flex flex-column pl-4 pt-2  pb-2">
                                <label style={{ fontSize: 'smaller', fontWeight: '600' }}>Avo Assure Project<span className="text-red-500"> *</span></label>
                                <InputText
                                    value={selectedProject?.projectName}
                                    className={`w-full md:w-20rem p-inputtext-sm`}
                                    type={"text"}
                                    autoComplete="off"
                                    id="selected_project_name"
                                    disabled={true}
                                />
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
                                }
                            </div>
                        </div>
                    </div>

                    <div className="map-btn">
                        <Button size='small' label='Map' onClick={onClickMapping} disabled={mapBtnDisabled}></Button>
                    </div>
                </div>
            </Dialog>
        </div>

    )

}
export default AMLIntegration;
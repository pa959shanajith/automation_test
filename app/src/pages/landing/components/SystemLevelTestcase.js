import React, { useState, useRef } from 'react';
import "../styles/GenAi.scss";
import { generate_testcase, save_testcase } from '../../admin/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputTextarea } from "primereact/inputtextarea";
import { useSelector } from 'react-redux';

const SystemLevelTestcase = () => {
    const [apiResponse, setApiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const toast = useRef(null);
    const template_id = useSelector((state) => state.setting.template_id);
    const editParameters = useSelector((state) => state.setting.editParameters);

    const generateTestcase = async () => {
        try {
            setIsLoading(true);
            const { username: name, email_id: email } = JSON.parse(localStorage.getItem('userInfo'));
            const organization = "Avo Assure";
            const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
            const projectname = localStorageDefaultProject.projectName;
            const type = {
                "typename": "system",
                "summary": ""
            };
            const formData = { name, email, projectname, organization, type, template_id };
            Object.assign(formData, editParameters);
            setApiResponse("");
            const response = await generate_testcase(formData);
            if (response.error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed generating test cases!',
                    life: 3000
                });
                setIsLoading(false);
            }
            if (response.data) {
                setApiResponse(response?.data?.response);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'System level test cases generated successfully!',
                    life: 3000
                });
                setIsLoading(false);
            }
            setButtonDisabled(false);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed generating test cases!',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const saveTestcases = async () => {
        try {
            const formData = {
                "name": "nandini.gorla",
                "email": "gorla.nandini@avoautomation.com",
                "organization": "Avo Assure",
                "projectname": "test2",
                "testcase": apiResponse,
                "type": "system"
            };
            const response = await save_testcase(formData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'generated testcases saved successfully', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
    };

    return (
        <div className='flexColumn parentDiv'>
            {!apiResponse &&
                <>
                    <img className='imgDiv' src={'static/imgs/systemLevelTestcasesEmpty.svg'} width='200px' />
                    <label className='labelText'>Generate test cases for whole system</label>
                    <Button loading={isLoading} label={`${isLoading ? "Generating" : "Generate"}`} style={{ marginTop: '20px' }} onClick={() => {
                        if (template_id.length > 0) {
                            generateTestcase();
                        } else {
                            toast.current.show({
                                severity: 'info',
                                summary: 'Info',
                                detail: 'Please choose template!',
                                life: 3000
                            });
                        }
                    }}></Button>
                </>}
            {
                apiResponse && (
                    <div className="card flex justify-content-center">
                        {isLoading && <div className="spinner" style={{ position: 'absolute', top: '26rem', left: '32rem' }}>
                            <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                        </div>}
                        {/* <InputTextarea autoResize id="testcase" value={apiResponse} onChange={(e) => setApiResponse(e.target.value)} rows={40} cols={100} /> */}
                    </div>
                )
            }
            <Toast ref={toast} position="bottom-center" style={{ zIndex: 999999 }} />
            {apiResponse && <InputTextarea
                className='inputTestcaseSystem'
                autoResize={true}
                value={apiResponse}
                onChange={(e) => setApiResponse(e.target.value)}
            />}
            {
                apiResponse &&
                <div className='flex flex-row' id="footerBar" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <div className="gen-btn2">
                        <Button label="Generate" onClick={generateTestcase} disabled={buttonDisabled}></Button>
                    </div>
                    <div className="gen-btn2">
                        <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                    </div>
                </div>
            }
        </div>
    )
};

export default SystemLevelTestcase;
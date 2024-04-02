import React, { useState, useRef, useMemo } from 'react';
import "../styles/GenAi.scss";
import { generate_testcase, save_testcase } from '../../admin/api';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputTextarea } from "primereact/inputtextarea";
import { useSelector } from 'react-redux';
import GenerateTestCaseList from "./GenerateTestCaseList";
import { RadioButton } from 'primereact/radiobutton';

const SystemLevelTestcase = (props) => {
    const [apiResponse, setApiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [testStepSelection, setTestStepSelection] = useState("1")
    const [selectedTestStep, SetSelectedTestStep] = useState(true);
    const [selectedGenAiTc, setSelectedGenAiTc] = useState([]); 
    const [textAreaData, setTextAreaData] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [readOnlyData, setReadOnlyData] = useState("");
    const toast = useRef(null);
    const template_id = useSelector((state) => state.setting.template_id);
    const editParameters = useSelector((state) => state.setting.editParameters);

    const testStepOptions = (event) =>{
        setTestStepSelection(event.value);
        if(event.value === "1"){
            SetSelectedTestStep(true)
        }else{
            SetSelectedTestStep(false)
        }
    }

    const generateTestcase = async () => {
        try {
            setIsLoading(true);
            setApiResponse([]);
            setTextAreaData([]);
            props.setDisableOption(true);
            const { username: name, email_id: email } = JSON.parse(localStorage.getItem('userInfo'));
            const organization = "Avo Assure";
            const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
            const projectname = localStorageDefaultProject.projectName;
            const type = {
                "typename": "system",
                "summary": "",
                "teststep":selectedTestStep
            };
            const formData = { name, email, projectname, organization, type, template_id };
            Object.assign(formData, editParameters);
            // comment the below line when you call api
            // setApiResponse("");
            const response = await generate_testcase(formData);
            // if (response.error) {
            //     toast.current.show({
            //         severity: 'error',
            //         summary: 'Error',
            //         detail: 'Failed generating test cases!',
            //         life: 3000
            //     });
            //     setIsLoading(false);
            // }
            if( !Array.isArray(response?.data?.response )){
                toast.current.show({
                  severity: 'info',
                  summary: 'Info',
                  detail:`${response?.data?.response}`,
                  life: 5000
              });
              } else{
                setApiResponse(response?.data?.response);
     
              }

            setButtonDisabled(false);
            setIsLoading(false);
            props.setDisableOption(false);
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
    const updateTextAreaData = (e) => {
        setTextAreaData(e.target.value);
        const getSelectedTcIndex = apiResponse?.findIndex((item)=>item.Id == selectedGenAiTc[0]["Id"]);
        const updateApiResponse = apiResponse;
        updateApiResponse[getSelectedTcIndex] = {...updateApiResponse[getSelectedTcIndex], "TestCase":e.target.value};
        // setApiResponse(updateApiResponse)
    }
    // const generateTestCaseListFunc = useMemo(() => {
    //     <GenerateTestCaseList
    //         apiResponse={apiResponse}
    //         setSelectedGenAiTc={setSelectedGenAiTc}
    //         setTextAreaData={setTextAreaData}
    //         readOnly={readOnly}
    //         setReadOnly={setReadOnly}
    //         readOnlyData={readOnlyData}
    //         setReadOnlyData={setReadOnlyData}
    //     />
    // },[apiResponse, setSelectedGenAiTc, setTextAreaData, readOnly, setReadOnly, readOnlyData, setReadOnlyData])
    return (
        <div className='flexColumn parentDiv border-top-1'>
            {
                apiResponse &&
                <div className="flex flex-row" style={{ gap: "3rem" }}>
                    <div className="p-2">
                        <RadioButton
                            inputId="testCasewithTs"
                            name="option"
                            value="1"
                            onChange={testStepOptions}
                            checked={testStepSelection === "1"}
                            disabled={isLoading}
                        />
                        <label htmlFor="testCasewithTs" className="pb-2 label-genai2">Test case with Teststep</label>
                    </div>
                    <div className="p-2" >
                        <RadioButton
                            inputId="testCasewithoutTs"
                            name="option"
                            value="2"
                            onChange={testStepOptions}
                            checked={testStepSelection === "2"}
                            disabled={isLoading}
                        />
                        <label htmlFor="testCasewithoutTs" className="pb-2 label-genai2">Test case without Teststep</label>
                    </div>
                </div>
            }
            {!apiResponse &&
                <>
                    <img className='imgDiv'  width='200px' />
                    <label className='labelText'>Generate test cases for whole system</label>
                    <div className="flex flex-row" style={{ gap: "3rem" }}>
                        <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="testCasewithTs"
                            name="option"
                            value="1"
                            onChange={testStepOptions}
                            checked={testStepSelection === "1"}
                        />
                            <label htmlFor="testCasewithTs" className="pb-2 label-genai2">Test case with Teststep</label>
                        </div>
                        <div className="p-field-radiobutton" >
                        <RadioButton
                            inputId="testCasewithoutTs"
                            name="option"
                            value="2"
                            onChange={testStepOptions}
                            checked={testStepSelection === "2"}

                        />
                            <label htmlFor="testCasewithoutTs" className="pb-2 label-genai2">Test case without Teststep</label>
                        </div>
                    </div>
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
            <div className='flex flex-row w-full'>
                {apiResponse && <GenerateTestCaseList
            apiResponse={apiResponse}
            setSelectedGenAiTc={setSelectedGenAiTc}
            setTextAreaData={setTextAreaData}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            readOnlyData={readOnlyData}
            setReadOnlyData={setReadOnlyData}
        />}
                {apiResponse && !readOnly && <div className='flex flex-column'>
                    {apiResponse &&
                        <div className='flex flex-column'>
                            <InputTextarea
                                style={{ width: "42vw", height: "70vh",fontSize:"13px" }}
                                autoResize={false}
                                value={textAreaData}
                                onChange={(e) => updateTextAreaData(e)}
                            />
                        </div>
                    }
                </div>}
                {
                    readOnly && readOnlyData && <div className='flex flex-column overflow-y-scroll' style={{ height: "70vh" }}>{readOnlyData.map(item => {
                        return <div className='input_text_disabled flex flex-column mt-2 mb-2' onClick={()=>{
                            toast.current.show({
                                severity: 'info',
                                summary: 'Info',
                                detail: 'Select One TestCase to Edit!',
                                life: 3000
                            });
                        }}>
                            <InputTextarea
                                style={{ width: "40vw", height: "70vh",fontSize:"13px" }}
                                autoResize={false}
                                value={item?.TestCase}
                                onChange={(e) => updateTextAreaData(e)}
                                disabled={true}
                            />
                        </div>
                    })}</div>
                }
                {
                    apiResponse &&
                    <div className='flex flex-row' id="footerBar" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                        <div className="gen-btn2">
                            <Button label={isLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'Generate'} onClick={generateTestcase} disabled={isLoading}></Button>
                        </div>
                        <div className="gen-btn2">
                            <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
};

export default SystemLevelTestcase;
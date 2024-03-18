import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { generate_testcase } from '../../admin/api';
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from 'react-redux';

const ModuleLevelTestcase = () => {
    const [apiResponse, setApiResponse] = useState("");
    const [query, setQuery] = useState("");
    const [dropDownValue, setDropDownValue] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const toast = useRef(null);
    const template_id = useSelector((state) => state.setting.template_id);
    const editParameters = useSelector((state) => state.setting.editParameters);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const multiLevelTestcase = [
        { name: 'Function', code: "function" },
        { name: 'API', code: "api" },
    ];

    const fetchData = async (code) => {
        // if (code === "function") {
        //     try {
        //         const response = await fetch("https://avoaiapidev.avoautomation.com/generate_response");
        //         const data = await response.json();
        //         console.log("data", data);
        //     } catch (error) {
        //         console.error("Error fetching data:", error);
        //     }
        // }
    };

    const generateTestcase = async () => {
        try {
            setIsLoading(true);
            const { username: name, email_id: email } = JSON.parse(localStorage.getItem('userInfo'));
            const organization = "Avo Assure";
            const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
            const projectname = localStorageDefaultProject.projectName;
            const type = {
                "typename": "module",
                "summary": query
            };
            const formData = { name, email, projectname, organization, type, template_id };
            Object.assign(formData,editParameters);
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
                    severity: 'success', summary: 'Success', detail: 'Module level test cases generated successfully!', life: 3000
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

    const moduleTestCase = (e) => {
        e.preventDefault();
        //console.log("----Module level  test case---")
        // setShowSearchBox(true);
        // setuserstoryLevel(true);
        setApiResponse("");
        // setShowGenarateIcon(false)
        setButtonDisabled(true);
    }

    // const saveTestcases = async () => {
    //     try {
    //         const data = (type === "userstories") ? summaries : apiResponse;
    //         const formData = {
    //             "name": "nandini.gorla",    
    //             "email": "gorla.nandini@avoautomation.com",
    //             "organization": "Avo Assure",
    //             "projectname": "test2",
    //             "testcase": data,
    //             "type": type
    //         };
    //         const response = await save_testcase(formData);
    //         toast.current.show({ severity: 'success', summary: 'Success', detail: 'generated testcases saved successfully', life: 3000 });
    //     } catch (error) {
    //         toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
    //     }
    // };

    return (
        <div className='flexColumn parentDiv'>
            {!apiResponse &&
                <>
                    <img className='imgDiv' src={'static/imgs/moduleLevelTestcaseEmpty.svg'} width='200px' />
                    <p>Generate test cases for a module of your system</p>
                </>}
            <p><strong>Module</strong></p>
            <div className={`${!apiResponse ? "flexColumn" : "flexRow loginBox"}`}>
                {/* <div className="flexColumn"> */}
                <InputText placeholder='enter module' value={query} onChange={handleInputChange} />
                {!apiResponse && <Button loading={isLoading} disabled={query?.length == 0} label='Generate' style={{ marginTop: '20px' }} onClick={generateTestcase}></Button>}
            </div>
            <label>Eg. of module name: login, sign up</label>
            {
                apiResponse && (
                    <div className="card flex justify-content-center">
                        {isLoading && <div className="spinner" style={{ position: 'absolute', top: '26rem', left: '32rem' }}>
                            <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                        </div>}
                        <InputTextarea style={{ height: "500px", width: "54rem" }} autoResize id="testcase" value={apiResponse} onChange={(e) => setApiResponse(e.target.value)} rows={17} cols={100} />
                    </div>
                )
            }
            <Toast ref={toast} position="bottom-center" style={{ zIndex: 999999 }} />
            {/* <div id="footerBar">
                <div className="gen-btn2">
                    <Button label="Generate" onClick={testCaseGenaration} disabled={buttonDisabled}></Button>
                </div>
                <div className="gen-btn2">
                    <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                </div>
                <div className="cloud-test-provider">
                    <Dropdown
                        style={{ backgroundColor: "primary" }}
                        placeholder="Automate" onChange={async (e) => {
                            console.log("event", e);
                            setDropDownValue(e.value);
                            await fetchData(e.value.code)
                            console.log("dropDownValue", dropDownValue);
                        }}
                        options={multiLevelTestcase}
                        optionLabel="name"
                        value={dropDownValue}
                    />
                </div>
            </div> */}
            {
                apiResponse &&
                <div className='flex flex-row' style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                    <div className="gen-btn2">
                        <Button label="Generate" onClick={generateTestcase} disabled={buttonDisabled}></Button>
                    </div>
                    <div className="gen-btn2">
                        <Button label="Save" disabled={buttonDisabled}></Button>
                    </div>
                    <Dropdown
                        style={{ backgroundColor: "primary" }}
                        placeholder="Automate" onChange={async (e) => {
                            console.log("event", e);
                            setDropDownValue(e.value);
                            await fetchData(e.value.code)
                            console.log("dropDownValue", dropDownValue);
                        }}
                        options={multiLevelTestcase}
                        optionLabel="name"
                        value={dropDownValue}
                    // itemTemplate={countryOptionTemplate} 
                    // valueTemplate={selectedCountryTemplate} 
                    // disabled={projectInfo.appType === "Desktop" || projectInfo.appType === "Mainframe" || projectInfo.appType === "OEBS" || projectInfo.appType === "SAP"}
                    />
                </div>
            }
        </div>
    )
};

export default ModuleLevelTestcase;
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { generate_testcase, save_testcase } from '../../admin/api';
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from 'react-redux';
import { saveMindmap, getModules, importDefinition } from '../../design/api';
import { RedirectPage } from '../../global';
import * as scrapeApi from "../../design/api";
import * as DesignApi from '../../design/api'
import axios from 'axios';
import { Messages as MSG } from '../../global';
import { v4 as uuid } from 'uuid';
import {ScreenOverlay} from '../../global';
import GenerateTestCaseList from "./GenerateTestCaseList";


const ModuleLevelTestcase = (props) => {
    const history = useNavigate();
    const [apiResponse, setApiResponse] = useState("");
    const [overlay, setOverlay] = useState(null);
    const [swaggerResponseData, setSwaggerResponseData] = useState("");
    const [blockui, setBlockui] = useState({ show: false })
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [dropDownValue, setDropDownValue] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const toast = useRef(null);
    const template_id = useSelector((state) => state.setting.template_id);
    const editParameters = useSelector((state) => state.setting.editParameters);
    const [testStepSelection, setTestStepSelection] = useState("1")
    const [selectedTestStep, SetSelectedTestStep] = useState(true);
    const [selectedGenAiTc, setSelectedGenAiTc] = useState([]); 
    const [textAreaData, setTextAreaData] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [readOnlyData, setReadOnlyData] = useState("");

    

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const displayError = (error) => {
        setBlockui({ show: false })
        setLoading(false)
            (typeof error === "object" ? error : MSG.CUSTOM(error, "error"))
    }

    const multiLevelTestcase = [
        { name: 'Functional', code: "function" },
        { name: 'API', code: "api" },
    ];

    const fetchData = async (code) => {
        if (code === "function") 
            functionalMindMapCreation()
        else if (code == 'api') {
            await CreationOfMindMap(swaggerResponseData)
            setOverlay("")
            navigate("/design");
        }
    };

    const generateTestcase = async () => {
        try {
            setIsLoading(true);
            props.setDisableOption(true);
            const { username: name, email_id: email } = JSON.parse(localStorage.getItem('userInfo'));
            const organization = "Avo Assure";
            const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
            const projectname = localStorageDefaultProject.projectName;
            const type = {
                "typename": "module",
                "summary": query
                //  + ". One step should have only one action, actionable object and a value. The name of all actionable objects should be in double quotes and their values in single quotes. Show only one test case."
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
                setSwaggerResponseData(response?.data?.swagger)
                toast.current.show({
                    severity: 'success', summary: 'Success', detail: 'Module level test cases generated successfully!', life: 3000
                });
                setIsLoading(false);
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

    const moduleTestCase = (e) => {
        e.preventDefault();
        //console.log("----Module level  test case---")
        // setShowSearchBox(true);
        // setuserstoryLevel(true);
        setApiResponse("");
        // setShowGenarateIcon(false)
        setButtonDisabled(true);
    }

    const handleModuleCreate = async (data) => {
        const localStorageDefaultProject = localStorage.getItem('DefaultProject');
        let selectedProject = JSON.parse(localStorageDefaultProject);
        const module_data = {
            "action": "/saveData",
            "write": 10,
            "map": [
                {
                    "id": 0,
                    "childIndex": 0,
                    "_id": null,
                    "oid": null,
                    "name": data['CollectionName'],
                    "type": "modules",
                    "pid": null,
                    "pid_c": null,
                    "task": null,
                    "renamed": false,
                    "orig_name": null,
                    "taskexists": null,
                    "state": "created",
                    "cidxch": null
                }
            ],
            "deletednode": [],
            "unassignTask": [],
            "prjId": selectedProject ? selectedProject.projectId : null,
            "createdthrough": "Web",
            "relId": null
        }
        try {
            const response = await saveMindmap(module_data);

            if (response.error) { return }
            // setMsg(MSG.CUSTOM("Module Created Successfully", "success"));
            // let modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.projectId : "", "moduleid": null });

            // if (modulesdata.error) { displayError(modulesdata.error); return; }

            const newModule = {
                key: response,
                text: data['CollectionName']
            }
            return newModule;
        } catch (err) {
            console.log(err);
            return 'Fail'
        }
    }
    const templateObjectFunc = (prj_id, id, childIndex, _id, name, type, pid, data) => {
        let res = {
            "projectID": prj_id,
            "id": id,
            "childIndex": childIndex,
            "_id": null,
            "oid": null,
            "name": name,
            "type": type,
            "pid": pid,
            "task": null,
            "renamed": false,
            "orig_name": null,
            "taskexists": null,
            "state": "created",
            "cidxch": null
        }
        if (type == 'screens' && data != '') {
            res["scrapedurl"] = data['endPointURL'];
            res["scrapeinfo"] = {
                "body": data['requestBody'],
                "operations": data['operations'],
                "responseHeader": "",
                "responseBody": "",
                "method": data['method'],
                "endPointURL": data['endPointURL'],
                "header": data['requestHeader'],
                "param": data['param'],
                "authInput": "",
                "authKeyword": ""
            }
        }
        if (type == 'testcases' && data != '') {
            res['steps'] = [{
                "stepNo": 1,
                "custname": "WebService List",
                "keywordVal": "setEndPointURL",
                "inputVal": [
                    data['endPointURL']
                ],
                "outputVal": "",
                "appType": "Webservice",
                "remarks": "",
                "addDetails": "",
                "cord": ""
            },
            {
                "stepNo": 2,
                "custname": "WebService List",
                "keywordVal": "setMethods",
                "inputVal": [data['method']],
                "outputVal": "",
                "appType": "Webservice",
                "remarks": "",
                "addDetails": "",
                "cord": ""
            },
            {
                "stepNo": 3,
                "custname": "WebService List",
                "keywordVal": "setHeaderTemplate",
                "inputVal": [data['requestHeader']],
                "outputVal": "",
                "appType": "Webservice",
                "remarks": "",
                "addDetails": "",
                "cord": ""
            },
            {
                "stepNo": 4,
                "custname": "WebService List",
                "keywordVal": "setWholeBody",
                "inputVal": [data['requestBody']],
                "outputVal": "",
                "appType": "Webservice",
                "remarks": "",
                "addDetails": "",
                "cord": ""
            },
            {
                "stepNo": 5,
                "custname": "WebService List",
                "keywordVal": "executeRequest",
                "inputVal": [
                    ""
                ],
                "outputVal": "",
                "appType": "Webservice",
                "remarks": "",
                "addDetails": "",
                "cord": ""
            }];
        }
        return res;
    };
    const handleScenarioCreate = async (data, moduleData) => {
        const localStorageDefaultProject = localStorage.getItem('DefaultProject');
        let selectedProject = JSON.parse(localStorageDefaultProject);
        let indexCounter = 1;

        const getMindmapInternals = () => {
            let tempArr = [];
            let scenarioPID = indexCounter;
            let screenPID = indexCounter;
            if ('type' in data && data['type'] == 'Swagger') {
                let scenarioCounter = 1;
                for (let [scenario, scenarioValue] of Object.entries(data['APIS'])) {
                    scenarioPID = indexCounter;
                    tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, scenarioCounter++, scenario._id, scenario, "scenarios", 0, ''));
                    let screenCounter = 1;
                    for (let screen of scenarioValue['screens']) {
                        screenPID = indexCounter
                        let apiData = {
                            'requestBody': 'body' in screen ? JSON.stringify(screen['body'][0]) : '',
                            'requestHeader': 'header' in screen ? (screen['header']) : '',
                            'endPointURL': 'endPointURL' in screen ? screen['endPointURL'] : '',
                            'param': 'query' in screen ? (screen['query']) : '',
                            'method': 'method' in screen ? screen['method'].toUpperCase() : ''
                        }
                        tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, screenCounter++, screen._id, screen['name'], "screens", scenarioPID, apiData))
                        tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, 1, '', screen['name'], "testcases", screenPID, apiData))
                    }
                }
            }
            return tempArr;
        }

        const scenario_data = {
            "write": 10,
            "map": [
                {
                    "projectID": selectedProject ? selectedProject.projectId : null,
                    "id": 0,
                    "childIndex": 0,
                    "_id": moduleData ? moduleData.key : null,
                    "oid": null,
                    "name": moduleData ? moduleData.text : null,
                    "type": "modules",
                    "pid": null,
                    "pid_c": null,
                    "task": null,
                    "renamed": false,
                    "orig_name": null,
                    "taskexists": null,
                    "state": "saved",
                    "cidxch": null
                },
                ...getMindmapInternals(),
            ],
            "deletednode": [],
            "unassignTask": [],
            "prjId": selectedProject ? selectedProject.projectId : null,
            "createdthrough": "Web"
        }
        try {
            const response = await saveMindmap(scenario_data);
            if (response.error) { return }
        } catch (err) {
            console.log(err);
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
                "type": "module"
            };
            const response = await save_testcase(formData);
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Generated testcases saved successfully', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
    };

    const CreationOfMindMap = async (data) => {
        try {
            // Added Changes to Create Mindmap
            setOverlay('Creating Mindmap')
            let swaggerMindmapData = await importDefinition(data, 'swaggerAI')
            if (swaggerMindmapData['APIS'] && swaggerMindmapData['CollectionName']) {
                const moduleData = await handleModuleCreate(swaggerMindmapData)
                await handleScenarioCreate(swaggerMindmapData, moduleData)
            }
        } catch (err) {
            console.error('Error While ')
        }
        setOverlay('')
    }

    const updateTextAreaData = (e) => {
        setTextAreaData(e.target.value);
        const getSelectedTcIndex = apiResponse?.findIndex((item)=>item.Id == selectedGenAiTc[0]["Id"]);
        const updateApiResponse = apiResponse;
        updateApiResponse[getSelectedTcIndex] = {...updateApiResponse[getSelectedTcIndex], "TestCase":e.target.value};
        // setApiResponse(updateApiResponse)
    }

    const functionalMindMapCreation = async ()=>{
        try{
          setOverlay("Mind Map generation in progress...")
        const data = apiResponse;
        const testData = await axios('https://avogenerativeai.avoautomation.com/predictionFromSteps', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            data: data
            })
            if(testData.status === 401 || testData.data === "Invalid Session"){
            RedirectPage(history)
            return {error:MSG.GENERIC.INVALID_SESSION};
        }
        else if(testData.status === "fail" ){
            return {error:MSG.ADMIN.ERR_FETCH_OPENID}
        }
        let random_suffix = (Math.random() + 1).toString(36).substring(7)
        const mindmap_data = {
            "createdthrough": "Web",
            "cycId":undefined,
            "write": 10,
            "map": [
            {
                "id": 0,
                "childIndex": 0,
                "_id": null,
                "oid": null,
                "name": "AI_testsuite-"+random_suffix,
                "type": "modules",
                "pid": null,
                "pid_c": null,
                "task": null,
                "renamed": false,
                "orig_name": null,
                "taskexists": null,
                "state": "created",
                "cidxch": null
            },
            ],
            "deletednode": [],
            "unassignTask": [],
            "prjId": JSON.parse(localStorage.getItem('DefaultProject')).projectId,
            "createdthrough": "Web",
            "relId": null
        }
        for (var i=1;i<=testData.data.length;i++)
        {
            mindmap_data.map.push(
            {
                "id": i,
                "childIndex": i,
                "_id": null,
                "oid": null,
                "name": "AI_testcase-"+(Math.random() + 1).toString(36).substring(7),
                "type": "scenarios",
                "pid": 0,
                "pid_c": null,
                "task": null,
                "renamed": false,
                "orig_name": null,
                "taskexists": null,
                "state": "created",
                "cidxch": null
            })
        }
        var j = testData.data.length+1
        for (var i=1;i<=testData.data.length;i++){
            random_suffix = (Math.random() + 1).toString(36).substring(7)
            mindmap_data.map.push(
            {
                "id": i+testData.data.length,
                "childIndex": 1,
                "_id": null,
                "oid": null,
                "name": "AI_screen-"+random_suffix,
                "type": "screens",
                "pid": i,
                "pid_c": null,
                "task": null,
                "renamed": false,
                "orig_name": null,
                "taskexists": null,
                "state": "generated",
                "cidxch": null,
                "scrapeinfo":""
            })
            mindmap_data.map.push(
            {
                "id": i+2*testData.data.length,
                "childIndex": 1,
                "_id": null,
                "oid": null,
                "name": "AI_teststeps-"+random_suffix,
                "type": "testcases",
                "pid": i+testData.data.length,
                "pid_c": null,
                "task": null,
                "renamed": false,
                "orig_name": null,
                "taskexists": null,
                "state": "generated",
                "cidxch": null
            })
            j+=2
            random_suffix = (Math.random() + 1).toString(36).substring(7)
        }
        
        var moduleRes = await saveMindmap(mindmap_data);

        if (moduleRes === "Invalid Session") return RedirectPage(history);
        if (moduleRes.error) { displayError(moduleRes.error); return }

        var moduledata = await getModules({ "tab": "tabCreate", "projectid": JSON.parse(localStorage.getItem('DefaultProject')).projectId , "moduleid": [moduleRes], cycId: null })
        if (moduledata === "Invalid Session") return RedirectPage(history);
        if (moduledata.error) { displayError(moduledata.error); return; }

        for (var i=0;i<testData.data.length;i++){
            var screenData = testData.data[i];
            var dataObjects = screenData[0];
            var testSteps = screenData[1];
            var screenId = moduledata.children[i].children[0]._id;
            var testcasesId = moduledata.children[i].children[0].children[0]._id;
            var orderList = []
            dataObjects.map(dataObject=>{dataObject['tempOrderId']=uuid(); orderList.push(dataObject['tempOrderId'])}) 
            
            var addedObj = {createdthrough:"",
                    mirror:"",
                    name:"AI_screen-"+random_suffix,
                    orderList:[],
                    reuse:false,  
                    scrapedurl:"",
                    view:dataObjects
                };
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            let params = {
                'deletedObj': [],
                'modifiedObj': [],
                'addedObj': addedObj,
                'screenId': screenId,
                'userId': userInfo.user_id,
                'roleId': userInfo.role,
                'param': 'saveScrapeData',
                'orderList': orderList
            }
            const screenRes = await scrapeApi.updateScreen_ICE(params)
            if (screenRes === "Invalid Session") return RedirectPage(history);
            if (screenRes.error) { displayError(screenRes.error); return }

            const teststepRes = await DesignApi.updateTestCase_ICE(testcasesId,"AI_teststeps-"+random_suffix,testSteps,userInfo,0,false,[])
            if (teststepRes === "Invalid Session") return RedirectPage(history);
            if (teststepRes.error) { displayError(teststepRes.error); return }
                    
        }
    
        navigate("/design");
      }
        catch (error) {
        setOverlay("");
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Network Error.', life: 3000 });
        }
    }

    return (
        <>
            {overlay ? <ScreenOverlay content={overlay} /> : null}
            <div className='flexColumn parentDiv border-top-1'>
            {/* {
                apiResponse &&
                <div className="flex flex-row" style={{ gap: "3rem" }}>
                    <div className="p-2">
                        <RadioButton
                            inputId="testCasewithTs"
                            name="option"
                            value="1"
                            onChange={testStepOptions}
                            checked={testStepSelection === "1"}
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
                        />
                        <label htmlFor="testCasewithoutTs" className="pb-2 label-genai2">Test case without Teststep</label>
                    </div>
                </div>
            } */}
            {!apiResponse &&
                    <>
                        <img className='imgDiv'  width='200px' />
                        <p>Generate test cases for a module of your system</p>
                    </>}
                <div className={`${!apiResponse ? "flexColumn" : "flexRow loginBox"}`}>
                    {/* <div className="flexColumn"> */}
                    <div className={apiResponse ? "flex flex-row m-2 justify-content-center align-items-center" : "flex flex-column justify-content-center align-items-center"}>
                        <p className='mr-2'><strong>Module</strong></p>
                        <InputText placeholder="Enter module name: Eg.login, Fund transfer" style={{ width: `${apiResponse ? '45vw' : "20vw"} ` }} value={query} onChange={handleInputChange} />
                    </div>
                    {!apiResponse && <Button loading={isLoading} disabled={query?.length == 0} label={`${isLoading ? "Generating" : "Generate"}`} style={{ marginTop: '20px' }} onClick={() => {
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
                    }}></Button>}
                </div>
                <label className='labelText'>{apiResponse?"":"Eg. of module name: login, Fund transfer"}</label>
            {/* {!apiResponse &&
                <>
                    <img className='imgDiv' src={'static/imgs/systemLevelTestcasesEmpty.svg'} width='200px' />
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
                </>} */}
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
            <div className='flex flex-row w-full pl-2 pr-2'>
                {apiResponse && <GenerateTestCaseList 
                selectedOption={props.selectedOption}
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
                                style={{ width: "45vw", height: "60vh",fontSize:"13px" }}
                                autoResize={false}
                                value={textAreaData}
                                onChange={(e) => updateTextAreaData(e)}
                            />
                        </div>
                    }
                </div>}
                {
                    readOnly && readOnlyData && <div className='flex flex-column overflow-scroll' style={{ height: "60vh" }}>{readOnlyData.map(item => {
                        return <div className='input_text_disabled flex flex-column mb-2' onClick={()=>{
                            toast.current.show({
                                severity: 'info',
                                summary: 'Info',
                                detail: 'Select One TestCase to Edit!',
                                life: 3000
                            });
                        }}>
                            <InputTextarea
                                style={{ width: "45vw", height: "60vh",fontSize:"13px" }}
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
                    <div className='flex flex-row' id="footerBar" style={{ justifyContent: 'flex-end', gap: '1rem', width: "100%", marginBottom:"0.3rem" }}>
                        <div className="gen-btn2">
                            <Button loading={isLoading} label="Generate" onClick={() => {
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
                            }} disabled={isLoading}></Button>
                        </div>
                        <div className="gen-btn2">
                            <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                        </div>
                        <Dropdown
                            style={{ backgroundColor: "primary" }}
                            placeholder="Automate" onChange={async (e) => {
                                setDropDownValue(e.value);
                                await fetchData(e.value.code)
                            }}
                            options={multiLevelTestcase}
                            optionLabel="name"
                            value={dropDownValue}
                        />
                    </div>
                }
            </div>
        </div>
        </>
    )
};

export default ModuleLevelTestcase;
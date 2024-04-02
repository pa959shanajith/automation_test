import { React, useRef , useState} from "react"
import "../styles/GenAi.scss";
import { RadioButton } from 'primereact/radiobutton';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from "primereact/inputtextarea";
import { ProgressSpinner } from 'primereact/progressspinner'; 
import { generate_testcase, getJSON_userstory, save_testcase } from '../../admin/api';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from 'primereact/toast';
import '../styles/Ai_Output_styles.scss';
import genarateIcon from '../../../../src/assets/imgs/genarate.svg';
import { screenType,updateTemplateId } from './../../settings/settingSlice';
// import StartScreenGenAI from "./StartScreenGenAI";
import BlankScreenGenAI from "./BlankScreenGenAI";
import SystemLevelTestcase from "./SystemLevelTestcase";
import ModuleLevelTestcase from "./ModuleLevelTestcase";
import { saveMindmap, getModules, importDefinition } from '../../design/api';
import { RedirectPage} from '../../global';
import * as scrapeApi from "../../design/api";
import * as DesignApi from '../../design/api'
import {ScreenOverlay} from '../../global';
import axios from 'axios';
import {Messages as MSG} from '../../global';
import { v4 as uuid } from 'uuid';
import GenerateTestCaseList from "./GenerateTestCaseList";

const MiddleContainerGenAi = () =>{
    const history = useNavigate();
    // const [selectedOption, setSelectedOption] = useState(null);
    const [sprints, setSprints] = useState(null);
    const [userStory, setUserStory] = useState(null);
    const [overlay, setOverlay] = useState(null);
    const [blockui, setBlockui] = useState({ show: false })
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showGenarateIcon, setShowGenarateIcon] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toast = useRef(null);
    const [apiResponse, setApiResponse] = useState("");
    const navigate = useNavigate();
    const [apiDataReceived, setApiDataReceived] = useState(false);
    const [userstoryLevel, setuserstoryLevel] = useState(true);
    const [selectedTestCases, setSelectedTestCases] = useState([]);
    const [dropDownValue, setDropDownValue] = useState({});
    const [userTestcase, setUserTestcase] = useState(null)
    const [buttonDisabled, setButtonDisabled] = useState(false);
     const [userlevel, setUserlevel] = useState(false);
    const [summaries, setSummaries] = useState([]);
    const [adoSummary, SetAdoSummary] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const dispatchAction = useDispatch();
    const [type, setType] = useState('');
    const [query, setQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isJiraComponentVisible, setJiraComponentVisible] = useState(false);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const template_id = useSelector((state) => state.setting.template_id);
    const [swaggerResponseData, setSwaggerResponseData] = useState("");
    const [disableOption,setDisableOption] = useState(false);
    const [testStepSelection, setTestStepSelection] = useState("1")
    const [selectedTestStep, SetSelectedTestStep] = useState(true);
    const [selectedGenAiTc, setSelectedGenAiTc] = useState([]); 
    const [textAreaData, setTextAreaData] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [readOnlyData, setReadOnlyData] = useState("");

    console.log(template_id)

    const ToastMessage = ({ message }) => (
        <Toast ref={toast} severity="success" life={3000}>
          {message}
        </Toast>
      );

    const multiLevelTestcase = [
      { name: 'Functional', code: "function" },
      { name: 'API', code: "api" },
    ];

    const displayError = (error) => {
    
      setBlockui({ show: false })
      setLoading(false)
  (typeof error === "object" ? error : MSG.CUSTOM(error, "error"))
    }


    const sprint = [
        { name: 'Positive', code: 'NY' },
        { name: 'Negative', code: 'RM' },

    ];
    const userStrories = [
        { name: 'Positive', code: 'NY' },
        { name: 'Negative', code: 'RM' },

    ];

    const handleOptionChange = (event) => {
        setSelectedOption(event.value);
        if (event.value === 'c') {
            userStoryTestCase();
          }
      };

      const userStoryTestCase = async () => {
        try {
          setJiraComponentVisible(!isJiraComponentVisible);
          setShowGenarateIcon(true);
          setShowSearchBox(false);
          setApiResponse(null);
          setIsLoading(false);
          setApiDataReceived(false);
          setuserstoryLevel(false);
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const username = userInfo.username;
          const email = userInfo.email_id;
          const organization = "Avo Assure";
          const formData = {
            "name": username,
            "email": email,
            "organization": organization
            
          };
          const response = await getJSON_userstory(formData);
          if (response.data) {
            let testcases = [];
            if (Array.isArray(response.data)) {
              testcases = response.data;
            } else if (typeof response.data === 'object' && response.data !== null) {
              testcases = Object.keys(response.data).map(key => response.data[key]);
            }
            setSummaries(testcases);
          } else {
            console.error('Invalid API response format:', response.data);
          }
           //toast.current.show({ severity: 'success', summary: 'Success', detail: ' user story level testcases generate successfully', life: 3000 });
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
      };

      const testCaseGenaration = async () => {
        try {
          setType("userstories");
          const selectedSummaries = summaries
            .filter(testCase => selectedTestCases.includes(testCase.id))
            .map(selectedTestCase => selectedTestCase.summary)
            .join('.');
          setUserTestcase('');
          setApiResponse([]);
          setButtonDisabled(true);
          setIsLoading(true);
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const username = userInfo.username;
          const email = userInfo.email_id;
          const localStorageDefaultProject = JSON.parse(localStorage.getItem('DefaultProject'));
          const projectName = localStorageDefaultProject.projectName;
          const instancename = "Avo Assure";
          const generateType = {
            typename: 'userstories',
            summary: selectedSummaries//+ ". One step should have only one action, actionable object and a value. The name of all actionable objects should be in double quotes and their values in single quotes. Show only one test case."
          };
          const formData3 = {
            "name": username,
            "email": email,
            "projectname": projectName,
            "organization": instancename,
            "type": generateType,
            "template_id":template_id
          };
          const response = await generate_testcase(formData3)
          // setSelectedOption('');
          toast.current.show({ severity: 'success', summary: 'Success', detail: ' user story level testcases genarate sucessfully', life: 3000 });
          

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
          setButtonDisabled(false);
          setUserlevel(true);
          setIsLoading(false);
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        } finally {
          setIsLoading(false);
        }
      };
      console.log(apiResponse);
      const handleCheckboxChange = (id, summary) => {
        if (selectedTestCases.includes(id)) {
          setSelectedTestCases(selectedTestCases.filter((testCaseId) => testCaseId !== id));
        } else {
          setSelectedTestCases([...selectedTestCases, id]);
        }
      };

      const saveTestcases = async () => {
        try {
          const data = (type === "userstories") ? summaries : apiResponse;
          const formData = {
            "name": "nandini.gorla",
            "email": "gorla.nandini@avoautomation.com",
            "organization": "Avo Assure",
            "projectname": "test2",
            "testcase": apiResponse,
            "type": type
          };
          const response = await save_testcase(formData);
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'generated testcases saved successfully', life: 3000 });
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
      };

      const fetchData = async (code) => {
        if (code === "function") 
          functionalMindMapCreation()
         else if (code == 'api') {
          await CreationOfMindMap(swaggerResponseData)
          setOverlay("")
          navigate("/design");
        }
      };
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

      const functionalMindMapCreation = async ()=>{
        try{
          setOverlay("Mind Map generation in progress...")
        const data = userTestcase;
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

    const updateTextAreaData = (e) => {
      setTextAreaData(e.target.value);
      const getSelectedTcIndex = apiResponse?.findIndex((item)=>item.Id == selectedGenAiTc[0]["Id"]);
      const updateApiResponse = apiResponse;
      updateApiResponse[getSelectedTcIndex] = {...updateApiResponse[getSelectedTcIndex], "TestCase":e.target.value};
      // setApiResponse(updateApiResponse)
  }
    return (
        <>
        {overlay ? <ScreenOverlay content={overlay} /> : null}
        <Toast ref={toast} ></Toast>
        <div className='flex flex-column pl-2 pb-2' style={{ gap: "0.5rem" }} >
          <div className="flex flex-row align-items-center">
            <div className="w-1rem mr-1 flex flex-row align-items-center justify-content-center">
              <img src="static/imgs/generate_tetscase.svg" alt="SVG Image" style={{ width: "100%" }} />
            </div>
            <label className="label-genai3">Generate Test Case</label>
          </div>
          <div className="flex flex-row" style={{ gap: "3rem" }}>
            <div className="flex flex-row justify-content-center align-items-center">
              <RadioButton
                className="mr-2"
                inputId="systemLevelTc"
                name="systemLevelTc"
                value="a"
                onChange={handleOptionChange}
                checked={selectedOption === 'a'}
                disabled={disableOption}
              />
              <label htmlFor="systemLevelTc" className="">
                <span>System level test cases</span>
              </label>
              <div className="w-1 flex flex-row justify-content-center align-items-center">
                <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" className="w-full" />
              </div>
            </div>
            <div className="flex flex-row justify-content-center align-items-center">
              <RadioButton
                className="mr-2"
                inputId="moduleLevelTc"
                name="moduleLevelTc"
                value="b"
                onChange={handleOptionChange}
                checked={selectedOption === 'b'}
                disabled={disableOption}
              />
              <label htmlFor="moduleLevelTc" className="">
                <span>Module level test case</span>
              </label>
              <div className="w-1 flex flex-row justify-content-center align-items-center">
                <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" className="w-full" />
              </div>
            </div>
            <div className="flex flex-row justify-content-center align-items-center">
              <RadioButton
                className="mr-2"
                inputId="userStoryLevelTc"
                name="userStoryLevelTc"
                value="c"
                onChange={handleOptionChange}
                checked={selectedOption === 'c'}
                disabled={disableOption}
              />
              <label htmlFor="userStoryLevelTc" className="">
                <span>User story level test case</span>
              </label>
              <div className="w-1 flex flex-row justify-content-center align-items-center">
                <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" className="w-full" />
              </div>
            </div>
          </div>
        </div>
        {selectedOption == null && <BlankScreenGenAI />}
        {selectedOption === 'a' && <SystemLevelTestcase setDisableOption={setDisableOption} />}
        {selectedOption === 'b' && <ModuleLevelTestcase setDisableOption={setDisableOption} selectedOption={selectedOption} />}

        {selectedOption != 'c' && selectedOption != 'a' && selectedOption != 'b' ? (
          <>
            <div className='flex flex-column img-container justify-content-center align-items-center'>
              <span> <img src="static/imgs/choose_illustration.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></span>
              <label> Select any one of the three methods mentioned above</label>
            </div>
          </>) : ""}


        {selectedOption === 'c' && (
          <>
            <div className="flex flex-column" >
              {!apiResponse ? (
                <div className="card-group p-3 " style={{ border: '1px solid #ccc', margin: '5px', display: 'flex', flexDirection: 'row' }}>
                  <div className="card card-data bg-light" >
                    <div className="card-body ">
                      <div className='summary-container'>
                        {summaries.map(testCase => (
                          <div key={testCase.id} className="checkbox-container pt-2 pb-2">
                            <label className="tooltip">
                              <input
                                type="checkbox"
                                checked={selectedTestCases.includes(testCase.id)}
                                onChange={() => handleCheckboxChange(testCase.id, testCase.summary)}
                              />
                              <span className="content">
                                <span> {testCase.id} - {testCase.summary}</span>
                                <span className="summary"> {testCase.summary}</span>
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>


              ) : (<>

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
                          style={{ width: "40vw", height: "76vh",fontSize:"13px" }}
                          autoResize={false}
                          value={textAreaData}
                          onChange={(e) => updateTextAreaData(e)}
                        />
                      </div>
                    }
                  </div>}
                  {
                    readOnly && readOnlyData && <div className='flex flex-column overflow-y-scroll' style={{ height: "76vh" }}>{readOnlyData.map(item => {
                      return <div className='input_text_disabled flex flex-column mt-2 mb-2' onClick={() => {
                        toast.current.show({
                          severity: 'info',
                          summary: 'Info',
                          detail: 'Select One TestCase to Edit!',
                          life: 3000
                        });
                      }}>
                        <InputTextarea
                          style={{ width: "40vw", height: "76vh",fontSize:"13px" }}
                          autoResize={false}
                          value={item?.TestCase}
                          onChange={(e) => updateTextAreaData(e)}
                          disabled={true}
                        />
                      </div>
                    })}</div>
                  }
                  {/* {
                    apiResponse &&
                    <div className='flex flex-row' id="footerBar" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                        <div className="gen-btn2">
                            <Button label={isLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'Generate'} onClick={generateTestcase} disabled={isLoading}></Button>
                        </div>
                        <div className="gen-btn2">
                            <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                        </div>
                    </div>
                } */}
                </div>



              </>

              )




              }
            </div>

          </>)}

         {/* {apiResponse && selectedOption == "c"  && !summaries ?   (
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
                                style={{ width: "40vw", height: "70vh" }}
                                autoResize={false}
                                value={textAreaData}
                                onChange={(e) => updateTextAreaData(e)}
                            />
                        </div>
                    }
                </div>} */}
                {/* {
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
                                style={{ width: "40vw", height: "70vh" }}
                                autoResize={false}
                                value={item?.TestCase}
                                onChange={(e) => updateTextAreaData(e)}
                                disabled={true}
                            />
                        </div>
                    })}</div>
                } */}
                {/* {
                    apiResponse &&
                    <div className='flex flex-row' id="footerBar" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                        <div className="gen-btn2">
                            <Button label={isLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'Generate'} onClick={generateTestcase} disabled={isLoading}></Button>
                        </div>
                        <div className="gen-btn2">
                            <Button label="Save" disabled={buttonDisabled} onClick={saveTestcases}></Button>
                        </div>
                    </div>
                } */}
            {/* </div>
     ) :"" } */}

        {selectedOption == 'c' && (
            <>
              <div id="footerBar">
                { !apiResponse ?  (
                      <div className="gen-btn2">
                      <Button label={isLoading ? <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="transparent" animationDuration=".5s" /> : 'Generate'} disabled={buttonDisabled} onClick={() => {
                            if (template_id.length > 0 && selectedTestCases.length > 0 ) {
                              testCaseGenaration();
                            } else {
                                toast.current.show({
                                    severity: 'info',
                                    summary: 'Info',
                                    detail: 'Please choose template! and select atleast one user story to generate testcase',
                                    life: 3000
                                });
                            }
                        }}
                      ></Button>
                    </div>
                ) : <div className="gen-btn3">
                <Button label="Back to user story"  onClick = {() => {userStoryTestCase()}} disabled={buttonDisabled}></Button>
              </div> }
             
                
                <div className="gen-btn2">
                  <Button label="Save" disabled={!apiResponse} onClick={saveTestcases}></Button>
                </div>
                <div className="cloud-test-provider">
                  <Dropdown
                    style={{ backgroundColor: "primary" }}
                    placeholder="Automate" onChange={async (e) => {
                      setDropDownValue(e.value);
                      await fetchData(e.value.code)
                    }}
                    options={multiLevelTestcase}
                    optionLabel="name"
                    value={dropDownValue}
                    disabled={!apiResponse}
                  />
                </div>
              </div>
            </>

)}
</>


    )
    

}

export default MiddleContainerGenAi;
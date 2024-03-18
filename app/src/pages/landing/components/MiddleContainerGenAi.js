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
import { saveMindmap, getModules } from '../../design/api';
import { RedirectPage} from '../../global';
import * as scrapeApi from "../../design/api";
import * as DesignApi from '../../design/api'
import {ScreenOverlay} from '../../global';
import axios from 'axios';
import {Messages as MSG} from '../../global';
import { v4 as uuid } from 'uuid';

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
    const [apiResponse, setApiResponse] = useState(null);
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
    console.log(template_id)

    const ToastMessage = ({ message }) => (
        <Toast ref={toast} severity="success" life={3000}>
          {message}
        </Toast>
      );

    const multiLevelTestcase = [
      { name: 'Function', code: "function" },
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
            summary: selectedSummaries+ ". One step should have only one action, actionable object and a value. The name of all actionable objects should be in double quotes and their values in single quotes. Show only one test case."
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
          toast.current.show({ severity: 'success', summary: 'Success', detail: ' user story level testcases genarate sucessfully', life: 3000 });
          setUserTestcase(response.data.response);
          setButtonDisabled(false);
          setUserlevel(true);
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        } finally {
          setIsLoading(false);
        }
      };
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
            "testcase": data,
            "type": type
          };
          const response = await save_testcase(formData);
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'generated testcases saved successfully', life: 3000 });
        } catch (error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        }
      };

      const fetchData = async (code) => {
        if (code === "function") {
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
            const testSteps = testData.data[1]
            const dataObjects = testData.data[0]
            let random_suffix = (Math.random() + 1).toString(36).substring(7)
            const mindmap_data = {
                "action": "/saveData",
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
                {
                    "id": 1,
                    "childIndex": 1,
                    "_id": null,
                    "oid": null,
                    "name": "AI_testcase-"+random_suffix,
                    "type": "scenarios",
                    "pid": 0,
                    "pid_c": null,
                    "task": null,
                    "renamed": false,
                    "orig_name": null,
                    "taskexists": null,
                    "state": "created",
                    "cidxch": null
                },
                {
                    "id": 2,
                    "childIndex": 2,
                    "_id": null,
                    "oid": null,
                    "name": "AI_screen-"+random_suffix,
                    "type": "screens",
                    "pid": 1,
                    "pid_c": null,
                    "task": null,
                    "renamed": false,
                    "orig_name": null,
                    "taskexists": null,
                    "state": "generated",
                    "cidxch": null
                },
                {
                    "id": 3,
                    "childIndex": 3,
                    "_id": null,
                    "oid": null,
                    "name": "AI_teststeps-"+random_suffix,
                    "type": "testcases",
                    "pid": 2,
                    "pid_c": null,
                    "task": null,
                    "renamed": false,
                    "orig_name": null,
                    "taskexists": null,
                    "state": "generated",
                    "cidxch": null
                }
                ],
                "deletednode": [],
                "unassignTask": [],
                "prjId": JSON.parse(localStorage.getItem('DefaultProject')).projectId,
                "createdthrough": "Web",
                "relId": null
            }
        
        
            var moduleRes = await saveMindmap(mindmap_data);
            if (moduleRes === "Invalid Session") return RedirectPage(history);
            if (moduleRes.error) { displayError(moduleRes.error); return }
                var moduledata = await getModules({ "tab": "tabCreate", "projectid": JSON.parse(localStorage.getItem('DefaultProject')).projectId , "moduleid": [moduleRes], cycId: null })
                if (moduledata === "Invalid Session") return RedirectPage(history);
                if (moduledata.error) { displayError(moduledata.error); return; }
        
                var screenId = moduledata.children[0].children[0]._id;
                var testcasesId = moduledata.children[0].children[0].children[0]._id;
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
            await scrapeApi.updateScreen_ICE(params)
            .then(response =>  {
                if (response == "Success") {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Elements Captured Successfully.', life: 5000 });
            }
            else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Something went wrong', life: 5000 });
                }
            })
            .catch(error => {
                setOverlay("");
                console.error("ERROR::::", error)
            });
            await DesignApi.updateTestCase_ICE(testcasesId,"AI_teststeps-"+random_suffix,testSteps,userInfo,0,false,[])
            .then(data => {
                setOverlay("");
                if (data === "Invalid Session") RedirectPage(history);
                if (data === "success") toast.current.show({ severity: 'success', summary: 'Success', detail: 'Mindmap Created Successfully.', life: 5000 });;
            })
            .catch(error => {
                setOverlay("");
                console.error("ERROR::::", error)
            });
        
            navigate("/design");
            // var reqForOldModule={
            //   tab:"createTab",
            //   projectid:JSON.parse(localStorage.getItem('DefaultProject')).projectId,
            //   version:0,
            //   cycId: null,
            //   modName:"",
            //   moduleid:null
            // }
            // await getModules(reqForOldModule)
            }
            catch (error) {
            setOverlay("");
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Network Error.', life: 3000 });
            }
        }
      };
    return(
        <>
         {overlay ? <ScreenOverlay content={overlay} /> : null}
         {/* <ToastMessage message={toastMessage} /> */}
          <Toast ref={toast} ></Toast>

            <div className='flex flex-column pl-2 pb-2' style={{ gap: "0.5rem" }} >

                <span> <img src="static/imgs/generate_tetscase.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /> <label className="pb-2 label-genai3">Generate Test Case</label></span>
                <div className="flex flex-row" style={{ gap: "3rem" }}>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionA"
                            name="option"
                            value="a"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'a'}
                        />
                        <label htmlFor="optionA" className="pb-2 label-genai2">System level test cases  <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionB"
                            name="option"
                            value="b"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'b'}
                        />
                        <label htmlFor="optionB" className="pb-2 label-genai2">Module level test case <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>
                    <div className="p-field-radiobutton">
                        <RadioButton
                            inputId="optionC"
                            name="option"
                            value="c"
                            onChange={handleOptionChange}
                            checked={selectedOption === 'c'}
                        />
                        <label htmlFor="optionC" className="pb-2 label-genai2">User story level test case <img src="static/imgs/info-circle_icon.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></label>
                    </div>

                 


        </div>
        {selectedOption == null && <BlankScreenGenAI />}
        {selectedOption === 'a' && <SystemLevelTestcase />} 
        {selectedOption === 'b' && <ModuleLevelTestcase />} 
       {selectedOption!='c' && selectedOption != 'a' && selectedOption != 'b' ? (<div className='flex flex-column img-container'>
                   <span> <img src="static/imgs/choose_illustration.svg" alt="SVG Image" style={{ marginRight: '0.5rem' }} /></span>
                   <label> Select any one of the three methods mentioned above</label>
                    </div>) : ""}
                {selectedOption === 'c' && (
                    <>
                    <div className="flex flex-column" >
                    {showGenarateIcon ? (
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
          {/* <div className="ml-2 p-2" style={{ position: 'relative', top: '125px' }} >
            <button disabled={buttonDisabled}>
              <img src={genarateIcon} alt="Input" className="icon-genarate mr-3  text-dark" onClick={testCaseGenaration} />
            </button>
          </div> */}
          {isLoading && <div className="spinner" style={{ position: 'absolute', top: '29rem', left: '32rem' }}>
            <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
          </div>}
              
              {userlevel ? (<>
                <div style={{ textAlign: 'left', padding: '5px' }}>
                <InputTextarea id="testcase" autoResize value={userTestcase} onChange={(e) => setApiResponse(e.target.value)} rows={20} cols={1000} style={{width:'32rem', height:"33rem", overflow:'auto'}}/>
                 
                </div>
              </>) :
               
                (<>
                   <div className="card card-data bg-light ml-2 p-2" >
            <div className="card-body">
                
                  <div style={{ marginTop: '11rem' }}>what ever selected .genarate those user stories</div>
                  </div>
          </div>
                </>)}
          
        </div>
      ) : null
      }
      {userstoryLevel ? (
        apiResponse ? (
          <div className="card flex justify-content-center" style={{ height: '300px', overflowY: 'auto' }}>
            {isLoading && <div className="spinner" style={{ position: 'absolute', top: '26rem', left: '32rem' }}>
              <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
            </div>}
            <InputTextarea id="testcase" autoResize value={apiResponse} onChange={(e) => setApiResponse(e.target.value)} rows={20} cols={1000} />
          </div>
        ) :
          (
            <div className=" card d-flex flex-column bd-highlight  mt-2 default_cls" >
              <div className="default_inner_cls">
                <span style={{ font: '600 1rem/1.5rem Open Sans' }}>Choose one among the three ways listed above</span>
                {isLoading && <div className="spinner" style={{ position: 'absolute', top: '15rem', left: '20rem' }}>
                  <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>}
                <div className="p-2 bd-highlight top-50 start-50m hypen_cls" >
                  {/* <Button className="btn button1" label="Generate system level test case" onClick={systemTestCase} disabled={buttonDisabled} outlined /> */}
                </div>
                {/* <div className="p-2 bd-highlight py-2 mt-1 hypen_cls" >
                  <Button className="btn button2" label="Generate module level test case" onClick={moduleTestCase} disabled={buttonDisabled} outlined />
                </div> */}
                <div className=" p-2 bd-highlight py-2 mt-1 hypen_cls" >
                  <Button className="btn button3" label="Generate user story level test case" disabled={buttonDisabled} outlined />
                </div>
              </div>

            </div>
          )
      ) : null
      }

                    </div>

                    {/* <div className="card flex justify-content-center">
            <InputTextarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} cols={30} />
        </div> */}
                    </>

                )}

        </div>
        {/* <FooterGenAi /> */}
        {
          selectedOption == 'c'
        &&
        (<div id="footerBar">
                        <div className="gen-btn2">
                            <Button label="Generate" onClick={testCaseGenaration}  disabled={buttonDisabled}></Button>
                        </div>
                        <div className="gen-btn2">
                            <Button label="Save"  disabled={buttonDisabled} onClick={saveTestcases}></Button>
                        </div>
                        <div className="cloud-test-provider">
                            <Dropdown
                              style={{ backgroundColor: "primary" }}
                              placeholder="Automate" onChange={async(e) => {
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
                    </div>)
}
       
        {/* <Toast ref={toast} position="botton-center" baseZIndex={10000}/> */}
        </>
    )
    

}

export default MiddleContainerGenAi;
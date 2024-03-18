import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { generate_testcase } from '../../admin/api';
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { useSelector } from 'react-redux';
import { importDefinition, saveMindmap } from '../../design/api';


const ModuleLevelTestcase = () => {
    const [apiResponse, setApiResponse] = useState("");
    const [swaggerResponseData, setSwaggerResponseData] = useState("");
    const [query, setQuery] = useState("");
    const [dropDownValue, setDropDownValue] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const toast = useRef(null);
    const template_id = useSelector((state) => state.setting.template_id);
    const [loading,setLoading] = useState(false)

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
                setSwaggerResponseData(response?.data?.swagger)
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
    
            const newModule={
              key:response,
              text:data['CollectionName']
            }
            return newModule;
          } catch (err) {
            console.log(err);
            return 'Fail'
          }
      }
      const templateObjectFunc = (prj_id, id, childIndex, _id, name, type, pid,data) => {
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
        if(type == 'screens' && data != '') {
          res["scrapedurl"] = data['endPointURL'];
          res["scrapeinfo"] = {
              "body" : data['requestBody'],
              "operations" : data['operations'],
              "responseHeader" : "",
              "responseBody" : "",
              "method" : data['method'],
              "endPointURL" : data['endPointURL'],
              "header" : data['requestHeader'],
              "param" : data['param'],
              "authInput" : "",
              "authKeyword":""
          }
        }
        if(type == 'testcases' && data != '') {
          res['steps'] = [{
              "stepNo" : 1,
              "custname" : "WebService List",
              "keywordVal" : "setEndPointURL",
              "inputVal" : [ 
                  data['endPointURL']
              ],
              "outputVal" : "",
              "appType" : "Webservice",
              "remarks" : "",
              "addDetails" : "",
              "cord" : ""
          }, 
          {
              "stepNo" : 2,
              "custname" : "WebService List",
              "keywordVal" : "setMethods",
              "inputVal" : [data['method']],
              "outputVal" : "",
              "appType" : "Webservice",
              "remarks" : "",
              "addDetails" : "",
              "cord" : ""
          }, 
          {
              "stepNo" : 3,
              "custname" : "WebService List",
              "keywordVal" : "setHeaderTemplate",
              "inputVal" : [data['requestHeader']],
              "outputVal" : "",
              "appType" : "Webservice",
              "remarks" : "",
              "addDetails" : "",
              "cord" : ""
          }, 
          {
              "stepNo" : 4,
              "custname" : "WebService List",
              "keywordVal" : "setWholeBody",
              "inputVal" : [data['requestBody']],
              "outputVal" : "",
              "appType" : "Webservice",
              "remarks" : "",
              "addDetails" : "",
              "cord" : ""
          }, 
          {
              "stepNo" : 5,
              "custname" : "WebService List",
              "keywordVal" : "executeRequest",
              "inputVal" : [ 
                  ""
              ],
              "outputVal" : "",
              "appType" : "Webservice",
              "remarks" : "",
              "addDetails" : "",
              "cord" : ""
          }];
        }
        return res;
      };
      const handleScenarioCreate = async (data,moduleData) => {
        const localStorageDefaultProject = localStorage.getItem('DefaultProject');
        let selectedProject = JSON.parse(localStorageDefaultProject);
        let indexCounter = 1;
      
        const getMindmapInternals = () => {
          let tempArr = [];
          let scenarioPID = indexCounter;
          let screenPID = indexCounter;
          if('type' in data && data['type'] == 'Swagger'){
            let scenarioCounter = 1;
            for(let [scenario,scenarioValue] of Object.entries(data['APIS'])) {
              scenarioPID = indexCounter;
              tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, scenarioCounter++, scenario._id, scenario, "scenarios", 0,''));
              let screenCounter = 1;
              for( let screen of scenarioValue['screens']) {
                screenPID = indexCounter
                let apiData = {
                  'requestBody':'body' in screen ? JSON.stringify(screen['body'][0]) : '',
                  'requestHeader':'header' in screen ? (screen['header']) : '',
                  'endPointURL': 'endPointURL' in screen ? screen['endPointURL'] : '',
                  'param': 'query' in screen ? (screen['query']) : '',
                  'method': 'method' in screen ? screen['method'].toUpperCase() : ''
                }
                tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++,screenCounter++, screen._id, screen['name'], "screens", scenarioPID,apiData))
                tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, 1, '', screen['name'], "testcases", screenPID,apiData))
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
          // setMsg(MSG.CUSTOM("Scenario Created Successfully", "success"));
        } catch (err) {
          console.log(err);
        }
      }
      const CreationOfMindMap = async(data) => {
          try {
                // Added Changes to Create Mindmap
                setLoading('Creating Mindmap')
                let swaggerMindmapData = await importDefinition(data,'swaggerAI')
                if(swaggerMindmapData['APIS'] && swaggerMindmapData['CollectionName']) {
                  const moduleData = await handleModuleCreate(swaggerMindmapData)
                  await handleScenarioCreate(swaggerMindmapData,moduleData)
                }
          } catch(err) {
            console.error('Error While ')
          }
          setLoading(false)
      }
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
                            if(e.value.name == 'API') {
                                await CreationOfMindMap(swaggerResponseData)
                             }
                            // await fetchData(e.value.code)
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
import React, { useRef, Fragment, useState, useEffect } from 'react';
import {excelToMindmap, getProjectList, getModules,getScreens, importMindmap ,gitToMindmap, pdProcess, importGitMindmap, writeFileServer, writeZipFileServer, jsonToMindmap,singleExcelToMindmap ,checkExportVer, importDefinition, saveMindmap} from '../api';
import {ModalContainer,ResetSession, Messages as MSG,setMsg, VARIANT, ScrollBar,ScreenOverlay} from '../../global'
import { parseProjList, getApptypePD, getJsonPd} from '../containers/MindmapUtils';
import { useDispatch, useSelector } from 'react-redux';
import {setImportData} from '../designSlice';
import PropTypes from 'prop-types';
import '../styles/ImportMindmap.scss';
import * as api from '../api';
import AvoInput from "../../../globalComponents/AvoInput";
import { Link } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Toast } from 'primereact/toast';
import { selectedModuleReducer,screenData, moduleList, selectedModule, selectedProj,selectedModulelist, selectBoxState, selectNodes, copyNodes,dontShowFirstModule } from '../designSlice'
import { RedirectPage, Header } from '../../global';

const WSImportMindmap = ({setImportPop,setBlockui,displayError,setOptions, isMultiImport, importPop}) => {
    const [projList,setProjList] = useState({})
    const dispatch = useDispatch()
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState('')
    const [submit,setSubmit] = useState(false)
    const [disableSubmit,setDisableSubmit] = useState(true)
    const [moduleName,setModuleName] = useState('')
    const [WSImportDefinitionDetails,setWSImportDefinitionDetails] =useState(undefined)
    const [valueOfImport,setValueOfImport] = useState('')
    const [selectedProtocol,setselectedProtocol] = useState(undefined)
    const [selectedProject, setSelectedProject] = useState(null)
    const [selectedModule, setSelectedModule] = useState(null);
    const [modScenarios, setModScenarios] = useState([])
    const [scenarioName,setScenarioName]=useState(undefined)
    
    useEffect(()=>{
        (async()=>{
            setBlockui({show:true,content:'Loading ...'})
            var res = await getProjectList()
            if(res.error){displayError(res.error);return;}
            var data = parseProjList(res)
            setProjList(data)
            setBlockui({show:false})
        })()
    },[]) 
     
    const items = [
        { name: 'Determine Automatically', code: 'NY', value:'def-val', disabled:true },
        { name: 'WSDL', code: 'WSDL', value:'WSDL'},
        { name: 'Swagger', code: 'Swagger', value:'Swagger'},
    ]

    if(!Object.keys(projList).length >0) return null
    const importValue = (value)=>{
        setValueOfImport(value)
        if(value!='' && value.endsWith("?WSDL")){
            setselectedProtocol('WSDL')
            setError('')
            setDisableSubmit(false)
        } else if(value!='' && (value.includes('swagger'))) {
          setselectedProtocol('Swagger')
          setError('')
          setDisableSubmit(false)
        }else {
          setselectedProtocol(undefined)
        }
        // setDisableSubmit(false)
    }
    const handleImport = async ()=>{
        // console.log(valueOfImport);
        // console.log(selectedProj)
        setLoading('Loading');
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const localStorageDefaultProject = localStorage.getItem('DefaultProject');
        let selectProj = JSON.parse(localStorageDefaultProject);
        setSelectedProject(selectProj)
        let data = await api.importDefinition(valueOfImport,selectedProtocol)
        if(data['APIS'] && data['CollectionName']) {
          setWSImportDefinitionDetails(data)
          setModuleName(data['CollectionName'])
          setLoading('Creating Mindmap')
          const moduleData = await handleModuleCreate(data)
          await handleScenarioCreate(data,moduleData)
        }
        else if (data === "unavailableLocalServer"){
          displayError(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER.CONTENT);
        }else {
          displayError('Error Occured While Loading Url')
        }
        setImportPop(false)
        setLoading(false);
    }

    const changeImportType = (e) => {
        setselectedProtocol(e.value)
        setError('')
        setDisableSubmit(false)
    }

    const Footer = ({error,setSubmit,disableSubmit}) =>{
        return(
          <Fragment>
                <div className='mnode__buttons'>
                    <label className='err-message'>{error}</label>
                    <Button disabled={valueOfImport == "" || selectedProtocol == undefined} onClick={()=>{handleImport()}} label='Import API'/>                
                </div>
          </Fragment>
        )
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
          const response = await api.saveMindmap(module_data);
          console.log("response handleModuleCreate")
          console.log(response)
          // if (response === "Invalid Session") return RedirectPage(history);
          if (response.error) { displayError(response.error); return }
          setMsg(MSG.CUSTOM("Module Created Successfully", "success"));
          let modulesdata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.projectId : "", "moduleid": null });
          // if (modulesdata === "Invalid Session") return RedirectPage(history);
          if (modulesdata.error) { displayError(modulesdata.error); return; }
          // dispatchselectedModuleReducer(modulesdata)
          
          
        //   setProjModules(modulesdata);
        //   setDisplayCreateModule(false);
         
          const newModule={
            key:response,
            text:data['CollectionName']
          }
          setSelectedModule(newModule)
          // var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.key : "", "moduleid": [selectedModule.key], cycId: null })
          // setModScenarios(moduledata.children);
          return newModule;
        } catch (err) {
          console.log(err);
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
        }]
        if('requestHeader' in data && data['requestHeader']) res['steps'].push({
          "stepNo" : res['steps'].length+1,
          "custname" : "WebService List",
          "keywordVal" : "setHeaderTemplate",
          "inputVal" : [data['requestHeader']],
          "outputVal" : "",
          "appType" : "Webservice",
          "remarks" : "",
          "addDetails" : "",
          "cord" : ""
        })
        
        if('requestBody' in data && data['requestBody']) res['steps'].push({
          "stepNo" : res['steps'].length+1,
          "custname" : "WebService List",
          "keywordVal" : "setWholeBody",
          "inputVal" : [data['requestBody']],
          "outputVal" : "",
          "appType" : "Webservice",
          "remarks" : "",
          "addDetails" : "",
          "cord" : ""
        })
        res['steps'].push({
            "stepNo" : res['steps'].length+1,
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
        });
      }
      console.log(res);
      return res;
    };

    const handleScenarioCreate = async (data,moduleData) => {
      const localStorageDefaultProject = localStorage.getItem('DefaultProject');
      let selectedProject = JSON.parse(localStorageDefaultProject);
        // if (!(scenarioName)) {
        //   setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
        //   return;
        // }
        // const regEx = /[~*+=?^%<>()|\\|\/]/;
        // if (!(selectedModule && selectedModule.key)) {
        //   setMsg(MSG.CUSTOM("Please select a module", "error"))
        //   return;
        // }
        // else if (regEx.test(scenarioName)) {
        //   setMsg(MSG.CUSTOM("Scenario name cannot contain special characters", "error"))
        //   return;
        // }
        // else if (modScenarios.filter((scenario) => scenario.name === scenarioName).length > 0) {
        //   setMsg(MSG.CUSTOM("Scenario already exists", "error"));
        //   return;
        // }
        // else if (!validNodeDetails(scenarioName)){
        //   setMsg(MSG.CUSTOM(`Scenario name must  include underscore("_")`, "error"));
        //   return;
        // }
    

        // Yha se comment kiya hai
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
            return tempArr;
          }
          data['APIS'].forEach((scenario, idx) => {
            scenarioPID = indexCounter;
            tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, idx+1, scenario._id, Object.keys(scenario)[0], "scenarios", 0,''));
            let methods = [scenario[Object.keys(scenario)[0]]['HTTPmethod']];
            let apiData = {
              'requestBody':scenario[Object.keys(scenario)[0]]['requestBody'],
              'requestHeader':scenario[Object.keys(scenario)[0]]['requestHeader'],
              'endPointURL':scenario[Object.keys(scenario)[0]]['endPointURL'],
              'operations':scenario[Object.keys(scenario)[0]]['operation']
            }
            if (methods && methods.length > 0) {
              methods.forEach((screen, idx_scr) => {
                apiData['method'] = screen
                screenPID = indexCounter;
                tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, idx_scr+1, screen._id, Object.keys(scenario)[0]+'_'+screen, "screens", scenarioPID,apiData))
                tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, 1, '', Object.keys(scenario)[0]+'_'+screen+'_1', "testcases", screenPID,apiData))
                // if (screen.children && screen.children.length > 0) {
                //   screen.children.forEach((tc, idx_tc) => {
                //     tempArr.push(templateObjectFunc(selectedProject.projectId, indexCounter++, idx_tc+1, tc._id, tc.name, "testcases", screenPID))
                //   })
                // }
              })
            }
          });
    
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
            // {
            //   "id": indexCounter,
            //   "childIndex": data['APIS'].length + 1,
            //   "_id": null,
            //   "oid": null,
            //   // "name": scenarioName,
            //   "name":moduleName,
            //   "type": "scenarios",
            //   "pid": 0,
            //   "task": null,
            //   "renamed": false,
            //   "orig_name": null,
            //   "taskexists": null,
            //   "state": "created",
            //   "cidxch": "true",
            //   "projectID": selectedProject ? selectedProject.projectId : null,
            // }
          ],
          "deletednode": [],
          "unassignTask": [],
          "prjId": selectedProject ? selectedProject.projectId : null,
          "createdthrough": "Web"
        }
        try {
          const response = await saveMindmap(scenario_data);
          // if (response === "Invalid Session") return RedirectPage(history);
          if (response.error) { displayError(response.error); return }
          setMsg(MSG.CUSTOM("Scenario Created Successfully", "success"));
          var moduledata = await getModules({ "tab": "tabCreate", "projectid": selectedProject ? selectedProject.projectId : "", "moduleid": [moduleData.key], cycId: null })
          // if (moduledata === "Invalid Session") return RedirectPage(history);
          if (moduledata.error) { displayError(moduledata.error); return; }
          dispatch(selectedModuleReducer(moduledata))
         
          const newSce={
            key: moduledata.children[moduledata.children.length-1]._id,
            text: moduledata.children[moduledata.children.length-1].name
          }
          // setSelectedScenario(newSce)
          // setDisplayCreateScenario(false);
        } catch (err) {
          console.log(err);
        }
    }
    
    return(
    <>
        {loading ? <ScreenOverlay content={loading} /> :
        <Dialog className='ImportDialog' header='Import API Definition' onHide={()=>setImportPop(false)} visible={importPop} style={{ width: '50vw' }} footer={<Footer error={error} disableSubmit={disableSubmit} setSubmit={setSubmit}/>}>
        {/* <AvoInput
                  htmlFor="import definition"
                  labelTxt="URL"
                  required={true}
                  placeholder="Enter url"
                  customClass="inputRow_for_E2E_popUp"
                  inputType="lablelRowReqInfo"
                //   inputTxt={inputE2EData}
                //   setInputTxt={setInputE2EData}
                /> */}
                <br></br>
                <div>
                    <label htmlFor='import'>Source URL </label>
                    <InputText 
                        style={{width: '20rem', 'margin-left':'1.3rem'}}
                        name="Source URL" 
                        className='URL'
                        onChange={(e)=>{importValue(e.target.value)}} 
                        placeholder="URL"/>
                </div>
                <br></br>
                <div>
                <label htmlFor='import'>Protocol </label>
                    <Dropdown
                        inputId="import"
                        name="Protocol"
                        // ref={ftypeRef}
                        value={selectedProtocol}
                        options={items}
                        optionLabel="name"
                        placeholder="Determine Automatically"
                        className="protocol"
                        style={{width:'20rem', marginLeft:'2.6rem'}}
                        onChange={(e) => {
                            changeImportType(e);
                            }
                        }
                    />
                </div>
        </Dialog>}
    </>
    )
}



export default WSImportMindmap;
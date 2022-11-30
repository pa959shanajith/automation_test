import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ModalContainer, ResetSession} from '../../global';
import { SearchBox , SearchDropdown, Toggle } from '@avo/designcomponents';
import { fetchConfigureList, deleteConfigureKey, execAutomation, fetchProjects, fetchAvoAgentAndAvoGridList,getQueueState, deleteExecutionListId  } from '../api';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import * as actionTypes from "../../plugin/state/action";
// import { fetchProjects } from '../api';
import { ExecuteTestSuite_ICE } from '../../execute/api';
import {getDetails_ICE ,getAvailablePlugins} from "../../plugin/api";
import {readTestSuite_ICE} from '../../schedule/api';
import * as pluginApi from "../../plugin/api";
import {v4 as uuid} from 'uuid';
import CheckboxTree from 'react-checkbox-tree';
import ScheduleHome from '../../schedule/containers/ScheduleHome';
import AllocateICEPopup from '../../global/components/AllocateICEPopup';
import "../styles/DevOps.scss";
import { prepareOptionLists } from './DevOpsUtils';



const DevOpsList = ({ integrationConfig,setShowConfirmPop, setCurrentIntegration, url, showMessageBar, setLoading, setIntegrationConfig, projectIdTypesDicts }) => {
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [searchText, setSearchText] = useState("");
    const [configList, setConfigList] = useState([]);
    const [executionQueue, setExecutionQueue] = useState(false);
    const [filteredList, setFilteredList] = useState(configList);
    const [displayBasic, setDisplayBasic] = useState(false);
    const [displayBasic1, setDisplayBasic1] = useState(false);
    const [displayBasic2, setDisplayBasic2] = useState(false);
    const [position, setPosition] = useState('center');
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [getProjectList,setProjectList]=useState([]);
    const [projectId, setPojectId] = useState('')
    const [getplugins_list,setplugins_list]=useState([]);
    const [projectData, setProjectData] = useState([]);
    const [projectData1, setProjectData1] = useState([]);
    const [allocateICE,setAllocateICE] = useState(false);
    const [userDetailList,setUserDetailList]=useState([]);
    const [proceedExecution, setProceedExecution] = useState(false);
    const [dataExecution, setDataExecution] = useState({});
    const [showIntegrationModal,setShowIntegrationModal] = useState(false);
    const [modalDetails,setModalDetails] = useState({title:"",task:""});
    const [moduleInfo,setModuleInfo] = useState([]);
    const [dataDict, setDict] = useState({});
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedCycle, setSelectedCycle] = useState(0);
    const [cyclesList, setCyclesList] = useState('');
    const [executionTypeInRequest,setExecutionTypeInRequest] = useState('asynchronous');
    const[currentKey,setCurrentKey]=useState('')
    const [showCICD, setShowCICD] = useState(false);
    const [currentTask, setCurrentTask] = useState({});
    const [eachData, setEachData] = useState([]);
    const filter_data = useSelector(state=>state.plugin.FD);
    const [browserTypeExe,setBrowserTypeExe] = useState([]); // Contains selected browser id for execution
	const [execAction,setExecAction] = useState("serial"); 
	const [execEnv,setExecEnv] = useState("default");
    const [integration,setIntegration] = useState({
        alm: {url:"",username:"",password:""}, 
        qtest: {url:"",username:"",password:"",qteststeps:""}, 
        zephyr: {url:"",username:"",password:""}
    });
    const [appType, setAppType] = useState('');
    const [projectName, setProjectName] = useState('');
    const [cycleName, setCycleName] = useState('');


    useEffect(()=>{
        pluginApi.getProjectIDs()
        .then(data => {
                projectIdTypesDicts[data.projectId[selectedCycle]] === "Web" ? setShowCICD(true) : setShowCICD(false)
    })},[])


    useEffect(()=>{
        pluginApi.getProjectIDs()
        .then(data => {
                setProjectData1(data.releases[selectedCycle][0].name);
                setProjectData(data.releases[selectedCycle][0].cycles[0]._id);
                setCycleName(data.releases[selectedCycle][0].cycles[0].name);
    })},[selectedCycle])
  
    useEffect(()=>{
        (async() => {
            const UserList =  await pluginApi.getUserDetails("user");
        if(UserList.error){
            setMsg(MSG.CUSTOM("Error while fetching the user Details"));
        }else{
            setUserDetailList(UserList);
        }


            const ProjectList = await getDetails_ICE(["domaindetails"],["Banking"]);
        if(ProjectList.error){
            setMsg(MSG.CUSTOM("Error while fetching the project Details"));
        }else{
            
            const arraynew = ProjectList.projectIds.map((element, index) => {
                return (
                    {
                        // code: element,
                        // name: ProjectList.projectNames[index],
                        key: element,
                        text: ProjectList.projectNames[index],
                        title: ProjectList.projectNames[index],
                        index: index
                        // disabled: true,
                        // title: 'License Not Supported'
                    }
                )
            });
            setProjectList(arraynew);
            setSelectedProject(arraynew[0].key);
            setProjectName(arraynew[0].text);



            // console.log(selectedProject);
            if(arraynew.length > 0) {
                const configurationList = await fetchConfigureList({
                    'projectid': arraynew[0].key
                });
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
            }
            setLoading(false);
        }
        

        // console.log("domaindetails","Banking");
        // console.log(ProjectList);
            var plugins = []; 
        const plugins_list= await getAvailablePlugins();
       
        
        if(plugins_list.error){
            setMsg(MSG.CUSTOM("Error while fetching the app Details"));
        }else{
            console.log(plugins_list);
           
                    let txt = [];
                     for (let x in plugins_list) {
                        if(plugins_list[x] === true) {
                            txt.push({
                                key: x,
                                text: x.charAt(0).toUpperCase()+x.slice(1),
                                title: x.charAt(0).toUpperCase()+x.slice(1),
                                disabled: false
                            })
                        }
                        else {
                            txt.push({
                                key: x,
                                text: x.charAt(0).toUpperCase()+x.slice(1),
                                title: 'License Not Supported',
                                
                            })
                        }
                       }
                   
            setplugins_list(txt);
        }
        
        })()
        
    },[]);
    useEffect(() => {
        (() => {
            setLoading('Please Wait...');
            setTimeout(async () => {
            // console.log(selectedProject);
            //     const configurationList = await fetchConfigureList({
            //         'projectid': selectedProject
            //     });
            //     if(configurationList.error) {
            //         if(configurationList.error.CONTENT) {
            //             setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
            //         } else {
            //             setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
            //         }
            //     }else {
            //         setConfigList(configurationList);
            //     }
            //     setLoading(false);
            }, 500);
        })()
    }, []);
    
    const dialogFuncMap = {
        'displayBasic': setDisplayBasic,
        'displayBasic1': setDisplayBasic1,
        'displayBasic2': setDisplayBasic2
    }
    const [selectedItem, setSelectedItem] = useState({});

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);
        if(name === 'displayBasic1'){
            setSelectedItem(position);
        }
        if (position) {
            setPosition(position);
        }
    }

        var myJsObj = {key: currentKey,
                'executionType' : executionTypeInRequest}
            var str = JSON.stringify(myJsObj, null, 4);
            // const abc = {\n&nbps;&nbps;&nbps;&nbps;
            //     'key': str,
            //     \n&nbps;&nbps;&nbps;&nbps;'executionType' : 'asynchronous'
            //     \n}`;
           
        const categories = [{name: 'Avo Assure Client', key: 'A'}, {name: 'Avo Agent / Avo Grid', key: 'B'}];
        const [selectedCategory, setSelectedCategory] = useState(categories[0]);

        document.addEventListener('input',(e)=>{
            
                    if(e.target.getAttribute('name')=="myRadios"){
                       }
                })
            
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Execute" title="Execute" onClick={async () => {
                let temp = execAutomation(currentKey);
                setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS))
                  onHide(name)} } autoFocus />
            </div>
        );
    }
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }
    const onProjectChange = async (option) => {
        setLoading('Please Wait...');
        setSelectedProject(option.key);
        setSelectedCycle(option.index);
        setProjectName(option.text);
        projectIdTypesDicts[option.key] === "Web" ? setShowCICD(true) : setShowCICD(false)
        const configurationList = await fetchConfigureList({
            'projectid': option.key
        });
        if(configurationList.error) {
            if(configurationList.error.CONTENT) {
                setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
            }
        }else {
            setConfigList(configurationList);
        }
        setLoading(false);
        // projectData(getProjectList.filter((config) => config.key === option.key)[0].data.cycle);
        
    }

    const copyKeyUrlFunc = (id) => {
        const data = document.getElementById(id).value;
        if (!data) {
            setApiKeyCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setApiKeyCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById(id);
        x.select();
        document.execCommand('copy');
        setApiKeyCopyToolTip("Copied!");
        setTimeout(() => {
            setApiKeyCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyTokenFunc = () => {
        const data = url;
        if (!data) {
            setCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById('api-url');
        x.select();
        document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyConfigKey = (key) => {
        if (navigator.clipboard.writeText(key)) {
            setCopyToolTip("Copied!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
        }
    }
    const deleteDevOpsConfig = (key) => {
        setLoading('Please Wait...');
        setTimeout(async () => {
            const deletedConfig = await deleteConfigureKey(key);
            if(deletedConfig.error) {
                if(deletedConfig.error.CONTENT) {
                    setMsg(MSG.CUSTOM(deletedConfig.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Deleting DevOps Configuration",VARIANT.ERROR));
                }
            }else {
                console.log('selectedProject');
                const configurationList = await fetchConfigureList({
                    'projectid': selectedProject
                });
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setMsg(MSG.CUSTOM("DevOps Configuration deleted successfully",VARIANT.SUCCESS));
            }
            setLoading(false);
        }, 500);
        setShowConfirmPop(false);
    }
    const [confirmExecuteNow, setConfirmExecuteNow] = useState(false);
    const getCurrentQueueState = async () => {
        setLoading('Please Wait...');
        const queueList = await getQueueState();
        if(queueList.error) {
            if(queueList.error.CONTENT) {
                setMsg(MSG.CUSTOM(queueList.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Error While Fetching Execution Queue List",VARIANT.ERROR));
            }
        }else {
            let nodesCollection = [];
            for (let item in queueList) {
                //To handle empty execution List id key
                if(queueList && queueList[item] && queueList[item] && queueList[item][0] && queueList[item][0][0]){
                    let nodeItem = {
                        value: item,
                        label: item+'   :   '+queueList[item][0][0].configurename,
                        showCheckbox: false
                    }
                    let nodeItemChildren = [];
                    let nodeItemChildrenIndex = 1;
                    for (let executionNode of queueList[item]) {
                        let executionItem = {
                            value: item+nodeItemChildrenIndex,
                            label: <div className="devOps_terminate_icon">Execution {nodeItemChildrenIndex}   <img src={"static/imgs/cicd_terminate.png"} title="Terminate Execution" alt="Terminate icon" onClick={async () => {
                                    const deleteExecutionFromQueue = await deleteExecutionListId({configurekey: item, executionListId: executionNode[0].executionListId});
                                    if(deleteExecutionFromQueue.status !== 'pass') {
                                        setMsg(MSG.CUSTOM("Error While Removing Execution from Execution Queue",VARIANT.ERROR));
                                    }else {
                                        getCurrentQueueState();
                                    }
                                }}/></div>,
                            showCheckbox: false,
                            // className: 'devOps_terminate_style',
                            children: executionNode.map((executionRequest) => ({
                                label: 'Module : '+executionRequest.modulename+',   Status: '+executionRequest.status,
                                value: executionRequest.executionListId+executionRequest.moduleid,
                                showCheckbox: false
                            }))
                        };
                        nodeItemChildrenIndex++;
                        nodeItemChildren.push(executionItem);
                    }
                    nodeItem['children'] = nodeItemChildren;
                    nodesCollection.push(nodeItem);
                }
            }
            setExecutionQueue({
                list: nodesCollection,
                expanded: []
            });
        }
        setLoading(false);
    }
    const onClickDeleteDevOpsConfig = (name, key) => {
        setShowConfirmPop({'title': 'Delete DevOps Configuration', 'content': <p>Are you sure, you want to delete <b>{name}</b> Configuration?</p>, 'onClick': ()=>{ deleteDevOpsConfig(key) }});
    }
    const handleSearchChange = (value) => {
        let filteredItems = configList.filter(item => (item.configurename.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.project.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.release.toLowerCase().indexOf(value.toLowerCase()) > -1));
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    const getIntegrationSelected = (integration) => {
        let selectedIntegration = '';
        Object.keys(integration).forEach((currentInteg) => {
            if(integration[currentInteg].url !== '') {
                selectedIntegration = currentInteg;
            }
        });
        if(selectedIntegration === 'qtest') selectedIntegration = 'qTest'
        if(selectedIntegration === 'alm') selectedIntegration = 'ALM'
        if(selectedIntegration === 'zephyr') selectedIntegration = 'Zephyr'
        return selectedIntegration;
    }
    const handleEdit = (item) => {
        setCurrentIntegration({
            name: item.configurename,
            key: item.configurekey,
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '30%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
            ],
            scenarioList: getScenarioList(item.executionRequest.batchInfo, item.executionRequest.selectedModuleType),
            selectedModuleType: item.executionRequest.selectedModuleType,
            avoAgentGrid: 'cicdanyagentcanbeselected',
            browsers: item.executionRequest.browserType,
            integration: getIntegrationSelected(item.executionRequest.integration),
            executionType: item.executionRequest.executiontype,
            isHeadless: item.executionRequest.isHeadless,
            executionRequest: item.executionRequest
        });
        return;
    }
    const getScenarioList = (batchInfo, selectedModulesType) => {
        let scenarioList = [];
        for(let batch of batchInfo)
            for(let suiteIndex=0; suiteIndex<batch.suiteDetails.length; suiteIndex++) {
                if(selectedModulesType === 'normalExecution') scenarioList.push(batch.suiteDetails[suiteIndex].scenarioId)
                else if(selectedModulesType === 'batchExecution') scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)
                else {
                    scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)}
            }
        return scenarioList;
    }
    // useEffect(() => {
    //     (() => {
    //         setLoading('Please Wait...');
    //         setTimeout(async () => {
    //         console.log(selectedProject);
    //             const configurationList = await fetchConfigureList({
    //                 'projectid': selectedProject
    //             });
    //             if(configurationList.error) {
    //                 if(configurationList.error.CONTENT) {
    //                     setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
    //                 } else {
    //                     setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
    //                 }
    //             }else {
    //                 setConfigList(configurationList);
    //             }
    //             setLoading(false);
    //         }, 500);
    //     })()
    // }, []);
 
    // let projectid = getProjectList[0].code
    // console.log(projectid)let projectid = getProjectList[0].code
    // console.log(projectid)

    const CheckStatusAndExecute = (executionData, iceNameIdMap) => {
        if(Array.isArray(executionData.targetUser)){
			for(let icename in executionData.targetUser){
				let ice_id = iceNameIdMap[executionData.targetUser[icename]];
				if(ice_id && ice_id.status){
                    setDataExecution(executionData);
					setAllocateICE(false);
                    setProceedExecution(true);
                    return
				} 
			}
		}else{
			let ice_id = iceNameIdMap[executionData.targetUser];
			if(ice_id && ice_id.status){
                setDataExecution(executionData);
				setAllocateICE(false);
                setProceedExecution(true);
                return
			} 
		}
        ExecuteTestSuite(executionData);
    }

    const ExecuteTestSuite = async (executionData) => {
       
        if(executionData === undefined) executionData = dataExecution;
        setAllocateICE(false);
        const modul_Info = parseLogicExecute(eachData, currentTask, appType, filter_data, moduleInfo, '', '');
        if(modul_Info === false) return;
        setLoading("Sending Execution Request");
        executionData["source"]="task";
        executionData["exectionMode"]=execAction;
        executionData["executionEnv"]=execEnv;
        executionData["browserType"]=browserTypeExe;
        executionData["integration"]=integration;
        executionData["batchInfo"]=modul_Info;
        executionData["scenarioFlag"] = (currentTask.scenarioFlag == 'True') ? true : false
        ResetSession.start();
        try{
            setLoading(false);
            const data = await ExecuteTestSuite_ICE(executionData);
            if (data.errorapi){displayError(data.errorapi);return;}
            if (data === "begin"){
                return false;
            }
            ResetSession.end();
            if(data.status) {
                if(data.status === "fail") {
                    setMsg(MSG.CUSTOM(data["error"],data.variant));
                } else {
                    setMsg(MSG.CUSTOM(data["message"],data.variant));
                }
            }
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setExecEnv("default");
        }catch(error) {
            setLoading(false);
            ResetSession.end();
            displayError(MSG.EXECUTE.ERR_EXECUTE)
            setBrowserTypeExe([]);
            setModuleInfo([]);
            setExecAction("serial");
            setExecEnv("default");
        }
    }

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    const readTestSuiteFunct = async (readTestSuite, item) => {
        setLoading("Loading in Progress. Please Wait");
        const result = await readTestSuite_ICE(readTestSuite, "execute");
        if(result.error){displayError(result.error);return;}
        else if (result.testSuiteDetails) {
            var data = result.testSuiteDetails;
            var keys = Object.keys(data);
            var tableData = [];
            keys.map(itm => tableData.push({...data[itm]}));

            //CR 2287 - If a scenario is opened and then navigated to it's scheduling then by default that particular scenario must be selected and rest of the scenarios from the module must be unselected.
            // if (current_task.scenarioFlag === 'True') {
            //     for (var m = 0; m < keys.length; m++) {
            //         for (var k = 0; k < tableData[m].scenarioids.length; k++) {
            //             if (tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds || tableData[m].scenarioids[k] === current_task.assignedTestScenarioIds[0]) {
            //                 tableData[m].executestatus[k] = 1;
            //             } else tableData[m].executestatus[k] = 0;
            //         }
            //     }
            // }

            // Change executestatus of scenarios which should not be scheduled according to devops config
            for (var m = 0; m < keys.length; m++) {
                tableData[m].scenarioids.map((scenarioid, index) => {
                    tableData[m].executestatus[index] = 0;
                    if (m < item.executionRequest.batchInfo.length) {
                        for (var k in item.executionRequest.batchInfo[m].suiteDetails) {
                            if (scenarioid === item.executionRequest.batchInfo[m].suiteDetails[k].scenarioId) {
                                tableData[m].executestatus[index] = 1;
                                break;
                            }
                        }
                    }
                });
            }
            setEachData(tableData);
        }
        setLoading(false);
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
            Execution Profile
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" style={{width: '44vh'}} onClick={() => setCurrentIntegration({
                    name: '',
                    key: uuid(),
                    selectValues: [
                        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: selectedProject, width: '30%', disabled: false, selectedName: projectName },
                        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: projectData1, width: '25%', disabled: true, selectedName: '' },
                        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: projectData, width: '25%', disabled: true, selectedName: cycleName },
                    ],
                    scenarioList: [],
                    avoAgentGrid: 'cicdanyagentcanbeselected',
                    browsers: [],
                    selectedModuleType: 'normalExecution',
                    integration: '',
                    executionType: 'asynchronous',
                    isHeadless: false
                })} >Add Profile</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput'>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                <div className="api-ut__btnGroup">
                    { showCICD ? <button onClick={() => getCurrentQueueState() }>Manage Execution Queue</button> : null }
                </div>
    
            </> }
            
        </div>
        
                  <div style={{marginTop: '8vh',position: 'absolute', display: 'flex'}}>
                 <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '1vh', marginRight: '5px'}}>Project Name : </span>
        
                    {/* <Dropdown value={selectedProject} style={{width:'31vh', position: 'relative', border:'0.4vh solid #613191 '}} options={getProjectList} onChange={onProjectChange} optionLabel="name"  placeholder="Select the Project"/> */}
                <SearchDropdown
                    noItemsText={[ ]}
                    onChange={onProjectChange}
                    options={getProjectList}
                    // placeholder={setCurrentIntegration && configList.map((item, index) => item.project)}
                    selectedKey={selectedProject}
                    width='15rem'

                    />  
                    {/* <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '0.5rem', marginRight: '5px'}}>Project Name : </span> */}
                </div>
            
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{flex: '0 1 0%', paddingLeft:'2vh', paddingRight:'2vh'}}>
                <div className="d__table_header">
                <span className=" d__obj_head tkn-table__sr_no tkn-table__head" >#&nbsp;</span>
                    <span className="d__out_head tkn-table__key tkn-table__head1" >&nbsp;&nbsp;Execution Profile Name</span>
                    {/* <span className="details_col tkn-table__key d__det_head" >Configuration Key</span> */}
                    {/* <span className="d__inp_head tkn-table__project tkn-table__head" >Project</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Release</span> */}
                    <span className="details_col tkn-table__key d__det_head ">Execution Action</span>
                    <span className=" details_col tkn-table__key d__det_head" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token" style={{marginLeft: '-1.5vh',width: '101%'}}>
                <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                
                                <td className="tkn-table__key" data-for="name" data-tip={item.configurename} style={{justifyContent: 'flex-start'}}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.configurename} </td>&nbsp;&nbsp;&nbsp;&nbsp;
                                {/* <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td> */}
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                
                                <td className="tkn-table__button" >
                                <img onClick={() =>{
                                    onClick('displayBasic2');
                                    setCurrentKey(item.configurekey);
                                    setAppType(item.executionRequest.batchInfo[0].appType);
                                    setBrowserTypeExe(item.executionRequest.browserType);
                                    let testSuiteDetails = item.executionRequest.batchInfo.map((element) => {
                                        return ({
                                            assignedTime: "",
                                            releaseid: element.releaseId,
                                            cycleid: element.cycleId,
                                            testsuiteid: element.testsuiteId,
                                            testsuitename: element.testsuiteName,
                                            projectidts: element.projectId,
                                            assignedTestScenarioIds: "",
                                            subTaskId: "",
                                            versionnumber: element.versionNumber,
                                            domainName: element.domainName,
                                            projectName: element.projectName,
                                            cycleName: element.cycleName
                                        });                                   
                                    });
                                    setCurrentTask({
                                        testSuiteDetails: testSuiteDetails
                                    });
                                    readTestSuiteFunct(testSuiteDetails, item);
                                    }} src="static/imgs/Execute.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                {/* <button onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                        //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp; */}
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     <img onClick={() =>{onClick('displayBasic1', item)}} src="static/imgs/Schedule.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                     {/* <button  onClick={() =>onClick('displayBasic1', item)}>  Schedule </button>&nbsp;&nbsp;&nbsp; */}
                                     { showCICD ? <img onClick={() =>{onClick('displayBasic');setCurrentKey(item.configurekey)}} src="static/imgs/CICD.png" className="action_icons" alt="Edit Icon"/> : null }
                                     {/* { showCICD ? <button  onClick={() =>onClick('displayBasic')}> CI / CD </button> : null } */}
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '8vh', height: '3vh'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> 
                                        <img style={{height: '3vh'}} onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                    </td>
                             </tr>)
                         }
                        {
                             searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__key" data-for="name" data-tip={item.configurename} style={{justifyContent: 'flex-start'}}> <ReactTooltip id="name" effect="solid" backgroundColor="black"  />{item.configurename} </td>
                                {/* <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td> */}
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                            
                                <td className="tkn-table__button" >
                                <img onClick={() =>{
                                    onClick('displayBasic2');
                                    setCurrentKey(item.configurekey);
                                    setAppType(item.executionRequest.batchInfo[0].appType);
                                    setBrowserTypeExe(item.executionRequest.browserType);
                                    let testSuiteDetails = item.executionRequest.batchInfo.map((element) => {
                                        return ({
                                            assignedTime: "",
                                            releaseid: element.releaseId,
                                            cycleid: element.cycleId,
                                            testsuiteid: element.testsuiteId,
                                            testsuitename: element.testsuiteName,
                                            projectidts: element.projectId,
                                            assignedTestScenarioIds: "",
                                            subTaskId: "",
                                            versionnumber: element.versionNumber
                                        });                                   
                                    });
                                    setCurrentTask({
                                        testSuiteDetails: testSuiteDetails
                                    });
                                    readTestSuiteFunct(testSuiteDetails, item);
                                    }} src="static/imgs/Execute.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                {/* <button title="Execute" onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                       //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp; */}
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     
                                     <img onClick={() =>{onClick('displayBasic1', item)}} src="static/imgs/Schedule.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                     {/* <button  onClick={() =>onClick('displayBasic1', item)}>  Schedule </button>&nbsp;&nbsp;&nbsp; */}
                                     { showCICD ? <img onClick={() =>{onClick('displayBasic');setCurrentKey(item.configurekey)}} src="static/imgs/CICD.png" className="action_icons" alt="Edit Icon"/> : null }
                                     {/* { showCICD ? <button  onClick={() =>onClick('displayBasic')}> CI / CD </button> : null } */}
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '8vh'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                   </td>
                             </tr>)
                         }
                    </tbody>
                </table>
                
               {/* Dialog for Execute Now */}
                <Dialog header="Execute Now" visible={displayBasic2} style={{ width: '40vw' }}  footer={renderFooter('displayBasic2')} onHide={() => onHide('displayBasic2')}>
                    {/* <div style={{display: 'flex', justifyContent: 'space-around'}}>
                    {
                        categories.map((category) => {
                            return (
                                <div key={category.key} >
                                    <RadioButton inputId={category.key} name="category" value={category} onChange={(e) => setSelectedCategory(e.value)}  checked={selectedCategory.key === category.key} />
                                    <label htmlFor={category.key} style={{ marginBottom: '-0.5rem', marginLeft: '0.5rem'}}>{category.name}</label>
                                </div>
                            )
                        })
                    }
                    </div> */}
                    <input type="radio" name='myRadios' id='first'  onChange={() => {setAllocateICE(true); setDisplayBasic2(false);}}
                     style={{width:'2.5vh', height: '2.5vh'}} />&nbsp;&nbsp;
                    <label htmlFor='first' className="devOps_dropdown_label devOps_dropdown_label_ice" style={{width:'25vh', height: '4vh'}}>Avo Assure Client</label>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="radio" name='myRadios' id='second' onChange={()=>{}} style={{width:'2.5vh', height: '2.5vh'}} checked/>&nbsp;&nbsp;
                    <label htmlFor='second' className="devOps_dropdown_label devOps_dropdown_label_ice" style={{width:'25vh', height: '4vh'}}>Avo Agent / Avo Grid</label> 
                
                </Dialog>
                {/* Dialog for Execute Now */}

                {allocateICE?
                <AllocateICEPopup 
                    SubmitButton={CheckStatusAndExecute} 
                    setAllocateICE={setAllocateICE} 
                    modalButton={"Execute"} 
                    allocateICE={allocateICE} 
                    modalTitle={"Select ICE to Execute"} 
                    icePlaceholder={'Search ICE to execute'}
                    exeTypeLabel={"Select Execution type"}
                    exeIceLabel={"Execute on ICE"}
                    ExeScreen={true}
                    currentTask={currentTask}
                />:null}

                {/* Dialog for Schedule */}
                <Dialog className='schedule__dialog' header="" visible={displayBasic1}  onDismiss = {() => {displayBasic1(false)}} style={{ width: '80vw',height:'110rem' }}  onHide={() => onHide('displayBasic1')}><ScheduleHome item={selectedItem} /></Dialog>
                {/* Dialog for Schedule */} 

                {/* Dialog for CI /CD  */}

                <Dialog header="Execute via CI/CD" visible={displayBasic} style={{ width: '50vw' }}  onHide={() => onHide('displayBasic')}>
                    <div style={{display: 'flex', marginBottom:'3vh'}}>
                    <span className="devOps_dropdown_label devOps_dropdown_label_url" style={{marginRight: '1%', marginTop: '1.5rem'}}>DevOps Integration API url : </span>
                        <pre className='grid_download_dialog__content__code' style={{ width: '58vh'}}>
                        <code>
                        {url}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px", marginTop: '3.5vh'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                            </div>
                        </label>
                </div>
                        <div style={{display: 'flex', marginBottom:'3vh'}}>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                                <label id='async' htmlFor='synch' value='asynchronous'>Asynchronous </label>
                                <Toggle label="" inlineLabel={true} onChange = {() => executionTypeInRequest == 'asynchronous' ? setExecutionTypeInRequest('synchronous') : setExecutionTypeInRequest('asynchronous')}/>
                                <label id='sync' htmlFor='synch' value='synchronous'>Synchronous </label>
                        </div>
                    </div>
                        <div style={{display: 'flex', marginBottom:'3vh'}}>
                        <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '8.5vh'}}>DevOps Request Body : </span>
                        <pre className='grid_download_dialog__content__code' style={{ width: '58vh', marginLeft: '46px'}}>
                        <code style={{fontSize: 'smaller'}}>
                            {str}
                            {/* {abc} */}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                                <div style={{fontSize:"24px",marginTop:'5vh'}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px", marginTop: '1.5rem'}} data-for="copy" data-tip={copyToolTip} onClick={() => {  copyKeyUrlFunc('devops-key') }} ></i>
                            </div>
                        </label>
                </div>
                </Dialog>
                {/* Dialog for CI /CD  */}
                </ScrollBar>
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/no-devops-config.svg" alt="Empty List Image"/> </div> }
    </>);
}

const parseLogicExecute = (eachData, current_task, appType, projectdata, moduleInfo,accessibilityParameters, scenarioTaskType) => {
    for(var i =0 ;i<eachData.length;i++){
        var testsuiteDetails = current_task.testSuiteDetails[i];
        var suiteInfo = {};
        var selectedRowData = [];
        var relid = testsuiteDetails.releaseid;
        var cycid = testsuiteDetails.cycleid;
        var projectid = testsuiteDetails.projectidts;
        
        for(var j =0 ; j<eachData[i].executestatus.length; j++){
            if(eachData[i].executestatus[j]===1){
                selectedRowData.push({
                    condition: eachData[i].condition[j],
                    dataparam: [eachData[i].dataparam[j].trim()],
                    scenarioName: eachData[i].scenarionames[j],
                    scenarioId: eachData[i].scenarioids[j],
                    scenariodescription: undefined,
                    accessibilityParameters: accessibilityParameters
                });
            }
        }
        suiteInfo.scenarioTaskType = scenarioTaskType;
        suiteInfo.testsuiteName = eachData[i].testsuitename;
        suiteInfo.testsuiteId = eachData[i].testsuiteid;
        suiteInfo.batchname = eachData[i].batchname;
        suiteInfo.versionNumber = testsuiteDetails.versionnumber;
        suiteInfo.appType = appType;
        suiteInfo.domainName = (projectid in projectdata.project) ? projectdata.project[projectid].domain : testsuiteDetails.domainName;
        suiteInfo.projectName = (projectid in projectdata.projectDict) ? projectdata.projectDict[projectid] : testsuiteDetails.projectName;
        suiteInfo.projectId = projectid;
        suiteInfo.releaseId = relid;
        suiteInfo.cycleName = (cycid in projectdata.cycleDict) ? projectdata.cycleDict[cycid] : testsuiteDetails.cycleName;
        suiteInfo.cycleId = cycid;
        suiteInfo.suiteDetails = selectedRowData;
        if(selectedRowData.length !== 0) moduleInfo.push(suiteInfo);
    }
    return moduleInfo;
}

export default DevOpsList;
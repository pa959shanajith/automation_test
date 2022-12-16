import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ModalContainer, ResetSession} from '../../global';
import { SearchBox , SearchDropdown, Toggle  } from '@avo/designcomponents';
import { fetchConfigureList, deleteConfigureKey, execAutomation, fetchProjects, fetchAvoAgentAndAvoGridList,getQueueState, deleteExecutionListId  } from '../api';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useSelector, useDispatch } from 'react-redux';
import * as actionTypes from '../../plugin/state/action';
import { ExecuteTestSuite_ICE } from '../../execute/api';
import {getDetails_ICE ,getAvailablePlugins} from "../../plugin/api";
import {readTestSuite_ICE} from '../../schedule/api';
import * as pluginApi from "../../plugin/api";
import {v4 as uuid} from 'uuid';
import CheckboxTree from 'react-checkbox-tree';
import ScheduleHome from '../../schedule/containers/ScheduleHome';
import AllocateICEPopup from '../../global/components/AllocateICEPopup';
import "../styles/DevOps.scss";
import DropDownList from '../../global/components/DropDownList';
import { getPools, getICE_list } from '../../execute/api';



const DevOpsList = ({ integrationConfig,setShowConfirmPop, setCurrentIntegration, url, showMessageBar, setLoading, setIntegrationConfig, projectIdTypesDicts }) => {
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [searchText, setSearchText] = useState("");
    const [configList, setConfigList] = useState([]);
    const dispatch = useDispatch();
    const [executionQueue, setExecutionQueue] = useState(false);
    const [filteredList, setFilteredList] = useState(configList);
    const [displayBasic, setDisplayBasic] = useState(false);
    const [displayBasic1, setDisplayBasic1] = useState(false);
    const [displayBasic2, setDisplayBasic2] = useState(false);
    const [displayBasic3, setDisplayBasic3] = useState(false);
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
    const [currentKey,setCurrentKey] = useState('');
    const [projectName, setProjectName] = useState('');
    const [currentName, setCurrentName] = useState('');
    const current_task = useSelector(state=>state.plugin.PN);
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
    const [cycleName, setCycleName] = useState('');
    const [poolType,setPoolType] = useState("unallocated");
    const [inputErrorBorder,setInputErrorBorder] = useState(false);
    const [smartMode,setSmartMode] = useState('normal');
    const [selectedICE,setSelectedICE] = useState("");
    const [availableICE, setAvailableICE] = useState([]);
    const [ExeScreen, setExeScreen] = useState(true);
    const [poolList,setPoolList] = useState({});
    const [chooseICEPoolOptions,setChooseICEPoolOptions] = useState([]);
    const [iceStatus,setIceStatus] = useState([]);
    const [iceNameIdMap,setIceNameIdMap] = useState({});
    const [showIcePopup,setShowIcePopup] = useState(false);


    useEffect(()=>{
        pluginApi.getProjectIDs()
        .then(data => {
                projectIdTypesDicts[data.projectId[selectedCycle]] === "Web" ? setShowCICD(true) : setShowCICD(false)
    })},[])


    // useEffect(()=>{
    //     pluginApi.getProjectIDs()
    //     .then(data => {
    //             // setProjectData1(data.releases[selectedCycle][0].name);
    //             setProjectData(data.releases[selectedCycle][0].cycles[0]._id);
    //             setCycleName(data.releases[selectedCycle][0].cycles[0].name);
    // })},[selectedCycle])
  
    useEffect(()=>{
        (async() => {
            const UserList =  await pluginApi.getUserDetails("user");

            if(UserList.error){
                setMsg(MSG.CUSTOM("Error while fetching the user Details"));
            }else{
                setUserDetailList(UserList);
            }

            const ProjectList = await pluginApi.getProjectIDs();
            setProjectData1(ProjectList.releases[current_task][0].name);
            setProjectData(ProjectList.releases[current_task][0].cycles[0]._id);
            setCycleName(ProjectList.releases[current_task][0].cycles[0].name);
            
            if(ProjectList.error){
                setMsg(MSG.CUSTOM("Error while fetching the project Details"));
            }else{
                const arraynew = ProjectList.projectId.map((element, index) => {
                return (
                    {
                        key: element,
                        text: ProjectList.projectName[index],
                        title: ProjectList.projectName[index],
                        index: index
                    }
                )
            });
            setProjectList(arraynew);
            setSelectedProject(arraynew[current_task ? current_task :0].key);
            setProjectName(arraynew[current_task ? current_task :0].text);

            if(arraynew.length > 0) {
                const configurationList = await fetchConfigureList({
                    'projectid': arraynew[current_task ? current_task :0].key
                });
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching Execute Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
            }
            setLoading(false);
        }
        
        var plugins = []; 
        const plugins_list= await getAvailablePlugins();
       
        if(plugins_list.error){
            setMsg(MSG.CUSTOM("Error while fetching the app Details"));
        }else{
        
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
        
    })();

},[current_task]);
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
        'displayBasic2': setDisplayBasic2,
        'displayBasic3' : setDisplayBasic3
    }
    const [selectedItem, setSelectedItem] = useState({});

    const onProjectChange = async (option) => {
        setLoading('Please Wait...');
        setSelectedProject(option.key);
        dispatch({type: actionTypes.SET_PN, payload:option.index});
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
        
        
    }

    const copyKeyUrlFunc = (id) => {
        const data = document.getElementById(id).title;
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

    const copyConfigKey = (title) => {
        if (navigator.clipboard.writeText(title)) {
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
                    setMsg(MSG.CUSTOM("Error While Deleting Execute Configuration",VARIANT.ERROR));
                }
            }else {
                const configurationList = await fetchConfigureList({
                    'projectid': selectedProject
                });
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching Execute Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setMsg(MSG.CUSTOM("Execute configuration deleted successfully.",VARIANT.SUCCESS));
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
        let filteredItems = configList.filter(item => (item.configurename.toLowerCase().indexOf(value.toLowerCase()) > -1));
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
            scenarioList: getScenarioList(item.executionRequest.batchInfo, item.executionRequest.selectedModuleType,item.executionRequest.donotexe),
            selectedModuleType: item.executionRequest.selectedModuleType,
            avoAgentGrid: 'cicdanyagentcanbeselected',
            browsers: item.executionRequest.browserType,
            integration: getIntegrationSelected(item.executionRequest.integration),
            executionType: item.executionRequest.executiontype,
            isHeadless: item.executionRequest.isHeadless,
            executionRequest: item.executionRequest,
            disable: true,
            selectedBrowserType: showCICD
        });
        return;
    }
    const getScenarioList = (batchInfo, selectedModulesType,donotexe) => {
        let scenarioList = [];
        let counter = 0;
        for(let batch of batchInfo)
            for(let suiteIndex=0; suiteIndex<batch.suiteDetails.length; suiteIndex++) {
                if(selectedModulesType === 'normalExecution') scenarioList.push(batch.suiteDetails[suiteIndex].scenarioId)
                else if(selectedModulesType === 'batchExecution') scenarioList.push(batch.batchname+batch.testsuiteId+donotexe['current'][batch.testsuiteId][suiteIndex]+batch.suiteDetails[suiteIndex].scenarioId)
                else {
                    scenarioList.push(batch.batchname+batch.testsuiteId+donotexe['current'][batch.testsuiteId][suiteIndex]+batch.suiteDetails[suiteIndex].scenarioId)}
            }
        return scenarioList;
    }

    
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
           
        const categories = [{name: 'Avo Assure Client', key: 'A'}, {name: 'Avo Agent / Avo Grid', key: 'B'}];
        const [selectedCategory, setSelectedCategory] = useState(categories[0]);

        document.addEventListener('input',(e)=>{
            
                    if(e.target.getAttribute('name')=="myRadios"){
                       }
                })
            
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Execute" title="Execute" className="p-button-rounded" onClick={async () => {
                    if (showIcePopup) {
                        dataExecution.type = (ExeScreen===true?((smartMode==="normal")?"":smartMode):"")
                        dataExecution.poolid = ""
                        if((ExeScreen===true?smartMode:"") !== "normal") dataExecution.targetUser = Object.keys(selectedICE).filter((icename)=>selectedICE[icename]);
                        else dataExecution.targetUser = selectedICE
                        CheckStatusAndExecute(dataExecution, iceNameIdMap);
                        onHide(name);
                    }
                    else {
                        const temp = await execAutomation(currentKey);
                        if(temp.status !== "pass") {
                            if(temp.error && temp.error.CONTENT) {
                                setMsg(MSG.CUSTOM(temp.error.CONTENT,VARIANT.ERROR));
                            } else {
                                setMsg(MSG.CUSTOM("Error While Adding Configuration to the Queue",VARIANT.ERROR));
                            }
                        }else {
                            setMsg(MSG.CUSTOM("Execution Added to the Queue.",VARIANT.SUCCESS));
                        }
                        onHide(name);
                    }
                }
            } autoFocus />
            </div>
        );
    }
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }



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

    const fetchData = async (projectId) => {
        setSmartMode('normal');
		setSelectedICE("");
		var projId = projectId;
		var dataforApi = {poolid:"",projectids: [projId]}
		setLoading('Fetching ICE ...')
        const data = await getPools(dataforApi);
        if(data.error){displayError(data.error);return;}
        setPoolList(data);
        var arr = Object.entries(data);
        arr.sort((a,b) => a[1].poolname.localeCompare(b[1].poolname))
        setChooseICEPoolOptions(arr);
        const data1 = await getICE_list({"projectid":projId});
        if(data1.error){displayError(data1.error);return;}
        setIceStatus(data1)
        populateICElist(arr,true,data1)
        setLoading(false);
    }

    const populateICElist = (arr, unallocated, iceStatusdata) => {
        var ice = [];
        var iceStatusValue = {};
        if (iceStatusdata !== undefined) iceStatusValue = iceStatusdata.ice_ids;
        else if (iceStatusdata === undefined) iceStatusValue = iceStatus.ice_ids;
        const statusUpdate = (ice) => {
            var color = '#fdc010';
            var status = 'Offline';
            if (ice.connected) {
                color = '#95c353';
                status = 'Online';
            }
            if (ice.mode) {
                color = 'red';
                status = 'DND mode';
            }
            return { color, status };
        };
        if (unallocated) {
            setPoolType("unallocated");
            if (arr === undefined) iceStatusdata = iceStatus;
            arr = Object.entries(iceStatusdata.unallocatedICE);
            arr.forEach((e) => {
                var res = statusUpdate(e[1]);
                e[1].color = res.color;
                e[1].statusCode = res.status;
                ice.push(e[1]);
            });
        } else {
            setPoolType("allocated");
            var iceNameIdMapData = { ...iceNameIdMap };
            arr.forEach((e) => {
                if (e[1].ice_list) {
                    Object.entries(e[1].ice_list).forEach((k) => {
                        if (k[0] in iceStatusValue) {
                            var res = statusUpdate(iceStatusValue[k[0]]);
                            iceNameIdMapData[k[1].icename] = {};
                            iceNameIdMapData[k[1].icename].id = k[0];
                            iceNameIdMapData[k[1].icename].status = iceStatusValue[k[0]].status;
                            k[1].color = res.color;
                            k[1].statusCode = res.status;
                            ice.push(k[1]);
                        }
                    });
                }
            });
            setIceNameIdMap(iceNameIdMapData);
        }
        ice.sort((a, b) => a.icename.localeCompare(b.icename));
        setAvailableICE(ice);
    }

    return (<>
     {
            executionQueue &&
            <Dialog header="Manage Execution Queue" className='Manage_Execution' visible={displayBasic3}  onDismiss = {() => {displayBasic3(false)}}  onHide={() => onHide('displayBasic3')}>
            {
                        (executionQueue.list.length > 0 ) ? <CheckboxTree
                            showNodeIcon={false} className='devOps_checkbox_tree' nodes={executionQueue.list} expanded={executionQueue.expanded} onExpand={(expanded) => setExecutionQueue({...executionQueue, expanded: expanded}) } /> : 
                            <p>You have nothing pending to execute. Try to Execute any Configure Key and come here. </p>
                    }
            </Dialog>
        }
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
            Execution Profile
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" className='submit-button-test_profile' onClick={() => setCurrentIntegration({
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
                    <button onClick={() => {onClick('displayBasic3');getCurrentQueueState()} }>Manage Execution Queue</button>
                </div>
    
            </> }
            
        </div>
        
                <div className = "projectName">
                 <span className="api-ut__inputLabel projectName1" >Project Name : </span>
        
                    
                <SearchDropdown
                    noItemsText={[ ]}
                    onChange={onProjectChange}
                    options={getProjectList}
                    selectedKey={selectedProject}
                    width='15rem'

                    />  
                    
                </div>
            
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table">
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
            <div id="activeUsersToken" className="wrap active-users-token active-users-token1 " >
                <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                
                                <td className="tkn-table__key tkn-table__key1" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.configurename} </td>
                                {/* <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td> */}
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                
                                <td className="tkn-table__button" >
                                <img onClick={() =>{
                                    onClick('displayBasic2');
                                    setCurrentKey(item.configurekey);
                                    setAppType(item.executionRequest.batchInfo[0].appType);
                                    setBrowserTypeExe(item.executionRequest.browserType);
                                    setCurrentName(item.configurename);
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
                                    fetchData(item.executionRequest.batchInfo[0].projectId);
                                    setShowIcePopup(false);
                                    }} src="static/imgs/Execute.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                {/* <button onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                        //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute </button>&nbsp;&nbsp;&nbsp; */}
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     <img onClick={() =>{onClick('displayBasic1', item)}} src="static/imgs/Schedule.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                     {/* <button  onClick={() =>onClick('displayBasic1', item)}>Schedule</button>&nbsp;&nbsp;&nbsp; */}
                                     <img onClick={() =>{onClick('displayBasic');setCurrentKey(item.configurekey)}} src="static/imgs/CICD.png" className="action_icons" alt="Edit Icon"/>
                                     {/* <button  onClick={() =>onClick('displayBasic')}> CI / CD </button> */}
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons Edit_button" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons Delete_button" alt="Delete Icon"/>
                                    </td>
                             </tr>)
                         }
                        {
                             searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__key tkn-table__key1" data-for="name" data-tip={item.configurename} > <ReactTooltip id="name" effect="solid" backgroundColor="black"  />{item.configurename} </td>
                                {/* <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td> */}
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                            
                                <td className="tkn-table__button" >
                                <img onClick={() =>{
                                    onClick('displayBasic2');
                                    setCurrentKey(item.configurekey);
                                    setAppType(item.executionRequest.batchInfo[0].appType);
                                    setBrowserTypeExe(item.executionRequest.browserType);
                                    setCurrentName(item.configurename);
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
                                    fetchData(item.executionRequest.batchInfo[0].projectId);
                                    setShowIcePopup(false);
                                    }} src="static/imgs/Execute.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                {/* <button title="Execute" onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                       //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute </button>&nbsp;&nbsp;&nbsp; */}
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     <img onClick={() =>{onClick('displayBasic1', item)}} src="static/imgs/Schedule.png" className="action_icons" alt="Edit Icon"/>&nbsp;&nbsp;&nbsp;
                                     {/* <button  onClick={() =>onClick('displayBasic1', item)}>Schedule</button>&nbsp;&nbsp;&nbsp; */}
                                     <img onClick={() =>{onClick('displayBasic');setCurrentKey(item.configurekey)}} src="static/imgs/CICD.png" className="action_icons" alt="Edit Icon"/>
                                     {/* <button  onClick={() =>onClick('displayBasic')}> CI / CD </button> */}
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons Edit_button1" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                   </td>
                             </tr>)
                         }
                    </tbody>
                </table>
                
               {/* Dialog for Execute Now */}
                <Dialog header="Execute Now" visible={displayBasic2}  className="execution" style={{ width: "58vw" }} footer={renderFooter('displayBasic2')} onHide={() => {onHide('displayBasic2'); setShowIcePopup(false) }}>
    
                    <input type="radio" name='myRadios' id='first'  className='radiobutton' onChange={() => {setShowIcePopup(true)}}
                      />&nbsp;&nbsp;
                    <label htmlFor='first' className="devOps_dropdown_label devOps_dropdown_label_ice radiobutton1" >Avo Assure Client</label>
                    <input type="radio" name='myRadios' id='second' onChange={()=>{setShowIcePopup(false)}} className='radiobutton' defaultChecked={true}/>&nbsp;&nbsp;
                    <label htmlFor='second' className="devOps_dropdown_label devOps_dropdown_label_ice radiobutton1" >Avo Agent / Avo Grid</label>
                    { showIcePopup && <div>
                        <div>
                            <div className='adminControl-ice popup-content'>
                                <div className='adminControl-ice popup-content popup-content-status'>
                                    <ul className="e__IceStatus">
                                        <li className="popup-li">
                                            <label title='available' className="legends legends-margin">
                                                <span id='status' className="status-available"></span>
                                                Available
                                            </label>
                                            <label title='unavailable' className="legends legends-margin">
                                                <span id='status' className="status-unavailable" ></span>
                                                Unavailable
                                            </label>
                                            <label title='do not disturb' className="legends legends-margin">
                                                <span id='status' className="status-dnd"></span>
                                                Do Not Disturb
                                            </label>
                                        </li>
                                    </ul>

                                </div>
                            </div>
                        </div>

                        <div className='adminControl-ice popup-content'>
                            <div>
                                <span className="leftControl" title="Token Name">{"Execute on"}</span>
                                <DropDownList poolType={poolType} ExeScreen={ExeScreen} inputErrorBorder={inputErrorBorder} setInputErrorBorder={setInputErrorBorder} placeholder={'Search'} data={availableICE} smartMode={(ExeScreen === true ? smartMode : '')} selectedICE={selectedICE} setSelectedICE={setSelectedICE} />
                            </div>
                        </div>
                    </div> }

                </Dialog>
                {/* Dialog for Execute Now */}

                {/* {allocateICE?
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
                />:null} */}

                {/* Dialog for Schedule */}
                <Dialog className='schedule__dialog' header="" visible={displayBasic1}  onDismiss = {() => {displayBasic1(false)}}   onHide={() => onHide('displayBasic1')}><ScheduleHome item={selectedItem} /></Dialog>
                {/* Dialog for Schedule */} 

                {/* Dialog for CI /CD  */}

                <Dialog header="Execute via CI/CD" visible={displayBasic} className="cicdName" onHide={() => onHide('displayBasic')}>
                    <div className="cicdDiv" title={url}>
                    <span className="devOps_dropdown_label devOps_dropdown_label_url cicdSpan" id='api-url' value={url}>DevOps Integration API url : </span>
                        <pre className='grid_download_dialog__content__code cicdpre'>
                        <code id='api-url' title={url}>
                        {url}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div className="labeldiv">
                                    <i className="fa fa-files-o icon labeldivi" data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(url) }} ></i>
                            </div>
                        </label>
                </div>
                        <div  className="executiontype">
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                                <label id='async' htmlFor='synch' value='asynchronous'>Asynchronous </label>
                                <Toggle label="" inlineLabel={true} onChange = {() => executionTypeInRequest == 'asynchronous' ? setExecutionTypeInRequest('synchronous') : setExecutionTypeInRequest('asynchronous')}/>
                                <label id='sync' htmlFor='synch' value='synchronous'>Synchronous </label>
                        </div>
                    </div>
                        <div className="executiontype" title={str}>
                        <span className="api-ut__inputLabel executiontypename" >DevOps Request Body : </span>
                        <pre className='grid_download_dialog__content__code executiontypenamepre' >
                        <code className="executiontypecode" id='devops-key' title={str} >
                            {str}
                            {/* {abc} */}
                        </code>
                        </pre>
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                                <div  className="labeldiv1">
                                <i className="fa fa-files-o icon labeldivi1"  data-for="copy" data-tip={copyToolTip} onClick={() => {  copyConfigKey(str) }} ></i>
                            </div>
                        </label>
                </div>
                </Dialog>
                {/* Dialog for CI /CD  */}
                </ScrollBar>
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/no-devops-config.png" alt="Empty List Image" label='No Execution Profile Found' className='configImg' /><span className='configImgspan'>No Execution Profile Found<h4 className='configImgh' ><b>Create Now</b></h4></span> </div> }
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
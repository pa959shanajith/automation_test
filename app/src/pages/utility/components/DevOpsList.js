import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ModalContainer } from '../../global';
import { SearchBox , SearchDropdown, Toggle } from '@avo/designcomponents';
import { fetchConfigureList, deleteConfigureKey, execAutomation, getQueueState, deleteExecutionListId } from '../api';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
// import { fetchProjects } from '../api';
import { ExecuteTestSuite_ICE } from '../../execute/api';
import {getDetails_ICE ,getAvailablePlugins} from "../../plugin/api";
import * as pluginApi from "../../plugin/api";
import {v4 as uuid} from 'uuid';
import AllocateICEPopup from '../../global/components/AllocateICEPopup'
import ScheduleHome from '../../schedule/containers/ScheduleHome';
import CheckboxTree from 'react-checkbox-tree';
import "../styles/DevOps.scss";



const DevOpsList = ({ integrationConfig,setShowConfirmPop, setCurrentIntegration, url, showMessageBar, setLoading, setIntegrationConfig }) => {
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
    const [getplugins_list,setplugins_list]=useState([]);
    const [projectData, setProjectData] = useState([]);
    const [allocateICE,setAllocateICE] = useState(false);
    const [userDetailList,setUserDetailList]=useState([]);
    const [proceedExecution, setProceedExecution] = useState(false);
    const [dataExecution, setDataExecution] = useState({});
    const [showIntegrationModal,setShowIntegrationModal] = useState(false);
    const [modalDetails,setModalDetails] = useState({title:"",task:""});
    const [moduleInfo,setModuleInfo] = useState([]);
    useEffect(()=>{
                pluginApi.getProjectIDs()
                .then(data => {
                        setProjectData(data);
                        console.log(data.releases)           
        })},[])

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
                        key: element,
                        text: ProjectList.projectNames[index],
                        // disabled: true,
                        // title: 'License Not Supported'
                    }
                )
            });
            setProjectList(arraynew);
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

    const ExecuteTestSuite = async (executionData) => {
       
                 if(executionData === undefined) executionData = dataExecution;
                 setAllocateICE(false);
                // const modul_Info = parseLogicExecute(eachData, current_task, appType, projectdata, moduleInfo, accessibilityParameters, scenarioTaskType);
                 //if(modul_Info === false) return;
                 setLoading("Sending Execution Request");
                //  executionData["source"]="task";
                //  executionData["exectionMode"]=execAction;
                //  executionData["executionEnv"]=execEnv;
                //  executionData["browserType"]=browserTypeExe;
                //  executionData["integration"]=integration;
                //  executionData["batchInfo"]=modul_Info;
                //  executionData["scenarioFlag"] = (current_task.scenarioFlag == 'True') ? true : false
                //  ResetSession.start();
                 try{
                     setLoading(false);
                     const data = await ExecuteTestSuite_ICE(executionData);
                    // if (data.errorapi){displayError(data.errorapi);return;}
                     if (data === "begin"){
                         return false;
                     }
                    // ResetSession.end();
                     if(data.status) {
                         if(data.status === "fail") {
                             setMsg(MSG.CUSTOM(data["error"],data.variant));
                         } else {
                             setMsg(MSG.CUSTOM(data["message"],data.variant));
                         }
                     }
                    //  setBrowserTypeExe([]);
                    //  setModuleInfo([]);
                    //  setExecAction("serial");
                    // setExecEnv("default");
                    // setupdateAfterSave(!updateAfterSave);
                    // setSyncScenario(false);
                 }catch(error) {
                    // setLoading(false);
                    // ResetSession.end();
                    // displayError(MSG.EXECUTE.ERR_EXECUTE)
                    //  setBrowserTypeExe([]);
                    //  setModuleInfo([]);
                    //  setExecAction("serial");
                    //  setExecEnv("default");
                    // setupdateAfterSave(!updateAfterSave);
                    // setSyncScenario(false);
                 }
             }
        
             const syncScenarioChange = (value) => {
                 if (value === "1") {
                     setShowIntegrationModal("ALM")
         		}
         		else if (value === "0") {
                     setShowIntegrationModal("qTest")
         		}
                 else if (value === "2") {
                     setShowIntegrationModal("Zephyr")
         		}
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
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Execute" onClick={async () => onHide(name)} autoFocus />
            </div>
        );
    }
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
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

    var myJsObj = {key:setCurrentIntegration && searchText.length == 0 && configList.length > 0 && configList.map((item, index) => item.configurekey)[0],
        'executionType' : 'asynchronous'}
    var str = JSON.stringify(myJsObj, null, 4);
    // const abc = {\n&nbps;&nbps;&nbps;&nbps;
    //     'key': str,
    //     \n&nbps;&nbps;&nbps;&nbps;'executionType' : 'asynchronous'
    //     \n}`;

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
                const configurationList = await fetchConfigureList();
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
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
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
    useEffect(() => {
        (() => {
            setLoading('Please Wait...');
            setTimeout(async () => {
                const configurationList = await fetchConfigureList();
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
            }, 500);
        })()
    }, []);

    return (<>
        {
            executionQueue && 
            <Dialog
                hidden = {executionQueue === false}
                onDismiss = {() => setExecutionQueue(false)}
                title = 'Manage Execution Queue'
                minWidth = '60rem' >
                    {
                        (executionQueue.list.length > 0 ) ? <CheckboxTree
                            showNodeIcon={false} className='devOps_checkbox_tree' nodes={executionQueue.list} expanded={executionQueue.expanded} onExpand={(expanded) => setExecutionQueue({...executionQueue, expanded: expanded}) } /> : 
                            <p>You have nothing pending to execute. Try to Execute any Configure Key and come here. </p>
                    }
            </Dialog>
        }
        {
            confirmExecuteNow && <Dialog
                hidden = {confirmExecuteNow === false}
                onDismiss = {() => setConfirmExecuteNow(false)}
                title = 'Confirm Execute Now'
                minWidth = '60rem'
                confirmText = 'Confirm'
                declineText = 'Cancel'
                onDecline={() => setConfirmExecuteNow(false)}
                onConfirm = {async () => {
                    const temp = await execAutomation(confirmExecuteNow.configurekey);
                    if(temp.status !== "pass") {
                        if(temp.error && temp.error.CONTENT) {
                            setMsg(MSG.CUSTOM(temp.error.CONTENT,VARIANT.ERROR));
                        } else {
                            setMsg(MSG.CUSTOM("Error While Adding Configuration to the Queue",VARIANT.ERROR));
                        }
                    }else {
                        setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                    }
                    setConfirmExecuteNow(false);
                }} >
                    Are you sure you want to execute <b>{confirmExecuteNow.configname}</b> now?
            </Dialog>
        }
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                Execution Profile
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => setCurrentIntegration({
                    name: '',
                    key: uuid(),
                    selectValues: [
                        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '62e2559414c6a4687ec7c2b5', width: '30%', disabled: false, selectedName: '' },
                        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: 'R1', width: '25%', disabled: false, selectedName: '' },
                        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '62e2559414c6a4687ec7c2b4', width: '25%', disabled: false, selectedName: '' },
                    ],
                    scenarioList: [],
                    avoAgentGrid: 'cicdanyagentcanbeselected',
                    browsers: [],
                    selectedModuleType: 'normalExecution',
                    integration: '',
                    executionType: 'asynchronous',
                    isHeadless: false
                })} >New Configuration</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput' style={{marginLeft: '28rem'}}>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                {/* <div style={{marginLeft: '7rem'}}>
                <div className="api-ut__btnGroup">
                    <button onClick={() => getCurrentQueueState() }>Manage Execution Queue</button>
                </div>
                <div>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>DevOps Integration API url : </span>
                    <span className="api-ut__inputLabel"><input type="text" value={url} data-test="req-body-test" className="req-body" autoComplete="off" id="api-url" name="request-body" style={{width:"25%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/execAutomation' />
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                            </div>
                        </label>
                    </span>
                </div> */}
    
            </> }
            
        </div>
        <div style={{marginTop: '-4rem', display: 'flex', marginBottom: '1rem'}}>
        <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '0.5rem', marginRight: '5px'}}>Project Name : </span>
        
                {/* <SearchDropdown
                    noItemsText={[ ]}
                    onChange={(selectedIce) => false}
                    options={getProjectList}
                    placeholder={""}
                    selectedKey={""}
                    width='15rem'

                    /> */}
                
                
                <SearchDropdown
                    noItemsText={[ ]}
                    onChange={(selectedIce) => false}
                    options={getProjectList}
                    placeholder={""}
                    selectedKey={""}
                    width='15rem'

                    />  
                    {/* <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '0.5rem', marginRight: '5px'}}>Project Name : </span> */}
                </div>
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{ flex: 0 }}>
                <div className="d__table_header">
                    <span className=" d__obj_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="details_col tkn-table__key d__det_head" >Execution Profile Name</span>
                    <span className="details_col tkn-table__key d__det_head" >Configuration Key</span>
                    {/* <span className="d__inp_head tkn-table__project tkn-table__head" >Project</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Release</span> */}
                    <span className="details_col tkn-table__key d__det_head ">Execution Action</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token" style={{paddingLeft: '0px', paddingRight: '0px' }}>
                <ScrollBar  scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__key" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" /><React.Fragment>{item.configurename}</React.Fragment> </td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__button" >
                                    <button onClick={async () =>{onClick('displayBasic2');
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}

                                     
                                     <button  onClick={() =>onClick('displayBasic1')}>  Schedule </button>&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '3rem'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                    </td>
                            </tr>)
                        }
                        {
                            searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__key" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.configurename} </td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__button" >
                                <button onClick={async () =>{onClick('displayBasic2');
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     
                                     <button  onClick={() =>onClick('displayBasic1', item)}>  Schedule </button>&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '3rem'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                    </td>
                            </tr>)
                        }
                    </tbody>
                </table>

                {/* Dialog for Execute Now */}
                <Dialog header="Execute Now" visible={displayBasic2} style={{ width: '50vw' }}  footer={renderFooter('displayBasic2')} onHide={() => onHide('displayBasic2')}>
                <input type="radio" />&nbsp;&nbsp;
                <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Agent / Avo Grid</label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="radio" onSelect={()=>{'#ice'}} />&nbsp;&nbsp;
                <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Assure Client</label>
                
                {allocateICE?
                <AllocateICEPopup 
                    //SubmitButton={ScheduleTestSuite} 
                    // setAllocateICE={setAllocateICE} 
                    // allocateICE={allocateICE} 
                    modalTitle={"Allocate ICE to Schedule"} 
                    modalButton={"Schedule"}
                    icePlaceholder={'Search ICE to allocate'}
                    exeTypeLabel={"Select Schedule type"}
                    exeIceLabel={"Allocate ICE"}
                    //scheSmartMode={smartMode}
                />
                  :""}
                </Dialog>
                {/* Dialog for Execute Now */}

                {/* Dialog for Schedule */}
                <Dialog header="Schedule" visible={displayBasic1}  onDismiss = {() => {displayBasic1(false)}} style={{ width: '80vw',height:'110rem' }}  onHide={() => onHide('displayBasic1')}><ScheduleHome item={selectedItem} /></Dialog>
                {/* Dialog for Schedule */} 

                {/* Dialog for CI /CD  */}

                <Dialog header="Execute via CI/CD" visible={displayBasic} style={{ width: '50vw' }}  onHide={() => onHide('displayBasic')}>
                <div style={{display: 'flex', marginBottom:'1rem'}}>
                    <span className="devOps_dropdown_label devOps_dropdown_label_url" style={{marginRight: '1%', marginTop: '1.5rem'}}>DevOps Integration API url : </span>
                    <pre className='grid_download_dialog__content__code' style={{ width: '23rem'}}>
                        <code>
                        {url}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px", marginTop: '1.5rem'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                            </div>
                        </label>
                </div>
                    <div style={{display: 'flex', marginBottom:'1rem'}}>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label id='async'>Asynchronous </label>
                            <Toggle id='synch'  dataoff='#async' dataOn='#sync' label="" />
                            <label id='sync'>Synchronous </label>
                        </div>
                    </div>
                    <div style={{display: 'flex', marginBottom:'1rem'}}>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '1.5rem'}}>DevOps Request Body : </span>
                    <pre className='grid_download_dialog__content__code' style={{ width: '23rem', marginLeft: '46px'}}>
                        <code style={{fontSize: 'smaller'}}>
                            {str}
                            {/* {abc} */}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
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
export default DevOpsList;
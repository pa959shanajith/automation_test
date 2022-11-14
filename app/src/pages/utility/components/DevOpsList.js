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
import * as pluginApi from "../../plugin/api";
import {v4 as uuid} from 'uuid';
import CheckboxTree from 'react-checkbox-tree';
import ScheduleHome from '../../schedule/containers/ScheduleHome';
import AllocateICEPopup from '../../global/components/AllocateICEPopup';
import "../styles/DevOps.scss";
import { prepareOptionLists } from './DevOpsUtils';



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
    const [selectedCycle, setSelectedCycle] = useState('');
    const [cyclesList, setCyclesList] = useState('');
    const [executionTypeInRequest,setExecutionTypeInRequest] = useState('asynchronous');
    

    useEffect(()=>{
                pluginApi.getProjectIDs()
                .then(data => {
                        setProjectData1(data.releases[0][0].name);
                        setProjectData(data.releases[0][0].cycles[0]._id)
                        console.log(data.releases[0][0].name)   
                        console.log(data.releases[0][0].cycles[0]._id)     

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
                let tempcycleList = [];
                for(let cycles in ProjectList.cycles) {
                    tempcycleList.push(ProjectList.cycles[cycles][2]);
                }
                setCyclesList(tempcycleList);
                return (
                    {
                        // code: element,
                        // name: ProjectList.projectNames[index],
                        key: element,
                        text: ProjectList.projectNames[index],
                        title: ProjectList.projectNames[index]
                        // disabled: true,
                        // title: 'License Not Supported'
                    }
                )
            });
            setProjectList(arraynew);
            setSelectedProject(arraynew[0].key);
            setSelectedCycle(arraynew[0].key);


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

        var myJsObj = {key:setCurrentIntegration && configList.map((item, index) => item.configurekey)[0],
                'executionType' : executionTypeInRequest}
            var str = JSON.stringify(myJsObj, null, 4);
            // const abc = {\n&nbps;&nbps;&nbps;&nbps;
            //     'key': str,
            //     \n&nbps;&nbps;&nbps;&nbps;'executionType' : 'asynchronous'
            //     \n}`;
           
        const categories = [{name: 'Avo Agent / Avo Grid', key: 'A'}, {name: 'Avo Assure Client', key: 'B'}];
        const [selectedCategory, setSelectedCategory] = useState(categories[1]);

        document.addEventListener('input',(e)=>{
            
                    if(e.target.getAttribute('name')=="myRadios"){
                       }
                })
            
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Execute" title="Execute" onClick={async () => {
                let temp = execAutomation(setCurrentIntegration && configList.map((item, index) => item.configurekey)[0]);
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
                        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: selectedProject, width: '30%', disabled: false, selectedName: '' },
                        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: projectData1, width: '25%', disabled: true, selectedName: '' },
                        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: (getProjectList.findIndex((project) => project.key === selectedProject) > -1) ? (cyclesList[getProjectList.findIndex((project) => project.key === selectedProject)]) : '', width: '25%', disabled: true, selectedName: '' },
                    ],
                    scenarioList: [],
                    avoAgentGrid: 'cicdanyagentcanbeselected',
                    browsers: [],
                    selectedModuleType: 'normalExecution',
                    integration: '',
                    executionType: 'asynchronous',
                    isHeadless: false
                })} >New Profile</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput'>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                <div className="api-ut__btnGroup">
                    {/* <button onClick={() => getCurrentQueueState() }>Manage Execution Queue</button> */}
                            </div>
    
            </> }
            
        </div>
        
                  <div style={{marginTop: '-9vh', display: 'flex', marginBottom: '2vh'}}>
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
                <span className=" d__obj_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="d__inp_head tkn-table__key tkn-table__head" >Execution Profile Name</span>
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
                                <button onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                        //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     
                                     <button  onClick={() =>onClick('displayBasic1', item)}>  Schedule </button>&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>
                                    </td>
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '8vh'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> 
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
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
                                <button title="Execute" onClick={async () =>{onClick('displayBasic2');                                        //  let temp = execAutomation(item.configurekey);
                                       //  setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     
                                     <button  onClick={() =>onClick('displayBasic1', item)}>  Schedule </button>&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>
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
                    <input type="radio" name='myRadios' id='first'  onChange={() => {}}
                     style={{width:'2.5vh', height: '2.5vh'}} checked/>&nbsp;&nbsp;
                    <label htmlFor='first' className="devOps_dropdown_label devOps_dropdown_label_ice" style={{width:'25vh', height: '4vh'}}>Avo Agent / Avo Grid</label>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="radio" name='myRadios' id='second' onChange={()=>{}} style={{width:'2.5vh', height: '2.5vh'}}/>&nbsp;&nbsp;
                    <label htmlFor='second' className="devOps_dropdown_label devOps_dropdown_label_ice" style={{width:'25vh', height: '4vh'}}>Avo Assure Client</label> 
                
                </Dialog>
                {allocateICE?
                <AllocateICEPopup 
                    // SubmitButton={CheckStatusAndExecute} 
                    // setAllocateICE={setAllocateICE} 
                    modalButton={"Execute"} 
                    // allocateICE={allocateICE} 
                    modalTitle={"Select ICE to Execute"} 
                    icePlaceholder={'Search ICE to execute'}
                    exeTypeLabel={"Select Execution type"}
                    exeIceLabel={"Execute on ICE"}
                    ExeScreen={true}
                />:null}
                {/* Dialog for Execute Now */}

                {/* Dialog for Schedule */}
                <Dialog header="Schedule" visible={displayBasic1}  onDismiss = {() => {displayBasic1(false)}} style={{ width: '80vw',height:'110rem' }}  onHide={() => onHide('displayBasic1')}><ScheduleHome item={selectedItem} /></Dialog>
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

export default DevOpsList;
import React, { useState, useEffect ,useRef} from 'react';
import { useSelector } from 'react-redux';
import { useHistory, Redirect } from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import { RedirectPage, ScrollBar, ScreenOverlay, TaskContents,ValidationExpression, GenerateTaskList, Messages as MSG, setMsg,Messages ,VARIANT} from '../../global';
import FilterDialog from "./FilterDialog";
import * as actionTypes from '../state/action';
import * as actionTypesMindmap from '../../mindmap/state/action';
import * as actionTypesLogin from '../../login/state/action';
import * as pluginApi from "../api";
import "../styles/TaskSection.scss";
import PropTypes from 'prop-types';
import { NormalDropDown, SearchBox, TextField } from '@avo/designcomponents';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import ProjectAssign from '../../admin/containers/ProjectAssign'
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import ProjectNew from '../../admin/containers/ProjectAssign';
import { DataTable } from 'primereact/datatable';
import { getDetails_ICE ,getAvailablePlugins,getDomains_ICE,getProjectIDs} from '../api';
import {getProjectList} from '../../mindmap/api';


const TaskSection = ({userInfo, userRole, dispatch,props}) =>{

    const history = useHistory();


    const taskJson = useSelector(state=>state.plugin.tasksJson);
    const [showSearch, setShowSearch] = useState(false);
    const [showCreateSearch, setShowCreateSearch] = useState(false);
    const [activeTab, setActiveTab] = useState("todo");
    const [reviewItems, setReviewItems] = useState([]);
    const [todoItems, setTodoItems] = useState([]);
    const [searchItems, setSearchItems] = useState([]);
    const [dataObj, setDataObj] = useState([]);
    const [dataDictState, setDataDictState] = useState({ 'project' : {}, 'apptypes' : [], 'tasktypes' : [], 'projectDict': {}, 'cycleDict': {}});
    const [searchValue, setSearchValue] = useState("");
    const [overlay, setOverlay] = useState("");
    const [showFltrDlg, setShowFltrDlg] = useState(false);
    const [filterData, setFilterData] = useState({'prjval':'Select Project','relval':'Select Release','cycval':'Select Cycle','apptype':{},'tasktype':{}});
    const [filtered, setFiltered] = useState(false);
    const [hideDialog, setHideDialog ] = useState(true);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [modScenarios, setModScenarios] = useState([]);
    const [selectedTab, setSelectedTab] = useState('windows');
    const [selectedProject, setSelectedProject] = useState(null);
    const [appType, setAppType] = useState(null);
    const [projectsDetails, setProjectsDetails] = useState({});
    const [projModules, setProjModules] = useState([]);
    const [assignProj,setAssignProj] = useState({allProjectAP:[],assignedProjectAP:[]});
    const [unAssignedFlag,setUnAssignedFlag] = useState(false);
    const [statechange,setStateChange] = useState(true);
    const [selectBox,setSelectBox] = useState([]);
    const [userDetailList,setUserDetailList]=useState([]);
    const [getProjectLists,setProjectList]=useState([]);
    const [getplugins_list,setplugins_list]=useState([]);
    const [projectName, setProjectName] = useState("");
    const [searchUsers, setSearchUsers] = useState("")
    const [projectNames, setProjectNames] = useState(null);
    const [projectId,setprojectId]=useState(null);
    const [loading,setLoading] = useState(false)
    const [createProjectCheck,setCreateProjectCheck]=useState(true);
    const [isCreate, setisCreate]=useState(false);
    const [createProj, setCreateProj] = React.useState(true);
    const [ModifyProj, setModifyProj] = React.useState(true);
    const [createprojectObj,setcreateprojectObj]=useState([]);
    const [assignedUsers, setAssignedUsers] = useState({});
    const [unassignedUsers, setUnassignedUsers] = useState([]);
    const [projectAssignedUsers, setProjectAssignedUsers] = useState([]);
    const [redirectTo, setRedirectTo] = useState("");
    const [searchText, setSearchText] = useState("");
    const [projectNameError,setProjectNameError] = useState("");
    const [selectData, setSelectData] = useState(false);

    const handleCreateChange = () => {
        setCreateProjectCheck(true);
        setAssignedUsers({});
        setSearchUsers("");
        setSearchText("");
    };

    const handleModifyChange = () => {
        setCreateProjectCheck(false);
        setAssignedUsers({});
        setSearchUsers("");
        setSearchText("");
        setSelectData(true);
    };


    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    const checkCycle = (flag)=>{
        for (var j = 0; j < props.releaseList.length; j++) {
            for (var i = 0; i < props.projectDetails.length; i++) {
                if (props.releaseList[j] === props.projectDetails[i].name) {
                    if (props.projectDetails[i].cycles.length === 0) {
                        displayError(Messages.ADMIN.WARN_ADD_CYCLE);
                        return true;
                    }
                }
            }
        };
        return false;
    }

    const refreshDomainList = async () => {
        let data = await getDomains_ICE()
        if(data.error){displayError(data.error);return;}
        else if(data.length===0){
            data=['Banking','Manufacturing','Finance'];
        }
        props.setSelDomainOptions(data);
    }

    let dataDict;

    useEffect(()=>{
        (async() => {
            let userListFromApi =  await pluginApi.getUserDetails("user");
        if(userListFromApi.error){
                setMsg(MSG.CUSTOM("Error while fetching the user Details"));
        }else{
                setUserDetailList(userListFromApi);
            }
            const ProjectList = await getProjectIDs(["domaindetails"],["Banking"]);
            setProjectsDetails(ProjectList)
        if(ProjectList.error){
                setMsg(MSG.CUSTOM("Error while fetching the project Details"));
        }else{

                const arraynew = ProjectList.projectId.map((element, index) => {
                    return (
                        {
                            key: element,
                            text: ProjectList.projectName[index], 
                        }
                    )
                });
                setProjectList(arraynew);
            }
            var plugins = [];
        const plugins_list= await getAvailablePlugins();
        dispatch({type: actionTypes.SET_LS, payload:plugins_list})


        if(plugins_list.error){
                setMsg(MSG.CUSTOM("Error while fetching the app Details"));
        }else{
                // let txt = [];
                // for (let x in plugins_list) {
                //         if(plugins_list[x] === true) {
                //         txt.push({
                //             data:{
                //                 icon: x,
                //             },
                //             key: x,
                //             text: x === "mobileapp"? "MobileApp" : x === "mobileweb" ? "MobileWeb" : x === "sap" ? "SAP" : x === "oebs" ? "OEBS" : x.charAt(0).toUpperCase()+x.slice(1),
                //             title: x === "mobileapp"? "MobileApp" : x === "mobileweb" ? "MobileWeb" : x === "sap" ? "SAP" : x === "oebs" ? "OEBS" : x.charAt(0).toUpperCase()+x.slice(1),
                //             disabled: false
                //         })
                //     }
                //     else {
                //         txt.push({
                //             data:{
                //                 icon: x,
                //             },
                //             key: x,
                //             text: x === "mobileapp"? "MobileApp" : x === "mobileweb" ? "MobileWeb" : x === "sap" ? "SAP" : x === "oebs" ? "OEBS" : x.charAt(0).toUpperCase()+x.slice(1),
                //             title: 'License Not Supported',
                //             disabled: true
                //         })
                //     }
                // }
                // setplugins_list(txt);

                var details = {
                    "web":{"data":{"icon":"Web"},"key":"Web","text":"Web","title":"Web","img":"web"},
                    "webservice":{"data":{"icon":"Webservice"},"key":"Web service","text":"Webservice","title":"Web service","img":"webservice"},
                    "desktop":{"data":{"icon":"Desktop"},"key":"Desktop Apps","text":"Desktop","title":"Desktop Apps","img":"desktop"},
                    "oebs":{"data":{"icon":"OEBS"},"key":"Oracle Apps","text":"OEBS","title":"Oracle Apps","img":"oracleApps"},
                    "mobileapp":{"data":{"icon":"MobileApp"},"key":"Mobile Apps","text":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
                    "mobileweb":{"data":{"icon":"MobileWeb"},"key":"Mobile Web","text":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
                    "sap":{"data":{"icon":"SAP"},"key":"SAP Apps","text":"SAP","title":"SAP Apps","img":"sapApps"},
                    // "system":{"data":{"icon":"System"},"key":"System Apps","text":"System Apps","title":"System Apps","img":"desktop"},
                    "mainframe":{"data":{"icon":"Mainframe"},"key":"Mainframe","text":"Mainframe","title":"Mainframe","img":"mainframe"}
                };
                var listPlugin = [];
                "WEBT" in plugins_list ?  listPlugin.push({...details["web"], enabled: true}):listPlugin.push({...details["web"], enabled: false})
                "APIT" in plugins_list ?  listPlugin.push({...details["webservice"], enabled: true}):listPlugin.push({...details["webservice"], enabled: false})
                "MOBT" in plugins_list ?  listPlugin.push({...details["mobileapp"], enabled: true}):listPlugin.push({...details["mobileapp"], enabled: false})
                "MOBWT" in plugins_list ?  listPlugin.push({...details["mobileweb"], enabled: true}):listPlugin.push({...details["mobileweb"], enabled: false})
                "ETOAP" in plugins_list ?  listPlugin.push({...details["oebs"], enabled: true}):listPlugin.push({...details["oebs"], enabled: false})
                "DAPP" in plugins_list ?  listPlugin.push({...details["desktop"], enabled: true}):listPlugin.push({...details["desktop"], enabled: false})
                "MF" in plugins_list ?  listPlugin.push({...details["mainframe"], enabled: true}):listPlugin.push({...details["mainframe"], enabled: false})
                "ETSAP" in plugins_list ?  listPlugin.push({...details["sap"], enabled: true}):listPlugin.push({...details["sap"], enabled: false})
                setplugins_list(listPlugin);
            }
        })()

    },[selectData])





    useEffect(()=>{
        if(Object.keys(userInfo).length!==0 && userRole!=="Admin") {
            resetStates();

            setOverlay("Loading Tasks..Please wait...");
            getProjectList()
                .then(data => {
                    setProjectNames(data);
                if(data === "Fail" || data === "Invalid Session") return RedirectPage(history);
                    else {
                        pluginApi.getTaskJson_mindmaps(data)
                            .then(tasksJson => {
                                //eslint-disable-next-line
                                dataDict = dataDictState;

                        if(tasksJson === "Fail" || tasksJson === "Invalid Session") return RedirectPage(history);
                                else {
                            for (let i=0 ; i < tasksJson.length ; i++){
                                        tasksJson[i].uid = uuid();
                                fillFilterValues(tasksJson[i],0);
                                    }

                                    let { dataObjList, reviewList, todoList } = GenerateTaskList(tasksJson, "pluginList");

                            dispatch({type: actionTypes.SET_TASKSJSON, payload: tasksJson});
                                    setReviewItems(reviewList);
                                    setTodoItems(todoList);
                                    setDataObj(dataObjList);
                                    setOverlay("");
                                }

                        for (const projectID in dataDict.project){
                                    let dataIdx = data.projectId.indexOf(projectID);

                                    dataDict.project[projectID].domain = data.domains[dataIdx];
                                    dataDict.project[projectID].appType = { [data.appTypeName[dataIdx]]: data.appType[dataIdx] }
                                    dataDict.projectDict[projectID] = data.projectName[dataIdx];

                                    //eslint-disable-next-line
                          for (const releaseID in dataDict.project[projectID].release){
                                        //eslint-disable-next-line
                            dataDict.project[projectID].release[releaseID].forEach(cycleID=> {
                                            //eslint-disable-next-line
                                            dataDict.cycleDict[cycleID] = data.cycles[cycleID][2];
                                        })
                                    }
                                }

                                setDataDictState(dataDict);
                        dispatch({type: actionTypes.SET_FD, payload: dataDict})
                            })
                            .catch(error => {
                                setOverlay("");
                                setMsg(MSG.PLUGIN.ERR_LOAD_TASK);
                                console.error("Error::::", error);
                            });
                    }
                })
                .catch(error => {
                    setOverlay("");
                    setMsg(MSG.PLUGIN.ERR_LOAD_TASK);
                    console.error("Error::::", error);
                });
        }
    }, [userInfo, userRole]);


    const resetStates = () => {
        setShowSearch(false);
        setActiveTab("todo");
        setReviewItems([]);
        setTodoItems([]);
        setSearchItems([]);
        setDataDictState({ 'project' : {}, 'apptypes' : [], 'tasktypes' : [], 'projectDict': {}, 'cycleDict': {} });
        // setTaskJson(null);
        setSearchValue("");
        setOverlay("");
        setDataObj(null);
        setFiltered(false);
    }

    const filterTasks = (filterData) => {

        setShowFltrDlg(false);

        let review_items = [];
        let todo_items = [];
        let length_tasksJson = taskJson.length;
        for(let i=0; i < length_tasksJson; i++){
            let taskname = taskJson[i].taskDetails[0].taskName;
            let tasktype = taskJson[i].taskDetails[0].taskType;
            let status = taskJson[i].taskDetails[0].status;

            let dataobj = dataObj[i];
            if(passFilterTest(taskJson[i],0, filterData)){
                if (status === 'underReview') review_items.push({'panel_idx': i, 'testSuiteDetails': taskJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                else todo_items.push({'panel_idx': i, 'testSuiteDetails': taskJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
            }
        }

        // setReviewItems(review_items);
        setTodoItems(todo_items);

        if(filterData['prjval']==='Select Project' && filterData['relval']==='Select Release' && filterData['cycval']==='Select Cycle' && !(Object.values(filterData['tasktype']).includes(true) || Object.values(filterData['apptype']).includes(true))) 
            setFiltered(false);
        else setFiltered(true);

        let items = activeTab === "todo" ? projectNames : null;
        let filteredItem = [];
        filteredItem = items.filter(item => item.projectNames.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);

        setSearchItems(filteredItem);
        setFilterData(filterData);
    };


    const onSearchHandler = event => {
        searchProjects(event.target.value);
        setSearchValue(event.target.value);
    };

    const searchProjects = (value) => {
        let filteredItems = [];

        filteredItems = projectNames.projectName.filter(projectName => projectName.toLowerCase().indexOf(value.toLowerCase()) > -1);

        setSearchItems(filteredItems);
    }


    const fillFilterValues = (obj, tidx) => {
        if (!dataDict.project[obj.projectId]) dataDict.project[obj.projectId] = {'release': {}}

        if (!dataDict.project[obj.projectId].release[obj.taskDetails[tidx].releaseid])
            dataDict['project'][obj.projectId].release[obj.taskDetails[tidx].releaseid] = [];

        if (!dataDict.project[obj.projectId].release[obj.taskDetails[tidx].releaseid].includes(obj.taskDetails[tidx].cycleid))
            dataDict.project[obj.projectId].release[obj.taskDetails[tidx].releaseid].push(obj.taskDetails[tidx].cycleid)

        if(!dataDict.apptypes.includes(obj.appType)) dataDict.apptypes.push(obj.appType);
        if(!dataDict.tasktypes.includes(obj.taskDetails[0].taskType)) dataDict.tasktypes.push(obj.taskDetails[0].taskType);
    }

    const passFilterTest = (node, tidx, filterData) => {
        var pflag = false, rflag = false, cflag = false, aflag = false, tflag = false;
      if(filterData['prjval']==='Select Project' || filterData['prjval']===node.testSuiteDetails[tidx].projectidts) pflag = true;
      if(filterData['relval']==='Select Release' || filterData['relval']===node.taskDetails[tidx].releaseid) rflag = true;
      if(filterData['cycval']==='Select Cycle' || filterData['cycval']===node.taskDetails[tidx].cycleid) cflag = true;
      if(Object.keys(filterData['tasktype']).map(function(itm) { return filterData['tasktype'][itm]; }).indexOf(true) === -1 || filterData.tasktype[node.taskDetails[tidx].taskType]) tflag = true;
      if(Object.keys(filterData['apptype']).map(function(itm) { return filterData['apptype'][itm]; }).indexOf(true) === -1 || filterData.apptype[node.appType]) aflag = true;		

      if(pflag && rflag && cflag && aflag && tflag) return true;
        else return false;
    }

    const hideSearchBar = event => {
        setSearchValue("");
        setShowSearch(!showSearch)
    }
    const [displayBasic, setDisplayBasic] = useState(false);
    const [position, setPosition] = useState('center');

    const dialogFuncMap = {
        'displayBasic': setDisplayBasic,
    }

    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);

        if (position) {
            setPosition(position);
        }
    }

    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }
    const toggleSearch = () => {
        setShowCreateSearch(!showCreateSearch);
    }

    const create_project = async()=>{

        setLoading("Saving...");
        const createprojectObj = {};
        createprojectObj.domain = 'Banking';
        createprojectObj.projectName = props.projectName.trim();
        createprojectObj.appType = props.projectTypeSelected;
        createprojectObj.projectDetails = [
            {
                "name": "R1",
                "cycles": [
                    {
                        "name": "C1"
                    }
                ]
            }
        ];
        setLoading(false);
    }

    return (

        <>

        {overlay && <ScreenOverlay data-test="screenoverlay-component" content={overlay}/>}
        { showFltrDlg && <FilterDialog data-test="filterdialog-component" setShow={setShowFltrDlg} dataDict={dataDictState} filterData={filterData} filterTasks={filterTasks} /> }
    <div  data-test="task-section" className="task-section">
                <div data-test="task-header" className="task-header">
                    <span data-test="my-task" className="my-task"> Projects </span>
                { showSearch && <input data-test="search-input" className="task-search-bar " autoFocus onChange={onSearchHandler} value={searchValue} />}
                <span data-test="search-icon" className={"task-ic-container"+(showSearch?" plugin__showSearch":"")} onClick={hideSearchBar}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end"}}>
                    {userRole==="Test Manager" ?<Button  style={{ background: "transparent", color: "#643693", border: "none", padding:" 8px 16px", FontSize:"16px",margin:"0px",marginTop:"10px",fontFamily:"LatoWeb",fontStyle:"normal",lineHeight:"16px"}} label="Create/Manage Project(s)"  onClick={() =>{setUnassignedUsers([]);setProjectAssignedUsers([]);setAssignedUsers({});setProjectName("");setAppType(null);setSelectedProject(null); setCreateProjectCheck(true); setAssignedUsers({}); onClick('displayBasic')}} />:null}
                </div>
            <div>
            <div className="task-nav-bar1">
                {projectNames && projectNames.projectName.map((singleProj,idx)=>{
                    if(searchValue.length>0 && !searchItems.includes(singleProj)){
                        return <></>
                    }
                   
            return <>
			{ redirectTo && <Redirect data-test="redirectTo" to={redirectTo} />}

<div key={idx} style={{display:'flex',justifyContent:'space-between',borderBottomStyle:'ridge'}}>
<span className={"task-nav-item" + (activeTab==="todo" && "active-tab")} style={{display:"flex", flexDirection:"column"}}>
            <span title={projectNames && singleProj} style={{marginTop: '1vh',marginBottom:'1vh',textOverflow: 'ellipsis', textAlign: 'left',overflow: 'hidden',width: '15rem'}}> {projectNames && `${idx+1}.${singleProj}`}</span></span>
                                    <div className='button-design'>


            <button className="reset-action__exit" title="Create / modify Mindmap via visual design, capture screen elements and design test steps" style={{lineBreak:'00px', border: "1px solid #643693", color: "#643693", borderRadius: "24px",  padding:"0rem 1rem 0rem 1rem",background: " #FFFFFF",float:'left',marginLeft:"1200px" ,margin: "9px",fontFamily:"LatoWeb",FontSize:"14px"}} onClick={(e) => {
                                            dispatch({type: actionTypesMindmap.SELECT_PROJECT, payload:projectNames.projectId[idx]});
                                            dispatch({type:actionTypesMindmap.SELECT_MODULE,payload:{}})
                                            dispatch({type:actionTypesMindmap.SELECT_MODULELIST,payload:[]})
                                            dispatch({type:actionTypesLogin.HIGHLIGHT_AGS,payload:false})
                                            window.localStorage['navigateScreen'] = "mindmap";
                                            setRedirectTo(`/mindmap`);
                                        }}>Design</button>

            <button className="reset-action__exit" title="Create / modify execution profiles and configure automation execution" style={{lineBreak:'00px', border: "1px solid #643693", color: "#643693", borderRadius: "24px",  padding:"0rem 1rem 0rem 1rem",background: " #FFFFFF",float:'left',marginLeft:"500px" ,margin: "9px",fontFamily:"LatoWeb",FontSize:"14px"}} onClick={(e) => { 
                                            dispatch({type: actionTypes.SET_PN, payload:idx});
                                             window.localStorage['navigateScreen'] = "TestSuite";
                                             setRedirectTo(`/execute`);
                                        }}>Execute</button>
                                    </div>
                                </div>
                            </>
                        })}



                    </div>
                </div>
                <Dialog header={!createProjectCheck ? 'Manage Project(s)' : 'Create Project'} visible={displayBasic} style={{ width: '30vw',fontFamily:'LatoWeb',fontSize:'16px',height:'700px',position:'fixed',overflow:'hidden' }} className="dialog__projectDialog" onHide={() => {onHide('displayBasic');setSelectData(true)}}>
                    <div>

                        <form>

                            <div className="ss__radioContainer">

                                <label>

                                    <input type="radio" checked={createProjectCheck === true} value="create" onChange={handleCreateChange} />

                                    <span>Create Project</span>

                                </label>
                                <label>

                                    <input type="radio" checked={createProjectCheck === false} value="modify" onChange={handleModifyChange} />

                                    <span>Modify Project</span>

                                </label>
                            </div>
                        </form>
                    </div>
                    <div>
                        </div>
                        <div className='dialog_dropDown'>
                            {
                    createProjectCheck ? <TextField  label='Project Name'  placeholder='Enter Project Name'  width='300px' fontStyle='LatoWeb'  onChange={(e)=>{

                                    setProjectName(e.target.value);
                                }} FontSize='15px'
                                errorMessage = {projectNameError}  required/> : 
                                    <NormalDropDown 
                                        required
                                        label="Project Name"
                                        options={getProjectLists}
                        onChange={async(e,item) =>{
                                            setSelectedProject(item.key)
                                            const users_obj = await pluginApi.getUsers_ICE(item.key);
                                            setUnassignedUsers(users_obj["unassignedUsers"]);
                                            setProjectAssignedUsers(users_obj["assignedUsers"]);
                                        }}
                                        selectedKey={selectedProject}
                                        placeholder="Select"
                                        standard                                        
                                        width="300px"
                                        fontSize='16px'
                                        id="project__dropdown"
                                    />
                            }
                        </div>
                        <div className='dialog_dropDown'>
                            {
                                createProjectCheck ? <NormalDropDown
                                    label="Application Type"
                                    options={getplugins_list}
                                    placeholder="Select"
                                    width="300px"
                                    top="300px"
                                    required
                                    id="apptype__dropdown"
                                    onChange={(e, item) => {
                                        setAppType(item)
                                    }}
                    /> : <TextField label='Application Type' disabled value={selectedProject ?projectsDetails["appTypeName"][projectsDetails["projectId"].indexOf(selectedProject)]:""} width='19rem' />
                            }
                        </div>
                        <div className='labelStyle1'> <label>Users</label>
					<div className="wrap" style={{height:'12rem'}} >
                            <div className='display_project_box' style={{ overflow: 'auto' }}>    
                                <div style={{display:'flex', width:"100%", marginTop:"10px", position:"sticky", top:10}}>
                                    <SearchBox
                                        placeholder="Enter Username"
                                        value={searchText}
                                        width="20rem"
                                        onClear={() => {setSearchUsers("")}}
                                        onChange={(e,value)=>{
                                            setSearchUsers(value);
                                            setSearchText(value);
                                        }}
                                    />
                                </div>
                                <div >
                               
                                    {createProjectCheck && userDetailList.map((user, index) => {
                                        return (assignedUsers[user[1]] || userInfo.user_id === user[1]) && user[0].includes(searchUsers)? <div key={index} className='display_project_box_list' style={{}} >
                                            <input type='checkbox' disabled={userInfo.user_id === user[1]} defaultChecked={userInfo.user_id === user[1]} checked={assignedUsers[user[1]] || userInfo.user_id === user[1]} value={user[0]} onChange={(e) => {
                                                if (!assignedUsers[user[1]]) { 
                                                    setAssignedUsers({ ...assignedUsers, [user[1]]: true })
                                                }
                                                else {
                                                    setAssignedUsers((prevState) => {
                                                        let newObj = {...prevState}
                                                        delete newObj[user[1]]
                                                        return newObj;
                                                    })
                                                }
                                            }} />

                                            <span title={`${user[4]} ${user[5]} (${user[6]})`} >{user[0]} </span>
                                        </div>:null
                                        // </ScrollBar>
                                    })}
                                    {!createProjectCheck?null:<hr></hr>}
                                    {createProjectCheck && userDetailList.map((user, index) => {
                                        return userInfo.user_id !== user[1] && !assignedUsers[user[1]] && user[0].includes(searchUsers)? <div key={index} className='display_project_box_list' style={{}} >
                                            <input type='checkbox' disabled={userInfo.user_id === user[1]} defaultChecked={userInfo.user_id === user[1]} checked={assignedUsers[user[1]] || userInfo.user_id === user[1]} value={user[0]} onChange={(e) => {
                                                if (!assignedUsers[user[1]]) { setAssignedUsers({ ...assignedUsers, [user[1]]: true }) }
                                                else {
                                                    setAssignedUsers((prevState) => {
                                                        delete prevState[user[1]]
                                                        return prevState;
                                                    })
                                                }
                                            }} />

                                            <span title={`${user[4]} ${user[5]} (${user[6]})`} >{user[0]} </span>
                                        </div>:null
                                    // </ScrollBar>
                                    })}
                                    {!createProjectCheck && selectedProject && projectAssignedUsers.length > 0 && projectAssignedUsers.map((user_obj, index) => {
                                        return user_obj["name"].includes(searchUsers)?(
                                            <div key={index} className='display_project_box_list' style={{}} >
                                                <input type='checkbox' defaultChecked={true} value={user_obj["name"]} onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setAssignedUsers((prevState) => {
                                                            delete prevState[user_obj["_id"]];
                                                            return prevState;
                                                        })
                                                    }
                                            else{
                                                setAssignedUsers((prevState)=>{
                                                            prevState[user_obj["_id"]] = false;
                                                            return prevState;
                                                        })
                                                    }
                                                }} />

                                                <span >{user_obj["name"]} </span>
                                            </div>
                                        ):null
                                    })}
                                    {createProjectCheck?null:<hr></hr>}
                                    {!createProjectCheck && selectedProject && unassignedUsers.length > 0 && unassignedUsers.map((user_obj, index) => {
                                        return user_obj["name"].includes(searchUsers)? (
                                            <div key={index} className='display_project_box_list' style={{}} >
                                        <input type='checkbox' defaultChecked={false} value={user_obj["name"]} onChange={(e)=>{
                                            if(e.target.checked) {setAssignedUsers({...assignedUsers, [user_obj["_id"]]:true}) }
                                            else{
                                                setAssignedUsers((prevState)=>{
                                                            delete prevState[user_obj["_id"]]
                                                            return prevState;
                                                        })
                                                    }
                                                }} />

                                                <span >{user_obj["name"]} </span>
                                            </div>
                                        ):null
                                    })}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                            <button className="reset-action__exit" style={{lineBreak:'10px', border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px",  padding:"8px 25px",background: "white",float:'right',marginLeft:"5px" }} 
                            onClick={async()=>{
                               if(createProjectCheck){
                                    try{
                                                if (!(appType && appType.key && projectName)) {
                                                    setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
                                                    return;
                                                }
                                                const config = {
                                                    "projectName":projectName.trim(),
                                                    domain: "banking",
                                                    appType: appType ? appType.text : undefined,
                                                    releases: [{ "name": "R1", "cycles": [{ "name": "C1" }] }],
                                                    assignedUsers
                                                }
                                                let proceed = false
                                                if (projectNames.projectName.length > 0) {
                                                    for ( let i = 0; i < projectNames.projectName.length; i++) {
                                                        if (projectName.trim() === projectNames.projectName[i]) {
                                                            displayError(Messages.ADMIN.WARN_PROJECT_EXIST);
                                                            return;
                                                        } else proceed = true;
                                                    }
                                                }
                                                if (config.projectName.trim() === "" || !ValidationExpression(config.projectName, "validName")) {
                                                    setMsg(MSG.CUSTOM("project name is not valid","error"));
                                                    return;
                                                }

                                                const res = await pluginApi.userCreateProject_ICE(config)
                                                if(res === "invalid_name_spl") {
                                                    setMsg(MSG.CUSTOM("Special characters are not allowed in project name","error"));
                                                }else if(res.message=="Max Allowed Projects Created"){
                                                    setMsg(MSG.CUSTOM(res.message,"error"));
                                                } else{
                                                    setMsg(MSG.CUSTOM("Project Created Successfully", "success"));
                                                }
                                                // onHide('displayBasic');
                                                try {
                                                    const ProjectList = getProjectList().then(data => {
                                                    setProjectNames(data);})
                                        }catch(err) {
                                                    console.log(err)
                                                }
                                            }
                                    catch(err){
                                        setMsg(MSG.CUSTOM("Failed to create Project","error"));
                                                console.log(err);
                                            }
                                        }
                                        else {
                                            try{
                                                if (!(selectedProject)) {
                                                    setMsg(MSG.CUSTOM("Please fill the mandatory fields", "error"));
                                                    return;
                                                }
                                                const config = {
                                                    "project_id": selectedProject,
                                                    domain: "banking",
                                            appType:selectedProject ?projectsDetails["appTypeName"][projectsDetails["projectId"].indexOf(selectedProject)]:"",
                                            releases: [{"name":"R1","cycles":[{"name":"C1"}]}],
                                                    assignedUsers
                                                }
                                        const res= await pluginApi.userUpdateProject_ICE(config)
                                        setMsg(MSG.CUSTOM("Project Modified Successfully","success"));
                                                // onHide('displayBasic');
                                        try{
                                                    const ProjectList = getProjectList().then(data => {
                                                    setProjectNames(data);})
                                        }catch(err) {
                                                    console.log(err)
                                                }
                                            }
                                    catch(err){
                                        setMsg(MSG.CUSTOM("Failed to create Project","error"));
                                                console.log(err);
                                            }
                                        }                                   
                                    }}>{createProjectCheck ? 'Create' : 'Modify'}</button>
                            </div>
                        </div>

                    </div>
                </Dialog>

            </div>
            {/* {userRole !== "Test Manager" && 
                    <div className="task-overflow" id="plugin__taskScroll">
                        <ScrollBar data-test="scrollbar-component" scrollId="plugin__taskScroll" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                            <div data-test="task-content" className="task-content" id="plugin_page__list">
                                <TaskContents data-test="taskcontent-component" items={searchValue ? searchItems : activeTab === "todo" ? todoItems : reviewItems} cycleDict={dataDictState.cycleDict} taskJson={taskJson} />
                            </div>
                        </ScrollBar>
                    
                    </div>
                } */}
        </>
    );
}

TaskSection.propTypes={
    userInfo : PropTypes.object,
    userRole : PropTypes.string,
    dispatch : PropTypes.func
}
export default TaskSection;

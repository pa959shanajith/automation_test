import React, { useState, useEffect } from 'react';
// import {getUserDetails} from '../api';
import { useSelector } from 'react-redux';
import { useHistory, Redirect } from 'react-router-dom';
import {v4 as uuid} from 'uuid';
import { RedirectPage, ScrollBar, ScreenOverlay, TaskContents,ValidationExpression, GenerateTaskList, Messages as MSG, setMsg,Messages ,VARIANT} from '../../global';
import FilterDialog from "./FilterDialog";
import * as actionTypes from '../state/action';
import * as pluginApi from "../api";
import "../styles/TaskSection.scss";
// import '../styles/ProjectAssign.scss';
import PropTypes from 'prop-types';
import { NormalDropDown, TextField} from '@avo/designcomponents';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import ProjectAssign from '../../admin/containers/ProjectAssign'
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import ProjectNew from '../../admin/containers/ProjectAssign';
import { DataTable } from 'primereact/datatable';
// import { FontSizes } from '@fluentui/react';
// import { getNames_ICE, , updateProject_ICE, exportProject} from '../../admin/api';
import { getDetails_ICE ,getAvailablePlugins,getDomains_ICE,getProjectIDs, createProject_ICE} from '../api';
import { text } from 'body-parser';


// import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';


const TaskSection = ({userInfo, userRole, dispatch,props}) =>{

    const history = useHistory();
    

    const taskJson = useSelector(state=>state.plugin.tasksJson);
    const [showSearch, setShowSearch] = useState(false);
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
    const [allProjects, setAllProjects] = useState({});
    const [projModules, setProjModules] = useState([]);
    const [assignProj,setAssignProj] = useState({allProjectAP:[],assignedProjectAP:[]});
    const [unAssignedFlag,setUnAssignedFlag] = useState(false);
    const [statechange,setStateChange] = useState(true);
    const [selectBox,setSelectBox] = useState([]);
    const [userDetailList,setUserDetailList]=useState([]);
    // const [getAvailablePlugins,setAvailablePlugins]=useState([]);
    const [getProjectList,setProjectList]=useState([]);
    const [getplugins_list,setplugins_list]=useState([]);
    // const [selDomainOptions,setSelDomainOptions] = useState([])
    // const [loading,setLoading] = useState(false)
   
    const [projectNames, setProjectNames] = useState(null);
    const [projectId,setprojectId]=useState(null);
    const [loading,setLoading] = useState(false)

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
    // const displayError = (error) =>{
    //     setLoading(false)
    //     setMsg(error)
    // }

    let dataDict;
     


    // useEffect( async () => {
        
    // },[]);

    // useEffect(async()=>{
        
    // },[]);

    useEffect(()=>{
        (async() => {
            const UserList =  await pluginApi.getUserDetails("user");
        if(UserList.error){
            setMsg(MSG.CUSTOM("Error while fetching the user Details"));
        }else{
            setUserDetailList(UserList);
        }

        console.log("UserDetailsList");
        console.log(UserList);
            const ProjectList = await getProjectIDs(["domaindetails"],["Banking"]);
        // ProjectList = {
        //     "projectIds":["62e27e5887904e413dad10fe", "62e27e5887904e413dad10ff"],
        //     "projectNames":["avangers", "avangers2"]
        // }
        if(ProjectList.error){
            setMsg(MSG.CUSTOM("Error while fetching the project Details"));
        }else{
            
            const arraynew = ProjectList.projectId.map((element, index) => {
                return (
                    {
                        key: element,
                        text: ProjectList.projectName[index],
                        // disabled: true,
                        // title: 'License Not Supported' 
                    }
                )
            });
            setProjectList(arraynew);
            // key: "62e27e5887904e413dad10ff",
            // text: "avangers2"
        }
        // [
        //     {
        //         key: "62e27e5887904e413dad10fe",
        //         text: "avangers"
        //     },
        //     {
        //     ]
        // }

        console.log("domaindetails","Banking");
        console.log(ProjectList);
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
                                //text: x[0].toUpperCase()+x.slice(1)
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
                                disabled: true
                            })
                        }
                       }
                    //   setProjectList(arraynew1);
                    // const arraynew2 = arraynew1.map((txt) => {
                //       return (
                //     {
                //         key: txt,
                //         text:txt
                //     }
                // )
            // }
            // ); 
            setplugins_list(txt);
        }
        // console.log({"desktop":true, "mainframe": true, "mobileapp": true, "mobileweb": true, "oebs":true, "sap": true, "system":true,"web":true,"webservice":true});
        // console.log(plugins_list);
        })()
        
    },[]);
  

  


    useEffect(()=>{
        if(Object.keys(userInfo).length!==0 && userRole!=="Admin") {
            resetStates();
            
            setOverlay("Loading Tasks..Please wait...");
            pluginApi.getProjectIDs()
            .then(data => {
                console.log(data)
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

                            // setTaskJson(tasksJson);
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
                        console.log(data)
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
        
        setReviewItems(review_items);
        setTodoItems(todo_items);

        if(filterData['prjval']==='Select Project' && filterData['relval']==='Select Release' && filterData['cycval']==='Select Cycle' && !(Object.values(filterData['tasktype']).includes(true) || Object.values(filterData['apptype']).includes(true))) 
            setFiltered(false);
		    else setFiltered(true);

        let items = activeTab === "todo" ? todo_items : review_items;
        let filteredItem = [];
        filteredItem = items.filter(item=>item.taskname.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);

        setSearchItems(filteredItem);
        setFilterData(filterData);
	};


    const onSearchHandler = event => {
        searchTask(activeTab, event.target.value)
        setSearchValue(event.target.value);
    };

    const searchTask = (activeTab, value) => {
        let items = activeTab === "todo" ? todoItems : 
        
        reviewItems;
        let filteredItem = [];

        filteredItem = items.filter(item=>item.taskname.toLowerCase().indexOf(value.toLowerCase()) > -1);

        setSearchItems(filteredItem);
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
    
    const onSelectTodo = event =>{
        setActiveTab("todo");
        if (showSearch) searchTask("todo", searchValue);
    }

    const onSelectReview = event => {
        setActiveTab("review");
        if (showSearch) searchTask("review", searchValue);
    }

    const hideSearchBar = event => {
        setSearchValue("");
        setShowSearch(!showSearch)
    }
    // const confirm = () => {
    //     confirmDialog({
    //         message: 'Are you sure you want to proceed?',
    //         header: 'Confirmation',
    //         icon: 'pi pi-exclamation-triangle',
    //     });
    // }
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

    // const renderFooter = (name) => {
    //     return (
    //         <div>
    //             <Button label="No" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
    //             <Button label="Yes" icon="pi pi-check" onClick={() => onHide(name)} autoFocus />
    //         </div>
    //     );
    // }
    
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
                        console.log(createprojectObj);
                        console.log("Controller: " + createprojectObj);
                        const createProjectRes = await createProject_ICE(createprojectObj)
                        if(createProjectRes.error){displayError(createProjectRes.error);return;}
                        else if (createProjectRes === 'success') {
                            displayError(Messages.ADMIN.SUCC_PROJECT_CREATE);
                            props.resetForm();
                            props.setProjectDetails([]);
                            refreshDomainList();
                        } else {
                            displayError(Messages.ADMIN.ERR_CREATE_PROJECT);
                            props.resetForm();
                        }
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
                <span data-test="filter-icon" className={"task-ic-container " + (filtered && "filter-on") } onClick={()=>setShowFltrDlg(true)}><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div>
            
            <Button  style={{ background: "transparent", color: "#5F338F", border: "none", padding:"0,0,0,10", FontSize:"10px",marginLeft:"300px",marginTop:"10px"}} label="Add and Manage Project"  onClick={() => onClick('displayBasic')} />
            
            </div>
            <div>
            <div className="task-nav-bar1">
                {projectNames && projectNames.projectName.map((singleProj,idx)=>{
                   
return <>
<div key={idx} style={{display:'flex',justifyContent:'space-between'}}>
<span className={"task-nav-item" + (activeTab==="todo" && "active-tab")} style={{display:"flex", flexDirection:"column"}}>
            <span title={projectNames && singleProj}> {projectNames && `${idx+1}. ${singleProj}`}</span></span>
            {/* <h4 className={"task-num" + (props.disableTask ? " disable-task" : "")}>{props.counter}</h4> */}
<div className='button-design'>
            
            
            <button className="reset-action__exit" style={{lineBreak:'00px', border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px",  padding:"0rem 1rem 0rem 1rem",background: "white",float:'left',marginLeft:"1000px" ,margin: "3px"}} onClick={(e) => {
                   window.localStorage['Reduxbackup'] = window.localStorage['persist:login'];
                   window.location.href = "/mindmap";
             }}>Design</button>
            
            <button className="reset-action__exit" style={{lineBreak:'00px', border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px",  padding:"0rem 1rem 0rem 1rem",background: "white",float:'left',marginLeft:"500px" ,margin: "3px"}} onClick={(e) => { 
                window.localStorage['Reduxbackup'] = window.localStorage['persist:login'];
                window.location.href = "/execute";
                }}>Execute</button>
            </div>
            </div>
            </>  
                })}
                   
            
       
            </div> 
            </div>
            {/* <div>
            {/* <button style={{ background: "transparent", color: "#5F338F", border: "none" }} onClick={('displayBasic') => { }}><span style={{ fontSize: "1.2rem" }}>+</span> Create New Project Details</button> */}
                
                
    <Dialog header='Create Project'visible={displayBasic} style={{ width: '30vw' }}  onHide={() => onHide('displayBasic')}>
        <div>
            <div className='dialog_dropDown'>
                {/* {
                    isCreate == true ? <TextField /> : <NormalDropDown /> 
                } */}
                <NormalDropDown
                    label=" Project Name"
                    options={getProjectList}
                    
                        
                    placeholder="enter the project name"
                    standard
                    width="300px"
                    //   fontSize='40px'
                    //   marginLeft="200px"
                />
                {/* /create_project() */}
                {/* <p><a href="#" onClick={()=>{}} target="_blank">Select Project</a></p> */}

                {/* <a  style={{ background: "transparent", color: "green", border: "none", padding:"0,0,0,10", FontSize:"-10px",marginRight:"300px",marginTop:"5px"}} label="Select Project"  onClick={() => onClick('displayBasic')} a/> */}
                
                {/* <p onClick = {() => setisCreate(!isCreate)}>{
                    isCreate == true ? 'Select Project' : '+ Create New'                     
                }</p> */}

            </div>
            <div className='dialog_dropDown'>  
                {/* {
                    isCreate == false ? <TextField /> : <NormalDropDown /> 
                } */}
                <NormalDropDown  
                    label="App type"
                    options={getplugins_list}
                    // disabled={true}
                    
                    label1="Apptype"
                    options1={[selectedProject && allProjects[selectedProject] ?
                            {
                                key: allProjects[selectedProject].apptype,
                                text: allProjects[selectedProject].apptypeName
                            }
                        : {}
                    ]}
                    placeholder="Select an apptype"
                    width="300px"
                    top="200px"
               
                    // disabled={!selectedProject}
                    // required
                    onChange={(e, item) => {
                    setAppType(item.text)
                    }}
              
                />
            </div>
            
            <div className='labelStyle1'> <label><h5>users</h5></label></div>
        
					<div className="wrap" style={{height:'13rem'}}>
                            <div className='display_project_box'>
                                {userDetailList.map((user, index) => (
                                        <div key={index} className='display_project_box_list'>
                                            <input type='checkbox' value={JSON.stringify(user[0])}></input>
                                            <span >{user[0]}</span>
                                            {/* <option key={user[0]} value={JSON.stringify(user)} >{user[0]} </option> */}
                                        </div> 
                                         
                                ) )}
                            </div>
                    </div>
                    <div>
                        <div>
                            <button className="reset-action__exit" style={{lineBreak:'10px', border: "2px solid #5F338F", color: "#5F338F", borderRadius: "10px",  padding:"8px 25px",background: "white",float:'right',marginLeft:"5px" }} onClick={()=>{create_project()}}>Create</button>
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
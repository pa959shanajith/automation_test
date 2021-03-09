import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage, ScrollBar, ScreenOverlay, TaskContents, PopupMsg } from '../../global';
import FilterDialog from "./FilterDialog";
import * as actionTypes from '../state/action';
import * as pluginApi from "../api";
import "../styles/TaskSection.scss";

const TaskSection = ({userInfo, userRole, dispatch}) =>{

    const history = useHistory();

    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState("todo");
    const [reviewItems, setReviewItems] = useState([]);
    const [todoItems, setTodoItems] = useState([]);
    const [searchItems, setSearchItems] = useState([]);
    const [dataObj, setDataObj] = useState([]);
    const [dataDictState, setDataDictState] = useState({ 'project' : {}, 'apptypes' : [], 'tasktypes' : [], 'projectDict': {}, 'cycleDict': {}});
    const [taskJson, setTaskJson] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [overlay, setOverlay] = useState("");
    const [notManager, setNotManager] = useState(true);
    const [showFltrDlg, setShowFltrDlg] = useState(false);
    const [filterData, setFilterData] = useState({'prjval':'Select Project','relval':'Select Release','cycval':'Select Cycle','apptype':{},'tasktype':{}});
    const [filtered, setFiltered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    let dataDict;
    
    useEffect(()=>{
        if(Object.keys(userInfo).length!==0) {
            resetStates();
            let i;
            if(userRole === "Test Manager") setNotManager(false);
            
            setOverlay("Loading Tasks..Please wait...");
            pluginApi.getProjectIDs()
            .then(data => {
                if(data === "Fail" || data === "Invalid Session") return RedirectPage(history);
                else {
                    pluginApi.getTaskJson_mindmaps(data)
                    .then(data1 => {
                        //eslint-disable-next-line
                        dataDict = dataDictState;
                        // to render components which will populate under review
                        let review_items = []
                        // to render components which will populate under todo
                        let todo_items = []
                        if(data1 === "Fail" || data1 === "Invalid Session") return RedirectPage(history);
                        else {
                            let tasksJson = data1;
                            setTaskJson(data1);
                            dispatch({type: actionTypes.SET_TASKSJSON, payload: tasksJson});
                            if (tasksJson.length === 0) setOverlay("");
                            
                            let length_tasksJson = tasksJson.length;
                            let tempDataObj = [];
                            for (i=0 ; i < length_tasksJson ; i++){
                                let taskname = tasksJson[i].taskDetails[0].taskName;
                                let tasktype = tasksJson[i].taskDetails[0].taskType;
                                let status = tasksJson[i].taskDetails[0].status;
                                let dataobj={
                                    'scenarioflag':tasksJson[i].scenarioFlag,
                                    'apptype':tasksJson[i].appType,
                                    'projectid':tasksJson[i].projectId,
                                    'screenid':tasksJson[i].screenId,
                                    'screenname':tasksJson[i].screenName,
                                    'testcaseid':tasksJson[i].testCaseId,
                                    'testcasename':tasksJson[i].testCaseName,
                                    'taskname':taskname,
                                    'scenarioid':tasksJson[i].scenarioId,
                                    'taskdes':tasksJson[i].taskDetails[0].taskDescription,
                                    'tasktype':tasktype,
                                    'subtask':tasksJson[i].taskDetails[0].subTaskType,
                                    'subtaskid':tasksJson[i].taskDetails[0].subTaskId,
                                    'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
                                    'assignedto':tasksJson[i].taskDetails[0].assignedTo,
                                    'startdate':tasksJson[i].taskDetails[0].startDate,
                                    'exenddate':tasksJson[i].taskDetails[0].expectedEndDate,
                                    'status':status,
                                    'versionnumber':tasksJson[i].versionnumber,
                                    'batchTaskIDs':tasksJson[i].taskDetails[0].batchTaskIDs,
                                    'releaseid':tasksJson[i].taskDetails[0].releaseid,
                                    'cycleid':tasksJson[i].taskDetails[0].cycleid,
                                    'reuse':tasksJson[i].taskDetails[0].reuse
                                    }
                                
                                tempDataObj.push(dataobj);
                                
                                if (status === 'underReview') review_items.push({'panel_idx': i, 'testSuiteDetails': tasksJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                else todo_items.push({'panel_idx': i, 'testSuiteDetails': tasksJson[i].testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                
                                fillFilterValues(tasksJson[i],0);
                            }
                            setReviewItems(review_items);
                            setTodoItems(todo_items);
                            setDataObj(tempDataObj);
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
                        setShowPopup({'title': 'Tasks', 'content': "Fail to load tasks!"});
                        console.error("Error:::::::::::::", error);
                    });
                }
            })
            .catch(error => {
                setOverlay("");
                setShowPopup({'title': 'Tasks', 'content': "Fail to load tasks!"});
                console.error("Error:::::::::::::", error);
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
        setTaskJson(null);
        setSearchValue("");
        setOverlay("");
        setNotManager(true);
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
        let items = activeTab === "todo" ? todoItems : reviewItems;
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
    
    const Popup = () => (
        <PopupMsg 
            title={showPopup.title}
            content={showPopup.content}
            submitText="Close"
            close={()=>setShowPopup(false)}
            submit={()=>setShowPopup(false)}
        />
    )

    return (
        <>
        { showPopup && <Popup data-test="popup" />}
        {overlay && <ScreenOverlay data-test="screenoverlay-component" content={overlay}/>}
        { showFltrDlg && <FilterDialog data-test="filterdialog-component" setShow={setShowFltrDlg} dataDict={dataDictState} filterData={filterData} filterTasks={filterTasks} /> }
        <div  data-test="task-section" className="task-section">
            <div data-test="task-header" className="task-header">
                <span data-test="my-task" className="my-task">My Task(s)</span>
                { showSearch && <input data-test="search-input" className="task-search-bar " autoFocus onChange={onSearchHandler} value={searchValue} />}
                <span data-test="search-icon" className={"task-ic-container"+(showSearch?" plugin__showSearch":"")} onClick={hideSearchBar}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                <span data-test="filter-icon" className={"task-ic-container " + (filtered && "filter-on") } onClick={()=>setShowFltrDlg(true)}><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div className="task-nav-bar">
                <span data-test="task-toDo" className={"task-nav-item " + (activeTab==="todo" && "active-tab")} onClick={onSelectTodo}>To Do</span>
                <span  data-test="task-toReview" className={"task-nav-item " + (activeTab==="review" && "active-tab")} onClick={onSelectReview}>To Review</span>
            </div>
            { notManager && <div className="task-overflow" id="plugin__taskScroll">
                <ScrollBar data-test="scrollbar-component" scrollId="plugin__taskScroll" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    <div data-test="task-content" className="task-content" id="plugin_page__list">
                        <TaskContents data-test="taskcontent-component" items={searchValue ? searchItems : activeTab === "todo" ? todoItems : reviewItems} cycleDict={dataDictState.cycleDict} taskJson={taskJson} />
                    </div>
                 </ScrollBar>
            </div>}
        </div>
        </>
    );
}
export default TaskSection;
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
    const [filterDatState, setFilterDatState] = useState(null);
    const [taskJson, setTaskJson] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [overlay, setOverlay] = useState("");
    const [notManager, setNotManager] = useState(true);
    const [showFltrDlg, setShowFltrDlg] = useState(false);
    const [filterData, setFilterData] = useState({'prjval':'Select Project','relval':'Select Release','cycval':'Select Cycle','apptype':{},'tasktype':{}});
    const [filtered, setFiltered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    let filterDat;
    
    useEffect(()=>{
        if(Object.keys(userInfo).length!==0) {
            resetStates();
            let i, j, k;
            if(userRole === "Test Manager") setNotManager(false);
            
            setOverlay("Loading Tasks..Please wait...");
            pluginApi.getProjectIDs()
            .then(data => {
                if(data === "Fail" || data === "Invalid Session") return RedirectPage(history);
                else {
                    pluginApi.getTaskJson_mindmaps(data)
                    .then(data1 => {
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
                            /*	Build a list of releaseids and cycleids
                            * Another dict for releaseid and cyclelist out of task json
                            * List of apptype and tasktype
                            */
                            filterDat = {'projectids':[],'releaseids':[],'cycleids':[],'prjrelmap':{},'relcycmap':{},'apptypes':[],'tasktypes':['Design','Execution'],'idnamemapprj':{},'idnamemaprel':{},'idnamemapcyc':{},'idnamemapdom':{}};
                            
                            let length_tasksJson = tasksJson.length;
                            let tempDataObj = [];
                            for (i=0 ; i < length_tasksJson ; i++){
                                let testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
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
                                
                                if (status === 'underReview') review_items.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                else todo_items.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                
                                fillFilterValues(tasksJson[i],0);
                            }
                            setReviewItems(review_items);
                            setTodoItems(todo_items);
                            setDataObj(tempDataObj);
                            setOverlay("");
                        }

                        for(i=0 ; i < filterDat.projectids.length ; i++){
                            let index=data.projectId.indexOf(filterDat.projectids[i]);
                            index=data.projectId.indexOf(filterDat.projectids[i]);
                            filterDat.idnamemapprj[filterDat.projectids[i]] = data.projectName[index];
                            filterDat.idnamemapdom[filterDat.projectids[i]] = data.domains[index];
                            for(j=0 ; j < filterDat.releaseids.length ; j++){
                                filterDat.idnamemaprel[filterDat.releaseids[j]] = filterDat.releaseids[j];
                                for(k=0 ; k < filterDat.cycleids.length ; k++){
                                    filterDat.idnamemapcyc[filterDat.cycleids[k]] = data.cycles[filterDat.cycleids[k]][2];
                                }
                            }
                        }
                        setFilterDatState(filterDat);
                        dispatch({type: actionTypes.SET_FD, payload: filterDat})
                        
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
        setFilterDatState(null);
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

            let testSuiteDetails = JSON.stringify(taskJson[i].testSuiteDetails)
            
            let dataobj = dataObj[i];
            if(passFilterTest(taskJson[i],0, filterData)){
                if (status === 'underReview') review_items.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                else todo_items.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
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
		/*	Build a list of releaseids and cycleids
		* Another dict for releaseid and cyclelist out of task json
		* List of apptype and tasktype
		*/

		if(validID(obj.projectId) && filterDat.projectids.indexOf(obj.projectId) === -1){
			filterDat.projectids.push(obj.projectId);
			filterDat.prjrelmap[obj.projectId] = [obj.taskDetails[tidx].releaseid];
		}
		if(validID(obj.taskDetails[tidx].releaseid) && filterDat.releaseids.indexOf(obj.taskDetails[tidx].releaseid) === -1){
			filterDat.releaseids.push(obj.taskDetails[tidx].releaseid);
			if(validID(obj.projectId) && filterDat.prjrelmap[obj.projectId].indexOf(obj.taskDetails[tidx].releaseid) === -1){
				filterDat.prjrelmap[obj.projectId].push(obj.taskDetails[tidx].releaseid);
			}
			filterDat.relcycmap[obj.taskDetails[tidx].releaseid] = [obj.taskDetails[tidx].cycleid];
		}
		if(validID(obj.taskDetails[tidx].cycleid) && filterDat.cycleids.indexOf(obj.taskDetails[tidx].cycleid) === -1){
			filterDat.cycleids.push(obj.taskDetails[tidx].cycleid);
            if(validID(obj.taskDetails[tidx].releaseid) && filterDat.relcycmap[obj.taskDetails[tidx].releaseid].indexOf(obj.taskDetails[tidx].cycleid) === -1){
                filterDat.relcycmap[obj.taskDetails[tidx].releaseid].push(obj.taskDetails[tidx].cycleid);			
            }
		}

		if(filterDat.apptypes.indexOf(obj.appType)===-1)
			filterDat.apptypes.push(obj.appType);
        
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
        { showPopup && <Popup />}
        {overlay && <ScreenOverlay content={overlay}/>}
        { showFltrDlg && <FilterDialog setShow={setShowFltrDlg} filterDat={filterDatState} filterData={filterData} filterTasks={filterTasks} /> }
        <div className="task-section">
            <div className="task-header">
                <span className="my-task">My Task(s)</span>
                <input className={"task-search-bar " + (!showSearch && "no-search-bar")} onChange={onSearchHandler} value={searchValue} />
                <span className="task-ic-container" onClick={hideSearchBar}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                <span className={"task-ic-container " + (filtered && "filter-on") } onClick={()=>setShowFltrDlg(true)}><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div className="task-nav-bar">
                <span className={"task-nav-item " + (activeTab==="todo" && "active-tab")} onClick={onSelectTodo}>To Do</span>
                <span className={"task-nav-item " + (activeTab==="review" && "active-tab")} onClick={onSelectReview}>To Review</span>
            </div>
            { notManager && <div className="task-overflow">
                <ScrollBar thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" >
                    <div className="task-content" id="plugin_page__list">
                        <TaskContents items={searchValue ? searchItems : activeTab === "todo" ? todoItems : reviewItems} filterDat={filterDatState} taskJson={taskJson} />
                    </div>
                 </ScrollBar>
            </div>}
        </div>
        </>
    );
}


const validID = id => {
    // Checks if neo4j id for relase and cycle in task is valid
    if(id == 'null' || id == 'undefined' || id == null || id == undefined || id == 'Select Release' || id == 'Select Cycle' || id == '') return false;
    return true;
}

export default TaskSection;
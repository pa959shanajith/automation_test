import React, { useState, useEffect } from 'react';
import * as pluginApi from "../api";
import { RedirectPage, ScrollBar, ScreenOverlay } from '../../global';
import { useHistory } from 'react-router-dom';
import * as actionTypes from '../state/action';
import TaskContents from './TaskContents';
import FilterDialog from "./FilterDialog";
import "../styles/TaskSection.scss";

const TaskSection = ({userInfo, userRole, dispatch}) =>{

    const history = useHistory();

    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState("todo");
    const [reviewItems, setReviewItems] = useState([]);
    const [todoItems, setTodoItems] = useState([]);
    const [searchItems, setSearchItems] = useState([]);
    const [filterDatState, setFilterDatState] = useState(null);
    const [taskJson, setTaskJson] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [overlay, setOverlay] = useState("");
    const [notManager, setNotManager] = useState(true);
    const [showFltrDlg, setShowFltrDlg] = useState(false);

    // to render components which will populate under review
    let review_items = []
    // to render components which will populate under todo
    let todo_items = []
    let filterDat;
    let filterData = {'prjval':'Select Project','relval':'Select Release','cycval':'Select Cycle','apptype':{},'tasktype':{}};

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
                        if(data1 === "Invalid Session") return RedirectPage(history);
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
                            let counter = 1, countertodo = 1, counterreview = 1;
                            let length_tasksJson = tasksJson.length;
                            for (i=0 ; i < length_tasksJson ; i++){
                                let length_taskdetails = tasksJson[i].taskDetails.length;
                                for(j=0 ; j < length_taskdetails ; j++){
                                    // UNUSED CAN I REMOVE IT?
                                    let taskTypeIcon = "imgs/ic-taskType-yellow-plus.png";
                                    let testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
                                    let taskname = tasksJson[i].taskDetails[j].taskName;
                                    let tasktype = tasksJson[i].taskDetails[j].taskType;
                                    let status = tasksJson[i].taskDetails[0].status;
                                    if(tasktype === "Execution"){
                                        taskTypeIcon = "imgs/ic-taskType-blue-plus.png";
                                    }
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
                                        'taskdes':tasksJson[i].taskDetails[j].taskDescription,
                                        'tasktype':tasktype,
                                        'subtask':tasksJson[i].taskDetails[j].subTaskType,
                                        'subtaskid':tasksJson[i].taskDetails[j].subTaskId,
                                        'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
                                        'assignedto':tasksJson[i].taskDetails[j].assignedTo,
                                        'startdate':tasksJson[i].taskDetails[j].startDate,
                                        'exenddate':tasksJson[i].taskDetails[j].expectedEndDate,
                                        'status':status,
                                        'versionnumber':tasksJson[i].versionnumber,
                                        'batchTaskIDs':tasksJson[i].taskDetails[j].batchTaskIDs,
                                        'releaseid':tasksJson[i].taskDetails[j].releaseid,
                                        'cycleid':tasksJson[i].taskDetails[j].cycleid,
                                        'reuse':tasksJson[i].taskDetails[j].reuse
                                        }
                                    dataobj = JSON.stringify(dataobj);
                                        if(status === 'underReview'){
                                            review_items.push({'panel_idx': i, 'counter': counter, 'type_counter': counterreview, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                            counterreview++;
                                        }
                                        else{
                                            todo_items.push({'panel_idx': i, 'counter': counter, 'type_counter': countertodo, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                            countertodo++;
                                        }				
                                        
                                        // IDK, ELLIPSING?
                                        // let limit = 45;
                                        // let chars = $("#panelBlock_"+i+"").children().find('span.assignedTask').text();
                                        // if (chars.length > limit) {
                                        //     let visiblePart = chars.substr(0, limit-1);
                                        //     let dots = $("<span class='dots'>...</span>");
                                        //     let hiddenPart = chars.substr(limit-1);
                                        //     let assignedTaskText = visiblePart + hiddenPart;
                                        //     $("#panelBlock_"+i+"").children().find('span.assignedTask').text(visiblePart).attr('title',assignedTaskText).append(dots);
                                        //  }
                                    counter++;
                                    fillFilterValues(tasksJson[i],j);
                                }
                            }
                            setReviewItems(review_items);
                            setTodoItems(todo_items);
                            setOverlay("");
                            //prevent mouseclick before loading tasks
                            // $("span.toggleClick").removeClass('toggleClick');
                            // Enable Filter
                            // $("span.filterIcon").removeClass('disableFilter');
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
                        // dispatch({type: actionTypes.SET_FD, payload: filterDat})
                        // USE DISPATCH
                        // window.localStorage['_FD'] = angular.toJson(filterDat);
                    })
                    .catch(error => {
                        setOverlay("");
                        setOverlay("Fail to load tasks!");
                        setTimeout(function(){ setOverlay(""); }, 3000);
                        console.log("Error:::::::::::::", error);
                    });
                }
            })
            .catch(error => {
                setOverlay("");
                setOverlay("Fail to load Projects!");
                setTimeout(function(){ setOverlay(""); }, 3000);
                console.log("Error:::::::::::::", error);
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
    }


    const onSearchHandler = event => {
        searchTask(activeTab, event.target.value)
        setSearchValue(event.target.value);
    };

    const searchTask = (activeTab, value) => {
        let items = activeTab === "todo" ? todoItems : reviewItems;
        let filteredItem = [];
        let counter = 1;
        items.forEach(item => {
            if (item.taskname.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                item.type_counter = counter++;
                filteredItem.push(item)
            }
        });
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
			filterDat.relcycmap[obj.taskDetails[tidx].releaseid].push(obj.taskDetails[tidx].cycleid);			
		}

		if(filterDat.apptypes.indexOf(obj.appType)===-1)
			filterDat.apptypes.push(obj.appType);
        
        // dispatch({type: actionTypes.SET_FD, payload: filterDat})
    }
    
    const onSelectTodo = event =>{
        setActiveTab("todo");
        if (showSearch) searchTask("todo", searchValue);
    }

    const onSelectReview = event => {
        setActiveTab("review");
        if (showSearch) searchTask("review", searchValue);
    }
    

    return (
        <>
        {overlay && <ScreenOverlay content={overlay}/>}
        { showFltrDlg && <FilterDialog setShow={setShowFltrDlg}/> }
        <div className="task-section">
            <div className="task-header">
                <span className="my-task">My Task(s)</span>
                <input className={"task-search-bar " + (!showSearch && "no-search-bar")} onChange={onSearchHandler} />
                <span className="task-ic-container" onClick={()=>setShowSearch(!showSearch)}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                <span className="task-ic-container" onClick={()=>setShowFltrDlg(true)}><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div className="task-nav-bar">
                <span className={"task-nav-item " + (activeTab==="todo" && "active-tab")} onClick={onSelectTodo}>To Do</span>
                <span className={"task-nav-item " + (activeTab==="review" && "active-tab")} onClick={onSelectReview}>To Review</span>
            </div>
            { notManager && <div className="task-overflow">
                <ScrollBar thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" >
                    <div className="task-content">
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
import React, { useState, useEffect } from 'react';
import * as pluginApi from "../api";
import { RedirectPage } from '../../global';
import { useHistory } from 'react-router-dom';
import * as actionTypes from '../state/action';
import TaskRow from './TaskRow';
import "../styles/TaskSection.scss";

const TaskSection = ({userInfo, userRole, dispatch}) =>{

    const history = useHistory();

    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState("todo");
    let filterDat;
    let taskJson;

    // to render components which will populate under review
    let review_items = []
    // to render components which will populate under todo
    let todo_items = []
    
    useEffect(()=>{
        if(userInfo) {
            let i, j, k;
            // let plugins = [];
            // let availablePlugins = userInfo.pluginsInfo;
            // let pluginsLength = availablePlugins.length;
            // for(i=0 ; i < pluginsLength ; i++){
            //     if(availablePlugins[i].pluginValue !== false){
            //         let pluginName = availablePlugins[i].pluginName;
            //         let pluginTxt = pluginName.replace(/\s/g,'');
            //         let dataName = Encrypt.encode("p_"+pluginTxt);
            //         plugins.push("p_"+pluginName);
            //         // RENDER PLUGIN BOXES FOR REACT
            //         // $("#plugin-container").append('<div class="col-md-4 plugin-block"><span ng-click="pluginBox()" class="toggleClick pluginBox" data-name="p_'+pluginTxt+'" id="'+pluginName+'" title="'+pluginName+'">'+pluginName+'</span><input class="plugins" type="hidden" id="'+pluginName+"_"+dataName+'"  title="'+pluginTxt+"_"+dataName+'"></div>').fadeIn();
            //     }
            // }
            if(userRole === "Test Manager") {
                // HIDE SOMETHING 
                // $(".task-content").hide();
            }
            // ANVESH'S BLOCKUI
            // blockUI("Loading Tasks..Please wait...");
            pluginApi.getProjectIDs()
            .then(data => {
                if(data === "Fail" || data === "Invalid Session") return RedirectPage(history);
                else {
                    pluginApi.getTaskJson_mindmaps(data)
                    .then(data1 => {
                        if(data1 === "Invalid Session") return RedirectPage(history);
                        else {
                            let tasksJson = data1;
                            taskJson = data1;
                            console.log(tasksJson)
                            dispatch({type: actionTypes.SET_TASKSJSON, payload: tasksJson});
                            if (tasksJson.length === 0) console.log("anvesh's blockui")// unblockUI();
                            /*	Build a list of releaseids and cycleids
                            * Another dict for releaseid and cyclelist out of task json
                            * List of apptype and tasktype
                            */
                            filterDat = {'projectids':[],'releaseids':[],'cycleids':[],'prjrelmap':{},'relcycmap':{},'apptypes':[],'tasktypes':['Design','Execution'],'idnamemapprj':{},'idnamemaprel':{},'idnamemapcyc':{},'idnamemapdom':{}};
                            // HIDING CONTENT DIV
                            // $(".plugin-taks-listing:visible").empty().hide();
                            let counter = 1, countertodo = 1, counterreview = 1;
                            let length_tasksJson = tasksJson.length;
                            for (i=0 ; i < length_tasksJson ; i++){
                                // UNDERSTAND THIS
                                let classIndex = i<100 ? "tasks-l-s" : i<1000 ? "tasks-l-m" : "tasks-l-l";
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
                                            review_items.push({'panel-idx': i, 'counter': counter, 'classIdx': classIndex, 'counter-review': counterreview, 'testSuiteDetails': testSuiteDetails, 'data-dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                            // POPULATE UNDER REVIEW
                                            // $('.plugin-taks-listing.review').append("<div class='panel panel-default' panel-id='"+i+"'><div id='panelBlock_"+i+"' class='panel-heading'><div class='taskDirection' href='#collapse"+counter+"'><h4 class='taskNo "+classIndex+" taskRedir'>"+ counterreview +"</h4><span class='assignedTask' data-testsuitedetails='"+testSuiteDetails+"' data-dataobj='"+dataobj+"' onclick='taskRedirection(this.dataset.testsuitedetails,this.dataset.dataobj,event)'>"+taskname+"</span><!--Addition--><div class='panel-additional-details'><button class='panel-head-tasktype'>"+tasktype+"</button></div><!--Addition--></div></div></div>").fadeIn();
                                            counterreview++;
                                        }
                                        else{
                                            todo_items.push({'panel-idx': i, 'counter': counter, 'classIdx': classIndex, 'counter-todo': countertodo, 'testSuiteDetails': testSuiteDetails, 'data-dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype})
                                            // POPULATE UNDER TODO
                                            // $('.plugin-taks-listing.todo').append("<div class='panel panel-default' panel-id='"+i+"'><div id='panelBlock_"+i+"' class='panel-heading'><div class='taskDirection' href='#collapse"+counter+"'><h4 class='taskNo "+classIndex+" taskRedir'>"+ countertodo +"</h4><span class='assignedTask' data-testsuitedetails='"+testSuiteDetails+"' data-dataobj='"+dataobj+"' onclick='taskRedirection(this.dataset.testsuitedetails,this.dataset.dataobj,event)'>"+taskname+"</span><!--Addition--><div class='panel-additional-details'><button class='panel-head-tasktype'>"+tasktype+"</button></div><!--Addition--></div></div></div>").fadeIn();
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
                                    // THIS ONE IS BIG
                                    // fillFilterValues(tasksJson[i],j);
                                }
                            }
                            // unblockUI();
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
                        dispatch({type: actionTypes.SET_FD, payload: filterDat})
                        // USE DISPATCH
                        // window.localStorage['_FD'] = angular.toJson(filterDat);
                    }, function (error) {
                        // unblockUI();
                        // blockUI("Fail to load tasks!");
                        // setTimeout(function(){ unblockUI(); }, 3000);
                        console.log("Error:::::::::::::", error);
                    });
                }
            }, function (error) {
                // unblockUI();
                // blockUI("Fail to load Projects!");
                // setTimeout(function(){ unblockUI(); }, 3000);
                console.log("Error:::::::::::::", error);
            });
        }
    }, []);


    const fillFilterValues = ({obj, tidx}) => {
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
        
        dispatch({type: actionTypes.SET_FD, payload: filterDat})

		// $(".panel-additional-details").off("click");
		// $(".panel-additional-details").click(function(e){
		// 	var data_object = this.parentElement.children[1].getAttribute('data-dataobj');
		// 	data_object=JSON.parse(data_object)
		// 	var tdes = data_object['taskdes']
		// 	var olddescriptionid = "null";
		// 	if($(".description-container").length>0)
		// 		olddescriptionid = $(".description-container")[0].getAttribute("description-id");
		// 	$(".description-container").remove();
		// 	$(".active-task").removeClass("active-task");
		// 	var clickedtask = this.parentElement.parentElement.parentElement.getAttribute('panel-id');
		// 	if(clickedtask == olddescriptionid){
		// 		$(".description-container").remove();
		// 		$(".active-task").removeClass("active-task");
		// 		return;
		// 	}
		// 	var clktask = taskJson[clickedtask];
		// 	var maintask = clktask;
		// 	var filterDat = filterDat;
		// 	if(clktask.taskDetails[0].taskType != 'Design')
		// 		clktask = clktask.testSuiteDetails[0];
		// 	adddetailhtml = '<div class="panel panel-default description-container" description-id="'+clickedtask+'"><li class="description-item" title="Description: '+tdes+'">Description: '+tdes+'</li><li class="description-item" title="Release: '+filterDat.idnamemaprel[clktask.releaseid]+'">Release: '+filterDat.idnamemaprel[clktask.releaseid]+'</li><li class="description-item" title="Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'">Cycle: '+filterDat.idnamemapcyc[clktask.cycleid]+'</li><li class="description-item" title="Apptype: '+maintask.appType+'">Apptype: '+maintask.appType+'</li></div>';
		// 	$(adddetailhtml).insertAfter("[panel-id="+clickedtask+"]");
		// 	$("[panel-id="+clickedtask+"]").addClass("active-task");
		// });
	}
    

    return (
        <div className="task-section">
            <div className="task-header">
                <span className="my-task">My Task(s)</span>
                <input className="task-search-bar" style={showSearch ? {visibility: "visible"} : {visibility: "hidden"}}/>
                <span className="task-ic-container" onClick={()=>setShowSearch(!showSearch)}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                <span className="task-ic-container"><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div className="task-nav-bar">
                <span className="task-nav-item" onClick={()=>setActiveTab("todo")}>To Do</span>
                <span className="task-nav-item" onClick={()=>setActiveTab("review")}>To Review</span>
            </div>
            <div className="task-content">
                {activeTab === "todo" ? <TaskRow todo_items={todo_items}/> : <TaskRow review_items={review_items}/>}
            </div>
        </div>
    );
}


const validID = id => {
    // Checks if neo4j id for relase and cycle in task is valid
    if(id == 'null' || id == 'undefined' || id == null || id == undefined || id == 'Select Release' || id == 'Select Cycle' || id == '') return false;
    return true;
}

export default TaskSection;
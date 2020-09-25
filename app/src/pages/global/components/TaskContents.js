import React, { useState, useEffect } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as pluginApi from '../../plugin/api';
import * as actionTypes from "../../plugin/state/action";
import "../styles/TaskContents.scss";

const TaskContents = ({items, filterDat, taskJson}) => {

    const [showPanel, setShowPanel] = useState("");

    useEffect(()=>{
        setShowPanel("");
    }, [items]);

    return (
        <>
        {items.length !== 0 ? 
        <>
        {items.map(item=>{
            return <TaskPanel item={item} showPanel={showPanel} setShowPanel={setShowPanel} filterDat={filterDat} taskJson={taskJson} />
        })}
        </>
        : null }
        </>
    );

}


const TaskPanel = ({item, showPanel, setShowPanel, filterDat, taskJson}) => {

    const taskSuiteDetails = item.testSuiteDetails;
    const dataobj = item.dataobj;

    const history = useHistory();
    const dispatch = useDispatch();
    const [desc, setDesc] = useState(null);
    const [rel, setRel] = useState(null);
    const [cyc, setCyc] = useState(null);
    const [appType, setAppType] = useState(null);
    const [descId, setDescId] = useState(null);
    const [redirectTo, setRedirectTo] = useState("");

    const taskRedirection = event => {
        event.preventDefault();
            
        let dataobj_json=JSON.parse(dataobj)
        let taskObj = {};
        if(dataobj_json.status==='assigned'){
            dataobj_json.status='inprogress';
            pluginApi.updateTaskStatus(dataobj_json.subtaskid)
                    .then(data => {
                        dataobj_json.status=data;
                    })
                    .catch(error=> {
                        console.log("Error updating task status " + (error.data));
                    });
        }
        taskObj.testSuiteDetails = JSON.parse(taskSuiteDetails);
        taskObj.scenarioFlag = dataobj_json.scenarioflag;
        taskObj.assignedTestScenarioIds = dataobj_json.assignedtestscenarioids;
        taskObj.screenId = dataobj_json.screenid;
        taskObj.screenName = dataobj_json.screenname;
        taskObj.projectId = dataobj_json.projectid;
        taskObj.taskName = dataobj_json.taskname;
        taskObj.versionnumber = dataobj_json.versionnumber;
        taskObj.testCaseId = dataobj_json.testcaseid;
        taskObj.testCaseName = dataobj_json.testcasename;
        taskObj.appType = dataobj_json.apptype;
        taskObj.status=dataobj_json.status;
        taskObj.scenarioId = dataobj_json.scenarioid;
        taskObj.batchTaskIDs=dataobj_json.batchTaskIDs;
        taskObj.subTask = dataobj_json.subtask; 
        taskObj.subTaskId=dataobj_json.subtaskid;
        taskObj.releaseid = dataobj_json.releaseid;
        taskObj.cycleid = dataobj_json.cycleid;
        taskObj.reuse = dataobj_json.reuse;
    
        // DISPATCH
        dispatch({type: actionTypes.SET_CT, payload: taskObj});
        // window.localStorage['_CT'] = JSON.stringify(taskObj);
        if(dataobj_json.subtask === "Scrape"){
            window.localStorage['navigateScreen'] = "Scrape";
            window.localStorage['navigateScrape'] = true;
            setRedirectTo("/scrape")

        }
        else if(dataobj_json.subtask === "TestCase"){
            window.localStorage['navigateScreen'] = "TestCase";
            window.localStorage['navigateTestcase'] = true;
            setRedirectTo("/design")
        }
        else if(dataobj_json.subtask === "TestSuite"){
            window.localStorage['navigateScreen'] = "TestSuite";
            history.replace("/plugin")
            // $window.location.assign("/execute");
        }
        else if(dataobj_json.subtask === "Scheduling"){
            window.localStorage['navigateScreen'] = "scheduling";
            history.replace("/plugin")
            // $window.location.assign("/scheduling");
        }
    }

    const expandDetails = event =>{
        event.preventDefault();
        
        if (showPanel === item.panel_idx) setShowPanel(null);
        else setShowPanel(item.panel_idx)

        let data_object = JSON.parse(dataobj)
        let tdes = data_object['taskdes']
        
        let clktask = taskJson[item.panel_idx];
        let maintask = clktask;
        if(clktask.taskDetails[0].taskType != 'Design')
            clktask = clktask.testSuiteDetails[0];
        
        setDescId(item.panel_idx);
        setDesc(tdes);
        setRel(filterDat.idnamemaprel[clktask.releaseid]);
        setCyc(filterDat.idnamemapcyc[clktask.cycleid]);
        setAppType(maintask.appType);
    }


    return (  
        <>
        {
            redirectTo ? <Redirect to={redirectTo} /> : 
            <>
            <div className={"task-panel " + (showPanel === item.panel_idx ? "active-task" : "")} panel-id={item.panel_idx}>
            <div className="panel-content" id={`panelBlock_${item.panel_idx}`}>
                <h4 className="task-num">{item.type_counter || item.counter}</h4>
                <span className="assign-task" onClick={taskRedirection} >{item.taskname}</span>
                <div className="tasktype-btndiv">
                    <button className="tasktype-btn" onClick={expandDetails}>{item.tasktype}</button>
                </div>
            </div>
            { showPanel === item.panel_idx &&
            <div className="task-description" description-id={descId}>
                <div>Description: {desc}</div>
                <div>Release: {rel}</div>
                <div>Cycle: {cyc}</div>
                <div>Apptype: {appType}</div>
            </div>
            }
            </div>
        </>
        }
        </>
    );
}

{/* <>
<div className={"rb__task-panel " + (showPanel === item.panel_idx ? "rb__active-task" : "")} panel-id={item.panel_idx}>
<div className="rb__panel-content" id={`panelBlock_${item.panel_idx}`}>
    <h4 className="rb__task-num">{item.counter}</h4>
    <span className="rb__assign-task" onClick={taskRedirection} >{item.taskname}</span>
    <div className="rb__tasktype-btndiv">
        <button className="rb__tasktype-btn" onClick={expandDetails}>{item.tasktype}</button>
    </div>
</div>
{ showPanel === item.panel_idx &&
<div className="rb__task-description" description-id={descId}>
    <div>Description: {desc}</div>
    <div>Release: {rel}</div>
    <div>Cycle: {cyc}</div>
    <div>Apptype: {appType}</div>
</div>
}
</div>
</> */}

export default TaskContents;
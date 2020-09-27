import React, { useState, useEffect } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as pluginApi from '../../plugin/api';
import * as actionTypes from "../../plugin/state/action";
import "../styles/TaskContents.scss";

const TaskContents = (props) => {

    const [showPanel, setShowPanel] = useState("");

    useEffect(()=>{
        setShowPanel("");
    }, [props.items]);

    return (
        <>
        {props.items.length !== 0 ? 
        <>
        {props.items.map(item=>{
            return <TaskPanel 
                        item={item}
                        showPanel={showPanel} 
                        setShowPanel={setShowPanel} 
                        filterDat={props.filterDat} 
                        taskJson={props.taskJson}
                        taskName={props.taskName}
                    />
        })}
        </>
        : null }
        </>
    );

}


const TaskPanel = (props) => {

    const taskSuiteDetails = props.item.testSuiteDetails;
    const dataobj = props.item.dataobj;

    const history = useHistory();
    const dispatch = useDispatch();
    const [desc, setDesc] = useState(null);
    const [rel, setRel] = useState(null);
    const [cyc, setCyc] = useState(null);
    const [appType, setAppType] = useState(null);
    const [descId, setDescId] = useState(null);

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

        dispatch({type: actionTypes.SET_CT, payload: taskObj});

        if(dataobj_json.subtask === "Scrape"){
            window.localStorage['navigateScreen'] = "Scrape";
            window.localStorage['navigateScrape'] = true;
            history.replace("/scrape")
        }
        else if(dataobj_json.subtask === "TestCase"){
            window.localStorage['navigateScreen'] = "TestCase";
            window.localStorage['navigateTestcase'] = true;
            history.replace("/design")
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
        
        if (props.showPanel === props.item.panel_idx) props.setShowPanel(null);
        else props.setShowPanel(props.item.panel_idx)

        let data_object = JSON.parse(dataobj)
        let tdes = data_object['taskdes']
        
        let clktask = props.taskJson[props.item.panel_idx];
        let maintask = clktask;
        if(clktask.taskDetails[0].taskType != 'Design')
            clktask = clktask.testSuiteDetails[0];
        
        setDescId(props.item.panel_idx);
        setDesc(tdes);
        setRel(props.filterDat.idnamemaprel[clktask.releaseid]);
        setCyc(props.filterDat.idnamemapcyc[clktask.cycleid]);
        setAppType(maintask.appType);
    }


    return (  
        <>
            <div className={"task-panel " + (props.showPanel === props.item.panel_idx ? "active-task " : "")} panel-id={props.item.panel_idx}>
            <div className={"panel-content " + (props.taskName === props.item.taskname ? "disable-task " : "")} id={`panelBlock_${props.item.panel_idx}`}>
                <h4 className="task-num">{props.item.type_counter || props.item.counter}</h4>
                <span className="assign-task" onClick={taskRedirection} >{props.item.taskname}</span>
                <div className="tasktype-btndiv">
                    <button className="tasktype-btn" onClick={expandDetails}>{props.item.tasktype}</button>
                </div>
            </div>
            { props.showPanel === props.item.panel_idx &&
            <div className="task-description" description-id={descId}>
                <div>Description: {desc}</div>
                <div>Release: {rel}</div>
                <div>Cycle: {cyc}</div>
                <div>Apptype: {appType}</div>
            </div>
            }
            </div>
        </>
    );
}

{/* <>
<div className={"rb__task-panel " + (showPanel === props.item.panel_idx ? "rb__active-task" : "")} panel-id={item.panel_idx}>
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
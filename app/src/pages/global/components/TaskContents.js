import React, { useState, useEffect } from 'react';
import { updateScrollBar } from '../../global';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../api';
import * as actionTypes from "../../plugin/state/action";
import "../styles/TaskContents.scss";

/*
    Component: Task List for Plugin Page and Reference Bar (Right Bar)
    Uses: Renders a list of task for above mentioned components
    Props : items -> array of tasks to populate
            cycleDict -> cycle dictionary from FD state
            taskJson -> tasksJson from redux store (can be called here using useSelector, modifications may require in taskSection.js )
*/

const TaskContents = (props) => {

    const [showPanel, setShowPanel] = useState("");

    useEffect(()=>{
        setShowPanel("");
    }, [props.items]);

    return (
        <>
        {props.items.length !== 0 &&
        <>
        {props.items.map((item, i)=>{
            return <TaskPanel 
                        key={i}
                        item={item}
                        counter={i+1}
                        showPanel={showPanel} 
                        setShowPanel={setShowPanel}
                        disableTask = { props.currUid === props.taskJson[item.panel_idx].uid }
                        taskJson = {props.taskJson}
                        cycleDict={props.cycleDict}
                    />
        })}
        </> }
        </>
    );

}


const TaskPanel = props => {

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
            
        let taskObj = {};
        if(dataobj.status==='assigned'){
            dataobj.status='inprogress';
            updateTaskStatus(dataobj.subtaskid)
                .then(data => dataobj.status=data)
                .catch(error=> console.error("Error updating task status. ERROR::::", error.data));
        }
        taskObj.testSuiteDetails = taskSuiteDetails;
        taskObj.scenarioFlag = dataobj.scenarioflag;
        taskObj.accessibilityParameters  = dataobj.accessibilityParameters;
		taskObj.scenarioTaskType = dataobj.scenarioTaskType;
        taskObj.assignedTestScenarioIds = dataobj.assignedtestscenarioids;
        taskObj.screenId = dataobj.screenid;
        taskObj.screenName = dataobj.screenname;
        taskObj.projectId = dataobj.projectid;
        taskObj.taskName = dataobj.taskname;
        taskObj.versionnumber = dataobj.versionnumber;
        taskObj.testCaseId = dataobj.testcaseid;
        taskObj.testCaseName = dataobj.testcasename;
        taskObj.appType = dataobj.apptype;
        taskObj.status=dataobj.status;
        taskObj.scenarioId = dataobj.scenarioid;
        taskObj.batchTaskIDs=dataobj.batchTaskIDs;
        taskObj.subTask = dataobj.subtask; 
        taskObj.subTaskId=dataobj.subtaskid;
        taskObj.releaseid = dataobj.releaseid;
        taskObj.cycleid = dataobj.cycleid;
        taskObj.reuse = dataobj.reuse;
        taskObj.uid = dataobj.uid;

        dispatch({type: actionTypes.SET_CT, payload: taskObj});

        if(dataobj.subtask === "Scrape"){
            window.localStorage['navigateScreen'] = "Scrape";
            window.localStorage['navigateScrape'] = true;
            history.replace("/scrape")
        }
        else if(dataobj.subtask === "TestCase"){
            window.localStorage['navigateScreen'] = "TestCase"; // Can I change it to "Design"?
            window.localStorage['navigateTestcase'] = true;
            history.replace("/design")
        }
        else if(dataobj.subtask === "TestSuite"){
            window.localStorage['navigateScreen'] = "TestSuite";
            history.replace("/execute")
            // $window.location.assign("/execute"); 
        }
        else if(dataobj.subtask === "Scheduling"){
            window.localStorage['navigateScreen'] = "scheduling";
            history.replace("/plugin")
            // $window.location.assign("/scheduling");
        }
    }

    const expandDetails = event =>{
        event.preventDefault();
        
        if (props.showPanel === props.item.panel_idx) props.setShowPanel(null);
        else props.setShowPanel(props.item.panel_idx)

        let tdes = dataobj['taskdes']
        
        let clktask = props.taskJson[props.item.panel_idx];
        let maintask = clktask;
        if(clktask.taskDetails[0].taskType !== 'Design') clktask = clktask.testSuiteDetails[0];
        
        setDescId(props.item.panel_idx);
        setDesc(tdes);
        setRel(clktask.releaseid);
        setCyc(props.cycleDict[clktask.cycleid]);
        setAppType(maintask.appType);
        updateScrollBar();
    }


    return (  
        <>
            <div className={"task-panel " + (props.showPanel === props.item.panel_idx ? "active-task " : "")} panel-id={props.item.panel_idx}>
            <div className="panel-content " id={`panelBlock_${props.item.panel_idx}`} title={props.item.taskname} >
                <h4 className={"task-num" + (props.disableTask ? " disable-task" : "")}>{props.counter}</h4>
                <span className={"assign-task" + (props.disableTask ? "  disable-task" : "")} onClick={taskRedirection} >
                    {props.item.taskname.length >= 45 ? props.item.taskname.substr(0, 44)+"..." : props.item.taskname}
                </span>
                <div className={"tasktype-btndiv" + (props.disableTask ? " dark-bg " : "")}>
                    <button className="tasktype-btn" onClick={expandDetails}>{props.item.tasktype}</button>
                </div>
            </div>
            { props.showPanel === props.item.panel_idx &&
            <div className="task-description" description-id={descId}>
                <div title={desc}>Description: {desc}</div>
                <div title={rel}>Release: {rel}</div>
                <div title={cyc}>Cycle: {cyc}</div>
                <div title={appType}>Apptype: {appType}</div>
            </div>
            }
            </div>
        </>
    );
}

export default TaskContents;
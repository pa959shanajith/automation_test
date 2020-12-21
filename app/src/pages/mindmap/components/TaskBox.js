import React, { Fragment, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../styles/TaskBox.scss';
import ClickAwayListener from 'react-click-away-listener';
import {populateUsers} from '../api';
import { useDispatch, useSelector } from 'react-redux';
import Complexity, {getComplexityLevel} from './Complexity';
import * as actionTypes from '../state/action';


/*Component TaskBox
  use: returns TaskBox near module
*/
//dispatch({type:actionTypes.UPDATE_UNASSIGNTASK,payload:[]})
var unassignTask = []
var reassignFlag = false
const defaultVal = 'ct-default';
const userinfo = {"user_id":"5de4e4aed9cdd57f4061bc99","username":"nayak.dheeraj","email_id":"dheerajnayak@gmail.com","additionalrole":[],"firstname":"nayak","lastname":"dheeraj","role":"5db0022cf87fdec084ae49aa","taskwflow":false,"token":"720","dbuser":true,"ldapuser":false,"samluser":false,"openiduser":false,"rolename":"Test Lead","pluginsInfo":[{"pluginName":"Integration","pluginValue":true},{"pluginName":"APG","pluginValue":false},{"pluginName":"Dashboard","pluginValue":false},{"pluginName":"Mindmap","pluginValue":true},{"pluginName":"Neuron Graphs","pluginValue":false},{"pluginName":"Performance Testing","pluginValue":false},{"pluginName":"Reports","pluginValue":true},{"pluginName":"Utility","pluginValue":true},{"pluginName":"Webocular","pluginValue":false}],"page":"plugin","tandc":false}
const TaskBox = (props) => {
    const dispatch = useDispatch()
    const taskRef = useRef()
    const batchNameRef = useRef()
    const taskDetailsRef =  useRef()
    const projectList = useSelector(state=>state.mindmap.projectList)
    const unassignList = useSelector(state=>state.mindmap.unassignTask)
    //const assignedObj = useSelector(state=>state.mindmap.assignedObj)
    const userInfo = useSelector(state=>state.login.userinfo)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const [task,setTask] = useState({arr:[],initVal:undefined})
    const [batchName,setBatchName] = useState({show:false})
    const [userAsgList,setUserAsgList] = useState({arr:[],value:undefined,disabled:true})
    const [userRevList,setUserRevList] = useState({arr:[],value:undefined})
    const [startDate,setStartDate] = useState({show:false,value:undefined})
    const [endDate,setEndDate] = useState({show:false,value:undefined})
    const [propagate,setPropagate] = useState({show:false,val:false})
    const [complexity,setComplexity] = useState({show:false,clist:undefined,val:undefined})
    const [assignbtn,SetAssignbtn] = useState({disable:true,reassign:false})
    const [showcomplexity,setShowcomplexity] = useState(false)
    const appType = projectList[selectedProj].apptype
    const cycleid = props.cycleid;
    const releaseid = props.releaseid;
    const setTaskBox = props.setTaskBox;
    const setPopup = props.setPopup;
    var ctScale = props.ctScale;
    var dNodes = props.dNodes;
    var nodeDisplay = props.nodeDisplay
    var clickUnassign = props.clickUnassign
    var clickAddTask = props.clickAddTask
    var nid = props.nid;
    var p = d3.select('#'+nid);
    var pi = nid.split("_")[1]
    var t = p.attr('data-nodetype');
    if(dNodes[pi].parent && dNodes[pi].parent.type === 'endtoend'){
        setTaskBox(false)
        setPopup({show:true,title:'MindMap',content:'Can not assign scenarios in end to end module. Please select respective modules to assign scenarios',submitText:'Ok'})
    }
    useEffect(()=>{
        setCoordinate(p,t,ctScale)
        return ()=>{
            d3.select('#ct-assignTable').classed('hide',true)
            p.classed('node-highlight',false)
        }
    },[ctScale,nid])
    useEffect(()=>{
        unassignTask = unassignList
        var nt = (dNodes[pi].task !== undefined || dNodes[pi].task != null) ? dNodes[pi].task : !1; 
        if(nt){
            if(unassignList.indexOf(dNodes[pi].task._id)!=-1){
                SetAssignbtn({disable:false,reassign:true})
            }else{
                SetAssignbtn({disable:false,reassign:false})
            }            
        }
        var tObj = {
            t: (nt) ? nt.tasktype : '',
            bn: (nt) ? nt.batchname : '',
            at: (nt) ? nt.assignedto : '',
            rw: (nt && nt.reviewer != null) ? nt.reviewer : '',
            sd: (nt) ? nt.startdate : '',
            ed: (nt) ? nt.enddate : '',
            re: (nt && nt.release != null) ? nt.release : '',
            cy: (nt && nt.cycleid != null) ? nt.cycleid : '',
            det: (nt) ? nt.details : '',
            cx: (nt) ? nt.complexity : undefined,
            _id:(nt)? nt._id:null
        };
        if (tObj.t == null || tObj.t == "") {
            tObj.t = taskAssign[t].task[0];
        }
        if (tObj.det === null || tObj.det.trim() == "") {
            var type = dNodes[pi].type
            // to avoid phrasing "Execute scenario scenarios" 
            type = (type && type!=='scenarios')?type.charAt(0).toUpperCase()+type.slice(1):""
            taskDetailsRef.current.value = tObj.t + " " + type + " " + dNodes[pi].name
        } else {
            taskDetailsRef.current.value = tObj.det
        }
        var flag = true;
        if (t == 'scenarios' && dNodes[pi].parent.type == 'endtoend') {
            flag = false;
        } else if (t == 'screens' && (appType == "258afbfd-088c-445f-b270-5014e61ba4e2" || appType == "7a6820f1-2817-4d57-adaf-53734dd2354b")) {
            if (appType == "7a6820f1-2817-4d57-adaf-53734dd2354b"){
                setTaskBox(false)
                setPopup({show:true,title:'Error',content:'Task disabled for System screen',submitText:'Ok'})
            }
            else{
                setTaskBox(false)
                setPopup({show:true,title:'Error',content:'Task disabled for System screen',submitText:'Ok'})
            }
            return;
        }
        if (flag) {
            if (t != 'testcases' && (dNodes[pi]._children != null)) {
                setTaskBox(false)
                setPopup({show:true,title:'Error',content:'Expand the node',submitText:'Ok'})
                return;
            } else if (t != 'testcases' && (dNodes[pi].children == null)) {
                setTaskBox(false)
                setPopup({show:true,title:'Error',content:'Incomplete Flow',submitText:'Ok'})
                return;
            }
        }
        // populate task 
        var val = dNodes[pi].task ? dNodes[pi].task.tasktype:dNodes[pi].task
        setTask({arr:taskAssign[t].task,initVal:val})
        taskAssign[t].attributes.forEach(e => {
            switch(e){
                case 'bn':{
                    changeTask(val=='Execute Batch'?val:'Execute')
                    return;
                }
                case 'at':{
                    (async()=>{
                        var res = await populateUsers(selectedProj)
                        setUserAsgList({arr:res.rows,value:tObj.at,disabled:tObj.at?true:false})
                        setUserRevList({arr:res.rows,value:tObj.rw})
                    })()
                    return;
                }
                case 'rw':
                    return;
                case 'sd':
                    setStartDate({show:true,value:"18/12/2020"})
                    return;
                case 'ed':
                    setEndDate({show:true,value:"19/12/2020"})
                    return;
                case 'pg':
                    setPropagate({show:true,val:false})
                    return;
                case 'cx':
                    if (dNodes[pi].parent) {
                        var clist = tObj.cx;
                        var cval ='Not Set'
                        if (!(clist == "undefined" || clist == undefined || clist == "")){
                            clist = clist.split(",");
                            cval = getComplexityLevel(t, parseInt(clist[0]))
                        }else{
                            clist=undefined
                        } 
                        setComplexity({show:true,clist:clist,val:cval})
                    }
                    return;
                default : return;
            }

        });
        return()=>{
            unassignTask=[]
            reassignFlag=false
            setTask({arr:[],initVal:undefined})
            setBatchName({show:false})
            setUserAsgList({arr:[],value:undefined,disabled:true})
            setUserRevList({arr:[],value:undefined})
            setStartDate({show:false,value:undefined})
            setEndDate({show:false,value:undefined})
            setPropagate({show:false,val:false})
            setComplexity({show:false,clist:undefined,val:undefined})
            SetAssignbtn({disable:true,reassign:false})
        }
    },[nid])
    const propList = {
        userInfo,pi,dNodes,userAsgList,userRevList,batchNameRef,taskRef,startDate,endDate,taskDetailsRef,complexity,cycleid,releaseid,appType
    }
    const changeTask = (initVal) =>{
        if(initVal === 'Execute Batch' || (taskRef.current && taskRef.current.value === 'Execute Batch')){
            if(batchNameRef.current)batchNameRef.current.value = dNodes[pi].task?dNodes[pi].task.batchname:""
            setBatchName({show:true,val:dNodes[pi].task?dNodes[pi].task.batchname:"",disabled:false})
        }else if(initVal === 'Execute' || (taskRef.current && taskRef.current.value === 'Execute')){
            if(batchNameRef.current)batchNameRef.current.value = ""
            setBatchName({show:true,disabled:true,val:""})
        }
    }
    const ignoreClick = (e) => {
        if(e.target.innerText === '×' || e.target.classList.contains('complx_btn') || e.target.className.baseVal === "ct-nodeIcon"){
            return false
        }
        return true
    }
    const unAssign = (flag) => {
        if(assignbtn.disable)return;
        reassignFlag = flag;
        removeTask(pi,undefined,userInfo,propagate.val,dNodes,nodeDisplay,cycleid,pi)
        if(nodeDisplay){
            clickUnassign({nodeDisplay,unassignTask})
        }
    }
    const addTask = () => {
        if(!assignBoxValidator(propList))return;
        var tObj = initTaskObject(propList);
        Object.keys(tObj).forEach((k)=>{
            if (tObj[k] === undefined) tObj[k] = null;
        });
        //assignedObj[pi] = {[tObj.t]:tObj.atName}
        // if(p.select('.ct-nodeTask')[0][0]==null) p.append('image').attr('class','ct-nodeTask').attr('xlink:href','imgs/node-task-assigned.png').attr('x',29).attr('y',-10);
        if (t == "modules" || t == "endtoend") {
            if (dNodes[pi]._id != "null") {
                addTask_11(pi, tObj, 0, cycleid, dNodes, nodeDisplay);
            }
            //Logic to add tasks for the scenario
            if (dNodes[pi].children && propagate.val) dNodes[pi].children.forEach(function(tSc) {
                addTask_11(tSc.id, tObj, 1, cycleid, dNodes, nodeDisplay);
                if (tSc.children != undefined) {
                    tSc.children.forEach(function(scr) {
                        if (appType != "258afbfd-088c-445f-b270-5014e61ba4e2" && appType != "7a6820f1-2817-4d57-adaf-53734dd2354b") addTask_11(scr.id, tObj, 2, cycleid, dNodes, nodeDisplay);
                        scr.children.forEach(function(tCa) {
                            addTask_11(tCa.id, tObj, 3, cycleid, dNodes, nodeDisplay);
                        });
                    });
                }
            });
        }
        //Logic to add tasks for the scenario
        else if (t == "scenarios") {
            //var modid = dNodes[pi].parent.id_c,
            var tscid = dNodes[pi].id_c;
            if (tscid != 'null') {
                addTask_11(dNodes[pi].id, tObj, 4, cycleid, dNodes, nodeDisplay);
                if (dNodes[pi].children && propagate.val) dNodes[pi].children.forEach(function(scr) {
                    if (appType != "258afbfd-088c-445f-b270-5014e61ba4e2" && appType != "7a6820f1-2817-4d57-adaf-53734dd2354b") addTask_11(scr.id, tObj, 5, cycleid, dNodes, nodeDisplay);
                    scr.children.forEach(function(tCa) {
                        addTask_11(tCa.id, tObj, 6, cycleid, dNodes, nodeDisplay);
                    });
                });
            }
        } else if (t == "screens") {
            addTask_11(pi, tObj, 7, cycleid, dNodes, nodeDisplay);
            if (dNodes[pi].children && propagate.val) dNodes[pi].children.forEach(function(tCa) {
                var cTask = (tObj.t == "Scrape" || tObj.t == "Append" || tObj.t == "Compare") ? "Design" : "Debug";
                addTask_11(tCa.id, tObj, 8, cTask, cycleid, dNodes, nodeDisplay);
            });
        } else if (t == "testcases") {
            addTask_11(pi, tObj, 9, cycleid, dNodes, nodeDisplay);
        }
        clickAddTask({dNodes,nodeDisplay})
    }
    return(
        <Fragment>
        <ClickAwayListener onClickAway={(e)=>{if(ignoreClick(e))props.setTaskBox(false)}}>
            <div id='ct-assignTable' className='task-box__container hide'>
                <ul>
                    {task.arr.length>0?
                        <li>
                            <label>Task</label>
                            <select onChange={changeTask} defaultValue={task.initVal} ref={taskRef}>
                                {task.arr.map((e)=>
                                    <option key={e} value={e}>{e}</option>
                                )}
                            </select>
                        </li>
                    :null}
                    {(batchName.show)?
                        <li>
                            <label>Batch Name</label>
                            <input id='ct-batchName' disabled={batchName.disabled || assignbtn.reassign} ref={batchNameRef} defaultValue={batchName.val}></input>
                        </li>
                    :null}
                    {userAsgList.arr.length>0?
                        <li>
                            <label>Assigned to</label>
                            <select id='ct-assignedTo' onChange={(e)=>setUserAsgList({...userAsgList,value:e.target.value})} disabled={userAsgList.disabled || assignbtn.reassign} defaultValue={userAsgList.value} >
                                <option value={defaultVal}>Select User</option>
                                {userAsgList.arr.map((e)=>
                                    <option key={e._id} value={e._id}>{e.name}</option>
                                )}
                            </select>
                        </li>
                    :null}
                    {userRevList.arr.length>0?
                        <li>
                            <label>Reviewer</label>
                            <select id='ct-assignRevw' onChange={(e)=>setUserRevList({...userRevList,value:e.target.value})} disabled={assignbtn.reassign} defaultValue={userRevList.value}>
                                <option value={defaultVal}>Select Reviewer</option>
                                {userRevList.arr.map((e)=>
                                    <option key={e._id} value={e._id}>{e.name}</option>
                                )}
                            </select>                        
                        </li>
                    :null}
                    {startDate.show?
                        <li>
                            <label>Start Date</label>
                            <input id='ct-startDate' disabled={assignbtn.reassign} defaultValue={startDate.value}></input>
                        </li>
                    :null}
                    {endDate.show?
                        <li>
                            <label>End Date</label>
                            <input id='ct-endDate' disabled={assignbtn.reassign} defaultValue={endDate.value}></input>
                        </li>
                    :null}
                    {propagate.show?
                        <li>
                            <label>Propagate</label>
                            <input onChange={()=>setPropagate({show:true,val:!propagate.val})} type='checkbox'></input>
                        </li>
                    :null}
                    {complexity.show?
                        <li>
                            <label>Complexity</label>
                            <span>
                            <label>{complexity.val}</label>
                                <i className="fa fa-list" aria-hidden="true" onClick={()=>setShowcomplexity(true)}></i>
                            </span>
                        </li>
                    :null}
                    {showcomplexity && !assignbtn.reassign?<Complexity setComplexity={setComplexity} complexity={complexity} type={t} setShowcomplexity={setShowcomplexity}/>:null}
                </ul>
                <div>
                    <textarea ref={taskDetailsRef} placeholder={"Enter Task Details"} disabled={assignbtn.reassign} id='ct-assignDetails' ></textarea>
                </div>
                <div id='ct-submitTask'>
                    {(assignbtn.reassign)?
                    <span id='unassign-btn' onClick={()=>unAssign(true)} className={(assignbtn.disable)?'disableButton':''}>Reassign</span>:
                    <span id='unassign-btn' onClick={()=>unAssign(false)} className={(assignbtn.disable)?'disableButton':''}>Unassign</span>
                    }
                    <span onClick={addTask}>Ok</span>
                </div>
            </div>
        </ClickAwayListener>
        </Fragment>
    )
}

function addTask_11(pi, tObj, qid, cycleid,dNodes,nodeDisplay,cTask) {
    var validate = checkAndUpdate(dNodes[pi], []);
    var taskUndef = (dNodes[pi].task === undefined || dNodes[pi].task == null || (dNodes[pi].task != null && dNodes[pi].task.status== "complete"));
    var origTask = ([0, 4, 7, 9].indexOf(qid) != -1); // Orignal tasks not cascaded  
    var taskStatus;
    if(dNodes[pi].type=="screens" || dNodes[pi].type=="testcases")
    {
       if(dNodes[pi].task!=null && dNodes[pi].task.cycleid!=cycleid)
       {
           return;
       } 
    }
    if (validate[0]) {
        var taskflag = true;
        if (taskUndef) {
            nodeDisplay[pi].task=true;
            //d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        }
        // If task already exists then set it to true
        if (dNodes[pi].task) taskStatus = dNodes[pi].task.status;
        else taskStatus = 'assigned';
        if (qid == 9)
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 9,
                parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].parent.parent._id
            },taskUndef);
        else if (qid == 7)
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 7,
                parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].projectID
            },taskUndef);
        else if (qid == 8 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 8,
                parent: dNodes[pi].parent.parent._id,
                ctask: cTask
            },taskUndef);
        } else if (qid == 5 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 5,
                parent: dNodes[pi].projectID
            },taskUndef);
        } else if (qid == 6 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 6,
                parent: dNodes[pi].parent.parent._id
            },taskUndef);
        } else if (qid == 4) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 4,
                parent: (tObj.parent != null) ? tObj.parent : dNodes[pi].parent._id
            },taskUndef)
        } else if (qid == 3 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 3,
                parent: dNodes[pi].parent.parent._id
            },taskUndef);
        } else if (qid == 2 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 2,
                parent: dNodes[pi].projectID
            },taskUndef);
        } else if (qid == 1 && taskUndef) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 1,
                parent: dNodes[pi].parent._id
            },taskUndef);
        } else if (qid == 0) {
            dNodes[pi].task = updateTaskObject(tObj, {
                id: 0,
                parent: (tObj.parent != null) ? tObj.parent : ""
            },taskUndef);
        }
        if ((!taskUndef && !origTask) || origTask) {
            //update parent
            if (tObj.parent != validate[1]) {
                dNodes[pi].task['updatedParent'] = validate[1];
            }
        }
        if (!origTask) {
            dNodes[pi].task.complexity = undefined;
            dNodes[pi].task.details = '';
        }
        if(!origTask && taskUndef){
            dNodes[pi].task.details =  dNodes[pi].task.task + " " + dNodes[pi].type.substring(0,dNodes[pi].type.length-1) + " " + dNodes[pi].name;
        }                
        if(!taskUndef && !origTask){
            dNodes[pi].task.reviewer = tObj.rw;
            dNodes[pi].task.enddate = tObj.ed;
        }
        dNodes[pi].task.status = taskStatus;
      

        function replicateTask(pi) {
            var reuseDict = getReuseDetails(dNodes);
            //replicate task to reused node
            //extend creates new copy of object instead of taking reference
            //var tempTask = jQuery.extend(true, {}, dNodes[pi].task);
            var tempTask = {...dNodes[pi].task}
            if (reuseDict[pi].length > 0) {
                reuseDict[pi].forEach(function(e, i) {
                    if (dNodes[e]._id == null) return;
                    dNodes[e].task = tempTask;
                    dNodes[e].task.copied = true;
                    dNodes[e].task.copiedidx = pi;
                    nodeDisplay[e].task = true;
                    // d3.select('#ct-node-' + e).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('style', 'opacity:1').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
                });
            }
            dNodes[pi].task.copied = false;
        }

        replicateTask(pi);
    }
}


// update task 
function updateTaskObject(tObj, data,taskUndef) {

    var t = {
        taskvn: tObj.tvn,
        _id:null,
        batchName: tObj.bn,
        task: tObj.t,
        assignedto: tObj.at,
        assignedToName: tObj.atName,
        reviewer: tObj.rw,
        startdate: tObj.sd,
        enddate: tObj.ed,
        reestimation: tObj.reestimation,
        release: tObj.re,
        cycleid: tObj.cy,
        details: tObj.det,
        parent: data.parent,
        complexity: tObj.complexity != undefined ? tObj.complexity.toString() : undefined
    };
    if (!taskUndef) t._id = tObj._id != undefined ? tObj._id : null
    
    if (data.id == 0) return t;
    else delete t.batchName;
    if (data.id == 1) {
        t.task = "Execute Scenario";
    } else if (data.id == 2) {
        t.task = "Scrape";
    } else if (data.id == 3) {
        t.task = "Design";
    } else if (data.id == 5) {
        delete t.taskvn;
        t.task = "Scrape";
    } else if (data.id == 8) {
        t.task = data.ctask;
    } else if (data.id == 6) {
        t.task = "Design";
    }
    return t;
}

// ??
const checkAndUpdate = (nObj, parentlist) => {
    parentlist.unshift(nObj.id_c);
    if (nObj.id_c == "null") return [false, []];
    if (nObj.type == 'modules' || nObj.type == 'endtoend') {
        return [true, parentlist];
    }
    if (nObj.parent) {
        return checkAndUpdate(nObj.parent, parentlist);
    }
}

// creates task object based on inputs  
const initTaskObject = ({pi,dNodes,userAsgList,userRevList,batchNameRef,taskRef,startDate,endDate,taskDetailsRef,complexity,cycleid,releaseid,appType}) =>{
    var estimationCount = 0;
    if (dNodes[pi].task != undefined || dNodes[pi].task != null) {
        if (dNodes[pi].task.enddate != "" || dNodes[pi].task.enddate != undefined || dNodes[pi].task.enddate != " ") {
            var nodeDateSplit = dNodes[pi].task.enddate.split("/");
            var modDateSplit = endDate.value.split("/");
            if (new Date(nodeDateSplit[2], (nodeDateSplit[1] - 1), nodeDateSplit[0]) != new Date(modDateSplit[2], (modDateSplit[1] - 1), modDateSplit[0])) {
                estimationCount = parseInt(dNodes[pi].task.reestimation) + 1;
            }
        }
    }
    var tObj = {
        // tvn: tvn,
        t: taskRef.current.value,
        bn: batchNameRef.current ? batchNameRef.current.value: undefined,
        at: userAsgList.value,
        atName: d3.select('#ct-assignedTo').node().selectedOptions[0].text,
        rw: userRevList.value,
        sd: startDate.value,
        ed: endDate.value,
        reestimation: estimationCount,
        re: releaseid,
        cy: cycleid,
        app: appType,
        det: taskDetailsRef.current.value,  
        complexity:complexity.clist
    };
    if (dNodes[pi].task) {
        tObj._id = dNodes[pi].task._id;
        tObj.parent = dNodes[pi].task.parent;
    } else {
        tObj._id = null;
        tObj.parent = null;
    }
    return tObj;
}

//validate Task box values return boolean and adds error border
const assignBoxValidator = ({userInfo,userAsgList,userRevList,batchNameRef,startDate,endDate}) =>{
    var pass = true;
    d3.selectAll('#ct-assignTable .errorBorder').classed('errorBorder',false)
    var twf= userInfo.taskwflow; 
    if(twf){
        //check reviewer == assignee
        if(userAsgList.value==userRevList.value){
            d3.selectAll('#ct-assignRevw,#ct-assignedTo').classed('errorBorder',true)
            pass = false;
        }
    }
    if(!userAsgList.value || userAsgList.value == defaultVal){
        d3.select('#ct-assignedTo').classed('errorBorder',true);
        pass = false;
    }
    if(!userRevList.value || userRevList.value == defaultVal){
        d3.select('#ct-assignRevw').classed('errorBorder',true);
        pass = false;
    }
    if(batchNameRef.current && !batchNameRef.current.disabled && (batchNameRef.current.value == undefined || batchNameRef.current.value == "")){
        d3.select('#ct-batchName').classed('errorBorder',true);
        pass = false;
    }
    else if (startDate.value == "") {
        d3.select('#ct-startDate').classed('errorBorder',true);
        pass = false;
    } else if (endDate.value == "") {
        d3.select('#ct-endDate').classed('errorBorder',true);
        pass = false;
    }
    var ed = endDate.value.split('/');
    var sd = startDate.value.split('/');
    var start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
    var end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);
    if (end_date < start_date) {
        d3.select('#ct-endDate').classed('errorBorder',true);
        pass = false;
    }
    return pass
}

const setCoordinate = (p,t,ctScale) => {
    p.classed('node-highlight',!0)
    var split_char = ',';
    p.classed('node-highlight',!0)
    var c = d3.select('#ct-assignTable')
    var cSize = [270, 367];
    var s = d3.select("#mp__canvas_svg");
    var canvSize = [parseFloat(s.style("width")), parseFloat(s.style("height"))];
    if (t == 'modules' || t == 'endtoend') cSize = [270, 452];
    var l = p.attr('transform').slice(10, -1).split(split_char);
    l = [(parseFloat(l[0]) + 50) * ctScale.k + ctScale.x, (parseFloat(l[1]) - 20) * ctScale.k + ctScale.y];
    if (canvSize[0] - l[0] < cSize[0]) l[0] = l[0] - cSize[0] - 60 *  ctScale.k;
    if (canvSize[1] - l[1] < cSize[1]) {
        l[1] = canvSize[1] - cSize[1] - 40 *  ctScale.k;
    }
    //c.style('top', l[1] + 'px').style('left', l[0] + 'px');
    // if(l[1]<0){
    //     c.style('top', '0px').style('height', 'auto');
    // }
    if (l[1] < 0)l[1] = 0;
    else if (l[1] > canvSize[1] - cSize[1])l[1] = (canvSize[1] - cSize[1]) - 150;
    c.style('top', l[1] + 'px').style('left', l[0] + 'px').style('height', 'auto');
    d3.select('#ct-assignTable').classed('hide',false)
}

const removeTask = (pi,twf,userInfo,propagate,dNodes,nodeDisplay,cycleid,activeNode) => {
    var reuseDict = getReuseDetails(dNodes);
    //Fetching the config value for strictTaskWorkflow for the first time, hence the check
    if (twf !== false) twf= userInfo.taskwflow; 
    if((dNodes[pi].type=="screens" || dNodes[pi].type=="testcases") && dNodes[pi].task!=null && dNodes[pi].task.cycleid!=cycleid)return;
    task_unassignment(pi,twf,dNodes,nodeDisplay,cycleid,userInfo,propagate,activeNode);
    // if (reuseDict[pi].length > 0) {
    //     reuseDict[pi].forEach(count1.add, count1)
    // }
    // count1.forEach(function(ee,indx){
    //     var p = d3.select('#ct-node-' + indx);
    //     p.select('.ct-nodeTask').classed('no-disp', !0);
    //     count1.delete(indx);
    // });
    

}

const task_unassignment=(pi,twf,dNodes,nodeDisplay,cycleid,userInfo,propagate,activeNode)=>{
    if (twf && (dNodes[pi].type=="screens" || dNodes[pi].type=="testcases")){
        // $('#unassignmentConfirmationPopup').modal("show");
        return;
    } 
    var p = d3.select('#node_' + pi);
    //p.select('.ct-nodeTask').classed('no-disp', !0);
    if (dNodes[pi].task != null) {
        dNodes[pi].task.status = 'unassigned'; //status and assignedtoname are solely for notification
        if (dNodes[pi].task._id!=null)
        {
            if(reassignFlag){
                unassignTask = unassignTask.filter(i=>i!=dNodes[pi].task._id)
                nodeDisplay[pi].task=true;
            }else{
                unassignTask.push(dNodes[pi].task._id);
                nodeDisplay[pi].task=false;
            }
        }else{
            nodeDisplay[pi].task=false;
            dNodes[pi].task = null; //?? should we do it
        }
    }
    //d3.select('#ct-assignBox').classed('no-disp', !0); remove box
    var index = activeNode
    if (dNodes[pi].children && propagate && (index == pi || dNodes[index]._id==dNodes[pi].parent._id || dNodes[index].type == "modules")) {
        dNodes[pi].children.forEach(function(e, i) {
            removeTask(e.id,twf,userInfo,propagate,dNodes,nodeDisplay,cycleid,activeNode);
        });
    }
}

const getReuseDetails = (dNodes) => {
    // reuse details within the same module
    var dictTmp = {};
    dNodes.forEach((e, i) =>{
        dictTmp[i] = [];
        if (e.reuse) {
            dNodes.forEach((f, j) =>{
                if (e.type == f.type && e.type == 'screens' && e.name == f.name && i != j && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type == f.type && e.type == 'testcases' && e.name == f.name && i != j && e.parent && f.parent && e.parent.name == f.parent.name && f.reuse)
                    dictTmp[i].push(j);
                else if (e.type == f.type && e.type== 'scenarios' && e.name==f.name && i!=j && f.reuse)
                    dictTmp[i].push(j);
            })
        }
    })
    return dictTmp;
}

const taskAssign = {
    "endtoend": {
        "task": ["Execute", "Execute Batch"],
        "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation"]
    },
    "modules": {
        "task": ["Execute", "Execute Batch"],
        "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation", "pg"]
    },
    "scenarios": {
        "task": ["Execute Scenario"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"]
    },
    "screens": {
        "task": ["Scrape", "Append", "Compare", "Add", "Map"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"]
    },
    "testcases": {
        "task": ["Design", "Update"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "cx"]
    }
};
export default TaskBox;
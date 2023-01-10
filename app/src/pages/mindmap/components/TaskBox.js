/*eslint eqeqeq: "off"*/
import React, { Fragment, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import '../styles/TaskBox.scss';
import ClickAwayListener from 'react-click-away-listener';
import {populateUsers} from '../api';
import { useSelector } from 'react-redux';
import {ModalContainer, CalendarComp, Messages as MSG, VARIANT, setMsg} from '../../global';
import Complexity, {getComplexityLevel} from './Complexity';
import PropTypes from 'prop-types'
import Execute from '../../execute';

var unassignTask = []
var reassignFlag = false
const defaultVal = 'ct-default';

/*Component TaskBox
  use: returns TaskBox near module
  note: eslint eqeqeq: "off" added coz many places were logics were needed " == null"
*/
const TaskBox = (props) => {
    const taskRef = useRef()
    const batchNameRef = useRef()
    const taskDetailsRef =  useRef()
    const projectList = useSelector(state=>state.mindmap.projectList)
    const unassignList = useSelector(state=>state.mindmap.unassignTask)
    const userInfo = useSelector(state=>state.login.userinfo)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const [closeCal,setCloseCal] = useState(false)
    const [warning,setWarning]=useState(false)
    const [task,setTask] = useState({arr:[],initVal:undefined})
    const [batchName,setBatchName] = useState({show:false})
    const [userAsgList,setUserAsgList] = useState({loading:true,arr:[],value:undefined,disabled:true})
    const [userRevList,setUserRevList] = useState({loading:true,arr:[],value:undefined})
    const [startDate,setStartDate] = useState({show:false,value:undefined})
    const [endDate,setEndDate] = useState({show:false,value:undefined})
    const [propagate,setPropagate] = useState({show:false,val:false})
    const [complexity,setComplexity] = useState({show:false,clist:undefined,val:undefined})
    const [assignbtn,SetAssignbtn] = useState({disable:true,reassign:false})
    const [showcomplexity,setShowcomplexity] = useState(false)
    const appType = useSelector(state=>state.mindmap.appType);
    const cycleid = props.cycleid;
    const releaseid = props.releaseid;
    const setTaskBox = props.setTaskBox;
    const displayError = props.displayError
    var ctScale = props.ctScale;
    var dNodes = props.dNodes;
    var nodeDisplay = props.nodeDisplay
    var clickUnassign = props.clickUnassign
    var clickAddTask = props.clickAddTask
    var nid = props.nid;
    var p = d3.select('#'+nid);
    var pi = nid.split("_")[1]
    var t = p.attr('data-nodetype');
    useEffect(()=>{
        setCoordinate(p,t,ctScale)
        return ()=>{
            d3.select('#ct-assignTable').classed('hide',true)
            p.classed('node-highlight',false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[ctScale,nid,p,t])
    useEffect(()=>{
        if(dNodes[pi].parent && dNodes[pi].parent.type === 'endtoend'){
            setTaskBox(false)
            setMsg(MSG.MINDMAP.ERR_E2E_ASSIGN_SCENARIO)
            return;
        }
        if (t == 'screens' && (appType == "System" || appType == "Mainframe")) {
            setTaskBox(false)
            setMsg(MSG.CUSTOM('Task is disabled for '+appType +' screen',VARIANT.WARNING))
            return;
        }
        if (t != 'testcases' && (dNodes[pi]._children != null)) {
            setTaskBox(false)
            setMsg(MSG.MINDMAP.WARN_EXPAND_NOD)
            return;
        } 
        if (t != 'testcases' && (dNodes[pi].children == null)) {
            setTaskBox(false)
            setMsg(MSG.MINDMAP.ERR_INCOMPLETE_FLOW)
            return;
        }
        unassignTask = unassignList
        var nt = (dNodes[pi].task !== undefined || dNodes[pi].task != null) ? dNodes[pi].task : !1; 
        if(nt){
            if(unassignList.indexOf(dNodes[pi].task._id)!=-1){
                SetAssignbtn({disable:false,reassign:true})
            }else{
                SetAssignbtn({disable:false,reassign:false})
            }            
        }
        var current = new Date();
        var tObj = {
            t: 'Execute Batch',
            bn: (nt) ? nt.batchname : '',
            at: (nt) ? nt.assignedto : '',
            rw: (nt && nt.reviewer != null) ? nt.reviewer : '',
            sd: (nt) ? nt.startdate : `${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()}`,
            ed: (nt) ? nt.enddate : `${(current.getMonth()+1)%12 + 2}/${current.getDate()}/${current.getFullYear()}`,
            re: (nt && nt.release != null) ? nt.release : '',
            cy: (nt && nt.cycleid != null) ? nt.cycleid : '',
            ac: (nt) ? nt.accessibility_testing : 'Disable',
            det: (nt) ? nt.details : '',
            cx: (nt) ? nt.complexity : undefined,
            _id:(nt)? nt._id:null
        };
        var taskList = {...taskAssign[t]}
        if (tObj.t == null || tObj.t == "") {
            tObj.t = taskList.task[0];
        }
        if(t === 'scenarios' && appType === 'Web' ){
            switch(tObj.t){
                case taskList.task[0]:
                    tObj.ac = "Disable";
                    break;
                case taskList.task[1]:
                    tObj.ac = "Enable"
                    break;
                case taskList.task[2]:
                    tObj.ac = "Exclusive"
                    break;
                default:
                    tObj.ac = "Disable"
            }
        }else if(t === 'scenarios'){
            taskList.task = [taskList.task[0]]
        }
        if (tObj.det === null || tObj.det.trim() == "") {
            tObj.det = taskAssign[t].detail(0,dNodes[pi].name)
        }
        taskDetailsRef.current.value = tObj.det
        // populate task 
        var val = 'Execute Batch';
        setTask({arr:taskList.task,initVal:val,disabled:tObj.at?true:false})
        taskList.attributes.forEach(e => {
            switch(e){
                case 'bn':{
                    changeTask(val=='Execute Batch'?val:'Execute')
                    return;
                }
                case 'at':{
                    (async()=>{
                        var res = await populateUsers(selectedProj)
                        if(res.error){displayError(res.error);setTaskBox(false);return;}
                        var arr = [...res.rows].sort((a,b)=>a.name.localeCompare(b.name))
                        setUserAsgList({loading:false,arr:arr,value:tObj.at,disabled:tObj.at?true:false})
                        setUserRevList({loading:false,arr:arr,value:tObj.rw})
                    })()
                    return;
                }
                case 'rw':
                    return;
                case 'sd':
                    setStartDate({show:false,value:tObj.sd})
                    return;
                case 'ed':
                    setEndDate({show:false,value:tObj.ed})
                    return;
                case 'pg':
                    setPropagate({show:false,val:true})
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
            setUserAsgList({loading:true,arr:[],value:undefined,disabled:true})
            setUserRevList({loading:true,arr:[],value:undefined})
            setStartDate({show:false,value:undefined})
            setEndDate({show:false,value:undefined})
            setPropagate({show:false,val:false})
            setComplexity({show:false,clist:undefined,val:undefined})
            SetAssignbtn({disable:true,reassign:false})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const unAssign = (flag) => {
        if(assignbtn.disable)return;
        reassignFlag = flag; 
        var twf= userInfo.taskwflow;
        if (twf && (dNodes[pi].type=="screens" || dNodes[pi].type=="testcases") && !warning){
            setWarning(true)
            return;
        }
        setWarning(false)
        removeTask(pi,undefined,userInfo,propagate.val,dNodes,nodeDisplay,cycleid,pi)
        if(nodeDisplay){
            clickUnassign({nodeDisplay,unassignTask})
        }
    }
    const addTask = () => {
        if(!assignBoxValidator(propList))return;
        if(assignbtn.reassign){
            props.setTaskBox(false);
            return;
        }
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
            if (dNodes[pi].children && propagate.val) dNodes[pi].children.forEach(function(tSc){
                addTask_11(tSc.id, tObj, 1, cycleid, dNodes, nodeDisplay);
                if (tSc.children != undefined){
                    tSc.children.forEach(function(scr) {
                        if (appType != "System" && appType != "Mainframe") addTask_11(scr.id, tObj, 2, cycleid, dNodes, nodeDisplay);
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
                    if (appType != "System" && appType != "Mainframe") addTask_11(scr.id, tObj, 5, cycleid, dNodes, nodeDisplay);
                    scr.children.forEach(function(tCa) {
                        addTask_11(tCa.id, tObj, 6, cycleid, dNodes, nodeDisplay);
                    });
                });
            }
        } else if (t == "screens") {
            addTask_11(pi, tObj, 7, cycleid, dNodes, nodeDisplay);
            if (dNodes[pi].children && propagate.val) dNodes[pi].children.forEach(function(tCa) {
                var cTask = (tObj.t == "Scrape" || tObj.t == "Append" || tObj.t == "Compare") ? "Design" : "Debug";
                addTask_11(tCa.id, tObj, 8, cycleid, dNodes, nodeDisplay , cTask,);
            });
        } else if (t == "testcases") {
            addTask_11(pi, tObj, 9, cycleid, dNodes, nodeDisplay);
        }
        clickAddTask({dNodes,nodeDisplay})
    }
    const stopPropagate = (e) => {
        e.stopPropagation()
        if(e.nativeEvent){
            e.nativeEvent.stopImmediatePropagation()
        }
    }
    const stopCal = (e) => {
        if(e.target && !e.target.className.includes("rdt"))setCloseCal(true);
        if(e.target && e.target.id === 'task-ok')return;
        stopPropagate(e)   
    }
    return(
        <Fragment>
        {warning?<ModalContainer 
            title='Confirmation'
            close={()=>setWarning(false)}
            footer={<Footer unAssign={()=>unAssign(reassignFlag)} setWarning={setWarning} />}
            content={<Content/>} 
            modalClass='modal-sm'
        />:null}
        <ClickAwayListener onClickAway={()=>{props.setTaskBox(false)}}>
            <div onClick={stopCal} id='ct-assignTable' className='task-box__container hide'>
                <ul>
                    {((task.arr.length>0))?
                        <li style={{ display: 'none' }}>
                            <label data-test="taskLabel">Task</label>
                            <select onClick={stopPropagate} data-test="taskSelect" onChange={changeTask}  disabled={assignbtn.reassign || task.disabled}  defaultValue={task.initVal} ref={taskRef}>
                                {task.arr.map((e)=>
                                    <option key={e} value={e}>{e}</option>
                                )}
                            </select>
                        </li>
                    :null}
                    {(batchName.show)?
                        <li>
                            <label data-test="batchLabel">Batch Name</label>
                            <input data-test="batchInput" id='ct-batchName' disabled={batchName.disabled || assignbtn.reassign} ref={batchNameRef} defaultValue={batchName.val}></input>
                        </li>
                    :null}
                    <li>
                        <label data-test="assignedtoLabel">Assigned to</label>
                        {userAsgList.loading?
                        <select data-test="assignedselect1" key='select_1' disabled={true} value={defaultVal}><option value={defaultVal}>Loading...</option></select>
                        :<select  onClick={stopPropagate} data-test="assignedselect2" key='select_2' id='ct-assignedTo' onChange={(e)=>{setUserAsgList({...userAsgList,value:e.target.value})}} disabled={userAsgList.disabled || assignbtn.reassign} defaultValue={userAsgList.value} >
                            <option  value={defaultVal}>Select User</option>
                            {userAsgList.arr.map((e)=>
                                <option key={e._id} value={e._id}>{e.name}</option>
                            )}
                        </select>}
                    </li>
                    <li>
                        <label data-test="reviewLabel">Reviewer</label>
                        {userRevList.loading?
                        <select data-test="reviewSelect1" key='selectr_1' disabled={true} value={defaultVal}><option value={defaultVal}>Loading...</option></select>
                        :<select  onClick={stopPropagate} data-test="reviewSelect2" key='selectr_2'id='ct-assignRevw' onChange={(e)=>setUserRevList({...userRevList,value:e.target.value})} disabled={assignbtn.reassign} defaultValue={userRevList.value}>
                            <option value={defaultVal}>Select Reviewer</option>
                            {userRevList.arr.map((e)=>
                                <option key={e._id} value={e._id}>{e.name}</option>
                            )}
                        </select>   
                        }                     
                    </li>
                     {startDate.show?
                        <li data-test="startDate" id='ct-startDate'>
                            <label data-test="startDateLabel">Start Date</label>
                            <span onClick={stopPropagate} style={{width:'145px',display:'flex'}}>
                                <CalendarComp setCloseCal={setCloseCal} closeCal={closeCal} disabled={assignbtn.reassign} date={startDate.value} setDate={(val)=>setStartDate({show:true,value:val})}/>
                            </span>
                        </li>
                    :null}
                    {endDate.show?
                        <li data-test="endDate" id='ct-endDate'>
                            <label data-test="endDateLabel" >End Date</label>
                            <span onClick={stopPropagate} style={{width:'145px',display:'flex'}}>
                                <CalendarComp setCloseCal={setCloseCal} closeCal={closeCal} disabled={assignbtn.reassign} date={endDate.value} setDate={(val)=>setEndDate({show:true,value:val})}/>
                            </span>
                        </li>
                    :null}
                    {propagate.show?
                        <li>
                            <label data-test="propogateLabel">Propagate</label>
                            <input data-test="propogateInput" onChange={()=>setPropagate({show:true,val:!propagate.val})} type='checkbox'  ></input>
                        </li>
                    :null} 
                    {/* Hiding the Complexity component for every node type in mindmap */}
                    {/* {complexity.show?
                        <li>
                            <label data-test="complexityLabel" >Complexity</label>
                            <span data-test="complexity">
                            <label data-test="complexityValue" >{complexity.val}</label>
                                <i className="fa fa-list" aria-hidden="true" onClick={()=>setShowcomplexity(true)}></i>
                            </span>
                        </li>
                    :null}
                    {showcomplexity && !assignbtn.reassign?<Complexity setComplexity={setComplexity} complexity={complexity} type={t} setShowcomplexity={setShowcomplexity}/>:null} */}
                </ul>
                <div>
                    <textarea data-test="taskDetails" ref={taskDetailsRef} placeholder={"Enter Task Details"} disabled={assignbtn.reassign} id='ct-assignDetails' ></textarea>
                </div>
                <div id='ct-submitTask'>
                    {(assignbtn.reassign)?
                    <span data-test="reassign" id='unassign-btn' tabIndex={'0'}  onKeyPress={()=>unAssign(true)} onClick={()=>unAssign(true)} className={(assignbtn.disable)?'disableButton':''}>Reassign</span>:
                    <span data-test="unassign" id='unassign-btn' tabIndex={'0'}  onKeyPress={()=>unAssign(false)} onClick={()=>unAssign(false)} className={(assignbtn.disable)?'disableButton':''}>Unassign</span>
                    }
                    <span data-test="ok" id='task-ok' tabIndex={'0'} onClick={addTask} onKeyPress={addTask}>Ok</span>
                </div>
            </div>
        </ClickAwayListener>
        </Fragment>
    )
}

//content for moduleclick warning popup
const Content = () => (
    <p>Taskworkflow Strict mode enabled ! Unassigning Tasks of Screens and Tetscases will lead to failure of Execution. Do you wish to continue?</p>
)

//footer for moduleclick warning popup
const Footer = (props) => (
    <div className='toolbar__module-warning-footer'>
        <button className='btn-yes' onClick={props.unAssign}>Yes</button>
        <button onClick={()=>{props.setWarning(false)}}>No</button>
    </div>
)

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
        //var taskflag = true;
        // if (taskUndef && dNodes[pi].type == "scenarios") {
        //     switch(tObj.t){
        //         case "Execute Scenario Accessibility Only": 
        //             d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/ic-accessibility-enabled.png').attr('x', -14).attr('y', -10).attr('width', '21px').attr('height', '21px');
        //             break;
        //         case "Execute Scenario with Accessibility":
        //             d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/ic-accessibility-enabled.png').attr('x', -14).attr('y', -10).attr('width', '21px').attr('height', '21px');
        //             d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/ic-functional-enabled.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        //             break;
        //         default:
        //             d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/ic-functional-enabled.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        //             break;
        //     }
        // }else if(taskUndef){
        //     d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/ic-functional-enabled.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        // }
        if (taskUndef) {
            nodeDisplay[pi].task=true;
            //d3.select('#ct-node-' + pi).append('image').attr('class', 'ct-nodeTask').attr('xlink:href', 'imgs/node-task-assigned.png').attr('x', 29).attr('y', -10).attr('width', '21px').attr('height', '21px');
        }
        nodeDisplay[pi].ac=tObj.ac;
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
            dNodes[pi].task.details = taskAssign[dNodes[pi].type].detail(0,dNodes[pi].name)
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
            dNodes[pi].task.copied = false; // why ???
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
        accessibilityTesting: tObj.ac,
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
            var nodeDateSplit = dNodes[pi].task.enddate.split("-");
            var modDateSplit = endDate.value.split("-");
            if (new Date(nodeDateSplit[2], (nodeDateSplit[1] - 1), nodeDateSplit[0]) != new Date(modDateSplit[2], (modDateSplit[1] - 1), modDateSplit[0])) {
                estimationCount = parseInt(dNodes[pi].task.reestimation) + 1;
            }
        }
    }
    var accessibilityToggle = 'Disable';
    if  (taskRef.current.value == taskAssign.scenarios.task[1]) accessibilityToggle = "Enable"
    else if (taskRef.current.value == taskAssign.scenarios.task[2]) accessibilityToggle = "Exclusive"
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
        ac: accessibilityToggle,
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
const assignBoxValidator = ({userInfo,userAsgList,userRevList,batchNameRef,startDate,endDate, taskRef}) =>{
    
    if(batchNameRef.current && (batchNameRef.current.value == undefined || batchNameRef.current.value == "")){
        if(batchNameRef.current.value == '' && taskRef.current) {
            taskRef.current.value = 'Execute';
        }
    }
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
    if (startDate.value == "") {
        d3.select('#ct-startDate .fc-datePicker').classed('errorBorder',true);
        pass = false;
    }
    if (endDate.value == "") {
        d3.select('#ct-endDate .fc-datePicker').classed('errorBorder',true);
        pass = false;
    }
    var ed = endDate.value.split('-');
    var sd = startDate.value.split('-');
    // var start_date  = this.state.startD.getDate() + "/" + (this.state.startD.getMonth() + 1) + "/" + this.state.startD.getFullYear()
    var start_date = new Date(sd[2] + '-' + sd[1] + '-' + sd[0]);
    var end_date = new Date(ed[2] + '-' + ed[1] + '-' + ed[0]);
    if (end_date < start_date) {
        d3.select('#ct-endDate .fc-datePicker').classed('errorBorder',true);
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
    //Fetching the config value for strictTaskWorkflow for the first time, hence the check
    if (twf !== false) twf= userInfo.taskwflow; 
    if((dNodes[pi].type=="screens" || dNodes[pi].type=="testcases") && dNodes[pi].task!=null && dNodes[pi].task.cycleid!=cycleid)return;
    task_unassignment(pi,twf,dNodes,nodeDisplay,cycleid,userInfo,propagate,activeNode);
    var reuseDict = getReuseDetails(dNodes);
    if (reuseDict[pi].length > 0) {
        reuseDict[pi].forEach(function(e, i) {
            if (dNodes[e]._id == null) return;
            if(reassignFlag){
                nodeDisplay[e].task = true;
            }else{
                nodeDisplay[e].task = false;
            }
        });
    }
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
        "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation"],
        "detail": (i,node)=>taskAssign.endtoend.task[i] +" end to end "+node
    },
    "modules": {
        "task": ["Execute", "Execute Batch"],
        "attributes": ["bn", "at", "rw", "sd", "ed", "reestimation", "pg"],
        "detail": (i,node)=>taskAssign.modules.task[i] +" module "+node
    },
    "scenarios": {
        "task": ["Execute Scenario","Execute Scenario with Accessibility", "Execute Scenario Accessibility Only"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"],
        "detail": (i,node)=>"Execute scenario "+node +" "+taskAssign.scenarios.task[i].split("Execute Scenario")[1]
    },
    "screens": {
        // "task": ["Scrape", "Append", "Compare", "Add", "Map"],
        "task": ["Scrape"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "pg", "cx"],
        "detail": (i,node)=>taskAssign.screens.task[i]+" screen "+node
    },
    "testcases": {
        // "task": ["Design", "Update"],
        "task": ["Design"],
        "attributes": ["at", "rw", "sd", "ed", "reestimation", "cx"],
        "detail": (i,node)=>taskAssign.testcases.task[i]+" testcase "+node
    }
};
TaskBox.propTypes={
    clickUnassign:PropTypes.func ,
    nodeDisplay: PropTypes.object,
    releaseid: PropTypes.string,
    cycleid: PropTypes.string,
    ctScale:PropTypes.object ,
    nid:PropTypes.string,
    dNodes:PropTypes.array,
    setTaskBox:PropTypes.func ,
    clickAddTask:PropTypes.func ,
    displayError:PropTypes.func 
}
export default TaskBox;
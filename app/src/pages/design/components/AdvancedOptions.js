import React, { useState, useEffect } from 'react';
import {getNotificationRules} from '../mindmap/api';
import {getUserDetails,getNotificationGroups} from '../../admin/api';
import ReactTooltip from 'react-tooltip';
import '../styles/AdvancedOptions.scss'
import { Messages as MSG, ScrollBar, ModalContainer, setMsg } from '../../global';
import { updateNotificationConfiguration, getNotificationConfiguration } from '../mindmap/api';
import ComboBox from './ComboBox';
import { exec } from 'child_process';

/*Component AdvancedOption
  use: renders Advanced Option button below canvas on click trigers advance option popup box
*/

const AdvancedOptions = (props) => {
    const executionScreen = props.executionScreen
    const inputOptions = props.dNodes?[...props.dNodes]:[]
    const mindmapid = executionScreen?props.mindmapid:(props.dNodes && props.dNodes[0]?props.dNodes[0]._id:"")
    const priority = props.priority
    const setBlockui = props.setBlockui
    const displayError = props.displayError
    const setShowAdvOption = props.setShowAdvOption
    const scenarioExec = props.scenarioExec
    const scenarioid = props.scenarioid
    const [modal,setModal] = useState(false)
    const [error,setError] = useState([])
    const [rules,setRules] = useState([])
    const [allUsers,setAllUsers] = useState([])
    const [groupList,setGroupList] = useState([])
    const [oldRules,setOldRules] = useState([])
    const [deleteRules, setDeleteRules] = useState([])
    const [updateRules, setUpdateRules] = useState({})
    const [newRules, setNewRules] = useState([]);
    const prop ={scenarioid,scenarioExec,setShowAdvOption,priority,error,setError,updateRules,setUpdateRules,deleteRules,setDeleteRules,mindmapid,newRules,setNewRules,oldRules,setOldRules,setModal,rules,setRules,inputOptions,groupList,setGroupList,allUsers,setAllUsers,executionScreen,displayError,setBlockui}
    
    useEffect(()=>{
        if(executionScreen){
            clickAdvancedOption();
            setNewRules([{ruleType: "", inputType: "", groupids:[], additionalrecepients:[] }])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[executionScreen])

    const clickAdvancedOption = ()=>{
        setModal(true);
        resetData(prop);
        fetchData(prop)
    }

    return(
        <>
        {modal && AdvancedOptionPopup(prop)}
        {!executionScreen && <svg onClick={()=>{ clickAdvancedOption()}} className="ct-advancedOptionBtn" id="ct-advanceOption">
            <g id="ct-advanceOptionAction" className="ct-actionButton">
                <rect x="0" y="0" rx="12" ry="12" width="165px" height="25px"></rect>
                <text x="23" y="18">Advanced Option</text>
            </g>
        </svg>}
        </>
    )
}

export const AdvancedOptionPopup = (prop) => {

    const closeModal = () => {
        prop.setModal(false);
        if(prop.setShowAdvOption!==undefined) prop.setShowAdvOption(false)
    }
    return(
        <div className={"AdvOptn__container"+(prop.executionScreen?" AdvOptn__container-exe":"")}>
            <ModalContainer
                title={"Advanced Options"}
                content={MiddleContent(prop)}
                close={()=>{closeModal()}}
                footer={
                <>
                    {prop.executionScreen && <button onClick={()=>{clearRules(prop);}}>Reset</button>}
                    <button onClick={()=>{applyRules(prop);}}>{prop.executionScreen?"Save":"Apply"}</button>
                </>}
            />
        </div>
    )
} 

const clearRules = ({setError,setOldRules,oldRules,deleteRules,setNewRules,setUpdateRules,setDeleteRules}) => {
    for (const [key, value] of Object.entries(oldRules)) {
        let delRules = [...deleteRules];setUpdateRules({});
        delRules.push(value.ruleid);
        setDeleteRules(delRules);
    }   
    setUpdateRules({})        
    setOldRules([]);
    setNewRules([{ruleType: "", inputType: "", groupids:[], additionalrecepients:[] }])
    setError([])
}

const applyRules = async ({oldRules,scenarioid,scenarioExec,executionScreen,inputOptions,setShowAdvOption,priority,setModal,setError,deleteRules,updateRules,newRules,mindmapid,displayError}) => {
    let errorData = [];
    let newRuleObj = {};
    let updateRuleObj = {};
    let stop = false;
    for (const [key, value] of Object.entries(updateRules)) {
        var obj;
        stop = checkError(errorData,value,key,executionScreen);
        if (executionScreen) obj = formExecutionRule(value,scenarioid,scenarioExec)
        else if(!executionScreen) obj = formRule(value)
        updateRuleObj[key] = obj;
    }
    newRules.forEach((rule,i)=>{
        var obj;
        stop = checkError(errorData,rule,i,executionScreen);
        if (executionScreen) obj = formExecutionRule(rule,scenarioid,scenarioExec)
        else if(!executionScreen) obj = formRule(rule)
        newRuleObj[`rule-${i}`] = obj;
    })
    if(executionScreen && oldRules.length===0 && newRules.length===1 && newRules[0].ruleType==="" && newRules[0].inputType==="" && (newRules[0].groupids).length===0 && (newRules[0].additionalrecepients).length===0 ) stop=false;
    if(stop){
        setError(errorData)
        return;
    } 
    const taskData = executionScreen?[]: formTaskData(oldRules,newRules,deleteRules,inputOptions);
    const payload ={
		"priority":priority,
        "mindmapid": mindmapid,
		"taskdata": taskData,
		"newrules": newRuleObj,
		"updatedrules": updateRuleObj,
		"deletedrules": deleteRules
	}

    const data = await updateNotificationConfiguration(payload);
    if(data.error){displayError(data.error);return;}
    else if ( data === "success") setMsg(MSG.MINDMAP.SUCC_RULES_UPDATE);
    setModal(false);
    if(setShowAdvOption!==undefined) setShowAdvOption(false)
}

const MiddleContent = ({executionScreen,setError,error,updateRules,setUpdateRules,setDeleteRules,deleteRules,rules,inputOptions,newRules,oldRules,setOldRules,setNewRules,allUsers,groupList}) => {

    const newField = () => {
        let updatedNewRules = [...newRules];
        updatedNewRules.push({ruleType: "", inputType: "", groupids:[], additionalrecepients:[] });
        if(document.getElementById(`newRule-${newRules.length-1}`)) document.getElementById(`newRule-${newRules.length-1}`).selectedIndex = "0"; 
        setNewRules(updatedNewRules);
    }
    const deleteNewField = index => {
        let updatedNewRules = [...newRules];
        updatedNewRules.splice(index, 1);
        setNewRules(updatedNewRules);
        setError([])
    }
    const onChangeSubmit = (event, index , arg) =>{
        let updatedNewRules = [...newRules];
        if(arg==="ruleType") updatedNewRules[index][arg] = event.target.value;
        else updatedNewRules[index][arg] = {_id:event.target.options[event.target.selectedIndex].id,value:event.target.value};
        setNewRules(updatedNewRules);
    }
    const deleteRule = (index,id) => {
        let updatedOldRules = [...oldRules];
        updatedOldRules.splice(index, 1);
        setOldRules(updatedOldRules);
        setDeleteRules([...deleteRules,id])
        setError([])
    }
    const onChangeSubmitOldRule = (event, index , arg, ruleid) =>{
        let updatedOldRules = [...oldRules];
        if(arg==="ruleType") updatedOldRules[index][arg] = event.target.value;
        else updatedOldRules[index][arg] = {_id:event.target.options[event.target.selectedIndex].id,value:event.target.value};
        setOldRules(updatedOldRules);

        let updateRulesData= {...updateRules};
        if(updateRulesData[ruleid]===undefined) updateRulesData[ruleid] = {};
        updateRulesData[ruleid] = updatedOldRules[index];
        setUpdateRules(updateRulesData);
    }

    const updateError = (errorId,event) => {
        let err = [...error];
        if(event.target.value!==""){
            const index = err.indexOf(errorId);
            if (index > -1)  err.splice(index, 1); 
            setError(err);
        }
    }

    const updateErrorBorder = (ruleData,errId) => {
        let err = [...error];
        if((ruleData.additionalrecepients).length>0 || (ruleData.groupids).length>0){
            const index = err.indexOf(errId);
            if (index > -1)  err.splice(index, 1); 
            setError(err);
        }
    }
    
    return(
        <>
            
            <div className="advOptn__modal_content" id="advOptn__ModalListId">
                <ScrollBar scrollId="advOptn__ModalListId" thumbColor="#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    {!executionScreen &&
                        <div className="advOption_addRule">
                            <span onClick={()=>{newField()}} id="addRule" title="Add Rule" ><img src={"static/imgs/ic-add-sm.png"} alt="Add Rule" />Add Rule</span>
                        </div>
                    }
                    { oldRules.map((object, index) => 
                        <div className="advOptn_item" key={index}>
                            <select key={`ruletype-${object.ruleid}`} className={"advOptn__selectRule"+(error.includes(`ruletype-${object.ruleid}`)? " advOption__error_field" : "")} value={object.ruleType} onChange={(e)=>{onChangeSubmitOldRule(e, index,"ruleType", object.ruleid);updateError(`ruletype-${object.ruleid}`,e)}}>
                                <option value="">Select Rule</option>
                                { rules.map((ruleType, i) =>
                                    <option key={i} value={ruleType.actionid} >
                                        {ruleType.action}
                                    </option>
                                ) }
                            </select>
                            {!executionScreen &&
                            <select key={`inp-${object.ruleid}`} className={"advOptn__selectInput"+(error.includes(`inp-${object.ruleid}`)? " advOption__error_field" : "")} value={object.inputType.value} onChange={(e)=>{updateError(`inp-${object.ruleid}`,e);onChangeSubmitOldRule(e, index,"inputType", object.ruleid)}}>
                                <option value="">Select Input</option>
                                { defaultInputOptions.map((inpOptn, i) =>
                                    <option key={`${inpOptn._id}-${i}`} id={`${inpOptn._id}-${i}`} value={inpOptn.name}>
                                        {inpOptn.name}
                                    </option>
                                ) }
                                { inputOptions.map((inpOptn, i) =>
                                    <option key={`newRule-${i}`} id={`new-${inpOptn.type}-${i}`} value={`new-${inpOptn._id}`} title={setInputPrefix(inpOptn.type)+inpOptn.name}>
                                        {setInputPrefix(inpOptn.type)}{inpOptn.name}
                                    </option>
                                ) }
                            </select>}
                            <div className="advOptn__selectRecipient">
                            <ComboBox updateErrorBorder={updateErrorBorder} errId={`addrec-${object.ruleid}`} errorBorder={error.includes(`addrec-${object.ruleid}`)?true:false} ruleid={object.ruleid} updateRules={updateRules} setUpdateRules={setUpdateRules} index={index} rules={oldRules} setRules={setOldRules} groupList={groupList} allUsers={allUsers}/>        
                            </div>
                                {!executionScreen && <button className="rule_btn" onClick={()=>deleteRule(index,object.ruleid)} ><img alt="delete-ic" src="static/imgs/ic-delete.png" /></button> }
                            <button data-for={`old-tooltip-${index}`} data-tip={info(object.ruleType===""?0:object.ruleType,rules)} title={info(object.ruleType===""?0:object.ruleType,rules)} className="rule_btn fa fa-info-circle" ></button>
                            <ReactTooltip id={`old-tooltip-${index}`} effect="solid" backgroundColor="black" getContent={[() => { return info(object.ruleType===""?0:object.ruleType,rules) },0]} />
                        </div>
                    ) }
                    { newRules.map((object, index) => 
                        <div className="advOptn_item" key={index}>
                            <select key={`ruletype-${index}`} className={"advOptn__selectRule"+(error.includes(`ruletype-${index}`)? " advOption__error_field" : "")} value={object.ruleType} onChange={(e)=>{onChangeSubmit(e, index,"ruleType");updateError(`ruletype-${index}`,e);}}>
                                <option value="">Select Rule</option>
                                { rules.map((ruleType, i) =>
                                    <option key={i} value={ruleType.actionid}>
                                        {ruleType.action}
                                    </option>
                                ) }
                            </select>
                            {!executionScreen &&
                            <select key={`inp-${index}`} className={"advOptn__selectInput"+(error.includes(`inp-${index}`)? " advOption__error_field" : "")} value={object.inputType.value} onChange={(e)=>{onChangeSubmit(e, index,"inputType");updateError(`inp-${index}`,e)}}>
                                <option value="">Select Input</option>
                                { defaultInputOptions.map((inpOptn, i) =>
                                    <option key={`${inpOptn._id}-${i}`} id={`${inpOptn._id}-${i}`} value={inpOptn.name}>
                                        {inpOptn.name}
                                    </option>
                                ) }
                                { inputOptions.map((inpOptn, i) =>
                                    <option key={`newRule-${i}`} id={`new-${inpOptn.type}-${i}`} value={`new-${inpOptn._id}`} title={setInputPrefix(inpOptn.type)+inpOptn.name}>
                                    {setInputPrefix(inpOptn.type)}{inpOptn.name}
                                    </option>
                                ) }
                            </select>}
                            <div className="advOptn__selectRecipient">
                            <ComboBox updateErrorBorder={updateErrorBorder} errId={`addrec-${index}`} errorBorder={error.includes(`addrec-${index}`)?true:false} index={index} rules={newRules} setRules={setNewRules} groupList={groupList} allUsers={allUsers}/>        
                            </div>
                            {!executionScreen && <button className="rule_btn" onClick={()=>deleteNewField(index)} ><img alt="delete-ic" src="static/imgs/ic-delete.png" /></button>}
                            <button data-for={`new-tooltip-${index}`} data-tip={info(object.ruleType===""?0:object.ruleType,rules)} title={info(object.ruleType===""?0:object.ruleType,rules)} className="rule_btn fa fa-info-circle" ></button>
                            <ReactTooltip id={`new-tooltip-${index}`} effect="solid" backgroundColor="black" getContent={[() => { return info(object.ruleType===""?0:object.ruleType,rules) },0]} />
                        </div>
                    ) }
                </ScrollBar>
            </div>
        </>
    )
}

const setInputPrefix = (type) => {
    switch(type) {
        case "scenarios" : return "Scenario ";
        case "modules" : return "Module "
        case "screens" : return "Screen "
        case "testcases" : return "Testcase "
        default : return ""
    }
}

const info = (ruletype,rules) => {
    if(ruletype===0) return "Select New Rule"
    for(let i=0 ; i<rules.length;i++){
        if(rules[i].actionid === ruletype) return rules[i].description 
    }
}

const fetchData = async ({priority,setNewRules,executionScreen,scenarioExec,setOldRules,setRules,setGroupList,setAllUsers,displayError,setBlockui,mindmapid}) => {
    setBlockui("Loading ...")
    //fetch all Notification Rules
    let data  = await getNotificationRules();
    if(data.error){displayError(data.error);return;}
    if(executionScreen){
        data = [{actionid:"5","description": "Notification group will be notified when execution of test suite is completed",action:"notify on execution completion"}]
    }
    setRules(data)
    setBlockui(false);

    //fetch all Users
    setBlockui("Loading ...")
    data = await getUserDetails("user");
    if(data.error){displayError(data.error);return;}
    var userOptions = [];
    for(var i=0; i<data.length; i++){
        if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
    }
    setAllUsers(userOptions.sort()); 
    setBlockui(false);

    //fetch all Notification group
    setBlockui("Loading ...")
    data = await getNotificationGroups({'groupids':[],'groupnames':[]});
    if(data.error){
        if(data.val === 'empty'){
            displayError(data.error);
            data = {};
        }else{
            displayError(data.error);
            return true;
        }
    }
    setGroupList(data.sort())
    setBlockui(false);

    
    //fetch all old defined rules
    setBlockui("Loading ...")
    data = await getNotificationConfiguration({fetchby:"mindmapid", id:mindmapid, priority:priority})
    if(data.error){displayError(data.error);return;}
    if(executionScreen && data.length!==0 ) setNewRules([])
    let preDefinedRules = [];
    setBlockui(false);
    
    data.forEach((rule)=>{
        if(executionScreen && scenarioExec==="True" && rule.targetnode!=="scenarios") return

        let obj = {};
        let groupids = [];
        let additionalrecepients = [];
        let inputType = {};
        
        rule.groupinfo.forEach((group)=>{groupids.push(group._id)});
        rule.additionalrecepients.forEach((addRec)=>{additionalrecepients.push(addRec._id)});

        if(rule.targetnode==="all" && rule.actionon===0 && rule.targetnodeid===0){
            inputType["_id"]="all_nodes";
            inputType["value"]="All Nodes";
        } else if(rule.targetnode==="modules" && rule.actionon==="all" && rule.targetnodeid===0){
            inputType["_id"]="All Modules";
            inputType["value"]=`new-${mindmapid}`;
        } 
        
        else if(rule.actionon==="all" && rule.targetnodeid===0){
            if(rule.targetnode==="scenarios") {inputType["value"]="All Scenarios";inputType["_id"]="all_scenarios";}
            else if(rule.targetnode==="screens"){inputType["value"]="All Screens";inputType["_id"]="all_screens";}
            else if(rule.targetnode==="testcases"){inputType["value"]="All Testcases";inputType["_id"]="all_testcases";}
        } else if(rule.actionon==="specific"){
            if(rule.targetnode==="scenarios") inputType["_id"]="new-scenarios"; 
            else if(rule.targetnode==="screens") inputType["_id"]="new-screens"; 
            else if(rule.targetnode==="testcases")inputType["_id"]="new-testcases"; 
            inputType["value"]=`new-${rule.targetnodeid}`;
        }
        obj.inputType=inputType;
        obj.groupids=groupids;
        obj.additionalrecepients=additionalrecepients;
        obj.ruleType=rule.actionid;
        obj.ruleid=rule._id;
        preDefinedRules.push(obj)
    })
    setOldRules(preDefinedRules);
    setBlockui(false);
    return false;
}

const resetData = ({setError,setOldRules,setRules,setGroupList,setAllUsers,setNewRules,setUpdateRules,setDeleteRules}) => {
    setOldRules([])
    setRules([])
    setGroupList([])
    setAllUsers([])
    setNewRules([])
    setUpdateRules({})
    setDeleteRules([])
    setError([])
}

const checkError = (errorData,rule,id,executionScreen) => {
    let err = errorData
    if(rule.ruleType==="" && !err.includes(`ruletype-${id}`)) err.push(`ruletype-${id}`); 
    if (executionScreen!==true && rule.inputType==="" || (rule.inputType._id==="" && rule.inputType.value==="")) if(!err.includes(`inp-${id}`))err.push(`inp-${id}`); 
    if (rule.groupids.length===0 && rule.additionalrecepients.length===0 && !err.includes(`addrec-${id}`) ) err.push(`addrec-${id}`); 
    if(err.length===0) return false
    else return true 
}

const formExecutionRule = (rule,scenarioid,scenarioExec) => {
    let obj = {};
    obj.groupids=rule.groupids;
    obj.additionalrecepients=rule.additionalrecepients;
    obj.actiontype=rule.ruleType;
    if(scenarioid!=="" && scenarioExec==="True") {
        obj.targetnode= "scenarios";
        obj.actionon= "specific";
        obj.targetnodeid= scenarioid;
    } else if (scenarioExec!=="True") {
        obj.targetnode= "modules";
        obj.actionon= "all";
        obj.targetnodeid= null;
    }
    return obj
}

const formTaskData = (oldRules,newRules,deleteRules,inputOptions) => {
    let taskData = {}; 
    const insertRule = (rule) => {
        if(deleteRules.includes(rule.ruleid)) return
        var obj = formRule(rule)
        //For all assigned node add ruleids
        if(obj.targetnodeid!==null) {
            for(let i =0 ; i< inputOptions.length ; i++) {
                if(inputOptions[i]._id === obj.targetnodeid) {
                    if(inputOptions[i].task!==null){
                        pushTaskData(inputOptions[i].task._id, rule.ruleid)
                    }
                    break;
                }
            }
            
        } else if (obj.targetnode==="all" && obj.targetnodeid===null && obj.actionon===null ) {
            for(let i =0 ; i< inputOptions.length ; i++) {
                if(inputOptions[i].task !== null) pushTaskData(inputOptions[i].task._id, rule.ruleid)
            }
        } else if (obj.targetnode==="modules" && obj.targetnodeid===null && obj.actionon==="all") {
            if(inputOptions[0].task !== null && taskData[inputOptions[0].task._id]===undefined) {
                pushTaskData(inputOptions[0].task._id, rule.ruleid)
            }    
        } 
        
        else {
            ["scenarios","screens","testcases"].map((nodeType)=>{
                if ((obj.targetnode===nodeType) && obj.targetnodeid===null && obj.actionon==="all") {
                    for(let i =0 ; i< inputOptions.length ; i++) {
                        if(inputOptions[i].task !== null && inputOptions[i].type === nodeType){
                            pushTaskData(inputOptions[i].task._id, rule.ruleid)
                        }
                    }
                } 
            })
        }
    }

    const pushTaskData = (nodeTaskId,ruleID) => {
        if(taskData[nodeTaskId]===undefined) taskData[nodeTaskId] = [ruleID];
        else taskData[nodeTaskId].push(ruleID)
    }

    [...newRules].forEach((rule,i)=>{
        rule.ruleid=`rule-${i}`;
        insertRule(rule)
    });

    [...oldRules].forEach((rule)=>{
        insertRule(rule)
    })
    
    //create empty ruledict if no rule created 
    for(let i =0 ; i< inputOptions.length ; i++) {
        if(inputOptions[i].task !== null) {
            if(taskData[inputOptions[i].task._id]===undefined) taskData[inputOptions[i]._id] = [];
        }
    }
    return taskData;
}

const formRule = (rule) => {
    if(rule.inputType==="" || rule.ruleType==="") return
    let obj = {};
    obj.groupids=rule.groupids;
    obj.additionalrecepients=rule.additionalrecepients;
    obj.actiontype=rule.ruleType;
    if(rule.inputType.value.slice(0,4) === "new-"){
        //if input type is "scenarios" / "testcases" / "screens"
        if(rule.inputType._id.slice(0,13)==="new-scenarios") obj.targetnode= "scenarios"
        else if(rule.inputType._id.slice(0,11)==="new-screens") obj.targetnode= "screens"
        else if(rule.inputType._id.slice(0,13)==="new-testcases") obj.targetnode= "testcases"
        obj.actionon= "specific";
        obj.targetnodeid= rule.inputType.value.slice(4);
        //if input type is module
        if(rule.inputType._id.slice(0,11)==="new-modules"){
            obj.targetnode= "modules";
            obj.actionon= "all";
            obj.targetnodeid= null;
        }
    } else {
        if(rule.inputType._id.slice(0,9)==="all_nodes"){
            obj.targetnode= "all";
            obj.actionon= null;
            obj.targetnodeid= null;
        } else if(rule.inputType._id.slice(0,13)==="all_scenarios"){
            obj.targetnode= "scenarios";
            obj.actionon= "all";
            obj.targetnodeid= null;
        } else if(rule.inputType._id.slice(0,11)==="all_screens"){
            obj.targetnode= "screens";
            obj.actionon= "all";
            obj.targetnodeid= null;
        } else if(rule.inputType._id.slice(0,13)==="all_testCases"){
            obj.targetnode= "testcases";
            obj.actionon= "all";
            obj.targetnodeid= null;
        }
    }
    return obj
}

const defaultInputOptions = [
    {_id:"all_nodes",name:"All Nodes"},
    {_id:"all_scenarios",name:"All Scenarios"},
    {_id:"all_screens",name:"All Screens"},
    {_id:"all_testCases",name:"All Testcases"}
]


export default AdvancedOptions
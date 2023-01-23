import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {saveMindmap,getModules,getScreens} from '../api';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import '../styles/SaveMapButton.scss'
import { VARIANT, Messages as MSG, setMsg } from '../../global';

/*Component SaveMapButton
  use: renders save button below canvas on click trigers save node
  for assingn send isAssign={true}
  for end send isEnE={true}
  props.createnew is to auto save imported mindmap
*/

const SaveMapButton = (props) => {
    const dispatch = useDispatch()
    const deletedNodes = useSelector(state=>state.mindmap.deletedNodes)
    const unassignTask = useSelector(state=>state.mindmap.unassignTask)
    const projId = useSelector(state=>state.mindmap.selectedProj)
    const initEnEProj = useSelector(state=>state.mindmap.initEnEProj)
    const projectList = useSelector(state=>state.mindmap.projectList)
    const moduledata = useSelector(state=>state.mindmap.moduleList)
    const verticalLayout= props.verticalLayout
    useEffect(()=>{
        if(props.createnew==='save'||props.createnew==='autosave')clickSave()      
          // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.createnew])
    const clickSave = ()=>{
        saveNode(props.setBlockui,props.dNodes,projId,props.cycId,deletedNodes,unassignTask,dispatch,props.isEnE,props.isAssign,projectList,initEnEProj? initEnEProj.proj:initEnEProj,moduledata,verticalLayout,props.setDelSnrWarnPop,props.createnew)
    }
    return(
        <svg data-test="saveSVG" className={"ct-actionBox"+(props.disabled?" disableButton":"")} id="ct-save" onClick={clickSave}>
            <g id="ct-saveAction" className="ct-actionButton">
                <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                <text x="23" y="18">Save</text>
            </g>
        </svg>
    )
}

//mindmap save funtion
const saveNode = async(setBlockui,dNodes,projId,cycId,deletedNodes,unassignTask,dispatch,isEnE,isAssign,projectList,initEnEProj,moduledata,verticalLayout,setDelSnrWarnPop,createnew)=>{
    var tab = "endToend"
    var selectedProject;
    var error = !1
    var mapData = []
    var flag = 10 
    var temp_data = [];
    var counter = {};
    var displayError = (error) => {
        setBlockui({show:false});
        setMsg(MSG.CUSTOM(((error)?( error.CONTENT || error ):MSG.MINDMAP.ERR_SAVE.CONTENT),error.VARIANT || VARIANT.ERROR))
        return;
    }
    d3.select('#pasteImg').classed('active-map',false)
    d3.select('#copyImg').classed('active-map',false)
    d3.selectAll('.ct-node').classed('node-selected',false)   
    if (d3.select('#ct-save').classed('disableButton')) return;
    var namelist = dNodes.map((e)=>{
        if(e._id && e.type === 'screens' && e.state !== "deleted")return e.name;
        return undefined;
    })
    var duplicateNode = dNodes.every((e,i)=>{
        if(e._id && e.type === 'screens' && e.state!== "deleted"){
            return namelist.indexOf(e.name) === i || dNodes[namelist.indexOf(e.name)]._id === e._id
        } return true;
    })
    if(!duplicateNode){
        setMsg(MSG.MINDMAP.WARN_DUPLICATE_SCREEN_NAME)
        return;
    }
    setBlockui({show:true,content:'Saving flow! Please wait...'})
    dNodes.forEach((e, i)=>{
        if (i === 0) return;
        temp_data[i] = {
            idx: i,
            x: e.x,
            y: e.y,
            type: e.type
        };
    });
    if (verticalLayout) {
        temp_data.sort((a, b)=>a.x - b.x);
    } else {
        temp_data.sort((a, b)=>a.y - b.y);
    }
    temp_data.forEach((e)=>{
        // var key_1=undefined;
        if(dNodes[e.idx].parent === null) return;
        var key_1= dNodes[e.idx].parent.id;
        var key=e.type+'_'+key_1;
        if(counter[key] === undefined)  counter[key]=1;
        if (dNodes[e.idx].childIndex !== counter[key]) {
            dNodes[e.idx].childIndex = counter[key];
            dNodes[e.idx].cidxch = 'true'; // child index updated
        }
        counter[key] = counter[key] + 1;
    })
    treeIterator(mapData, dNodes[0], error);
    var data = {
        write: flag,
        map: mapData,
        deletednode: deletedNodes,
        unassignTask: [],
        prjId: projId,
        cycId:cycId,
        createdthrough: "Web"
    }
    if(isEnE){
        tab = "endToend"
        data.action = '/saveEndtoEndData'
        mapData.some((d)=>{
            if (d.type === 'endtoend') {
                selectedProject = d.projectID;
                return true;
            }
            return false;
        });
        if (selectedProject && selectedProject !== projId) {
            displayError({VARIANT:VARIANT.WARNING, CONTENT:"Module belongs to project: " +projectList[selectedProject].name+". Please go back to the same project and Save"});
            return;
        }
        if(!selectedProject && initEnEProj !== projId){
            displayError({VARIANT:VARIANT.WARNING, CONTENT:"Module belongs to project: " +projectList[initEnEProj].name+". Please go back to the same project and Save"});
            return;
        }
    }
    if(isAssign){
        tab = "tabAssign"
        // if (dNodes[0].type == 'endtoend') {
        //     cur_module = 'end_to_end';
        //     error = false;
        // } else {
        //     //Part of Issue 1685
        //     cur_module = "tabAssign"
        // }
        data = {
            ...data,
            tab : "tabAssign",
            cycId:cycId,
            write : 30,
            unassignTask:unassignTask,
            sendNotify: {} //{Execute Batch: "priyanka.r", Execute Scenario: "priyanka.r"}
        }
    }
    var result = await saveMindmap(data)
    if(result.error){displayError(result.error);return}
    var modId
    if(result.scenarioInfo)
        modId=result.currentmoduleid
    else
        modId = result
    var moduleselected = await getModules({modName:null,cycId:cycId?cycId:null,"tab":tab,"projectid":projId,"moduleid":modId})
    if(moduleselected.error){displayError(moduleselected.error);return}
    var screendata = await getScreens(projId)
    if(screendata.error){displayError(screendata.error);return}
    dispatch({type:actionTypes.SAVE_MINDMAP,payload:{screendata,moduledata,moduleselected}})
    // dispatch({type:actionTypes.SELECT_MODULE,payload:moduleselected})
    setBlockui({show:false});
    if(createnew!=='autosave') setMsg(MSG.CUSTOM(isAssign?MSG.MINDMAP.SUCC_TASK_SAVE.CONTENT:MSG.MINDMAP.SUCC_DATA_SAVE.CONTENT,VARIANT.SUCCESS))
    if(result.scenarioInfo){
        dispatch({type:actionTypes.DELETE_SCENARIO,payload:result.scenarioInfo})
        setDelSnrWarnPop(true);
    }
    var req={
        tab:"endToend" && "createTab",
        projectid:projId?projId:"",
        version:0,
        cycId: null,
        modName:"",
        moduleid:null
    }
    var moduledata = await getModules(req);
    dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
    setTimeout(() => dispatch({type:actionTypes.SELECT_MODULE,payload:moduleselected}), 150);    
    // dispatch({type:actionTypes.SELECT_MODULE,payload:res})
    return;

}

const treeIterator = (c, d, e) =>{
    if (c !== undefined) {
        const obj = {
            projectID: d.projectID,
            id: d.id,
            childIndex: d.childIndex,
            _id: (d._id) ? d._id : null,
            oid: (d.oid) ? d.oid : null,
            name: d.name,
            type: d.type,
            pid: (d.parent) ? d.parent.id : null,
            pid_c: (d.parent) ? d.parent.id_c : null,
            task: (d.task) ? d.task : null,
            renamed: (d.rnm) ? d.rnm : !1,
            orig_name: (d.original_name) ? d.original_name : null,
            taskexists: (d.taskexists) ? d.taskexists : null,
            state: (d.state) ? d.state : "created",
            cidxch: (d.cidxch) ? d.cidxch : null // childindex changed
        };
        if (d.type === 'testcases') obj.screenname = d.parent.name; // **Impact check**
        c.push(obj);
    }
    if (d.children && d.children.length > 0) d.children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d.type !== 'testcases') return !0;
    return e;
};

export default SaveMapButton
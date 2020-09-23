import React, { useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {saveMindmap,getModules,getScreens} from '../api';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';

const SaveMapButton = (props) => {
    const dispatch = useDispatch()
    const deletedNodes = useSelector(state=>state.mindmap.deletedNodes)
    const projId = useSelector(state=>state.mindmap.selectedProj)
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const clickSave = (e)=>{
        saveNode(props.setBlockui,props.dNodes,projId,props.setPopup,moduleList,deletedNodes,dispatch)
    }
    return(
        <svg className="ct-actionBox" id="ct-save" onClick={clickSave}>
            <g id="ct-saveAction" className="ct-actionButton">
                <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                <text x="23" y="18">Save</text>
            </g>
        </svg>
    )
}

const saveNode = async(setBlockui,dNodes,projId,setPopup,moduleList,deletedNodes,dispatch)=>{
    var layout_vertical = false;
    var error = !1
    var mapData = []
    var flag = 10 
    var temp_data = [];
    var counter = {};
    d3.select('#pasteImg').classed('active-map',false)
    d3.select('#copyImg').classed('active-map',false)
    d3.selectAll('.ct-node').classed('node-selected',false)   
    if (d3.select('#ct-save').classed('disableButton')) return;
    setBlockui({show:true,content:'Saving flow! Please wait...'})
    dNodes.forEach((e, i)=>{
        if (i == 0) return;
        temp_data[i] = {
            idx: i,
            x: e.x,
            y: e.y,
            type: e.type
        };
    });
    if (layout_vertical) {
        temp_data.sort((a, b)=>a.x - b.x);
    } else {
        temp_data.sort((a, b)=>a.y - b.y);
    }
    temp_data.forEach((e)=>{
        // var key_1=undefined;
        if(dNodes[e.idx].parent==null) return;
        var key_1= dNodes[e.idx].parent.id;
        var key=e.type+'_'+key_1;
        if(counter[key]==undefined)  counter[key]=1;
        if (dNodes[e.idx].childIndex != counter[key]) {
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
        createdthrough: "Web"
    }
    var modId = await saveMindmap(data)
    if(modId && !modId.error){
        var moduledata = await getModules({modName:null,cycId:null,"tab":"tabCreate","projectid":projId,"moduleid":modId})
        var screendata = await getScreens(projId)
        if(screendata)dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
        dispatch({type:actionTypes.UPDATE_DELETENODES,payload:[]})
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        dispatch({type:actionTypes.SELECT_MODULE,payload:moduledata})
        setBlockui({show:false});
        setPopup({show:true,title:'Success',content:'Data saved successfully',submitText:'Ok'})
        return;
    }else{
        setBlockui({show:false});
        setPopup({show:true,title:'Error',content:((modId && modId.error)?modId.error:'Error while Saving'),submitText:'Ok'})
        return;
    }
}

const treeIterator = (c, d, e) =>{
    if (c != undefined) {
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
        if (d.type == 'testcases') obj.screenname = d.parent.name; // **Impact check**
        c.push(obj);
    }
    if (d.children && d.children.length > 0) d.children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d.type != 'testcases') return !0;
    return e;
};


export default SaveMapButton
import React, { useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {saveMindmap,getModules} from '../api';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import { ModalContainer, PopupMsg } from '../../global'

const SaveMapButton = (props) => {
    const dispatch = useDispatch()
    const projId = useSelector(state=>state.mindmap.selectedProj)
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const clickSave = (e)=>{
        saveNode(props.dNodes,projId,props.setPopup,moduleList,dispatch)
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

const saveNode = async(dNodes,projId,setPopup,moduleList,dispatch)=>{
    var layout_vertical = false;
    var deletednode = []
    var cur_module = null;
    var error = !1
    var mapData = []
    var flag = 10 //if ($scope.tab == 'tabAssign') flag = 30;
    var temp_data = [];
    var counter = {};
    d3.select('#pasteImg').classed('active-map',false)
    d3.select('#copyImg').classed('active-map',false)
    d3.selectAll('.ct-node').classed('node-selected',false)   
    if (d3.select('#ct-save').classed('disableButton')) return;
    // blockUI('Saving Flow! Please wait...');
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
    var error = treeIterator(mapData, dNodes[0], error);
    // if (dNodes[0].type == 'endtoend') {
    //     cur_module = 'end_to_end';
    //     error = false;
    // } else {
    //     //Part of Issue 1685
    //     cur_module = $scope.tab;
    // }
    // var userInfo = JSON.parse(window.localStorage['_UI']);
    // var username = userInfo.username;
    // var assignedTo = assignedObj;
    // var utcTime = new Date().getTime();
    // var from_v = to_v = 0;
    // if ($('.version-list').length != 0)
    //     from_v = to_v = $('.version-list').val();
    var data = {
        write: flag,
        map: mapData,
        deletednode: deletednode,
        unassignTask: [],
        prjId: projId,
        createdthrough: "Web",
        // cycId: cycId ??
    }
    var modId = await saveMindmap(data)
    if(modId){
        var moduledata = await getModules({modName:null,cycId:null,"tab":"tabCreate","projectid":projId,"moduleid":modId})
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        dispatch({type:actionTypes.SELECT_MODULE,payload:moduledata})
    }else{
        setPopup({show:true,title:'Error',content:'Error while Saving.',submitText:'Ok'})
        return;
    }
}

const treeIterator = (c, d, e) =>{
    if (c != undefined) {
        c.push({
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
        });
        if (d.type == 'testcases') c[c.length - 1].screenname = d.parent.name; // **Impact check**
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
import '../styles/ToolbarMenuEnE.scss'
import React, { useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getModules,getScreens,exportToExcel} from '../api';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import ModuleListDropEnE from './ModuleListDropEnE';

const ToolbarMenuEnE = (props) =>{
    const dispatch = useDispatch()
    const initProj = useSelector(state=>state.mindmap.selectedProj)
    const prjList = useSelector(state=>state.mindmap.projectList)
    const setPopup = props.setPopup

    const selectProj = async(proj) =>{
        dispatch({type:actionTypes.SELECT_PROJECT,payload:proj})
        var moduledata = await getModules({"tab":"tabCreate","projectid":proj,"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
    }
    const displayError = (error) =>{
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
    var projectList = Object.entries(prjList)
    return(
        <Fragment>
        <div className='ene_toolbar__header'>
            <div className='ene_toolbar_module_header'>
                <label>Project:</label>
                <select value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                    {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
                </select>
                <span className='ene_toolbar__header-searchbox'>
                    <input placeholder="Search Modules"onChange={(e)=>selectProj(e.target.value)}></input>
                    <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                </span>
            </div>
            <div className='ene_toolbar_scenario'>
                <label>Scenarios:</label>
                <span className='ene_toolbar__header-searchbox'>
                    <input placeholder="Search Modules"onChange={(e)=>selectProj(e.target.value)}></input>
                    <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                </span>
            </div>
            <ModuleListDropEnE/>
        </div>
        </Fragment>
    )
}

export default ToolbarMenuEnE;
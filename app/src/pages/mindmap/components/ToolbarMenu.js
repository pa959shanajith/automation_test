import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getModules} from '../api'
import '../styles/ToolbarMenu.scss';
import * as actionTypes from '../state/action';


/*Component ToolbarMenu
  use: renders tool bar menus of create new page
*/

const Toolbarmenu = () => {
    const dispatch = useDispatch()
    const prjList = useSelector(state=>state.mindmap.projectList)
    const initProj = useSelector(state=>state.mindmap.selectedProj)
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const [modlist,setModList] = useState(moduleList)
    const selectProj = async(proj) => {
        dispatch({type:actionTypes.SELECT_PROJECT,payload:proj})
        var moduledata = await getModules({"tab":"tabCreate","projectid":proj,"moduleid":null})
        setModList(moduledata)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    var projectList = Object.entries(prjList)
    return(
        <div className='toolbar__header'>
            <label>Project:</label>
            <select value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
            </select>
            <span className='toolbar__header-menus'>
                <i className="fa fa-crop fa-lg" title="add a rectangle"></i>
                <i className="fa fa-files-o fa-lg" title="copy selected map"></i>
                <i className="fa fa-clipboard fa-lg" title="Paste map"></i>
                <i className="fa fa-download fa-lg" title="Export To Excel"></i>
                <i className="fa fa-upload fa-lg" title="Import Process Discovery File"></i>
            </span>
            <span className='toolbar__header-searchbox'>
                <input placeholder="Search Modules" onChange={(e)=>searchModule(e.target.value)}></input>
                <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
            </span>
            <button className='btn' title="Create New Mindmap">Create New</button>
        </div>
    )
}

export default Toolbarmenu;
import '../styles/ToolbarMenuEnE.scss'
import React, { useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getModules} from '../api';
import { setMsg } from '../../global';
import * as actionTypes from '../state/action';
import ModuleListDropEnE from './ModuleListDropEnE';
import PropTypes from 'prop-types'

/*Component ToolbarMenuEnE
  use: renders Toolbar header for ene and also container for moduleList dropdown
*/
const ToolbarMenuEnE = (props) =>{
    const dispatch = useDispatch()
    const SearchMdInp = useRef()
    const SearchScInp = useRef()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const initProj = useSelector(state=>state.mindmap.selectedProj)
    const prjList = useSelector(state=>state.mindmap.projectList)
    const [modName,setModName] = useState(false)
    const [modlist,setModList] = useState(undefined)
    const [filterSc,setFilterSc] = useState('')
    const setBlockui = props.setBlockui

    const selectProj = async(proj) =>{
        dispatch({type:actionTypes.SELECT_PROJECT,payload:proj})
        setBlockui({show:true,content:'Loading modules ...'})
        var moduledata = await getModules({"tab":"endToend","projectid":proj,"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        setModList(moduledata)
        setModName(false)
        setBlockui({show:false})
        SearchMdInp.current.value = ""
        SearchScInp.current.value = ""
    }
    const searchModule = (val) =>{
        var initmodule = modlist
        if(!initmodule){
            initmodule = moduleList
            setModList(moduleList)
        }
        var filter = initmodule.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    const searchScenario = (val) =>{
        setFilterSc(val)
    }
    const displayError = (error) =>{
        setMsg(error)
    }
    var projectList = Object.entries(prjList)
    return(
        <Fragment>
            <div className='ene_toolbar__header'>
                <div className='ene_toolbar_module_header'>
                    <label data-test="projectLabel">Project:</label>
                    <select data-test="projectSelect" value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                        {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
                    </select>
                    <span data-test="search" className='ene_toolbar__header-searchbox'>
                        <input data-test="searchInput" placeholder="Search Modules" ref={SearchMdInp} onChange={(e)=>searchModule(e.target.value)}></input>
                        <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
                </div>
                <div className='ene_toolbar_scenario'>
                    <label>{modName?`Module Name: ${modName}`:'Scenarios'}</label>
                    <span className='ene_toolbar__header-searchbox'>
                        <input placeholder="Search Scenario" ref={SearchScInp} onChange={(e)=>searchScenario(e.target.value)}></input>
                        <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
                </div>
                <ModuleListDropEnE {...props} filterSc={filterSc} setModName={setModName}/>
            </div>
        </Fragment>
    )
}
ToolbarMenuEnE.propTypes={
    setBlockui:PropTypes.func.isRequired,
}
export default ToolbarMenuEnE;
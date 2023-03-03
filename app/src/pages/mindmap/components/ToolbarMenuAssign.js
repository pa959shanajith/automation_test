import React, {useEffect, useState, useRef} from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { getProjectList, getModules} from '../api';
import {parseProjList} from '../containers/MindmapUtils';
import { setMsg } from '../../global'
import * as actionTypes from '../state/action';
import '../styles/ToolbarMenuAssign.scss';
import PropTypes from 'prop-types';

/*Component ToolbarMenuAssign
  use: renders Toolbar header
*/
const ToolbarMenuAssign = (props) => {
    const dispatch = useDispatch()
    const SearchInp = useRef()
    const selectProj = useSelector(state=>state.mindmap.selectedProj)
    const prjList = useSelector(state=>state.mindmap.projectList)
    const [modlist,setModList] = useState([])
    const [relList,setRelList] = useState([])
    const [relIndex,setRelIndex] = useState(undefined)
    const [cycle,setCycle] = useState("")
    const setBlockui = props.setBlockui
    const cycleRef = props.cycleRef
    const releaseRef = props.releaseRef
    useEffect(()=>{
        (async()=>{
            if(!selectProj){
                var res = await getProjectList()
                if(res.error){displayError(res.error);return;}
                var data = parseProjList(res)
                dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
                dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]})
            }else{
                var rel = prjList[selectProj].releases
                setRelList(rel)
                setBlockui({show:false})
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectProj,prjList])
    const updateModuleList = async(cycle) => {
        SearchInp.current.value = ""
        setCycle(cycle)
        setBlockui({content:'Loding Modules',show:true})
        var data = { 
            cycId: cycle,
            projectid: selectProj,
            tab: "tabAssign"
        }
        var moduledata = await getModules(data)
        if(moduledata.error){displayError(moduledata.error);return;}
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        setModList(moduledata)
        setBlockui({show:false})
    }
    const displayError = (error) =>{
        // SetProgressBar("stop",dispatch)
        setMsg(error)
    }
    const changeProject = (val) => {
        setBlockui({show:true,content:'Loading...'})
        dispatch({type:actionTypes.SELECT_PROJECT,payload:val})
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        setRelIndex(undefined)
        setCycle('')
        SearchInp.current.value = ""
    }
    const changeRelease = (val) => {
        setRelIndex(val)
        setCycle('Select')
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        SearchInp.current.value = ""
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    var projectList = Object.entries(prjList)
    return(
        <div className='asn_toolbar__header'>
            <label data-test="projectLabel">Project:</label>
            <select data-test="projectSelect" value={selectProj} onChange={e=>changeProject(e.target.value)} >
                {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
            </select>
            <label data-test="releaseLablel">Release:</label>
            <select data-test="releaseSelect" value={relIndex?relIndex:'Select'} ref={releaseRef} onChange={e=>changeRelease(e.target.value)} className={(!relIndex || relIndex==='Select')?'errorClass':''}>
                <option value="Select" disabled={true}>Select</option>
                {relList.map((e,i)=><option value={i} key={i}>{e.name}</option>)}
            </select>
            <label data-test="cycleLabel">Cycle:</label>
            <select data-test="cycleSelect" value={cycle} ref={cycleRef} onChange={e=>updateModuleList(e.target.value)} disabled={(!relIndex||relIndex ==='Select')?true:false} className={(relIndex && relIndex !=='Select'&& cycle==='Select')?'errorClass':''}>
                <option value="Select" disabled={true}>Select</option>
                {relIndex && relList[relIndex].cycles.map((e,i)=><option value={e._id} key={i}>{e.name}</option>)}
            </select>
            <span data-test="searchSpan" className='asn_toolbar__header-searchbox'>
                <input data-test="searchInput" disabled={(cycle==='Select'||cycle==='')?true:false} placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)} ></input>
                <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
            </span>
        </div>
    )
}
ToolbarMenuAssign.propTypes={
    cycleRef: PropTypes.object.isRequired,
    releaseRef: PropTypes.object.isRequired,
    setBlockui: PropTypes.func.isRequired,
}
export default ToolbarMenuAssign;
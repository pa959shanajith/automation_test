import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getAllSuites_ICE , getReportsData_ICE} from '../api';
import * as actionTypes from '../state/action';
import '../styles/ToolbarMenu.scss';


/*Component ToolbarMenu
  use: renders ToolbarMenu to set project, cycle, releases.
*/

const ToolbarMenu = ({displayError,setBlockui,setModDrop}) =>{
    const dispatch = useDispatch()
    const [autoReport,setAutoReport] = useState(false)
    const [modlist,setModList] = useState([])
    const [projData,setProjData] = useState([])
    const [relList,setRelList] = useState([])
    const [cycList,setCycList] = useState([])
    const reportData = useSelector(state=>state.plugin.RD);
    const cycRef = useRef()
    const relRef = useRef()
    const projRef = useRef()
    const searchRef = useRef()
    useEffect(()=>{
        (async()=>{
            setBlockui({show:true,content:'Loading...'})
            var res = await getAllSuites_ICE({readme:"projects"})
            if(res.error){displayError(res.error);return;}
            setProjData(res)
            setRelList(res[0].releases)
            setBlockui({show:false})
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    useEffect(()=>{
        if(reportData && reportData.projectid && projData.length >0){
            try{
                var data = {}
                var cyclData = {}
                projData.some((e)=>{if(e._id===reportData.projectid){
                    data = e
                    }
                    return e._id===reportData.projectid;
                })
                data.releases.some((e)=>{if(e.name===reportData.releaseid){
                    cyclData = e
                    }
                    return e.name===reportData.releaseid
                })
                setRelList(data.releases)
                setCycList(cyclData.cycles)
                setAutoReport(true)            
            }catch(err){
                displayError('Failed to load Reports!')
                console.error(err)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[reportData,projData])
    useEffect(()=>{
        if(autoReport){
            projRef.current.value = reportData.projectid;
            relRef.current.disabled = false;
            relRef.current.value = reportData.releaseid
            cycRef.current.disabled = false;
            cycRef.current.value = reportData.cycleid
            CycChange()
            setAutoReport(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[autoReport])
    const projChange = (e) =>{
        relRef.current.value = 'def-val'
        setRelList(projData[e.target.selectedIndex].releases)
        setCycList([])
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        searchRef.current.value = ""
        searchRef.current.disabled = true;
        setModDrop(true)
    }
    const RelChange = (e) =>{
        cycRef.current.value = 'def-val'
        setCycList(relList[e.target.selectedIndex-1].cycles)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        searchRef.current.value = ""
        searchRef.current.disabled = true;
        setModDrop(true)
    }
    const CycChange = async() =>{
        var arg = {
            "param":"getReportsData_ICE",
            "reportsInputData":{
                "projectId":projRef.current.value,
                "releaseName":relRef.current.value,
                "cycleId":cycRef.current.value,
                "type":"allmodules"
            }
        }
        var res = await getReportsData_ICE(arg)
        if(res.error){displayError(res.error);return;}
        setModList(res.rows)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:res.rows})
        searchRef.current.value = ""
        searchRef.current.disabled = false;
        setModDrop(false)
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    return(
        <div className='rp__toolbar'>
            <label>Project:</label>
            <select ref={projRef} onChange={projChange}>
                {
                    projData.map((e)=><option key={e._id} value={e._id}>{e.name}</option>)
                }
            </select>
            <label>Release:</label>
            <select ref={relRef} onChange={RelChange} defaultValue={'def-val'} disabled={relList.length<1}>
                <option disabled value='def-val'>Select Release</option>
                {
                    relList.map((e)=><option key={e.name} value={e.name}>{e.name}</option>)
                }
            </select>
            <label>Cycle:</label>
            <select ref={cycRef} onChange={CycChange} defaultValue={'def-val'} disabled={cycList.length<1}>
                <option disabled value='def-val'>Select Cycle</option>
                {
                    cycList.map((e)=><option key={e._id} value={e._id}>{e.name}</option>)
                }
            </select>
            <span className='toolbar__header-searchbox'>
                <input ref={searchRef} placeholder="Search Modules" disabled={true} onChange={(e)=>searchModule(e.target.value)}></input>
                <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
            </span>
        </div>
    )
}

export default ToolbarMenu;
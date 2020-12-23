import React, { Fragment, useEffect, useRef, useState } from 'react';
import {ModalContainer, ScrollBar} from '../../global';
import {useSelector} from 'react-redux'
import {getModules,exportToJson,exportToExcel} from '../api';
import '../styles/ExportMapButton.scss'

const ExportMapButton = ({setPopup,setBlockui,displayError}) => {
    const fnameRef = useRef()
    const ftypeRef = useRef()
    const [exportBox,setExportBox] = useState(false)
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const modName = selectedModule.name
    const openExport = ()=>{
        if(!selectedProj || !selectedModule || !selectedModule._id){
            return;
        }
        setExportBox(true)
    }
    const clickExport = () => {
        fnameRef.current.borderColor=""
        var fname = fnameRef.current.value
        var ftype = ftypeRef.current.value
        if(!fname){
            fnameRef.current.borderColor = 'red'
            return;
        }
        setExportBox(false)
        setBlockui({show:true,content:'Exporting Mindmap ...'})
        if(ftype === 'json') toJSON(selectedModule,fname,displayError,setPopup,setBlockui);
        if(ftype === 'excel') toExcel(selectedProj,selectedModule,fname,displayError,setPopup,setBlockui);
    }
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export MindMap'
            close={()=>setExportBox(false)}
            footer={<Footer clickExport={clickExport}/>}
            content={<Container fnameRef={fnameRef} ftypeRef={ftypeRef} modName={modName}/>} 
            />:null}
            <svg className={"ct-exportBtn"+(selectedModule._id?"":" disableButton")} id="ct-save" onClick={openExport}>
                <g id="ct-exportAction" className="ct-actionButton">
                    <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                    <text x="16" y="18">Export</text>
                </g>
            </svg>
        </Fragment>
    )
}

const Container = ({fnameRef,ftypeRef,modName}) =>(
    <div>
        <div className='export-row'>
            <label>File Name: </label>
            <input ref={fnameRef} defaultValue={modName} placeholder={'Enter file name'}></input>
        </div>
        <div className='export-row'>
            <label>Export As: </label>
            <select ref={ftypeRef} defaultValue={'excel'}>
                <option value={'excel'}>Excel Workbook (.xlsx)</option>
                <option value={'json'}>MindMap (.mm)</option>
            </select>
        </div>
    </div>
)
const Footer = ({clickExport}) => <div><button onClick={clickExport}>Export</button></div>

/*
    function : toExcel()
    Purpose : Exporting Module in json file
    param :
*/
const toExcel = async(projId,modId,fname,displayError,setPopup,setBlockui) => {
    try{
        var data = {
            "projectid":projId,
            "moduleid":modId._id
        }
        var result = await exportToExcel(data)
        if(result.error){displayError(result.error);return;}
        var file = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var fileURL = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = fileURL;
        a.download = fname+'.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        setBlockui({show:false,content:''})
        setPopup({
            title:'Mindmap',
            content:'Data Exported Successfully.',
            submitText:'Ok',
            show:true
        })
    }catch(err){
        console.error(err)
        displayError('Failed to Export Mindmap')
    }
}

/*
    function : toJSON()
    Purpose : Exporting Module in json file
    param :
*/
const toJSON = async(modId,fname,displayError,setPopup,setBlockui) => {
    try{
        var result =  await exportToJson(modId._id)
        if(result.error){displayError(result.error);return;}
        var blob = new Blob([JSON.stringify(result)], { type: 'text/json' });
        var e = document.createEvent('MouseEvents');
        var a = document.createElement('a');
        a.download = fname+'.mm';
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
        setBlockui({show:false,content:''})
        setPopup({
            title:'Mindmap',
            content:'Data Exported Successfully.',
            submitText:'Ok',
            show:true
        })
    }catch(err){
        console.error(err)
        displayError('Failed to Export Mindmap')
    }
}

export default ExportMapButton;
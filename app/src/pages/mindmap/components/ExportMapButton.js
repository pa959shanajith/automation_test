import React, { Fragment, useEffect, useRef, useState } from 'react';
import {ModalContainer, ScrollBar} from '../../global';
import {useSelector} from 'react-redux'
import {readTestSuite_ICE,exportToJson,exportToExcel} from '../api';
import '../styles/ExportMapButton.scss'

const ExportMapButton = ({setPopup,setBlockui,displayError,isAssign,releaseRef,cycleRef}) => {
    const fnameRef = useRef()
    const ftypeRef = useRef()
    const [exportBox,setExportBox] = useState(false)
    const selectedModule = useSelector(state=>state.mindmap.selectedModule)
    const selectedProj = useSelector(state=>state.mindmap.selectedProj)
    const projectList = useSelector(state=>state.mindmap.projectList)
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
        if(ftype === 'custom') toCustom(selectedProj,selectedModule,projectList,releaseRef,cycleRef,fname,displayError,setPopup,setBlockui);

    }
    return(
        <Fragment>
            {exportBox?<ModalContainer
            title='Export MindMap'
            close={()=>setExportBox(false)}
            footer={<Footer clickExport={clickExport}/>}
            content={<Container fnameRef={fnameRef} ftypeRef={ftypeRef} modName={selectedModule.name} isAssign={isAssign}/>} 
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

const Container = ({fnameRef,ftypeRef,modName,isAssign}) =>(
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
                {isAssign && <option value={'custom'}>Custom (.json)</option>}
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
        jsonDownload(fname+'.mm', JSON.stringify(result));
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

const toCustom = async (selectedProj,selectedModule,projectList,releaseRef,cycleRef,fname,displayError,setPopup,setBlockui) =>{
    try{
        var suiteDetailsTemplate = { "condition": 0, "dataparam": [" "], "scenarioId": "", "scenarioName": "" };
        var moduleData = { "testsuiteName": "", "testsuiteId": "", "versionNumber": "", "appType": "", "domainName": "", "projectName": "", "projectId": "", "releaseId": "", "cycleName": "", "cycleId": "", "suiteDetails": [suiteDetailsTemplate] };
        var executionData = { "executionData": [{ "source": "api", "exectionMode": "serial", "browserType": ["1"], "qccredentials": { "qcurl": "", "qcusername": "", "qcpassword": "" }, "batchInfo": [JSON.parse(JSON.stringify(moduleData))], "userInfo": { "tokenhash": "", "tokenname": "", "icename": "" } } ] };
        var moduleInfo = { "batchInfo": [] };
        moduleData.appType = projectList[selectedProj].apptype;
        moduleData.domainName = projectList[selectedProj].domains;
        moduleData.projectName = projectList[selectedProj].name;
        moduleData.projectId = projectList[selectedProj].id;
        moduleData.releaseId = releaseRef.current.selectedOptions[0].innerText;
        moduleData.cycleName = cycleRef.current.selectedOptions[0].innerText;
        moduleData.cycleId = cycleRef.current.value;
        const reqObject = [{
            "releaseid": moduleData.releaseId,
            "cycleid": moduleData.cycleId,
            "testsuiteid": selectedModule._id,
            "testsuitename": selectedModule.name,
            "projectidts": moduleData.projectId
            // "versionnumber": parseFloat(version_num)
        }];
        var moduleObj = await readTestSuite_ICE(reqObject)
        if(moduleObj.error){displayError(moduleObj.error);return;}
        moduleObj = moduleObj[selectedModule._id];
        if(moduleObj && moduleObj.testsuiteid != null) {
            moduleData.testsuiteId = moduleObj.testsuiteid;
            moduleData.testsuiteName = moduleObj.testsuitename;
            moduleData.versionNumber = moduleObj.versionnumber;
            moduleData.suiteDetails = [];
            for (var j = 0; j < moduleObj.scenarioids.length; j++) {
                var s_data = JSON.parse(JSON.stringify(suiteDetailsTemplate));
                s_data.condition = moduleObj.condition[j];
                s_data.dataparam = [moduleObj.dataparam[j]];
                s_data.scenarioName = moduleObj.scenarionames[j];
                s_data.scenarioId = moduleObj.scenarioids[j];
                moduleData.suiteDetails.push(s_data);
            }
            moduleInfo.batchInfo.push(moduleData);
            jsonDownload(fname+'_moduleinfo.json', JSON.stringify(moduleInfo));
            jsonDownload(fname+'_executiondata.json', JSON.stringify(executionData));
            setBlockui({show:false,content:''})
            setPopup({
                title:'Mindmap',
                content:'Data Exported Successfully.',
                submitText:'Ok',
                show:true
            })
        } else {
            displayError("Failed to export data");
        }
    }catch(err){
        displayError("Failed to export data");
        console.error(err);
    } 
}

/*
function : jsonDownload()
Purpose : download json file
*/

function jsonDownload(filename, responseData) {
    var blob = new Blob([responseData], { type: 'text/json' });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}

export default ExportMapButton;
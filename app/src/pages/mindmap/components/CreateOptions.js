import React, { useRef, Fragment, useState } from 'react';
import {excelToMindmap} from '../api';
import {ModalContainer,PopupMsg} from '../../global'
import { useDispatch} from 'react-redux';
import * as actionTypes from '../state/action';
import '../styles/CreateOptions.scss'

/*Component CreateOptions
  use: renders 3 options to create mindmap in the center of screen
  props: 
    setoptions from mindmapHome.js 
*/

const CreateOptions = (props) => {
  const dispatch = useDispatch()
  const upload =  useRef()
  const [sheetList,setSheetList] = useState(false)
  const [data,setData] = useState(false)
  const [popup,setPopup] = useState({show:false})
  const [sheet,setSheet] = useState(undefined)
  const options = [
    {ico : "ic-create-newMindmap.png",label:'Create New',comp:'newmindmap'},
    {ico : "ic-endtoendFlow.png",label:'End to End Flow',comp:'enemindmap'},
    {ico :"ic-importfromexcel-mindmap.png",label:'Import Mindmap',comp:'importmindmap'}
  ]
  const displayError = (error) =>{
    setPopup({
      title:'ERROR',
      content:error,
      submitText:'Ok',
      show:true
    })
  }
  const submitSheet = async() =>{
    var resdata = await excelToMindmap({'content':data,'flag':'data',sheetname: sheet})
    setSheetList(false);
    if(resdata.error){displayError(resdata.error);return;}
    props.setOptions('newmindmap')
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:'excel',data:resdata}})
  }
  const fileImport = (file,impType) => {
    props.setOptions('newmindmap')
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:impType,data:file}})
  }
  return (
    <Fragment>
      {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
      {sheetList!==false?<ModalContainer 
        modalClass = 'modal-sm'
        title='Select Sheet'
        close={()=>setSheetList(false)}
        footer={<Footer submitSheet={submitSheet}/>}
        content={<Container sheetList={sheetList} setSheet={setSheet}/>} 
      />:null}
      <div className='mindmap__option-container'>
        <div>
          {options.map((e,i)=>(
            <div className='mindmap__option-box' onClick={()=>{(e.comp === 'importmindmap')?upload.current.click():props.setOptions(e.comp)}} key={i} data-test="OptionBox">
              <div>
                {(e.comp === 'importmindmap')?<input onChange={(e)=>uploadFile(e,setSheetList,displayError,setData,fileImport)} style={{display:'none'}} type="file" name="xlsfile" accept=".pd,.xls,.xlsx,.mm" required="" autoFocus="" ref={upload}/>:null}
                <img src={"static/imgs/"+e.ico} alt={e.label}/>
                <div>{e.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}

// container for sheet choose popup
const Container = (props) => {
  return(
    <div className = 'mp__sheet-popup'>
      <select defaultValue={"def-opt"} id='mp__import-sheet' onChange={(e)=>props.setSheet(e.target.value)}>
        <option value="def-opt" disabled>Please Select Sheet</option>
        {props.sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
      </select>
    </div>
  )
}

// Footer for sheet choose popup
const Footer = (props) =>{
  const [errMsg,setErrMsg] = useState('')
  const submit = () => {
    var projid = document.getElementById('mp__import-sheet').value
    if(projid !== "def-opt"){
      props.submitSheet()
    }else{
      setErrMsg("Sheet not selected")
    }
  }
  return(
    <Fragment>
        <div className='mnode__buttons'>
          <label className='err-message'>{errMsg}</label>
          <button onClick={submit}>OK</button>
        </div>
    </Fragment>
  )
}

// read promise that resolves on successful input file read
function read(file) {
  return new Promise ((res,rej)=>{
      var reader = new FileReader();
      reader.onload = function() {
        res(reader.result);
      }
      reader.onerror = () => {
        rej("fail")
      }
      reader.onabort = () =>{
        rej("fail")
      }
      reader.readAsBinaryString(file);
    }
  )
}

// upload File funtion checks imported file extensions and returns data or error message

const uploadFile = async(e,setSheetList,displayError,setData,fileImport) =>{
    var file = e.target.files[0]
    var extension = file.name.substr(file.name.lastIndexOf('.')+1)
    const result =  await read(file)
    setData(result)
    if(extension === 'pd'){
        fileImport(result,'pd')
    }else if(extension === 'xls' || extension === 'xlsx'){
        var res = await excelToMindmap({'content':result,'flag':"sheetname"})
        if(res.error){displayError(res.error);return;}
        if(res.length>0){
            setSheetList(res)
        }else{
            displayError("File is empty")
        }
    }else if(extension === 'json' || extension === 'mm'){
        var resultString = JSON.parse(result);
        if (!('testscenarios' in resultString)){
            displayError("Incorrect JSON imported. Please check the contents!!");
        }else if(resultString.testscenarios.length === 0){
            displayError("The file has no node structure to import, please check!!");
        }else{
            fileImport(result,'mm')
        }
    }else{
        displayError("File is not supported")
    }
}

export default CreateOptions;
import React, { useRef, Fragment, useState } from 'react';
import {excelToMindmap} from '../api';
import {ModalContainer,PopupMsg} from '../../global'
import { useDispatch, useSelector} from 'react-redux';
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
    {ico :"ic-importfromexcel-mindmap.png",label:'Import Mindmap',comp:'excelmindmap'}
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
    props.setOptions('newmindmap')
    var resdata = await excelToMindmap({'content':data,'flag':'data',sheetname: sheet})
    if(resdata.error){displayError(resdata.error);return;}
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:'excel',data:resdata}})
  }
  const pdImport = (file) => {
    props.setOptions('newmindmap')
    dispatch({type:actionTypes.UPDATE_IMPORTDATA,payload:{createdby:'pd',data:file}})
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
            <div className='mindmap__option-box' onClick={()=>{(e.comp === 'excelmindmap')?upload.current.click():props.setOptions(e.comp)}} key={i} data-test="OptionBox">
              <div>
                {(e.comp === 'excelmindmap')?<input onChange={(e)=>uploadFile(e,setSheetList,displayError,setData,pdImport)} style={{display:'none'}} type="file" name="xlsfile" accept=".pd,.xls,.xlsx" required="" autoFocus="" ref={upload}/>:null}
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

const uploadFile = async(e,setSheetList,displayError,setData,pdImport) =>{
  var file = e.target.files[0]
  var extension = file.name.substr(file.name.lastIndexOf('.')+1)
  const result =  await read(file)
  setData(result)
  if(extension === 'pd'){
    pdImport(result)
  }else if(extension === 'xls' || extension === 'xlsx'){
    var res = await excelToMindmap({'content':result,'flag':"sheetname"})
    if(res.error){displayError(res.error);return;}
    if(res.length>0){
      setSheetList(res)
    }else{
      displayError("File is empty")
    }
  }else{
    displayError("File is not supported")
  }
}

const Container = (props) => {
  return(
    <div className = 'mp__sheet-popup'>
      <select id='mp__import-sheet' onChange={(e)=>props.setSheet(e.target.value)}>
        <option value="" disabled selected>Please Select Sheet</option>
        {props.sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
      </select>
    </div>
  )
}

const Footer = (props) =>{
  const [errMsg,setErrMsg] = useState('')
  const submit = () => {
    var projid = document.getElementById('mp__import-sheet').value
    if(projid !== ""){
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

export default CreateOptions;
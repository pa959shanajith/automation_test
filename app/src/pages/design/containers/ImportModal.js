import React, { useState, Fragment, useRef } from 'react';
import {RedirectPage, Messages as MSG, setMsg} from '../../global';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { excelToScreen, updateScreen_ICE } from '../../design/api';
// import { Dialog } from 'primereact/dialog';
import ModalContainer from '../../global/components/ModalContainer';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import "../styles/ImportModal.scss"


const ImportModal = props => {
    
    const fileUpload = useRef(undefined)
    const sheetRef = useRef(undefined)
    const importFormat = useRef(undefined)
    const [error,setError] = useState("")

    const [importType,setImportType] = useState("def-val")
    const [uploadingFile, setUploadingFile] = useState(false);
    const setOverlay = props.setOverlay
    const fetchScrapeData = props.fetchScrapeData
    let appType = props.appType;
    const screenId = props.fetchingDetails["_id"]
    const projectId = props.fetchingDetails.projectID
    const screenName = props.fetchingDetails["name"]
    let versionnumber = 0
    const [selectedSheet, setSelectedSheet] = useState("");
    
    const history = useNavigate();
    // const {appType, screenId, screenName, projectId } = useSelector(state => state.plugin.CT);

    const onImport = async() => {
        setOverlay('Importing ...')
         var err = validate([fileUpload,selectedSheet,importFormat])
         console.log(err);
        if(err)return
        var file = fileUpload.current.files[0]
        if(!file)return;
        if(importType === 'excel'){
            var val = selectedSheet;
            try{
                const result =  await read(file)
                var res = await excelToScreen({'content':result,'flag':'data','sheetname':val,'screenid':screenId,'projectid':projectId })
                if(res.error){props.toastError('Error fetching data from file.');setOverlay("");return;}
                else if(res=='fail'){props.toastError('Excel sheet is either empty or invalid.');setOverlay("");return;}
                else{
                    fetchScrapeData()
                    .then(resp => {
                        if (resp === "success") {
                            props.setShow(false);
                           props.toastSuccess("Screen Excel imported successfully");
                           setUploadingFile(true);
                        }
                        else props.toastError("ERR_EXCEL_IMPORT");
                    })
                    .catch(err => {
                        props.toastError("ERR_EXCEL_IMPORT");
                        // console.error(err);
                    });
                }
            }catch(err){
            props.toastError('Error fetching data from file.')
            console.error(err)
            } 
        }
        else if(importType === 'json'){
            let reader = new FileReader();
            reader.onload = function (e) {
                try{
                    if (file.name.split('.').pop().toLowerCase() === "json") {
                        setOverlay("Loading...")
                        let resultString = JSON.parse(reader.result);
                        if (!('appType' in resultString))
                            props.toastError("Incorrect JSON imported. Please check the contents.");
                        else if (resultString.appType !== props.appType)
                        props.toastError("Project application type and Imported JSON application type doesn't match, please check.");
                        else if (resultString.view.length === 0)
                        props.toastError("The file has no objects to import, please check.");
                        else {
                            let objList = {};
                            if ('body' in resultString) {
                                let { reuse, appType, screenId, view, versionnumber, ...scrapeinfo } = resultString; 
                                objList['reuse'] = resultString.reuse;
                                objList['appType'] = props.appType;
                                objList['screenId'] = resultString.screenId;
                                objList['view'] =resultString. view;
                                objList['scrapeinfo'] = scrapeinfo;
                            }
                            else objList = resultString;

                            let arg = {
                                projectId: projectId,
                                screenId:  props.fetchingDetails["_id"],
                                screenName: screenName,
                                param: "importScrapeData",
                                appType: props.appType,
                                objList: objList
                            };
                            updateScreen_ICE(arg)
                                .then(data => {
                                    if (data === "Invalid Session") return RedirectPage(history);
                                    else if (data === "fail") props.toastError("Failed to import Screen JSON.");
                                    else fetchScrapeData().then(response => {
                                            if (response === "success")
                                                props.toastSuccess("Screen Json imported successfully.") 
                                                props.setShow(false);
                                            setOverlay("");
                                            setUploadingFile(true);
                                    });
                                })
                                .catch(error => {
                                    setOverlay("");
                                    props.toastError("Failed to import Screen JSON.");
                                    console.error(error)
                                });
                        }
                    } else props.toastError("Please Check the file format you have uploaded.");
                    setOverlay("");
                }
                catch(error){
                    setOverlay("");
                    if (typeof(error)==="object") setMsg(error);
                    else props.toastError("Failed to import Screen JSON.");
                    console.error(error);
                }
            }
            reader.readAsText(file);
        }
        setOverlay('')  
    }
    const validate = (arr) =>{
        var err = false;
        arr.forEach((e)=>{
            if(e.current){
                if(e.current.props) {
                    if(!e.current.props.value || e.current.props.value ==='def-option'){
                        err = true
                    }
                }
                else{
                    e.current.style.borderColor = 'black'
                    if(!e.current.value || e.current.value ==='def-option'){
                        e.current.style.borderColor = 'red'
                        err = true
                    }
                }
            }
        })
        return err
    }
    console.log(props.fetchingDetails)
    return(
        <ModalContainer 
        show={props.show==="importModal"}
        title={'Import'}
        modalClass="modal-md"
        close={()=>props.setShow(false)}
        content={<Content selectedSheet={selectedSheet} setSelectedSheet={setSelectedSheet} fileUpload={fileUpload} setError={setError} importType={importType} importFormat={importFormat} setImportType={setImportType} setOverlay={setOverlay} setUploadingFile={setUploadingFile} appType={appType}/>}
        footer={<Footer onImport={onImport} error={error} uploadingFile={uploadingFile}/>}
    />
    )
    
}

const Content = ({fileUpload,importType,setImportType,setError,importFormat,setOverlay,setUploadingFile,selectedSheet,setSelectedSheet,appType}) =>{
    const [isUpload,setIsUpload] = useState(false)
    const [sheetList,setSheetList] = useState([])
    // Initialize with default value

  const handleSheetChange = (e) => {
    // Set the selected value when an option is changed
    setSelectedSheet(e.value);
  };
    const importTypes = [
        {value: "json", name: "JSON"}, 
        {value: "excel", name: "Excel", disabled: appType !== 'Web'}
        
    ]
    const acceptType = {
        excel:".xls,.xlsx",
        json:".json"
    }
    const handleType = (event) => {
        //let updatedObjects = [...objects];
        //updatedObjects[index].objType = event.target.value;s
        setImportType(event.target.value);
    }
    const upload = async() =>{
        var file = fileUpload.current.files[0]
        setUploadingFile(true);
        if(!file)return;
        var extension = file.name.substr(file.name.lastIndexOf('.')+1)
        setOverlay('Uploading ...')
        try{
            const result =  await read(file)
            if(extension === 'xls' || extension === 'xlsx'){
                var res = await excelToScreen({'content':result,'flag':"sheetname"})
                if(res.error){setError(res.error);return;}
                if(res.length>0){
                    setSheetList(res)
                    setIsUpload(true)
                    setUploadingFile(true);
                }
                else{
                    setError("File is empty")
                }
            }else if(extension === 'json'){
                var data = JSON.parse(result);
                // if (!('testscenarios' in data)){
                //     setError("Incorrect JSON imported. Please check the contents!!");
                // }else if(data.testscenarios.length === 0){
                //     setError("The file has no node structure to import, please check!!");
                // }else{

                // }
                    
            }
        }catch(err){
            setError("invalid File!")
            console.error(err)
        }
        setOverlay('')
       
    }

    return (
        <div className='import-popup-screen'>
            <div>
            <label>Import As: </label>
                {/* <select defaultValue={"def-val"} data-test="addObjectTypeSelect" className="imp-inp" onChange={handleType} ref={importFormat}>
                    <option disabled value="def-val">Select Import Format</option>
                    { importTypes.map( (e) =>
                        <option key={e.value} value={`${e.value}`}>{e.name}</option>
                    ) }
                </select> */}
                <Dropdown className="imp-inp" onChange={handleType} ref={importFormat} placeholder="Select Import Format" value={importType} options={importTypes} optionLabel="name" style={{width:'20rem', marginLeft:'2.6rem', marginBottom:'1.5rem'}}/>
            <div className='upload_file'>
                <label>Upload File: </label>
                <input disabled={importType=="def-val"} accept={acceptType[importType]} type='file' onChange={upload} ref={fileUpload}/>
            </div>
            </div>
        
        {isUpload &&
            <Fragment>
            {(importType==='excel')?
            <div>
                 <label>Select Sheet: </label>
                {/* <select defaultValue={"def-val"} ref={sheetRef}>
                    <option value="def-val" disabled>Please Select Sheet</option>
                    {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                </select> */}
                <Dropdown className="sheet-dropdown" value={selectedSheet} options={sheetList.map((e, i) => ({ label: e, value: e }))} onChange={handleSheetChange} placeholder="Please Select Sheet" disabled={false}/>
            </div>
            :null}
            </Fragment>
        }
        </div>
    )
}

const Footer = ({onImport,error,uploadingFile}) => {
    return(
        <>
        <span>{error}</span>
        <Button data-test="export" disabled={!uploadingFile} size="small" onClick={onImport} label='Import'></Button>
        </>
    )
}

function read(file,setUploadingFile) {
    return new Promise ((res,rej)=>{
        var reader = new FileReader();
        reader.onload = function() {
        res(reader.result);
        setUploadingFile(true)
        }
        reader.onerror = () => {
        rej("fail")
        }
        reader.onabort = () =>{
        rej("fail")
        }
        reader.readAsBinaryString(file);
    })
}

export default ImportModal;
import React, { useRef, useState, Fragment, useEffect } from 'react';
import { ModalContainer, Messages as MSG, setMsg } from '../../global';
import { importDataTable } from '../api';
import { parseTableData } from './DtUtils';
import "../styles/DataTablePopup.scss";
import { Button } from 'primereact/button';

const ImportPopUp = ({setImportPopup,setData,setHeaders,setOverlay,importPopup}) => {

    const [submit,setSubmit] = useState(false);

    return (
        <ModalContainer 
        show={importPopup}
        title='Import Data Table'
        content={<Container submit={submit} setSubmit={setSubmit}
        setData={setData} setHeaders={setHeaders} setImportPopup={setImportPopup} setOverlay={setOverlay} 
        />} 
        footer={
            <>
            <Button label='Import' onClick={()=>setSubmit(true)}></Button>
            </>
        }
        close={()=>setImportPopup(false)}
      />

        // <Dialog
        //     header='Import Data Table'
        //     visible={setImportPopup}
        //     style={{ width: '50vw' }}
        //     onHide={onHide}
        //     footer={
        //         <div>
        //             <button onClick={() => setSubmit(true)}>Import</button>
        //             <button onClick={onHide}>Cancel</button>
        //         </div>
        //     }
        // >
        //     <Container
        //         submit={submit}
        //         setSubmit={setSubmit}
        //         setData={setData}
        //         setHeaders={setHeaders}
        //         setImportPopup={setImportPopup}
        //         setOverlay={setOverlay}
        //     />
        // </Dialog>
    );
}

const Container = ({submit,setSubmit,setData,setHeaders,setImportPopup,setOverlay}) => {
    const [rowTag, setRowTag] = useState("");
    const [columnTagList, setColumnTagList] = useState([]);
    const [sheetList, setSheetList] = useState([]);
    const [error, setError] = useState(false);
    const [importType,setImportType] = useState(undefined);
    const [fileUpload,setFiledUpload] = useState(undefined);
    const uploadFileRef = useRef();
    const sheetRef = useRef()
    const ftypeRef = useRef()
    const rowRef = useRef()
    const colRef = useRef()
    const handleRowTag = e => setRowTag(e.target.value);
    const handleColumnTagList = e => setColumnTagList(e.target.value);
    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({importType,uploadFileRef,setFiledUpload,setSheetList,setError,setOverlay})
    }
    const changeImportType = (e) => {
        setImportType(e.target.value)
        setSheetList([])
        setFiledUpload(undefined)
        setError('')
        if(uploadFileRef.current)uploadFileRef.current.value = ''
    }
    const acceptType = {
        csv:".csv",
        excel:".xls,.xlsx",
        xml:".xml"
    }
    useEffect(()=>{
        if(submit){
            setSubmit(false)
            setError('')
            var err = validate({ftypeRef,uploadFileRef,sheetRef,rowRef,colRef})
            if(err){
                return;
            }
            (async()=>{
                setOverlay("Importing File...");
                const resp = await importDataTable({importFormat: importType, row: rowTag, column:columnTagList, sheetname:sheetRef.current? sheetRef.current.value: undefined,content: fileUpload, flag:"data"});
                switch(resp){
                    case "columnExceeds": setMsg(MSG.UTILITY.ERR_COL_50); break;
                    case "rowExceeds": setMsg(MSG.UTILITY.ERR_ROW_200); break;
                    case "emptyExcelData": setMsg(MSG.UTILITY.ERR_EMPTY_SHEET); break;
                    case "emptyData": setMsg(MSG.UTILITY.ERR_EMPTY_DATA); break;
                    case "emptyRow": setMsg(MSG.UTILITY.ERR_EMPTY_ROWS); break;
                    case "nestedXML": setMsg(MSG.UTILITY.ERR_INVALID_XML); break;
                    case "invalidcols": setMsg(MSG.UTILITY.ERR_COL_TAGNAME); break;
                    default: {
                        if (resp.error) setMsg(resp.error);
                        else if (typeof resp === "object"){
                            const [, newData, newHeaders] = parseTableData(resp, "import")
                            setData(newData);
                            setHeaders(newHeaders);
                            setImportPopup(false);
                        }
                        break;
                    }
                }
                setOverlay("");
            })()
        }
    },[submit])
    return (
        <div data-test='dt__import-popup' className = 'dt__import-popup'>
                <div className='import_format'>
                    <label>Import Format:</label>
                    <select defaultValue={'def-val'} onChange={changeImportType} ref={ftypeRef}>
                        <option value={'def-val'} disabled>Select Import Format</option>
                        <option value={'excel'}>Excel Workbook (.xls, .xlsx)</option>
                        <option value={'csv'}>CSV</option>
                        <option value={'xml'}>XML</option>
                    </select>
                </div>
                {importType &&
                    <Fragment>
                        {
                        <div className='import_format'>
                            <label >Upload File: </label>
                            <input accept={acceptType[importType]} type='file' onChange={upload} ref={uploadFileRef}/>
                        </div>
                        }
                    </Fragment>
                }
                {fileUpload && 
                    <Fragment>
                    {(importType==='excel')?
                    <Fragment>
                    <div className='import_format'>
                        <label>Select Sheet: </label>
                        <select defaultValue={"def-val"} ref={sheetRef}>
                            <option value="def-val" disabled>Please Select Sheet</option>
                            {sheetList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                        </select>
                    </div>
                    </Fragment>
                    :null}
                    {(importType==='xml')?
                    <Fragment>
                    <div className='import_format'>
                        <label>Row Tag:</label><input placeholder={'Row tag (Optional)'} value={rowTag} ref={rowRef} onChange={handleRowTag} />
                    </div>
                    <div className='import_format'>
                        <label>Column Tags:</label><input placeholder={'Column tags (Optional)'} value={columnTagList} ref={colRef} onChange={handleColumnTagList} />
                    </div>
                    </Fragment>
                    :null}
                </Fragment>
                }
        </div>
    );
}

const validate = ({ftypeRef,uploadFileRef,sheetRef,rowRef,colRef}) =>{
    var err = false;
    [ftypeRef,uploadFileRef,sheetRef].forEach((e)=>{
        if(e.current){
            e.current.style.border = '1px solid black';
            if(e.current.value === 'def-val' || e.current.value === ''){
                e.current.style.border = '1px solid red';
                err = true
            }
            if(e.current.type === 'file' && !uploadFileRef.current.files[0]){
                e.current.style.border = '1px solid red';
                err = true
            }
        }
    })
    if(colRef.current !== undefined && colRef.current.value !== '' && rowRef.current.value===''){
        rowRef.current.style.border = '1px solid red';
        err = true
    }
    return err
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
    })
}

const uploadFile = async({importType,uploadFileRef,setFiledUpload,setSheetList,setError,setOverlay}) =>{
    var file = uploadFileRef.current.files[0]
    if(!file)return;
    var extension = file.name.substr(file.name.lastIndexOf('.')+1)
    setOverlay('Uploading ...')
    try{
        const result =  await read(file)
        if (importType === 'excel' && (extension === 'xls' || extension === 'xlsx')) {
            const res = await importDataTable({importFormat: importType, content: result, flag: "sheetname"});
            if(res.error){setError(res.error);return;}
            if(res.length>0){
                setFiledUpload(result)
                setSheetList(res)
            }
        } else if ((importType === 'csv' && extension === 'csv') || (importType === 'xml' && extension === 'xml')) {
            setFiledUpload(result)
        }
        else {
            setFiledUpload(undefined)
            if(uploadFileRef.current)uploadFileRef.current.value = ''
            setMsg(MSG.UTILITY.ERR_FILE_UNSUPPORTED)
        }    
    }catch(err){
        setError("invalid File!")
        console.error(err)
    }finally {
        setOverlay("")
    }
}


export default ImportPopUp;
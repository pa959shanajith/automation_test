import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import ClickAwayListener from 'react-click-away-listener';
import { pasteCells, prepareCopyData, validateData, prepareSaveData, deleteData, parseTableData, getNextData, getPreviousData, pushToHistory } from './DtUtils';
import { ScrollBar, VARIANT, Messages as MSG } from '../../global';
import ExportDataTable from './ExportDataTable';
import ImportSheet from './ImportSheet';
import * as actionTypes from '../state/action';
import ImportXML from './ImportXML';
import * as utilApi from '../api';
import DtPasteStepDialog from './DtPasteStepDialog';


const TableActionButtons = props => {

    const dispatch = useDispatch();
    const copiedCells = useSelector(state=>state.utility.copiedCells)
    const [showPS, setShowPS] = useState(false);

    const onAdd = () => {
        if (props.checkList.list.length===1){
            if (props.checkList.type==="row"){
                if (props.data.length >= 199) 
                    props.setShowPop(MSG.UTILITY.ERR_ROWS_200);
                else {
                    pushToHistory({headers: props.headers, data: props.data});
                    let newData = [...props.data];
                    let locToAdd = 0;
                    let rowId = props.checkList.list[0].split('||').pop();
    
                    // For SubHeader Selection, Location To Add (LocToAdd) will always be 0 i.e. start of data
                    if (rowId !== 'subheader') {
                        newData.forEach((row, rowIndex) => {
                            if (rowId === row.__CELL_ID__) locToAdd = rowIndex+1;
                        })
                    }
                    
                    let newRowId = uuid();
                    newData.splice(locToAdd, 0, {__CELL_ID__: newRowId});
                    props.setFocus({type: 'action', id: newRowId});
                    props.setData(newData);
                }
            }
            else{
                if (props.headers.length >= 50) 
                    props.setShowPop(MSG.UTILITY.ERR_COLUMN_50);
                else {
                    pushToHistory({headers: props.headers, data: props.data});
                    let newHeaders = [...props.headers];
                    let locToAdd = 0;
                    let headerId = props.checkList.list[0].split('||').pop();
                    
                    props.headers.forEach((header, headerIndex)=>{
                        if (header.__CELL_ID__ === headerId) locToAdd = headerIndex;
                    })
                    
                    let newHeaderId = uuid();
                    newHeaders.splice(locToAdd+1, 0, {
                        __CELL_ID__: newHeaderId,
                        name: `C${props.headerCounter}`
                    })
    
                    props.setFocus({type: "action", id: newHeaderId});
                    props.setHeaders(newHeaders);
                    props.setHeaderCounter(count => count + 1);
                }
            }
        }
        else {
            props.setShowPop({
                variant: VARIANT.ERROR, 
                content: props.checkList.list.length 
                        ? `Too many selected ${props.checkList.type === "row" ? "rows" : "columns"}`
                        : `Please select a row or column to perform add operation.`
            });
        }
    }

    
    const onDelete = () => {
        // HANDLE CHECKLIST
        if (props.checkList.list.length){
            if (props.checkList.type==="row"){
                if (props.checkList.list.includes("sel||row||subheader") || props.data.length === props.checkList.list.length)
                    props.setShowPop({
                        variant: VARIANT.WARNING,
                        content: props.checkList.list.includes("sel||row||subheader") 
                                ? 'Cannot delete SubHeader row.'
                                : 'Table cannot have 0 rows'
                    });
                else {
                    pushToHistory({headers: props.headers, data: props.data});
                    let [newData,] = deleteData(props.data, [], props.checkList.list);
                    props.setData(newData);
                }
            }
            else{
                if (props.headers.length === props.checkList.list.length)
                    props.setShowPop(MSG.UTILITY.ERR_COLUMN_0);
                else {
                    pushToHistory({headers: props.headers, data: props.data});
                    let [newHeaders, newData] = deleteData(props.headers, props.data, props.checkList.list);
                    props.setHeaders(newHeaders);
                    props.setData(newData);
                }
            }
            props.setCheckList({type: 'row', list: []});
        }
        else {
            props.setShowPop(MSG.UTILITY.ERR_DELETE);
        }
    }

    
    const onUndo = () => {
        const resp = getPreviousData({headers: props.headers, data: props.data});
        if (resp==="EMPTY_STACK") {
            props.setShowPop(MSG.UTILITY.ERR_UNDO);
        }
        else {
            if (resp.data) props.setData(resp.data);
            if (resp.headers) props.setHeaders(resp.headers);
        }
    }

    const onRedo = () => {
        const resp = getNextData({headers: props.headers, data: props.data});
        if (resp==="EMPTY_STACK") {
            props.setShowPop(MSG.UTILITY.ERR_REDO);
        }
        else {
            if (resp.data) props.setData(resp.data);
            if (resp.headers) props.setHeaders(resp.headers);
        }
    }

    const onCopy = () => {
        if (props.checkList.list.length) {
            let resp = prepareCopyData(props.headers, props.data, props.checkList);
            if (resp.isEmpty)
                props.setShowPop(MSG.UTILITY.ERR_EMPTY_COPY);
            else{
                dispatch({type: actionTypes.SET_COPY_CELLS, payload: resp.copiedData});
                props.setCheckList({type: 'row', list: []})
            }
        }
        else 
            props.setShowPop(MSG.UTILITY.ERR_SELECT_COPY);
    }

    const onPaste = () => {
        if (copiedCells.cells.length){
            if (copiedCells.type === 'rows' && props.data.length+copiedCells.cells.length > 199) 
                props.setShowPop(MSG.UTILITY.ERR_PASTE_200);
            else if (copiedCells.type === 'cols' && props.headers.length+copiedCells.cells.length > 50) 
                props.setShowPop(MSG.UTILITY.ERR_PASTE_50);
            else 
                setShowPS(true);
        }
        else {
            props.setShowPop(MSG.UTILITY.ERR_NO_DATA_PASTE);
        }
    }

    const pasteData = (pasteIndex) => {
        try{
            pushToHistory({headers: props.headers, data: props.data});
            const [newHeaders, newData] = pasteCells(copiedCells, props.headers, props.data, Number(pasteIndex))
            props.setHeaders([...newHeaders]);
            props.setData([...newData]);
            props.setCheckList({type: 'row', list: []})
            setShowPS(false);
        }
        catch (error) {
            setShowPS(false);
            console.error(error)
        }
    }

    const tableActionBtnGroup = [
        {'title': 'Add Selected Row/Column', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add', onClick: ()=>onAdd()},
        {'title': 'Drag & Drop Row', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Row', onClick:  ()=>props.setDnd(dnd => !dnd)},
        {'title': 'Remove Selected Row/Column', 'img': 'static/imgs/ic-delete.png', 'alt': 'Remove', onClick:  ()=>onDelete()},
        {'title': 'Copy Row/Col', 'img': 'static/imgs/ic-jq-copystep.png', 'alt': 'Copy', onClick: ()=>onCopy()},
        {'title': 'Paste Row/Col', 'img': 'static/imgs/ic-jq-pastestep.png', 'alt': 'Paste', onClick: ()=>onPaste()},
        {'title': 'Redo Last Changes', 'class': 'fa fa-repeat', 'alt': 'Redo', onClick:  ()=>onRedo()},
        {'title': 'Undo Last Changes', 'class': 'fa fa-undo', 'alt': 'Undo', onClick:  ()=>onUndo()},
    ]

    return (
        <div className="dt__table_ac_btn_grp">
            { showPS && <DtPasteStepDialog setShow={setShowPS} upperLimit={copiedCells.type === "cols" ? props.headers.length : props.data.length+1 } pasteData={pasteData} pasteType={copiedCells.type} /> }
            {
                tableActionBtnGroup.map((btn, i) => 
                    <button data-test="dt__tblActionBtns" key={i} className="dt__tblBtn" onClick={()=>btn.onClick()}>
                        { btn.img
                            ? <img className="dt__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title} />
                            : <i className={`dt__faBtn ${btn.class}`} title={btn.title} /> }
                    </button>
                )
            }
        </div>
    );
}

const CreateScreenActionButtons = props => {

    const [sheetList, setSheetList] = useState([]);
    const [excelContent, setExcelContent] = useState("");
    const [rowTag, setRowTag] = useState("");
    const [xmlContent, setXmlContent] = useState([]);

    const hiddenInput = useRef();


    const goToEditScreen = () => {
        let arg = prepareSaveData(props.tableName, props.headers, props.data);

        if (arg.data === "emptyData")
            props.setScreenType('datatable-Edit');
        else
            props.setModal({
                title: "Unsaved Data Found", 
                content: "Unsaved data will be lost. Are you sure you want to go to Edit Screen?", 
                onClick: ()=>{ props.setScreenType('datatable-Edit'); props.setModal(false); }
            });    
    }
    
    const saveDataTable = async() => {
        try{
            let arg = prepareSaveData(props.tableName, props.headers, props.data);

            let validation = validateData(arg.tableName, arg.data);

            switch (validation) {
                case "tableName": props.setErrors({tableName: true}); break;
                case "emptyData": props.setShowPop(MSG.UTILITY.ERR_EMPTY_SAVE); break;
                case "duplicateHeaders": props.setShowPop(MSG.UTILITY.ERR_DUPLICATE_HEADER); break;
                case "emptyHeader": props.setShowPop(MSG.UTILITY.ERR_SAVE_HEADER); break;
                case "saveData": 
                    props.setOverlay('Creating Data Table...');
                    let resp = await utilApi.createDataTable(arg);
                    props.setOverlay('');

                    switch (resp) {
                        case "exists": props.setShowPop(MSG.UTILITY.ERR_TABLE_EXIST); break;
                        case "fail": props.setShowPop(MSG.UTILITY.ERR_CREATE_TADATABLE); break;
                        case "success": props.setShowPop(MSG.UTILITY.SUCC_SAVE_DATATABLE); break;
                        default: props.setShowPop(resp.error); break;
                    }   
                    props.setErrors({}); 
                    break;
                default: props.setShowPop(MSG.UTILITY.ERR_CREATE_TADATABLE); break;
            }
        }
        catch(error) {
            props.setShowPop(MSG.UTILITY.ERR_CREATE_TADATABLE)
            console.error(error);
        }
    }

    const importDataTable = () => hiddenInput.current.click();

    const onInputChange = async(event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = async function (e) {
            try{
                hiddenInput.current.value = '';
                let importFormat = "";
                switch(file.name.split('.').pop().toLowerCase()){
                    case "csv": importFormat = "csv"; break;
                    case "xml": importFormat = "xml"; break;
                    case "xlsx": /* FALLTHROUGH  */
                    case "xls": importFormat = "excel"; break;
                    default : break;
                }

                if (importFormat == "") 
                    props.setShowPop(MSG.UTILITY.ERR_FILE_UNSUPPORTED);
                else if (importFormat === "xml") {
                    setRowTag("row");
                    setXmlContent(reader.result);
                } else {
                    props.setOverlay("Importing File...");
                    const resp = await utilApi.importDataTable({importFormat: importFormat, content: reader.result, flag: importFormat==="excel"?"sheetname":""});
                    if(importFormat === "excel") {
                        setSheetList(resp);
                        setExcelContent(reader.result);
                    } 
                    else if (resp == "columnExceeds") 
                        props.setShowPop(MSG.UTILITY.ERR_COL_15);
                    else if (resp == "rowExceeds")
                        props.setShowPop(MSG.UTILITY.ERR_ROW_200);
                    else if (resp == "emptyData")
                        props.setShowPop(MSG.UTILITY.ERR_EMPTY_DATA);
                    else {
                        const [, newData, newHeaders] = parseTableData(resp, "import")
                        props.setData(newData);
                        props.setHeaders(newHeaders);
                    }
                    props.setOverlay("");
                }
            }
            catch(error){
                console.error("ERROR:::", error);
                props.setOverlay("");
                props.setShowPop(MSG.UTILITY.ERR_LOAD)
            }
        }
        reader.readAsBinaryString(file);
    }

    return (
        <>
        { sheetList.length > 0 && <ImportSheet sheetList={sheetList} setSheetList={setSheetList} excelContent={excelContent} { ...props }  /> }
        { rowTag &&  <ImportXML rowTag={rowTag} setRowTag={setRowTag} xmlContent={xmlContent} { ...props }  />}
        <div className="dt__taskBtns">
            <input ref={hiddenInput} data-test="fileInput" id="importDT" type="file" style={{display: "none"}} onChange={onInputChange} accept=".xlsx, .xls, .csv, .xml"/>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={importDataTable} >Import</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={goToEditScreen}>Edit</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={saveDataTable}>Create</button>
        </div>
        </>
    );
}

const EditScreenActionButtons = props => {

    const [showExportPopup, setShowExportPopup] = useState(false);

    const confirmDelete = async() => {
        try{
            props.setOverlay("Confirming Delete Data Table...");
            const resp = await utilApi.confirmDeleteDataTable(props.tableName);
            props.setOverlay("")
            
            let deleteMsg = {
                title: "Confirm Delete Data Table", 
                content: "",
                onClick: ()=>{deleteDataTable();props.setModal(false);},
                type: 'confirm'
            }
            // onclick
            switch(resp){ 
                case "success": props.setModal({...deleteMsg, content: "Are you sure you want to delete current data table?"});break;
                case "referenceExists": props.setModal({...deleteMsg, content: "Data Table is referenced in Test Cases. Are you sure you want to delete current data table?"});break;
                default: props.setShowPop(MSG.UTILITY.ERR_DELETE_DATATABLE);break;
            }
        }
        catch(error) {
            props.setShowPop(MSG.UTILITY.ERR_DELETE_DATATABLE);
            console.error(error);
        }
    }

    const deleteDataTable = async() => {
        props.setOverlay("Deleting Data Table...");
        const resp = await utilApi.deleteDataTable(props.tableName);
        props.setOverlay("");

        if (resp === "success") {
            props.setScreenType("datatable-Create");
            props.setShowPop(MSG.UTILITY.SUCC_DELETE_DATATABLE);
        } else props.setShowPop(MSG.UTILITY.ERR_DELETE_DATATABLE);
    }

    const updateTable = async() => {
        try{
            let arg = prepareSaveData(props.tableName, props.headers, props.data);

            let validation = validateData(arg.tableName, arg.data);

            switch (validation) {
                case "tableName": props.setErrors({tableName: true}); break;
                case "emptyData": props.setShowPop(MSG.UTILITY.ERR_EMPTY_SAVE); break;
                case "duplicateHeaders": props.setShowPop(MSG.UTILITY.ERR_DUPLICATE_HEADER); break;
                case "saveData": 
                    props.setOverlay("Updating Data Table");
                    const resp = await utilApi.editDataTable(arg);
                    props.setOverlay("");
                    if (resp === "success") 
                        props.setShowPop(MSG.UTILITY.SUCC_UPDATE_DATATABLE)
                    else 
                        props.setShowPop(MSG.UTILITY.ERR_UPDATE_DATATABLE)
                    break;
                default: props.setShowPop(MSG.UTILITY.ERR_UPDATE_DATATABLE); break;
            }
        }
        catch(error) {
            props.setShowPop(MSG.UTILITY.ERR_UPDATE_DATATABLE)
            console.error(error);
        }
    }

    return (
        <>
        { showExportPopup && <ExportDataTable setShowExportPopup={setShowExportPopup} tableName={props.tableName} setOverlay={props.setOverlay} setShowPop={props.setShowPop} /> }
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={()=>setShowExportPopup(true)} disabled={!props.tableName} >Export</button>
            <button className="dt__taskBtn dt__btn" onClick={confirmDelete} disabled={!props.tableName}>Delete</button>
            <button className="dt__taskBtn dt__btn" onClick={updateTable} disabled={!props.tableName}>Update</button>
        </div>
        </>
    );
}


const SearchDataTable = props => {
    const searchRef = useRef('');
    const [list, setList] =  useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [dropdown, setDropdown] = useState(false);

    useEffect(()=>{
        setList(props.dataTables);
    }, [props.dataTables])

    const onTableSelect = async(event) => {
        const selectedTableName = event.target.value;

        props.setOverlay('Fetching Data Table...')
        const resp = await utilApi.fetchDataTable(selectedTableName);
        props.setOverlay('');

        if (resp.error) props.setShowPop(resp.error);
        else {
            const [tableName, newData, newHeaders] = parseTableData(resp[0], "edit")
            props.setData(newData);
            props.setHeaders(newHeaders);
            props.setTableName(tableName);
            searchRef.current.value = selectedTableName;
            setDropdown(false);
        }
    }

    const inputFilter = () =>{
        const searchInput = searchRef.current.value;
        let newFilteredList=[];
        if (searchInput) 
            newFilteredList = list.filter(item => item.name.toLowerCase().includes(searchInput.toLowerCase()));
        setFilteredList(newFilteredList);
    }
    const resetField = () => {
        searchRef.current.value = "";
        setFilteredList([]);
        setDropdown(true);
    }

    return(
        <>
        {/* <div>Enter Table Name:</div> */}
        <ClickAwayListener onClickAway={()=>setDropdown(false)}>
        <div className="dt__selectTable">Select Data Table:
        <div className="dt__searchDataTable">
            <input ref={searchRef} type='text' autoComplete="off" className="btn-users edit-user-dropdown-edit" onChange={inputFilter} onClick={resetField} placeholder="Search Data Table..."/>
            <div className="dt__form_dropdown" role="menu" style={{display: (dropdown?"block":"none")}}>
                <ScrollBar thumbColor="#929397" >
                {(filteredList.length ? filteredList : list)
                    .map((e, i) => (  
                        <option key={e._id} value={e.name} onClick={onTableSelect}>{e.name}</option> 
                    ))}
                </ScrollBar>
            </div>
        </div>
        </div>
        </ClickAwayListener>
        </>
    )
}


export { TableActionButtons, CreateScreenActionButtons, EditScreenActionButtons, SearchDataTable };
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import ClickAwayListener from 'react-click-away-listener';
import { pasteCells, prepareCopyData, validateData, prepareSaveData, deleteData, parseTableData, getNextData, getPreviousData, pushToHistory } from './DtUtils';
import { ScrollBar, VARIANT, Messages as MSG, setMsg } from '../../global';
import ExportDataTable from './ExportDataTable';
// import * as actionTypes from '../state/action';
import ImportPopUp from './ImportPopUp';
import * as utilApi from '../api';
import DtPasteStepDialog from './DtPasteStepDialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';


const TableActionButtons = props => {

    const dispatch = useDispatch();
    const copiedCells = useSelector(state=>state.utility.copiedCells)
    const [showPS, setShowPS] = useState(false);
    const toast = useRef();


    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }
    
      const toastSuccess = (successMessage) => {
        if (successMessage && successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
      }

    const onAdd = () => {
        if (props.checkList.list.length===1){
            if (props.checkList.type==="row"){
                if (props.data.length >= 199) 
                    toastError(MSG.UTILITY.ERR_ROWS_200);
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
                    toastError(MSG.UTILITY.ERR_COLUMN_50);
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
            toastError(MSG.CUSTOM(props.checkList.list.length 
                ? `Too many selected ${props.checkList.type === "row" ? "rows" : "columns"}`
                : `Please select a row or column to perform add operation.`,VARIANT.ERROR));
        }
    }

    
    const onDelete = () => {
        // HANDLE CHECKLIST
        if (props.checkList.list.length){
            if (props.checkList.type==="row"){
                if (props.checkList.list.includes("sel||row||subheader") || props.data.length === props.checkList.list.length)
                toastError(MSG.CUSTOM(props.checkList.list.includes("sel||row||subheader") 
                    ? 'Cannot delete SubHeader row.'
                    : 'Table cannot have 0 rows',VARIANT.WARNING));
                else {
                    pushToHistory({headers: props.headers, data: props.data});
                    let [newData,] = deleteData(props.data, [], props.checkList.list);
                    props.setData(newData);
                }
            }
            else{
                if (props.headers.length === props.checkList.list.length)
                toastError(MSG.UTILITY.ERR_COLUMN_0);
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
            toastError(MSG.UTILITY.ERR_DELETE);
        }
    }

    
    const onUndo = () => {
        const resp = getPreviousData({headers: props.headers, data: props.data});
        if (resp==="EMPTY_STACK") {
            toastError(MSG.UTILITY.ERR_UNDO);
        }
        else {
            if (resp.data) props.setData(resp.data);
            if (resp.headers) props.setHeaders(resp.headers);
        }
    }

    const onRedo = () => {
        const resp = getNextData({headers: props.headers, data: props.data});
        if (resp==="EMPTY_STACK") {
            toastError(MSG.UTILITY.ERR_REDO);
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
            toastError(MSG.UTILITY.ERR_EMPTY_COPY);
            else{
                // dispatch({type: actionTypes.SET_COPY_CELLS, payload: resp.copiedData});
                props.setCheckList({type: 'row', list: []})
            }
        }
        else 
        toastError(MSG.UTILITY.ERR_SELECT_COPY);
    }

    const onPaste = () => {
        if (copiedCells.cells.length){
            if (copiedCells.type === 'rows' && props.data.length+copiedCells.cells.length > 199) 
            toastError(MSG.UTILITY.ERR_PASTE_200);
            else if (copiedCells.type === 'cols' && props.headers.length+copiedCells.cells.length > 50) 
            toastError(MSG.UTILITY.ERR_PASTE_50);
            else 
                setShowPS(true);
        }
        else {
            toastError(MSG.UTILITY.ERR_NO_DATA_PASTE);
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
        {'title': 'Redo Last Changes', 'img': 'static/imgs/redo_icon.svg','class': 'fa fa-repeat', 'alt': 'Redo', onClick:  ()=>onRedo()},
        {'title': 'Undo Last Changes','img': 'static/imgs/undo_icon.svg', 'class': 'fa fa-undo', 'alt': 'Undo', onClick:  ()=>onUndo()},
    ]

    return (
        <>
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        <div className="dt__table_ac_btn_grp">
            { showPS && <DtPasteStepDialog setShow={setShowPS} upperLimit={copiedCells.type === "cols" ? props.headers.length : props.data.length+1 } pasteData={pasteData} pasteType={copiedCells.type} /> }
            {
                tableActionBtnGroup.map((btn, i) => 
                    <button data-test="dt__tblActionBtns" key={i} className={"dt__tblBtn "+(props.dnd && btn.alt && btn.alt==="Drag Row"?"selected-btn":"")} onClick={()=>btn.onClick()}>
                        { btn.img
                            ? <img className="dt__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title} />
                            : <i className={`dt__faBtn ${btn.class}`} title={btn.title} /> }
                    </button>
                )
            }
        </div>
        </>
    );
}

const CreateScreenActionButtons = props => {
    const toast= useRef();
    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }
    
      const toastSuccess = (successMessage) => {
        if (successMessage && successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
      }

    const [importPopup, setImportPopup] = useState(false);

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
                case "emptyData": toastError(MSG.UTILITY.ERR_EMPTY_SAVE); break;
                case "duplicateHeaders": toastError(MSG.UTILITY.ERR_DUPLICATE_HEADER); break;
                case "emptyHeader": toastError(MSG.UTILITY.ERR_SAVE_HEADER); break;
                case "saveData": 
                    props.setOverlay('Creating Data Table...');
                    let resp = await utilApi.createDataTable(arg);
                    props.setOverlay('');

                    switch (resp) {
                        case "exists": toastError(MSG.UTILITY.ERR_TABLE_EXIST); break;
                        case "fail": toastError(MSG.UTILITY.ERR_CREATE_TADATABLE); break;
                        case "success": toastSuccess(MSG.UTILITY.SUCC_SAVE_DATATABLE); break;
                        default: toastError(resp.error); break;
                    }   
                    props.setErrors({}); 
                    break;
                default: toastError(MSG.UTILITY.ERR_CREATE_TADATABLE); break;
            }
        }
        catch(error) {
            toastError(MSG.UTILITY.ERR_CREATE_TADATABLE)
            console.error(error);
        }
    }

    return (
        <>
         <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        { importPopup && <ImportPopUp setImportPopup={setImportPopup} importPopup={importPopup} setData={props.setData} setHeaders={props.setHeaders} setOverlay={props.setOverlay} { ...props } />}
        <div className="dt__taskBtns">
            <Button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" title="Import" label='Import' onClick={() => setImportPopup(true)} ></Button>
            <Button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" title="Edit" label='Edit' onClick={goToEditScreen}></Button>
            <Button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" title="Create"  label='Create' onClick={saveDataTable}></Button>
        </div>
        </>
    );
}

const EditScreenActionButtons = props => {
    const toast= useRef();
    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }
    
      const toastSuccess = (successMessage) => {
        if (successMessage && successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
      }

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
                default: toastError(MSG.UTILITY.ERR_DELETE_DATATABLE);break;
            }
        }
        catch(error) {
            toastError(MSG.UTILITY.ERR_DELETE_DATATABLE);
            console.error(error);
        }
    }

    const deleteDataTable = async() => {
        props.setOverlay("Deleting Data Table...");
        const resp = await utilApi.deleteDataTable(props.tableName);
        props.setOverlay("");

        if (resp === "success") {
            props.setScreenType("datatable-Create");
            toastSuccess(MSG.UTILITY.SUCC_DELETE_DATATABLE);
        } else toastError(MSG.UTILITY.ERR_DELETE_DATATABLE);
    }

    const updateTable = async() => {
        try{
            let arg = prepareSaveData(props.tableName, props.headers, props.data);

            let validation = validateData(arg.tableName, arg.data);

            switch (validation) {
                case "tableName": props.setErrors({tableName: true}); break;
                case "emptyData": toastError(MSG.UTILITY.ERR_EMPTY_SAVE); break;
                case "duplicateHeaders": toastError(MSG.UTILITY.ERR_DUPLICATE_HEADER); break;
                case "saveData": 
                    props.setOverlay("Updating Data Table");
                    const resp = await utilApi.editDataTable(arg);
                    props.setOverlay("");
                    if (resp === "success") 
                    toastSuccess(MSG.UTILITY.SUCC_UPDATE_DATATABLE)
                    else 
                    toastError(MSG.UTILITY.ERR_UPDATE_DATATABLE)
                    break;
                default: toastError(MSG.UTILITY.ERR_UPDATE_DATATABLE); break;
            }
        }
        catch(error) {
            toastError(MSG.UTILITY.ERR_UPDATE_DATATABLE)
            console.error(error);
        }
    }

    return (
        <>
         <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        { showExportPopup && <ExportDataTable setShowExportPopup={setShowExportPopup} showExportPopup={showExportPopup} tableName={props.tableName} setOverlay={props.setOverlay} /> }
        <div className="dt__taskBtns">
            <Button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" title="Export" label='Export' onClick={()=>setShowExportPopup(true)} disabled={!props.tableName} ></Button>
            <Button className="dt__taskBtn dt__btn" title="Delete" label='Delete' onClick={confirmDelete} disabled={!props.tableName}></Button>
            <Button className="dt__taskBtn dt__btn" title="Update"  label='Update' onClick={updateTable} disabled={!props.tableName}></Button>
        </div>
        </>
    );
}


const SearchDataTable = props => {
    const searchRef = useRef('');
    const [list, setList] =  useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [dropdown, setDropdown] = useState(false);
    const toast= useRef();
    const toastError = (erroMessage) => {
        if (erroMessage && erroMessage.CONTENT) {
          toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
      }
    
      const toastSuccess = (successMessage) => {
        if (successMessage && successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
      }

    useEffect(()=>{
        setList(props.dataTables);
    }, [props.dataTables])

    const onTableSelect = async(event) => {
        const selectedTableName = event.target.value;

        props.setOverlay('Fetching Data Table...')
        const resp = await utilApi.fetchDataTable(selectedTableName);
        props.setOverlay('');

        if (resp.error) toastError(resp.error);
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
         <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        {/* <div>Enter Table Name:</div> */}
        <ClickAwayListener onClickAway={()=>setDropdown(false)}>
        <div className="dt__selectTable pb-5">Select Data Table:
        <div className="dt__searchDataTable">
            <input ref={searchRef} type='text' autoComplete="off" className="btn-users edit-user-dropdown-edit" onChange={inputFilter} onClick={resetField} placeholder="Search Data Table..."/>
            <div className="dt__form_dropdown" role="menu" style={{display: (dropdown?"block":"none")}}>
                {(filteredList.length ? filteredList : list)
                    .map((e, i) => (  
                        <option key={e._id} value={e.name} onClick={onTableSelect}>{e.name}</option> 
                    ))}
            </div>
        </div>
        </div>
        </ClickAwayListener>
        </>
    )
}


export { TableActionButtons, CreateScreenActionButtons, EditScreenActionButtons, SearchDataTable };
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import { updateData, validateData, prepareSaveData, deleteData, parseTableData } from './DtUtils';
import ExportDataTable from './ExportDataTable';
import ImportSheet from './ImportSheet';
import * as utilApi from '../api';


const TableActionButtons = props => {

    const onAdd = () => {
        if (props.checkList.list.length===1){
            if (props.checkList.type==="row"){
                if (props.data.length >= 199) 
                    props.setShowPop({title: 'Error', content: 'Table cannot have more than 200 rows', type: 'message'});
                else {
                    let newData = [...props.data];
                    let locToAdd = null;
                    let rowId = props.checkList.list[0].split('||').pop();
    
                    newData.forEach((row, rowIndex) => {
                        if (rowId === row.__CELL_ID__) locToAdd = rowIndex;
                    })
                    
                    newData.splice(locToAdd+1, 0, {__CELL_ID__: uuid()});
    
                    props.setData(newData);
                }
            }
            else{
                if (props.headers.length >= 15) 
                    props.setShowPop({title: 'Error', content: 'Table cannot have more than 15 columns', type: 'message'});
                else {
                    let newHeaders = [...props.headers];
                    let locToAdd = null;
                    let headerId = props.checkList.list[0].split('||').pop();
                    
                    props.headers.forEach((header, headerIndex)=>{
                        if (header.__CELL_ID__ === headerId) locToAdd = headerIndex;
                    })
                    
                    newHeaders.splice(locToAdd+1, 0, {
                        __CELL_ID__: uuid(),
                        name: `C${props.headerCounter}`
                    })
    
                    props.setHeaders(newHeaders);
                    props.setHeaderCounter(count => count + 1);
                }
            }
        }
    }

    
    const onDelete = () => {
        // HANDLE CHECKLIST
        if (props.checkList.list.length){
            if (props.checkList.type==="row"){
                if (props.data.length === props.checkList.list.length)
                    props.setShowPop({title: 'Error', content: 'Table cannot have 0 rows', type: 'message'});
                else {
                    let [newData,] = deleteData(props.data, [], props.checkList.list);
                    props.setData(newData);
                }
            }
            else{
                if (props.headers.length === props.checkList.list.length)
                    props.setShowPop({title: 'Error', content: 'Table cannot have 0 columns', type: 'message'});
                else {
                    let [newHeaders, newData] = deleteData(props.headers, props.data, props.checkList.list);
                    props.setHeaders(newHeaders);
                    props.setData(newData);
                }
            }
        }
    }

    
    const onUndo = () => {
        if (props.undoStack.length) {
            const lastEntry = props.undoStack.pop();
            const [prevValue, newData, found] = updateData(props.data, props.headers, lastEntry);
            if (found) {
                props.setData(newData);
                props.redoStack.push(prevValue);
                if (props.redoStack.length>5) props.redoStack.splice(0, 1);
            }
            else console.log("Cell Not Found!")
        }
        else console.log("Nothing to Undo")
    }

    const onRedo = () => {
        if (props.redoStack.length) {
            const lastEntry = props.redoStack.pop();
            const [prevValue, newData, found] = updateData(props.data, props.headers, lastEntry);
            if (found) {
                props.setData(newData);
                props.undoStack.push(prevValue);
            }
            else console.log("Cell Not Found!")
        }
        else console.log("Nothing to Redo")
    }

    const tableActionBtnGroup = [
        {'title': 'Add Selected Row/Column', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add', onClick: ()=>onAdd()},
        {'title': 'Drag & Drop Row', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Row', onClick:  ()=>props.setDnd(dnd => !dnd)},
        {'title': 'Remove Selected Row/Column', 'img': 'static/imgs/ic-delete.png', 'alt': 'Remove', onClick:  ()=>onDelete()},
        {'title': 'Redo Last Changes', 'class': 'fa fa-repeat', 'alt': 'Redo', onClick:  ()=>onRedo()},
        {'title': 'Undo Last Changes', 'class': 'fa fa-undo', 'alt': 'Undo', onClick:  ()=>onUndo()},
    ]

    return (
        <div className="dt__table_ac_btn_grp">
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

    const hiddenInput = useRef();

    
    const goToEditScreen = () => {
        props.setScreenType('datatable-Edit');
    }
    
    const saveDataTable = async() => {
        try{
            let arg = prepareSaveData(props.tableName, props.headers, props.data);

            let validation = validateData(arg.tableName, arg.data);

            switch (validation) {
                case "tableName": props.setErrors({tableName: true}); break;
                case "emptyData": props.setShowPop({title: "Empty Data Error", content: "Cannot Save Empty Data", type: "message"}); break;
                case "saveData": 
                    props.setOverlay('Creating Data Table...');
                    let resp = await utilApi.createDataTable(arg);
                    props.setOverlay('');

                    switch (resp) {
                        case "exists": props.setShowPop({title: 'Data Table', content: 'Data Table Already Exist!', type: "message"}); break;
                        case "fail": props.setShowPop({title: 'Data Table', content: 'Failed to Create Data Table', type: "message"}); break;
                        case "success": props.setShowPop({title: 'Data Table', content: 'Data Table Saved Successfully!', type: "message"}); break;
                        default: props.setShowPop({title: 'Data Table Error', content: resp.error || "Failed To Create Data Table", type: "message"}); break;
                    }   
                    props.setErrors({}); 
                    break;
                default: props.setShowPop({title: 'Data Table', content: 'Failed to Create Data Table', type: "message"}); break;
            }
        }
        catch(error) {
            props.setShowPop({title: 'Data Table', content: 'Failed to Create Data Table', type: "message"})
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
                let importFormat = "excel";
                switch(file.name.split('.').pop().toLowerCase()){
                    case "csv": importFormat = "csv"; break;
                    case "xml": importFormat = "xml"; break;
                    case "xlsx": /* FALLTHROUGH  */
                    case "xls": importFormat = "excel"; break;
                    default : break;
                }

                const resp = await utilApi.importDataTable({importFormat: importFormat, content: reader.result, flag: importFormat==="excel"?"sheetname":""});
                
                if(importFormat === "excel") {
                    setSheetList(resp);
                    setExcelContent(reader.result);
                } 
                else if (resp == "columnExceeds") {
                    props.setShowPop({title: "Error File Read", content: "Column should not exceed 15", type: "message"});
                } 
                else if (resp == "rowExceeds") {
                    props.setShowPop({title: "Error File Read", content: "Row should not exceed 200", type: "message"});
                }
                else {
                    const [, newData, newHeaders] = parseTableData(resp)
                    props.setData(newData);
                    props.setHeaders(newHeaders);
                }
            }
            catch(error){
                console.error("ERROR:::", error);
                props.setShowPop({title: "Error File Read", content: "Failed to Load file", type: "message"})
            }
        }
        reader.readAsBinaryString(file);
    }

    return (
        <>
        { sheetList.length > 0 && <ImportSheet sheetList={sheetList} setSheetList={setSheetList} excelContent={excelContent} { ...props }  /> }
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
                onClick: ()=>deleteDataTable(),
                type: 'confirm'
            }

            switch(resp){
                case "success": props.setShowPop({...deleteMsg, content: "Are you sure you want to delete current data table?"});break;
                case "referenceExists": props.setShowPop({...deleteMsg, content: "Data Table is referenced in Test Cases. Are you sure you want to delete current data table?"})
                default: props.setShowPop({ title: "Error Data Table", content: "Failed to Delete Data Table", type: "message" });break;
            }
        }
        catch(error) {
            props.setShowPop({ title: "Error Data Table", content: "Failed to Delete Data Table", type: "message" });
            console.error(error);
        }
    }

    const deleteDataTable = async() => {
        props.setOverlay("Deleting Data Table...");
        const resp = await utilApi.deleteDataTable(props.tableName);
        props.setOverlay("");

        if (resp === "success")
            props.setShowPop({title: "Delete Data Table", content: "Data Table Deleted Successfully.", type: "message", onClick:()=>props.setScreenType("datatable-Create")});
        else 
            props.setShowPop({title: "Delete Data Table", content: "Failed to delete data table", type: "message"});

    }

    const updateTable = async() => {
        props.setOverlay("Updating Data Table");
        const resp = await utilApi.editDataTable(prepareSaveData(props.tableName, props.headers, props.data));
        props.setOverlay("");

        if (resp === "success") 
            props.setShowPop({title: "Update Data Table", content: "Data Table Updated Successfully.", type: "message"})
        else 
            props.setShowPop({title: "Update Data Table", content: "Failed to Update Data Table.", type: "message"})
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

        if (resp.error) props.setShowPop({title: "Data Table Error", content: resp.error, type: "message"});
        else {
            const [tableName, newData, newHeaders] = parseTableData(resp[0])
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
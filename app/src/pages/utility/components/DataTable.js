import React, { useState, useEffect, useRef }  from 'react';
import { v4 as uuid } from 'uuid';
// import { tableData, datatables } from './dummydata';
import ExportDataTable from './ExportDataTable';
import ImportSheet from './ImportSheet';
import ClickAwayListener from 'react-click-away-listener';
import { PopupMsg, ScrollBar, ModalContainer, ScreenOverlay } from '../../global';
import Table from './Table';
import * as utilApi from '../api';
import "../styles/DataTable.scss";


let undoStack = [];

const DataTable = props => {

    const [currScreen, setCurrScreen] = useState(props.currScreen);
    const [data, setData] = useState([{id: uuid()}]);

    const [headers, setHeaders] = useState([{id: uuid(), name: 'C1'}, {id: uuid(), name: 'C2'}]);
    const [checkList, setCheckList] = useState({type: 'row', list: []});
    const [dnd, setDnd] = useState(false);
    const [headerCounter, setHeaderCounter] = useState(3);
    const [dataTables, setDataTables] = useState([]);
    const [showPop, setShowPop] = useState(false);
    const [overlay, setOverlay] = useState('');
    const [tableName, setTableName] = useState('');
    const [errors, setErrors] = useState({});
    /*
        undoStack: [
            { row: <row-id>, col: <col-id>, value: old-value }
        ]
    */

    useEffect(()=>{
        setCurrScreen(props.currScreen)
        resetStates();
    }, [props.currScreen])


    const onUndo = () => {
        if (undoStack.length) {
            const lastEntry = undoStack.pop();
            const [newData, found] = undoData(data, headers, lastEntry);
            if (found) setData(newData);
            else console.log("Cell Not Found!")
        }
        else console.log("Nothing to Undo")
    }

    const resetStates = () => {
        if (props.currScreen === "Create") {
            setData([{id: uuid()}]);
            setDataTables([]);
            setTableName("");
        }
        else setData([]);
        undoStack=[];
        setHeaders([{id: uuid(), name: 'C1'}, {id: uuid(), name: 'C2'}]);
        setCheckList({type: 'row', list: []});
        setDnd(false);
        setHeaderCounter(3);
        setShowPop(false);
    }


    const saveDataTable = async() => {
        try{
            let error = validateData(tableName);
            
            if (error) setErrors(error);
            else {
                let arg = prepareSaveData(tableName, headers, data);

                setOverlay('Creating Data Table...');
                let resp = await utilApi.createDataTable(arg);
                setOverlay('');

                switch (resp) {
                    case "exists": setShowPop({title: 'Data Table', content: 'Data Table Already Exist!', type: "message"}); break;
                    case "fail": setShowPop({title: 'Data Table', content: 'Failed to Create Data Table', type: "message"}); break;
                    case "success": setShowPop({title: 'Data Table', content: 'Data Table Saved Successfully!', type: "message"}); break;
                    default: setShowPop({title: 'Data Table Error', content: resp.error || "Failed To Create Data Table", type: "message"}); break;
                }   
                setErrors({})
            }
        }
        catch(error) {
            setShowPop({title: 'Data Table', content: 'Failed to Create Data Table', type: "message"})
            console.error(error);
        }
    }

    const onAdd = type => {
        if (type==="col") {
            let newHeaders = [...headers];
            
            newHeaders.push({
                id: uuid(),
                name: `C${headerCounter}`
            })

            setHeaders(newHeaders);
            setHeaderCounter(count => count + 1);
        }
        else if (type === "row") {
            let newData = [...data];
            
            newData.push({id: uuid()})

            setData(newData);
        }
        else if (checkList.list.length===1){
            if (checkList.type==="row"){
                let newData = [...data];
                let locToAdd = null;
                let rowId = checkList.list[0].split('||').pop();

                newData.forEach((row, rowIndex) => {
                    if (rowId === row.id) locToAdd = rowIndex;
                })
                
                newData.splice(locToAdd+1, 0, {id: uuid()});

                setData(newData);
            }
            else{
                let newHeaders = [...headers];
                let locToAdd = null;
                let headerId = checkList.list[0].split('||').pop();
                
                headers.forEach((header, headerIndex)=>{
                    if (header.id === headerId) locToAdd = headerIndex;
                })
                
                newHeaders.splice(locToAdd+1, 0, {
                    id: uuid(),
                    name: `C${headerCounter}`
                })

                setHeaders(newHeaders);
                setHeaderCounter(count => count + 1);
            }
        }
    }

    const onDelete = () => {
        // HANDLE CHECKLIST
        if (checkList.list.length){
            if (checkList.type==="row"){
                if (data.length === checkList.list.length)
                    setShowPop({title: 'Error', content: 'Table cannot have 0 rows', type: 'message'});
                else {
                    let [newData,] = deleteData(data, [], checkList.list);
                    setData(newData);
                }
            }
            else{
                if (headers.length === checkList.list.length)
                    setShowPop({title: 'Error', content: 'Table cannot have 0 columns', type: 'message'});
                else {
                    let [newHeaders, newData] = deleteData(headers, data, checkList.list);
                    setHeaders(newHeaders);
                    setData(newData);
                }
            }
        }
    }

    const goToEditScreen = async() => {
        // FETCHING DATATABLES VIA API
        try{
            setOverlay('Fetching Data Tables...');
            
            const resp = await utilApi.fetchDataTables();
            
            setOverlay('');

            if (resp.error) 
                setShowPop({title: 'Data Table Error', content: resp.error, type: "message"});
            if (resp === 'fail')
                setShowPop({title: 'Data Table Error', content: 'Failed to Fetch Data Tables', type: "message"});
            if (typeof(resp) === 'object') {
                setDataTables(resp);
                props.setScreenType('datatable-Edit');
            }
        }
        catch(error) {
            setShowPop({title: 'Data Table', content: 'Failed To Fetch Data Tables!', type: "message"})
            console.error(error);
        }
    }

    const Popup = () => (
        <>
        { showPop.type === "message" &&
        <PopupMsg 
            title={showPop.title}
            content={showPop.content}
            close={()=>{setShowPop(false); showPop.onClick&&showPop.onClick()}}
            submitText="OK"
            submit={()=>{setShowPop(false); showPop.onClick&&showPop.onClick()}}
        /> }
        { showPop.type === "confirm" &&
        <ModalContainer 
            title={showPop.title}
            content={showPop.content}
            close={()=>showPop(false)}
            footer={
                <>
                <button onClick={showPop.onClick}>
                    {showPop.continueText ? showPop.continueText : "Yes"}
                </button>
                <button onClick={()=>showPop(false)}>
                    {showPop.rejectText ? showPop.rejectText : "No"}
                </button>
                </>
            }
        /> }
        </>
    )

    return <>
        { showPop && <Popup /> }
        { overlay && <ScreenOverlay content={overlay} /> }
        <div className="page-taskName" >
            <span className="taskname" data-test="dt__pageTitle">
                {currScreen} Data Table
            </span>
        </div>
        
        { currScreen === "Create" && <TableName tableName={tableName} setTableName={setTableName} error={errors.tableName} /> }
        <div className="dt__btngroup">
            <TableActionButtons 
                onAdd={onAdd} 
                setDnd={setDnd} 
                onDelete={onDelete} 
                onUndo={onUndo}
            />
            { currScreen === "Create" 
                ? <CreateScreenActionButtons goToEditScreen={goToEditScreen} saveDataTable={saveDataTable} />
                : <EditScreenActionButtons setShowPop={setShowPop} tableName={tableName} setOverlay={setOverlay} setScreenType={props.setScreenType} headers={headers} data={data} />
            }
        </div>

        { currScreen==="Edit" && <SearchDataTable dataTables={dataTables} setData={setData} setHeaders={setHeaders} setTableName={setTableName} setOverlay={setOverlay} setShowPop={setShowPop} /> }

        <div className="dt__table_container full__dt">
            {data.length>0 && 
            <Table 
                data={data}
                setData={setData}
                headers={headers}
                setHeaders={setHeaders}
                checkList={checkList}
                setCheckList={setCheckList}
                onAdd={onAdd}
                dnd={dnd} 
                undoStack={undoStack}
                setShowPop={setShowPop}
            />}
        </div>
    </>;
}

const TableName = ({tableName, setTableName, error}) => {
    const [value, setValue] = useState(tableName || '');

    useEffect(()=>{
        setValue(tableName)
    }, [tableName]);

    const onChange = e => setValue(e.target.value);
    const onBlur = () => setTableName(value);

    return (
        <div className="dt__tableName">
            Data Table Name:
            <input className={error?"dt__tableNameError":""} onBlur={onBlur} onChange={onChange} placeholder="Enter Data Table Name" />
        </div>
    );
}

const TableActionButtons = ({ onAdd, setDnd, onDelete, onUndo }) => {

    const tableActionBtnGroup = [
        {'title': 'Add Selected Row/Column', 'img': 'static/imgs/ic-jq-addstep.png', 'alt': 'Add', onClick: ()=>onAdd()},
        {'title': 'Drag & Drop Row', 'img': 'static/imgs/ic-jq-dragstep.png', 'alt': 'Drag Row', onClick:  ()=>setDnd(dnd => !dnd)},
        {'title': 'Remove Selected Row/Column', 'img': 'static/imgs/ic-delete.png', 'alt': 'Remove', onClick:  ()=>onDelete()},
        {'title': 'Undo Last Changes', 'img': 'static/imgs/ic-cycle.png', 'alt': 'Remove', onClick:  ()=>onUndo()}
    ]

    return (
        <div className="dt__table_ac_btn_grp">
            {
                tableActionBtnGroup.map((btn, i) => 
                    <button data-test="dt__tblActionBtns" key={i} className="dt__tblBtn" onClick={()=>btn.onClick()}><img className="dt__tblBtn_ic" src={btn.img} alt={btn.alt} title={btn.title}/> </button>
                )
            }
        </div>
    );
}

const CreateScreenActionButtons = props => {

    const [sheetList, setSheetList] = useState([]);
    const [excelContent, setExcelContent] = useState("");

    const hiddenInput = useRef();

    const importDataTable = () => hiddenInput.current.click();

    const onInputChange = async(event) => {
        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = async function (e) {
            hiddenInput.current.value = '';
            let importFormat = "excel";
            if (file.name.split('.').pop().toLowerCase() === "csv") importFormat = "csv";

            const resp = await utilApi.importDataTable({importFormat: importFormat, content: reader.result, flag: importFormat==="excel"?"sheetname":""});
            
            if(typeof resp === "object") {
                setSheetList(resp);
                setExcelContent(reader.result);
            }
            console.log(resp)
        }
        reader.readAsBinaryString(file);
    }

    return (
        <>
        { sheetList.length ? <ImportSheet sheetList={sheetList} setSheetList={setSheetList} excelContent={excelContent} />:null }
        <div className="dt__taskBtns">
            <input ref={hiddenInput} data-test="fileInput" id="importDT" type="file" style={{display: "none"}} onChange={onInputChange} accept=".json, .xlsx, xls, .csv"/>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={importDataTable} >Import</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.goToEditScreen}>Edit</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.saveDataTable}>Create</button>
        </div>
        </>
    );
}

const EditScreenActionButtons = ({setShowPop, tableName, setOverlay, setScreenType, headers, data}) => {

    const [showExportPopup, setShowExportPopup] = useState(false);

    const confirmDelete = async() => {
        try{
            setOverlay("Confirming Delete Data Table...");
            const resp = await utilApi.confirmDeleteDataTable(tableName);
            setOverlay("")
            
            let deleteMsg = {
                title: "Confirm Delete Data Table", 
                content: "",
                onClick: ()=>deleteDataTable(),
                type: 'confirm'
            }

            switch(resp){
                case "success": setShowPop({...deleteMsg, content: "Are you sure you want to delete current data table?"});break;
                case "referenceExists": setShowPop({...deleteMsg, content: "Data Table is referenced in Test Cases. Are you sure you want to delete current data table?"})
                default: setShowPop({ title: "Error Data Table", content: "Failed to Delete Data Table", type: "message" });break;
            }
        }
        catch(error) {
            setShowPop({ title: "Error Data Table", content: "Failed to Delete Data Table", type: "message" });
            console.error(error);
        }
    }

    const deleteDataTable = async() => {
        setOverlay("Deleting Data Table...");
        const resp = await utilApi.deleteDataTable(tableName);
        setOverlay("");

        if (resp === "success")
            setShowPop({title: "Delete Data Table", content: "Data Table Deleted Successfully.", type: "message", onClick:()=>setScreenType("datatable-Create")});
        else 
            setShowPop({title: "Delete Data Table", content: "Failed to delete data table", type: "message"});

    }

    const updateTable = async() => {
        setOverlay("Updating Data Table");
        const resp = await utilApi.editDataTable(prepareSaveData(tableName, headers, data));
        setOverlay("");

        if (resp === "success") 
            setShowPop({title: "Update Data Table", content: "Data Table Updated Successfully.", type: "message"})
        else 
            setShowPop({title: "Update Data Table", content: "Failed to Update Data Table.", type: "message"})
    }

    return (
        <>
        { showExportPopup && <ExportDataTable setShowExportPopup={setShowExportPopup} tableName={tableName} /> }
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={()=>setShowExportPopup(true)} disabled={!tableName} >Export</button>
            <button className="dt__taskBtn dt__btn" onClick={confirmDelete} disabled={!tableName}>Delete</button>
            <button className="dt__taskBtn dt__btn" onClick={updateTable} disabled={!tableName}>Update</button>
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
            newFilteredList = list.filter(item => item.datatablename.toLowerCase().includes(searchInput.toLowerCase()));
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
                        <option key={e._id} value={e.datatablename} onClick={onTableSelect}>{e.datatablename}</option> 
                    ))}
                </ScrollBar>
            </div>
        </div>
        </div>
        </ClickAwayListener>
        </>
    )
}

const parseTableData = table => {
    // NAME
    let dataTableName = table.datatablename;

    let newData = JSON.parse(JSON.stringify([...table.datatable]))
    
    newData.forEach(row => {
        row['id'] = uuid();
    })
    
    // SETTING UP COLUMN HEADERS
    let colHeaders = [...table.dtheaders];
    let newHeaders = [];
    for(let i=0; i<colHeaders.length; i++) {
        newHeaders.push({
            id: uuid(),
            name: colHeaders[i],
        })
    }
    
    return [dataTableName, newData, newHeaders]
}

const undoData = (data, headers, lastEntry) => {
    let columnName = null;
    let newData = [...data];
    let found = false;
    for (let header of headers) {
        if (header.id === lastEntry.colId) {
            columnName = header.name;
            found = true;
            break;
        }
    }

    for (let row of newData) {
        if (row.id === lastEntry.rowId && columnName in row) {
            row[columnName] = lastEntry.value;
            found = true;
            break;
        }
    }

    return [newData, found];
}

function deleteData (dataOne, dataTwo, checkList) {
    let arrayOne = [...dataOne];
    let arrayTwo = [...dataTwo];
    let shouldBreak = !arrayTwo.length;
    for (let listItem of checkList){
        let dataId = listItem.split('||').pop();
        
        for (let i=0; i<arrayOne.length; i++){
            if (dataId === arrayOne[i].id) {
                arrayTwo.forEach(row => {
                    delete row[arrayOne[i].name]
                })
                arrayOne.splice(i, 1);
                if (shouldBreak) break;
            }
        }
    }

    return [arrayOne, arrayTwo];
}

function prepareSaveData (tableName, headers, data){
    const dataTableName = tableName;
    const headerArray = headers.map(header => header.name);
    const valuesArray = data.map(row => {
        let filteredObject = {};
        headerArray.forEach(headerName => {
            filteredObject[headerName] = row[headerName] || "";
        })
        return filteredObject;
    })

    return {
        tableName: dataTableName,
        headers: headerArray,
        data: valuesArray
    }
}

function validateData (tableName) {
    let error = false;

    if (!tableName)
        error = {tableName: !tableName};
    return error;
}

const undoData = (data, headers, lastEntry) => {
    let columnName = null;
    let newData = [...data];
    let found = false;
    for (let header of headers) {
        if (header.id === lastEntry.colId) {
            columnName = header.name;
            found = true;
            break;
        }
    }

    for (let row of newData) {
        if (row.id === lastEntry.rowId && columnName in row) {
            row[columnName] = lastEntry.value;
            found = true;
            break;
        }
    }

    return [newData, found];
}

export default DataTable;
import React, { useState, useEffect, useRef }  from 'react';
import { v4 as uuid } from 'uuid';
// import { tableData, datatables } from './dummydata';
import ClickAwayListener from 'react-click-away-listener';
import { PopupMsg, ScrollBar } from '../../global';
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
    const [tableName, setTableName] = useState('');
    /*
        undoStack: [
            { row: <row-id>, col: <col-id>, value: old-value }
        ]
    */

    useEffect(()=>{
        // GET DATA FROM API
        // let newData = JSON.parse(JSON.stringify([...tableData]));
        // newData.forEach((row, index) => {
        //     row['id'] = uuid();
        // })
        // setData(newData);
        // // SETTING UP COLUMN HEADERS
        // let colHeaders = Object.keys(tableData[0]);
        // let newHeaders = [];
        // for(let i=0; i<colHeaders.length; i++) {
        //     newHeaders.push({
        //         id: uuid(),
        //         name: colHeaders[i],
        //     })
        // }
        // setHeaders(newHeaders);
    }, [])

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
        }
        else setData([]);
        undoStack=[];
        setHeaders([{id: uuid(), name: 'C1'}, {id: uuid(), name: 'C2'}]);
        setCheckList({type: 'row', list: []});
        setDnd(false);
        setHeaderCounter(3);
        setShowPop(false);
    }


    const displayData = () => {
        console.log("Headers:", headers)
        console.log("Data:", data);
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
                let newData = [...data];
                
                for (let listItem of checkList.list){
                    let rowId = listItem.split('||').pop();
                    
                    for (let i=0; i<newData.length; i++){
                        if (rowId === newData[i].id) {
                            newData.splice(i, 1);
                            break;
                        }
                    }
                }

                setData(newData);
            }
            else{
                let newHeaders = [...headers];
                let newData = [...data];

                for (let listItem of checkList.list){
                    let headerId = listItem.split('||').pop();
                    
                    for (let i=0; i<newHeaders.length; i++){
                        if (newHeaders[i].id === headerId){
                            newData.forEach(row => {
                                delete row[newHeaders[i].name]
                            })
                            newHeaders.splice(i, 1);
                        }
                    }
                }

                setHeaders(newHeaders);
                setData(newData);
            }
        }
    }

    const goToEditScreen = async() => {
        // FETCHING DATATABLES VIA API
        try{
            // const datatables = await utilApi.fetchDataTables();

            // if (datatables.error) throw datatables.error;
            
            // setDataTables(datatables);
            props.setScreenType('datatable-Edit');
        }
        catch(error) {

        }
    }

    const Popup = () => (
        <PopupMsg 
            title={showPop.title}
            content={showPop.content}
            close={()=>setShowPop(false)}
            submitText="OK"
            submit={()=>setShowPop(false)}
        />
    )

    return <>
        { showPop && <Popup /> }
        <div className="page-taskName" >
            <span className="taskname" data-test="dt__pageTitle">
                {currScreen} Data Table
            </span>
        </div>
        
        <TableName currScreen={currScreen} tableName={tableName} setTableName={setTableName}  />
        <div className="dt__btngroup">
            <TableActionButtons 
                onAdd={onAdd} 
                setDnd={setDnd} 
                onDelete={onDelete} 
                onUndo={onUndo}
            />
            { currScreen === "Create" 
                ? <CreateScreenActionButtons goToEditScreen={goToEditScreen} displayData={displayData} />
                : <EditScreenActionButtons />
            }
        </div>

        { currScreen==="Edit" && <SearchDataTable dataTables={dataTables} setData={setData} setHeaders={setHeaders} /> }

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
            />}
        </div>
    </>;
}

const TableName = ({currScreen, tableName, setTableName}) => {
    const [value, setValue] = useState(tableName || '');

    useEffect(()=>{
        setValue(tableName)
    }, [tableName]);

    const onChange = e => setValue(e.target.value);
    const onBlur = () => setTableName(value);

    return (
        <div className="dt__tableName">
            DataTable Name:
            {
                currScreen === 'Create'
                ? <input onBlur={onBlur} onChange={onChange} />
                : <div>{value}</div>
            }
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
    return (
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" >Import</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.goToEditScreen}>Edit</button>
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" onClick={props.displayData}>Create</button>
        </div>
    );
}

const EditScreenActionButtons = props => {
    return (
        <div className="dt__taskBtns">
            <button className="dt__taskBtn dt__btn" data-test="dt__tblActionBtns" >Export</button>
            <button className="dt__taskBtn dt__btn">Delete</button>
            <button className="dt__taskBtn dt__btn">Update</button>
        </div>
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

    const onTableSelect = event => {
        // const [newData, newHeaders] = parseTableData(tableData)
        // props.setData(newData);
        // props.setHeaders(newHeaders);
        // searchRef.current.value = event.target.value;
        // setDropdown(false);
    }

    const inputFilter = () =>{
        const searchInput = searchRef.current.value;
        let newFilteredList=[];
        if (searchInput) 
            newFilteredList = list.filter(item => item.datatablename === searchInput);
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
        </ClickAwayListener>
        </>
    )
}

const parseTableData = table => {
    let newData = JSON.parse(JSON.stringify([...table.datatable]));
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
    
    return [newData, newHeaders]
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
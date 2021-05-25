import React, { useState, useEffect }  from 'react';
import { v4 as uuid } from 'uuid';
import { TableActionButtons, CreateScreenActionButtons, EditScreenActionButtons, SearchDataTable } from './DataTableBtnGroup';
import { PopupMsg, ModalContainer, ScreenOverlay } from '../../global';
import Table from './Table';
import * as utilApi from '../api';
import "../styles/DataTable.scss";


let undoStack = [];

const DataTable = props => {

    const [currScreen, setCurrScreen] = useState(props.currScreen);
    const [showPop, setShowPop] = useState(false);
    const [overlay, setOverlay] = useState('');
    /*
        undoStack: [
            { row: <row-id>, col: <col-id>, value: old-value }
        ]
    */

    useEffect(()=>{
        setCurrScreen(props.currScreen)
        undoStack=[];
    }, [props.currScreen])

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
        
        { 
            currScreen === "Create" 
            ? <CreateScreen setShowPop={setShowPop} setOverlay={setOverlay} setScreenType={props.setScreenType} />
            : <EditScreen setShowPop={setShowPop} setOverlay={setOverlay} setScreenType={props.setScreenType} />
        }
    </>;
}

const CreateScreen = props => {
    const [data, setData] = useState([{id: uuid()}]);
    const [headers, setHeaders] = useState([{id: uuid(), name: 'C1'}, {id: uuid(), name: 'C2'}]);
    const [checkList, setCheckList] = useState({type: 'row', list: []});
    const [dnd, setDnd] = useState(false);
    const [headerCounter, setHeaderCounter] = useState(3);
    const [tableName, setTableName] = useState('');
    const [errors, setErrors] = useState({});

    return (
        <>
            <TableName tableName={tableName} setTableName={setTableName} error={errors.tableName} />
            <div className="dt__btngroup">
            <TableActionButtons 
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} undoStack={undoStack} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter}
            />
            <CreateScreenActionButtons 
                { ...props } tableName={tableName}data={data} setData={setData} 
                 setHeaders={setHeaders} setErrors={setErrors} headers={headers}
            />
            </div>
            <div className="dt__table_container full__dt">
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders} 
                        setCheckList={setCheckList} onAdd={()=>{}} dnd={dnd} undoStack={undoStack} checkList={checkList}
                    /> 
                }
            </div>
        </>
    );
}

const EditScreen = props => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [checkList, setCheckList] = useState({type: 'row', list: []});
    const [dnd, setDnd] = useState(false);
    const [headerCounter, setHeaderCounter] = useState(3);
    const [dataTables, setDataTables] = useState([]);
    const [tableName, setTableName] = useState('');

    useEffect(()=>{
        (async()=>{
            try{
                props.setOverlay('Fetching Data Tables...');
                
                const resp = await utilApi.fetchDataTables();
                
                props.setOverlay('');
    
                if (resp.error) 
                    props.setShowPop({title: 'Data Table Error', content: resp.error, type: "message"});
                if (resp === 'fail')
                    props.setShowPop({title: 'Data Table Error', content: 'Failed to Fetch Data Tables', type: "message"});
                if (typeof(resp) === 'object') {
                    setDataTables(resp);
                }
            }
            catch(error) {
                props.setShowPop({title: 'Data Table', content: 'Failed To Fetch Data Tables!', type: "message"})
                console.error(error);
            }
        })()
    }, [])

    return(
        <>
            <div className="dt__btngroup">
            <TableActionButtons
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} undoStack={undoStack} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter}
            />
            <EditScreenActionButtons { ...props } tableName={tableName} headers={headers} data={data} />
            </div>
            <SearchDataTable dataTables={dataTables} setData={setData} setHeaders={setHeaders} setTableName={setTableName} { ...props } />
            <div className="dt__table_container full__dt">
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders} 
                        setCheckList={setCheckList} onAdd={()=>{}} dnd={dnd} undoStack={undoStack} checkList={checkList}
                    /> 
                }
            </div>
        </>
    );
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
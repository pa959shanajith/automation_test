import React, { useState, useEffect }  from 'react';
import { v4 as uuid } from 'uuid';
import { TableActionButtons, CreateScreenActionButtons, EditScreenActionButtons, SearchDataTable } from './DataTableBtnGroup';
import { Messages as MSG, ModalContainer, ScreenOverlay, ValidationExpression as validate, setMsg } from '../../global';
import Table from './Table';
import { resetHistory } from './DtUtils';
import * as utilApi from '../api';
import "../styles/DataTable.scss";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const DataTable = props => {

    const [currScreen, setCurrScreen] = useState(props.currScreen);
    const [showModal,setModal] = useState(false);
    const [overlay, setOverlay] = useState('');

    useEffect(()=>{
        setCurrScreen(props.currScreen)
        resetHistory();
    }, [props.currScreen])

    const Modal = () => (
        <ModalContainer 
        show={showModal}
            title={showModal.title}
            content={showModal.content}
            close={()=>setModal(false)}
            footer={
                <>
                <Button onClick={showModal.onClick}>
                    {showModal.continueText ? showModal.continueText : "Yes"}
                </Button>
                <Button onClick={()=>setModal(false)}>
                    {showModal.rejectText ? showModal.rejectText : "No"}
                </Button>
                </>
            }
        /> 
    )
    return <>
        { showModal && <Modal/>}
        { overlay && <ScreenOverlay content={overlay} /> }
        <div className="page-taskName" >
            <span className="page-taskName-encryption" data-test="dt__pageTitle">
                {currScreen} Data Table
            </span>
        </div>
        
        { 
            currScreen === "Create" 
            ? <CreateScreen setModal={setModal} setOverlay={setOverlay} setScreenType={props.setScreenType} />
            : <EditScreen setModal={setModal} setOverlay={setOverlay} setScreenType={props.setScreenType} />
        }
    </>;
}

const CreateScreen = props => {
    const [data, setData] = useState([{__CELL_ID__: uuid()}]);
    const [headers, setHeaders] = useState([{__CELL_ID__: uuid(), name: 'C1'}, {__CELL_ID__: uuid(), name: 'C2'}]);
    const [checkList, setCheckList] = useState({type: 'row', list: []});
    const [dnd, setDnd] = useState(false);
    const [headerCounter, setHeaderCounter] = useState(3);
    const [tableName, setTableName] = useState('');
    const [errors, setErrors] = useState({});
    const [focus, setFocus] = useState({type: '', id: ''});

    return (
        <>
            <TableName tableName={tableName} setTableName={setTableName} error={errors.tableName} />
            <div className="dt__btngroup">
            <TableActionButtons 
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} dnd={dnd} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter} setCheckList={setCheckList} setFocus={setFocus}
            />
            <CreateScreenActionButtons 
                { ...props } tableName={tableName} data={data} setData={setData} 
                 setHeaders={setHeaders} setErrors={setErrors} headers={headers}
            />
            </div>
            <div className="dt__table_container full__dt">
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders} headerCounter={headerCounter} setHeaderCounter={setHeaderCounter}
                        setCheckList={setCheckList} dnd={dnd} checkList={checkList}
                        focus={focus} setFocus={setFocus}
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
    const [focus, setFocus] = useState({type: '', id: ''});

    useEffect(()=>{
        (async()=>{
            try{
                props.setOverlay('Fetching Data Tables...');
                
                const resp = await utilApi.fetchDataTables();
                
                props.setOverlay('');
    
                if (resp.error) 
                    setMsg(resp.error);
                if (resp === 'fail')
                    setMsg(MSG.UTILITY.ERR_FETCH_DATATABLES);
                if (typeof(resp) === 'object') {
                    setDataTables(resp);
                }
            }
            catch(error) {
                setMsg(MSG.UTILITY.ERR_FETCH_DATATABLES)
                console.error(error);
            }
        })()
    }, [])

    return(
        <>
            <div className="dt__btngroup">
            <TableActionButtons
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} dnd={dnd} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter} setCheckList={setCheckList} setFocus={setFocus}
            />
            <EditScreenActionButtons { ...props } tableName={tableName} headers={headers} data={data} />
            </div>
            <SearchDataTable dataTables={dataTables} setData={setData} setHeaders={setHeaders} setTableName={setTableName} { ...props } />
            <div>
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders} headerCounter={headerCounter} 
                        setCheckList={setCheckList} dnd={dnd} checkList={checkList}  setHeaderCounter={setHeaderCounter}
                        focus={focus} setFocus={setFocus}
                    /> 
                }
            </div>
        </>
    );
}

const TableName = ({tableName, setTableName, error}) => {

    const onChange = e => setTableName(validate(e.target.value, "dataTableName"));

    return (
        <div className="dt__tableName">
            Data Table Name:
            <InputText
                className={error ? 'dt__tableNameError' : ''}
                onChange={onChange}
                value={tableName}
                placeholder="Enter Data Table Name"
      />
        </div>
    );
}

export default DataTable;
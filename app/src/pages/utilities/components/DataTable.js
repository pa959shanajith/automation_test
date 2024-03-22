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
import { Tooltip } from 'primereact/tooltip';

const DataTable = props => {

    const [currScreen, setCurrScreen] = useState(props.currScreen);
    const [showModal,setModal] = useState(false);
    const [overlay, setOverlay] = useState('');
    const [dataValue,setDataValue] = useState(true);

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
        <div className="page-taskName-utility card shadow-2">
            <span className="page-taskName-encryption" data-test="dt__pageTitle">
            <img src="static/imgs/Datatable_icon.svg" className='current_img_icon' alt="SVG Image" />
            Data Table
            <Tooltip target=".utilitydatatable" position="bottom" content="Create a data table and utilize them for test data management and parameterization."/>
            <img src="static/imgs/info-circle.svg" className='utilitydatatable relative left-1' alt="Your Image" />
            </span>
        </div>
        
        { 
            currScreen === "Create" 
            ? <CreateScreen setModal={setModal} setOverlay={setOverlay} setScreenType={props.setScreenType} currScreen={props.currScreen}/>
            : <EditScreen setModal={setModal} setDataValue={setDataValue} dataValue={dataValue} setOverlay={setOverlay} setScreenType={props.setScreenType} />
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
            <TableName tableName={tableName} setTableName={setTableName} error={errors.tableName} currScreen={props.currScreen}/>
            <div>
            {/* <TableActionButtons 
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} dnd={dnd} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter} setCheckList={setCheckList} setFocus={setFocus}
            /> */}
           
            </div>
            <div className="dt__table_container full__dt">
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders} headerCounter={headerCounter} setHeaderCounter={setHeaderCounter}
                        setCheckList={setCheckList} dnd={dnd} checkList={checkList} setDnd={setDnd}
                        focus={focus} setFocus={setFocus} tableName={tableName}
                    /> 
                }
            </div>
            <CreateScreenActionButtons 
                { ...props } tableName={tableName} data={data} setData={setData} 
                 setHeaders={setHeaders} setErrors={setErrors} headers={headers}
            />
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
            {/* <TableActionButtons
                { ...props } data={data} setData={setData} headers={headers} setHeaders={setHeaders}
                checkList={checkList} headerCounter={headerCounter} dnd={dnd} setDnd={setDnd}
                setHeaderCounter={setHeaderCounter} setCheckList={setCheckList} setFocus={setFocus}
            /> */}
            </div>
            <SearchDataTable dataTables={dataTables} setData={setData} setHeaders={setHeaders} setTableName={setTableName} { ...props } setDataValue={props.setDataValue}/>
            <div className='dt__btngroup'>
                { 
                    data.length > 0 && 
                    <Table 
                        { ...props } data={data} setData={setData} dataValue={props.dataValue} setDataValue={props.setDataValue} headers={headers} setHeaders={setHeaders} headerCounter={headerCounter} 
                        setCheckList={setCheckList} dnd={dnd} checkList={checkList}  setHeaderCounter={setHeaderCounter} setDnd={setDnd} tableName={tableName}
                        focus={focus} setFocus={setFocus} dataTables={dataTables} setTableName={setTableName}
                    /> 
                }
            </div>
            {!tableName ? '' : <EditScreenActionButtons { ...props } tableName={tableName} headers={headers} data={data} dataValue={props.dataValue} setDataValue={props.setDataValue}/>}
        </>
    );
}

const TableName = ({tableName, setTableName, error , currScreen}) => {
    
    const [currScreenData, setCurrScreenData] = useState(currScreen);

    useEffect(()=>{
        setCurrScreenData(currScreen)
        resetHistory();
    }, [currScreen])

    const onChange = e => setTableName(validate(e.target.value, "dataTableName"));

    return (
        <>
        <label data-test="Data Table" className='DataTableCreate' style={{ paddingLeft: '1.3rem' }}>{currScreenData} Data Table</label>
        <div className="dt__tableName flex flex-column gap-2">
            <label data-test="Data Table Name" className='dt_name' style={{ paddingLeft: '1.3rem' }}>Data Table Name</label>
            <InputText
                className={error ? 'dt__tableNameError' : ''}
                onChange={onChange}
                value={tableName}
                placeholder="Enter Data Table Name"
            />
        </div>
        </>
    );
}

export default DataTable;
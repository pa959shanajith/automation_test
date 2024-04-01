import React, { useEffect,useState,useRef} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { Messages as MSG, setMsg ,VARIANT} from '../../global';
import { pasteCells, prepareCopyData, validateData, prepareSaveData, deleteData, parseTableData, getNextData, getPreviousData, pushToHistory } from './DtUtils';
import { setCopyCells } from '../UtilitySlice';
import { InputText } from 'primereact/inputtext';
import ImportPopUp from './ImportPopUp';
import ExportDataTable from './ExportDataTable';
import "../styles/Table.scss";
import DtPasteStepDialog from './DtPasteStepDialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import * as utilApi from '../api';


const Table = (props) => {
    
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refreshTable, setRefreshTable] = useState(false);
    const [columnVisibilities, setColumnVisibilities] = useState({});
    const dispatch = useDispatch();
    const copiedCells = useSelector(state=>state.utility.copiedCells)
    const [showPS, setShowPS] = useState(false);
    const toast = useRef();
    const [importPopup, setImportPopup] = useState(false);
    const [showExportPopup, setShowExportPopup] = useState(false);
    const [editingHeader, setEditingHeader] = useState('');

    useEffect(() => {
        if (props.headers) {
            const initialColumnVisibilities = {};
            props.headers.forEach(header => {
                initialColumnVisibilities[header.__CELL_ID__] = true; // Initially, all columns are visible
            });
            setColumnVisibilities(initialColumnVisibilities);
        }
    }, [props.headers]);

    const handleDropdownChange = (columnId) => {
        const newHeaders = props.headers.filter(header => header.__CELL_ID__ !== columnId);
        const newData = props.data.map(row => {
            const newRow = { ...row };
            delete newRow[columnId];
            return newRow;
        });
        props.setData(newData);
        props.setHeaders(newHeaders);
    };

        const data = Array.isArray(props.data) ? props.data : [];

        const handleRowSelect = (e) => {
            updateCheckList(e, "row", e.value.__CELL_ID__)
        };

        const handleColumnSelect = (e) => {
            return props.setData(e.value)
        };
    
        const onAdd = (type) => {
            if (type === "col") {
                if (props.headers.length >= 50) {
                    setMsg(MSG.UTILITY.ERR_COLUMN_50);
                } else {
                    pushToHistory({ headers: props.headers, data: props.data });
                    const newHeaders = [...props.headers];
                    const newHeaderId = uuid();
                    newHeaders.push({
                        __CELL_ID__: newHeaderId,
                        name: `C${props.headerCounter}`
                    });
                    props.setHeaders(newHeaders);
                    props.setFocus({ type: 'tableCol', id: newHeaderId });
                    props.setHeaderCounter(count => count + 1);
                }
            } else if (type === "row") {
                if (props.data.length >= 199) {
                    setMsg(MSG.UTILITY.ERR_ROWS_200);
                } else {
                    pushToHistory({ headers: props.headers, data: props.data });
                    const newRowId = uuid();
                    const newRow = { __CELL_ID__: newRowId };
                    const newData = [...props.data, newRow];
                    props.setFocus({ type: 'tableRow', id: newRowId });
                    props.setData(newData);
                    setRefreshTable(!refreshTable);
                }
            }
        };

        const updateHeaderName = (newName, headerId) => {
            pushToHistory({ headers: props.headers, data: props.data });
            const newHeaders = props.headers.map(header => {
                if (header.__CELL_ID__ === headerId) {
                    return { ...header, name: newName };
                }
                return header;
            });
            props.setHeaders(newHeaders);
        };
    
         // loc => id for header, index for row
    const updateCheckList = (e, type, loc) => {
        let newCheckList = props.checkList.type === type ? { ...props.checkList } : { type: type, list: [] }

        if (e.originalEvent.ctrlKey) {
            let itemIndex = newCheckList.list.indexOf(`sel||${type}||${loc}`);
            if (itemIndex < 0)
                newCheckList.list.push(`sel||${type}||${loc}`);
            else
                newCheckList.list.splice(itemIndex, 1);

        }
        else {
            newCheckList.list = [`sel||${type}||${loc}`]
        }

        props.setCheckList(newCheckList);
    }
    
        const rowEditor = (rowData, columnMeta, headerId) => {
            const handleInputChange = (e) => {
                const { value } = e.target;
                updateTableData(value, rowData.__CELL_ID__, headerId);
                columnMeta.editorCallback(value)
            };
        
            return (
                <InputText
                    value={rowData[columnMeta.field]}
                    onChange={handleInputChange}
                />
            );
        };
        const handleHeaderClick = (field) => {
            setEditingHeader(field);
          };

        const dynamicColumns = props.headers.map((header) => (
            <Column
                key={`header-${header.__CELL_ID__}`}
                header={(editingHeader === header.name || editingHeader === '') ? <InputText value={header.name} onChange={(e) => updateHeaderName(e.target.value, header.__CELL_ID__)} /> : <span onClick={() => handleHeaderClick(header.name)}>{header.name}</span>}
                field={header.__CELL_ID__}
                columnKey={header.__CELL_ID__}
                // initialValue={header.__CELL_ID__ || ''}
                headerStyle={{ textAlign: 'center',width: '21rem' }}
                bodyStyle={{ textAlign: 'center',width: '21rem' }}
                editor={(props) => rowEditor(props.rowData, props,header.__CELL_ID__)}
                bodyClassName={"ellipsis_column"}
                style={{ display: columnVisibilities[header.__CELL_ID__] ? 'table-cell' : 'none' }}
            />
        ));
    
        const updateTableData = (value, rowId, headerId) => {
            pushToHistory({ headers: props.headers, data: props.data });
            const newData = props.data.map(row => {
                if (row.__CELL_ID__ === rowId) {
                    return { ...row, [headerId]: value };
                }
                return row;
            });
            props.setData(newData);
        };
    
        const toastError = (errorMessage) => {
            if (toast.current && errorMessage) {
                if (errorMessage.CONTENT) {
                    toast.current.show({ severity: errorMessage.VARIANT, summary: 'Error', detail: errorMessage.CONTENT, life: 5000 });
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(errorMessage), life: 5000 });
                }
            }
        };
        
        const toastSuccess = (successMessage) => {
            if (toast.current && successMessage) {
                if (successMessage.CONTENT) {
                    toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
                } else {
                    toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
                }
            }
        };
        
    
        const onAddRowcol = () => {
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
                    dispatch(setCopyCells(resp.copiedData));
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

        const dropdownOptions = props.headers.map(header => ({
            label: header.name,
            value: header.__CELL_ID__
        }));

    const header = (
        <div className="flex align-items-center justify-content-between">
            <div className='flex gap-5'>
                <Tooltip target=".plus-img" position="bottom" content="Add Selected Row" />
                <span className='plus-img' data-pr-tooltip="Add Selected Row" onClick={onAddRowcol}>
                    <img src="static/imgs/plus.svg" alt="add selected Row/Column" />
                </span>
                <Tooltip target=".import-img" position="bottom" content="Import" />
                <span className="import-img" data-pr-tooltip='Import' onClick={() => setImportPopup(true)}>
                    <img src="static/imgs/Import.svg" alt="import" />
                </span>
                <Tooltip target=".export-img" position="bottom" content="Export" />
                <span className={props.tableName ? "export-img dt_separation" : "disabled_export dt_separation"} data-pr-tooltip="Export" onClick={props.tableName ? () => setShowExportPopup(true) : null}>
                    <img src="static/imgs/export_icon 1.svg" alt="export" />
                </span>
                <Tooltip target=".copy-img" position="bottom" content="Copy Row" />
                <span className="copy-img" data-pr-tooltip="Copy Row" onClick={onCopy}>
                    <img src="static/imgs/copy.svg" alt="Copy" />
                </span>
                <Tooltip target=".paste-img" position="bottom" content="Paste Row" />
                <span title="Paste Row" className="paste-img dt_separation" data-pr-tooltip="Paste Row" onClick={onPaste}>
                    <img src="static/imgs/paste.svg" alt="Paste" />
                </span>
                <Tooltip target=".redo_img" position="bottom" content="Redo" />
                <span title="Redo" className='redo_img' data-pr-tooltip="Redo" onClick={onRedo}>
                    <img src="static/imgs/redo.svg" alt="Redo" />
                </span>
                <Tooltip target=".undo_img" position="bottom" content="Undo" />
                <span title="Undo" className="undo_img dt_separation" data-pr-tooltip="Undo" onClick={onUndo}>
                    <img src="static/imgs/undo.svg" alt="Undo" />
                </span>
                <Tooltip target=".edit_img" position="bottom" content="Edit" />
                <span className="edit_img" data-pr-tooltip="Edit" onClick={goToEditScreen}>
                    <img src="static/imgs/pencil.svg" alt="Edit" />
                </span>
                <Tooltip target=".delete_img" position="bottom" content="Remove Selected Row" />
                <span title="Remove Selected Row" className='delete_img' data-pr-tooltip="Remove Selected Row" onClick={onDelete}>
                    <img src="static/imgs/trash.svg" alt="Delete" />
                </span>
            </div>
            <div className='ml-2'>
                <Dropdown
                    className='columnDelete'
                    options={dropdownOptions}
                    value={null} // Set the default value or leave it as null
                    onChange={(e) => handleDropdownChange(e.value)}
                    placeholder="Select a column to delete"
                />
            </div>
            <div>
                <button className="btn_add" onClick={() => onAdd('col')} >+ Add column</button>
            </div>
        </div>
    );

    

    return (
        <>
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} style={{ maxWidth: "35rem" }}/>
        { importPopup && <ImportPopUp setImportPopup={setImportPopup} importPopup={importPopup} setData={props.setData} setHeaders={props.setHeaders} setOverlay={props.setOverlay} { ...props } />}
        { showExportPopup && <ExportDataTable setShowExportPopup={setShowExportPopup} showExportPopup={showExportPopup} tableName={props.tableName} setOverlay={props.setOverlay} /> }
        { showPS && <DtPasteStepDialog setShow={setShowPS} show={showPS} upperLimit={copiedCells.type === "cols" ? props.headers.length : props.data.length+1 } pasteData={pasteData} pasteType={copiedCells.type} /> }
            <div className="card flex table_cell">
                <DataTable value={props.data} reorderableColumns selectionMode="single" reorderableRows onRowReorder={handleColumnSelect} showGridlines header={header} footer={<div className='table__footer'><button className='btn_add' onClick={()=>onAdd('row')}> + Add row</button></div>} onSelectionChange={handleRowSelect} scrollable scrollHeight='243px' style={{overflowY : "auto"}}>
                <Column rowReorder style={{ width: '3rem' }} />
                    {dynamicColumns}
                </DataTable>
            </div>
        </>
    );
};

export default Table;


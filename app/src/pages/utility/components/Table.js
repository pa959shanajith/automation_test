import React, { useState, useEffect, useRef } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { ScrollBar } from '../../global';
import { ReactSortable } from 'react-sortablejs';
import "../styles/Table.scss";

/* 
    data
    setData
    checkList
    setCheckList
    dnd
*/

const Table = props => {

    const headerRef = useRef();
    const rowRef = useRef();

    const updateHeaders = (newHeader, headerId) => {
        let newHeaders = [...props.headers];
        let oldHeaderName;
        newHeaders.forEach(header => {
            if (header.id === headerId) {
                oldHeaderName = header.name
                header.name = newHeader;
            }
        })
        let newData = [...props.data];
        newData.forEach(row => {
            let columnValue = row[oldHeaderName];
            delete row[oldHeaderName]
            row[newHeader] = columnValue;
        })
        props.setHeaders(newHeaders);
        props.setData(newData);
    }

    const updateTableData = (value, rowId, columnName) => {
        let newData = [...props.data];
        
        for (let row of newData) {
            if (row.id === rowId) {
                row[columnName] = value;
                break;
            }
        }
        
        props.setData(newData);
    }

    // loc => id for header, index for row
    const updateCheckList = (e, type, loc) =>{
        let newCheckList = props.checkList.type === type ? { ...props.checkList} : { type: type, list: [] }

        if (e.ctrlKey) {
            let itemIndex = newCheckList.list.indexOf(`sel||${type}||${loc}`);
            if (itemIndex<0) 
                newCheckList.list.push(`sel||${type}||${loc}`);
            else 
                newCheckList.list.splice(itemIndex, 1);
            
        }
        else {
            newCheckList.list = [`sel||${type}||${loc}`]
        }

        props.setCheckList(newCheckList);
    }

    const onScrollY = e =>{
        rowRef.current.style.top = `-${e.scrollTop}px`
    }

    const onScrollX = e => {
        headerRef.current.style.left = `-${e.scrollLeft}px`;
    }

    return (
        <>
        { <div className="dt__table full__dt">
            <RowNumColumn
                { ...props }
                rowRef={rowRef}
                updateCheckList={updateCheckList}
            />
            {/* <ScrollBar scrollId="dt__outer" hideYbar={true}> */}
            <div style={{display: 'flex', flexDirection: 'column',  width: '100%',height: '100%'}}>
                <div style={{position: 'relative', height: '31px', width: '100%', overflow: 'hidden', marginBottom: '2px'}}>
                    <div ref={headerRef} style={{position: 'absolute', right: '0', left: '0', overflow:'hidden'}}>
                        <Headers 
                            // headerRef={headerRef}
                            headers={props.headers} 
                            setHeaders={props.setHeaders}
                            onAdd={props.onAdd}
                            updateHeaders={updateHeaders} 
                            updateCheckList={updateCheckList}
                        />
                    </div>
                </div>
                
                <div className="full__dt" style={{ display: 'flex' }}>
                    <Rows 
                        onScrollY={onScrollY}
                        onScrollX={onScrollX}
                        { ...props }
                        headers={props.headers}
                        updateCheckList={updateCheckList}
                        updateTableData={updateTableData}
                    />
                </div>
            </div>                        
            {/* </ScrollBar> */}
        </div> }
        </>
    );
}

export default Table;

const Headers = ({headers, setHeaders, updateHeaders, updateCheckList, onAdd}) => {
    return(
        <div className="dt__table_header" >
        {/* <div className="dt__table_numbered_column_header" /> */}
        <ReactSortable 
            list={headers} 
            setList={setHeaders}
            className="dt__table_header_cells"
            ghostClass="dt__ghost_header"
        >
            { headers.map((header, headerIndex) => {
                return (
                    <HeaderCell  
                        key={`header-${header.id}`}
                        headerIndex={headerIndex}
                        headerName={header.name}
                        headerId={header.id}
                        headers={headers}
                        updateCheckList={updateCheckList}
                        updateHeaders={updateHeaders}
                    />
                )
            }) }
        </ReactSortable>
        <div className="dt__table_new_column_header" onClick={()=>onAdd('col')}>
            +
        </div>
        </div>
    );
}

/*
    headerName => header's name
    headerIndex => for header's index in header array
    headers => header list to check when renaming header
    updateHeaders => updates Header State and all headers in data
*/
const HeaderCell = props => {
    const [value, setValue] = useState(props.headerIndex || '')

    useEffect(() => {
        setValue(props.headerIndex)
    }, [props.headerIndex]);

    // const onBlur = e => {
    //     let invalidHeader = false;
    //     props.headers.forEach(header => {
    //         if (!value.trim() || (header.name === value && header.id!==props.headerId)) invalidHeader = true;
    //     })

    //     if (invalidHeader){
    //        console.log("ERROR")
    //         return false;
    //     }
    //     else {
    //         props.updateHeaders(value, props.headerId)
    //         setEdit(false);
    //     }
    //     return true;
    // };

    return (
        <div className="dt__cell dt__table_header_cell" data-test="dt__header_cell">
            <div onClick={(e)=>props.updateCheckList(e, "col", props.headerId)}>{`C${value+1}`}</div> 
        </div>
    );
}


const Rows = props => {

    return(
        <div className="dt__table_rows_container full__dt">
        <div className="dt__ab">
        <div className="dt__min">
        <div className="dt__con" id="dt__tcListId">
        <ScrollBar scrollId="dt__tcListId" horizontalbarWidth="8px" verticalbarWidth="8px" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" onScrollX={props.onScrollX} onScrollY={props.onScrollY}>
            {/* <ReactSortable list={props.data} setList={props.setData} disabled={!props.dnd} key={props.dnd.toString()}> */}
            { props.data.map((row, rowIndex)=>{
                return (
                    <Row 
                        key={`row-${row.id}`}
                        checkList={props.checkList}
                        setCheckList={props.setCheckList}
                        updateTableData={props.updateTableData}
                        headers={props.headers}
                        row={row}
                        rowIndex={rowIndex}
                        updateCheckList={props.updateCheckList}
                    />
                )
            }) }
            {/* </ReactSortable> */}
            </ScrollBar>
            </div>
            </div>
            </div>
        </div>
    );
}

const RowNumColumn = props => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '102%'}}>
            <div className="dt__table_numbered_column_header" style={{minHeight: '29px'}}/>
            <div style={{position: 'relative',  height: '100%', overflow: 'hidden'}}>
                <div ref={props.rowRef} style={{position: 'absolute', right: '0', left: '0', overflow:'hidden'}}>
                <ReactSortable list={props.data} setList={props.setData} disabled={!props.dnd} key={props.dnd.toString()} ghostClass="dt__ghost_header">
                { props.data.map((row, rowIndex)=>{
                    return (
                        <div 
                            key={`rownum-${row.id}`}
                            className="dt__table_numbered_column " 
                            onClick={(e)=>props.updateCheckList(e, "row", row.id)}
                            data-test="dt__number_cell"
                            style={{minHeight: '35px'}}
                        >
                            {rowIndex+1}
                        </div>
                    )
                }) }
                </ReactSortable>
                </div>
            </div>   
        </div>
    );
}

const Row = props => {

    return (
        <div className="dt__table_row" data-test="dt__row">
            { props.headers.map(header => {
                return (
                    <DataCell 
                        key={`cell-${props.row.id}-${header.id}`}
                        rowId={props.row.id}
                        columnName={header.name}
                        initialValue={props.row[header.name]}
                        updateTableData={props.updateTableData}
                        selected={
                            props.checkList.list.includes(`sel||row||${props.row.id}`) ||
                            props.checkList.list.includes(`sel||col||${header.id}`)
                        }
                    />
                )
            }) }
            <div className={"dt__table_add_column "+ (props.checkList.list.includes(`sel||row||${props.row.id}`)?"dt__selected_cell":"")} />
        </div>
    )
}

/* 
    value => cell's name
    updateTableData => To Update Table Data
*/

const DataCell  = props => {
    const [value, setValue] = useState(props.initialValue || '');

    useEffect(() => {
        setValue(props.initialValue || '')
    }, [props.initialValue]);

    const onChange = e => setValue(e.target.value);

    const checkKeyPress = event => {
        if (event.keyCode === 13) onBlur();
    }

    const onBlur = e => props.updateTableData(value, props.rowId, props.columnName)

    return (
        <div className={"dt__cell "+(props.selected?"dt__selected_cell":'')} data-test="dt__body_cell">
            <input value={value || ''} onChange={onChange} onBlur={onBlur} onKeyDown={checkKeyPress}/>
        </div>
    );
}
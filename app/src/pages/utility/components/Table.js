import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
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

    const onAdd = type => {
        if (type==="col") {
            if (props.headers.length >= 15) 
                props.setShowPop({title: 'Error', content: 'Table cannot have more than 15 columns', type: 'message'});
            else {
                let newHeaders = [...props.headers];
                
                let newHeaderId = uuid();
                newHeaders.push({
                    __CELL_ID__: newHeaderId,
                    name: `C${props.headerCounter}`
                })
    
                props.setFocus({type: 'tableCol', id: newHeaderId});
                props.setHeaders(newHeaders);
                props.setHeaderCounter(count => count + 1);
            }
        }
        else if (type === "row") {
            if (props.data.length >= 199) 
                props.setShowPop({title: 'Error', content: 'Table cannot have more than 200 rows', type: 'message'});
            else {
                let newData = [...props.data];
            
                let newRowId =  uuid();
                newData.push({__CELL_ID__: newRowId})
    
                props.setFocus({type: 'tableRow', id: newRowId});
                props.setData(newData);
            }
        }
    }

    const updateHeaders = (newHeader, headerId, invalidFlag) => {

        if (invalidFlag) {
            props.setShowPop({title: "Duplicate Header Name", content: "Header name is empty or duplicate", type: "message"})
            return;
        }
        let newHeaders = [...props.headers];
        let oldHeaderName;
        newHeaders.forEach(header => {
            if (header.__CELL_ID__ === headerId) {
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

    const updateTableData = (value, rowId, headerId) => {
        let newData = [...props.data];
        
        for (let row of newData) {
            if (row.__CELL_ID__ === rowId) {
                props.undoStack.push({ rowId: row.__CELL_ID__, colId: headerId, value: row[headerId]});
                row[headerId] = value;
                break;
            }
        }
        
        if (props.undoStack.length>5)
            props.undoStack.splice(0, 1);
        
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
                onAdd={onAdd}
            />
            {/* <ScrollBar scrollId="dt__outer" hideYbar={true}> */}
            <div className="dt__headersMainContainer full__dt">
                <div className="dt__headersScrollContainer">
                    <div ref={headerRef} className="dt__Scroller">
                        <Headers
                            checkList={props.checkList}
                            headers={props.headers} 
                            setHeaders={props.setHeaders}
                            updateCheckList={updateCheckList}
                            onAdd={onAdd}
                        />
                    </div>
                </div>
                
                <div className="full__dt" style={{ display: 'flex' }}>
                    <Rows 
                        { ...props }
                        onScrollY={onScrollY}
                        onScrollX={onScrollX}
                        updateHeaders={updateHeaders} 
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

const Headers = ({headers, setHeaders, updateCheckList, onAdd, checkList}) => {
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
                        key={`header-${header.__CELL_ID__}`}
                        headerIndex={headerIndex}
                        headerName={header.name}
                        selected={checkList.list.includes(`sel||col||${header.__CELL_ID__}`)}
                        headerId={header.__CELL_ID__}
                        headers={headers}
                        updateCheckList={updateCheckList}
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

    return (
        <div className={"dt__cell dt__table_header_cell"+(props.selected?" dt__hdrCell_Sel dt__colHeadSel":"")} data-test="dt__header_cell">
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
            <SubHeaderRow 
                focus={props.focus}
                setFocus={props.setFocus}
                headers={props.headers}
                updateHeaders={props.updateHeaders} 
                checkList={props.checkList}
            />
            { props.data.map((row, rowIndex)=>{
                return (
                    <Row 
                        key={`row-${row.__CELL_ID__}`}
                        focus={props.focus}
                        setFocus={props.setFocus}
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
            <AddRow focus={props.focus} setFocus={props.setFocus} />
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
        <div className="dt__numberColumnContainer">
            <div className="dt__table_numbered_column_header"/>
            <div className="dt__numberColScrollContainer">
                <div ref={props.rowRef} className="dt__Scroller">
                <div 
                    key={`rownum-header`}
                    className="dt__table_numbered_column " 
                    data-test="dt__number_cell"
                >
                    1
                </div>
                <ReactSortable list={props.data} setList={props.setData} disabled={!props.dnd} key={props.dnd.toString()} ghostClass="dt__ghost_header">
                { props.data.map((row, rowIndex)=>{
                    return (
                        <div 
                            key={`rownum-${row.__CELL_ID__}`}
                            className={"dt__table_numbered_column "+(props.checkList.list.includes(`sel||row||${row.__CELL_ID__}`)?" dt__hdrCell_Sel dt__rowHeadSel":"")} 
                            onClick={(e)=>props.updateCheckList(e, "row", row.__CELL_ID__)}
                            data-test="dt__number_cell"
                        >
                            {rowIndex+2}
                        </div>
                    )
                }) }
                </ReactSortable>
                <div 
                    key={`rownum-addRow`}
                    className="dt__table_numbered_column dt__addRow"
                    data-test="dt__number_cell"
                    onClick={()=>props.onAdd('row')}
                >
                    +
                </div>
                </div>
            </div>   
        </div>
    );
}

const SubHeaderRow = props => {

    const addColRef = useRef();

    useEffect(()=>{
        if (props.focus.type==="tableCol" && addColRef.current) {
            addColRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
            props.setFocus({type: '', id: ''})
        }
    }, [props.focus])

    return (
        <div className="dt__table_row header_row" data-test="dt__row">
            <div className="dt__table_header_cells">
            { props.headers.map(header => {
                return (
                    <SubHeaderCell 
                        key={`cell-header-${header.__CELL_ID__}`}
                        focus={props.focus}
                        setFocus={props.setFocus}
                        columnName={header.name}
                        initialValue={header.name}
                        updateHeaders={props.updateHeaders}
                        headers={props.headers}
                        headerId={header.__CELL_ID__}
                        selected={props.checkList.list.includes(`sel||col||${header.__CELL_ID__}`)}
                    />
                )
            }) }
            </div>
            <div className="dt__table_add_column " ref={addColRef} />
        </div>
    )
}

const AddRow = props => {

    const addRowRef = useRef();

    useEffect(()=>{
        if (props.focus.type==="tableRow" && addRowRef.current) {
            addRowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
            props.setFocus({type: '', id: ''})
        }
    }, [props.focus])

    return (
        <div className="dt__table_AddRow dt__table_row" data-test="dt__row" ref={addRowRef} />
    );
}


const SubHeaderCell  = props => {
    const [value, setValue] = useState(props.initialValue || '');
    const colRef = useRef();

    useEffect(()=>{
        if (props.focus.type==="action" && props.focus.id === props.headerId && colRef.current) {
            colRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
            props.setFocus({type: '', id: ''})
        }
    }, [props.focus])

    useEffect(() => {
        setValue(props.initialValue || '')
    }, [props.initialValue]);

    const onBlur = e => {
        let invalidHeader = false;
        props.headers.forEach(header => {
            if (!value.trim() || (header.name === value && header.__CELL_ID__!==props.headerId) || value === "__CELL_ID__") invalidHeader = true;
        })

        if (invalidHeader) 
            setValue(props.initialValue||'')
        props.updateHeaders(value, props.headerId, invalidHeader)
        return true;
    };

    const onChange = e => setValue(e.target.value);

    const checkKeyPress = event => {
        if (event.keyCode === 13) onBlur();
    }

    return (
        <div 
            ref={colRef}
            className={
                "dt__cell dt__subHeaderCell "
                +(props.selected?"dt__selected_cell":'')} 
            data-test="dt__body_cell"
        >
            <input value={value || ''} onChange={onChange} onBlur={onBlur} onKeyDown={checkKeyPress}/>
        </div>
    );
}



const Row = props => {

    const rowRef = useRef();

    useEffect(()=>{
        if (props.focus.type==="action" && props.focus.id === props.row.__CELL_ID__ && rowRef.current) {
            rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
            props.setFocus({type: '', id: ''})
        }
    }, [props.focus])

    return (
        <div className="dt__table_row" data-test="dt__row" ref={rowRef}>
            <div className="dt__table_header_cells">
            { props.headers.map(header => {
                return (
                    <DataCell 
                        key={`cell-${props.row.__CELL_ID__}-${header.__CELL_ID__}`}
                        rowId={props.row.__CELL_ID__}
                        headerId = {header.__CELL_ID__}
                        initialValue={props.row[header.__CELL_ID__] || ''}
                        updateTableData={props.updateTableData}
                        selected={
                            props.checkList.list.includes(`sel||row||${props.row.__CELL_ID__}`) ||
                            props.checkList.list.includes(`sel||col||${header.__CELL_ID__}`)
                        }
                    />
                )
            }) }
            </div>
            <div className={"dt__table_add_column "+ (props.checkList.list.includes(`sel||row||${props.row.__CELL_ID__}`)?"dt__selected_cell":"")} />
        </div>
    )
}

/* 
    value => cell's name
    updateTableData => To Update Table Data
*/

const DataCell  = props => {
    const [value, setValue] = useState(props.initialValue);

    useEffect(() => {
        setValue(props.initialValue)
    }, [props.initialValue]);

    const onChange = e => setValue(e.target.value);

    const checkKeyPress = event => {
        if (event.keyCode === 13) onBlur();
    }

    const onBlur = e => {
        if (props.initialValue !== value)
            props.updateTableData(value, props.rowId, props.headerId)
    }

    return (
        <div className={"dt__cell "+(props.selected?"dt__selected_cell":'')} data-test="dt__body_cell">
            <input value={value || ''} onChange={onChange} onBlur={onBlur} onKeyDown={checkKeyPress}/>
        </div>
    );
}
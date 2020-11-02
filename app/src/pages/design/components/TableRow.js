import React, { useState, useEffect, memo } from 'react';
import DetailsDialog from './DetailsDialog';
import { ModalContainer } from "../../global";


const shouldRender = (prevProps, nextProps) => {
    // console.log(prevProps.edit, nextProps.edit)
    // console.log(prevProps, nextProps)
    // if (deepEqual(prevProps.testCase, nextProps.testCase) === false &&  nextProps.edit === false && prevProps.edit === false){
    //     return false
    // }
    if (prevProps.edit && nextProps.edit){
        // console.log(prevProps.idx !== nextProps.focusedRow && prevProps.focusedRow !== nextProps.idx)
        // console.log(prevProps.idx, prevProps.focusedRow, nextProps.focusedRow)
        return prevProps.idx !== nextProps.focusedRow && prevProps.focusedRow !== nextProps.idx;
        // return false
    }
    else {
        return false
    }
}

function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
        areObjects && !deepEqual(val1, val2) ||
        !areObjects && val1 !== val2
        ) {
        return false;
        }
    }

    return true;
}

function isObject(object) {
return object != null && typeof object === 'object';
}


const TableRow = (props) => {

    const [checked, setChecked] = useState(props.checkedRows.includes(props.idx));
    const [objName, setObjName] = useState(props.testCase.custname);
    const [objType, setObjType] = useState(null);
    const [keyword, setKeyword] = useState(props.testCase.keywordVal);
    const [input, setInput] = useState(props.testCase.inputVal[0]);
    const [output, setOutput] = useState(props.testCase.outputVal);
    const [inputPlaceholder, setInputPlaceholder] = useState(null);
    const [outputPlaceholder, setOutputPlaceholder] = useState(null);
    const [keywordList, setKeywordList] = useState(null);
    const [focused, setFocused] = useState(props.focusedRow === props.idx);
    let objList = props.objList;
    const [highlight, setHighlight] = useState(false);
    const [commented, setCommented] = useState(props.testCase.outputVal.slice(-2) === "##");
    const [remarks, setRemarks] = useState(props.testCase.remarks === "" ? [] : props.testCase.remarks.split(";"));
    const [TCDetails, setTCDetails] = useState(props.testCase.addTestCaseDetailsInfo === "" ? "" : JSON.parse(props.testCase.addTestCaseDetailsInfo));
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    useEffect(()=>{
        setObjName(props.testCase.custname);
        setObjType(null);
        setKeyword(props.testCase.keywordVal);
        setInput(props.testCase.inputVal[0]);
        setOutput(props.testCase.outputVal);
        setInputPlaceholder(null);
        setOutputPlaceholder(null);
        setKeywordList(null);
        objList = props.objList;
        setRemarks(props.testCase.remarks === "" ? [] : props.testCase.remarks.split(";"));
        setCommented(props.testCase.outputVal.slice(-2) === "##");
        setTCDetails(props.testCase.addTestCaseDetailsInfo === "" ? "" : JSON.parse(props.testCase.addTestCaseDetailsInfo));
    }, [props.rowChange, props.testCase]);

    useEffect(()=>{
        setChecked(props.checkedRows.includes(props.idx));
    }, [props.checkedRows]);

    useEffect(()=>{
        if (props.edit){
            if (props.focusedRow === props.idx){
                setFocused(true);
                let caseData = null;
                let placeholders = null;
                if (objName && keyword){
                    caseData = props.getKeywords(objName)
                    placeholders = props.getRowPlaceholders(caseData.obType, keyword);
                }
                else if (objName){
                    caseData = props.getKeywords(objName)
                    placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
                }
                else{
                    caseData = props.getKeywords(objList[0])
                    placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
                }
                setKeywordList(caseData.keywords);
                setObjType(caseData.obType);
                setOutputPlaceholder(placeholders.outputval);
                setInputPlaceholder(placeholders.inputval);
            }
            else{
                setFocused(false);
                setObjName(props.testCase.custname);
                setKeyword(props.testCase.keywordVal);
                setInput(props.testCase.inputVal[0]);
                setOutput(props.testCase.outputVal);
            }
        }
        if (props.focusedRow !== props.idx) {
            setFocused(false);
            setHighlight(false);
        }
    }, [props.focusedRow, props.edit]);

    const onBoxCheck = event => {
        props.updateChecklist(props.idx,"check");
        if (event.target.checked) setChecked(true);
        else setChecked(false);
    }

    const onRowClick = event => {
        props.updateChecklist(props.idx, "row");
        setHighlight(true);
        setChecked(true);
    }

    const onObjSelect = event => {
        const caseData = props.getKeywords(event.target.value)
        const placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
        setKeywordList(caseData.keywords);
        setObjType(caseData.obType);
        setOutputPlaceholder(placeholders.outputval);
        setInputPlaceholder(placeholders.inputval);
        setObjName(event.target.value)
    };

    const onKeySelect = event => {
        const placeholders = props.getRowPlaceholders(objType, event.target.value);
        setInput("");
        setOutput("");
        setOutputPlaceholder(placeholders.outputval);
        setInputPlaceholder(placeholders.inputval);
        setKeyword(event.target.value);
    };

    const submitChanges = event => {
        if (event.keyCode === 13) props.setRowData(props.idx, objName, keyword, input, output);
        else if (event.keyCode === 27) props.setFocusedRow(null);
    }

    const onInputChange = event => setInput(event.target.value)

    const onOutputChange = event => setOutput(event.target.value)

    const onSaveDetails = details => {
        props.saveDetails(props.idx, details === "" ? "" : JSON.stringify(details))
        setTCDetails(details);
        setShowDetailsDialog(false);
    }
    
    return (
        <>
        
        { showDetailsDialog && <DetailsDialog TCDetails={TCDetails} setShow={setShowDetailsDialog} onSaveDetails={onSaveDetails}/> }
        <div className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "") + (highlight || (props.focusedRow!== null  && typeof props.focusedRow === "object" && props.focusedRow.includes(props.idx)) ? " highlight-step" : "")}>
            {console.log(`rendered ${props.idx+1} ${props.testCase.outputVal}`)}
            <span className="step_col" onClick={onRowClick}>{props.idx + 1}</span>
            <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onClick={onBoxCheck}/></span>
            
            <span className="objname_col">
                { focused ? 
                <select className="col_select" value={objName} onChange={onObjSelect} onKeyDown={submitChanges} autoFocus>
                    { objList.map(object=> <option value={object}>{object}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick}>{objName}</div>
                }
            </span>
            <span className="keyword_col" >
                { focused ? 
                <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges}>
                    { keywordList && keywordList.map(keyword => <option value={keyword}>{keyword}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick}>{keyword}</div> }
            </span>
            <span className="input_col" >
                { focused ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ? 
                                <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} /> : 
                                <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} /> :
                    <div className="d__row_text" onClick={onRowClick}>{input}</div> }
            </span>
            <span className="output_col" >
                { focused ? <input className="col_inp" value={output} placeholder={outputPlaceholder} onChange={onOutputChange} onKeyDown={submitChanges} /> :
                <div className="d__row_text" onClick={onRowClick}>{output}</div> }
            </span>

            <span className="remark_col"  onClick={onRowClick}><img src={"static/imgs/ic-remarks-" + (remarks.length > 0 ? "active.png" : "inactive.png")} alt="remarks" onClick={()=>{props.showRemarkDialog(props.idx); setFocused(false)}}/></span>
            <span className="details_col" onClick={onRowClick}><img src={"static/imgs/ic-details-" + ( TCDetails !== "" ? (TCDetails.testcaseDetails || TCDetails.actualResult_pass || TCDetails.actualResult_fail ) ? "active.png" : "inactive.png" : "inactive.png")} alt="details"  onClick={()=>setShowDetailsDialog(true)}/></span>
        </div>
        </>
    );
};





export default TableRow;
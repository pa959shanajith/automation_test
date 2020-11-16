import React, { useState, useEffect, memo, useRef } from 'react';
import "../styles/TableRow.scss";

/*
    Component: TableRow
    Uses: Renders Each Row of the Table
    Props: 
        idx -> index of row
        objList -> list of object names
        testCase -> each testcase object from testcases array
        edit -> bool flag for edit mode / if true editting mode is ON
        getKeywords -> method to get a list of keywords
        getRowPlaceholders -> method to get input/output placeholders
        checkedRows -> array of indexes of checked rows
        updateChecklist -> method to call when checking/unchecking row to update overall array and other states
        focusedRow -> holds index of row which is currently highlighted, contains array when multiple is require to highlight
        setFocusedRow -> setState for focusedRow
        setRowData -> method to update overall testCase data
        showRemarkDialog -> setState to display remark dialog
        showDetailDialog -> setState to display details dialog
        rowChange -> flag to check if any row is changed
*/

// const shouldRender = (prevProps, nextProps) => {
//     // console.log(prevProps.edit, nextProps.edit)
//     // console.log(prevProps, nextProps)
//     // if (deepEqual(prevProps.testCase, nextProps.testCase) === false &&  nextProps.edit === false && prevProps.edit === false){
//     //     return false
//     // }
//     if (prevProps.edit && nextProps.edit){
//         // console.log(prevProps.idx !== nextProps.focusedRow && prevProps.focusedRow !== nextProps.idx)
//         // console.log(prevProps.idx, prevProps.focusedRow, nextProps.focusedRow)
//         return prevProps.idx !== nextProps.focusedRow && prevProps.focusedRow !== nextProps.idx;
//         // return false
//     }
//     else {
//         return false
//     }
// }

// function deepEqual(object1, object2) {
//     const keys1 = Object.keys(object1);
//     const keys2 = Object.keys(object2);

//     if (keys1.length !== keys2.length) {
//         return false;
//     }

//     for (const key of keys1) {
//         const val1 = object1[key];
//         const val2 = object2[key];
//         const areObjects = isObject(val1) && isObject(val2);
//         if (
//         areObjects && !deepEqual(val1, val2) ||
//         !areObjects && val1 !== val2
//         ) {
//         return false;
//         }
//     }

//     return true;
// }

// function isObject(object) {
// return object != null && typeof object === 'object';
// }


const TableRow = (props) => {

    const rowRef = useRef(null);
    // const [checked, setChecked] = useState(props.checkedRows.includes(props.idx));
    const [checked, setChecked] = useState(null);
    // const [objName, setObjName] = useState(props.testCase.custname);
    const [objName, setObjName] = useState(null);
    const [objType, setObjType] = useState(null);
    // const [keyword, setKeyword] = useState(props.testCase.keywordVal);
    const [keyword, setKeyword] = useState(null);
    // const [input, setInput] = useState(props.testCase.inputVal[0]);
    const [input, setInput] = useState(null);
    // const [output, setOutput] = useState(props.testCase.outputVal);
    const [output, setOutput] = useState(null);
    const [inputPlaceholder, setInputPlaceholder] = useState(null);
    const [outputPlaceholder, setOutputPlaceholder] = useState(null);
    const [keywordList, setKeywordList] = useState(null);
    // const [focused, setFocused] = useState(props.focusedRow === props.idx);
    const [focused, setFocused] = useState(false);
    let objList = props.objList;
    const [highlight, setHighlight] = useState(false);
    // const [commented, setCommented] = useState(props.testCase.outputVal.slice(-2) === "##");
    const [commented, setCommented] = useState(false);
    // const [remarks, setRemarks] = useState(props.testCase.remarks.split(";").filter(remark => remark.trim()!==""));
    const [remarks, setRemarks] = useState([]);
    // const [TCDetails, setTCDetails] = useState(props.testCase.addTestCaseDetailsInfo === "" ? "" : JSON.parse(props.testCase.addTestCaseDetailsInfo));
    const [TCDetails, setTCDetails] = useState("");
    
    useEffect(()=>{
        if (!focused){
            setObjName(props.testCase.custname);
            setObjType(null);
            setKeyword(props.testCase.keywordVal);
            setInput(props.testCase.inputVal[0]);
            setOutput(props.testCase.outputVal);
            setInputPlaceholder(null);
            setOutputPlaceholder(null);
            setKeywordList(null);
            objList = props.objList;
            setRemarks(props.testCase.remarks.split(";").filter(remark => remark.trim()!==""));
            setCommented(props.testCase.outputVal.slice(-2) === "##");
            setTCDetails(props.testCase.addTestCaseDetailsInfo === "" ? "" : JSON.parse(props.testCase.addTestCaseDetailsInfo));
        }
    }, [props.rowChange, props.testCase]);

    useEffect(()=>{
        setChecked(props.checkedRows.includes(props.idx));
    }, [props.checkedRows]);

    useEffect(()=>{
        if (props.edit){
            if (props.focusedRow === props.idx){
                setFocused(true);
                rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
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
                props.setRowData({
                    rowIdx: props.idx,
                    operation: "row",
                    objName: objName,
                    keyword: keyword,
                    inputVal: input,
                    outputVal: output
                });

                // setObjName(props.testCase.custname);
                // setKeyword(props.testCase.keywordVal);
                // setInput(props.testCase.inputVal[0]);
                // setOutput(props.testCase.outputVal);
            }
        }
    }, [props.focusedRow, props.edit]);

    useEffect(()=>{
        if (props.focusedRow !== props.idx) {
            setFocused(false);
            setHighlight(false);
        }
        if (props.focusedRow !== null && typeof props.focusedRow === "object" && props.focusedRow.includes(props.idx)) {
            rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        }
    });

    const onBoxCheck = event => {
        props.updateChecklist(props.idx,"check");
        if (event.target.checked) setChecked(true);
        else setChecked(false);
    }

    const onRowClick = (event, msg) => {
        props.updateChecklist(props.idx, "row", msg);
        if(!props.edit) setHighlight(true);
        setChecked(true);
    }

    const onObjSelect = event => {
        const caseData = props.getKeywords(event.target.value)
        const placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
        setInput("");
        setOutput("");
        setKeywordList(caseData.keywords);
        setObjType(caseData.obType);
        setOutputPlaceholder(placeholders.outputval);
        setInputPlaceholder(placeholders.inputval);
        setObjName(event.target.value)
        setKeyword(caseData.keywords[0]);
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
        if (event.keyCode === 13)
            props.setRowData({rowIdx: props.idx, operation: "row", objName: objName, keyword: keyword, inputVal: input, outputVal: output});
        if (event.keyCode === 27 || event.keyCode === 13) props.setFocusedRow(null);
    }

    const onInputChange = event => setInput(event.target.value)

    const onOutputChange = event => setOutput(event.target.value)
    
    return (
        <>
        <div ref={rowRef} className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "") + (highlight || (props.focusedRow!== null  && typeof props.focusedRow === "object" && props.focusedRow.includes(props.idx)) ? " highlight-step" : "") + (props.edit ? " d__table_row_edit": "")}>
            {/* {console.log(`rendered ${props.idx+1} ${props.testCase.outputVal}`)} */}
            <span className="step_col" onClick={onRowClick}>{props.idx + 1}</span>
            <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onClick={onBoxCheck}/></span>
            
            <span className="objname_col">
                { focused ? 
                <select className="col_select" value={objName} onChange={onObjSelect} onKeyDown={submitChanges} title={objName} autoFocus>
                    { objList.map(object=> <option value={object}>{object}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick} title={objName} >{objName}</div>
                }
            </span>
            <span className="keyword_col" >
                { focused ? 
                <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges} title={keyword} >
                    { keywordList && keywordList.map(keyword => <option value={keyword}>{keyword}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick} title={keyword} >{keyword}</div> }
            </span>
            <span className="input_col" >
                { focused ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ? 
                                <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} title={inputPlaceholder}/> : 
                                <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} title={inputPlaceholder}/> :
                    <div className="d__row_text" onClick={onRowClick} title={input}>{input}</div> }
            </span>
            <span className="output_col" >
                { focused ? <input className="col_inp" value={output} placeholder={outputPlaceholder} onChange={onOutputChange} onKeyDown={submitChanges} title={outputPlaceholder}/> :
                <div className="d__row_text" onClick={onRowClick} title={output}>{output}</div> }
            </span>

            <span className="remark_col"  onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-remarks-" + (remarks.length > 0 ? "active.png" : "inactive.png")} alt="remarks" onClick={()=>{props.showRemarkDialog(props.idx); setFocused(false)}}/></span>
            <span className="details_col" onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-details-" + ( TCDetails !== "" ? (TCDetails.testcaseDetails || TCDetails.actualResult_pass || TCDetails.actualResult_fail ) ? "active.png" : "inactive.png" : "inactive.png")} alt="details"  onClick={()=>{props.showDetailDialog(props.idx); setFocused(false)}} /></span>
        </div>
        </>
    );
};





export default TableRow;
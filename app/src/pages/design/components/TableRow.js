import React, { useState, useEffect, useRef } from 'react';
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

const TableRow = (props) => {

    const rowRef = useRef(null);
    const [checked, setChecked] = useState(false);
    const [objName, setObjName] = useState(null);
    const [objType, setObjType] = useState(null);
    const [keyword, setKeyword] = useState(null);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [inputPlaceholder, setInputPlaceholder] = useState('');
    const [outputPlaceholder, setOutputPlaceholder] = useState('');
    const [keywordList, setKeywordList] = useState(null);
    const [focused, setFocused] = useState(false);
    const [highlight, setHighlight] = useState(false);
    const [commented, setCommented] = useState(false);
    const [remarks, setRemarks] = useState([]);
    const [TCDetails, setTCDetails] = useState("");
    const [escapeFlag, setEscapeFlag] = useState(true);
    const [tcAppType, setTcAppType] = useState("");
    const [disableStep, setDisableStep] = useState(false);
    let objList = props.objList;
    
    
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
            setTcAppType(props.testCase.appType);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            objList = props.objList;
            setRemarks(props.testCase.remarks.split(";").filter(remark => remark.trim()!==""));
            setCommented(props.testCase.outputVal.slice(-2) === "##");
            setTCDetails(props.testCase.addTestCaseDetailsInfo === "" ? "" : JSON.parse(props.testCase.addTestCaseDetailsInfo));
        }
    }, [props.rowChange, props.testCase]);

    useEffect(()=>{
        setChecked(props.checkedRows.includes(props.idx));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.checkedRows]);

    useEffect(()=>{
        if (props.edit){
            if (props.focusedRow === props.idx){
                setFocused(true);
                setEscapeFlag(false);
                rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
                let caseData = null;
                let placeholders = null;

                if (!objName || (objName !== "OBJECT_DELETED" && objList.includes(objName))){
                    let obj = !objName ? objList[0] : objName;
                    caseData = props.getKeywords(obj);
                    let key = (!caseData.keywords.includes(keyword) || !objName) ? caseData.keywords[0] : keyword;
                    placeholders = props.getRowPlaceholders(caseData.obType, key);

                    setKeywordList(caseData.keywords);
                    setObjType(caseData.obType);
                    setOutputPlaceholder(placeholders.outputval);
                    setInputPlaceholder(placeholders.inputval);
                    setTcAppType(caseData.appType);
                    setDisableStep(false);
                } else setDisableStep(true);
            }
            else{
                setFocused(false);
                if (escapeFlag){
                    setObjName(props.testCase.custname);
                    setKeyword(props.testCase.keywordVal);
                    setInput(props.testCase.inputVal[0]);
                    setOutput(props.testCase.outputVal);
                }
                else{
                    props.setRowData({
                        rowIdx: props.idx,
                        operation: "row",
                        objName: !objName ? objList[0] : objName,
                        keyword: !keyword ? keywordList[0] : keyword,
                        inputVal: input,
                        outputVal: output,
                        appType: tcAppType
                    });
                    setEscapeFlag(true);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.focusedRow, props.edit]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(()=>{
        if (props.focusedRow !== props.idx) {
            setFocused(false);
            setHighlight(false);
        }
        if (props.focusedRow !== null && typeof props.focusedRow === "object" && props.focusedRow.includes(props.idx)) {
            rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setTcAppType(caseData.appType);
        setDisableStep(false);
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
        if (event.keyCode === 13){
            props.setRowData({rowIdx: props.idx, operation: "row", objName: objName, keyword: keyword, inputVal: input, outputVal: output, appType: tcAppType});
            props.setFocusedRow(null);
        }
        else if (event.keyCode === 27) {
            setEscapeFlag(true);
            props.setFocusedRow(null);
        }
    }

    const onInputChange = event => setInput(event.target.value)

    const onOutputChange = event => setOutput(event.target.value)
    
    return (
        <>
        <div ref={rowRef} className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "") + (highlight || (props.focusedRow!== null  && typeof props.focusedRow === "object" && props.focusedRow.includes(props.idx)) ? " highlight-step" : "") + (disableStep ? " d__row_disable": "")}>
                <span className="step_col">{props.idx + 1}</span>
                <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onChange={onBoxCheck}/></span>
            <div className="design__tc_row" onClick={!focused ? onRowClick : undefined}>
                <span className="objname_col">
                    { focused ? 
                    <select className="col_select" value={objName} onChange={onObjSelect} onKeyDown={submitChanges} title={objName} autoFocus>
                        { objName === "OBJECT_DELETED" && <option disabled>{objName}</option> }
                        { objList.map((object, i)=> <option key={i} value={object}>{object.length >= 50 ? object.substr(0, 44)+"..." : object}</option>) }
                    </select> :
                    <div className="d__row_text" title={objName} >{objName}</div>
                    }
                </span>
                <span className="keyword_col" >
                    { focused ? 
                    <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges} title={keyword} disabled={disableStep}>
                        { objName === "OBJECT_DELETED" && <option>{keyword}</option> }
                        { keywordList && keywordList.map((keyword, i) => <option key={i} value={keyword}>{keyword}</option>) }
                    </select> :
                    <div className="d__row_text" title={keyword} >{keyword}</div> }
                </span>
                <span className="input_col" >
                    { focused ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ? 
                                    <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} title={inputPlaceholder} disabled={disableStep}/> : 
                                    <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} title={inputPlaceholder} disabled={disableStep}/> :
                        <div className="d__row_text" title={input}>{input}</div> }
                </span>
                <span className="output_col" >
                    { focused ? <input className="col_inp" value={output} placeholder={outputPlaceholder} onChange={onOutputChange} onKeyDown={submitChanges} title={outputPlaceholder} disabled={disableStep}/> :
                    <div className="d__row_text" title={output}>{output}</div> }
                </span>
            </div>
            <span className={"remark_col"+(disableStep? " d__disabled_step":"")}  onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-remarks-" + (remarks.length > 0 ? "active.png" : "inactive.png")} alt="remarks" onClick={()=>{props.showRemarkDialog(props.idx); setFocused(false)}} /></span>
            <span className={"details_col"+(disableStep? " d__disabled_step":"")} onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-details-" + ( TCDetails !== "" ? (TCDetails.testcaseDetails || TCDetails.actualResult_pass || TCDetails.actualResult_fail ) ? "active.png" : "inactive.png" : "inactive.png")} alt="details"  onClick={()=>{props.showDetailDialog(props.idx); setFocused(false)}} /></span>
        </div>
        </>
    );
};





export default TableRow;
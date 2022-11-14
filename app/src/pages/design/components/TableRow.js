import React, { useState, useEffect, useRef } from 'react';
import { updateScrollBar } from '../../global';
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
    const [commented, setCommented] = useState(false);
    const [remarks, setRemarks] = useState([]);
    const [TCDetails, setTCDetails] = useState("");
    const [escapeFlag, setEscapeFlag] = useState(true);
    const [tcAppType, setTcAppType] = useState("");
    const [disableStep, setDisableStep] = useState(false);
    let objList = props.objList;
    let draggable = props.draggable;
    
    
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
            
            let newTcDetails = props.testCase.addTestCaseDetailsInfo;
            if (typeof newTcDetails !== "object" && newTcDetails !== "") newTcDetails = JSON.parse(newTcDetails);
            setTCDetails(newTcDetails);
        }
    }, [props.rowChange, props.testCase]);

    useEffect(()=>{
        setChecked(props.stepSelect.check.includes(props.idx));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.stepSelect.check]);

    useEffect(()=>{
        if (props.edit){
            if (props.stepSelect.edit && props.stepSelect.highlight.includes(props.idx)){
                setFocused(true);
                setEscapeFlag(false);
                rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
                let caseData = null;
                let placeholders = null;

                if (!props.testCase.custname || (props.testCase.custname !== "OBJECT_DELETED" && objList.includes(props.testCase.custname))){
                    let obj = !props.testCase.custname ? objList[0] : props.testCase.custname;
                    caseData = props.getKeywords(obj);
                    let key = (!caseData.keywords.includes(props.testCase.keywordVal) || !props.testCase.custname) ? caseData.keywords[0] : props.testCase.keywordVal;
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
            updateScrollBar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.stepSelect.highlight, props.edit]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(()=>{
        if (props.stepSelect.highlight.includes(props.idx)) {
            rowRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        }
        else {
            setFocused(false);
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
            props.setStepSelect(oldState=>({...oldState, highlight: []}));
        }
        else if (event.keyCode === 27) {
            setEscapeFlag(true);
            props.setStepSelect(oldState=>({...oldState, highlight: []}));
        }
    }

    const onInputChange = event => setInput(event.target.value)

    const onOutputChange = event => setOutput(event.target.value)
    
    return (
        <>
        <div ref={rowRef} className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "") + ((props.stepSelect.highlight.includes(props.idx)) ? " highlight-step" : "") + (disableStep ? " d__row_disable": "")}>
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
                    <>
                        <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""} disabled={disableStep}>
                            { objName === "OBJECT_DELETED" && <option>{keyword}</option> }
                            { keywordList && keywordList.map((keyword, i) => <option key={i} value={keyword} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""}>{keyword}</option>) }
                        </select>
                    </> :
                    <div className="d__row_text" title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""}>{keyword}</div>}
                </span>
                <span className="input_col" >
                    { focused ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ? 
                                    <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} title={inputPlaceholder} disabled={disableStep}/> : 
                                    <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} title={inputPlaceholder} disabled={disableStep}/> :
                        <div className="d__row_text" title={input}>{draggable ? (input.length > 40 ? input.substr(0, 34) + "......" : input) : input}</div> }
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
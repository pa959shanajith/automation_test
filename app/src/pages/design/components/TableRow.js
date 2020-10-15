import React, { useState, useEffect, memo } from 'react';
import ClickAwayListener from 'react-click-away-listener';

const TableRow = memo((props) => {

    const [checked, setChecked] = useState(false);
    const [objName, setObjName] = useState(props.testCase.custname);
    const [objType, setObjType] = useState(null);
    const [keyword, setKeyword] = useState(props.testCase.keywordVal);
    const [input, setInput] = useState(props.testCase.inputVal);
    const [output, setOutput] = useState(props.testCase.outputVal);
    const [inputPlaceholder, setInputPlaceholder] = useState(null);
    const [outputPlaceholder, setOutputPlaceholder] = useState(null);
    const [keywordList, setKeywordList] = useState(null);
    const [focused, setFocused] = useState(props.focusedRow === props.idx);
    const objList = props.objList;
    const commented = props.testCase.outputVal === "##";

    useEffect(()=>{
        setFocused(props.focusedRow === props.idx);
    });

    useEffect(()=>{
        if (props.edit && checked) { 
            setFocused(true)
            props.setFocusedRow(props.idx);
        };
    }, [props.edit]);

    useEffect(()=>{
        if (focused) {
            if (objName && keyword){
                const caseData = props.getKeywords(objName)
                const placeholders = props.getRowPlaceholders(caseData.obType, keyword);
                setKeywordList(caseData.keywords);
                setObjType(caseData.obType);
                setOutputPlaceholder(placeholders.outputval);
                setInputPlaceholder(placeholders.inputval);
            }
            else if (objName){
                const caseData = props.getKeywords(objName)
                const placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
                setKeywordList(caseData.keywords);
                setObjType(caseData.obType);
                setOutputPlaceholder(placeholders.outputval);
                setInputPlaceholder(placeholders.inputval);
            }
        }
    }, [focused]);

        
    const onBoxCheck = event => {
        if (props.edit && event.target.checked) {
            setFocused(true);
            setChecked(true);
            props.setFocusedRow(props.idx);
        }
        else if (event.target.checked) setChecked(true);
        else setChecked(false);
    }

    const onRowClick = event => {
        if (props.edit){
            setChecked(true);
            setFocused(true);
            props.setFocusedRow(props.idx);
        }
        else{
            setChecked(true);
        }
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
        setOutputPlaceholder(placeholders.outputval);
        setInputPlaceholder(placeholders.inputval);
        setKeyword(event.target.value);
        
    };

    const onInputChange = event => setInput(event.target.value);
    const onOutputChange = event => setOutput(event.target.value);
    
    return (
        <div className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "")}>
            {console.log(`rendered ${props.idx+1}`)}
            <span className="step_col" onClick={onRowClick}>{props.idx + 1}</span>
            <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onChange={onBoxCheck}/></span>
            
            <span className="objname_col">
                { focused ? 
                <select className="col_select" value={objName} onChange={onObjSelect}>
                    { objList.map(object=> <option value={object}>{object}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick}>{objName}</div>
                }
            </span>
            <span className="keyword_col" >
                { focused ? <select className="col_select" value={keyword} onChange={onKeySelect}>
                    { keywordList && keywordList.map(keyword => <option value={keyword}>{keyword}</option>) }
                </select> :
                <div className="d__row_text" onClick={onRowClick}>{keyword}</div> }
            </span>
            <span className="input_col" >
                { focused ? <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange}/> :
                <div className="d__row_text" onClick={onRowClick}>{input}</div> }
            </span>
            <span className="output_col" >
                { focused ? <input className="col_inp" value={output} placeholder={outputPlaceholder} onChange={onOutputChange}/> :
                <div className="d__row_text" onClick={onRowClick}>{output}</div> }
            </span>

            <span className="remark_col" ><img src="static/imgs/ic-remarks-inactive.png" alt="remarks"/></span>
            <span className="details_col" ><img src="static/imgs/ic-details-inactive.png" alt="details"/></span>
        </div>
    );
},
(prevProps, nextProps)=>{
    console.log(prevProps.edit, nextProps.edit)
    if (nextProps.edit === prevProps.edit){
        console.log(prevProps.idx, prevProps.focusedRow, nextProps.focusedRow)
        return prevProps.idx !== nextProps.focusedRow && prevProps.focusedRow !== nextProps.idx;
    }
    else {
        return false
    }
})

export default TableRow;
import React, { useState, useEffect, useRef } from 'react';
import { updateScrollBar } from '../../global';
import "../styles/TableRow.scss";
import {Tag} from 'primereact/tag'
import Select from "react-select";
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
    const testcaseDropdownRef = useRef(null);
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
    const [allkeyword, setAllKeyword] = useState([]);
    const [showAllKeyword, setShowAllKeyword] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [objetListOption,setObjetListOption] = useState(null);
    let objList = props.objList;
    let draggable = props.draggable;
    
    
    useEffect(()=>{
        if (!focused){
            setObjName(props.testCase.custname);
            const caseData = props.getKeywords(props.testCase.custname);
            setObjType(caseData.obType);
            setKeyword(props.testCase.keywordVal);
            setSelectedOptions({value:props.testCase.keywordVal, label:props.testCase.keywordVal !== ''?(props.testCase.custname!=="OBJECT_DELETED"?(caseData.obType !== null ? props.keywordData[caseData.obType][caseData.keywords[0]].description !== undefined?props.keywordData[caseData.obType][props.testCase.keywordVal]?.description:props.keywordData[caseData.obType][caseData.keywords[0]].description: props.testCase.keywordDescription): props.testCase.keywordVal):props.testCase.keywordVal})
            setObjetListOption({value: props.testCase.custname,label:props.testCase.custname === ""?caseData.obType === "defaultList"?"@Generic":caseData.obType === "defaultListMobility"?"@Generic":objList[0]:props.testCase.custname})
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
                    setObjetListOption({value:props.testCase.custname,label:props.testCase.custname === ""? objList[0]:props.testCase.custname})
                    setKeyword(props.testCase.keywordVal);
                    setSelectedOptions({value:props.testCase.keywordVal, label:props.testCase.keywordVal === '' ?
                    props.getKeywords(props.testCase.custname).obType !== null?
                    keywordList !== null?props.keywordData[props.getKeywords(props.testCase.custname).obType][props.getKeywords(props.testCase.custname).keywords]?.description !== undefined?
                    props.keywordData[props.getKeywords(props.testCase.custname).obType][props.getKeywords(props.testCase.custname).keywords].description:keywordList[0] :
                    props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal]?.description:
                    props.testCase.custname !== "OBJECT_DELETED"?props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal].description !== undefined?
                    props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal].description:
                    props.testCase.keywordVal:props.testCase.keywordVal:
                    props.testCase.keywordVal})
                    setInput(props.testCase.inputVal[0]);
                    setOutput(props.testCase.outputVal);
                }
                else{
                    props.setRowData({
                        rowIdx: props.idx,
                        operation: "row",
                        objName: !objName ? objList[0] : objName,
                        keyword: !keyword ? keywordList !== null?keywordList[0] : props.getKeywords(props.testCase.custname).keywords : keyword,
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
        const caseData = props.getKeywords(event.value)
        const placeholders = props.getRowPlaceholders(caseData.obType, caseData.keywords[0]);
        setInput("");
        setOutput("");
        setKeywordList(caseData.keywords);
        setObjType(caseData.obType);
        setOutputPlaceholder(placeholders.outputval);
        setInputPlaceholder(placeholders.inputval);
        setObjName(event.value)
        submitData(event.value)
        setKeyword(caseData.keywords[0]);
        setSelectedOptions({value:caseData.keywords[0] ,label:props.keywordData[caseData.obType][caseData.keywords[0]].description})
        setTcAppType(caseData.appType);
        setDisableStep(false);
        setObjetListOption(event)
    };

    const onKeySelect = event => {
        if (event.value === 'show all') {
            setEndIndex(keywordList.length);
            setShowAllKeyword(true);
        }
        else{
            const placeholders = props.getRowPlaceholders(objType, event.value);
            setInput("");
            setOutput("");
            setOutputPlaceholder(placeholders.outputval);
            setInputPlaceholder(placeholders.inputval);
            setKeyword(event.value);
            submitDatakeyword(event.value)
            setAllKeyword(optionKeyword);
            setSelectedOptions(event);
            // testcaseDropdownRef.current.focus();
            testcaseDropdownRef.current.blur();
            document.dispatchEvent(new KeyboardEvent('keypress', { key: " " }));
        }
    };
    const submitData = (e) =>{
        props.setRowData({rowIdx: props.idx, operation: "row", objName: e, keyword: keyword, inputVal: input, outputVal: output, appType: tcAppType});
        // props.setStepSelect(oldState=>({...oldState, highlight: []}));
    }
    const submitDatakeyword = (e) =>{
        props.setRowData({rowIdx: props.idx, operation: "row", objName: objName, keyword: e, inputVal: input, outputVal: output, appType: tcAppType});
        // props.setStepSelect(oldState=>({...oldState, highlight: []}));
    }
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
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(10);
    const [showAll, setShowAll] = useState(false);
    // const optionKeyword = keywordList?.slice(startIndex, endIndex + 1).map((keyword, i) => {
    //     if (i < endIndex) {
    //         return {
    //             value: keyword,
    //             label: props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].description !== undefined ? props.keywordData[objType][keyword].description : keyword,
    //             tooltip: props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ? props.keywordData[objType][keyword].tooltip : keyword
    //         }
    //     }
    //     else {
    //         return {
    //             value: "show all",
    //             label: "Show All"
    //         }
    //     }});
    const optionKeyword =
    objName === "OBJECT_DELETED"
    ? keywordList?.slice(startIndex, endIndex + 1).map((keyword, i) => ({
        value: i < endIndex ? keyword : "show all",
        label:
          i < endIndex
            ? props.keywordData[objType] &&
              keyword !== "" &&
              props.keywordData[objType][keyword] &&
              props.keywordData[objType][keyword].description !== undefined
              ? props.keywordData[objType][keyword].description
              : keyword
            : "Show All",
        tooltip:
          i < endIndex
            ? props.keywordData[objType] &&
              keyword !== "" &&
              props.keywordData[objType][keyword] &&
              props.keywordData[objType][keyword].tooltip !== undefined
              ? props.keywordData[objType][keyword].tooltip
              : keyword
            : "",
      }))
    : keywordList?.slice(startIndex, endIndex + 1).map((keyword, i) => ({
        value: i < endIndex ? keyword : "show all",
        label:
          i < endIndex
            ? props.keywordData[objType] &&
              keyword !== "" &&
              props.keywordData[objType][keyword] &&
              props.keywordData[objType][keyword].description !== undefined
              ? props.keywordData[objType][keyword].description
              : keyword
            : "Show All",
        tooltip:
          i < endIndex
            ? props.keywordData[objType] &&
              keyword !== "" &&
              props.keywordData[objType][keyword] &&
              props.keywordData[objType][keyword].tooltip !== undefined
              ? props.keywordData[objType][keyword].tooltip
              : keyword
            : "",
      }));

// Depending on objname, optionKeyword will have different values.

    
        const optionElement = objList?.map((object, i) => ({
            key: i,
            value: object,
            label: object.length >= 50 ? object.substr(0, 44) + "..." : object,
            disabled: objName === "OBJECT_DELETED" ? (object !== objName) : false
          }));
    const getOptionElementLable = (option) =>{
        return (
            <div title={option.label}>
            {option.label}
          </div>
        );
    }
        const getOptionLabel = (option) => {
            return (
              <div title={option.tooltip}>
                {option.label}
              </div>
            );
          };

          const customElementStyles = {
            menuList: (base) => ({
              ...base,
              FontSize: 100,
              fontSize: 14,
              background: "white",
              height:Object.keys(optionElement).length>6?200:110,
            }),
            menuPortal: (base) => ({ 
                ...base, 
                zIndex: 999999
             }),
            menu: (base) => ({ 
                ...base, 
                zIndex: 999999
            }),
            control: (base) => ({
              ...base,
              height: 25,
              minHeight: 35,
              width: 150
            }),
            option: (base) =>({
                ...base,
                padding: "3px",
              fontFamily: "Open Sans",
            })
          };

        const customStyles = {
            menuList: (base) => ({
              ...base,
              FontSize: 100,
              fontSize: 14,
              background: "white",
              height:Object.keys(optionKeyword).length>4?200:110,
            }),
            menuPortal: (base) => ({ 
                ...base, 
                zIndex: 999999
             }),
            menu: (base) => ({ 
                ...base, 
                zIndex: 999999
            }),
            control: (base) => ({
              ...base,
              height: 25,
              minHeight: 35,
              width: 150
            }),
            option: (base) =>({
                ...base,
                padding: "3px",
              fontFamily: "Open Sans",
            })
          };
    return (
        <>
        <div ref={rowRef} className={"d__table_row" + (props.idx % 2 === 1 ? " d__odd_row" : "") + (commented ? " commented_row" : "") + ((props.stepSelect.highlight.includes(props.idx)) ? " highlight-step" : "") + (disableStep ? " d__row_disable": "")}>
                <span className="step_col">{props.idx + 1}</span>
                <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onChange={onBoxCheck}/></span>
            <div className="design__tc_row" onClick={!focused ? onRowClick : undefined}>
                <span className="objname_col">
                    { focused ? 
                    // <select className="col_select" value={objName} onChange={onObjSelect} onKeyDown={submitChanges} title={objName} autoFocus>
                    //     { objName === "OBJECT_DELETED" && <option disabled>{objName}</option> }
                    //     { objList.map((object, i)=> <option key={i} value={object}>{object.length >= 50 ? object.substr(0, 44)+"..." : object}</option>) }
                    // </select>
                    <Select  value={objetListOption} onChange={onObjSelect} onKeyDown={submitChanges} title={objName} options={optionElement} getOptionLabel={getOptionElementLable} styles={customElementStyles} menuPortalTarget={document.body} menuPlacement="auto" menuPosition={'fixed'} placeholder='Select'/>
                     :
                    <div className="d__row_text" title={objName} >
                        <span style={(props.testcaseDetailsAfterImpact && props.testcaseDetailsAfterImpact?.custNames?.includes(objName) && props.impactAnalysisDone?.addedTestStep)?{overflow: 'hidden',display: 'inline-block',width: '6rem',textOverflow: 'ellipsis'}:null}>{objName}</span>
                        {(objName==="OBJECT_DELETED" && props.impactAnalysisDone?.addedElement)?<span style={{display:'inline-block',marginRight:'6px'}}><Tag severity="danger" value="deleted"></Tag></span>:null}
        {(props.testcaseDetailsAfterImpact && props.testcaseDetailsAfterImpact?.custNames?.includes(objName) && props.impactAnalysisDone?.addedTestStep) ? <span style={{display:'inline-block',marginRight:'5px'}}><Tag severity="success" value="Newly Added"></Tag></span>:null}
                        </div>

                    }
                </span>
                <span className="keyword_col" title={props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""} >
                    { focused ? 
                    <>
                        <Select className='select-option' value={selectedOptions.label !== undefined?selectedOptions.label !== ''?selectedOptions.label!==selectedOptions.value?selectedOptions:objType !== null? {label:props.keywordData[objType][selectedOptions.value]?.description!==undefined?props.keywordData[objType][selectedOptions.value]?.description:keyword, value:props.keywordData[objType][selectedOptions.value]?.description!== undefined?props.keywordData[objType][selectedOptions.value]?.description:keyword}:selectedOptions:{label:props.keywordData[objType][props.getKeywords(props.testCase.custname).keywords[0]]?.description, value:keyword}:{label:props.keywordData[objType][props.getKeywords(props.testCase.custname).keywords[0]]?.description, value:keyword}} id="testcaseDropdownRefID" blurInputOnSelect={false} ref={testcaseDropdownRef} isDisabled={objName==="OBJECT_DELETED"?true:optionKeyword === undefined?true:false} onChange={onKeySelect} onKeyDown={submitChanges} title={props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ? props.keywordData[objType][keyword].tooltip : ""} isMulti={false} closeMenuOnSelect={false} options={optionKeyword}  menuPortalTarget={document.body} styles={customStyles} getOptionLabel={getOptionLabel} menuPlacement="auto" placeholder='Select'/>
                    </> :
                        <div className="d__row_text" title={props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ? props.keywordData[objType][keyword].tooltip : ""}>{props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].description !== undefined ? props.keywordData[objType][keyword].description : keyword}</div>}
                            
                        {/* <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""} disabled={disableStep}>
                            { objName === "OBJECT_DELETED" && <option>{keyword}</option> }
                            { keywordList && keywordList.map((keyword, i) => <option key={i} value={keyword} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""}>{keyword}</option>) }
                        </select> */}
                </span>
                <span className="input_col" >
                    { focused ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ? 
                                    <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} title={inputPlaceholder} disabled={disableStep}/> : 
                                    <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} title={inputPlaceholder} disabled={disableStep}/> :
                        <div className="d__row_text" title={input}>{draggable ? (input.length > 40 ? input.substr(0, 34) + "......" : input) : input}</div> }
                </span>
                <span className="output_col" >
                    { focused ? <input className="col_out" value={output} placeholder={outputPlaceholder} onChange={onOutputChange} onKeyDown={submitChanges} title={outputPlaceholder} disabled={disableStep}/> :
                    <div className="d__row_text" title={output}>{output}</div> }
                </span>
            </div>
            {/* <span className={"remark_col"+(disableStep? " d__disabled_step":"")}  onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-remarks-" + (remarks.length > 0 ? "active.png" : "inactive.png")} alt="remarks" onClick={()=>{props.showRemarkDialog(props.idx); setFocused(false)}} /></span> */}
            <span className={"details_col"+(disableStep? " d__disabled_step":"")} onClick={(e)=>onRowClick(e, "noFocus")}>
                <img src={"static/imgs/ic-details-" + ( TCDetails !== "" ? (TCDetails.testcaseDetails || TCDetails.actualResult_pass || TCDetails.actualResult_fail ) ? "active.png" : "inactive.png" : "inactive.png")} alt="details"  onClick={()=>{props.showDetailDialog(props.idx); setFocused(false)}} />
            </span>
        </div>
        </>
    );
};





export default TableRow;
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch ,useSelector} from 'react-redux';
import { updateScrollBar } from '../../global';
import "../styles/TableRow.scss";
import { Tag } from 'primereact/tag'
import Select, { components } from "react-select";
import { SetDebuggerPoints } from '../designSlice';
import { Icon } from '@mui/material';
import 'primeicons/primeicons.css';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { getScreens } from '../api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';

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
    const dispatch=useDispatch()
  const{setInputKeywordName,setCustomTooltip,setLangSelect,setInputEditor,setAlloptions,setCustomEdit,assignUser} =props;
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
    const [debuggerPoint,setDebuggerPoint]=useState(false);
    const [debugeerInLightMode,setDebugeerInLightMode]=useState(false);
    const debuggerPoints=useSelector(state=>state.design.debuggerPoints)
    const advanceDebug=useSelector(state=>state.design.advanceDebug)
    const enablePlayButton=useSelector(state=>state.design.enablePlayButton)
    const currentplaybutton=useSelector(state=>state.design.currentplaybutton)
   
    const [elementData, setElementData] = useState([]);
    const [visible, setVisible] = useState(false);
    let objList = props.objList;
    let draggable = props.draggable;

  const { MenuList } = components;

  const hanldlecustomClick = (child) => {
    setInputKeywordName(child.props.data.label);
    setCustomTooltip(child.props.data.tooltip);
    setLangSelect(child.props.data.language);
    setInputEditor(child.props.data.isCode);
  }
  const CustomMenu = (value) => {
    return (
    <div style={{ width: '100%', position: 'relative', paddingBottom: "3rem"  }}>
      <MenuList {...value} style={{ width: '100%'}}>
        {value.children && Array.isArray(value.children) && value.children.map((child, index) => (
          <div key={index}>
            {child.props && child.props.data && child.props.data.isCode !== "" ? (
              <div className='optionstyle'>
                <div style={{ width: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {child}
                </div>
                {/* {child.props.data.label && child.props.data.label.length > 27 ? (
                <div>{child.props.data.label.substring(0, 27)}....</div>
              ) : (
                child
              )} */}
                <img src='static/imgs/pencil-edit_old.svg' alt='editImg' className='optionstyle_img testTooltip'
                  onClick={() => {
                    props.setStepOfCustomKeyword(props.stepSelect.check[0]);
                    props.setCustomKeyWord(objType);
                    hanldlecustomClick(child, objType);
                    setCustomEdit(true);
                  }
                }
                title={'Edit'}
                />
              </div>
            ) : (
              // child.props.data.label && child.props.data.label.length > 27 ? (
              //   <div>{child.props.data.label.substring(0, 27)}....</div>
              // ) : (
              //   child
              // )
              child
            )}
          </div>
        ))}
      </MenuList >
        <Button type="button" label='Custom Keyword' text raised style={{ fontSize: "2vh", width: "100%", position: 'absolute', bottom: 0, left: 0,backgroundColor:'#FFFF',zIndex:'2'}} value={'custom keyword'} icon="pi pi-plus" size="small" onClick={() => { props.setStepOfCustomKeyword(props.stepSelect.check[0]); props.setCustomKeyWord(objType); }}>
        </Button>
      </div>

      // <MenuList {...value}>
      //   {value.children && Array.isArray(value.children) && value.children.map((child, index) => (
      //     <div key={index}>
      //     {child.props && child.props.data && child.props.data.isCode !== "" ? (
      //       <div className='optionstyle'>
      //         {child.props.data.label && child.props.data.label.length > 27 ? (
      //           <div>{child.props.data.label.substring(0, 27)}....</div>
      //         ) : (
      //           child
      //         )}
      //         <img src='static/imgs/ic-jq-editsteps.png' alt='editImg' className='optionstyle_img'
      //           onClick={() => {
      //             props.setStepOfCustomKeyword(props.stepSelect.check[0]);
      //             props.setCustomKeyWord(objType);
      //             hanldlecustomClick(child, objType);
      //             setCustomEdit(true);
      //           }}
      //         />
      //       </div>
      //     ) : (
      //       child.props.data.label && child.props.data.label.length > 27 ? (
      //         <div>{child.props.data.label.substring(0, 27)}....</div>
      //       ) : (
      //         child
      //       )
      //     )}
      //   </div>
      //   ))}

      //   <Button type="button" label='Custom Keyword' text raised style={{ fontSize: "2vh", width: "100%" }} value={'custom keyword'} icon="pi pi-plus" size="small" onClick={() => { props.setStepOfCustomKeyword(props.stepSelect.check[0]); props.setCustomKeyWord(objType); }}>
      //   </Button>
      // </MenuList >
    );
  };

  useEffect(() => {
    if (!focused) {
      setObjName(props.testCase.custname);
      const caseData = props.getKeywords(props.testCase.custname);
      setObjType(caseData.obType);
      setKeyword(props.testCase.keywordVal);
      setSelectedOptions({ value: props.testCase.keywordVal, label: !props.arrow ? props.testCase.keywordVal !== '' ? (props.testCase.custname !== "OBJECT_DELETED" ? (caseData.obType !== null ? props.keywordData[caseData.obType][caseData.keywords[0]].description !== undefined ? props.keywordData[caseData.obType][props.testCase.keywordVal]?.description : props.keywordData[caseData.obType][caseData.keywords[0]].description : props.testCase.keywordDescription) : props.testCase.keywordVal) : props.testCase.keywordVal : caseData.keywords[0] })
      setObjetListOption({ value: props.testCase.custname, label: props.testCase.custname === "" ? caseData.obType === "defaultList" ? "@Generic" : caseData.obType === "defaultListMobility" ? "@Generic" : objList[0] : props.testCase.custname })
      setInput(props.testCase.inputVal[0]);
      setOutput(props.testCase.outputVal);
      setInputPlaceholder(null);
      setOutputPlaceholder(null);
      setKeywordList(null);
      setTcAppType(props.testCase.appType);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      objList = props.objList;
      setRemarks(props.testCase.remarks.split(";").filter(remark => remark.trim() !== ""));
      setCommented(props.testCase.outputVal.slice(-2) === "##");

      let newTcDetails = props.testCase.addTestCaseDetailsInfo;
      if (typeof newTcDetails !== "object" && newTcDetails !== "") newTcDetails = JSON.parse(newTcDetails);
      setTCDetails(newTcDetails);
    }
  }, [props.rowChange, props.testCase]);
  useEffect(()=>{
    if(!debuggerPoints.length){
      setDebuggerPoint(false)
      setDebugeerInLightMode(false)
     
    }
    },[debuggerPoints])
  useEffect(() => {
    setChecked(props.stepSelect.check.includes(props.idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.stepSelect.check]);
  useEffect(() => {
    if (props.edit) {
      if (props.stepSelect.edit && props.stepSelect.highlight.includes(props.idx)) {
        setFocused(true);
        setEscapeFlag(false);
        rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        let caseData = null;
        let placeholders = null;

        if (!props.testCase.custname || (props.testCase.custname !== "OBJECT_DELETED" && objList.includes(props.testCase.custname))) {
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
      else {
        setFocused(false);
        if (escapeFlag) {
          setObjName(props.testCase.custname);
          setObjetListOption({ value: props.testCase.custname, label: props.testCase.custname === "" ? objList[0] : props.testCase.custname })
          setKeyword(props.testCase.keywordVal);
          setSelectedOptions({
            value: props.testCase.keywordVal, label: !props.arrow ? props.testCase.keywordVal === '' ?
              props.getKeywords(props.testCase.custname).obType !== null ?
                keywordList !== null ? props.keywordData[props.getKeywords(props.testCase.custname).obType][props.getKeywords(props.testCase.custname).keywords]?.description !== undefined ?
                  props.keywordData[props.getKeywords(props.testCase.custname).obType][props.getKeywords(props.testCase.custname).keywords].description : keywordList[0] :
                  props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal]?.description :
                props.testCase.custname !== "OBJECT_DELETED" ? props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal].description !== undefined ?
                  props.keywordData[props.getKeywords(props.testCase.custname).obType][props.testCase.keywordVal].description :
                  props.testCase.keywordVal : props.testCase.keywordVal :
              props.testCase.keywordVal : props.testCase.keywordVal
          })
          setInput(props.testCase.inputVal[0]);
          setOutput(props.testCase.outputVal);
        }
        else {
          props.setRowData({
            rowIdx: props.idx,
            operation: "row",
            objName: !objName ? objList[0] : objName,
            keyword: !keyword ? keywordList !== null ? keywordList[0] : props.getKeywords(props.testCase.custname).keywords : keyword,
            inputVal: input,
            outputVal: output,
            appType: tcAppType
          });
          setEscapeFlag(true);
        }
      }
      updateScrollBar();
    }
  }, [props.stepSelect.highlight, props.edit]);

  
  useEffect(() => {
    if (props.stepSelect.highlight.includes(props.idx)) {
      rowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    else {
      setFocused(false);
    }
  });

  const onBoxCheck = event => {
    props.updateChecklist(props.idx, "check");
    if (event.target.checked) setChecked(true);
    else setChecked(false);
  }

  const onRowClick = (event, msg) => {
    props.updateChecklist(props.idx, "row", msg);
    setChecked(true);
  }

  const onObjSelect = event => {
    const caseData = props.getKeywords(event.value);
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
    setSelectedOptions({ value: caseData.keywords[0], label: !props.arrow ? props.keywordData[caseData.obType][caseData.keywords[0]].description : caseData.keywords[0] })
    setTcAppType(caseData.appType);
    setDisableStep(false);
    setObjetListOption(event)
  };

  const onKeySelect = event => {
    if (event.value === 'show all') {
      setEndIndex(keywordList.length);
      setShowAllKeyword(true);
    } else if (event.value == 'custom keyword') {
      props.setStepOfCustomKeyword(props.stepSelect.check[0])
      props.setCustomKeyWord(objType);
    }
    else {
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
  const submitData = (e) => {
    props.setRowData({ rowIdx: props.idx, operation: "row", objName: e, keyword: keyword, inputVal: input, outputVal: output, appType: tcAppType });
    // props.setStepSelect(oldState=>({...oldState, highlight: []}));
  }
  const submitDatakeyword = (e) => {
    props.setRowData({ rowIdx: props.idx, operation: "row", objName: objName, keyword: e, inputVal: input, outputVal: output, appType: tcAppType });
    // props.setStepSelect(oldState=>({...oldState, highlight: []}));
  }
  const submitChanges = event => {
    if (event.keyCode === 13) {
      props.setRowData({ rowIdx: props.idx, operation: "row", objName: objName, keyword: keyword, inputVal: input, outputVal: output, appType: tcAppType });
      props.setStepSelect(oldState => ({ ...oldState, highlight: [] }));
    }
    else if (event.keyCode === 27) {
      setEscapeFlag(true);
      props.setStepSelect(oldState => ({ ...oldState, highlight: [] }));
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
      ? keywordList?.slice(startIndex, endIndex + 1).map((keyword, i) => {
        const option = {
          value: i < endIndex ? keyword : "show all",
          isCode:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].hasOwnProperty("code") !==
                false
                ? props.keywordData[objType][keyword].code
                : ""
              : "",
          language:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].hasOwnProperty("code") !==
                false
                ? props.keywordData[objType][keyword].language
                : ""
              : "",
          label:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].description !== undefined
                ? !props.arrow ? props.keywordData[objType][keyword].description : keyword
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
        };
        return option;
      })
      : keywordList?.slice(startIndex, endIndex + 1).map((keyword, i) => {
        const option = {
          value: i < endIndex ? keyword : "show all",
          isCode:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].hasOwnProperty("code") ===
                false
                ? ""
                : props.keywordData[objType][keyword]?.code
              : "",
          language:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].hasOwnProperty("code") !==
                false
                ? props.keywordData[objType][keyword].language
                : ""
              : "",
          label:
            i < endIndex
              ? props.keywordData[objType] &&
                keyword !== "" &&
                props.keywordData[objType][keyword] &&
                props.keywordData[objType][keyword].description !== undefined
                ? !props.arrow ? props.keywordData[objType][keyword].description : keyword
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
        };
        return option;
      }
      );
// console.log(optionKeyword,'optionKeyword',keywordList);
  const handleOption = () => {
    var optionKeyword_2 = keywordList?.slice(startIndex, keywordList.length).map((keyword, i) => {
      const option = {
        value: i < keywordList.length ? keyword : "show all",
        isCode: i < keywordList.length
          ? props.keywordData[objType] &&
            keyword !== "" &&
            props.keywordData[objType][keyword] &&
            props.keywordData[objType][keyword].hasOwnProperty("code") === false
            ? ""
            :props.keywordData[objType][keyword]?.code
          : "",
        language: i < keywordList.length
          ? props.keywordData[objType] &&
            keyword !== "" &&
            props.keywordData[objType][keyword] &&
            props.keywordData[objType][keyword].hasOwnProperty("code") !== false
            ? props.keywordData[objType][keyword].language
            : ""
          : "",
        label: i < keywordList.length
          ? props.keywordData[objType] &&
            keyword !== "" &&
            props.keywordData[objType][keyword] &&
            props.keywordData[objType][keyword].description !== undefined
            ? !props.arrow ? props.keywordData[objType][keyword]?.description : keyword
            : keyword
          : "Show All",
        tooltip: i < keywordList.length
          ? props.keywordData[objType] &&
            keyword !== "" &&
            props.keywordData[objType][keyword] &&
            props.keywordData[objType][keyword].tooltip !== undefined
            ? props.keywordData[objType][keyword].tooltip
            : keyword
          : "",
      };
      return option;
    });
    setAlloptions(optionKeyword_2);
  };
  useEffect(() => {
    handleOption();
  }, [keywordList, props.keywordData, objType, props.arrow]);

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
              width: "85%"
            }),
            option: (base, { data }) => ({
                ...base,
                padding: "3px",
              fontFamily: "Open Sans",
              background: data.isCode === "" ? '' : '#e3caff',
              width: '100%'
            })
          };
          const list = ["@Generic", "@Excel", "@Custom", "@Browser", "@BrowserPopUp", "@Object", "@Word"]
          const showCard = async(name) =>{
            const defaultNames = { xpath: 'Absolute X-Path', id: 'ID Attribute', rxpath: 'Relative X path', name: 'Name Attribute', classname: 'Classname Attribute', cssselector: 'CSS Selector', href: 'Href Attribute', label: 'Label' }
              const screenData = await getScreens(props.fetchData['projectID'])
              if(screenData.error)return;
              else{
                const elementScreen = screenData.screenList.find((item)=>item._id === props.fetchData['parent']['_id'])
                if (props.typesOfAppType==="Web" && !list.includes(name)){
                  const objectData = elementScreen.related_dataobjects.find((sub)=>sub.custname === name)
                  let element = objectData?.xpath?.split(';')
                  if(element==undefined) return;
                  if(props.typesOfAppType==="Web" && element[0] !== 'iris' ){
                    let dataValue = []
                    let elementFinalProperties = {
                      xpath: (element[0] === "null" || element[0] === "" || element[0] === "undefined") ? 'None' : element[0],
                      id: (element[1] === "null" || element[1] === "" || (element[1] === "undefined")) ? 'None' : element[1],
                      rxpath: (element[2] === "null" || element[2] === "" || (element[2] === "undefined")) ? 'None' : element[2],
                      name: (element[3] === "null" || element[3] === "" || (element[3] === "undefined")) ? 'None' : element[3],
                      classname: (element[5] === "null" || element[5] === "" || (element[5] === "undefined")) ? 'None' : element[5],
                      cssselector: (element[12] === "null" || element[12] === "" || (element[12] === "undefined")) ? 'None' : element[12],
                      href: (element[11] === "null" || element[11] === "" || (element[11] === "undefined")) ? 'None' : element[11],
                      label: (element[10] === "null" || element[10] === "" || (element[10] === "undefined")) ? 'None' : element[10],
                    }

                    Object.entries(elementFinalProperties).forEach(([key, value], index) => {
                      let currindex = objectData.identifier.filter(element => element.identifier === key)
                      dataValue.push({ id: currindex[0].id, identifier: key, key, value, name: defaultNames[key] })
                    }
                    )
                    dataValue.sort((a, b) => a.id - b.id)
                    setElementData(dataValue);
                    setVisible(true)
                  }
                }
              }
          }
          const elementValuetitle=(rowdata)=>{
            return (
              <div className={`tooltip__target-${rowdata.value}`} title={rowdata.value}>{rowdata.value}</div>
            )
           }
           const ActivateDebuggerPoint=()=>{
            setDebuggerPoint(debuggerPoint=>!debuggerPoint)
            if(!debuggerPoint){
              dispatch(SetDebuggerPoints({push:'push',stepNo:props.idx+1}))
            }
              else{
                dispatch(SetDebuggerPoints({push:'pop',stepNo:props.idx+1}))
              }
              
          }

    return (
        <>
        <div ref={rowRef} style={(debuggerPoints.length>=1 && currentplaybutton===props.idx+1 && enablePlayButton && advanceDebug)?{background:' floralwhite ',color:'gray',borderTop:'1px solid gray',borderBottom:'1px solid gray'}:null}className={"d__table_row " + ((assignUser && props.idx % 2 === 1) ? " d__odd_row" : "") + ((assignUser && commented) ? " commented_row" : "") + (assignUser && ((props.stepSelect.highlight.includes(props.idx))) ? " highlight-step" : "") + ((assignUser && disableStep)  ? " d__row_disable": "")} >
                <span className="step_col" onMouseEnter={advanceDebug?!debuggerPoint?()=>{setDebugeerInLightMode(true)}:null:null} onMouseLeave={advanceDebug?!debuggerPoint?()=>{setDebugeerInLightMode(false)}:null:null} style={{cursor:'pointer',display:'flex',justifyContent:'space-evenly',alignItems:'center'}} 
                onClick={ActivateDebuggerPoint}>
                  <span title={debuggerPoint?'Breakpoint':null}><i style={(debuggerPoints.length>=1 && currentplaybutton===props.idx+1 && enablePlayButton)?{fontSize:'20px'}:{fontSize:'13px'}} className={advanceDebug?(debuggerPoints.length>=1 && currentplaybutton===props.idx+1 && enablePlayButton )?'pi pi-caret-right':debuggerPoint?'pi pi-circle-fill':debugeerInLightMode?'pi pi-circle-fill light-fill':'pi pi-circle-fill light-fill-zero':null} /></span>
                  <span>{props.idx + 1}</span>
                  </span>
                <span className="sel_col"><input className="sel_obj" type="checkbox" checked={checked} onChange={onBoxCheck} disabled={!assignUser}/></span>
            <div className="design__tc_row" onClick={!focused ? onRowClick : undefined}>
                <span className="objname_col">
                    { focused && assignUser ? 
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
                    { focused && assignUser  ? 
                    <>
                        <Select className='select-option' value={selectedOptions.label !== undefined?selectedOptions.label !== ''?selectedOptions.label!==selectedOptions.value?selectedOptions:objType !== null? {label:props.keywordData[objType][selectedOptions.value]?.description!==undefined?!props.arrow?props.keywordData[objType][selectedOptions.value]?.description:selectedOptions.value:keyword, value:props.keywordData[objType][selectedOptions.value]?.description!== undefined?!props.arrow?props.keywordData[objType][selectedOptions.value]?.description:selectedOptions.value:keyword}:selectedOptions:{label:!props.arrow?props.keywordData[objType][props.getKeywords(props.testCase.custname).keywords[0]]?.description:props.getKeywords(props.testCase.custname).keywords[0], value:keyword}:{label:!props.arrow?props.keywordData[objType][props.getKeywords(props.testCase.custname).keywords[0]]?.description:props.getKeywords(props.testCase.custname).keywords[0], value:keyword}} id="testcaseDropdownRefID" blurInputOnSelect={false} ref={testcaseDropdownRef} isDisabled={objName==="OBJECT_DELETED"?true:optionKeyword === undefined?true:false} onChange={onKeySelect} onKeyDown={submitChanges} title={props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ? props.keywordData[objType][keyword].tooltip : ""} isMulti={false} closeMenuOnSelect={false} components={{ MenuList: CustomMenu }} options={optionKeyword}  menuPortalTarget={document.body} styles={customStyles} getOptionLabel={getOptionLabel} menuPlacement="auto" placeholder='Select'/>                    
                    </> :
                        <div className="d__row_text" title={props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ? props.keywordData[objType][keyword].tooltip : ""}>{props.keywordData[objType] && keyword !== "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].description !== undefined ? !props.arrow?props.keywordData[objType][keyword].description:keyword : keyword}</div>}
                            
                        {/* <select className="col_select" value={keyword} onChange={onKeySelect} onKeyDown={submitChanges} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""} disabled={disableStep}>
                            { objName === "OBJECT_DELETED" && <option>{keyword}</option> }
                            { keywordList && keywordList.map((keyword, i) => <option key={i} value={keyword} title={props.keywordData[objType] && keyword != "" && props.keywordData[objType][keyword] && props.keywordData[objType][keyword].tooltip !== undefined ?props.keywordData[objType][keyword].tooltip:""}>{keyword}</option>) }
                        </select> */}
          </span>
          <span className="input_col" >
            {focused && assignUser ? ['getBody', 'setHeader', 'setWholeBody', 'setHeaderTemplate'].includes(keyword) ?
              <textarea className="col_inp col_inp_area" value={input} onChange={onInputChange} title={inputPlaceholder} disabled={disableStep} /> :
              <input className="col_inp" value={input} placeholder={inputPlaceholder} onChange={onInputChange} onKeyDown={submitChanges} title={inputPlaceholder} disabled={disableStep} /> :
              <div className="d__row_text" title={input}>{draggable ? (input.length > 40 ? input.substr(0, 34) + "......" : input) : input}</div>}
          </span>
          <span className="output_col" >
            {focused && assignUser ? <input className="col_out" value={output} placeholder={outputPlaceholder} onChange={onOutputChange} onKeyDown={submitChanges} title={outputPlaceholder} disabled={disableStep} /> :
              <div className="d__row_text" title={output}>{output}</div>}
          </span>
        </div>
        {/* <span className={"remark_col"+(disableStep? " d__disabled_step":"")}  onClick={(e)=>onRowClick(e, "noFocus")}><img src={"static/imgs/ic-remarks-" + (remarks.length > 0 ? "active.png" : "inactive.png")} alt="remarks" onClick={()=>{props.showRemarkDialog(props.idx); setFocused(false)}} /></span> */}
        <span className={"details_col" + (disableStep ? " d__disabled_step" : "")} onClick={(e) => onRowClick(e, "noFocus")}>
          <span>
          <img src={"static/imgs/ic-details-" + (TCDetails !== "" ? (TCDetails.testcaseDetails || TCDetails.actualResult_pass || TCDetails.actualResult_fail) ? "active.png" : "inactive.png" : "inactive.png")} alt="details" title='Details' className='eyeIconImg'  onClick={assignUser ?() => { props.showDetailDialog(props.idx); setFocused(false) }:null} style={{cursor: assignUser ? 'pointer' : 'not-allowed'}} />
          {objName !== "" && <> {objName !== "OBJECT_DELETED" && props.typesOfAppType === 'Web' && (!list.includes(objName)) && <span onClick={()=>showCard(objName)} title='Element Properties' className='pi pi-eye eyeIcon3'></span>}</>}</span>
        </span>
      </div>
        <Dialog header={"Element Properties"} style={{width:'66vw'}} visible={visible} onHide={() => setVisible(false)}>
          <DataTable value={elementData}>
            <Column field="id" header="Priority" headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ textAlign: 'left', flexGrow: '0.2', minWidth: '4rem' }} style={{ minWidth: '3rem' }} />
            <Column field="name" header="Properties " headerStyle={{ width: '30%', minWidth: '4rem', flexGrow: '0.2' }} bodyStyle={{ flexGrow: '0.2', minWidth: '2rem' }} style={{ width: '20%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
            <Column field="value" header="Value" style={{textOverflow: 'ellipsis', overflow: 'hidden',maxWidth: '16rem'}} body={elementValuetitle}></Column>
          </DataTable>
        </Dialog>
        </>
    );
};





export default TableRow;
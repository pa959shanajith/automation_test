import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import * as actions from '../state/action';
import { ValidationExpression } from '../../global';
import {Messages as MSG, setMsg } from '../../global'
import * as scrapeApi from '../api';
import { Dialog } from 'primereact/dialog';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "../styles/ScrapeObject.scss";

const ScrapeObject = props => {

    const dispatch = useDispatch();
    const objValue = useSelector(state=>state.scrape.objValue);
    const appType = useSelector(state=>state.mindmap.appType)
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const [objName, setObjName] = useState(props.object.title);
    const [checked, setChecked] = useState(props.object.checked);
    const [activeEye, setActiveEye] = useState(false);
    const [edit, setEdit] = useState(false);
    const[elementProperties,setElementProperties]=useState(false);
    const[elementValues,setElementValues]=useState([])
    const[isIdentifierVisible,setIsIdentifierVisible]=useState(false)
    const[regex,setRegex]=useState("")
    const[moveCardUp,setMoveCardUp]=useState(false)
    const[cardBottom,setCardBottom]=useState(null)
    const defaultIdentifier=[{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'},{id:6,identifier:'cssselector',name:'CSS Selector'},{id:7,identifier:'href',name:'Href Attribute'},{id:8,identifier:'label',name:'Label'}]    
    const defaultNames={xpath:'Absolute X-Path',id:'ID Attribute',rxpath:'Relative X path',name:'Name Attribute',classname:'Classname Attribute',cssselector:'CSS Selector',href:'Href Attribute',label:'Label'}
    const handleObjName = event => setObjName(event.target.value);
    const handleCheckbox = event => {
        props.updateChecklist(props.object.val);
        setChecked(event.target.checked)
    }

    useEffect(()=>{
        if (objValue.val === props.object.val) setActiveEye(true);
        else if (activeEye) setActiveEye(false);
    }, [objValue])

    useEffect(()=>{
        setObjName(props.object.title);
        setChecked(props.object.checked);
        setEdit(false);
    }, [props]);
    
    const handleOutsideClick = () => {
        setObjName(props.object.title);
        setEdit(false);        
    }

    const checkKeyPress = event => {
        if (event.keyCode === 13 && ValidationExpression(objName, "validName")) {
            setEdit(false);
            props.modifyScrapeItem(props.object.val, {custname: objName})
        }
    }

    const onHighlight = () => {
        // props.setActiveEye(props.object.val);
        let objVal = { ...props.object };
        dispatch({type: actions.SET_OBJVAL, payload: objVal});
    }
const showIdentifierCard=(e)=>{
    setIsIdentifierVisible(true)
}
const textEditor = (options) => {
    return <InputText type="text" style={{width:'80%'}} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
};
const saveElementProperties=()=>{
    let actualXpath=props.object.xpath.split(';')
    let arr=elementValues.map(element=>(
        (element.value==='None')?{...element,value:"null"}:element
    ))
    let obj=arr.reduce((obj, item) => ({...obj, [item.key]: item.value}) ,{});
    let newIdentifierList=arr.map(element=>(
        {id:element.id,identifier:element.identifier}
    )).map((element,idx)=>{
        element.id=idx+1
        return element
    })
    
    
    let finalXPath=`${obj.xpath};${obj.id};${obj.rxpath};${obj.name};${actualXpath[4]};${obj.classname};${actualXpath[6]};${actualXpath[7]};${actualXpath[8]};${actualXpath[9]};${obj.label};${obj.href};${obj.cssselector}`
    console.log(finalXPath)
    let params = {
        'objectId':props.object.objId,
        'identifiers':newIdentifierList,
        'xpath':finalXPath,
        'param':'updatedProperties',
        'userId': user_id,
        'roleId': role,
        
        // 'identifier'
    }
    scrapeApi.updateScreen_ICE(params)
        .then(response => {
            console.log(response)
            if(response == "Success"){
                setElementProperties(false)
               
                setMsg(MSG.SCRAPE.SUCC_OBJ_PROPERTIES);
                dispatch({type: actions.SET_ELEMENT_PROPERTIES, payload:true})
                // setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'}])
                
            }
        })
        .catch(error => {
            console.log(error)
            
                setMsg("Some Error occured while updating element properties.");
                // setIdentifierList([{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'}])
        }
        )
}
const footerContent = (
    <div>
        <div style={{position:'absolute',fontStyle:'italic'}}><span style={{color:'red'}}>*</span>Click on value fields to edit element properties.</div>
        <Button label="Cancel" onClick={()=>{setElementProperties(false)}} className="p-button-text" style={{borderRadius:'20px',height:'2.2rem'}} />
        <Button label="Save" onClick={saveElementProperties} autoFocus style={{borderRadius:'20px',height:'2.2rem'}} />
    </div>
)
const onCellEditComplete = (e) => {
 const {key,value}=e.newRowData;
const elementVals=[...elementValues]


elementVals.find(v => v.key === key).value = value;

 
 console.log(elementVals)
};

const getElementCordinates=(e)=>{
    let cordinates=e.target.getBoundingClientRect()
    if(window.innerHeight -cordinates.bottom<280){
        setCardBottom(window.innerHeight -cordinates.bottom-10)
        setMoveCardUp(true)
    }
}
    const onRowReorder=(e)=>{
      setElementValues(e.value)
    } 
const openElementProperties=()=>{
        if(props.object.isCustom){
            setMsg(MSG.SCRAPE.ERR_ELEMENT_TO_BE_MAPPED);
            return
        }
        else if(props.object.objId===undefined){
            setMsg(MSG.SCRAPE.ERR_OBJ_CURR_SAVE)
        }
        else{
        let element=props.object.xpath.split(';')
        let dataValue=[]
        let elementFinalProperties={
            xpath:(element[0]==="null"||element[0]===""||element[0]==="undefined")?'None':element[0],
            id:(element[1]==="null"|| element[1]===""||(element[1]==="undefined"))?'None':element[1],
            rxpath:(element[2]==="null"||element[2]===""||(element[2]==="undefined"))?'None':element[2],
            name:(element[3]==="null"||element[3]===""||(element[3]==="undefined"))?'None':element[3],
            classname:(element[5]==="null"||element[5]===""||(element[5]==="undefined"))?'None':element[5],
            cssselector:(element[12]==="null"||element[12]===""||(element[12]==="undefined"))?'None':element[12],
            href:(element[11]==="null"||element[11]===""||(element[11]==="undefined"))?'None':element[11],
            label:(element[10]==="null"||element[10]===""||(element[10]==="undefined"))?'None':element[10],
        }
        Object.entries(elementFinalProperties).forEach(([key, value], index) => {
            let currindex=props.object.identifier.filter(element=>element.identifier===key)
            dataValue.push({id:currindex[0].id,identifier:key,key,value,name:defaultNames[key]})
        }
)
        dataValue.sort((a,b)=>a.id-b.id)
        setElementValues(dataValue)
        setElementProperties(true)
        }
}


    return (
        <>
        <div className="ss__scrape_obj">
            <img data-test="eyeIcon" className="ss_eye_icon" 
                onClick={onHighlight} 
                src={activeEye ? 
                        "static/imgs/ic-highlight-element-active.png" : 
                        "static/imgs/ic-highlight-element-inactive.png"} 
                alt="eyeIcon"
                onMouseEnter={(appType === 'Web' || appType === "MobileWeb")?(e)=>{showIdentifierCard(e);getElementCordinates(e)}:null}
                onMouseLeave={(appType === 'Web' || appType === "MobileWeb")?()=>{setMoveCardUp(false);setIsIdentifierVisible(false);}:null}
                />
                
            {
                edit ? 
                <ClickAwayListener className="ss_obj_name_e" onClickAway={handleOutsideClick}>
                    <input  data-test="objectInput" className="ss_obj_name_input" value={objName} onChange={handleObjName} onKeyDown={checkKeyPress}/>
                </ClickAwayListener>
                : 
                <div className="ss_obj_label">
                    {!props.hideCheckbox && <input data-test="checkBox" disabled={props.dnd} className="ss_obj_chkbx" type="checkbox" onChange={handleCheckbox} checked={checked}/>}
                    <div 
                        data-test="objectName" 
                        className={
                            "ss_obj_name"
                            + (props.object.duplicate ? " ss__red" : ""
                            + (!props.object.objId ? " ss__newObj" : "" ))
                            + (props.object.isCustom ? " ss__customObject": "")
                            + (props.comparedObject ? " ss__comparedObject": "")
                        }
                        title={objName}
                        onDoubleClick={!props.notEditable ? ()=>setEdit(true) : null}
                    >
                        {objName}
                    </div> 
                </div>
            }
            {((appType === 'Web' || appType === "MobileWeb") && (props.object.xpath.split(';')[0]!=="iris"))?<span title={"View/Edit Element Properties"} style={{cursor:'pointer'}} onClick={openElementProperties} ><i className="pi pi-info-circle" style={{marginLeft:'5px'}}></i></span>:null}

        </div>
        {isIdentifierVisible?(props.object.identifier!==undefined)?
        <div className={moveCardUp?'arrow-bottom':'arrow-top'} style={moveCardUp?{position: 'absolute',bottom:cardBottom, padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}:{position: 'absolute', padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}}><span >Element Identifier Order:</span><br></br>{props.object.identifier.map((item,idx)=><><span>{`${idx+1}. ${defaultNames[item.identifier]}`}</span><br></br></>)}</div>:<div className='arrow-top'style={moveCardUp?{position: 'absolute',bottom:cardBottom, padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}:{position: 'absolute', padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}}><span >Element Identifier Order:</span><br></br>{defaultIdentifier.map((item,idx)=><><span>{`${idx+1}. ${defaultNames[item.identifier]}`}</span><br></br></>)}</div>:null}
        
        <Dialog header={"Element Properties"} editMode="cell" style={{width:'70vw'}} visible={elementProperties}  onHide={() =>setElementProperties(false)}  footer={footerContent}>
        <div className="card">
            <DataTable value={elementValues} reorderableRows onRowReorder={onRowReorder}  >
                <Column rowReorder style={{ width: '3rem' }} />
                <Column field="id" header="Priority" headerStyle={{ justifyContent: "center", width: '10%', minWidth: '4rem',  flexGrow: '0.2'}} bodyStyle={{ textAlign: 'center', flexGrow: '0.2', minWidth: '4rem' }} style={{ minWidth: '3rem' }} />
                {/* <column ></column> */}
                <Column field="name" header="Properties " headerStyle={{ width: '30%', minWidth: '4rem',  flexGrow: '0.2'}} bodyStyle={{ flexGrow: '0.2', minWidth: '4rem' }} style={{ width: '40%', overflowWrap: 'anywhere', justifyContent: 'flex-start' }}></Column>
                <Column field="value" header="Value" editor={(options)=>textEditor(options)} onCellEditComplete={onCellEditComplete}></Column>
            </DataTable>
        </div>
           </Dialog>
        </>
    )
}

export default ScrapeObject;
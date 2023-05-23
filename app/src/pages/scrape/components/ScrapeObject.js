import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import * as actions from '../state/action';
import { ValidationExpression } from '../../global';
import "../styles/ScrapeObject.scss";

const ScrapeObject = props => {

    const dispatch = useDispatch();
    const objValue = useSelector(state=>state.scrape.objValue);
    const appType = useSelector(state=>state.mindmap.appType)

    const [objName, setObjName] = useState(props.object.title);
    const [checked, setChecked] = useState(props.object.checked);
    const [activeEye, setActiveEye] = useState(false);
    const [edit, setEdit] = useState(false);
    const[isIdentifierVisible,setIsIdentifierVisible]=useState(false)
    const defaultIdentifier=[{id:1,identifier:'xpath',name:'Absolute X-Path '},{id:2,identifier:'id',name:'ID Attribute'},{id:3,identifier:'rxpath',name:'Relative X-Path'},{id:4,identifier:'name',name:'Name Attribute'},{id:5,identifier:'classname',name:'Classname Attribute'}]
    

    const handleObjName = event => setObjName(event.target.value);
    const handleCheckbox = event => {
        props.updateChecklist(props.object.val);
        setChecked(event.target.checked);
        dispatch({type: actions.SET_ISENABLEIDENTIFIER, payload:props.scrapeItems.some(((element) => element.checked  === true))})
        
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

    const defaultNames={xpath:'Absolute X-Path',id:'ID Attribute',rxpath:'Relative X path',name:'Name Attribute',classname:'Classname Attribute'}

    return (
        <>
        <div className="ss__scrape_obj">
            <img data-test="eyeIcon" className="ss_eye_icon" 
                onClick={onHighlight} 
                src={activeEye ? 
                        "static/imgs/ic-highlight-element-active.png" : 
                        "static/imgs/ic-highlight-element-inactive.png"} 
                alt="eyeIcon"
                onMouseEnter={(appType === 'Web' || appType === "MobileWeb")?(e)=>showIdentifierCard(e):null}
                onMouseLeave={(appType === 'Web' || appType === "MobileWeb")?()=>setIsIdentifierVisible(false):null}
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
        </div>
        {isIdentifierVisible?(props.object.identifier!==undefined)?
        <div className='arrow-top'style={{position: 'absolute', padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}}><span >Object Identifier Order:</span><br></br>{props.object.identifier.map((item,idx)=><><span>{`${idx+1}. ${defaultNames[item.identifier]}`}</span><br></br></>)}</div>:<div className='arrow-top'style={{position: 'absolute', padding:'10px' , borderRadius:'1rem',border: 'gray',background:'#997cb8',color:'white',fontFamily:'LatoWebLight',fontWeight:'500'}}><span >Object Identifier Order:</span><br></br>{defaultIdentifier.map((item,idx)=><><span>{`${idx+1}. ${defaultNames[item.identifier]}`}</span><br></br></>)}</div>:null}
        </>
    )
}

export default ScrapeObject;
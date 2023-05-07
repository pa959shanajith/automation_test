import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import * as actions from '../state/action';
import { ValidationExpression } from '../../global';
import "../styles/ScrapeObject.scss";

const ScrapeObject = props => {

    const dispatch = useDispatch();
    const objValue = useSelector(state=>state.scrape.objValue);

    const [objName, setObjName] = useState(props.object.title);
    const [checked, setChecked] = useState(props.object.checked);
    const [activeEye, setActiveEye] = useState(false);
    const [edit, setEdit] = useState(false);

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

    return (
        <div className="ss__scrape_obj">
            <img data-test="eyeIcon" className="ss_eye_icon" 
                onClick={onHighlight} 
                src={activeEye ? 
                        "static/imgs/ic-highlight-element-active.png" : 
                        "static/imgs/ic-highlight-element-inactive.png"} 
                alt="eyeIcon"/>
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
    )
}

export default ScrapeObject;
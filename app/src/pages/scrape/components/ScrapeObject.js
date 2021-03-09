import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import * as actions from '../state/action';
import "../styles/ScrapeObject.scss";

const ScrapeObject = props => {

    const dispatch = useDispatch();

    const [objName, setObjName] = useState(props.object.title);
    const [checked, setChecked] = useState(props.object.checked);
    const [edit, setEdit] = useState(false);

    const handleObjName = event => setObjName(event.target.value);
    const handleCheckbox = event => props.updateChecklist(props.object.val);

    useEffect(()=>{
        setObjName(props.object.title);
        setChecked(props.object.checked);
        setEdit(false);
    }, [props]);
    
    const handleOutsideClick = event => {
        setObjName(props.object.title);
        setEdit(false);        
    }

    const checkKeyPress = event => {
        if (event.keyCode === 13) {
            setEdit(false);
            props.modifyScrapeItem(props.object.val, {custname: objName})
        }
    }

    const onHighlight = () => {
        props.setActiveEye(props.object.val);
        let objVal = { val:  props.object.val };
        dispatch({type: actions.SET_OBJVAL, payload: objVal});
    }

    return (
        <div className="ss__scrape_obj">
            <img className="ss_eye_icon" 
                onClick={onHighlight} 
                src={props.activeEye === props.object.val ? 
                        "static/imgs/ic-highlight-element-active.png" : 
                        "static/imgs/ic-highlight-element-inactive.png"} 
                alt="eyeIcon"/>
            {
                edit ? 
                <ClickAwayListener className="ss_obj_name_e" onClickAway={handleOutsideClick}>
                    <input className="ss_obj_name_input" value={objName} onChange={handleObjName} onKeyDown={checkKeyPress}/>
                </ClickAwayListener>
                : 
                <div className="ss_obj_label">
                    {!props.hideCheckbox && <input className="ss_obj_chkbx" type="checkbox" onChange={handleCheckbox} checked={checked} />}
                    <div className={"ss_obj_name" + (props.object.duplicate ? " ss__red" : "" + (!props.object.objId ? " ss__newObj" : "" )) + (props.object.isCustom ? " ss__customObject": "")} onDoubleClick={!props.notEditable ? ()=>setEdit(true) : null}>{objName}</div> 
                </div>
            }
        </div>
    )
}

export default ScrapeObject;
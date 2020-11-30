import React, { useState, useEffect } from 'react'
import ClickAwayListener from 'react-click-away-listener';
import "../styles/ScrapeObject.scss";

const ScrapeObject = props => {

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
            props.renameScrapeItem(props.object.val, objName)
        }
    }

    return (
        <div className="ss__scrape_obj">

            <img className="ss_eye_icon" 
                onClick={()=>props.setActiveEye(props.idx)} 
                src={props.activeEye === props.idx ? 
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
                    <input className="ss_obj_chkbx" type="checkbox" onChange={handleCheckbox} checked={checked} />
                    <div className="ss_obj_name" onDoubleClick={()=>setEdit(true)}>{objName}</div> 
                </div>
            }
        </div>
    )
}

export default ScrapeObject;
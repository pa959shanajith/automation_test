import React , { useState }from 'react'
import ClickAwayListener from 'react-click-away-listener';

const ScrapeObject =(props)=>{

    const [name, setName] = useState(props.item);
    const [edit,setEdit] = useState(false)
    const [showeye,setShowEye] = useState(false)
    const setNameFunc = event => {
        setName(event.target.value);
    }
    
    return (
        <>  <ClickAwayListener onClickAway={(()=>setEdit(false))}>
            <span className="scrptreeitms" key={props.idx}>
                <img onClick={()=>setShowEye(!showeye)} src={showeye ? "static/imgs/ic-highlight-element-active.png" : "static/imgs/ic-highlight-element-inactive.png"} alt=" eyeICon"/>
                <input className="namecheckbox" type="checkbox" />
                {/* {props.idx!==props.elementedit?  */}
                {!edit?
                <span onDoubleClick={()=>setEdit(true)}>{name}</span> 
                // <span onDoubleClick={()=>props.setElementedit(props.idx)}>{name}</span> 
                :<input autoFocus value={ name } 
                onChange={setNameFunc} 
                onKeyPress={(event)=>props.saveName(props.idx, name, event)}/>
                }<br/>
            </span>
            </ClickAwayListener>
        </>
    )
}

export default ScrapeObject;

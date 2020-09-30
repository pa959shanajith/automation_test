import React , { useState }from 'react'

const ScrapeObject =(props)=>{

    const [name, setName] = useState(props.item);

    const setNameFunc = event => {
        setName(event.target.value);
    }

    return (
        <>
        
            <span className="scrptreeitms" key={props.idx}>
                <img onClick={()=>props.setEye(props.idx)} src={props.idx === props.eye ? "static/imgs/ic-highlight-element-active.png" : "static/imgs/ic-highlight-element-inactive.png"} alt=" eyeICon"/>
                <input className="namecheckbox" type="checkbox" />
                {props.idx!==props.elementedit? <span onDoubleClick={()=>props.setElementedit(props.idx)}>{name}</span> :<input autoFocus value={ name } onChange={setNameFunc} onKeyPress={(event)=>props.saveName(props.idx, name, event)}/>}<br/>
            </span>
</>
    )
}

export default ScrapeObject;

import React from 'react';
import '../styles/ModelContent.scss'

const ModalContent =(props)=>{
    return (
        <div>{props.os ===" "?<span id="choseOS">Choose OS</span> : null} <br/><span className="d-flex justify-content-center" id="inputModal"><button id="spectbutton" onClick={()=>props.setOs("android")}>Android</button> <button id="spectbutton" onClick={()=>props.setOs("ios")}>iOS</button></span>
             {(props.os==="android" )?<span className="inputwrap">
                <input className="modalInput" type="text" placeholder="Enter Android Application Path"/><br/><br/>
                <input className="modalInput" type="text" placeholder="Enter Mobile Serial Number." /></span> : null }
              {(props.os==="ios")?<span className="inputwrap" >
                  <input className="modalInput" type="text" placeholder="Enter iOS Application Path"/><br/><br/>
                  <input className="modalInput" type="text" placeholder="Enter Version Number" /><br/><br/>
                  <input className="modalInput" type="text" placeholder="Enter Device Name" /><br/><br/>
                  <input className="modalInput" type="text" placeholder="Enter UDID" /></span> : null}</div>
    )
}

export default ModalContent

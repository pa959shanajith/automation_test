import React ,{useState} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";

const Leftbar=(props)=>{
    const [focus,setFocus] = useState("encryption") //state to manage css on Icon click
    const upperContent=()=>{
        return(
            <div className="letfnav">
                <h4>Utilities</h4>
                <span onClick={()=>{props.setScreenType("encryption") ; setFocus("encryption")}} title="Encryption">
                    <img className="util__execution_ic" src='static/imgs/ic-encryption-utility.png' alt="EncryptIcon" id={(focus==="encryption")? "selected":null}/>
                    <div>Encryption</div>
                </span>
                <span onClick={()=>{props.setScreenType("execution");  setFocus("execution"); }} title="Execution Metrics">
                    <div className="fa fa-database fa-2x util__execution_ic" id={(focus==="execution")? "selected":""}/>
                    <div>Execution Metrics</div>
                </span>
                <span onClick={()=>{props.setScreenType("datatable-Create");  setFocus("datatable"); }} title="Data Table">
                    <div className="fa fa-table fa-2x util__execution_ic" id={(focus==="datatable")? "selected":""}/>
                    <div>Data Table</div>
                </span>
                <span onClick={()=>{props.setScreenType("devOps");  setFocus("devOps"); }} title="DevOps">
                    <img className="util__execution_ic util__devOps" src='static/imgs/devOps.svg' alt="devOps Icon" id={(focus==="devOps")? "selected":""}/>
                    <div>DevOps</div>
                </span>
                <span onClick={()=>{props.setScreenType("api-utils");  setFocus("api-utils"); }} title="Request Body Generator">
                    <img className="util__execution_ic" src={"static/imgs/RequestBodyGenerator.svg"} id={(focus==="api-utils")? "selected":""}/>
                    <div>Request Body<br/>Generator</div>
                </span>
            </div>
        )
    }
    const bottomContent=()=>{
        return null;
    }
    return (
            <ActionBar 
            upperContent={upperContent()} 
            bottomContent={bottomContent()}
            />
    )
}

export default Leftbar

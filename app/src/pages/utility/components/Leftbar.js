import React ,{useState} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";

const Leftbar=(props)=>{
    const [focus,setFocus] = useState("encryption") //state to manage css on Icon click
    const upperContent=()=>{
        return(
            <div className="letfnav">
                <h4>Utilities</h4>
                <span onClick={()=>{props.setScreenType("encryption") ; setFocus("encryption")}}>
                    <img src='static/imgs/ic-encryption-utility.png' alt="EncryptIcon" id={(focus==="encryption")? "selected":null}/>
                    <div>Encryption</div>
                </span>
                <span onClick={()=>{props.setScreenType("optimization");  setFocus("optimization") ; props.setPairwiseClicked(false)}}>
                    <img src='static/imgs/ic-optimization.png' alt="optimizationIcon" id={(focus==="optimization")? "selected":null}/>
                    <div>Optimization</div>
                </span>
                <span onClick={()=>{props.setScreenType("execution");  setFocus("execution"); }}>
                    <div className="fa fa-database fa-2x util__execution_ic" id={(focus==="execution")? "selected":""}/>
                    <div>Execution Metrics</div>
                </span>
                <span onClick={()=>{props.setScreenType("datatable-Create");  setFocus("datatable"); }}>
                    <div className="fa fa-database fa-2x util__execution_ic" id={(focus==="datatable")? "selected":""}/>
                    <div>Data Table</div>
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

import React ,{useState} from 'react';
// import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";

const Leftbar=(props)=>{
    const [focus,setFocus] = useState("encryption") //state to manage css on Icon click
    const [disable, setDisable] = useState(false);
  
        return(
            <div className='flex flex-column pl-2 pr-1 m-1 sidepanel_admin'>
            <div className="letfnav">
                <h4 className='util_header'>Utilities</h4>
                <span onClick={()=>{props.setScreenType("encryption") ; setFocus("encryption")}} title="Encryption" className={focus==="encryption" ? "active_tab" : "not_active_tab"}>
                    <div className="util__execution_ic" id={(focus==="encryption")? "selected":null}/>
                    <div className='util_header'>Encryption</div>
                </span>
                {/* disable && <span onClick={()=>{props.setScreenType("execution");  setFocus("execution"); }} title="Execution Metrics">
                    <div className="fa fa-database fa-2x util__execution_ic" id={(focus==="execution")? "selected":""}/>
                    <div>Execution Metrics</div>
                </span> */}
                <span onClick={()=>{props.setScreenType("datatable-Create");  setFocus("datatable"); }} title="Data Table"  className={focus==="datatable" ? "active_tab" : "not_active_tab"}>
                    <div className="fa fa-table fa-2x util__execution_ic" id={(focus==="datatable")? "selected":""}/>
                    <div className='util_header'>Data Table</div>
                </span>
                </div>
                </div>

        )
    

}

export default Leftbar;
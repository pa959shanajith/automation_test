import React ,{useState} from 'react';
// import { ActionBar } from '../../global';
import  "../styles/LeftBar.scss";

const Leftbar=(props)=>{
    const [focus,setFocus] = useState("encryption") //state to manage css on Icon click
    const [disable, setDisable] = useState(false);
  
        return(
            <div className='flex flex-column pl-2 pr-1 m-1 left_side_panel'>
                <span className='util_header'>Utilities</span>
                <div className='Utility_Label'>
                <span onClick={()=>{props.setScreenType("encryption") ; setFocus("encryption")}} title="Encryption" className={focus==="encryption" ? "active_tab_encryption" : "not_active_tab_encryption"}>
                    <img className="util__execution_ic" src='static/imgs/encryption_icon.svg' alt="EncryptIcon" id={(focus==="encryption")? "selected":null}/>
                    <div className='util_header_Encryption'>Encryption</div>
                </span>
                <span onClick={()=>{props.setScreenType("datatable-Create");  setFocus("datatable"); }} title="Data Table"  className={focus==="datatable" ? "active_tab_data" : "not_active_tab_data"}>
                    <img className="util__execution_ic" src='static/imgs/Datatable_icon.svg' alt="EncryptIcon" id={(focus==="datatable")? "selected":""}/>
                    <div className='util_header_Encryption'>Data Table</div>
                </span>
                </div>
                </div>

        )
    

}

export default Leftbar;
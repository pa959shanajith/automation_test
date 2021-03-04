import React ,{ Fragment } from 'react';

const Encrypt=(props)=>{
return(
    <Fragment>
        <div className="page-taskName" >
            <span className="taskname">
                Encryption
            </span>
        </div>
        <div>
            <select data-test="utility_screen_selection_sel" 
                value={props.encyptMethod ? props.encyptMethod : 'SelectMethod'} 
                onChange={(e)=>props.onDropChange(e)} 
                id = "dropdown"
            >
                <option className="options" selected disabled  value="SelectMethod">Select Method</option>
                <option className="options" value="AES">AES</option>
                <option className="options" value="MD5">MD5</option>
                <option className="options" value="Base64">Base64</option>
            </select>
        </div>
        
        <div className="ult_content_conatiner">
            <div className={ props.emptyCall? "encryptionData-body emptycall" :"encryptionData-body"}>
                <textarea data-test="utility_encryption_data_inp" value={props.encyptValue ? props.encyptValue : ''} id= "encryptData" placeholder="Enter Data For Encryption" onChange={(e)=>props.ontextchange(e)}/>
            </div>

        {props.encyptBtn && 
        <div id="encryption_btns">
            <button className="btn-utl" data-test="encryption_options_btn" onClick={()=>props.callEncrypt(props.encryptionType ,props.encryptionValue)}>
                {props.btnName}
            </button>
            <button data-test="encryption_reset_btn" onClick={()=>props.callReset()} className="btn-reset">Reset</button>
        </div>}
        <div data-test="utility_encrypted_data_div" className="encryptionData-body">
            <textarea data-test="utility_encrypted_data_inp" id="encryptedData" readOnly placeholder="Encrypted Data" value={props.encryptedData}/>
        </div>
        </div>
        
    </Fragment>)
}

export default Encrypt
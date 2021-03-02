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
            <select value={props.encyptMethod ? props.encyptMethod : ''} onChange={(e)=>props.onDropChange(e)} id = "dropdown">
                <option className="options" value="SelectMethod">Select Method</option>
                <option className="options" value="AES">AES</option>
                <option className="options" value="MD5">MD5</option>
                <option className="options" value="Base64">Base64</option>
            </select>
        </div>
        
        <div >
            <div className={ props.emptyCall? "encryptionData-body emptycall" :"encryptionData-body"}>
                <textarea value={props.encyptValue ? props.encyptValue : ''} id= "encryptData" placeholder="Enter Data For Encryption" onChange={(e)=>props.ontextchange(e)}/>
            </div>

        {props.encyptBtn && 
        <div id="encryption_btns">
            <button className="btn-utl" onClick={()=>props.callEncrypt(props.encryptionType ,props.encryptionValue)}>
                {props.btnName}
            </button>
            <button onClick={()=>props.callReset()} className="btn-reset">Reset</button>
        </div>}
        <div className="encryptionData-body">
            <textarea id="encryptedData" readOnly placeholder="Encrypted Data" value={props.encryptedData}/>
        </div>
        </div>
        
    </Fragment>)
}

export default Encrypt
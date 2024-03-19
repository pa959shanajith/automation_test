import React, { Fragment } from 'react';
import { Dropdown } from 'primereact/dropdown';
import "../styles/LeftBar.scss";
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';


const Encrypt = (props) => {
    const options = [
        { label: 'AES', value: 'AES' },
        { label: 'MD5', value: 'MD5' },
        { label: 'Base64', value: 'Base64' },
    ];

    return (
        <Fragment>
            <div className="page-taskName-utility card shadow-2" >
                <span className="page-taskName-encryption">
                <img src="static/imgs/encryption_icon.svg" className='current_img_icon' alt="SVG Image" />
                    Encryption
                <img src="static/imgs/info-circle.svg" className='relative left-1' alt="SVG Image" />
                </span>
            </div>
            <div className='method_dropdown flex flex-column'>
            <label data-test="Encryption Method" className='Encryption_Method' style={{ paddingLeft: '1.7rem' }}>Encryption Method</label>
                <Dropdown
                    className='encrypt_drodown'
                    id="dropdown"
                    data-test="utility_screen_selection_sel"
                    value={props.encyptMethod ? props.encyptMethod : 'SelectMethod'}
                    options={options}
                    onChange={(e) => props.onDropChange(e)}
                    placeholder="Select Method"
                />
            </div>

            <div className="ult_content_conatiner">
                <div data-test="utility_encryption_data_div" className={props.emptyCall ? "encryptionData-body emptycall" : "encryptionData-body"}>
                    <textarea data-test="utility_encryption_data_inp" value={props.encyptValue ? props.encyptValue : ''} id= "encryptData" placeholder="Enter Data For Encryption" onChange={(e)=>props.ontextchange(e)}/>
                </div>

                {props.encyptBtn &&
                    <div id="encryption_btns">
                        <Button className="btn-utl" data-test="encryption_options_btn" title={props.btnName} label={props.btnName} onClick={() => props.callEncrypt(props.encryptionType, props.encryptionValue)}>

                        </Button>
                        <Button data-test="encryption_reset_btn" title="Reset" label="Reset" onClick={() => props.callReset()} className="btn-reset"></Button>
                    </div>}
                <div data-test="utility_encrypted_data_div" className="encryptionData-body">
                    <textarea data-test="utility_encrypted_data_inp" id="encryptedData" readOnly={true} placeholder="Encrypted Data" value={props.encryptedData} />
                </div>
               
            </div>
            <div>
              <label className='notelabel'>Note:</label>
                <p className='notecontent'> Avo Assure uses <strong> AES </strong>  encryption for all secure text keywords and <strong> MD5 </strong>encryption for API digital signatures</p>
            </div>

        </Fragment>)
}

export default Encrypt
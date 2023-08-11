
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModalContainer, Messages as MSG, setMsg } from '../../global';
import "../styles/CertificateModal.scss";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Cert } from '../designSlice';


const CertificateModal = props => {

    const dispatch = useDispatch();
    const certificateInfo = useSelector(state=>state.design.cert);
    const [certPath, setCertPath] = useState("");
    const [certPass, setCertPass] = useState("");
    const [authName, setAuthName] = useState("");
    const [authPass, setAuthPass] = useState("");
    const [error, setError] = useState(false);
    // const [visible, setVisible] = useState(true);
    useEffect(() => {
    }, [])
    useEffect(()=>{
        let { certsDetails, authDetails } = certificateInfo;
        let [newCertPath, newCertPass] = certsDetails ? certsDetails.split(";;") : "";
        let [newAuthName, newAuthPass] = authDetails ? authDetails.split(";") : "";

        setCertPath(newCertPath || "");
        setCertPass(newCertPass || "");
        setAuthName(newAuthName || "");
        setAuthPass(newAuthPass || "");
    }, [certificateInfo])

    const certPathHandler = event => { 
        setCertPath(event.target.value); 
        if (error) setError(false); 
    };
    const certPassHandler = event => setCertPass(event.target.value);
    const authNameHandler = event => setAuthName(event.target.value);
    const authPassHandler = event => setAuthPass(event.target.value);

    const resetFields = () => {
        setCertPath("");
        setCertPass("");
        setAuthName("");
        setAuthPass("");
        setError(false);
    }

    const submitCert = () => {
        if (!certPath) setError(true);
        else {
            let certObj ={
                certsDetails: `${certPath};;${certPass}`,
                authDetails: `${authName};${authPass}`
            }
            dispatch(Cert(certObj));
            setMsg(MSG.SCRAPE.SUCC_CERT_SAVE);
           props.setVisible(false);
        }
    }
    const footerContent = (
        <div>
            <Button label="Reset" icon="pi pi-times" onClick={resetFields} className="p-button-text" />
            <Button label="Submit" icon="pi pi-check" onClick={submitCert} autoFocus />
        </div>
    );


    return (
        <div className="ws__cert_container">
        <Dialog  header="Header" visible={props.visible} style={{ width: '50vw',zIndex:'1',height:'50vh' }} onHide={() => props.setVisible(false)} footer={footerContent}>
            {/* header="Add Certificate" */}
                <InputText data-test="certPath" className={"cert_input"+( error ? " cert_error" : "")} onChange={certPathHandler} value={certPath} placeholder="Enter Certificate Path;Enter Certificate Key(optional)"/>
                <InputText data-test="certPass" className="cert_input" onChange={certPassHandler} value={certPass} placeholder="Enter Certificate Password(AES Encrypted);Enter server Certificate Path(Optional)"/>
                <InputText data-test="authUserName" className="cert_input" onChange={authNameHandler} value={authName} placeholder="Enter AuthUserName"/>
                <InputText data-test="authPass" className="cert_input" onChange={authPassHandler} value={authPass} placeholder="Enter AuthUserPassword(AES Encrypted)"/>
            </Dialog>
        </div>
    );
}
export default CertificateModal;
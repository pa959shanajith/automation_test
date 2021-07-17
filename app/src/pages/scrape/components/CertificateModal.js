import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModalContainer, Messages as MSG } from '../../global';
import { SET_CERT } from '../state/action';
import "../styles/CertificateModal.scss";
import PropTypes from 'prop-types';

const CertificateModal = props => {

    const dispatch = useDispatch();
    const certificateInfo = useSelector(state=>state.scrape.cert);
    const [certPath, setCertPath] = useState("");
    const [certPass, setCertPass] = useState("");
    const [authName, setAuthName] = useState("");
    const [authPass, setAuthPass] = useState("");
    const [error, setError] = useState(false);

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
            dispatch({type: SET_CERT, payload: certObj});
            props.setShowPop(MSG.SCRAPE.SUCC_CERT_SAVE);
            props.setShow(false);
        }
    }

    return (
        <div className="ws__cert_container">
        <ModalContainer 
            title="Add Certificate"
            content={<>
                <input data-test="certPath" className={"cert_input"+( error ? " cert_error" : "")} onChange={certPathHandler} value={certPath} placeholder="Enter Certificate Path;Enter Certificate Key(optional)"/>
                <input data-test="certPass" className="cert_input" onChange={certPassHandler} value={certPass} placeholder="Enter Certificate Password(AES Encrypted);Enter server Certificate Path(Optional)"/>
                <input data-test="authUserName" className="cert_input" onChange={authNameHandler} value={authName} placeholder="Enter AuthUserName"/>
                <input data-test="authPass" className="cert_input" onChange={authPassHandler} value={authPass} placeholder="Enter AuthUserPassword(AES Encrypted)"/>
            </>}
            footer={<>
                <button data-test="reset" onClick={resetFields}>Reset</button>
                <button data-test="submit" onClick={submitCert}>Submit</button>
            </>}
            close={()=>props.setShow(false)}
        />
        </div>
    );
}
CertificateModal.propTypes={
    setShowPop:PropTypes.func,
    setShow:PropTypes.func
}
export default CertificateModal;
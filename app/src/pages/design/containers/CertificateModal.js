
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
    const certificateInfo = useSelector(state => state.design.cert);
    const [certPath, setCertPath] = useState("");
    const [certPass, setCertPass] = useState("");
    const [authName, setAuthName] = useState("");
    const [authPass, setAuthPass] = useState("");
    const [error, setError] = useState(false);
    // const [visible, setVisible] = useState(true);
    useEffect(() => {
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
            let certObj = {
                certsDetails: `${certPath};;${certPass}`,
                authDetails: `${authName};${authPass}`
            }
            dispatch(Cert(certObj));
            setMsg(MSG.SCRAPE.SUCC_CERT_SAVE);
            props.setVisible(false);
        }
    }


    return (
        <div className="flex flex-column w-full">
            <div className='certificate_wrapper'>
                <div className='flex flex-row p-2 justify-content-between	'>
                    <label htmlFor='path_input'>Path</label>
                    <InputText
                        data-test="certPath"
                        id="path_input"
                        className={`p-inputtext-sm w-full md:w-30rem ${error ? 'p-invalid' : ''}`}
                        onChange={certPathHandler}
                        value={certPath}
                        placeholder="Enter certificate path; Enter certification key(optional)"
                    />
                </div>

                <div className='flex flex-row p-2 justify-content-between	'>
                    <label htmlFor='password_input'>Password</label>
                    <InputText
                        id="password_input"
                        data-test="certPass"
                        className="p-inputtext-sm w-full md:w-30rem "
                        onChange={certPassHandler}
                        value={certPass}
                        placeholder="Enter certificate password(AES Encrypted): Enter server certificate path"
                    />
                </div>

                <div className='flex flex-row p-2 justify-content-between	'>
                    <label htmlFor='authusername_input'>Auth Username</label>
                    <InputText
                        id="authusername_input"
                        data-test="authUserName"
                        className="p-inputtext-sm w-full md:w-30rem "
                        onChange={authNameHandler}
                        placeholder="Enter auth username"
                        value={authName}
                    />
                </div>

                <div className='flex flex-row p-2 justify-content-between	'>
                    <label htmlFor='authpassword_input'>AuthPassword</label>
                    <InputText
                        data-test="authPass"
                        className="p-inputtext-sm w-full md:w-30rem "
                        onChange={authPassHandler}
                        value={authPass}
                        placeholder="Enter auth password(AES Encrypted)"
                    />
                </div>

            </div>


            <div className='flex flex-row' style={{ justifyContent: 'left', gap: '1rem', paddingLeft:'1rem'}}>
                <Button label="Reset" size='small' onClick={resetFields} className="p-button-text" outlined />
                <Button label="Submit" size='small' onClick={submitCert}  />
            </div>

        </div>
    );
}
export default CertificateModal;
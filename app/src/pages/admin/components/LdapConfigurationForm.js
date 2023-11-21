import React, { Fragment, useState } from 'react';
import '../styles/LdapConfigurationForm.scss'
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { FileUpload } from 'primereact/fileupload';


/*Component LdapConfigurationForm
  use: defines Admin middle Section for create/edit Ldap Configuration Form
  ToDo:
*/

const LdapConfigurationForm = (props) => {

    const [certificateUpdate, setCertificateUpdate] = useState(false)

    const switchSecureUrl = (secureOpt) => {
        let url1 = props.url.trim();
        if (secureOpt === "false") {
            props.setCert("");
            props.setCertName("No file choosen");
            if (url1.toLowerCase().startsWith("ldaps://")) url1 = ("ldap://" + url1.slice(8));
            if (url1.toLowerCase().endsWith(":636")) url1 = (url1.slice(0, -3) + "389");
            props.setUrl(url1);
        } else {
            if (url1.toLowerCase().startsWith("ldap://")) url1 = ("ldaps://" + url1.slice(7));
            if (url1.toLowerCase().endsWith(":389")) url1 = (url1.slice(0, -3) + "636");
            props.setUrl(url1);
        }
    }

    const switchAuthType = (authLdap) => {
        if (authLdap === "anonymous") {
            props.setBinddn("");
            props.setBindCredentials("");
        }
    }

    const updateCert = (targetFile) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(targetFile);
        })
    }

    const certInputClick = async (event) => {
        // eslint-disable-next-line
        const target = event && (event.srcElement || event.target) || null;
        // eslint-disable-next-line
        const targetFile = target && target.files[0] || null;
        if (targetFile === null) return;
        // var conf = (target.name.includes('ldap'))? $scope.ldapConf:$scope.samlConf;
        props.setCertName(targetFile.name);
        var certData = await updateCert(targetFile);
        props.setCert(certData);
        setCertificateUpdate(!certificateUpdate);
    }

    return (
        <Fragment>
            <div className='adminControl-ldap'>
                <div className='flex flex-column'>
                    <span className="leftControl" title="Directory Provider URL (Eg: ldap://example.com:389)">Server URL</span>
                    <InputText
                        autoComplete="off"
                        id="ldapServerURL"
                        name="ldapServerURL"
                        value={props.url}
                        onChange={(event) => { props.setUrl(event.target.value) }}
                        className= {`"p-inputtext-sm " ${props.ldapServerURLErrBor ? "p-invalid" : "" } `}
                        placeholder="Directory Provider URL (Eg: ldap://example.com:389)" />
                </div>
            </div>
            <div className='adminControl-ldap'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" >Base Domain Name</span>
                    <InputText 
                        autoComplete="off" 
                        id="ldapBaseDN"
                        name="ldapBaseDN" 
                        onChange={(event) => { props.setBasedn(event.target.value) }} value={props.basedn}
                        className= {`"p-inputtext-sm " ${props.ldapBaseDNErrBor ? "p-invalid" : "" } `}
                        placeholder="Base Domain Name (Eg: DC=EXAMPLE,DC=COM)" />
                </div>
            </div>
            <div className='adminControl-ldap admin-ldap__secure'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" title="Secure Connection (ldaps protocol)">Secure Connection</span>
                    <div className='flex flex-row'>
                        <label className="adminFormRadio" title="Disable Secure LDAP (No ldaps)">
                            <RadioButton checked={props.secure === "false"} value="false" name="ldapSecure" onChange={() => { props.setSecure("false"); switchSecureUrl("false") }} />
                            <span className="ml-2 mr-6">Disable</span>
                        </label>
                        <label className="adminFormRadio" title="Enable Secure LDAP (ldaps)">
                            <RadioButton checked={props.secure === "secure"} value="secure" name="ldapSecure" onChange={() => { props.setSecure("secure"); switchSecureUrl("secure") }} />
                            <span className="ml-2 mr-6">Enable</span>
                        </label>
                        <label className="adminFormRadio" title="Enable Secure LDAP (ldaps) but ignore TLS errors">
                            <RadioButton checked={props.secure === "insecure"} value="insecure" name="ldapSecure" onChange={() => { props.setSecure("insecure"); switchSecureUrl("insecure") }} />
                            <span className="ml-2 mr-6">Enable Insecure</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className='adminControl-ldap'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" >TLS Certificate</span>
                    {/* {props.secure !== "false" ? <label id="ldapCert" className="ldapCert__lable" for="certInput"><span className="fa fa-upload ldapcert-upload"></span>{props.certName}</label> : null}
                    {props.secure === "false" ? <label id="ldapCert" className="ldapCert__lable-false"><span className="ldapcert-span" >Secure Option needs to be enabled</span></label> : null} */}
                    <FileUpload 
                        autoComplete="off"
                        name="demo[]" url={'/api/upload'} y
                        multiple accept=".cer,.crt,.cert,.pem"
                        maxFileSize={1000000}
                        emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} 
                        disabled={props.secure === 'false'}
                    />

                    {/* <InputText onChange={(event) => { certInputClick(event) }} 
                    type="file" accept=".cer,.crt,.cert,.pem" 
                    autoComplete="off" id="certInput" name="ldapCert" 
                    className={"no-disp certInput-ldap" + (props.ldapCertErrBor ? " InputTextErrorBorder" : "")} 
                    disabled={props.secure === 'false'} /> */}
                    {props.ldapEdit ? <textarea autoComplete="off" id="ldapCertValue" name="ldapCertValue" disabled="" readOnly="readOnly" className="certTextarea-ldap certTextarea-edit" value={props.cert} /> : null}
                </div>
            </div>
            <div className='adminControl-ldap admin-ldap__secure'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" title="Secure Connection">Authentication</span>
                    <div className='flex flex-row'>
                        <label className="adminFormRadio">
                            <RadioButton checked={props.auth === "anonymous"} value="anonymous" name="ldapAuth" onChange={() => { props.setAuth("anonymous"); switchAuthType("anonymous") }} />
                            <span className="ml-2 mr-6">Anonymous</span>
                        </label>
                        <label className="adminFormRadio">
                            <RadioButton checked={props.auth === "simple"} value="simple" name="ldapAuth" onChange={() => { props.setAuth("simple") }} />
                            <span className="ml-2 mr-6">Simple</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className='adminControl-ldap'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" >Bind Principal</span>
                    <InputText className="p-inputtext-sm" autoComplete="off" name="binddn" id="binddn" disabled={props.auth !== 'simple'}
                        value={props.binddn} onChange={(event) => { props.setBinddn(event.target.value) }}
                        // className={"form-control-ldap form-control-custom-ldap InputText_border-ldap" + (props.binddnErrBor ? " InputTextErrorBorder" : "")} 
                        placeholder="Authentication Principal" />
                </div>
            </div>
            <div className='adminControl-ldap ldap-credentials'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap" >Bind Credentials</span>
                    <InputText  className="p-inputtext-sm" type="password" autoComplete="off" name="bindCredentials" id="bindCredentials"
                        disabled={props.auth !== 'simple'} value={props.bindCredentials} onChange={(event) => { props.setBindCredentials(event.target.value) }}
                        // className={"form-control-ldap form-control-custom-ldap InputText_border-ldap" + (props.bindCredentialsErrBor ? " InputTextErrorBorder" : "")} 
                        placeholder="Authentication Credentials" />
                </div>
            </div>
        </Fragment>
    );
}

export default LdapConfigurationForm;
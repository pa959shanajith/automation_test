import React from 'react';
import { ScrollBar, ValidationExpression } from '../../global'
import '../styles/LdapConfigCreate.scss'
import LdapConfigurationForm from '../components/LdapConfigurationForm';
import { InputText } from 'primereact/inputtext';
import LdapDataMapping from '../components/LdapDataMapping';
import { Button } from 'primereact/button';

/*Component LdapConfigCreate
  use: defines Admin middle Section for create Ldap Configuration
  ToDo:
*/

const LdapConfigCreate = (props) => {

    const updateLdapServerName = (value) => {
        value = ValidationExpression(value, "ldapServerName")
        props.setServerName(value)
    }

    return (
        <div className="ldap_container-create">

            <div className="ldap-content_wrapper-create">

                <div className="adminForm-ldap-container flex flex-column">
                    {/* <h4 className='title-ldap' >LDAP Server Details</h4> */}
                    <div className='adminControl-ldap'>
                        <div className='flex flex-column'>
                            <span htmlFor='ldapServerName' >Server Name</span>
                            <InputText
                                id="ldapServerName"
                                name="ldapServerName"
                                value={props.serverName}
                                onChange={(event) => { updateLdapServerName(event.target.value) }}
                                maxLength="100"
                                className={`"p-inputtext-sm " ${props.ldapServerNameErrBor ? "p-invalid" : ""} `}
                                placeholder="Enter Server Name"
                            ></InputText>
                            {/* <span className="leftControl-ldap" title="Server Name">Server Name</span> */}
                            {/* <InputText autoComplete="off" id="ldapServerName" name="ldapServerName"
                            value={props.serverName} onChange={(event) => { updateLdapServerName(event.target.value) }}
                            maxLength="100"
                            className={"form-control-ldap form-control-custom-ldap input_border-ldap" + (props.ldapServerNameErrBor ? " inputErrorBorder" : "")}
                            laceholder="Server Name" ></InputText> */}
                        </div>
                    </div>

                    <LdapConfigurationForm {...props} />
                    <LdapDataMapping resetField={props.manageCreate} setFieldmap={props.setFieldmap} fieldmap={props.fieldmap} fieldMapOpts={props.fieldMapOpts} ldapFMapEmailErrBor={props.ldapFMapEmailErrBor} ldapFMapLnameErrBor={props.ldapFMapLnameErrBor} ldapFMapFnameErrBor={props.ldapFMapFnameErrBor} ldapFMapUnameErrBor={props.ldapFMapUnameErrBor} />

                </div>
                <div className="adminActionBtn">
                    <Button className="a__btn btn-margin-ldap" onClick={() => { props.setLdapEdit(true) }} title="Edit Configuration">Edit</Button>
                    <Button className="a__btn ldap-disabled-btn btn-margin-ldap" onClick={() => { props.ldapManage('create') }} disabled={props.testStatus !== 'success'} title="Create Configuration">Create</Button>
                    <Button className="a__btn btn-margin-ldap " onClick={() => { props.ldapTest() }} title="Test Configuration">Test</Button>
                </div>
            </div>
        </div>
    );
}

export default LdapConfigCreate;
import React from 'react';
import {ScrollBar} from '../../global'
import '../styles/LdapConfigCreate.scss'
import LdapConfigurationForm from '../components/LdapConfigurationForm';
import LdapDataMapping from '../components/LdapDataMapping';
import ValidationExpression from '../../global/components/ValidationExpression';

/*Component LdapConfigCreate
  use: defines Admin middle Section for create Ldap Configuration
  ToDo:
*/

const LdapConfigCreate = (props) => {

    const updateLdapServerName = (value) => {
        value = ValidationExpression(value,"ldapServerName")
        props.setServerName(value)
    }

    return (
        <div className="ldap_container-create">
            <div id="page-taskName"><span>Create LDAP Configuration</span></div>
            <div className="adminActionBtn-oidc">
                <button className="btn-md-ldap adminBtn-ldap btn-margin-ldap" onClick={()=>{props.ldapTest()}} title="Test Configuration">Test</button> 
                <button className="btn-md-ldap adminBtn-ldap ldap-disabled-btn btn-margin-ldap" onClick={()=>{props.ldapManage('create')}} disabled={props.testStatus !== 'success'} title="Create Configuration">Create</button>            
                <button className="btn-md-ldap adminBtn-ldap" onClick={()=>{props.setLdapEdit(true)}}  title="Edit Configuration">Edit</button>
            </div> 
            <div className="ldap-content_wrapper-create">
                <ScrollBar thumbColor="#929397">
                    <div className="col-xs-9 form-group-ldap adminForm-ldap">
                        <h4 className='title-ldap' >LDAP Server Details</h4>
                        <div className='adminControl-ldap'><div>
                            <span className="leftControl-ldap" title="Server Name">Server Name</span>
                            <input type="text" autoComplete="off" id="ldapServerName" name="ldapServerName" value={props.serverName} onChange={(event)=>{updateLdapServerName(event.target.value)}} maxLength="50" className={"form-control-ldap form-control-custom-ldap input_border-ldap"+ (props.ldapServerNameErrBor ? " inputErrorBorder" : "")}  placeholder="Server Name"/>
                        </div></div>
                    
                        <LdapConfigurationForm {...props}  />
                        <LdapDataMapping setFieldmap={props.setFieldmap} fieldmap={props.fieldmap} fieldMapOpts={props.fieldMapOpts} ldapFMapEmailErrBor={props.ldapFMapEmailErrBor} ldapFMapLnameErrBor={props.ldapFMapLnameErrBor} ldapFMapFnameErrBor={props.ldapFMapFnameErrBor} ldapFMapUnameErrBor={props.ldapFMapUnameErrBor} />
                    </div>
                </ScrollBar>
            </div>
        </div>
    );
}

export default LdapConfigCreate;
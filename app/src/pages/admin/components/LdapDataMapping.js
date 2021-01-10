import React, { Fragment } from 'react';
import '../styles/LdapDataMapping.scss'

/*Component LdapDataMapping
  use: defines Admin middle Section for create Ldap Data Mapping
  ToDo:
*/

const LdapDataMapping = (props) => {

    return (
        <Fragment>
            <h4 className='title-ldap'>Data Mapping Settings</h4>
            <h5 className='title-ldap-dm'>{props.ldapEdit?"All ":""}Mapping options are populated on click of <i>Test</i> with connection successful.</h5>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Username</span>
                <select value={props.fieldmap.uname} onChange={(event)=>{props.setFieldmap({uname: event.target.value, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: props.fieldmap.email})}} id="ldapFMapUname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapUnameErrBor ? " selectErrorBorder" : "")}   >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.uname)==-1 ?<option value={props.fieldmap.uname} selected >{props.fieldmap.uname}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option key={index} value={field} selected={field===props.fieldmap.uname}>{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Firstname</span>
                <select value={props.fieldmap.fname} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: event.target.value, lname: props.fieldmap.lname, email: props.fieldmap.email})}} id="ldapFMapFname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapFnameErrBor ? " selectErrorBorder" : "")}   >
                {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.fname)==-1 ?<option value={props.fieldmap.fname} selected >{props.fieldmap.fname}</option>:null}
                {props.fieldMapOpts.map((field,index)=>(
                        <option key={index} value={field} selected={field===props.fieldmap.fname}>{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Lastname</span>
                <select value={props.fieldmap.lname} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: event.target.value, email: props.fieldmap.email})}}  id="ldapFMapLname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapLnameErrBor ? " selectErrorBorder" : "")}    >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.lname)==-1 ?<option value={props.fieldmap.lname} selected >{props.fieldmap.lname}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option key={index} value={field} selected={field===props.fieldmap.lname}>{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Email</span>
                <select value={props.fieldmap.email} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: event.target.value})}}  id="ldapFMapEmail" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapEmailErrBor ? " selectErrorBorder" : "")}   >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.email)==-1 ?<option value={props.fieldmap.email} selected >{props.fieldmap.email}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option key={index} value={field} selected={field===props.fieldmap.email}>{field}</option>
                    ))}
                </select>
            </div></div>
            
        </Fragment>
    );
}

export default LdapDataMapping;
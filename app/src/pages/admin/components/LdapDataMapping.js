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
                <select defaultValue={props.fieldmap.uname} onChange={(event)=>{props.setFieldmap({uname: event.target.value, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: props.fieldmap.email})}} id="ldapFMapUname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapUnameErrBor ? " selectErrorBorder" : "")}   >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.uname)===-1 ?<option disabled={props.fieldmap.uname==="None"?true:false} value={props.fieldmap.uname} >{props.fieldmap.uname}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option disabled={field==="None"?true:false} key={index} value={field} >{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Firstname</span>
                <select defaultValue={props.fieldmap.fname} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: event.target.value, lname: props.fieldmap.lname, email: props.fieldmap.email})}} id="ldapFMapFname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapFnameErrBor ? " selectErrorBorder" : "")}   >
                {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.fname)===-1 ?<option disabled={props.fieldmap.fname==="None"?true:false} value={props.fieldmap.fname} >{props.fieldmap.fname}</option>:null}
                {props.fieldMapOpts.map((field,index)=>(
                        <option disabled={field==="None"?true:false} key={index} value={field}>{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Lastname</span>
                <select defaultValue={props.fieldmap.lname} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: event.target.value, email: props.fieldmap.email})}}  id="ldapFMapLname" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapLnameErrBor ? " selectErrorBorder" : "")}    >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.lname)===-1 ?<option disabled={props.fieldmap.lname==="None"?true:false} value={props.fieldmap.lname} >{props.fieldmap.lname}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option disabled={field==="None"?true:false} key={index} value={field} >{field}</option>
                    ))}
                </select>
            </div></div>
            <div className='adminControl-ldap-dm'><div>
                <span className="leftControl-ldap-dm">Email</span>
                <select defaultValue={props.fieldmap.email} onChange={(event)=>{props.setFieldmap({uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: event.target.value})}}  id="ldapFMapEmail" className={'adminSelect-ldap-dm form-control-ldap-dm'+ (props.ldapFMapEmailErrBor ? " selectErrorBorder" : "")}   >
                    {props.ldapEdit && props.fieldMapOpts.indexOf(props.fieldmap.email)===-1 ?<option disabled={props.fieldmap.email==="None"?true:false} value={props.fieldmap.email} >{props.fieldmap.email}</option>:null}
                    {props.fieldMapOpts.map((field,index)=>(
                        <option disabled={field==="None"?true:false} key={index} value={field} >{field}</option>
                    ))}
                </select>
            </div></div>
            
        </Fragment>
    );
}

export default LdapDataMapping;
import React, { Fragment, useRef } from 'react';
import { FormInpDropDownLdap } from '../components/FormComp'
import '../styles/LdapDataMapping.scss'

/*Component LdapDataMapping
  use: defines Admin middle Section for create Ldap Data Mapping
  ToDo:
*/

const LdapDataMapping = (props) => {

    const userRef = useRef();
    const firstRef = useRef();
    const lastRef = useRef();
    const emailRef = useRef();

    return (
        <Fragment>
            <h4 className='title-ldap'>Data Mapping Settings</h4>
            <h5 className='title-ldap-dm'>{props.ldapEdit ? "All " : ""}Mapping options are populated on click of <i>Test</i> with connection successful.</h5>
            <div className='adminControl-ldap-dm'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap-dm">Username</span>
                    <FormInpDropDownLdap
                        resetVal={props.resetField}
                        defVal={props.fieldmap.uname}
                        inpRef={userRef}
                        data={props.fieldMapOpts}
                        errBorder={props.ldapFMapUnameErrBor}
                        ldapEdit={props.ldapEdit}
                        setFilter={(event) => { props.setFieldmap({ uname: event.target.value, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: props.fieldmap.email }) }}
                    />
                </div>
            </div>
            <div className='adminControl-ldap-dm'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap-dm">Firstname</span>
                    <FormInpDropDownLdap
                        resetVal={props.resetField}
                        defVal={props.fieldmap.fname}
                        inpRef={firstRef}
                        data={props.fieldMapOpts}
                        errBorder={props.ldapFMapFnameErrBor}
                        ldapEdit={props.ldapEdit}
                        setFilter={(event) => { props.setFieldmap({ uname: props.fieldmap.uname, fname: event.target.value, lname: props.fieldmap.lname, email: props.fieldmap.email }) }}
                    />
                </div>
            </div>
            <div className='adminControl-ldap-dm'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap-dm">Lastname</span>
                    <FormInpDropDownLdap resetVal={props.resetField} defVal={props.fieldmap.lname}
                        inpRef={lastRef}
                        data={props.fieldMapOpts}
                        errBorder={props.ldapFMapLnameErrBor}
                        ldapEdit={props.ldapEdit} setFilter={(event) => { props.setFieldmap({ uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: event.target.value, email: props.fieldmap.email }) }}
                    />
                </div>
            </div>
            <div className='adminControl-ldap-dm'>
                <div className='flex flex-column'>
                    <span className="leftControl-ldap-dm">Email</span>
                    <FormInpDropDownLdap
                        resetVal={props.resetField} defVal={props.fieldmap.email}
                        inpRef={emailRef}
                        data={props.fieldMapOpts}
                        errBorder={props.ldapFMapEmailErrBor}
                        ldapEdit={props.ldapEdit} setFilter={(event) => { props.setFieldmap({ uname: props.fieldmap.uname, fname: props.fieldmap.fname, lname: props.fieldmap.lname, email: event.target.value }) }}
                    />
                </div>
            </div>

        </Fragment>
    );
}

export default LdapDataMapping;
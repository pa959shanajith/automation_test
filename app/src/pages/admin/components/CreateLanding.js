import React, { Fragment, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollBar, ValidationExpression } from '../../global'
// import * as actionTypes from '../state/action';
import '../styles/CreateLanding.scss';
import useOnClickOutside from './UseOnClickOutside';
import { AdminActions } from '../adminSlice';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';


/*Component CreateLanding
  use: renders create New User Landing page
  todo: 
*/

const CreateLanding = (props) => {
    const dispatch = useDispatch()
    const confServerList = useSelector(state => state.admin.confServerList)
    const nocreate = useSelector(state => state.admin.nocreate)
    const type = useSelector(state => state.admin.type)
    const confExpired = useSelector(state => state.admin.confExpired)
    const ldap = useSelector(state => state.admin.ldap)
    const server = useSelector(state => state.admin.server)
    const ldapUserFilter = useSelector(state => state.admin.ldapUserFilter)
    const ldapAllUserList = useSelector(state => state.admin.ldapAllUserList)
    const userName = useSelector(state => state.admin.userName);
    const firstname = useSelector(state => state.admin.firstname);
    const lastname = useSelector(state => state.admin.lastname);
    const editUser = useSelector(state => state.admin.editUser);
    const email = useSelector(state => state.admin.email);
    
    const node = useRef();

    const serverItems = [
        { value: "inhouse", name: "Default" },
        { value: "ldap", name: "LDAP" },
        { value: "saml", name: "SAML" },
        { value: "oidc", name: "OpenID" },
    ]
    useEffect(() => {
        if (document.getElementById("confServer") !== null)
            document.getElementById("confServer").selectedIndex = "0";
    }, [confServerList])

    useOnClickOutside(node, () => { props.setShowDropdown(!props.showDropdown); props.click({ query: 'retaintype' }); });

    const userNameChange = (value) => {
        value = ValidationExpression(value.toLowerCase(), "userName")
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(value));
    }

    return (
        <Fragment>
            <div className="Create-outer card flex justify-content-center" >
                <div className="flex flex-column pb-2">
                    <label data-test="userTypeLabel" className="pb-2 font-medium" style={{ paddingLeft: '0.7rem' }}>Select Configuration <span style={{ color: "#d50000" }}>*</span></label>
                    <Dropdown
                        data-test="userTypeDropdown"
                        id="userTypes-create"
                        value={type}
                        className='w-full md:w-20rem'
                        options={serverItems}
                        onChange={(event) => { props.click(); props.selectUserType({ type: event.target.value }); dispatch(AdminActions.UPDATE_TYPE(event.target.value)) }}
                        optionLabel="name"
                    />
                </div>

                {(type !== "inhouse") ?
                    <div className="adminControl-create" >
                        <label data-test="userTypeLabel" className="pb-2 font-medium">Select Server</label>
                        <Dropdown data-test="confServer"
                            id="confServer"
                            defaultValue={""}
                            className='w-full md:w-20rem'
                            value={confServerList}
                            options={serverItems}
                            onChange={(event) => { props.clearForm(); dispatch(AdminActions.UPDATE_SERVER(event.target.value)); }}
                            optionLabel="name"
                        // disabled={confExpired === srv.name}
                        />
                    </div>
                    : null
                }

                {(type === "ldap") ?
                    <Fragment>
                        <div data-test="userLDAPFetch" className="userLDAPFetch adminControl-create">
                            <div className="Create-outer Create-outer-cust">
                                <label className="adminFormRadio">
                                    <input data-test="ldapRadioMap"
                                        checked={ldap.fetch === "map"}
                                        type="radio" value="map"
                                        onChange={() => { dispatch(AdminActions.UPDATE_LDAP_FETCH("map")); props.ldapSwitchFetch({ userConf_ldap_fetch: "map" }); }}
                                        name="ldapFetch"
                                        disabled={server === ''}
                                    />
                                    <span >Map New User</span>
                                </label>
                                <label className="adminFormRadio">
                                    <input data-test="ldapRadioImport" checked={ldap.fetch === "import"} type="radio" value="import" onChange={() => { dispatch(AdminActions.UPDATE_LDAP_FETCH("import")); props.ldapSwitchFetch({ userConf_ldap_fetch: "import" }); }} name="ldapFetch" disabled={server === ''} />
                                    <span >Import User</span>
                                </label>
                            </div>
                            {(ldap.fetch !== 'import') ?
                                <div className="userForm-create">
                                    <button data-test="fetchButtonLdap" title="Fetch" disabled={server === ''} onClick={() => { props.ldapGetUser(); }} className=" a__btn pull-right  Create-User__btn btn-disabled" >Fetch</button>
                                    <input data-test="userDomainName" type="text" autoComplete="off" id="ldapDirectory" name="ldapDirectory" value={ldap.user} onChange={(event) => { dispatch(AdminActions.UPDATE_LDAP_USER(event.target.value)) }} className={props.ldapDirectoryAddClass ? ((props.ldapDirectoryAddClass === "selectErrorBorder") ? "middle__input__border-create form-control__conv-create form-control-custom-create create selectErrorBorder" : "middle__input__border-create form-control__conv-create form-control-custom-create create inputErrorBorder") : "middle__input__border-create form-control__conv-create form-control-custom-create create"} placeholder="User Domain Name" />
                                </div>
                                : null
                            }
                            {(ldap.fetch === 'import') ?
                                <div className="dropdown dropdown-scroll userForm-create" >
                                    <input data-test="userListInput" value={ldapUserFilter} onChange={(event) => { dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(event.target.value)); props.searchFunctionLdap(event.target.value); }} onClick={() => { props.click({ query: 'retaintype' }); props.setShowDropdown(!props.showDropdown); }} className={props.ldapDirectoryAddClass ? ((props.ldapDirectoryAddClass === "selectErrorBorder") ? "btn btn-users dropdown-toggle selectErrorBorder search-cust c__search-dropdown" : "btn btn-users dropdown-toggle inputErrorBorder  search-cust c__search-dropdown") : "btn btn-users dropdown-toggle search-cust c__search-dropdown"} type="text" autoComplete="off" id="ldapDirectory" data-toggle="dropdown" placeholder="Search User.."></input>
                                    {(props.showDropdown && ldapAllUserList !== []) ?
                                        <ul ref={node} className=" dropdown-menu-edit dropdown-menu-users-ldap create-user__dropdown ldapDirectory-cust" role="menu" aria-labelledby="ldapDirectory" >
                                            {props.ldapUserList.map((luser, index) => (
                                                <li index={index} role="presentation" onClick={() => { props.setShowDropdown(!props.showDropdown); dispatch(AdminActions.UPDATE_LDAP_USER(luser.value)); dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(luser.html)); props.ldapGetUser({ luser: luser.value }); }} value={luser.value} className="ldap-user__li">{luser.html}</li>
                                            ))}
                                        </ul>
                                        : null}
                                </div>
                                : null}
                        </div>
                    </Fragment>
                    : null
                }
                <div className='flex flex-row justify-content-between pl-2 pb-2'>
                    <div className="flex flex-column">
                        <label htmlFor='userName' className="pb-2 font-medium">User Name <span style={{ color: "#d50000" }}>*</span></label>
                        <InputText
                            data-test="userName-input__create"
                            type="text"
                            className={`w-full md:w-20rem p-inputtext-sm placeHolder ${props.userNameAddClass ? 'inputErrorBorder': ''}`}
                            id="userName"
                            value={userName} onChange={(event) => { userNameChange(event.target.value) }}
                            name="userName" maxLength="100"
                            placeholder="Enter Your User Name"
                            disabled={editUser}
                        />
                    </div>

                    <div className='flex flex-column'>
                        <label htmlFor="email" className="pb-2 font-medium">Email Id <span style={{ color: "#d50000" }}>*</span></label>
                        <InputText
                            data-test="email"
                            value={email}
                            onChange={(event) => { props.emailChange(event.target.value) }}
                            name="email"
                            id="email"
                            className={`w-full md:w-20rem p-inputtext-sm ${props.emailAddClass ? 'inputErrorBorder' : ''}`}
                            maxLength="100"
                            placeholder="Enter Email Id"
                        />

                    </div>
                </div>


                <div className='flex flex-row justify-content-between pl-2 pb-2'>
                    <div className='flex flex-column'>
                        <label htmlFor='firstname' className="pb-2 font-medium">First Name <span style={{ color: "#d50000" }}>*</span></label>
                        <InputText data-test="firstName-input__create"
                            className={`w-full md:w-20rem p-inputtext-sm ${props.firstnameAddClass ? 'inputErrorBorder' : ''}`}
                            type="text"
                            name="firstname" id="firstname" value={firstname}
                            onChange={(event) => { dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(event.target.value)) }}
                            maxLength="100"
                            placeholder="Enter First Name" />
                    </div>
                    <div className='flex flex-column'>
                        <label htmlFor='lastname' className="pb-2 font-medium">Last Name <span style={{ color: "#d50000" }}>*</span></label>
                        <InputText data-test="lastName-input__create"
                            className={`w-full md:w-20rem p-inputtext-sm ${props.lastnameAddClass ? 'inputErrorBorder' : ''}`}
                            type="text"
                            name="lastname" id="lastname" value={lastname}
                            onChange={(event) => { dispatch(AdminActions.UPDATE_INPUT_LASTNAME(event.target.value)) }}
                            maxLength="100"
                            placeholder="Enter Last Name" />
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default CreateLanding;
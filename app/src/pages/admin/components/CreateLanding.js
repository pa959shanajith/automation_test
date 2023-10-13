import React, { Fragment, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollBar, ValidationExpression } from '../../global'
// import * as actionTypes from '../state/action';
import '../styles/CreateLanding.scss';
import useOnClickOutside from './UseOnClickOutside';
import { AdminActions } from '../adminSlice';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';


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
    const allroles = useSelector(state => state.admin.allRoles)
    const ldapAllUserList = useSelector(state => state.admin.ldapAllUserList)
    const userName = useSelector(state => state.admin.userName);
    const firstname = useSelector(state => state.admin.firstname);
    const lastname = useSelector(state => state.admin.lastname);
    const editUser = useSelector(state => state.admin.editUser);
    const email = useSelector(state => state.admin.email);
    const [tempCheckedUserListLeftSide, setTempCheckedUserListLeftSide] = useState([]);
    const [tempCheckedUserListRightSide, setTempCheckedUserListRightSide] = useState([]);
    const [serverName, setServerName] = useState([]);
    const [selectSearchUser, setSelectSearchUser] = useState('');
    const [filterListSelectUser, setFilterListSelectUser] = useState([]);
    const [selectedSearchUserRightSide, setSelectedSearchUserRightSide] = useState('');
    const [primaryRoles, setPrimaryRoles] = useState(props.primaryRoles);
    const node = useRef();

    const serverItems = [
        { value: "inhouse", name: "Default" },
        { value: "ldap", name: "LDAP" },
        { value: "saml", name: "SAML" },
        { value: "oidc", name: "OpenID" },
    ]

    useEffect(() => {
        let modifyData = []
        ldapAllUserList.map(item => {
            let object={}
            object.name = item[0];
            object.domain = item[1];
            object.role = ""
            object.roleId="" 
            modifyData.push(object);
        })
        setFilterListSelectUser(modifyData.sort());
    }, [ldapAllUserList.length > 0]);

    useOnClickOutside(node, () => { props.setShowDropdown(!props.showDropdown); props.click({ query: 'retaintype' }); });

    const userNameChange = (value) => {
        value = ValidationExpression(value.toLowerCase(), "userName")
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(value));
    }

    const selectServerHandler = (event) => {
        setServerName(event.value.name);
        dispatch(AdminActions.UPDATE_SERVER(event.value.name));
        dispatch(AdminActions.UPDATE_LDAP_FETCH("import"));
        props.ldapSwitchFetch({ userConf_ldap_fetch: "import" });
    }

    //checked users 
    const selectLeftSideHandler = (event) => {
        let _selectedUserList = [...tempCheckedUserListLeftSide]
        if (event.checked) {
            filterListSelectUser.filter((item) =>{
                if(item.name === (event.target.name)) _selectedUserList.push(item);
            });
        }
        else {
            _selectedUserList = _selectedUserList.filter(item => item.name !== event.target.name);
        }
        setTempCheckedUserListLeftSide(_selectedUserList);
    }

    const selectUsersSearchHandler = (event) => {
        let inputValue = event.target.value.toLowerCase();
        setSelectSearchUser(inputValue);
        if (inputValue != '') {
            const filterData = filterListSelectUser.filter((item) =>
                item.name.toLowerCase().includes(inputValue)
            );
            setFilterListSelectUser(filterData.sort());
        } else {
            setFilterListSelectUser(filterListSelectUser.sort());
        }

    }

    const transferSelectedUsersToRightSide = () => {
        function isSubarrayEqual(subArr1, subArr2) {
            return subArr1.name === subArr2.name;
        }

        let updatedUserList = filterListSelectUser.filter(subArr1 =>
          !tempCheckedUserListLeftSide.some(subArr2 => isSubarrayEqual(subArr1, subArr2))
        );

        let checkedUserListData = []
        tempCheckedUserListLeftSide.map(item => {
            let object={...item, role : "Quality Engineer", roleId:"5db0022cf87fdec084ae49ac" };
            checkedUserListData.push(object);
        })
        setTempCheckedUserListLeftSide([]);
        setFilterListSelectUser(updatedUserList.sort());  
        props.setLdapSelectedUserList([...props.ldapSelectedUserList,...checkedUserListData].sort());
        
        // ------------------------------------------------ for single user LDAP ----------------------------------------------------------
        let usernameLdap = '';
        let domainName = '';
        checkedUserListData.map(item => {
            usernameLdap = item.name;
            domainName = item.domain;
        })
        dispatch(AdminActions.UPDATE_LDAP_USER(usernameLdap));
        dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(domainName));
        props.ldapGetUser({ luser: usernameLdap });
        //----------------------------------------------------------- END ---------------------------------------------------------------
    }

    const transferSelectedUsersToLeftSide = () => {
        function isSubarrayEqual(subArr1, subArr2) {
            return subArr1.name === subArr2.name;
        }
        let updatedCheckedUserList = props.ldapSelectedUserList.filter(subArr1 =>
            !tempCheckedUserListRightSide.some(subArr2 => isSubarrayEqual(subArr1, subArr2))
        )
        let userLists = [...filterListSelectUser,...tempCheckedUserListRightSide]
        setTempCheckedUserListRightSide([]);
        setFilterListSelectUser(userLists.sort()); 
        props.setLdapSelectedUserList(updatedCheckedUserList.sort());
    }

    const selectRightSideUserListHandler = (event) => {
        let _selectedUserList = [...tempCheckedUserListRightSide]
        if (event.checked) {
            props.ldapSelectedUserList.filter((item) =>{
                if(item.name === (event.target.name)) _selectedUserList.push(item);
            });
        }
        else {
            _selectedUserList = _selectedUserList.filter(item => item.name !== event.target.name);
        }
        setTempCheckedUserListRightSide(_selectedUserList);
    }

    const primaryRoleHandler = (event, userData) => {
        let updateUser = [...props.ldapSelectedUserList];
        let roleIndex = primaryRoles.findIndex(item => item.value === event.target.value);
        let updateUserIndex = updateUser.findIndex(item => item.name === userData.name)
        updateUser[updateUserIndex].roleId = primaryRoles[roleIndex].value;
        updateUser[updateUserIndex].role = primaryRoles[roleIndex].name;
        props.setLdapSelectedUserList(updateUser.sort());
    }

    return (
        <Fragment>
            <div className="Create-outer card flex justify-content-center" >
                <div className="flex flex-row gap-8">
                    <div className="flex flex-column pb-2">
                        <label data-test="userTypeLabel" className="pb-2 font-medium" style={{ paddingLeft: '0.7rem' }}>Select Configuration <span style={{ color: "#d50000" }}>*</span></label>
                        <Dropdown
                            data-test="userTypeDropdown"
                            id="userTypes-create"
                            value={type}
                            className='w-full md:w-20rem p-inputtext-sm'
                            options={serverItems}
                            onChange={(event) => { props.click(); props.selectUserType({ type: event.target.value }); dispatch(AdminActions.UPDATE_TYPE(event.target.value)) }}
                            optionLabel="name"
                            disabled={editUser}

                        />
                    </div>

                    {(type !== "inhouse") ?
                        <div className="flex flex-column pb-2" >
                            <label data-test="userTypeLabel" className="pb-2 font-medium" style={{ paddingLeft: '0.7rem' }}>Select Server <span style={{ color: "#d50000" }}>*</span></label>
                            <Dropdown data-test="confServer"
                                id="confServer"
                                className='w-full md:w-20rem p-inputtext-sm'
                                value={serverName}
                                options={confServerList}
                                onChange={(e) => selectServerHandler(e)}
                                optionLabel="name"
                                // disabled={confExpired === server}
                                placeholder='Select server'
                            />
                        </div>
                        : null
                    }
                </div>

                {(type === "ldap") ?
                    <>
                        <div className='flex flex-row pl-2 gap-2 pt-2'>
                            <div className="server_list_ldap card">
                                <div>
                                    <small>Select Users<span style={{ color: "#d50000" }}> *</span></small>
                                    <div>
                                        <InputText
                                            value={selectSearchUser}
                                            onChange={selectUsersSearchHandler}
                                            className='w-full md:w-19rem p-inputtext-sm mb-2'
                                            placeholder="Search users"
                                        ></InputText>
                                    </div>
                                </div>
                                <div className='user_list_container'>
                                    {filterListSelectUser.length > 0 ? filterListSelectUser.map((user, index) =>
                                        <div key={index} className="flex pb-2">
                                            <Checkbox inputId={user.name} name={user.name} onChange={selectLeftSideHandler} checked={tempCheckedUserListLeftSide.some(item => item.name === user.name)} />
                                            <label htmlFor={user.name} className="ml-2">{user.name}</label>
                                        </div>
                                    )
                                        : <small>No users found</small>}
                                </div>

                            </div>

                            <div className='flex flex-column justify-content-center gap-2'>
                                <Button label=">" size="small" onClick={transferSelectedUsersToRightSide} disabled={tempCheckedUserListLeftSide.length <= 0} outlined></Button>
                                <Button label="<" size="small" onClick={transferSelectedUsersToLeftSide} disabled={tempCheckedUserListRightSide.length <= 0} outlined> </Button>
                            </div>


                            {/* ---------------Right Side Container----------------- */}

                            <div className='server_list_ldap card'>
                                <div>
                                    <small>Selected Users<span style={{ color: "#d50000" }}> *</span></small>
                                    <div>
                                        <InputText
                                            value={selectedSearchUserRightSide}
                                            // onChange={}
                                            className='w-full md:w-19rem p-inputtext-sm mb-2'
                                            placeholder="Search users"
                                        ></InputText>
                                    </div>
                                </div>

                                <div className='user_list_container'>
                                    {(props.ldapSelectedUserList.length > 0) ? props.ldapSelectedUserList.map((user, index) =>
                                        <div key={index} className="flex flex-row pb-2 w-full">
                                            <Checkbox inputId={user.name} name={user.name} onChange={selectRightSideUserListHandler} checked={tempCheckedUserListRightSide.some(item => item.name === user.name)} />
                                            <label htmlFor={user.name} className="ml-2 w-4">{user.name}</label>
                                            <Dropdown
                                                data-test="primaryroleDropdown"
                                                id="primaryroleDropdown"
                                                defaultValue={""}
                                                value={user.roleId}
                                                options={primaryRoles}
                                                optionLabel="name"
                                                className='md:w-10rem p-inputtext-sm'
                                                placeholder='Select Role'
                                                onChange={(e) => primaryRoleHandler(e, user)}
                                            />
                                        </div>
                                    )
                                        : <small>No users selected</small>}
                                </div>
                            </div>

                        </div>
                    </>
                    : null
                }
                {(type === "inhouse") ?
                    <>
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
                                    onChange={(event) => { props.emailChange(event.target.value.toLowerCase())}}
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
                    </> : null}
            </div>
        </Fragment>
    )
}
export default CreateLanding;
//---------------------- need it for reference, once the LDAP will completely then will delete this commented lines-----------------------------
                    // <Fragment>
                    //     <div data-test="userLDAPFetch" className="userLDAPFetch adminControl-create">
                    //         <div className="Create-outer Create-outer-cust">
                    //             <label className="adminFormRadio">
                    //                 <RadioButton
                    //                     data-test="ldapRadioMap"
                    //                     checked={ldap.fetch === "map"}
                    //                     value="map"
                    //                     name="ldapFetch"
                    //                     disabled={server === ''}
                    //                     onChange={() => { dispatch(AdminActions.UPDATE_LDAP_FETCH("map")); props.ldapSwitchFetch({ userConf_ldap_fetch: "map" }); }}
                    //                 />
                    //                 <span className="ml-2 mr-6">Map New User</span></label>

                    //             {/* <label htmlFor='ldapFetch' className="adminFormRadio">Map New User </label>
                    //             <InputText data-test="ldapRadioMap"
                    //                 checked={ldap.fetch === "map"}
                    //                 type="radio" value="map"
                    //                 onChange={() => { dispatch(AdminActions.UPDATE_LDAP_FETCH("map")); props.ldapSwitchFetch({ userConf_ldap_fetch: "map" }); }}
                    //                 name="ldapFetch"
                    //                 id='ldapFetch'
                    //                 disabled={server === ''}
                    //             /> */}

                    //             <label htmlFor='' className="adminFormRadio">Import User</label>
                    //             <RadioButton
                    //                 data-test="ldapRadioImport"
                    //                 checked={ldap.fetch === "import"}
                    //                 type="radio" value="import"
                    //                 onChange={() => {
                    //                     dispatch(AdminActions.UPDATE_LDAP_FETCH("import"));
                    //                     props.ldapSwitchFetch({ userConf_ldap_fetch: "import" });
                    //                 }}
                    //                 name="ldapFetch"
                    //                 disabled={server === ''}
                    //             />

                    //         </div>
                    //         {/* {(ldap.fetch !== 'import') ?
                    //             <div className="userForm-create">
                    //                 <InputText
                    //                     data-test="userDomainName"
                    //                     autoComplete="off"
                    //                     id="ldapDirectory"
                    //                     name="ldapDirectory"
                    //                     value={ldap.user}
                    //                     onChange={(event) => { dispatch(AdminActions.UPDATE_LDAP_USER(event.target.value)) }}
                    //                     // className={props.ldapDirectoryAddClass ? ((props.ldapDirectoryAddClass === "selectErrorBorder") ? "middle__input__border-create form-control__conv-create form-control-custom-create create selectErrorBorder" : "middle__input__border-create form-control__conv-create form-control-custom-create create inputErrorBorder") : "middle__input__border-create form-control__conv-create form-control-custom-create create"} 
                    //                     placeholder="User Domain Name"
                    //                 />
                    //                 <Button
                    //                     label="Fetch"
                    //                     data-test="fetchButtonLdap"
                    //                     title="Fetch"
                    //                     disabled={server === ''}
                    //                     onClick={() => { props.ldapGetUser(); }}
                    //                 ></Button>
                    //             </div>
                    //             : null
                    //         } */}
                    //         {(ldap.fetch === 'import') ?
                    //             <div className="dropdown dropdown-scroll userForm-create" >
                    //                 <InputText
                    //                     data-test="userListInput"
                    //                     value={ldapUserFilter}
                    //                     onChange={(event) => { dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(event.target.value)); props.searchFunctionLdap(event.target.value); }}
                    //                     onClick={() => { props.click({ query: 'retaintype' }); props.setShowDropdown(!props.showDropdown); }}
                    //                     // className={props.ldapDirectoryAddClass ? ((props.ldapDirectoryAddClass === "selectErrorBorder") ? "btn btn-users dropdown-toggle selectErrorBorder search-cust c__search-dropdown" : "btn btn-users dropdown-toggle inputErrorBorder  search-cust c__search-dropdown") : "btn btn-users dropdown-toggle search-cust c__search-dropdown"}
                    //                     type="text"
                    //                     autoComplete="off"
                    //                     id="ldapDirectory"
                    //                     data-toggle="dropdown"
                    //                     placeholder="Search User.."
                    //                 ></InputText>
                    //                 {(props.showDropdown && ldapAllUserList !== []) ?
                    //                     <ul ref={node} className=" dropdown-menu-edit dropdown-menu-users-ldap create-user__dropdown ldapDirectory-cust" role="menu" aria-labelledby="ldapDirectory" >
                    //                         {props.ldapUserList.map((luser, index) => (
                    //                             <li index={index}
                    //                                 role="presentation"
                    //                                 onClick={() => {
                    //                                     props.setShowDropdown(!props.showDropdown);
                    //                                     dispatch(AdminActions.UPDATE_LDAP_USER(luser.value));
                    //                                     dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(luser.html));
                    //                                     props.ldapGetUser({ luser: luser.value });
                    //                                 }}
                    //                                 value={luser.value}
                    //                                 className="ldap-user__li">{luser.html}</li>
                    //                         ))}
                    //                     </ul>
                    //                     : null}
                    //             </div>
                    //             : null}
                    //     </div>
                    // </Fragment>
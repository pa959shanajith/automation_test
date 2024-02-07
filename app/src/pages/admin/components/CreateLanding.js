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
import { Tooltip } from 'primereact/tooltip';



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
    const [serverName, setServerName] = useState('');
    const [selectSearchUser, setSelectSearchUser] = useState('');
    const [LDAPUserList, setLDAPUserList] = useState([]);
    const [filterListSearchUser, setFilterListSearchUser] = useState([]);
    const [selectedSearchUserRightSide, setSelectedSearchUserRightSide] = useState('');
    const [primaryRoles, setPrimaryRoles] = useState(props.primaryRoles);
    const [ldapSelectedUser, setLdapSelectedUser] = useState('');
    const [selectedLdapUserListTemp, setSelectedLdapUserListTemp] = useState([]);
    const ldapFetchUsersData = useSelector(state => state.admin.ldapFetchUsersData);

    const node = useRef();

    const serverItems = [
        { value: "inhouse", name: "Default" },
        { value: "ldap", name: "LDAP" },
        { value: "saml", name: "SAML" },
        { value: "oidc", name: "OpenID" },
    ]


    const sortingFunction = (array) => {
        let inputArray = array;
        inputArray.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            return 0; // names are equal
        });
        return inputArray;
    }

    useEffect(() => {
        setServerName(server)
    }, [server !== "" && editUser])

    useEffect(() => {
        let newRolesList = [...primaryRoles, { name: "Quality Manager & Admin", value: "ManagerWithadmin" }]
        setPrimaryRoles(newRolesList);
    }, []);

    useEffect(() => {
        let modifyData = []
        if (ldapAllUserList.length > 0) {
            ldapAllUserList.map(item => {
                let object = {}
                object.name = item.html;
                object.domain = item.value;
                object.role = ""
                object.roleId = ""
                modifyData.push(object);
            })
            let updatedlist = sortingFunction(modifyData)
            setLDAPUserList(updatedlist)
            setFilterListSearchUser(updatedlist);
        }
    }, [ldapAllUserList.length > 0]);

    useOnClickOutside(node, () => { props.setShowDropdown(!props.showDropdown); props.click({ query: 'retaintype' }); });

    const userNameChange = (value) => {
        value = ValidationExpression(value.toLowerCase(), "userName")
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(value));
    }

    const selectServerHandler = (event) => {
        setServerName(event.target.value);
        dispatch(AdminActions.UPDATE_SERVER(event.target.value));
        if (type === "ldap") {
            dispatch(AdminActions.UPDATE_LDAP_FETCH("import"));
            props.ldapSwitchFetch({ userConf_ldap_fetch: "import", serverName: event.target.value });
        }

    }

    //checked users 
    const selectLeftSideHandler = (event) => {
        let _selectedUserList = [...tempCheckedUserListLeftSide]
        if (event.checked) {
            LDAPUserList.filter((item) => {
                if (item.name === (event.target.name)) _selectedUserList.push(item);
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
        function isSubarrayEqual(subArr1, subArr2) {
            return subArr1.name === subArr2.name;
        }
        let updatedUserList = sortingFunction(LDAPUserList.filter(subArr1 =>
            !props.ldapSelectedUserList.some(subArr2 => isSubarrayEqual(subArr1, subArr2))
        ));

        if (inputValue != '') {
            const filterData = updatedUserList.filter((item) =>
                item.name.toLowerCase().includes(inputValue)
            );
            filterData.length > 0 ? setFilterListSearchUser(sortingFunction(filterData)) : setFilterListSearchUser([]);
        } else {
            setFilterListSearchUser(sortingFunction(updatedUserList));
        }
    }

    const transferSelectedUsersToRightSide = () => {
        let newSelectesUserList = [...tempCheckedUserListLeftSide, ...props.ldapSelectedUserList];

        function isSubarrayEqual(subArr1, subArr2) {
            return subArr1.name === subArr2.name;
        }
        let updatedUserList = LDAPUserList.filter(subArr1 =>
            !newSelectesUserList.some(subArr2 => isSubarrayEqual(subArr1, subArr2))
        );

        let checkedUserListData = [];
        let domainNameList = [];
        tempCheckedUserListLeftSide.map(item => {
            let object = { ...item, role: "Quality Engineer", roleId: "5db0022cf87fdec084ae49ac", isAdmin: false };
            domainNameList.push(item.domain);
            checkedUserListData.push(object);
        })
        let newLdapSelectedUserListTemp = sortingFunction([...props.ldapSelectedUserList, ...checkedUserListData])
        setTempCheckedUserListLeftSide([]);
        setFilterListSearchUser(sortingFunction(updatedUserList));
        props.setLdapSelectedUserList(newLdapSelectedUserListTemp);
        setSelectedLdapUserListTemp(newLdapSelectedUserListTemp);
        setSelectSearchUser('');
        dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(newLdapSelectedUserListTemp));
        props.ldapGetUser({ luser: domainNameList });
    }

    const transferSelectedUsersToLeftSide = () => {
        function isSubarrayEqual(subArr1, subArr2) {
            return subArr1.name === subArr2.name;
        }
        let updatedCheckedUserList = sortingFunction(props.ldapSelectedUserList.filter(subArr1 =>
            !tempCheckedUserListRightSide.some(subArr2 => isSubarrayEqual(subArr1, subArr2))
        ));
        let userLists = [...filterListSearchUser, ...tempCheckedUserListRightSide]

        setTempCheckedUserListRightSide([]);
        setFilterListSearchUser(sortingFunction(userLists));
        props.setLdapSelectedUserList(updatedCheckedUserList);
        setSelectedLdapUserListTemp(updatedCheckedUserList);
        let newldapFetchUsersData = [];
        ldapFetchUsersData.filter(arr1 => {
            updatedCheckedUserList.some(arr2 => {
                if (arr1.ldapname === arr2.domain) newldapFetchUsersData.push(arr1);
            })
        });
        dispatch(AdminActions.UPDATE_LDAP_DATA(newldapFetchUsersData));
    }

    const selectRightSideUserListHandler = (event) => {
        let _selectedUserList = [...tempCheckedUserListRightSide]
        if (event.checked) {
            props.ldapSelectedUserList.filter((item) => {
                if (item.name === (event.target.name)) _selectedUserList.push(item);
            });
        }
        else {
            _selectedUserList = _selectedUserList.filter(item => item.name !== event.target.name);
        }
        setTempCheckedUserListRightSide(_selectedUserList);
    }

    const primaryRoleHandler = (event, userData) => {
        let updateUser = [...selectedLdapUserListTemp];
        let roleIndex = primaryRoles.findIndex(item => item.value === event.target.value);
        let updateUserIndex = updateUser.findIndex(item => item.name === userData.name);
        let updatedLdapUserList = [];
        updateUser.map(((userData, index) => {

            if (index === updateUserIndex) {
                let userObj = { ...userData, roleId: primaryRoles[roleIndex].value, role: primaryRoles[roleIndex].name, isAdmin: event.target.value === "ManagerWithadmin" ? true : false }
                updatedLdapUserList.push(userObj);
            }
            else updatedLdapUserList.push(userData);
        }))
        updatedLdapUserList = sortingFunction(updatedLdapUserList);
        props.setLdapSelectedUserList(updatedLdapUserList);
        dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(updatedLdapUserList));
        setSelectedLdapUserListTemp(updatedLdapUserList);
    }

    const ldapSelectedUserSearchHandler = (event) => {
        let inputValue = event.target.value.toLowerCase();
        setLdapSelectedUser(inputValue);
        if (inputValue != '') {
            const filterData = props.ldapSelectedUserList.filter((item) =>
                item.name.toLowerCase().includes(inputValue)
            );
            filterData.length > 0 ? setSelectedLdapUserListTemp(sortingFunction(filterData)) : setSelectedLdapUserListTemp([]);
        } else {
            setSelectedLdapUserListTemp(props.ldapSelectedUserList);
        }

    }
    const firstNameChange = (value) => {
        dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(value));
        { (firstname === value || value === props?.editUserData?.firstName) ? props.setUpdatedInfo(true) : props.setUpdatedInfo(false) }
    }

    const lastNameChange = (value) => {
        dispatch(AdminActions.UPDATE_INPUT_LASTNAME(value));
        { (firstname === value || value === props?.editUserData?.lastName) ? props.setUpdatedInfo(true) : props.setUpdatedInfo(false) }
    }


    const selectConfigurationOnchange = (event) => {
        props.click();
        props.selectUserType({ type: event.target.value });
        dispatch(AdminActions.UPDATE_TYPE(event.target.value));
        setLdapSelectedUser('');
        setFilterListSearchUser([]);
        setSelectedLdapUserListTemp([]);
        setSelectSearchUser('');
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
                            onChange={selectConfigurationOnchange}
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
                                value={serverName }
                                options={confServerList}
                                onChange={(e) => selectServerHandler(e)}
                                // optionLabel="name"
                                disabled={editUser}
                                placeholder='Select server'
                            />
                        </div>
                        : null
                    }
                </div>

                {(type === "ldap" && !editUser) ?
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
                                    {filterListSearchUser.length > 0 ? filterListSearchUser.map((user, index) =>
                                        <div key={index} className="flex pb-2">
                                            <Checkbox inputId={user.name} name={user.name} onChange={selectLeftSideHandler} checked={tempCheckedUserListLeftSide.some(item => item.name === user.name)} />
                                            <label htmlFor={user.name} className="ml-2">{user.name}</label>
                                        </div>
                                    )
                                        : <small>No users found</small>}
                                </div>

                            </div>

                            <div className='flex flex-column justify-content-center' style={{ gap: '0.8rem', padding: '0.3rem' }}>
                                <Button label=">" size="small" onClick={transferSelectedUsersToRightSide} disabled={tempCheckedUserListLeftSide.length <= 0} outlined></Button>
                                <Button label="<" size="small" onClick={transferSelectedUsersToLeftSide} disabled={tempCheckedUserListRightSide.length <= 0} outlined> </Button>
                            </div>


                            {/* ---------------Right Side Container----------------- */}

                            <div className='server_list_ldap card'>
                                <div>
                                    <small>Selected Users<span style={{ color: "#d50000" }}> *</span></small>
                                    <div>
                                        <InputText
                                            value={ldapSelectedUser}
                                            onChange={ldapSelectedUserSearchHandler}
                                            className='w-full md:w-19rem p-inputtext-sm mb-2'
                                            placeholder="Search users"
                                        ></InputText>
                                    </div>
                                </div>

                                <div className='user_list_container'>
                                    {(selectedLdapUserListTemp.length > 0) ? selectedLdapUserListTemp.map((user, index) =>
                                        <div key={index} className="flex flex-row pb-2 w-full" style={{ alignItems: 'center' }}>
                                            <Checkbox inputId={user.name} name={user.name} onChange={selectRightSideUserListHandler} checked={tempCheckedUserListRightSide.some(item => item.name === user.name)} />
                                            <label htmlFor={user.name} className={`ldap_selected_username ldap_label_${index} ml-2`}>{user.name}</label>
                                            <Tooltip target={`.ldap_label_${index}`} position='bottom' content={user.name}></Tooltip>
                                            <Dropdown
                                                data-test="primaryroleDropdown"
                                                id="primaryroleDropdown"
                                                defaultValue={""}
                                                value={user.roleId}
                                                options={primaryRoles}
                                                optionLabel="name"
                                                className={`ldap_selected_role${index} md:w-10rem p-inputtext-sm`}
                                                placeholder='Select Role'
                                                onChange={(e) => primaryRoleHandler(e, user)}
                                            />
                                            <Tooltip target={`.ldap_selected_role${index}`} content={user.role} position='bottom'></Tooltip>
                                        </div>
                                    )
                                        : <small>No users selected</small>}
                                </div>
                            </div>

                        </div>
                    </>
                    : null
                }
                {(type === "inhouse" || type === "saml" || (type === "ldap" && editUser)) ?
                    <>
                        <div className='flex flex-row justify-content-between pl-2 pb-2'>
                            <div className="flex flex-column">
                                <label htmlFor='userName' className="pb-2 font-medium">User Name <span style={{ color: "#d50000" }}>*</span></label>
                                <InputText
                                    data-test="userName-input__create"
                                    type="text"
                                    className={`w-full md:w-20rem p-inputtext-sm placeHolder ${props.userNameAddClass ? 'inputErrorBorder' : ''}`}
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
                                    onChange={(event) => { props.emailChange(event.target.value.toLowerCase()) }}
                                    name="email"
                                    id="email"
                                    className={`w-full md:w-20rem p-inputtext-sm ${props.emailAddClass ? 'inputErrorBorder' : ''}`}
                                    maxLength="100"
                                    placeholder="Enter Email Id"
                                    disabled={editUser && (type === "ldap" || type === "saml")}
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
                                    onChange={(event) => { firstNameChange(event.target.value) }}
                                    maxLength="100"
                                    placeholder="Enter First Name"
                                    disabled={editUser && (type === "ldap" || type === "saml")}
                                    />
                            </div>
                            <div className='flex flex-column'>
                                <label htmlFor='lastname' className="pb-2 font-medium">Last Name <span style={{ color: "#d50000" }}>*</span></label>
                                <InputText data-test="lastName-input__create"
                                    className={`w-full md:w-20rem p-inputtext-sm ${props.lastnameAddClass ? 'inputErrorBorder' : ''}`}
                                    type="text"
                                    name="lastname" id="lastname" value={lastname}
                                    onChange={(event) => { lastNameChange(event.target.value) }}
                                    maxLength="100"
                                    placeholder="Enter Last Name" 
                                    disabled={editUser && (type === "ldap" || type === "saml")}
                                    />
                            </div>
                        </div>
                    </> : null}
            </div>
        </Fragment>
    )
}
export default CreateLanding;

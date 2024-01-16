import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenOverlay, VARIANT, Messages as MSG, ValidationExpression } from '../../global'
import { getUserRoles, manageUserDetails, getLDAPConfig, getSAMLConfig, getOIDCConfig, getUserDetails, fetchICE, manageSessionData, createMulitpleLdapUsers } from '../api';
import '../styles/CreateUser.scss'
import CreateLanding from '../components/CreateLanding';
import EditLanding from '../components/EditLanding';
import useOnClickOutside from '../components/UseOnClickOutside'
import { AdminActions } from '../adminSlice';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import TokenManagement from '../containers/TokenMangement';
import { Checkbox } from 'primereact/checkbox';
import IceProvision from '../containers/IceProvision';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import UserList from '../components/UserList';
import { Tooltip } from 'primereact/tooltip';


/*Component CreateUser
  use: defines Admin middle Section for create user
  ToDo:
*/

const CreateUser = (props) => {
    const dispatch = useDispatch();
    const node = useRef();
    const [toggleAddRoles, setToggleAddRoles] = useState(false)
    const [editUserIceProvision, setEditUserIceProvision] = useState();
    const [showDropdown, setShowDropdown] = useState(false)
    const [showDropdownEdit, setShowDropdownEdit] = useState(false)
    const [userNameAddClass, setUserNameAddClass] = useState(false)
    const [firstnameAddClass, setfirstnameAddClass] = useState(false)
    const [lastnameAddClass, setLastnameAddClass] = useState(false)
    const [confirmPasswordAddClass, setConfirmPasswordAddClass] = useState(false)
    const [emailAddClass, setEmailAddClass] = useState(false)
    const [ldapDirectoryAddClass, setLdapDirectoryAddClass] = useState(false)
    const [userIdNameAddClass, setUserIdNameAddClass] = useState(false)
    const [userRolesAddClass, setUserRolesAddClass] = useState(false)
    const [confServerAddClass, setConfServerAddClass] = useState(false)
    const [passwordAddClass, setPasswordAddClass] = useState(false)
    const [allUserFilList, setAllUserFilList] = useSelector(state => state.admin.allUsersList)
    const [ldapUserList, setLdapUserList] = useState([])
    const [ldapUserListInitial, setLdapUserListInitial] = useState([])
    const [loading, setLoading] = useState(false)
    const [updatedInfo, setUpdatedInfo] = useState(true);
    const type = useSelector(state => state.admin.type);
    const addRole = useSelector(state => state.admin.addRole);
    const allRoles = useSelector(state => state.admin.allRoles);
    const userId = useSelector(state => state.admin.userId);
    const userName = useSelector(state => state.admin.userName);
    const passWord = useSelector(state => state.admin.passWord);
    const firstname = useSelector(state => state.admin.firstname);
    const lastname = useSelector(state => state.admin.lastname);
    const email = useSelector(state => state.admin.email);
    const role = useSelector(state => state.admin.role);
    const server = useSelector(state => state.admin.server);
    const ldap = useSelector(state => state.admin.ldap);
    const userIdName = useSelector(state => state.admin.userIdName);
    const confExpired = useSelector(state => state.admin.confExpired);
    const confirmPassword = useSelector(state => state.admin.confirmPassword);
    const allUsersList = useSelector(state => state.admin.allUsersList);
    const currentTab = useSelector(state => state.admin.screen);
    const nocreate = useSelector(state => state.admin.nocreate);
    const editUser = useSelector(state => state.admin.editUser);
    const ldapUserFilter = useSelector(state => state.admin.ldapUserFilter);
    const ldapFetchUsersData = useSelector(state => state.admin.ldapFetchUsersData);
    const [showEditUser, setShowEditUser] = useState(false);
    const [allRolesUpdate, setAllRolesUpdate] = useState([]);
    const [roleDropdownValue, setRoleDropdownValue] = useState("");
    const [userCreateDialog, setUserCreateDialog] = useState(props.userCreateDialog);
    const [selectedTab, setSelectedTab] = useState('userDetails');
    const [userNameForIceToken, setUserNameForIceToken] = useState('');
    const [adminCheck, setAdminCheck] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const [ldapSelectedUserList, setLdapSelectedUserList] = useState([]);
    const [ldapIceProvisionUserList, setLdapIceProvisionUserList] = useState([]);
    const [ldapUserDetailsTabDisable, setLdapUserDetailsTabDisable] = useState([]);


    useEffect(() => {
        click();
        dispatch(AdminActions.UPDATE_TYPE("inhouse"));
    }, [currentTab === "users"]);


    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo ;

    useEffect(() => {
        let allRolesList = [];
        if (allRoles.length) {
            allRoles.forEach(userRole => {
                let roleObject = {};
                if (userRole[0] !== "Admin") {
                    roleObject.name = userRole[0];
                    roleObject.value = userRole[1];
                    allRolesList.push(roleObject);
                }
            });
            allRolesList.sort((a, b) => {
                if (a.name === 'Quality Manager') return -1;
                if (a.name === 'Quality Lead' && b.name === 'Quality Engineer') return -1;
                return 1;
            });
            if(role) setRoleDropdownValue(role);
            setAllRolesUpdate(allRolesList);
            if (editUser) setAdminCheck(props?.editUserData?.isAdmin);
        }
    }, [allRoles.length > 0]);

    const tabHeader = [
        { label: 'User Details', key: 'userDetails', text: 'User Details', disabled: ldapUserDetailsTabDisable},
        { label: 'Avo Assure Client Provision', key: 'avoAzzureClient', text: 'Avo Assure Client Provision', disabled:!editUser && !nocreate },
    ];

    useOnClickOutside(node, () => setToggleAddRoles(false));

    const displayError = (error) => {
        setLoading(false)
        props.toastError(error)
    }

    //Fetch UserRoles
    const updateUserRoles = (props) => {
        (async () => {
            var res = await getUserRoles()
            if (res.error) { displayError(res.error); return; }
            else if (res !== undefined) {
                res.sort(function (a, b) { return a[0] > b[0]; });
                var allAddRoles = res.filter((e) => (e[0].toLowerCase() !== "admin"))
                dispatch(AdminActions.UPDATE_ALLROLES(res));
                dispatch(AdminActions.UPDATE_ALLADDROLES(allAddRoles));
            }
        })()
    }

    //Transaction Activity for Create/ Update/ Delete User button Action
    const manage = (input) => {
        props.toast.current.clear();
        setUserNameForIceToken(userName);
        const action =  type==="ldap" ? "createMultipleLdapUsers" : input.action;
        const uType = type;
        if(type !== "ldap")
        {   
            if (!validate({ 
                action: action, 
                userName: userName,
                lastname:lastname,
                firstname: firstname,
                passWord:passWord, 
                email: email,
                role: role,
                addRole: addRole,
                type: uType
                })) return;
        }
        const bAction = action.charAt(0).toUpperCase() + action.substr(1);
        const addRole = [];
        for (let role in addRole) {
            if (addRole[role]) addRole.push(role);
        }
        const createdbyrole = allRoles.filter((e) => (e[0].toLowerCase() === "admin"));;
        
        var userObj = {
            userid: userId,
            username: userName,
            password: passWord,
            firstname: firstname,
            lastname: lastname,
            email: email,
            role: role,
            addRole: addRole,
            type: uType,
            createdbyrole: createdbyrole,
            server: server,
            isadminuser: adminCheck // if user is Quality Manager, she/he has the Admin rights and it is optional
        };
        let ldapUserList = [];
        let ldapIceProvisionUserList = [];
        if (uType === "ldap") {
            setLdapUserDetailsTabDisable(true);
            ldapFetchUsersData.forEach(user => {
                let filteredUser =  ldapSelectedUserList.find( filteredUser => {
                    if(filteredUser.domain === user.ldapname) 
                        return filteredUser;
                });
                let managerRoledata = undefined;
                if (filteredUser.roleId === 'ManagerWithadmin') managerRoledata = allRolesUpdate.find(role => {if(role.name === 'Quality Manager') return role});
                let roleId = managerRoledata?.value
                    if (!validate({
                        action: action,
                        userName: user.username,
                        lastname:user.lastname,
                        firstname: user.firstname,
                        passWord:passWord,
                        email: user.email,
                        role: filteredUser.roleId === 'ManagerWithadmin'? roleId : filteredUser.roleId,
                        addRole: addRole,
                        type: uType
                    })) { return };
                
                let newEachuserData = { 
                                userid: userId,
                                username: user.username,
                                passWord: passWord,
                                firstname: user.firstname,
                                lastname: user.lastname,
                                email: user.email,
                                role: filteredUser.roleId === 'ManagerWithadmin'? roleId : filteredUser.roleId,
                                addRole: addRole,
                                type: uType,
                                createdbyrole: createdbyrole,
                                server: server,
                                isadminuser: filteredUser.isAdmin,
                                ldapUser: filteredUser.domain
                            }
                ldapUserList.push(newEachuserData);
                ldapIceProvisionUserList.push({...newEachuserData, 'roleName': filteredUser.role})
            })
        }

        const userdetail = { ...userInfo, email_id: userObj.email, firstname: userObj.firstname, lastname: userObj.lastname, role: userObj.role};

        if (uType === "ldap") userObj.ldapUser = ldap.user;
        setLoading(bAction.slice(0, -1) + "ing User...");

        (async () => {
            try {
                if(uType !== "ldap"){
                    var data = await manageUserDetails(action, userObj );
                    if (data.error) { displayError(data.error); return; }
                    setLoading(false);
                    if (data === "success") {
                        if(userInfo && userInfo.user_id === userObj.userid){
                        localStorage.setItem("userInfo", JSON.stringify(userdetail))
                        dispatch(loadUserInfoActions.setUserInfo({ ...userInfo, email_id: userObj.email, firstname: userObj.firstname, lastname: userObj.lastname, role: userObj.role }))
                        }
                        props.toastSuccess(MSG.CUSTOM("User " + action + "d successfully!", VARIANT.SUCCESS));
                        if (action === "create") { 
                            setSelectedTab("avoAzzureClient") }
                        else {
                            edit();
                            setSelectedTab("avoAzzureClient")
                        };
                        if (action === "delete") {
                            props.setRefreshUserList(!props.refreshUserList);
                            const data0 = await manageSessionData('logout', userObj.username, '?', 'dereg')
                            if (data0.error) { displayError(data0.error); return; }
                            var data1 = await fetchICE(userObj.userid)
                            if (data1.error) { displayError(data1.error); return; }
                            else if (data1.length === 0) return false;
                            const icename = data1[0].icename;
                            var data2 = await manageSessionData('disconnect', icename, '?', 'dereg')
                            if (data2.error) { displayError(data2.error); return; }
                        }
                    } else if (data === "exists") {
                        props.toastWarn(MSG.ADMIN.WARN_USER_EXIST);
                    }  else if (data === "email exists") {
                        props.toastWarn(MSG.CUSTOM("User with provided mail already exist",VARIANT.ERROR));
                    } else if (data === "fail") {
                        if (action === "create") click();
                        else edit();
                        props.toastError(MSG.CUSTOM("Failed to " + action + " user.", VARIANT.ERROR));
                    }
                    else if (/^2[0-4]{8}$/.test(data)) {
                        if (JSON.parse(JSON.stringify(data)[1])) {
                            props.toastError(MSG.CUSTOM("Failed to " + action + " user. Invalid Request!", VARIANT.ERROR));
                            return;
                        }
                        var errfields = [];
                        let hints = 'Hint:';
                        if (JSON.parse(JSON.stringify(data)[2])) errfields.push("User Name");
                        if (JSON.parse(JSON.stringify(data)[3])) errfields.push("First Name");
                        if (JSON.parse(JSON.stringify(data)[4])) errfields.push("Last Name");
                        if (JSON.parse(JSON.stringify(data)[5])) errfields.push("Password");
                        if (JSON.parse(JSON.stringify(data)[6])) errfields.push("Email");
                        if (JSON.parse(JSON.stringify(data)[7])) errfields.push("Authentication Server");
                        if (JSON.parse(JSON.stringify(data)[8])) errfields.push("User Domain Name");
                        if (JSON.stringify(data)[5] === '1') hints += " Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.";
                        if (JSON.stringify(data)[5] === '2') hints += " Password provided does not meet length, complexity or history requirements of application.";
                        props.toastWarn(MSG.CUSTOM("Following values are invalid: " + errfields.join(", ") + " " + hints, VARIANT.WARNING));
                    }
                }
                else {
                    var data = await createMulitpleLdapUsers(action, ldapUserList);
                    setLoading(false);
                    console.log('ldapMultiUser', data);
                    let errorMsg = ''
                    let iceProvisonUserData = []
                    data.map((user, index )=> {
                        if(user.rows.status === "success"){
                            iceProvisonUserData.push({...ldapIceProvisionUserList[index], userid : user.rows.userData.uid})
                        }
                        else if(user.rows === 'exists'){
                            errorMsg = errorMsg + ldapIceProvisionUserList[index].username + ", "
                        }
                    })
                    setLdapIceProvisionUserList(iceProvisonUserData);
                    if(errorMsg !== ''){
                        props.toastError(MSG.CUSTOM(errorMsg +" these users are already exists", VARIANT.ERROR));
                    }
                    if(iceProvisonUserData.length > 0) setSelectedTab("avoAzzureClient")
                }
            }
            catch (error) {
                props.toastError(MSG.CUSTOM("Failed to " + action + " user.", VARIANT.ERROR));
            }
        })()
    }

    //Validate Input Fields Before Doing Action
    const validate = ({ action, userName, lastname, firstname, passWord, email, role, addRole, type }) => {
        var flag = true;
        setUserNameAddClass(false); setfirstnameAddClass(false); setLastnameAddClass(false); setPasswordAddClass(false);
        setConfirmPasswordAddClass(false); setEmailAddClass(false); setLdapDirectoryAddClass(false); setUserIdNameAddClass(false);
        setUserRolesAddClass(false); setConfServerAddClass(false);
        //eslint-disable-next-line
        var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
        var popupOpen = false;
        // eslint-disable-next-line
        var reg = /^[a-zA-Z0-9\.\@\-\_]+$/;

        if (userIdNameAddClass);
        if (userName === "" || !ValidationExpression(userName, "validName")) {
            var nameErrorClass = (action === "update") ? "selectErrorBorder" : "inputErrorBorder";
            if (nameErrorClass === "selectErrorBorder") setUserNameAddClass("setUserNameAddClass");
            else setUserNameAddClass(true)
            flag = false;
        } else if (!reg.test(userName)) {
            if (!popupOpen) {
                props.toastWarn(MSG.ADMIN.WARN_USERNAME_SPECHAR);
            }
            popupOpen = true;
            setUserNameAddClass(true);
            flag = false;
        }
        if (userIdName === "" && action === "update") {
            setUserIdNameAddClass(true);
            flag = false;
        }
        if (firstname === "") {
            setfirstnameAddClass(true);
            flag = false;
        }
        if (lastname === "") {
            setLastnameAddClass(true);
            flag = false;
        }
        if (type !== "inhouse") {
            if (server === "") {
                setConfServerAddClass("selectErrorBorder");
                flag = false;
            }
            if (confExpired && action !== "delete") {
                if (!popupOpen) {
                    props.toastWarn(MSG.ADMIN.WARN_CONFIG_INVALID);
                }
                popupOpen = true;
                setConfServerAddClass("selectErrorBorder");
                flag = false;
            }
        }
        if (type === "ldap" && ldapFetchUsersData.length <= 0) {
            setLdapDirectoryAddClass("selectErrorBorder");
            flag = false;
        }
        if (type === "inhouse" && action !== "delete" && !(action === "update" && passWord === "" && confirmPassword === "")) {
            if (passWord === "") {
                setPasswordAddClass(true);
                flag = false;
            } else if (!regexPassword.test(passWord)) {
                if (!popupOpen) {
                    props.toastWarn(MSG.ADMIN.WARN_PASSWORD);
                }
                popupOpen = true;
                setPasswordAddClass(true);
                flag = false;
            }
            if (confirmPassword === "") {
                setConfirmPasswordAddClass(true);
                flag = false;
            } else if (!regexPassword.test(confirmPassword)) {
                if (!popupOpen) {
                    props.toastWarn(MSG.ADMIN.WARN_PASSWORD);
                }
                popupOpen = true;
                setConfirmPasswordAddClass(true);
                flag = false;
            }
            if (passWord !== confirmPassword) {
                if (!popupOpen) {
                    props.toastWarn(MSG.ADMIN.WARN_UNMATCH_PASSWORD);
                }
                popupOpen = true;
                setConfirmPasswordAddClass(true);
                flag = false;
            }
        }
        if (email === "") {
            setEmailAddClass(true);
            flag = false;
        } else if (!emailRegEx.test(email)) {
            if (!popupOpen) {
                props.toastWarn(MSG.ADMIN.WARN_INVALID_EMAIL);
            }
            popupOpen = true;
            setEmailAddClass(true);
            flag = false;
        }
        if (role === "") {
            setUserRolesAddClass("selectErrorBorder");
            flag = false;
        }
        if (userName === "" || firstname === "" || lastname === "" || email === "" || role === "") {
            if(!editUser){
                props.toastWarn(MSG.ADMIN.WARN_REQUIRED_FIELD);            
            }
        }
        return flag;
    };

    //Clear Input values and red Borders( if any)
    const click = (props) => {
        setUserNameAddClass(false);
        setfirstnameAddClass(false);
        setLastnameAddClass(false);
        setEmailAddClass(false);
        setPasswordAddClass(false);
        setConfServerAddClass(false);
        setConfirmPasswordAddClass(false);
        setUserRolesAddClass(false);
        setConfServerAddClass(false);
        setUserIdNameAddClass(false);
        setLdapDirectoryAddClass(false);

        setLdapUserList(ldapUserListInitial);
        if (!editUser) dispatch(AdminActions.RESET_VALUES(""))
        updateUserRoles();

        if (props !== undefined && props.query !== undefined && props.query !== "retaintype") {
            dispatch(AdminActions.UPDATE_TYPE("inhouse"));
            dispatch(AdminActions.UPDATE_SERVER(""));
            dispatch(AdminActions.UPDATE_LDAP({ fetch: "map", user: '' }));
            dispatch(AdminActions.UPDATE_CONF_SERVER_LIST([]));
            dispatch(AdminActions.UPDATE_LDAP_ALLUSER_LIST([]));
        }
    };

    //Switch between multiple Usertypes
    const selectUserType = async (props) => {
        dispatch(AdminActions.UPDATE_SERVER(""))
        dispatch(AdminActions.UPDATE_CONF_SERVER_LIST([]))
        if (props.type === "ldap") {
            populateLDAPConf();
        }
        else if (props.type === "saml") populateSAMLConf();
        else if (props.type === "oidc") populateOIDCConf();
    }

    const populateLDAPConf = async () => {

        dispatch(AdminActions.UPDATE_LDAP({ fetch: "map", user: '' }))
        dispatch(AdminActions.UPDATE_NO_CREATE(true));
        setLoading("Fetching LDAP Server configurations...");
        var data = await getLDAPConfig("server");
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        if (data === "empty") {
            props.toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
        } else {
            dispatch(AdminActions.UPDATE_NO_CREATE(false));
            data.sort((a, b) => a.name.localeCompare(b.name));
            dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data));
        }
    }

    const populateSAMLConf = () => {
        (async () => {
            dispatch(AdminActions.UPDATE_NO_CREATE(true));
            setLoading("Fetching SAML Server configurations...");
            var data = await getSAMLConfig();
            if (data.error) { displayError(data.error); return; }
            setLoading(false);
            if (data === "empty") {
                props.toastWarn(MSG.ADMIN.WARN_SAML_CONFIGURE);
            } else {
                dispatch(AdminActions.UPDATE_NO_CREATE(false));
                data.sort();
                dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data))
            }
        })()
    }

    const populateOIDCConf = () => {
        (async () => {
            dispatch(AdminActions.UPDATE_NO_CREATE(true))
            setLoading("Fetching OpenID Server configurations...");
            var data = await getOIDCConfig();
            if (data.error) { displayError(data.error); return; }
            setLoading(false);
            if (data === "empty") {
                props.toastWarn(MSG.ADMIN.WARN_OPENID_CONFIGURE);
            } else {
                dispatch(AdminActions.UPDATE_NO_CREATE(false))
                data.sort((a, b) => a.name.localeCompare(b.name));
                dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data))
            }
        })()
    }

    const ldapSwitchFetch = async ({ userConf_ldap_fetch, serverName }) => {
        dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(""))
        dispatch(AdminActions.UPDATE_LDAP_USER(""))
        clearForm(true);
        setLdapDirectoryAddClass(false);
        if (userConf_ldap_fetch !== "import") return false;
        const ldapServer = serverName;
        dispatch(AdminActions.UPDATE_NO_CREATE(true))
        dispatch(AdminActions.UPDATE_LDAP_ALLUSER_LIST([]))
        setLoading("Fetching LDAP users...");
        const data = await getLDAPConfig("user", ldapServer);
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        if (data === "empty") {
            props.toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
        }
        else if (data !== undefined) {
            dispatch(AdminActions.UPDATE_NO_CREATE(false))
            data.sort();
            const ldapAllUserList = data.map(e => ({ value: e[1], html: e[0] }));
            dispatch(AdminActions.UPDATE_LDAP_ALLUSER_LIST(ldapAllUserList))
            setLdapUserList([...ldapAllUserList]);
            setLdapUserListInitial([...ldapAllUserList]);
        }
    }

    const clearForm = (retainExtra) => {
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(""))
        dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(""))
        dispatch(AdminActions.UPDATE_INPUT_LASTNAME(""))
        dispatch(AdminActions.UPDATE_INPUT_EMAIL(""))
        if (!retainExtra && type === "ldap") {
            dispatch(AdminActions.UPDATE_LDAP({ fetch: "map", user: '' }))
        }
    };

    //Fetch LDAP User detail
    const ldapGetUser = async (input) => {
        let ldapUser = ldap.user;
        if (input !== undefined) {
            ldapUser = input.luser;
        }
        const ldapServer = server;
        dispatch(AdminActions.UPDATE_NO_CREATE(true))
        if (ldapUser === '') {
            setLdapDirectoryAddClass(true);
            return;
        }
        clearForm(true);
        setLoading("Fetching User details...");
        const data = await getLDAPConfig("user", ldapServer, ldapUser);
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        if (data === "empty") {
            props.toastWarn(MSG.ADMIN.WARN_NO_USER_FOUND);
        } else {
            dispatch(AdminActions.UPDATE_LDAP_DATA([...ldapFetchUsersData, ...data]));
        }
    }

    //load Users for Edit
    const edit = async (props) => {
        click();
        dispatch(AdminActions.UPDATE_TYPE("inhouse"));
        dispatch(AdminActions.UPDATE_FTYPE("Default"));
        setLoading("Fetching users...");
        var data = await getUserDetails("user");
        if (data.error) { displayError(data.error); return; }
        else {
            setLoading(false);
            data.sort();
            dispatch(AdminActions.UPDATE_ALL_USERS_LIST(data));
            // setAllUserFilList(data);
        }
    }


    const searchFunctionLdap = async (val) => {
        let items = [];
        items = ldapUserListInitial.filter((e) => e.html.toUpperCase().indexOf(val.toUpperCase()) !== -1)
        setLdapUserList(items);
    }

    const passwordChange = (value) => {
        value = ValidationExpression(value, "password")
        dispatch(AdminActions.UPDATE_INPUT_PASSWORD(value))
        {("" === value) ? setUpdatedInfo(true) : setUpdatedInfo(false)}
    }

    const confirmPasswordChange = (value) => {
        value = ValidationExpression(value, "password")
        dispatch(AdminActions.UPDATE_INPUT_CONFIRMPASSWORD(value))
        {("" === value) ? setUpdatedInfo(true) : setUpdatedInfo(false)}
    }

    const emailChange = (value) => {
        value = ValidationExpression(value, "email")
        dispatch(AdminActions.UPDATE_INPUT_EMAIL(value))
        {(email === value || value === props?.editUserData?.email) ? setUpdatedInfo(true) : setUpdatedInfo(false)}
    }

    const roleChange = (value) =>{
        {(role === value || value === props?.editUserData?.roleId) ?  setUpdatedInfo(true) : setUpdatedInfo(false)} 
    }

    const createUserDialogHide = () => {
        dispatch(AdminActions.UPDATE_INPUT_PASSWORD(""));
        dispatch(AdminActions.UPDATE_INPUT_CONFIRMPASSWORD(""));
        dispatch(AdminActions.UPDATE_USERROLE(""));
        props.setCreateUserDialog(false);
        props.setRefreshUserList(!props.refreshUserList);
        setRoleDropdownValue("");
        setSelectedTab("userDetails");
        setAdminCheck(false);
        if(editUser) {
            props.reloadData();
            dispatch(AdminActions.EDIT_USER(false));
        }
        setUserNameAddClass(false);
        setfirstnameAddClass(false);
        setLastnameAddClass(false);
        setConfirmPasswordAddClass(false); 
        setPasswordAddClass(false);
        setEmailAddClass(false);
        setUserRolesAddClass(false);
    }

    const userCreateHandler = () => {
        props.toast.current.clear();
        createUserDialogHide();
    }

    const createUserFooter = () => <>
        <Button
            data-test="cancelButton"
            label="Cancel"
            text
            onClick={() => {
                editUser ? createUserDialogHide() :  userCreateHandler();
            }}
            size="small"
        >
        </Button>
        {(selectedTab === "userDetails") && <Button
            data-test="createButton"
            label={editUser ? "Update" : "Create"}
            onClick={() => {
                editUser ? manage({ action: "update" }) : manage({ action: "create" });
            }}
            disabled={editUser ? updatedInfo : false}
            size="small"
            >
            {editUser ? "" : <i className="m-1 pi pi-arrow-right"/>}
        </Button>}
    </>



    return (
        <Fragment>
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Dialog
                visible={props.createUserDialog}
                onHide={createUserDialogHide}
                footer={createUserFooter}
                header={editUser ? "Edit User" : "Create User"}
                style={editUser && (selectedTab === "avoAzzureClient") ? { width: "66.06rem" } : { width: "50.06rem" }}
                position='centre'
            >
                <TabMenu model={tabHeader} activeIndex={tabHeader.findIndex((item) => item.key === selectedTab)} onTabChange={(e) => setSelectedTab(tabHeader[e.index].key)} />
                {selectedTab === "userDetails" && <div data-test="create__container" className="createUser-container">
                    {/* <div data-test="heading" id="page-taskName"><span>{(showEditUser === false) ? "Create User" : "Edit User"}</span></div> */}

                    <CreateLanding displayError={displayError} firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass} setEmailAddClass={setEmailAddClass} emailAddClass={emailAddClass}
                        ldapSwitchFetch={ldapSwitchFetch} userNameAddClass={userNameAddClass} setShowDropdown={setShowDropdown}
                        ldapUserList={ldapUserList} searchFunctionLdap={searchFunctionLdap} ldapDirectoryAddClass={ldapDirectoryAddClass}
                        confServerAddClass={confServerAddClass} clearForm={clearForm} setShowEditUser={setShowEditUser}
                        ldapGetUser={ldapGetUser} click={click} edit={edit} manage={manage} selectUserType={selectUserType} setShowDropdownEdit={setShowDropdownEdit} 
                        showDropdownEdit={showDropdownEdit} showDropdown={showDropdown} emailChange={emailChange} primaryRoles={allRolesUpdate}
                        ldapSelectedUserList={ldapSelectedUserList} setLdapSelectedUserList={setLdapSelectedUserList} updatedInfo={updatedInfo} setUpdatedInfo={setUpdatedInfo} editUserData={props.editUserData} setEditUserData={props.setEditUserData}/>

                    <div style={{ paddingLeft: '1.5rem' }}>
                        {(type === "inhouse") ?
                            <Fragment>
                                <div className='flex flex-row justify-content-between pl-2 pb-2' >
                                    <div className="flex flex-column">
                                        <label htmlFor="username" className="pb-2 font-medium">Password <span style={{ color: "#d50000" }}>*</span></label>
                                        <div className="p-input-icon-right">
                                            <Tooltip target='.eyeIcon1' content={showNewPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                                            <i
                                                className={`eyeIcon1 cursor-pointer ${showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}`}
                                                onClick={() => { setShowNewPassword(!showNewPassword) }}
                                            />
                                            <InputText
                                                data-test="password"
                                                value={passWord}
                                                className={`w-full md:w-20rem p-inputtext-sm ${passwordAddClass ? 'inputErrorBorder' : ''}`}
                                                onChange={(event) => { passwordChange(event.target.value) }}
                                                type={showNewPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                name="passWord"
                                                id="password"
                                                maxLength="16"
                                                placeholder='Enter Password'
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-column">
                                        <label htmlFor="username" className="pb-2 font-medium">Confirm Password <span style={{ color: "#d50000" }}>*</span></label>
                                        <div className="p-input-icon-right">
                                            <Tooltip target='.eyeIcon2' content={showConfirmPassword ? 'Hide Password' : 'Show Password'} position='bottom' />
                                            <i
                                                className={`eyeIcon2 cursor-pointer ${showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'}`}
                                                onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                                            />
                                            <InputText
                                                data-test="confirmPassword"
                                                value={confirmPassword}
                                                onFocus={() => setConfirmPasswordFocus(true)}
                                                className={`w-full md:w-20rem p-inputtext-sm ${confirmPasswordAddClass || ( confirmPasswordFocus && passWord !== confirmPassword ) ? 'inputErrorBorder' : '' }`}
                                                onChange={(event) => { confirmPasswordChange(event.target.value) }}
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                name='confirmPassword'
                                                id='confirmPassword'
                                                maxLength="16"
                                                placeholder='Enter Confirm Password'
                                            />
                                        </div>
                                    </div>
                                </div>

                            </Fragment>
                            : null
                        }

                        {type !== "ldap" && <div className="flex flex-row items-center">
                            <div className="flex flex-column">
                                <label data-test="primaryRoleLabel" className='pb-2 font-medium' style={{ paddingLeft: '0.7rem' }}>Primary Role <span style={{ color: "#d50000" }}>*</span></label>
                                <Dropdown
                                    data-test="primaryRoleDropdown"
                                    id="userRoles"
                                    defaultValue={""}
                                    value={roleDropdownValue}
                                    options={allRolesUpdate}
                                    optionLabel="name"
                                    className= {`w-full md:w-20rem p-inputtext-sm ${userRolesAddClass ? 'inputErrorBorder' : ''}`}
                                    placeholder='Select Role'
                                    onChange={(event) => { setRoleDropdownValue(event.target.value); dispatch(AdminActions.UPDATE_USERROLE(event.target.value)); roleChange(event.target.value)}}
                                    // disabled={editUser}
                                />
                            </div>
                            {/* Admin Check */}
                            {roleDropdownValue === "5db0022cf87fdec084ae49ab" && (
                                <div className="flex flex-column items-center secondaryRole_admin"> {/* Test Manager role ID */}
                                    <label htmlFor="admin_check" className="adminlable_header pb-3 font-medium">Secondary Role</label>
                                    <Checkbox inputId='admin_check' aria-label="admin_check" onChange={e => setAdminCheck(e.checked)} checked={adminCheck} />
                                    <label htmlFor="admin_check" className="ml-5 -mt-4">Admin</label>
                                </div>
                            )}
                        </div>}
                    </div>
                </div>}
                {selectedTab === "avoAzzureClient" && <IceProvision editUserIceProvision={props.editUserData}
                    setEditUserIceProvision={props.setEditUserData}
                    userName={userNameForIceToken}
                    toastError={props.toastError}
                    toastSuccess={props.toastSuccess}
                    toast={props.toast} 
                    ldapIceProvisionUserList={ldapIceProvisionUserList}
                    createUserDialogHide={createUserDialogHide} 
                    setLdapIceProvisionUserList={setLdapIceProvisionUserList}/>}
            </Dialog>
        </Fragment>
    );
}

export default CreateUser;

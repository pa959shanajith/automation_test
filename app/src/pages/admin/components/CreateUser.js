import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenOverlay, ScrollBar, VARIANT, Messages as MSG, ValidationExpression } from '../../global'
import { getUserRoles, manageUserDetails, getLDAPConfig, getSAMLConfig, getOIDCConfig, getUserDetails, fetchICE, manageSessionData } from '../api';
// impofrom '../state/actio';
import '../styles/CreateUser.scss'
import CreateLanding from '../components/CreateLanding';
import EditLanding from '../components/EditLanding';
import useOnClickOutside from '../components/UseOnClickOutside'
import { Toast } from 'primereact/toast';
import { AdminActions } from '../adminSlice';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import TokenManagement from '../containers/TokenMangement';
import { Checkbox } from 'primereact/checkbox';
import IceProvision from '../containers/IceProvision';


/*Component CreateUser
  use: defines Admin middle Section for create user
  ToDo:
*/

const CreateUser = (props) => {
    const dispatch = useDispatch();
    // const userConf = useSelector(state => state.admin.userConf)
    const node = useRef();
    const toast = useRef();
    const [toggleAddRoles, setToggleAddRoles] = useState(false)
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
    const nocreate = useSelector(state => state.admin.nocreate)
    const [showEditUser, setShowEditUser] = useState(false);
    const [allRolesUpdate, setAllRolesUpdate] = useState([]);
    const [roleDropdownValue, setRoleDropdownValue] = useState("");
    const [userCreateDialog, setUserCreateDialog] = useState(props.userCreateDialog);
    const [selectedTab, setSelectedTab] = useState('userDetails');
    const [userNameForIceToken, setUserNameForIceToken] = useState('');
    // const [userIdforIceToken, setUserIdForIceToken] = useState('');
    const [adminCheck, setAdminCheck] = useState(false);

    useEffect(() => {
        click();
        dispatch(AdminActions.UPDATE_TYPE("inhouse"));
        // if (currentTab === "users") setCreateUserDialog(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab === "users"]);


    useEffect(() => {
        let allRolesList = [];
        if (allRoles.length) {
            allRoles.map(role => {
                let roleObject = {};
                if (role[0] !== "Admin") {
                    roleObject.name = role[0];
                    roleObject.value = role[1];
                    allRolesList.push(roleObject);
                }
            })
            setAllRolesUpdate(allRolesList);
        }
    }, [allRoles.length > 0]);

    const tabHeader = [
        { label: 'User Details', key: 'userDetails', text: 'User Details' },
        { label: 'Avo Assure Client Provision', key: 'avoAzzureClient', text: 'Avo Assure Client Provision' },
    ];

    useOnClickOutside(node, () => setToggleAddRoles(false));

    const displayError = (error) => {
        setLoading(false)
        toastError(error)
    }

    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            // toast.current.show({severity:'warn', summary: 'Warning', detail:'Message Content', life: 3000});

            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
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
    const manage = (props) => {
        setUserNameForIceToken(userName);
        const action = props.action;
        if (!validate({ action: action })) return;
        const bAction = action.charAt(0).toUpperCase() + action.substr(1);
        const uType = type;
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
            isAdminUser: adminCheck // if user is Test Manager, she/he has the Admin rights and it is optional
        };
        if (uType === "ldap") userObj.ldapUser = ldap.user;
        setLoading(bAction.slice(0, -1) + "ing User...");

        (async () => {
            try {
                var data = await manageUserDetails(action, userObj);
                if (data.error) { displayError(data.error); return; }
                setLoading(false);
                if (data === "success") {
                    if (action === "create") { click(); setSelectedTab("avoAzzureClient") }
                    else edit();
                    // toastSuccess(MSG.CUSTOM("User " + action + "d successfully!", VARIANT.SUCCESS));
                    if (action === "delete") {
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
                    toastWarn(MSG.ADMIN.WARN_USER_EXIST);
                } else if (data === "fail") {
                    if (action === "create") click();
                    else edit();
                    toastError(MSG.CUSTOM("Failed to " + action + " user.", VARIANT.ERROR));
                }
                else if (/^2[0-4]{8}$/.test(data)) {
                    if (JSON.parse(JSON.stringify(data)[1])) {
                        toastError(MSG.CUSTOM("Failed to " + action + " user. Invalid Request!", VARIANT.ERROR));
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
                    toastWarn(MSG.CUSTOM("Following values are invalid: " + errfields.join(", ") + " " + hints, VARIANT.WARNING));
                }
            }
            catch (error) {
                toastError(MSG.CUSTOM("Failed to " + action + " user.", VARIANT.ERROR));
            }
        })()
    }

    //Validate Input Fields Before Doing Action
    const validate = ({ action }) => {
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
                toastWarn(MSG.ADMIN.WARN_USERNAME_SPECHAR);
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
                    toastWarn(MSG.ADMIN.WARN_CONFIG_INVALID);
                }
                popupOpen = true;
                setConfServerAddClass("selectErrorBorder");
                flag = false;
            }
        }
        if (type === "ldap" && ldap.user === "") {
            setLdapDirectoryAddClass("selectErrorBorder");
            flag = false;
        }
        if (type === "inhouse" && action !== "delete" && !(action === "update" && passWord === "" && confirmPassword === "")) {
            if (passWord === "") {
                setPasswordAddClass(true);
                flag = false;
            } else if (!regexPassword.test(passWord)) {
                if (!popupOpen) {
                    toastWarn(MSG.ADMIN.WARN_PASSWORD);
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
                    toastWarn(MSG.ADMIN.WARN_PASSWORD);
                }
                popupOpen = true;
                setConfirmPasswordAddClass(true);
                flag = false;
            }
            if (passWord !== confirmPassword) {
                if (!popupOpen) {
                    toastWarn(MSG.ADMIN.WARN_UNMATCH_PASSWORD);
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
                toastWarn(MSG.ADMIN.WARN_INVALID_EMAIL);
            }
            popupOpen = true;
            setEmailAddClass(true);
            flag = false;
        }
        if (role === "") {
            setUserRolesAddClass("selectErrorBorder");
            flag = false;
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
        dispatch(AdminActions.RESET_VALUES(""))
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
            toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
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
                toastWarn(MSG.ADMIN.WARN_SAML_CONFIGURE);
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
                toastWarn(MSG.ADMIN.WARN_OPENID_CONFIGURE);
            } else {
                dispatch(AdminActions.UPDATE_NO_CREATE(false))
                data.sort((a, b) => a.name.localeCompare(b.name));
                dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data))
            }
        })()
    }

    const ldapSwitchFetch = async ({ userConf_ldap_fetch }) => {
        dispatch(AdminActions.UPDATE_LDAP_USER_FILTER(""))
        dispatch(AdminActions.UPDATE_LDAP_USER(""))
        clearForm(true);
        setLdapDirectoryAddClass(false);
        if (userConf_ldap_fetch !== "import") return false;
        const ldapServer = server;
        dispatch(AdminActions.UPDATE_NO_CREATE(true))
        dispatch(AdminActions.UPDATE_LDAP_ALLUSER_LIST([]))
        setLoading("Fetching LDAP users...");
        const data = await getLDAPConfig("user", ldapServer);
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        if (data === "empty") {
            toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
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
    const ldapGetUser = async (props) => {
        let ldapUser = ldap.user;
        if (props !== undefined) {
            ldapUser = props.luser;
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
            toastWarn(MSG.ADMIN.WARN_NO_USER_FOUND);
        } else {
            dispatch(AdminActions.UPDATE_LDAP_DATA(data))
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
            setAllUserFilList(data);
        }
    }

    const getUserData = async (props) => {
        const userObj = props.user_idName.split(';');
        dispatch(AdminActions.UPDATE_USERID(userObj)[0]);
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(userObj)[1]);
        setLoading("Fetching User details...");
        try {
            const data = await getUserDetails("userid", userObj[0]);
            if (data.error) { displayError(data.error); return; }
            else {
                setLoading(false);
                const uType = data.type;
                dispatch(AdminActions.UPDATE_DATA(data));
                dispatch(AdminActions.UPDATE_ADDROLES({}))
                data.addrole.forEach((e) => dispatch(AdminActions.ADD_ADDROLE(e)));
                dispatch(AdminActions.UPDATE_FTYPE((uType) === "inhouse") ? "Default" : ((uType === "oidc") ? "OpenID" : uType.toUpperCase()));

                if (data.type !== "inhouse") {
                    var confserver = data.server;
                    dispatch(AdminActions.UPDATE_SERVER(""))
                    dispatch(AdminActions.UPDATE_CONF_SERVER_LIST([]))
                    if (data.type === "ldap") {
                        dispatch(AdminActions.UPDATE_LDAP({ fetch: "map", user: '' }));
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching LDAP Server configurations...");
                        var data1 = await getLDAPConfig("server");
                        if (data1.error) { displayError(data1.error); return; }
                        setLoading(false);
                        if (data1 === "empty") {
                            toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false));
                            data1.sort((a, b) => a.name.localeCompare(b.name));
                            dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data1));
                        }
                    }
                    else if (data.type === "saml") {
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching SAML Server configurations...");
                        data1 = await getSAMLConfig();
                        if (data1.error) { displayError(data1.error); return; }
                        setLoading(false);
                        if (data === "empty") {
                            toastWarn(MSG.ADMIN.WARN_SAML_CINFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false))
                            data1.sort();
                            dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data1))
                        }
                    }
                    else if (data.type === "oidc") {
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching OpenID Server configurations...");
                        data1 = await getOIDCConfig();
                        if (data1.error) { displayError(data1.error); return; }
                        setLoading(false);
                        if (data1 === "empty") {
                            toastWarn(MSG.ADMIN.WARN_OPENID_CONFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false))
                            data1.sort((a, b) => a.name.localeCompare(b.name));
                            dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(data1))
                        }
                    }
                    if (!data1.some(function (e) { return e.name === confserver; })) {
                        dispatch(AdminActions.UPDATE_CONF_SERVER_LIST_PUSH({ _id: '', name: confserver }));
                        dispatch(AdminActions.UPDATE_CONF_EXP(confserver));
                    }
                    dispatch(AdminActions.UPDATE_SERVER(confserver));
                    dispatch(AdminActions.UPDATE_LDAP_USER(data).ldapuser || '');
                }
            }
        } catch (error) {
            setLoading(false);
            toastError(MSG.ADMIN.ERR_FETCH_USER_DETAILS);
        }
    }

    const searchFunctionUser = async (val) => {
        setShowDropdownEdit(true);
        const items = allUsersList.filter((e) => e[0].toUpperCase().indexOf(val.toUpperCase()) !== -1)
        setAllUserFilList(items);
    }

    const searchFunctionLdap = async (val) => {
        let items = [];
        items = ldapUserListInitial.filter((e) => e.html.toUpperCase().indexOf(val.toUpperCase()) !== -1)
        setLdapUserList(items);
    }

    const passwordChange = (value) => {
        value = ValidationExpression(value, "password")
        dispatch(AdminActions.UPDATE_INPUT_PASSWORD(value))
    }

    const confirmPasswordChange = (value) => {
        value = ValidationExpression(value, "password")
        dispatch(AdminActions.UPDATE_INPUT_CONFIRMPASSWORD(value))
    }

    const emailChange = (value) => {
        value = ValidationExpression(value, "email")
        dispatch(AdminActions.UPDATE_INPUT_EMAIL(value))
    }

    const userCreateHandler = async () => {
        toastSuccess(MSG.CUSTOM("User created successfully!", VARIANT.SUCCESS));
    }

    const createUserFooter = () => <>
        <Button
            data-test="cancelButton"
            label="Cancel"
            disabled={selectedTab === "avoAzzureClient"}
            text
            onClick={() => props.setUserCreateDialog(false)}
        >
        </Button>
        {selectedTab === "userDetails" && <Button
            data-test="createButton"
            label="Next"
            onClick={() => { manage({ action: "create" }); }}
            disabled={nocreate}>
        </Button>}
        {selectedTab === "avoAzzureClient" && <Button
            data-test="createButton"
            label={"Create"}
            onClick={() => userCreateHandler()}
            disabled={nocreate}>
        </Button>}
    </>

    const createUserDialogHide = () => {
        // setUserCreateDialog(false);
        props.setCreateUserDialog(false);
    }

    return (
        <Fragment>
            <Toast ref={toast} position={"bottom-center"} style={{ maxWidth: "50rem" }} baseZIndex={1300} />
            {loading ? <ScreenOverlay content={loading} /> : null}

            <Dialog
                visible={props.createUserDialog}
                onHide={createUserDialogHide}
                footer={createUserFooter}
                header={"Create User"}
                style={{ width: "50.06rem" }}
                position='centre'
            >
                <TabMenu model={tabHeader} activeIndex={tabHeader.findIndex((item) => item.key === selectedTab)} onTabChange={(e) => setSelectedTab(tabHeader[e.index].key)} />
                {selectedTab === "userDetails" && <div data-test="create__container" className="createUser-container">
                    {/* <div data-test="heading" id="page-taskName"><span>{(showEditUser === false) ? "Create User" : "Edit User"}</span></div> */}

                    {(showEditUser === false) ?
                        <CreateLanding displayError={displayError} firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass}
                            ldapSwitchFetch={ldapSwitchFetch} userNameAddClass={userNameAddClass} setShowDropdown={setShowDropdown}
                            ldapUserList={ldapUserList} searchFunctionLdap={searchFunctionLdap} ldapDirectoryAddClass={ldapDirectoryAddClass}
                            confServerAddClass={confServerAddClass} clearForm={clearForm} setShowEditUser={setShowEditUser}
                            ldapGetUser={ldapGetUser} click={click} edit={edit} manage={manage} selectUserType={selectUserType} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} showDropdown={showDropdown} />
                        : <EditLanding displayError={displayError} firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass}
                            confServerAddClass={confServerAddClass} ldapGetUser={ldapGetUser} ldapDirectoryAddClass={ldapDirectoryAddClass} clearForm={clearForm}
                            allUserFilList={allUserFilList} manage={manage} setAllUserFilList={setAllUserFilList} searchFunctionUser={searchFunctionUser}
                            click={click} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} getUserData={getUserData} />
                    }

                    <div style={{ paddingLeft: '1.5rem' }}>
                        {(type === "inhouse") ?
                            <Fragment>
                                <div className='flex flex-row justify-content-between pl-2 pb-2' >
                                    <div className="flex flex-column">
                                        <label htmlFor="username" className="pb-2 font-medium">Password</label>
                                        <InputText
                                            data-test="password"
                                            value={passWord}
                                            className='w-full md:w-20rem'
                                            onChange={(event) => { passwordChange(event.target.value) }}
                                            type="password"
                                            autoComplete="new-password"
                                            name="passWord"
                                            id="password"
                                            maxLength="16"
                                            placeholder='Enter Password'
                                        />
                                    </div>
                                    <div className="flex flex-column">
                                        <label htmlFor="username" className="pb-2 font-medium">Confirm Password</label>
                                        <InputText
                                            data-test="confirmPassword"
                                            value={confirmPassword}
                                            className='w-full md:w-20rem'
                                            onChange={(event) => { confirmPasswordChange(event.target.value) }}
                                            type="password"
                                            autoComplete="new-password"
                                            name='confirmPassword'
                                            id='confirmPassword'
                                            maxLength="16"
                                            placeholder='Enter Confirm Password'
                                        />
                                    </div>
                                </div>

                            </Fragment>
                            : null
                        }

                        {/* PRESENT FOR EACH USERTYPE */}
                        <div className='flex flex-column pl-2 pb-2'>
                            <label htmlFor="username" className="pb-2 font-medium">Email Id</label>
                            <InputText
                                data-test="email"
                                value={email}
                                onChange={(event) => { emailChange(event.target.value) }}
                                autoComplete="off"
                                name="email"
                                id="email"
                                className='w-full md:w-20rem'
                                maxLength="100"
                                placeholder="Enter Email Id"
                            />

                        </div>
                        <div className="flex flex-column " >
                            <label data-test="primaryRoleLabel" className='pb-2 font-medium' style={{ paddingLeft: '0.7rem' }}>Primary Role</label>
                            <Dropdown
                                data-test="primaryRoleDropdown"
                                id="userRoles"
                                defaultValue={""}
                                value={roleDropdownValue}
                                options={allRolesUpdate}
                                optionLabel="name"
                                className='w-full md:w-20rem'
                                placeholder='Select Role'
                                // disabled={props.showEditUser === true}
                                onChange={(event) => { setRoleDropdownValue(event.target.value); dispatch(AdminActions.UPDATE_USERROLE(event.target.value)) }}
                            // style={(props.showEditUser === true) ? { backgroundColor: "#eee", cursor: "not-allowed" } : {}}
                            />
                        </div>
                        {/* Admin Check */}
                        {roleDropdownValue === "5db0022cf87fdec084ae49ab" && <div className="flex flex-row "> {/* Test Manager role ID */}
                            <Checkbox inputId='admin_check' aria-label="admin_check" className='adminCheckbox' onChange={e => setAdminCheck(e.checked)} checked={adminCheck} />
                            <label htmlFor="admin_check" className=" adminlable">Admin</label>
                        </div>}
                        {/* 
                {( rolename!=='Admin' && props.showEditUser === true  && userIdName!=='')?
                    <div  className="col-xs-6 selectRole" >
                        <label className="leftControl primaryRole" id="additionalRoleTxt">Additional Role: </label>
                        <label className="chooseRole dropdown-toggle" id="additionalRole_options" data-toggle="dropdown" onClick={()=>{setToggleAddRoles(!toggleAddRoles)}} title="Select Additional Role">Select Additional Role</label>
                        {(toggleAddRoles===true)?
                            <ul ref={node} className="dropdown-menu-multiselect" id="additionalRoles" >
                                
                                {allAddRoles.map((arid,index) => (  
                                    (arid[1]!==role)? 
                                        <li className='RolesCheck' key={index}  checked={addRole[arid[1]]} onClick={()=>{dispatcEDIT_ADDROLEa(rid[1)]})}>
                                            <span className='rolesSpan'><input className='addcheckBox' name="additionalRole" type='checkbox' checked={addRole[arid[1]]} /><label className='rolesChecklabel'>{arid[0]}</label></span> 
                                        </li>
                                    :null
                                ))}
                            </ul>
                        :null}
                    </div>
                :null} */}

                    </div>
                </div>}
                {selectedTab === "avoAzzureClient" && <IceProvision userName={userNameForIceToken}  toastError={toastError} toastSuccess={toastSuccess}/>}
            </Dialog>
        </Fragment>
    );
}

export default CreateUser;

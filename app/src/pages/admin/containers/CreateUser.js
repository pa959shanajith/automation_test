import React, { Fragment, useState, useEffect , useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {getUserRoles, manageUserDetails, getLDAPConfig, getSAMLConfig, getOIDCConfig, getUserDetails, fetchICE, manageSessionData} from '../api';
import * as actionTypes from '../state/action';
import '../styles/CreateUser.scss'
import CreateLanding from '../components/CreateLanding';
import EditLanding from '../components/EditLanding';
import useOnClickOutside from '../components/UseOnClickOutside'
import ValidationExpression from '../../global/components/ValidationExpression';

/*Component CreateUser
  use: defines Admin middle Section for create user
  ToDo:
*/

const CreateUser = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)
    
    const node = useRef();
    const [toggleAddRoles,setToggleAddRoles] = useState(false)
    const [showDropdown,setShowDropdown] = useState(false)
    const [showDropdownEdit,setShowDropdownEdit] = useState(false)
    const [userNameAddClass,setUserNameAddClass] = useState(false)
    const [firstnameAddClass,setfirstnameAddClass] = useState(false)
    const [lastnameAddClass,setLastnameAddClass] = useState(false)
    const [confirmPasswordAddClass,setConfirmPasswordAddClass] = useState(false)
    const [emailAddClass,setEmailAddClass] = useState(false)
    const [ldapDirectoryAddClass,setLdapDirectoryAddClass] = useState(false)
    const [userIdNameAddClass,setUserIdNameAddClass] = useState(false)
    const [userRolesAddClass,setUserRolesAddClass] = useState(false)
    const [confServerAddClass,setConfServerAddClass] = useState(false)
    const [passwordAddClass,setPasswordAddClass] = useState(false)
    const [allUserFilList,setAllUserFilList] = useState(userConf.allUsersList)
    const [ldapUserList,setLdapUserList] = useState([])
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})
    
    useEffect(()=>{
        
        click();
        dispatch({type:actionTypes.UPDATE_TYPE,payload:"inhouse"});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["createUser"],props.showEditUser,props.MiddleScreen])

    useOnClickOutside(node, () => setToggleAddRoles(false));

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    //Fetch UserRoles
    const updateUserRoles = (props) =>{
        (async()=>{
            var res = await getUserRoles()
            if(res.error){displayError(res.error);return;}
            else if(res!==undefined){
                res.sort(function(a,b){ return a[0] >  b[0]; });
                var allAddRoles = res.filter((e)=> (e[0].toLowerCase() !== "admin"))
                dispatch({type:actionTypes.UPDATE_ALLROLES,payload:res})
                dispatch({type:actionTypes.UPDATE_ALLADDROLES,payload:allAddRoles})
            }
        })()
    }

    //Transaction Activity for Create/ Update/ Delete User button Action
    const manage = (props) =>{
        const action = props.action;
        if (!validate({action:action})) return;
        const bAction = action.charAt(0).toUpperCase() + action.substr(1);
        const uType = userConf.type;
        const addRole = [];
        for (let role in userConf.addRole) {
            if (userConf.addRole[role]) addRole.push(role);
        }
        const createdbyrole = userConf.allRoles.filter((e)=> (e[0].toLowerCase() === "admin"));;
        var userObj = {
            userid: userConf.userId,
            username: userConf.userName.toLowerCase(),
            password: userConf.passWord,
            firstname: userConf.firstname,
            lastname: userConf.lastname,
            email: userConf.email,
            role: userConf.role,
            addRole: addRole,
            type: uType,
            createdbyrole: createdbyrole,
            server: userConf.server
        };
        if (uType==="ldap") userObj.ldapUser = userConf.ldap.user;
        setLoading(bAction.slice(0,-1)+"ing User...");
        
        
        (async()=>{
            try{
                var data = await manageUserDetails(action, userObj);
                if(data.error){displayError(data.error);return;}
                setLoading(false);
                if(data === "success") {
                    if (action === "create") click();
                    else edit();
                    setPopupState({show:true,title:bAction+" User",content:"User "+action+"d successfully!"});
                    if (action === "delete") {
                        const data0 = await manageSessionData('logout', userObj.username, '?', 'dereg')
                        if(data0.error){displayError(data0.error);return;}
                        var data1 = await fetchICE(userObj.userid)
                        if(data1.error){displayError(data1.error);return;}
                        else if (data1.length === 0) return false;
                        const icename = data1[0].icename;
                        var data2 = await manageSessionData('disconnect', icename, '?', 'dereg')
                        if(data2.error){displayError(data2.error);return;}
                    }
                } else if(data === "exists") {
                    setPopupState({show:true,title:bAction+" User",content:"User already Exists!"});
                } else if(data === "fail") {
                    if (action === "create") click();
                    else edit();
                    setPopupState({show:true,title:bAction+" User",content:"Failed to "+action+" user."});
                } 
                else if(/^2[0-4]{8}$/.test(data)) {
                    if (JSON.parse(JSON.stringify(data)[1])) {
                        setPopupState({show:true,title:bAction+" User",content:"Failed to "+action+" user. Invalid Request!"});
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
				    setPopupState({show:true,title:bAction+" User",content:"Following values are invalid: "+errfields.join(", ")+" "+hints});
                }
            }
            catch(error){
                setPopupState({show:true,title:bAction+" User",content:"Failed to "+action+" user."});
            }
        })()
    }

    //Validate Input Fields Before Doing Action
    const validate = ({action}) =>{
		var flag = true;
		setUserNameAddClass(false);setfirstnameAddClass(false);setLastnameAddClass(false);setPasswordAddClass(false);
        setConfirmPasswordAddClass(false);setEmailAddClass(false);setLdapDirectoryAddClass(false);setUserIdNameAddClass(false);
        setUserRolesAddClass(false);setConfServerAddClass(false);
        //eslint-disable-next-line
        var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
        var popupOpen = false;
        // eslint-disable-next-line
		var reg = /^[a-zA-Z0-9\.\@\-\_]+$/;

        if(userIdNameAddClass);
        if (userConf.userName === "") {
            var nameErrorClass = (action === "update")? "selectErrorBorder":"inputErrorBorder";
            if(nameErrorClass==="selectErrorBorder") setUserNameAddClass("setUserNameAddClass");
            else setUserNameAddClass(true)
			flag = false;
		}else if (!reg.test(userConf.userName)) {
			if (!popupOpen){
                setPopupState({show:true,title:"Error",content:"Cannot contain special characters other than ._-"});
            }
            popupOpen = true;
			setUserNameAddClass(true);
			flag = false;
		}
		if (userConf.userIdName === "" && action==="update") {
            setUserIdNameAddClass(true);
			flag = false;
		}
		if (userConf.firstname === "") {
            setfirstnameAddClass(true);
			flag = false;
		}
		if (userConf.lastname === "") {
            setLastnameAddClass(true);
			flag = false;
		}
		if (userConf.type!=="inhouse") {
			if (userConf.server === "") {
                setConfServerAddClass("selectErrorBorder");
				flag = false;
			}
			if (userConf.confExpired && action !== "delete") {
				if (!popupOpen){
                    setPopupState({show:true,title:"Error",content:"This configuration is deleted/invalid..."});
                }
				popupOpen = true;
                setConfServerAddClass("selectErrorBorder");
				flag = false;
			}
		}
		if (userConf.type==="ldap" && userConf.ldap.user === "") {
            setLdapDirectoryAddClass("selectErrorBorder");
			flag = false;
		}
		if (userConf.type==="inhouse" && action !== "delete" && !(action === "update" && userConf.passWord === "" && userConf.confirmPassword === "")) {
			if (userConf.passWord === "") {
                setPasswordAddClass(true);
				flag = false;
			} else if (!regexPassword.test(userConf.passWord)) {
				if (!popupOpen){
                    setPopupState({show:true,title:"Error",content:"Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters.."});
                }
                popupOpen = true;
                setPasswordAddClass(true);
				flag = false;
			}
			if (userConf.confirmPassword === "") {
                setConfirmPasswordAddClass(true);
				flag = false;
			} else if (!regexPassword.test(userConf.confirmPassword)) {
				if (!popupOpen){
                    setPopupState({show:true,title:"Error",content:"Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters.."});
                }
                popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
			if (userConf.passWord !== userConf.confirmPassword) {
				if (!popupOpen){
                    setPopupState({show:true,title:"Error",content:"Password and Confirm Password did not match"});
                }
                popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
		}
		if (userConf.email === "") {
            setEmailAddClass(true);
			flag = false;
        } else if (!emailRegEx.test(userConf.email)) {
			if (!popupOpen){
                setPopupState({show:true,title:"Error",content:"Email address is not valid"});
            }
            popupOpen = true;
			setEmailAddClass(true);
			flag = false;
		}
		if (userConf.role === "") {
            setUserRolesAddClass("selectErrorBorder");
			flag = false;
		}
		return flag;
	};

    //Clear Input values and red Borders( if any)
    const click = (props) =>{
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

        dispatch({type:actionTypes.RESET_VALUES,payload:""})
        updateUserRoles();

		if (props!==undefined && props.query!==undefined && props.query !== "retaintype") {
            dispatch({type:actionTypes.UPDATE_TYPE,payload:"inhouse"})
            dispatch({type:actionTypes.UPDATE_SERVER,payload:""})
            dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:[]})
            dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:[]})
		}
    };
    
    //Switch between multiple Usertypes
    const selectUserType = async(props) =>{
        dispatch({type:actionTypes.UPDATE_SERVER,payload:""})
        dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:[]})
		if (props.type === "ldap") {
            populateLDAPConf();
        }
		else if (props.type === "saml") populateSAMLConf();
        else if (props.type === "oidc") populateOIDCConf();
    }

    const  populateLDAPConf = async() =>{
       
        dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
        setLoading("Fetching LDAP Server configurations...");
        var data = await getLDAPConfig("server");
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data === "empty") {
            setPopupState({show:true,title:"Edit Configuration",content: "There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section."});
        } else {
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
            data.sort((a,b)=>a.name.localeCompare(b.name));
            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
        }
    }

    const  populateSAMLConf = () =>{
        (async()=>{
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
            setLoading("Fetching SAML Server configurations...");
            var data = await getSAMLConfig();
            if(data.error){displayError(data.error);return;}
            setLoading(false);
            if (data === "empty") {
                setPopupState({show:true,title:"Edit Configuration",content: "There are no SAML server configured. To proceed create a server configuration in SAML configuration section."});
            } else {
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort();
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }
        })()
    }

    const  populateOIDCConf = () =>{
        (async()=>{
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
            setLoading("Fetching OpenID Server configurations...");
            var data = await getOIDCConfig();
            if(data.error){displayError(data.error);return;}
            setLoading(false);
            if(data === "empty" ){
                setPopupState({show:true,title:"Edit Configuration",content: "There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section."});
            } else {
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort((a,b)=>a.name.localeCompare(b.name));
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }
        })()
    }

    const ldapSwitchFetch = async ({userConf_ldap_fetch} )=>{
        dispatch({type:actionTypes.UPDATE_LDAP_USER_FILTER,payload:""})
        dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:""})
        clearForm(true);
        setLdapDirectoryAddClass(false);
		if (userConf_ldap_fetch !== "import") return false;
		const ldapServer = userConf.server;
        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
        dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:[]})
        setLoading("Fetching LDAP users...");
        const data = await getLDAPConfig("user", ldapServer);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data === "empty") {
            setPopupState({show:true,title:"Edit Configuration",content: "There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section."});
        }
        else if(data!==undefined) {
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
            data.sort();
            const ldapAllUserList = data.map(e=>({value:e[1],html:e[0]}));
            dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:ldapAllUserList})  
            setLdapUserList(ldapAllUserList);  
        }
    }

    const clearForm = ( retainExtra)=>{
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:""})
		if (!retainExtra && userConf.type === "ldap") {
            dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
		}
    };
    
    //Fetch LDAP User detail
    const ldapGetUser = async(props)=>{
        let ldapUser = userConf.ldap.user;
        if(props!==undefined) {
            ldapUser = props.luser;
        }
        const ldapServer = userConf.server;
		dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
		if (ldapUser === '') {
            setLdapDirectoryAddClass(true);
			return;
		}
		clearForm(true);
        setLoading("Fetching User details...");
        const data = await getLDAPConfig("user", ldapServer, ldapUser);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data === "empty") {
            setPopupState({show:true,title:"Edit Configuration",content: "User not found"});
        } else {
            dispatch({type:actionTypes.UPDATE_LDAP_DATA,payload:data})
        }
    }

    //load Users for Edit
    const edit = async(props)=>{
        click(); 
        dispatch({type:actionTypes.UPDATE_TYPE,payload: "inhouse"})
        dispatch({type:actionTypes.UPDATE_FTYPE,payload: "Default"})
        setLoading("Fetching users...");
        var data = await getUserDetails("user");
        if(data.error){displayError(data.error);return;}
        else {
            setLoading(false);
            data.sort();
            dispatch({type:actionTypes.UPDATE_ALL_USERS_LIST,payload: data})
            setAllUserFilList(data);
        }
    }
    
    const getUserData = async(props)=>{
        const userObj = props.user_idName.split(';');
        dispatch({type:actionTypes.UPDATE_USERID,payload: userObj[0]});
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload: userObj[1]});
        setLoading("Fetching User details...");
        try{
            const data = await getUserDetails("userid", userObj[0]);
            if(data.error){displayError(data.error);return;}
            else {
                setLoading(false);
                const uType = data.type;
                dispatch({type:actionTypes.UPDATE_DATA,payload: data});
                dispatch({type:actionTypes.UPDATE_ADDROLES,payload: {}});
                data.addrole.forEach((e) => dispatch({type:actionTypes.ADD_ADDROLE,payload: e}));
                dispatch({type:actionTypes.UPDATE_FTYPE,payload:  (uType==="inhouse")? "Default":((uType==="oidc")? "OpenID":uType.toUpperCase())});

                if (data.type !== "inhouse") {
                    var confserver = data.server;
                    dispatch({type:actionTypes.UPDATE_SERVER,payload:""})
                    dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:[]})
                    if (data.type === "ldap") {
                        dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
                        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
                        setLoading("Fetching LDAP Server configurations...");
                        var data1 = await getLDAPConfig("server");
                        if(data1.error){displayError(data1.error);return;}
                        setLoading(false);
                        if (data1 === "empty") {
                            setPopupState({show:true,title:"Edit Configuration",content: "There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section."});
                        } else {
                            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                            data1.sort((a,b)=>a.name.localeCompare(b.name));
                            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data1})
                        }
                    }
                    else if (data.type === "saml"){
                        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
                        setLoading("Fetching SAML Server configurations...");
                        data1 = await getSAMLConfig();
                        if(data1.error){displayError(data1.error);return;}
                        setLoading(false);
                        if (data === "empty") {
                            setPopupState({show:true,title:"Edit Configuration",content: "There are no SAML server configured. To proceed create a server configuration in SAML configuration section."});
                        } else {
                            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                            data1.sort();
                            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data1})
                        }
                    }
                    else if (data.type === "oidc"){ 
                        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
                        setLoading("Fetching OpenID Server configurations...");
                        data1 = await getOIDCConfig();
                        if(data1.error){displayError(data1.error);return;}
                        setLoading(false);
                        if(data1 === "empty" ){
                            setPopupState({show:true,title:"Edit Configuration",content: "There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section."});
                        } else {
                            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                            data1.sort((a,b)=>a.name.localeCompare(b.name));
                            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data1})
                        }
                    }
                    if (!data1.some(function(e) { return e.name === confserver;})) {
                        dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST_PUSH,payload: {_id: '', name: confserver}});
                        dispatch({type:actionTypes.UPDATE_CONF_EXP,payload: confserver});
                    }
                    dispatch({type:actionTypes.UPDATE_SERVER,payload: confserver});
                    dispatch({type:actionTypes.UPDATE_LDAP_USER,payload: data.ldapuser || ''});
                }
            }  
        }catch(error){
            setLoading(false);
            setPopupState({show:true,title:"Edit User",content:"Failed to fetch user details."});
        }  
    }

    const searchFunctionUser = async(val)=>{
        setShowDropdownEdit(true);
        const items = userConf.allUsersList.filter((e)=>e[0].toUpperCase().indexOf(val.toUpperCase())!==-1)
        setAllUserFilList(items);
    }

    const searchFunctionLdap = async(val)=>{
        let items = [];
        if(userConf.ldapAllUserList!=="") items = userConf.ldapAllUserList.filter((e)=>e.html.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setLdapUserList(items);
    }
    
    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const passwordChange = (value) => {
        value = ValidationExpression(value,"password")
        dispatch({type:actionTypes.UPDATE_INPUT_PASSWORD,payload:value})
    }

    
    const confirmPasswordChange = (value) => {
        value = ValidationExpression(value,"password")
        dispatch({type:actionTypes.UPDATE_INPUT_CONFIRMPASSWORD,payload:value})
    }

    const emailChange = (value) => {
        value = ValidationExpression(value,"email")
        dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:value})
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <ScrollBar thumbColor="#929397">
            <div data-test="create__container" className="createUser-container">
            <div data-test="heading" id="page-taskName"><span>{(props.showEditUser===false)?"Create User":"Edit User"}</span></div>
            
            {(props.showEditUser===false)?
                <CreateLanding firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass} ldapSwitchFetch={ldapSwitchFetch} userNameAddClass={userNameAddClass} setShowDropdown={setShowDropdown} ldapUserList={ldapUserList} searchFunctionLdap={searchFunctionLdap}  ldapDirectoryAddClass={ldapDirectoryAddClass} confServerAddClass={confServerAddClass} clearForm={clearForm} setShowEditUser={props.setShowEditUser} ldapGetUser={ldapGetUser} click={click} edit={edit} manage={manage} selectUserType={selectUserType} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} showDropdown={showDropdown} />
                :<EditLanding firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass} confServerAddClass={confServerAddClass} ldapGetUser={ldapGetUser} ldapDirectoryAddClass={ldapDirectoryAddClass} clearForm={clearForm} allUserFilList={allUserFilList} manage={manage} setAllUserFilList={setAllUserFilList} searchFunctionUser={searchFunctionUser} click={click} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} getUserData={getUserData} />
            }    

            <div className="col-xs-9 form-group__conv">

                {(userConf.type === "inhouse")?
                    <Fragment>
                        <div className='leftControl adminControl'>
                            <input data-test="password" value={userConf.passWord} onChange={(event)=>{passwordChange(event.target.value)}} type="password" autoComplete="new-password" name="passWord" id="password" maxLength="16" className={passwordAddClass?"middle__input__border form-control__conv form-control-custom inputErrorBorder" :"middle__input__border form-control__conv form-control-custom"} placeholder="Password" />
                        </div>
                        <div className='rightControl adminControl'>
                            <input data-test="confirmPassword" value={userConf.confirmPassword} onChange={(event)=>{confirmPasswordChange(event.target.value)}} type="password" autoComplete="new-password" name='confirmPassword' id='confirmPassword' maxLength="16" className={confirmPasswordAddClass?"middle__input__border form-control__conv form-control-custom inputErrorBorder" :"middle__input__border form-control__conv form-control-custom"}  placeholder="Confirm Password"/>
                        </div>
                    </Fragment>
                    :null
                }   
                
                {/* PRESENT FOR EACH USERTYPE */}
                <div className='adminControl'>
					<input data-test="email" value={userConf.email} onChange={(event)=>{emailChange(event.target.value)}} autoComplete="off" name="email" id="email" maxLength="100" className={emailAddClass?"middle__input__border form-control__conv form-control-custom inputErrorBorder":"middle__input__border form-control__conv form-control-custom"} placeholder="Email Id"/>
				</div>
				<div className="selectRole  adminControl role-padding" >
					<label data-test="primaryRoleLabel" className="leftControl primaryRole">Primary Role</label>
					<select data-test="primaryRoleDropdown" value={userConf.role} disabled={props.showEditUser===true} className={userRolesAddClass?'adminSelect form-control__conv selectErrorBorder':'adminSelect form-control__conv '} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_USERROLE,payload:event.target.value})}} id="userRoles" style={(props.showEditUser===true)?{backgroundColor: "#eee",cursor: "not-allowed"}:{}} >
						<option value="" >Select User Role</option>
                        {userConf.allRoles.map((i,index) => (      
                            <option key={index} value={i[1]}>{i[0]}</option>
                        ))}
                    </select>
				</div> 

                {( userConf.rolename!=='Admin' && props.showEditUser === true  && userConf.userIdName!=='')?
                    <div  className="col-xs-6 selectRole" >
                        <label className="leftControl primaryRole" id="additionalRoleTxt">Additional Role: </label>
                        <label className="chooseRole dropdown-toggle" id="additionalRole_options" data-toggle="dropdown" onClick={()=>{setToggleAddRoles(!toggleAddRoles)}} title="Select Additional Role">Select Additional Role</label>
                        {(toggleAddRoles===true)?
                            <ul ref={node} className="dropdown-menu-multiselect" id="additionalRoles" >
                                
                                {userConf.allAddRoles.map((arid,index) => (  
                                    (arid[1]!==userConf.role)? 
                                        <li className='RolesCheck' key={index}  checked={userConf.addRole[arid[1]]} onClick={()=>{dispatch({type:actionTypes.EDIT_ADDROLES,payload:arid[1]})}}>
                                            <span className='rolesSpan'><input className='addcheckBox' name="additionalRole" type='checkbox' checked={userConf.addRole[arid[1]]} /><label className='rolesChecklabel'>{arid[0]}</label></span> 
                                        </li>
                                    :null
                                ))}
                            </ul>
                        :null}
                    </div>
                :null}
                
			</div>	
            </div>
            </ScrollBar>
      </Fragment>
  );
}

export default CreateUser;

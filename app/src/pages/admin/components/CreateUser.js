import React, { Fragment, useState, useEffect  } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getUserRoles, manageUserDetails, getLDAPConfig, getSAMLConfig, getOIDCConfig} from '../api';
import * as actionTypes from '../state/action';
// import AdminOpenModalPopup from './AdminOpenModalPopup';
import '../styles/CreateUser.scss'

/*Component CreateUser
  use: defines Admin middle Section for create user
  ToDo: disable autifilling of name password
        css improve
        add modals all popup
        only ldap code red border class divs
*/

const CreateUser = (props) => {
    const dispatch = useDispatch()
    const userConf = useSelector(state=>state.admin.userConf)

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

    useEffect(()=>{
        updateUserRoles();
    },[])

    

    //Fetch UserRoles
    const updateUserRoles = (props) =>{
        (async()=>{
            var res = await getUserRoles()
            res.sort(function(a,b){ return a[0] >  b[0]; });
            var allAddRoles = res.filter((e)=> (e[0].toLowerCase() != "admin"))
            dispatch({type:actionTypes.UPDATE_ALLROLES,payload:res})
            dispatch({type:actionTypes.UPDATE_ALLADDROLES,payload:allAddRoles})
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
        const createdbyrole = userConf.allRoles.filter((e)=> (e[0].toLowerCase() == "admin"));;
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
        if (uType=="ldap") userObj.ldapUser = userConf.ldap.user;
        // blockUI(bAction.slice(0,-1)+"ing User...");
        
        (async()=>{
            var data = await manageUserDetails(action, userObj);
            // unblockUI();
            if(data == "Invalid Session") {
				// $rootScope.redirectPage();
			} else if(data == "success") {
				if (action == "create") click();
				// else $scope.userConf.edit();
                // AdminOpenModalPopup(bAction+" User", "User "+action+"d successfully!");
				// if (action == "delete") {
				// 	adminServices.manageSessionData('logout', userObj.username, '?', 'dereg').then(function (data) {
				// 		if (data == "Invalid Session") return $rootScope.redirectPage();
				// 	}, function (error) {});
				// 	adminServices.fetchICE(userObj.userid).then(function (data) {
				// 		if (data == "Invalid Session") return $rootScope.redirectPage();
				// 		if (data.length == 0) return false;
				// 		const icename = data[0].icename;
				// 		adminServices.manageSessionData('disconnect', icename, '?', 'dereg').then(function (data) {
				// 			if (data == "Invalid Session") return $rootScope.redirectPage();
				// 		}, function (error) {});
				// 	}, function (error) {});
				// }
			} else if(data == "exists") {
                setUserNameAddClass(true);
				// openModalPopup(bAction+" User", "User already Exists!");
			} else if(data == "fail") {
				if (action == "create") click();
				// else $scope.userConf.edit();
				// openModalPopup(bAction+" User", "Failed to "+action+" user.");
            } 
            else if(/^2[0-4]{8}$/.test(data)) {
				if (parseInt(data[1])) {
					// openModalPopup(bAction+" User", "Failed to "+action+" user. Invalid Request!");
					return;
				}
				var errfields = [];
				if (parseInt(data[2])) errfields.push("User Name");
				if (parseInt(data[3])) errfields.push("First Name");
				if (parseInt(data[4])) errfields.push("Last Name");
				if (parseInt(data[5])) errfields.push("Password");
				if (parseInt(data[6])) errfields.push("Email");
				if (parseInt(data[7])) errfields.push("Authentication Server");
				if (parseInt(data[8])) errfields.push("User Domain Name");
				// openModalPopup(bAction+" User", "Following values are invalid: "+errfields.join(", "));
            }
            

            // function (error) {
            //     unblockUI();
            //     openModalPopup(bAction+" User", "Failed to "+action+" user.");
            //     console.log("Error:::", error);
            // });
        })()
    }

    //Validate Input Fields Before Doing Action
    const validate = ({action}) =>{
		var flag = true;
		setUserNameAddClass(false);setfirstnameAddClass(false);setLastnameAddClass(false);setPasswordAddClass(false);
        setConfirmPasswordAddClass(false);setEmailAddClass(false);setLdapDirectoryAddClass(false);setUserIdNameAddClass(false);
        setUserRolesAddClass(false);setConfServerAddClass(false);
        var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		var popupOpen = false;
		if (userConf.userName == "") {
            var nameErrorClass = (action == "update")? "selectErrorBorder":"inputErrorBorder";
            if(nameErrorClass==="selectErrorBorder") setUserNameAddClass("setUserNameAddClass");
            else setUserNameAddClass(true)
			flag = false;
		}
		if (userConf.userIdName == "" && action=="update") {
            setUserIdNameAddClass(true);
			flag = false;
		}
		if (userConf.firstname == "") {
            setfirstnameAddClass(true);
			flag = false;
		}
		if (userConf.lastname == "") {
            setLastnameAddClass(true);
			flag = false;
		}
		if (userConf.type!="inhouse") {
			if (userConf.server == "") {
                setConfServerAddClass("selectErrorBorder");
				flag = false;
			}
			if (userConf.confExpired && action != "delete") {
				// if (!popupOpen) openModalPopup("Error", "This configuration is deleted/invalid...");
				popupOpen = true;
                setConfServerAddClass("selectErrorBorder");
				flag = false;
			}
		}
		if (userConf.type=="ldap" && userConf.ldap.user == "") {
            setLdapDirectoryAddClass("selectErrorBorder");
			flag = false;
		}
		if (userConf.type=="inhouse" && action != "delete" && !(action == "update" && userConf.passWord == "" && userConf.confirmPassword == "")) {
			if (userConf.passWord == "") {
                setPasswordAddClass(true);
				flag = false;
			} else if (!regexPassword.test(userConf.passWord)) {
				// if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
				popupOpen = true;
                setPasswordAddClass(true);
				flag = false;
			}
			if (userConf.confirmPassword == "") {
                setConfirmPasswordAddClass(true);
				flag = false;
			} else if (!regexPassword.test(userConf.confirmPassword)) {
				// if (!popupOpen) openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
                popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
			if (userConf.passWord != userConf.confirmPassword) {
				// if (!popupOpen) openModalPopup("Error", "Password and Confirm Password did not match");
				popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
		}
		if (userConf.email == "") {
            setEmailAddClass(true);
			flag = false;
        } else if (!emailRegEx.test(userConf.email)) {
			// if (!popupOpen) openModalPopup("Error", "Email address is not valid");
			popupOpen = true;
			setEmailAddClass(true);
			flag = false;
		}
		if (userConf.role == "") {
            setUserRolesAddClass("selectErrorBorder");
			flag = false;
		}
		return flag;
	};

    //Clear Input values and red Borders( if any)
    const click = (props) =>{
		// $(".selectedIcon").removeClass("selectedIcon");
		// $("button.userTypeBtnActive").removeClass('userTypeBtnActive');
        // $("#userTab").find("span.fa").addClass("selectedIcon");
        

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

        dispatch({type:actionTypes.UPDATE_USERID,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_USERIDNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_PASSWORD,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_CONFIRMPASSWORD,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:""})
        dispatch({type:actionTypes.UPDATE_USERROLE,payload:""})
        dispatch({type:actionTypes.UPDATE_ALLROLES,payload:[]})
        dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
        dispatch({type:actionTypes.UPDATE_CONF_EXP,payload:false})
        dispatch({type:actionTypes.UPDATE_LDAP_USER_FILTER,payload:""})
        dispatch({type:actionTypes.UPDATE_ALL_USER_FILTER,payload:""});
        updateUserRoles();

		// if (props!=undefined && props.query!=undefined && props.query != "retaintype") {
            dispatch({type:actionTypes.UPDATE_TYPE,payload:"inhouse"})
            dispatch({type:actionTypes.UPDATE_SERVER,payload:""})
            dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
            dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:[]})
            dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:[]})
		// }
    };
    
    //Switch between multiple Usertypes
    const selectUserType = (props) =>{
        dispatch({type:actionTypes.UPDATE_SERVER,payload:""})
        dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:[]})
		if (props.type == "ldap") populateLDAPConf();
		else if (props.type == "saml") populateSAMLConf();
		else if (props.type == "oidc") populateOIDCConf();
    }

    const  populateLDAPConf = () =>{
        (async()=>{
            var x =1;
            dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
            // blockUI("Fetching LDAP Server configurations...");
            var data = await getLDAPConfig("server");
            // unblockUI();
            if(data == "Invalid Session") x=2; //$rootScope.redirectPage();
            else if(data == "fail") x=3;//openModalPopup("Create User", "Failed to fetch LDAP server configurations.");
            else if(data == "empty") x=4;//openModalPopup("Create User","There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section.");
            else {
                x=5;
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort((a,b)=>a.name.localeCompare(b.name));
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }

            // function (error) {
            // unblockUI();
            // console.log("Error:::::::::::::", error);
            // openModalPopup("Create User", "Failed to fetch LDAP server configurations");


        })()
    }

    const  populateSAMLConf = () =>{
        (async()=>{

            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
		    // blockUI("Fetching SAML Server configurations...");
            var x =1;
            var data = await getSAMLConfig();
            // unblockUI();
            if(data == "Invalid Session") x=2;//$rootScope.redirectPage();
            else if(data == "fail") x=3;//openModalPopup("Create User", "Failed to fetch SAML server configurations.");
            else if(data == "empty") x=4;//openModalPopup("Create User","There are no SAML server configured. To proceed create a server configuration in SAML configuration section.");
            else {
                x=5;
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort((a,b)=>a.name.localeCompare(b.name));
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }
            // function (error) {
			// 	unblockUI();
			// 	console.log("Error:::::::::::::", error);
			// 	openModalPopup("Create User", "Failed to fetch SAML server configurations");
        })()
    }

    const  populateOIDCConf = () =>{
        (async()=>{
            var x =1;
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
            // blockUI("Fetching OpenID Server configurations...");
            var data = await getOIDCConfig();
            // unblockUI();
            if(data == "Invalid Session") x=2; //$rootScope.redirectPage();
            else if(data == "fail") x=3;//openModalPopup("Create User", "Failed to fetch OpenID server configurations.");
            else if(data == "empty") x=4;//openModalPopup("Create User","There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section.");
            else {
                x=5;
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort((a,b)=>a.name.localeCompare(b.name));
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }

            // function (error) {
            // unblockUI();
            // console.log("Error:::::::::::::", error);
            // openModalPopup("Create User", "Failed to fetch OpenID server configurations");


        })()
    }

    const ldapSwitchFetch = ( )=>{
        dispatch({type:actionTypes.UPDATE_LDAP_USER_FILTER,payload:""})
        dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:""})
        clearForm(true);
        setLdapDirectoryAddClass(false);
		if (userConf.ldap.fetch != "import") return false;
		const ldapServer = userConf.server;
		userConf.nocreate = true;
		userConf.ldapAllUserList=[];
		// blockUI("Fetching LDAP users...");
        const data = getLDAPConfig("user", ldapServer)
        
        // unblockUI();
			if(data == "Invalid Session");// $rootScope.redirectPage();
			else if(data == "fail") ;// openModalPopup("Create User", "Failed to LDAP fetch users");
			else if(data == "insufficient_access") ;//openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there are no users available in this Server");
			else if(data == "empty");// openModalPopup("Create User","There are no users available in this Server.");
			else {
				dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
				data.sort((a,b)=>a.localeCompare(b));
                const ldapAllUserList = data.map(e=>({value:e[1],html:e[0]}));
                dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:ldapAllUserList})
            }
            
            // function (error) {
            //     unblockUI();
            //     console.log("Error:::::::::::::", error);
            //     openModalPopup("Create User", "Failed to fetch LDAP server configurations");

    }

    const clearForm = ( retainExtra)=>{
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:""})
        dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:""})
		if (!retainExtra && userConf.type == "ldap") {
            dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
		}
    };
    
    //Fetch LDAP User detail
    const ldapGetUser = ()=>{
        const ldapUser = userConf.ldap.user;
		const ldapServer = userConf.server;
		dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
		if (userConf.ldap.user == '') {
            setLdapDirectoryAddClass(true);
			return;
		}
		clearForm(true);
		// blockUI("Fetching User details...");
		const data = getLDAPConfig("user", ldapServer, ldapUser);
		
			// unblockUI();
			if(data == "Invalid Session");// $rootScope.redirectPage();
			else if(data == "fail");// openModalPopup("Create User", "Failed to populate User details");
			else if(data == "insufficient_access");// openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user");
			else if(data == "empty");// openModalPopup("Create User","User not found!");				
			else {
                
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:data.username})
                dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:data.firstname})
                dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:data.lastname})
                dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:data.email})
                
            }
		// }, function (error) {
		// 	unblockUI();
		// 	console.log("Error:::::::::::::", error);
		// 	openModalPopup("Create User", "Failed to fetch LDAP server configurations");
    }

    return (
        <Fragment>
			<div id="page-taskName">
				<span>Create User</span>
			</div>

			<div className="adminActionBtn">
				<button className=" btn-md pull-right adminBtn"  title="Edit User">Edit</button>
				<button className=" btn-md pull-right adminBtn Create-User__btn "  onClick={()=>{manage({action:"create"})}} disabled={userConf.nocreate} title="Create User" style={{ marginRight: "10px" }}>Create</button>
				<button title="Clear" style={{ marginRight: "10px" }} onClick={()=>{click()}} className=" btn-md pull-right adminBtn " >Clear</button>
			</div>
			
            <div className="col-xs-9 form-group__conv">
				<div className="selectRole adminControl">
					<label className="leftControl primaryRole">User Type</label>
					<select value={userConf.type} size onChange={(event)=>{ selectUserType({type:event.target.value});dispatch({type:actionTypes.UPDATE_TYPE,payload:event.target.value});}} className='adminSelect form-control__conv ' id="userTypes"   >
						<option value="inhouse" selected>Default</option>
						<option value="ldap">LDAP</option>
						<option value="saml">SAML</option>
						<option value="oidc">OpenID</option>
					</select>
				</div>

                {(userConf.type !== "inhouse")?
                    <Fragment>
                        <div className="adminControl" >
                            <select onChange={(event)=>{clearForm();dispatch({type:actionTypes.UPDATE_SERVER,payload:event.target.value});}} className={confServerAddClass?'adminSelect  form-control__conv selectErrorBorder':'adminSelect  form-control__conv'} id="confServer" style={{marginLeft:"0",width:"100%"}}>*/ng-change="userConf.clearForm()" */
                                <option value="" disabled selected>Select Server</option>
                                {/* <option ng-repeat="srv in userConf.confServerList" value="{{srv.name}}" ng-selected="srv.name==userConf.server" ng-disabled="userConf.confExpired==srv.name">{{srv.name}}</option> */}
                                {userConf.confServerList.map((srv) => (      
                                    <option value={srv.name} selected={srv.name==userConf.server} disabled={userConf.confExpired==srv.name}>{srv.name}</option>
                                ))}
                            </select>
                        </div>
                    </Fragment>
                    : null
                }

                {/* LDAP */}
                {(userConf.type === "ldap")?
                    <Fragment>
                        <div className="userLDAPFetch adminControl">
                            <div className="col-xs-12"  style={{ paddingLeft: "70px" }}>
                                <label className="adminFormRadio">
                                    <input type="radio"  value="map" onChange={()=>{dispatch({type:actionTypes.UPDATE_LDAP_FETCH,payload:"map"});;ldapSwitchFetch()}} name="ldapFetch" disabled={userConf.server == ''} />
                                    <span style={{fontSize: "small", fontWeight: "700"}}>Map New User</span>
                                </label>
                                <label className="adminFormRadio">
                                    <input type="radio" value="import" onChange={()=>{dispatch({type:actionTypes.UPDATE_LDAP_FETCH,payload:"import"});ldapSwitchFetch();}} name="ldapFetch" disabled={userConf.server == ''}/>
                                    <span style={{fontSize: "small", fontWeight: "700"}}>Import User</span>
                                </label>
                            </div>
                            <div className="userForm">
                                <button title="Fetch" disabled={userConf.server == ''} onClick={()=>{ldapGetUser();}} className=" btn-md pull-right adminBtn Create-User__btn btn-disabled" style={{ margin: "6px 0", fontSize:"13px" }}>Fetch</button>
                                <input type="text" autocomplete="off" id="ldapDirectory" name="ldapDirectory" value={userConf.ldap.user} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_LDAP_USER,payload:event.target.value})}} className="middle__input__border form-control__conv form-control-custom create" placeholder="User Domain Name"/>
                            </div>

                            {(userConf.ldap.fetch == 'import')?
                                <div className="dropdown dropdown-scroll userForm" >
                                    <input value={userConf.ldapUserFilter} onClick={()=>click({query:'retaintype'})} className="btn btn-users dropdown-toggle" type="text" autocomplete="off" id="ldapDirectory" data-toggle="dropdown" placeholder="Search User.."  style={{ width: "100%" }}></input>
                                    <ul className="dropdown-menu dropdown-menu-users" role="menu" aria-labelledby="ldapDirectory">
                                        {/* <li role="presentation" ng-repeat='luser in userConf.ldapAllUserList | filter:userConf.ldapUserFilter' ng-click="userConf.ldap.user=luser.value;userConf.ldapUserFilter=luser.html; userConf.ldapGetUser()" value="{{luser.value}}"> {{luser.html}}</li> */}
                                    </ul>
                                </div>
                            :null}
                        </div> 
                    </Fragment>
                    : null
                }

                {/* PRESENT FOR EACH USERTYPE */}
                <div className='userForm adminControl'>
                    <input type="text" autocomplete="off" id="userName" value={userConf.userName} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:event.target.value})}} name="userName" style={{ paddingRight: "175px" }}  maxlength="100" className={userNameAddClass?((userNameAddClass==="selectErrorBorder")?"middle__input__border form-control-custom form-control__conv  validationKeydown preventSpecialChar create selectErrorBorder":"middle__input__border form-control-custom form-control__conv  validationKeydown preventSpecialChar create inputErrorBorder"):"middle__input__border form-control-custom form-control__conv  validationKeydown preventSpecialChar create"} placeholder="User Name"/>
                </div>
                <div className='leftControl adminControl'>
                    <input type="text" autocomplete="off" name="firstname" id="firstname" value={userConf.firstname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:event.target.value})}} maxlength="100" className={firstnameAddClass?"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar create inputErrorBorder":"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar create"} placeholder="First Name"/>
                </div>
                <div className='rightControl adminControl'>
                    <input type="text" autocomplete="off" name="lastname" id="lastname" value={userConf.lastname} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:event.target.value})}} maxlength="100" className={lastnameAddClass?"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar create inputErrorBorder":"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar create "} placeholder="Last Name"/>
                </div>

                {(userConf.type === "inhouse")?
                    <Fragment>
                        <div className='leftControl adminControl'>
                            <input value={userConf.passWord} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_PASSWORD,payload:event.target.value})}} type="password" autocomplete="off" name="passWord" id="password" maxlength="16" className={passwordAddClass?"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex inputErrorBorder" :"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex"} placeholder="Password" autocomplete="off"/>
                        </div>
                        <div className='rightControl adminControl'>
                            <input value={userConf.confirmPassword} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_CONFIRMPASSWORD,payload:event.target.value})}} type="password" autocomplete="off" name='confirmPassword' id='confirmPassword' maxlength="16" className={confirmPasswordAddClass?"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex inputErrorBorder" :"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex"}  placeholder="Confirm Password" autocomplete="off"/>
                        </div>
                    </Fragment>
                    :null
                }   
                
                {/* PRESENT FOR EACH USERTYPE */}
                <div className='adminControl'>
					<input value={userConf.email} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:event.target.value})}} type="email" autocomplete="off" name="email" id="email" maxlength="100" className={emailAddClass?"middle__input__border form-control__conv form-control-custom create inputErrorBorder":"middle__input__border form-control__conv form-control-custom create"} placeholder="Email Id"/>
				</div>
				<div className="selectRole  adminControl" style={{ paddingLeft: "0" }}>
					<label className="leftControl primaryRole">Primary Role</label>
					<select className={userRolesAddClass?'adminSelect form-control__conv selectErrorBorder':'adminSelect form-control__conv '} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_USERROLE,payload:event.target.value})}} id="userRoles" >
						<option value="" disabled selected>Select User Role</option>
                        {userConf.allRoles.map((i) => (      
                            <option value={i[1]}>{i[0]}</option>
                        ))}
                    </select>
				</div> 
			</div>	
      </Fragment>
  );
}

export default CreateUser;

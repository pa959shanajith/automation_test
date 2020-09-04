import React, { Fragment, useState, useEffect , useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getUserRoles, manageUserDetails, getLDAPConfig, getSAMLConfig, getOIDCConfig, getUserDetails, fetchICE, manageSessionData} from '../api';
import * as actionTypes from '../state/action';
import '../styles/CreateUser.scss'
import CreateLanding from '../components/CreateLanding';
import EditLanding from '../components/EditLanding';

/*Component CreateUser
  use: defines Admin middle Section for create user
  ToDo: add modals all popup
        only ldap code red border class divs USERIDNAME
        delete modal
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

    useEffect(()=>{
        
        click();
        dispatch({type:actionTypes.UPDATE_TYPE,payload:"inhouse"});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["createUser"],props.showEditUser,props.MiddleScreen])

    useOnClickOutside(node, () => setToggleAddRoles(false));

    //Fetch UserRoles
    const updateUserRoles = (props) =>{
        (async()=>{
            var res = await getUserRoles()
            if(res!==undefined){
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
        // const bAction = action.charAt(0).toUpperCase() + action.substr(1);
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
        // blockUI(bAction.slice(0,-1)+"ing User...");
        
        (async()=>{
            try{
                var data = await manageUserDetails(action, userObj);
                // unblockUI();
                if(data === "Invalid Session") {
                    // $rootScope.redirectPage();
                } else if(data === "success") {
                    if (action === "create") click();
                    else edit();
                    // AdminOpenModalPopup(bAction+" User", "User "+action+"d successfully!");
                    alert("User "+action+"d successfully!");
                    if (action === "delete") {
                        const data0 = await manageSessionData('logout', userObj.username, '?', 'dereg')
                        if (data0 === "Invalid Session") return //$rootScope.redirectPage();
                        var data1 = await fetchICE(userObj.userid)
                        if (data1 === "Invalid Session") return //$rootScope.redirectPage();
                        if (data1.length === 0) return false;
                        const icename = data1[0].icename;
                        var data2 = await manageSessionData('disconnect', icename, '?', 'dereg')
                        if (data2 === "Invalid Session") return //$rootScope.redirectPage();
                    }
                } else if(data === "exists") {
                    setUserNameAddClass(true);
                    // openModalPopup(bAction+" User", "User already Exists!");
                    alert("User already Exists!");
                } else if(data === "fail") {
                    if (action === "create") click();
                    else edit();
                    // openModalPopup(bAction+" User", "Failed to "+action+" user.");
                    alert("Failed to "+action+" user.");
                } 
                else if(/^2[0-4]{8}$/.test(data)) {
                    if (parseInt(data[1])) {
                        // openModalPopup(bAction+" User", "Failed to "+action+" user. Invalid Request!");
                        alert("Failed to "+action+" user. Invalid Request!");
                        return;
                    }
                    var errfields = [];
                    if (JSON.parse(JSON.stringify(data)[2])) errfields.push("User Name");
                    if (JSON.parse(JSON.stringify(data)[3])) errfields.push("First Name");
                    if (JSON.parse(JSON.stringify(data)[4])) errfields.push("Last Name");
                    if (JSON.parse(JSON.stringify(data)[5])) errfields.push("Password");
                    if (JSON.parse(JSON.stringify(data)[6])) errfields.push("Email");
                    if (JSON.parse(JSON.stringify(data)[7])) errfields.push("Authentication Server");
                    if (JSON.parse(JSON.stringify(data)[8])) errfields.push("User Domain Name");
                    // openModalPopup(bAction+" User", "Following values are invalid: "+errfields.join(", "));
                    alert("Following values are invalid: "+errfields.join(", "));
                }
            }
            catch(error){
                // unblockUI();
                // openModalPopup(bAction+" User", "Failed to "+action+" user.");
                alert("Failed to "+action+" user.");
                console.log("Error:::", error);
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
		var reg = /^[a-zA-Z0-9\.\@\-\_]+$/;

        if(userIdNameAddClass);
        if (userConf.userName === "") {
            var nameErrorClass = (action === "update")? "selectErrorBorder":"inputErrorBorder";
            if(nameErrorClass==="selectErrorBorder") setUserNameAddClass("setUserNameAddClass");
            else setUserNameAddClass(true)
			flag = false;
		}else if (!reg.test(userConf.userName)) {
			if (!popupOpen)alert("Cannot contain special characters other than ._-"); //openModalPopup("Error", "Cannot contain special characters other than ._-");
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
				if (!popupOpen)alert("This configuration is deleted/invalid...");// openModalPopup("Error", "This configuration is deleted/invalid...");
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
				if (!popupOpen) alert( "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");//openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
				popupOpen = true;
                setPasswordAddClass(true);
				flag = false;
			}
			if (userConf.confirmPassword === "") {
                setConfirmPasswordAddClass(true);
				flag = false;
			} else if (!regexPassword.test(userConf.confirmPassword)) {
				if (!popupOpen) alert( "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");//openModalPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
                popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
			if (userConf.passWord !== userConf.confirmPassword) {
				if (!popupOpen) alert( "Password and Confirm Password did not match");//openModalPopup("Error", "Password and Confirm Password did not match");
				popupOpen = true;
                setConfirmPasswordAddClass(true);
				flag = false;
			}
		}
		if (userConf.email === "") {
            setEmailAddClass(true);
			flag = false;
        } else if (!emailRegEx.test(userConf.email)) {
			if (!popupOpen)alert("Email address is not valid"); //openModalPopup("Error", "Email address is not valid");
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
       
            try{
                dispatch({type:actionTypes.UPDATE_LDAP,payload:{fetch: "map", user: ''}})
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
                // blockUI("Fetching LDAP Server configurations...");
                var data = await getLDAPConfig("server");
                // unblockUI();
                if(data === "Invalid Session") ; //$rootScope.redirectPage();
                else if(data === "fail")alert("Failed to fetch LDAP server configurations.");//openModalPopup("Create User", "Failed to fetch LDAP server configurations.");
                else if(data === "empty")alert("There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section.") ;//openModalPopup("Create User","There are no LDAP server configured. To proceed create a server configuration in LDAP configuration section.");
                else {
                    
                    dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                    data.sort((a,b)=>a.name.localeCompare(b.name));
                    dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
                }
            } catch(error){
                // unblockUI();
                console.log("Error:::::::::::::", error);
                alert("Failed to fetch LDAP server configurations");
                // openModalPopup("Create User", "Failed to fetch LDAP server configurations");
            }
   
    }

    const  populateSAMLConf = () =>{
        (async()=>{
            try{
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
                // blockUI("Fetching SAML Server configurations...");
                
                var data = await getSAMLConfig();
                // unblockUI();
                if(data === "Invalid Session");//$rootScope.redirectPage();
                else if(data === "fail") alert("Failed to fetch SAML server configurations.");//openModalPopup("Create User", "Failed to fetch SAML server configurations.");
                else if(data === "empty")alert("There are no SAML server configured. To proceed create a server configuration in SAML configuration section.");//openModalPopup("Create User","There are no SAML server configured. To proceed create a server configuration in SAML configuration section.");
                else {
                    
                    dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                    // data.sort((a,b)=>a.name.localeCompare(b.name));
                    data.sort();
                    dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
                }
            }catch(error){
                // unblockUI();
				console.log("Error:::::::::::::", error);
                // openModalPopup("Create User", "Failed to fetch SAML server configurations");
                alert("Failed to fetch SAML server configurations");
            }
        })()
    }

    const  populateOIDCConf = () =>{
        (async()=>{
        try{
            dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:true})
            // blockUI("Fetching OpenID Server configurations...");
            var data = await getOIDCConfig();
            // unblockUI();
            if(data === "Invalid Session") ; //$rootScope.redirectPage();
            else if(data === "fail")alert("Failed to fetch OpenID server configurations.") ;//openModalPopup("Create User", "Failed to fetch OpenID server configurations.");
            else if(data === "empty") alert("There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section.") ;//openModalPopup("Create User","There are no OpenID server configured. To proceed create a server configuration in OpenID configuration section.");
            else {
                
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                data.sort((a,b)=>a.name.localeCompare(b.name));
                dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST,payload:data})
            }
        }catch(error){
            // unblockUI();
            console.log("Error:::::::::::::", error);
            // openModalPopup("Create User", "Failed to fetch OpenID server configurations");
            alert("Failed to fetch OpenID server configurations");
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
		// blockUI("Fetching LDAP users...");
        try{
            const data = await getLDAPConfig("user", ldapServer);
            // unblockUI();
			if(data === "Invalid Session");// $rootScope.redirectPage();
			else if(data === "fail")alert("Failed to LDAP fetch users") ;// openModalPopup("Create User", "Failed to LDAP fetch users");
			else if(data === "insufficient_access")alert("Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there are no users available in this Server") ;//openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there are no users available in this Server");
			else if(data === "empty")alert("There are no users available in this Server.");// openModalPopup("Create User","There are no users available in this Server.");
			else if(data!==undefined) {
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                // data.sort((a,b)=>a.localeCompare(b));
                data.sort();
                const ldapAllUserList = data.map(e=>({value:e[1],html:e[0]}));
                dispatch({type:actionTypes.UPDATE_LDAP_ALLUSER_LIST,payload:ldapAllUserList})  
                setLdapUserList(ldapAllUserList);  
            }
        }catch(error){
            // unblockUI();
            console.log("Error:::::::::::::", error);
            // openModalPopup("Create User", "Failed to fetch LDAP server configurations");
            alert("Failed to fetch LDAP server configurations");
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
		// blockUI("Fetching User details...");
        try{    
            const data = await getLDAPConfig("user", ldapServer, ldapUser);
		
			// unblockUI();
			if(data === "Invalid Session");// $rootScope.redirectPage();
			else if(data === "fail")alert("Failed to populate User details");// openModalPopup("Create User", "Failed to populate User details");
			else if(data === "insufficient_access")alert("Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user");// openModalPopup("Create User", "Either Credentials provided in LDAP server configuration does not have required privileges for fetching users or there is no such user");
			else if(data === "empty")alert("User not found!");// openModalPopup("Create User","User not found!");				
			else { 
                dispatch({type:actionTypes.UPDATE_NO_CREATE,payload:false})
                dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload:data.username})
                dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload:data.firstname})
                dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload:data.lastname})
                dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:data.email})  
            }
        }catch(error){
           	// unblockUI();
            console.log("Error:::::::::::::", error);
            alert("Failed to fetch LDAP server configurations");
		    // 	openModalPopup("Create User", "Failed to fetch LDAP server configurations");
       }     
    }

    const deleteUser = ()=>{
        // openDeleteGlobalModal("Delete User", "delUserConf", "Are you sure you want to delete ? All task assignment information and ICE provisions will be deleted for this user.");
	
    }

    //load Users for Edit
    const edit = async(props)=>{
        click(); 
        dispatch({type:actionTypes.UPDATE_TYPE,payload: "inhouse"})
        dispatch({type:actionTypes.UPDATE_FTYPE,payload: "Default"})
        //   blockUI("Fetching users...");
        try{
            var data = await getUserDetails("user");
            //   unblockUI();
            if(data === "Invalid Session");//$rootScope.redirectPage();
            else if(data === "fail") alert("Failed to fetch users.");//openModalPopup("Edit User", "Failed to fetch users.");
            else if(data === "empty") alert("There are no users created yet.");//openModalPopup("Edit User", "There are no users created yet.");
            else {
                data.sort();
                dispatch({type:actionTypes.UPDATE_ALL_USERS_LIST,payload: data})
                setAllUserFilList(data);
            }
        }catch(error){
            //       unblockUI();
            //       openModalPopup("Edit User", "Failed to fetch users.");
            alert("Failed to fetch users.");
        }
    }
    
    const getUserData = async(props)=>{
        const userObj = props.user_idName.split(';');
        dispatch({type:actionTypes.UPDATE_USERID,payload: userObj[0]});
        dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload: userObj[1]});
		var failMsg = "Failed to fetch user details.";
		// blockUI("Fetching User details...");
        try{    
            const data = await getUserDetails("userid", userObj[0]);
			// unblockUI();
			if(data === "Invalid Session") ;//$rootScope.redirectPage();
			else if(data === "fail")alert(failMsg) ;//openModalPopup("Edit User", failMsg);
			else {
				const uType = data.type;
                dispatch({type:actionTypes.UPDATE_USERID,payload: data.userid});
                dispatch({type:actionTypes.UPDATE_INPUT_USERNAME,payload: data.username});
                dispatch({type:actionTypes.UPDATE_USERIDNAME,payload: data.userid+";"+data.username});
                dispatch({type:actionTypes.UPDATE_INPUT_PASSWORD,payload: data.password});
                dispatch({type:actionTypes.UPDATE_INPUT_FIRSTNAME,payload: data.firstname});
                dispatch({type:actionTypes.UPDATE_INPUT_LASTNAME,payload: data.lastname});
                dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload: data.email});
                dispatch({type:actionTypes.UPDATE_USERROLE,payload: data.role});
                dispatch({type:actionTypes.UPDATE_ROLENAME,payload: data.rolename});
                dispatch({type:actionTypes.UPDATE_ADDROLES,payload: {}});
                
                data.addrole.forEach((e) => dispatch({type:actionTypes.ADD_ADDROLE,payload: e}));
                
                
                dispatch({type:actionTypes.UPDATE_TYPE,payload: uType});
                dispatch({type:actionTypes.UPDATE_CONF_EXP,payload: false});
                dispatch({type:actionTypes.UPDATE_FTYPE,payload:  (uType==="inhouse")? "Default":((uType==="oidc")? "OpenID":uType.toUpperCase())});

				if (data.type !== "inhouse") {
					var confserver = data.server;
                    const wait = await selectUserType({type:data.type});
                    
                    if (!userConf.confServerList.some(function(e) { return e.name === confserver;})) {
                        dispatch({type:actionTypes.UPDATE_CONF_SERVER_LIST_PUSH,payload: {_id: '', name: confserver}});
                        dispatch({type:actionTypes.UPDATE_CONF_EXP,payload: confserver});
					}
                    dispatch({type:actionTypes.UPDATE_SERVER,payload: confserver});
                    dispatch({type:actionTypes.UPDATE_LDAP_USER,payload: data.ldapuser || ''});
					// $scope.$apply();    ???????????
				}
            }
        }catch(error){
            // 	unblockUI();
            // 	openModalPopup("Edit User", failMsg);
            alert(failMsg);
        }    
    }

    const searchFunctionUser = async(val)=>{
        setShowDropdownEdit(true);
        const items = userConf.allUsersList.filter((e)=>e[0].toUpperCase().indexOf(val.toUpperCase())!==-1)
        setAllUserFilList(items);
    }

    const searchFunctionLdap = async(val)=>{
        const items = userConf.ldapAllUserList.filter((e)=>e.html.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setLdapUserList(items);
    }
    

    return (
        <Fragment>
            <div id="page-taskName"><span>{(props.showEditUser===false)?"Create User":"Edit User"}</span></div>
            
            {(props.showEditUser===false)?
                <CreateLanding firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass} ldapSwitchFetch={ldapSwitchFetch} userNameAddClass={userNameAddClass} setShowDropdown={setShowDropdown} ldapUserList={ldapUserList} searchFunctionLdap={searchFunctionLdap}  ldapDirectoryAddClass={ldapDirectoryAddClass} confServerAddClass={confServerAddClass} clearForm={clearForm} setShowEditUser={props.setShowEditUser} ldapGetUser={ldapGetUser} click={click} edit={edit} manage={manage} selectUserType={selectUserType} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} showDropdown={showDropdown} />
                :<EditLanding firstnameAddClass={firstnameAddClass} lastnameAddClass={lastnameAddClass} deleteUser={deleteUser} confServerAddClass={confServerAddClass} ldapGetUser={ldapGetUser} ldapDirectoryAddClass={ldapDirectoryAddClass} clearForm={clearForm} allUserFilList={allUserFilList} manage={manage} searchFunctionUser={searchFunctionUser} click={click} setShowDropdownEdit={setShowDropdownEdit} showDropdownEdit={showDropdownEdit} getUserData={getUserData} />
            }    

            <div className="col-xs-9 form-group__conv">

                {(userConf.type === "inhouse")?
                    <Fragment>
                        <div className='leftControl adminControl'>
                            <input value={userConf.passWord} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_PASSWORD,payload:event.target.value})}} type="password" autoComplete="new-password" name="passWord" id="password" maxLength="16" className={passwordAddClass?"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex inputErrorBorder" :"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex"} placeholder="Password" />
                        </div>
                        <div className='rightControl adminControl'>
                            <input value={userConf.confirmPassword} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_CONFIRMPASSWORD,payload:event.target.value})}} type="password" autoComplete="new-password" name='confirmPassword' id='confirmPassword' maxLength="16" className={confirmPasswordAddClass?"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex inputErrorBorder" :"middle__input__border form-control__conv form-control-custom create spaceRegex passwordRegex"}  placeholder="Confirm Password"/>
                        </div>
                    </Fragment>
                    :null
                }   
                
                {/* PRESENT FOR EACH USERTYPE */}
                <div className='adminControl'>
					<input value={userConf.email} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_INPUT_EMAIL,payload:event.target.value})}} type="email" autoComplete="off" name="email" id="email" maxLength="100" className={emailAddClass?"middle__input__border form-control__conv form-control-custom create inputErrorBorder":"middle__input__border form-control__conv form-control-custom create"} placeholder="Email Id"/>
				</div>
				<div className="selectRole  adminControl" style={{ paddingLeft: "0" }} >
					<label className="leftControl primaryRole">Primary Role</label>
					<select value={userConf.role} disabled={props.showEditUser===true} className={userRolesAddClass?'adminSelect form-control__conv selectErrorBorder':'adminSelect form-control__conv '} onChange={(event)=>{dispatch({type:actionTypes.UPDATE_USERROLE,payload:event.target.value})}} id="userRoles" style={(props.showEditUser===true)?{backgroundColor: "#eee",cursor: "not-allowed"}:{}} >
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
      </Fragment>
  );
}

function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = event => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target)) {
            return;
          }
  
          handler(event);
        };
  
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
  
        return () => {
          document.removeEventListener('mousedown', listener);
          document.removeEventListener('touchstart', listener);
        };
      },
      [ref, handler]
    );
  }

export default CreateUser;

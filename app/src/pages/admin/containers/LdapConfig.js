import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg} from '../../global' 
import {testLDAPConnection, manageLDAPConfig} from '../api';
import '../styles/OidcConfig.scss'
import LdapConfigCreate from './LdapConfigCreate';
import LdapConfigEdit from './LdapConfigEdit';

/*Component LdapConfig
  use: defines Admin middle Section for Ldap Configuration
  ToDo:
*/

const LdapConfig = (props) => {

    const [ldapEdit,setLdapEdit] = useState(false)
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [serverName,setServerName] = useState("")
    const [url,setUrl] = useState("")
    const [auth,setAuth] = useState("anonymous")
    const [binddn,setBinddn] = useState("")
    const [bindCredentials,setBindCredentials] = useState("")
    const [basedn,setBasedn] = useState("")
    const [cert,setCert] = useState("")
    const [certName,setCertName] = useState("No file choosen")
    const [secure,setSecure] = useState("false")
    const [fieldmap,setFieldmap] = useState({uname: "None", fname: "None", lname: "None", email: "None"})
    const [fieldMapOpts,setFieldMapOpts] = useState(["None"])
    const [testStatus,setTestStatus] = useState("false")
    const [manageEdit,setManageEdit] = useState(false)
    const [manageCreate,setManageCreate] = useState(false)
	const [ldapServerURLErrBor,setLdapServerURLErrBor] = useState(false)
    const [binddnErrBor,setBinddnErrBor] = useState(false)
    const [bindCredentialsErrBor,setBindCredentialsErrBor] = useState(false)
    const [ldapBaseDNErrBor,setLdapBaseDNErrBor] = useState(false)
    const [ldapFMapUnameErrBor,setLdapFMapUnameErrBor] = useState(false)
    const [ldapFMapFnameErrBor,setLdapFMapFnameErrBor] = useState(false)
    const [ldapFMapLnameErrBor,setLdapFMapLnameErrBor] = useState(false)
    const [ldapFMapEmailErrBor,setLdapFMapEmailErrBor] = useState(false)
    const [ldapCertErrBor,setLdapCertErrBor] = useState(false)
	const [ldapServerNameErrBor,setLdapServerNameErrBor] = useState(false)

    useEffect(()=>{
        setLdapEdit(false);
		ldapConfReresh();
        // eslint-disable-next-line
	},[props.resetMiddleScreen["ldapConfigTab"],props.MiddleScreen])
	
	const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const ldapConfReresh = (action) =>{
        setServerName("");
		setUrl("");
		setAuth("anonymous");
		setBinddn("");
		setBindCredentials("");
		setBasedn("");
		setCert("");
		setCertName("No file choosen");
		setSecure("false");
		setFieldmap({uname: "None", fname: "None", lname: "None", email: "None"});
		setFieldMapOpts(["None"]);
		if (action!==undefined && action === "edit") setAuth("");
		setTestStatus("false");
		setManageCreate(!manageCreate);
		switchAuthType();
		switchSecureUrl();
        setLdapServerURLErrBor(false);setBinddnErrBor(false); setBindCredentialsErrBor(false);setLdapBaseDNErrBor(false);
        setLdapFMapUnameErrBor(false);setLdapFMapFnameErrBor(false);setLdapFMapLnameErrBor(false);
        setLdapFMapEmailErrBor(false);setLdapCertErrBor(false);setLdapServerNameErrBor(false);
    }

    const switchAuthType = () =>{
        if(auth === "anonymous") {
			setBinddn("");
			setBindCredentials("");
		}
    }

    const switchSecureUrl = () =>{
        var url1 = url.trim();
		if(secure === "false") {
			setCert("");
			setCertName("No file choosen");
			if (url1.toLowerCase().startsWith("ldaps://")) setUrl("ldap://" + url1.slice(8));
			if (url1.toLowerCase().endsWith(":636"))setUrl(url1.slice(0,-3) + "389");
		} else {
			if (url1.toLowerCase().startsWith("ldap://")) setUrl("ldaps://" + url1.slice(7));
			if (url1.toLowerCase().endsWith(":389")) setUrl(url1.slice(0,-3) + "636");
		}
    }

    const ldapTest = async () => {
        if (!validate("test")) return;
		//Transaction Activity for LDAP conf Test Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['LdapConftest']);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		setLoading("Testing Connection...");
		let data = await testLDAPConnection(auth, url, basedn, binddn, bindCredentials, secure, cert);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		var fields = (typeof data=="string")? [] : (data.fields || []);
		if (typeof data!=="string") data = data.flag;
		setTestStatus(data);
		if(data === "success") {
			setPopupState({show:true,title:"Test Connection",content: "Test Connection Successful!"});
			fields = fields.concat("None");
			for (const [key, value] of Object.entries(fieldmap)) {
				if (!fields.includes(value)) fields.push(value);
			}
			setFieldMapOpts(fields.sort());
		} else ldapTestMessage(data, setPopupState);
	}

    const ldapManage = async (action) =>{
		if (!validate(action)) return;
		var bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: serverName,
			url: url,
			basedn: basedn,
			secure: secure,
			cert: cert,
			auth: auth,
			binddn: binddn,
			bindcredentials: bindCredentials,
			fieldmap: fieldmap
		};
		setLoading(bAction.slice(0,-1)+"ing configuration...");
		try{
			const data = await manageLDAPConfig(action, confObj);
			if(data.error){displayError(data.error);return;}
			setLoading(false);
			if(data === "success") {
				setPopupState({show:true,title:bAction+" Configuration",content: "Configuration '"+confObj.name+"' "+action+"d Successfully!"});
				if (action === "create") ldapConfReresh();
                else setManageEdit(!manageEdit);
			} else if(data === "exists") {
                setLdapServerNameErrBor(true);
                setPopupState({show:true,title:bAction+" Configuration",content: "Configuration '"+confObj.name+"' already Exists!"});
			} else if(data === "fail") {
				if (action === "create") ldapConfReresh();
				else setManageEdit(!manageEdit);
                setPopupState({show:true,title:bAction+" Configuration",content:"Failed to "+action+" '"+confObj.name+"' configuration."});
			} else if(/^1[0-7]{8}$/.test(data)) {
				if (JSON.parse(JSON.stringify(data)[1])) {
                    setPopupState({show:true,title:bAction+" Configuration",content: "Failed to "+action+" '"+confObj.name+"' configuration. Invalid Request!"});
					return;
				}
				let errfields = [];
				let errHints = [];
				if (JSON.parse(JSON.stringify(data)[2])) errfields.push("Server Name");
				if (JSON.parse(JSON.stringify(data)[3])) errfields.push("Server URL");
				if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints.push("Secure Connection needs 'ldaps' protocol");
				else if (JSON.parse(JSON.stringify(data)[3]) === 3) errHints.push("Secure Connection needs a TLS Certificate");
				else if (JSON.parse(JSON.stringify(data)[3]) === 4) errHints.push("'ldaps' protocol needs secure connection enabled");
				else if (JSON.parse(JSON.stringify(data)[3]) === 5) errHints.push("'ldap(s)://' is missing from url prefix");
				if (JSON.parse(JSON.stringify(data)[4])) errfields.push("Base Domain Name");
				if (JSON.parse(JSON.stringify(data)[5])) errfields.push("Authentication Type");
				if (JSON.parse(JSON.stringify(data)[6])) errfields.push("Authentication Principal");
				if (JSON.parse(JSON.stringify(data)[7])) errfields.push("Authentication Credentials");
                if (JSON.parse(JSON.stringify(data)[8])) errfields.push("Data Mapping Settings");
                setPopupState({show:true,title:bAction+" Configuration",content: "Following values are invalid: "+errfields.join(", ")+ ((errHints.length!==0)? (". Note: "+errHints):'.')});
			}
		}catch(error) {
            setLoading(false);
            setPopupState({show:true,title:bAction+" Configuration",content:"Failed to "+action+" '"+confObj.name+"' configuration."});
		}
    }

    const validate = (action) => {
        let flag = true;
		const secureLdap = secure !== "false";
		setLdapServerURLErrBor(false);setBinddnErrBor(false); setBindCredentialsErrBor(false);setLdapBaseDNErrBor(false)
        setLdapFMapUnameErrBor(false);setLdapFMapFnameErrBor(false);setLdapFMapLnameErrBor(false)
        setLdapFMapEmailErrBor(false);setLdapCertErrBor(false)
		setLdapServerNameErrBor(false);
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		let regExURL = /^ldap:\/\/[A-Za-z0-9.-]+:\d+$/;
		if (secureLdap) regExURL = /^ldaps:\/\/[A-Za-z0-9.-]+:\d+$/;
		if (serverName === "") {
			setLdapServerNameErrBor(true);
			flag = false;
		} else if (!regExName.test(serverName) && action === "create") {
            setLdapServerNameErrBor(true);
            setPopupState({show:true,title:"Error",content:  "Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen."});
			flag = false;
		}
		if (url === "") {
			setLdapServerURLErrBor(true);
			flag = false;
		} else if (!regExURL.test(url)) {
			setLdapServerURLErrBor(true);
            setPopupState({show:true,title:"Error",content:  "Invalid URL provided! URL must start with 'ldap"+((secureLdap)?'s':'')+"://' followed by either an IP or a well defined domain name followed by a port number."});
            flag = false;
		}
		if (basedn === "") {
			setLdapBaseDNErrBor(true);
			flag = false;
		}
		if (secureLdap && cert === "") {
			setLdapCertErrBor(true);
			flag = false;
		}
		if (binddn === "" && auth === "simple") {
			setBinddnErrBor(true);
			flag = false;
		}
		if (bindCredentials === "" && auth === "simple" && action === "create") {
			setBindCredentialsErrBor(true);
			flag = false;
		}
		if (action !== "test" && action !== "delete") {
			if (fieldmap.uname === "") {
				setLdapFMapUnameErrBor(true);
				flag = false;
			}
			if (fieldmap.fname === "") {
				setLdapFMapFnameErrBor(true);
				flag = false;
			}
			if (fieldmap.lname === "") {
				setLdapFMapLnameErrBor(true);
				flag = false;
			}
			if (fieldmap.email === "") {
				setLdapFMapEmailErrBor(true);
				flag = false;
			}
		}
		return flag;
    }

    const closePopup = () =>{
		setPopupState({show:false,title:"",content:""});
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}

            {ldapEdit===false?
                <LdapConfigCreate manageCreate={manageCreate} setPopupState={setPopupState} ldapManage={ldapManage} ldapTest={ldapTest} ldapServerNameErrBor={ldapServerNameErrBor} ldapCertErrBor={ldapCertErrBor} ldapFMapEmailErrBor={ldapFMapEmailErrBor} ldapFMapLnameErrBor={ldapFMapLnameErrBor} ldapFMapFnameErrBor={ldapFMapFnameErrBor} ldapFMapUnameErrBor={ldapFMapUnameErrBor} ldapBaseDNErrBor={ldapBaseDNErrBor} bindCredentialsErrBor={bindCredentialsErrBor} binddnErrBor={binddnErrBor} ldapServerURLErrBor={ldapServerURLErrBor} setFieldmap={setFieldmap} cert={cert} setLdapEdit={setLdapEdit} fieldmap={fieldmap} fieldMapOpts={fieldMapOpts} testStatus={testStatus} setCert={setCert} auth={auth} setAuth={setAuth} binddn={binddn} setBinddn={setBinddn} bindCredentials={bindCredentials} setBindCredentials={setBindCredentials} setCertName={setCertName} certName={certName} serverName={serverName} secure={secure} setSecure={setSecure} setServerName={setServerName} setBasedn={setBasedn} basedn={basedn} url={url} setUrl={setUrl} />
                :<LdapConfigEdit setLdapServerNameErrBor={setLdapServerNameErrBor} setPopupState={setPopupState} popupState={popupState} manageEdit={manageEdit} ldapManage={ldapManage} ldapTest={ldapTest} ldapServerNameErrBor={ldapServerNameErrBor} ldapCertErrBor={ldapCertErrBor} ldapFMapEmailErrBor={ldapFMapEmailErrBor} ldapFMapLnameErrBor={ldapFMapLnameErrBor} ldapFMapFnameErrBor={ldapFMapFnameErrBor} ldapFMapUnameErrBor={ldapFMapUnameErrBor} ldapBaseDNErrBor={ldapBaseDNErrBor} bindCredentialsErrBor={bindCredentialsErrBor} binddnErrBor={binddnErrBor} ldapServerURLErrBor={ldapServerURLErrBor} setLdapCertErrBor={setLdapCertErrBor} setLdapFMapEmailErrBor={setLdapFMapEmailErrBor} setLdapFMapLnameErrBor={setLdapFMapLnameErrBor} setLdapFMapFnameErrBor={setLdapFMapFnameErrBor} setLdapBaseDNErrBor={setLdapBaseDNErrBor} setBindCredentialsErrBor={setBindCredentialsErrBor} setLdapFMapUnameErrBor={setLdapFMapUnameErrBor} setBinddnErrBor={setBinddnErrBor} setLdapServerURLErrBor={setLdapServerURLErrBor} setTestStatus={setTestStatus} setFieldMapOpts={setFieldMapOpts} setFieldmap={setFieldmap} setSecure={setSecure} setCert={setCert} setBasedn={setBasedn} setBindCredentials={setBindCredentials} setBinddn={setBinddn} setAuth={setAuth} setUrl={setUrl} cert={cert} ldapEdit={ldapEdit} setLdapEdit={setLdapEdit} fieldmap={fieldmap} fieldMapOpts={fieldMapOpts} testStatus={testStatus} auth={auth} binddn={binddn} bindCredentials={bindCredentials} setCertName={setCertName} certName={certName} serverName={serverName} secure={secure} setServerName={setServerName} basedn={basedn} url={url}/>
            }
        </Fragment>
  );
}

const ldapTestMessage = async (data, setPopupState) => {
	switch(data) {
		case "invalid_addr": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Either host is unavailable or port is incorrect."}); break;
		case "mismatch_secure" :  setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Secure connection must be enabled for 'ldaps' protocol."}); break;
		case "invalid_cert" : setPopupState({show:true,title:"Test Connection",content:  "Test Connection Failed! 'ldaps://' protocol require TLS Certificate."}); break;
		case "invalid_cacert" : setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! TLS Certificate should have full certificate chain including issuer CA certificate."}); break;
		case "invalid_cacert_host": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Hostname/IP provided for connection is not in the TLS Certificate's list."});break;
		case "invalid_url": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Invalid URL. It must start with 'ldap://'"});break;
		case "invalid_auth": setPopupState({show:true,title:"Test Connection",content: "Test Connection Success! Anonymous access is not allowed for this server."});break;
		case "invalid_credentials": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Credentials provided for Authentication are invalid."});break;
		case "insufficient_access": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Credentials provided does not have required privileges for setting up LDAP."});break;
		case "invalid_basedn": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Base Domain Name is incorrect."});break;
		case "empty": setPopupState({show:true,title:"Test Connection",content: "Test Connection Successful but LDAP directory is empty!"});break;
		case "spl_chars": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed! Special characters found in LDAP configuration values."});break;
		case "fail": setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed!"});break;
		default: setPopupState({show:true,title:"Test Connection",content: "Test Connection Failed due to unexpected error!"});break;
  	}
}

export default LdapConfig;
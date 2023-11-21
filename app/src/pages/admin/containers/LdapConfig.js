import React, { Fragment, useState, useEffect } from 'react';
import { ScreenOverlay, setMsg, Messages as MSG, VARIANT } from '../../global'
import { testLDAPConnection, manageLDAPConfig } from '../api';
import '../styles/OidcConfig.scss'
import LdapConfigCreate from '../components/LdapConfigCreate';
import LdapConfigEdit from '../components/LdapConfigEdit';
import OriginContainer from './OriginContainer';
import { useSelector } from 'react-redux';

/*Component LdapConfig
  use: defines Admin middle Section for Ldap Configuration
  ToDo:
*/

const LdapConfig = (props) => {

    const [ldapEdit, setLdapEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [serverName, setServerName] = useState("")
    const [url, setUrl] = useState("")
    const [auth, setAuth] = useState("anonymous")
    const [binddn, setBinddn] = useState("")
    const [bindCredentials, setBindCredentials] = useState("")
    const [basedn, setBasedn] = useState("")
    const [cert, setCert] = useState("")
    const [certName, setCertName] = useState("No file choosen")
    const [secure, setSecure] = useState("false")
    const [fieldmap, setFieldmap] = useState({ uname: "None", fname: "None", lname: "None", email: "None" })
    const [fieldMapOpts, setFieldMapOpts] = useState(["None"])
    const [testStatus, setTestStatus] = useState("false")
    const [manageEdit, setManageEdit] = useState(false)
    const [manageCreate, setManageCreate] = useState(false)
    const [ldapServerURLErrBor, setLdapServerURLErrBor] = useState(false)
    const [binddnErrBor, setBinddnErrBor] = useState(false)
    const [bindCredentialsErrBor, setBindCredentialsErrBor] = useState(false)
    const [ldapBaseDNErrBor, setLdapBaseDNErrBor] = useState(false)
    const [ldapFMapUnameErrBor, setLdapFMapUnameErrBor] = useState(false)
    const [ldapFMapFnameErrBor, setLdapFMapFnameErrBor] = useState(false)
    const [ldapFMapLnameErrBor, setLdapFMapLnameErrBor] = useState(false)
    const [ldapFMapEmailErrBor, setLdapFMapEmailErrBor] = useState(false)
    const [ldapCertErrBor, setLdapCertErrBor] = useState(false)
    const [ldapServerNameErrBor, setLdapServerNameErrBor] = useState(false)
    const popupState = props.popupState
    const currentScreen = useSelector(state => state.admin.screen);

    useEffect(() => {
        setLdapEdit(false);
        ldapConfReresh();

    }, [currentScreen === 'ldapConf'])

    const displayError = (error) => {
        setLoading(false)
        setMsg(error)
    }

    const ldapConfReresh = (action) => {
        setServerName("");
        setUrl("");
        setAuth("anonymous");
        setBinddn("");
        setBindCredentials("");
        setBasedn("");
        setCert("");
        setCertName("No file choosen");
        setSecure("false");
        setFieldmap({ uname: "None", fname: "None", lname: "None", email: "None" });
        setFieldMapOpts(["None"]);
        if (action !== undefined && action === "edit") setAuth("");
        setTestStatus("false");
        setManageCreate(!manageCreate);
        switchAuthType();
        switchSecureUrl();
        setLdapServerURLErrBor(false); setBinddnErrBor(false); setBindCredentialsErrBor(false); setLdapBaseDNErrBor(false);
        setLdapFMapUnameErrBor(false); setLdapFMapFnameErrBor(false); setLdapFMapLnameErrBor(false);
        setLdapFMapEmailErrBor(false); setLdapCertErrBor(false); setLdapServerNameErrBor(false);
    }

    const switchAuthType = () => {
        if (auth === "anonymous") {
            setBinddn("");
            setBindCredentials("");
        }
    }

    const switchSecureUrl = () => {
        var url1 = url.trim();
        if (secure === "false") {
            setCert("");
            setCertName("No file choosen");
            if (url1.toLowerCase().startsWith("ldaps:")) setUrl("ldap:" + url1.slice(8));
            if (url1.toLowerCase().endsWith(":636")) setUrl(url1.slice(0, -3) + "389");
        } else {
            if (url1.toLowerCase().startsWith("ldap:")) setUrl("ldaps:" + url1.slice(7));
            if (url1.toLowerCase().endsWith(":389")) setUrl(url1.slice(0, -3) + "636");
        }
    }

    const ldapTest = async () => {
        if (!validate("test")) return;
        // Transaction Activity for LDAP conf Test Button Action
        // var labelArr = [];
        // var infoArr = [];
        // labelArr.push(txnHistory.codesDict['LdapConftest']);
        // txnHistory.log($event.type, labelArr, infoArr, $location.$$path);
        setLoading("Testing Connection...");
        let data = await testLDAPConnection(auth, url, basedn, binddn, bindCredentials, secure, cert);
        if (data.error) { displayError(data.error); return; }
        setLoading(false);
        var fields = (typeof data == "string") ? [] : (data.fields || []);
        if (typeof data !== "string") data = data.flag;
        setTestStatus(data);
        if (data === "success") {
            setMsg(MSG.ADMIN.SUCC_TEST);
            fields = fields.concat("None");
            for (const [key, value] of Object.entries(fieldmap)) {
                if (!fields.includes(value)) fields.push(value);
            }
            setFieldMapOpts(fields.sort());
        } else ldapTestMessage(data);
    }

    const ldapManage = async (action) => {
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
        setLoading(bAction.slice(0, -1) + "ing configuration...");
        try {
            const data = await manageLDAPConfig(action, confObj);
            if (data.error) { displayError(data.error); return; }
            setLoading(false);
            if (data === "success") {
                setMsg(MSG.CUSTOM("Configuration '" + confObj.name + "' " + action + "d Successfully!", VARIANT.SUCCESS));
                if (action === "create") ldapConfReresh();
                else setManageEdit(!manageEdit);
            } else if (data === "exists") {
                setLdapServerNameErrBor(true);
                setMsg(MSG.CUSTOM("Configuration '" + confObj.name + "' already Exists!", VARIANT.WARNING));
            } else if (data === "fail") {
                if (action === "create") ldapConfReresh();
                else setManageEdit(!manageEdit);
                setMsg(MSG.CUSTOM("Failed to " + action + " '" + confObj.name + "' configuration.", VARIANT.ERROR));
            } else if (/^1[0-7]{8}$/.test(data)) {
                if (JSON.parse(JSON.stringify(data)[1])) {
                    setMsg(MSG.CUSTOM("Failed to " + action + " '" + confObj.name + "' configuration. Invalid Request!", VARIANT.ERROR));
                    return;
                }
                let errfields = [];
                let errHints = [];
                if (JSON.parse(JSON.stringify(data)[2])) errfields.push("Server Name");
                if (JSON.parse(JSON.stringify(data)[3])) errfields.push("Server URL");
                if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints.push("Secure Connection needs 'ldaps' protocol");
                else if (JSON.parse(JSON.stringify(data)[3]) === 3) errHints.push("Secure Connection needs a TLS Certificate");
                else if (JSON.parse(JSON.stringify(data)[3]) === 4) errHints.push("'ldaps' protocol needs secure connection enabled");
                else if (JSON.parse(JSON.stringify(data)[3]) === 5) errHints.push("'ldap(s):' is missing from url prefix");
                if (JSON.parse(JSON.stringify(data)[4])) errfields.push("Base Domain Name");
                if (JSON.parse(JSON.stringify(data)[5])) errfields.push("Authentication Type");
                if (JSON.parse(JSON.stringify(data)[6])) errfields.push("Authentication Principal");
                if (JSON.parse(JSON.stringify(data)[7])) errfields.push("Authentication Credentials");
                if (JSON.parse(JSON.stringify(data)[8])) errfields.push("Data Mapping Settings");
                setMsg(MSG.CUSTOM("Following values are invalid: " + errfields.join(", ") + ((errHints.length !== 0) ? (". Note: " + errHints) : '.'), VARIANT.WARNING));
            }
        } catch (error) {
            setLoading(false);
            setMsg(MSG.CUSTOM("Failed to " + action + " '" + confObj.name + "' configuration.", VARIANT.ERROR));
        }
    }

    const validate = (action) => {
        let flag = true;
        const secureLdap = secure !== "false";
        setLdapServerURLErrBor(false); setBinddnErrBor(false); setBindCredentialsErrBor(false); setLdapBaseDNErrBor(false)
        setLdapFMapUnameErrBor(false); setLdapFMapFnameErrBor(false); setLdapFMapLnameErrBor(false)
        setLdapFMapEmailErrBor(false); setLdapCertErrBor(false)
        setLdapServerNameErrBor(false);
        const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
        let regExURL = /^ldap:\/\/[A-Za-z0-9.-]+:\d+$/;
        if (secureLdap) regExURL = /^ldaps:\/\/[A-Za-z0-9.-]+:\d+$/;
        if (serverName === "") {
            setLdapServerNameErrBor(true);
            flag = false;
        } else if (!regExName.test(serverName) && action === "create") {
            setLdapServerNameErrBor(true);
            setMsg(MSG.ADMIN.WARN_INVALID_SERVER_NAME);
            flag = false;
        }
        if (url === "") {
            setLdapServerURLErrBor(true);
            flag = false;
        } else if (!regExURL.test(url)) {
            setLdapServerURLErrBor(true);
            setMsg(MSG.CUSTOM("Invalid URL provided! URL must start with 'ldap" + ((secureLdap) ? 's' : '') + ":' followed by either an IP or a well defined domain name followed by a port number.", VARIANT.WARNING));
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

    return (
        <Fragment>
            {loading ? <ScreenOverlay content={loading} /> : null}
            {ldapEdit === false ?
                <LdapConfigCreate manageCreate={manageCreate} ldapManage={ldapManage} 
                    ldapTest={ldapTest} ldapServerNameErrBor={ldapServerNameErrBor} 
                    ldapCertErrBor={ldapCertErrBor} ldapFMapEmailErrBor={ldapFMapEmailErrBor} 
                    ldapFMapLnameErrBor={ldapFMapLnameErrBor} ldapFMapFnameErrBor={ldapFMapFnameErrBor} 
                    ldapFMapUnameErrBor={ldapFMapUnameErrBor} ldapBaseDNErrBor={ldapBaseDNErrBor} 
                    bindCredentialsErrBor={bindCredentialsErrBor} binddnErrBor={binddnErrBor} 
                    ldapServerURLErrBor={ldapServerURLErrBor} setFieldmap={setFieldmap} cert={cert}
                     setLdapEdit={setLdapEdit} fieldmap={fieldmap} fieldMapOpts={fieldMapOpts} 
                     testStatus={testStatus} setCert={setCert} auth={auth} 
                     setAuth={setAuth} binddn={binddn} setBinddn={setBinddn} 
                     bindCredentials={bindCredentials} setBindCredentials={setBindCredentials} 
                     setCertName={setCertName} certName={certName} serverName={serverName}
                      secure={secure} setSecure={setSecure} setServerName={setServerName} 
                      setBasedn={setBasedn} basedn={basedn} url={url} setUrl={setUrl} />

                : <LdapConfigEdit setLdapServerNameErrBor={setLdapServerNameErrBor} popupState={popupState}
                 manageEdit={manageEdit} ldapManage={ldapManage} ldapTest={ldapTest} 
                 ldapServerNameErrBor={ldapServerNameErrBor} ldapCertErrBor={ldapCertErrBor} 
                 ldapFMapEmailErrBor={ldapFMapEmailErrBor} ldapFMapLnameErrBor={ldapFMapLnameErrBor} 
                 ldapFMapFnameErrBor={ldapFMapFnameErrBor} ldapFMapUnameErrBor={ldapFMapUnameErrBor} 
                 ldapBaseDNErrBor={ldapBaseDNErrBor} bindCredentialsErrBor={bindCredentialsErrBor} 
                 binddnErrBor={binddnErrBor} ldapServerURLErrBor={ldapServerURLErrBor} 
                 setLdapCertErrBor={setLdapCertErrBor} setLdapFMapEmailErrBor={setLdapFMapEmailErrBor}
                  setLdapFMapLnameErrBor={setLdapFMapLnameErrBor} setLdapFMapFnameErrBor={setLdapFMapFnameErrBor} 
                  setLdapBaseDNErrBor={setLdapBaseDNErrBor} setBindCredentialsErrBor={setBindCredentialsErrBor} 
                  setLdapFMapUnameErrBor={setLdapFMapUnameErrBor} setBinddnErrBor={setBinddnErrBor}
                   setLdapServerURLErrBor={setLdapServerURLErrBor} setTestStatus={setTestStatus} 
                   setFieldMapOpts={setFieldMapOpts} setFieldmap={setFieldmap} setSecure={setSecure}
                    setCert={setCert} setBasedn={setBasedn} setBindCredentials={setBindCredentials} 
                    setBinddn={setBinddn} setAuth={setAuth} setUrl={setUrl} cert={cert} ldapEdit={ldapEdit}
                     setLdapEdit={setLdapEdit} fieldmap={fieldmap} fieldMapOpts={fieldMapOpts} testStatus={testStatus} 
                     auth={auth} binddn={binddn} bindCredentials={bindCredentials} setCertName={setCertName} 
                     certName={certName} serverName={serverName} secure={secure} setServerName={setServerName} basedn={basedn} url={url} />
            }


        </Fragment>
    );
}

const ldapTestMessage = async (data) => {
    switch (data) {
        case "invalid_addr": setMsg(MSG.ADMIN.ERR_PORT_INCORRECT); break;
        case "mismatch_secure": setMsg(MSG.ADMIN.ERR_LDAP_PROTOCOL); break;
        case "invalid_cert": setMsg(MSG.ADMIN.ERR_TLS_CERT); break;
        case "invalid_cacert": setMsg(MSG.ADMIN.ERR_ISSUER_CA_CERT); break;
        case "invalid_cacert_host": setMsg(MSG.ADMIN.ERR_NOT_IN_TLS_CERT); break;
        case "invalid_url": setMsg(MSG.ADMIN.ERR_TEST_INVALID_URL); break;
        case "invalid_auth": setMsg(MSG.ADMIN.ERR_ANONYMOUS_ACCESS); break;
        case "invalid_credentials": setMsg(MSG.ADMIN.ERR_INVALID_CRED_TEST); break;
        case "insufficient_access": setMsg(MSG.ADMIN.ERR_PRIVILEGE_TEST); break;
        case "invalid_basedn": setMsg(MSG.ADMIN.ERR_BASE_DOMAIN_TEST); break;
        case "empty": setMsg(MSG.ADMIN.ERR_DIRECTORY_EMPTY); break;
        case "spl_chars": setMsg(MSG.ADMIN.ERR_TEST_SPEC_CHAR); break;
        case "fail": setMsg(MSG.ADMIN.ERR_TEST_CONNECTION); break;
        default: setMsg(MSG.ADMIN.ERR_TEST_CONNECT_UNEXPECTED); break;
    }

}

export default LdapConfig;
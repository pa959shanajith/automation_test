import React, { useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ModalContainer, ScrollBar} from '../../global' 
import {getLDAPConfig} from '../api';
import '../styles/LdapConfigEdit.scss'
import LdapConfigurationForm from '../components/LdapConfigurationForm';
import LdapDataMapping from '../components/LdapDataMapping';


/*Component LdapConfigEdit
  use: defines Admin middle Section for edit Ldap Configuration
  ToDo:
*/

const LdapConfigEdit = (props) => {

    const [loading,setLoading] = useState(false)
    const [selBox,setSelBox] = useState([])
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const [emptyPopup,setEmptyPopup] = useState(false)

    useEffect(()=>{
        LdapEdit();
        // eslint-disable-next-line
    },[props.manageEdit])
    
    const displayError = (error) =>{
        setLoading(false)
        props.setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const LdapEdit = async () => {
		props.setServerName("");
		props.setUrl("");
		props.setBinddn("");
		props.setBindCredentials("");
		props.setBasedn("");
		props.setCert("");
		props.setCertName("No file choosen");
		props.setSecure("false");
		props.setFieldmap({uname: "None", fname: "None", lname: "None", email: "None"});
		props.setFieldMapOpts(["None"]);
		props.setAuth("");
		props.setTestStatus("false");
		switchSecureUrl();
        props.setLdapServerURLErrBor(false);props.setBinddnErrBor(false); props.setBindCredentialsErrBor(false);props.setLdapBaseDNErrBor(false)
        props.setLdapFMapUnameErrBor(false);props.setLdapFMapFnameErrBor(false);props.setLdapFMapLnameErrBor(false)
        props.setLdapFMapEmailErrBor(false);props.setLdapCertErrBor(false)
		setLoading("Fetching details...");
		const data = await getLDAPConfig("server");
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "empty") {
            if(props.popupState.show === true) setEmptyPopup(true);
            else props.setPopupState({show:true,title:"Edit Configuration",content: "There are no configurations created yet."});
            setSelBox([]);
        } else {
            data.sort();
            const selBoxOptions = [];
            for(var i = 0; i < data.length; i++){
                selBoxOptions.push(data[i].name);
            }
            setSelBox(selBoxOptions);
        }
	}

    const switchSecureUrl = () => {
        var url1 = props.url.trim();
		if(props.secure === "false") {
			props.setCert("");
			props.setCertName("No file choosen");
			if (url1.toLowerCase().startsWith("ldaps://")) props.setUrl("ldap://" + url1.slice(8));
			if (url1.toLowerCase().endsWith(":636")) props.setUrl(url1.slice(0,-3) + "389");
		} else {
			if (url1.toLowerCase().startsWith("ldap://")) props.setUrl("ldaps://" + url1.slice(7));
			if (url1.toLowerCase().endsWith(":389")) props.setUrl(url1.slice(0,-3) + "636");
		}
    }

    const closePopup = () => {
        props.setPopupState({show:false,title:"",content:""});
        if(emptyPopup){
			props.setPopupState({show:true,title:"Edit Configuration",content: "There are no configurations created yet."});
			setEmptyPopup(false);
		}
    }

    const getServerData = async (name) => {
        props.setLdapServerURLErrBor(false);props.setBinddnErrBor(false); props.setBindCredentialsErrBor(false);props.setLdapBaseDNErrBor(false)
        props.setLdapFMapUnameErrBor(false);props.setLdapFMapFnameErrBor(false);props.setLdapFMapLnameErrBor(false)
        props.setLdapFMapEmailErrBor(false);props.setLdapCertErrBor(false)
		var failMsg = "Failed to fetch details for '"+name+"' configuration.";
		setLoading("Fetching details...");
		try{
            const data = await getLDAPConfig("config", name);
            if(data.error){displayError(data.error);return;}
			setLoading(false);
			if(data === "fail") {
                // props.setPopupState({show:true,title:"Edit Configuration",content: failMsg});
                // if name required in popup remove fail condition from api 
			} else {
				props.setUrl(data.url);
				props.setBasedn(data.basedn);
				props.setSecure(data.secure);
				props.setCert(data.cert);
				props.setCertName("No file choosen");
				props.setAuth(data.auth);
				props.setBinddn(data.binddn);
				props.setBindCredentials(data.bindCredentials);
                props.setFieldMapOpts(["None"]);
				for (let fmo of Object.values(data.fieldmap)) {
					if (!props.fieldMapOpts.includes(fmo)) props.fieldMapOpts.push(fmo);
                }
                props.setFieldMapOpts(props.fieldMapOpts);
				props.setFieldmap(data.fieldmap);
			}
		}catch(error) {
			setLoading(false);
			props.setPopupState({show:true,title:"Edit Configuration",content: failMsg});
		}
    }

    const closeModal = () => {
        setshowDeleteModal(false);
    }

    return (
        <div className="ldap_container-edit">
            {props.popupState.show?<PopupMsg content={props.popupState.content} title={props.popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div id="page-taskName"><span>Create LDAP Configuration</span></div>
            <div className="adminActionBtn-oidc">
                <button className="btn-md-ldap adminBtn-ldap ldap-disabled-btn btn-margin-ldap" onClick={()=>{props.ldapTest()}} disabled={props.serverName === ''} title="Test Configuration">Test</button> 
                <button className="btn-md-ldap adminBtn-ldap ldap-disabled-btn btn-margin-ldap" onClick={()=>{setshowDeleteModal(true)}} disabled={props.serverName === ''} title="Delete Configuration">Delete</button>            
                <button className="btn-md-ldap adminBtn-ldap ldap-disabled-btn" onClick={()=>{props.ldapManage('update')}} disabled={props.serverName === ''} title="Update Configuration">Update</button>
            </div>
            <div className="ldap-content_wrapper-edit">
                <ScrollBar thumbColor="#929397">
                <div className="col-xs-9 form-group-ldap adminForm-ldap">
                <h4 className='title-ldap' >LDAP Server Details</h4>
                    <div  className='userForm-ldap-edit adminControl-ldap'><div>
                        <span  className="leftControl-ldap" title="Server Name">Server Name</span>
                        <select defaultValue={""} onChange={(event)=>{props.setServerName(event.target.value);getServerData(event.target.value)}}  className={'adminSelect-ldap-edit form-control-ldap-edit'+ (props.ldapServerNameErrBor ? " selectErrorBorder" : "")} id="ldapServerName" >
                            <option value="" disabled>Select Server</option>
                            {selBox.map((data,index)=>(
                                <option key={index} value={data}>{data}</option>
                            ))}
                        </select>
                    </div></div>
                    
                    <LdapConfigurationForm {...props}  />
                    <LdapDataMapping setFieldmap={props.setFieldmap} ldapEdit={props.ldapEdit} fieldmap={props.fieldmap} fieldMapOpts={props.fieldMapOpts}  ldapFMapEmailErrBor={props.ldapFMapEmailErrBor} ldapFMapLnameErrBor={props.ldapFMapLnameErrBor} ldapFMapFnameErrBor={props.ldapFMapFnameErrBor} ldapFMapUnameErrBor={props.ldapFMapUnameErrBor} />
                </div>
                </ScrollBar>
            </div>
            

            {showDeleteModal?
                <ModalContainer title="Delete Configuration" footer={deleteModalButtons(props.ldapManage, setshowDeleteModal)} close={closeModal} content="Are you sure you want to delete ? Users depending on this configuration will not be able to login." />
            :null} 
        </div>
    );
}

const deleteModalButtons = (ldapManage, setshowDeleteModal) => {
    return(
        <div>
            <button id="deleteGlobalModalButton-ldap" onClick={()=>{ldapManage("delete");setshowDeleteModal(false);}} type="button" className=" btn-margin-ldap" >Yes</button>
            <button type="button" onClick={()=>{setshowDeleteModal(false);}} >No</button>
        </div>
    )
}

export default LdapConfigEdit;
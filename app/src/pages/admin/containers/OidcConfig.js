import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, RedirectPage, ModalContainer, ScrollBar, VARIANT, Messages as MSG} from '../../global' 
import {getOIDCConfig, manageOIDCConfig} from '../api';
import ValidationExpression from '../../global/components/ValidationExpression';
import { useHistory } from 'react-router-dom';
import '../styles/OidcConfig.scss'


/*Component OidcConfig
  use: defines Admin middle Section for Oidc Configuration
  ToDo:
*/

const OidcConfig = (props) => {

    const history = useHistory();
    const [oidcEdit,setOidcEdit] = useState(false)
    const [loading,setLoading] = useState(false)
    const [name,setName] = useState("")
    const [url,setUrl] = useState("")
    const [clientId,setClientId] = useState("")
    const [secret,setSecret] = useState("")
    const [nameErrBorder,setNameErrBorder] = useState(false)
    const [urlErrBorder,setUrlErrBorder] = useState(false)
    const [clientIdErrBorder,setClientIdErrBorder] = useState(false)
    const [secretErrBorder,setSecretErrBorder] = useState(false)
    const [selBox,setSelBox] = useState([])
    const [showDeleteModal,setshowDeleteModal] = useState(false)
    const setPopupState = props.setPopupState

    useEffect(()=>{
        setOidcEdit(false);
        oidcReset();
        // eslint-disable-next-line
    },[props.resetMiddleScreen["oidcConfigTab"],props.MiddleScreen])
   
    const oidcReset = () =>{
        setName("");
		setUrl("");
		setClientId("");
        setSecret("");
        setUrlErrBorder(false);
        setClientIdErrBorder(false);
        setSecretErrBorder(false);
        setNameErrBorder(false);
        if(document.getElementById("oidcServerName")) document.getElementById("oidcServerName").selectedIndex = "0";  
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            variant:error.VARIANT,
            content:error.CONTENT,
            submitText:'Ok',
            show:true
        })
    }

    const onClickEditButton = async () =>{
        oidcReset();
        setLoading("Fetching details...");
        const data = await getOIDCConfig()
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "empty") {
            displayError(MSG.ADMIN.WARN_EMPTY_CONFIG);
            setSelBox([]);
        } else {
            data.sort();
            var dataOptions = [];
            for(var i = 0; i < data.length; i++) dataOptions.push(data[i].name);
            setSelBox(dataOptions);
        }
    }

    const oidcGetServerData = async (name) =>{
		const failMsg = "Failed to fetch details for '"+name+"' configuration.";
        setLoading("Fetching details...");
		const data = await getOIDCConfig(name);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "empty") setPopupState({show:true,variant:VARIANT.ERROR,content:failMsg + "No such configuration exists"});
        else {
            setUrl(data.url);
            setClientId(data.clientid);
            setSecret(data.secret);
        }
    }

    const oidcConfManage = async (action) =>{

		if (!oidcConfValidate(action)) return;
		const bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: name,
			url: url,
			clientid: clientId,
			secret: secret
		};
		const failMsg = "Failed to "+action+" '"+confObj.name+"' configuration.";
        setLoading(bAction.slice(0,-1)+"ing configuration...");
		const data = await manageOIDCConfig(action, confObj);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "Invalid Session") {
            RedirectPage(history);
        } else if(data === "success") {
            if (action === "create") oidcReset();
            else onClickEditButton();
            setPopupState({show:true,variant : VARIANT.SUCCESS,content: "Configuration '"+confObj.name+"' "+action+"d successfully!"});
        } else if(data === "exists") {
            setNameErrBorder(true);
            setPopupState({show:true,variant : VARIANT.WARNING,content: "Configuration '"+confObj.name+"' already Exists!"});
        } else if(data === "fail") {
            if (action === "create") oidcReset();
            else onClickEditButton();
            setPopupState({show:true,variant : VARIANT.ERROR,content: "Failed to "+action+" '"+confObj.name+"' configuration."});
        } else if(/^1[0-3]{4}$/.test(data)) {
            if (JSON.parse(JSON.stringify(data)[1])) {
                setPopupState({show:true,variant : VARIANT.ERROR,content: failMsg+" Invalid Request!"});
                return;
            }
            let errHints = "<br/>";
            if (JSON.parse(JSON.stringify(data)[2])) setNameErrBorder(true);
            if (JSON.parse(JSON.stringify(data)[3])) setUrl(true);
            if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints += "Issuer must start with http:// or https://<br/>";
            if (JSON.parse(JSON.stringify(data)[4])) setClientIdErrBorder(true);
            if (JSON.parse(JSON.stringify(data)[5])) setSecretErrBorder(true);
            setPopupState({show:true,variant : VARIANT.WARNING,content: "Some values are Invalid!" + errHints});
        }
    }

    const oidcConfValidate = (action) =>{
        let flag = true;
		let popped = false;
		setUrlErrBorder(false);
        setClientIdErrBorder(false);
        setSecretErrBorder(false);
        setNameErrBorder(false);
		const regExName = /^[A-Za-z0-9]+([A-Za-z0-9-]*[A-Za-z0-9]+|[A-Za-z0-9]*)$/;
		const regExURL = /^http[s]?:\/\/[A-Za-z0-9._-].*$/i;
		if (name === "") {
			setNameErrBorder(true);
			flag = false;
		} else if (!regExName.test(name) && action === "create") {
            setNameErrBorder(true);
            displayError(MSG.ADMIN.WARN_INVALID_SERVER_NAME);
            flag = false;
			popped = true;
		}
		if (url === "") {
			setUrlErrBorder(true);
			flag = false;
		} else if (regExURL.test(url) === false) {
			setUrlErrBorder(true);
			if (!popped)displayError(MSG.ADMIN.WARN_INVALID_URL);
			flag = false;
			popped = true;
		}
		if (clientId === "") {
			setClientIdErrBorder(true);
			flag = false;
		}
		if (secret === "") {
			setSecretErrBorder(true);
			flag = false;
		}
		return flag;
    }

    const oidcConfDelete = () =>{
        setshowDeleteModal(true);
    }

    const closeModal = () =>{
        setshowDeleteModal(false);
    }

    const updateOidcServerName = (value) => {
		value = ValidationExpression(value,"oidcServerName");
        setName(value);
	};
;
    return (
        <ScrollBar thumbColor="#929397">
        <div className="oidc_container">
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div id="page-taskName"><span>{(oidcEdit===false)?"Create OpenID Connect Configuration":"Edit OpenID Connect Configuration"}</span></div>
            <div className="adminActionBtn">
                {oidcEdit===false?
                    <Fragment>
                        <button className="a__btn pull-right " onClick={()=>{setOidcEdit(true);onClickEditButton();}}  title="Edit Configuration">Edit</button>
                        <button className="a__btn pull-right btn-margin" onClick={()=>{oidcConfManage("create")}} title="Create Project">Create</button>            
                    </Fragment>
                :   <Fragment>
                        <button className="a__btn pull-right oidc__btn_edit" onClick={()=>{oidcConfManage("update")}} disabled={name===''} title="Update Configuration">Update</button>
                        <button className="a__btn pull-right oidc__btn_edit btn-margin" onClick={()=>{oidcConfDelete()}} disabled={name===''} title="Delete Configuration">Delete</button>
                    </Fragment>
                }
            </div> 
            <div className="col-xs-9 form-group__conv-oidc adminForm" >
                <div className={oidcEdit?'userForm-oidc adminControl-oidc':'adminControl-oidc'}><div>
                    {(oidcEdit===false)?
                    <Fragment>
                        <span className="leftControl-oidc" title="Server Name">Server Name</span>
                        <input type="text" autoComplete="off" value={name} onChange={(event)=>{updateOidcServerName(event.target.value)}} maxLength="100" className={nameErrBorder?"inputErrorBorder middle__input__border-oidc form-control-oidc form-control-custom-oidc validationKeydown preventSpecialChar create":" middle__input__border-oidc form-control-oidc form-control-custom-oidc validationKeydown preventSpecialChar create"} placeholder="Server Name"/>
                    </Fragment>
                    :<Fragment>
                        <span className="leftControl-oidc" title="Server Name">Server Name</span>
                        <select defaultValue={""} onChange = {(event)=>{setName(event.target.value);oidcGetServerData(event.target.value);}} className={nameErrBorder?'selectErrorBorder adminSelect-oidc form-control-oidc':'adminSelect-oidc form-control-oidc'} id="oidcServerName" >
                            <option value="" disabled>Select Server</option>
                            {selBox.map((data,index)=>(
                                <option key={index}  value={data}>{data}</option>
                            ))}
                        </select>
                    </Fragment>
                }    
            	</div></div>
                <div className='adminControl-oidc'><div>
					<span className="leftControl-oidc" title="Issuer URL">Issuer</span>
					<input type="text" autoComplete="off" id="oidcUrl" name="oidcUrl" value={url} onChange={(event)=>{setUrl(event.target.value)}} maxLength="250" className={urlErrBorder?"inputErrorBorder middle__input__border-oidc form-control-oidc form-control-custom-oidc create":"middle__input__border-oidc form-control-oidc form-control-custom-oidc create"} placeholder="Issuer URL"/>
				</div></div>
				<div className='adminControl-oidc'><div>
					<span className="leftControl-oidc" title="Public identifier for the client">Client ID</span>
					<input type="text" autoComplete="off" id="oidcClientId" name="oidcClientId" value={clientId} onChange={(event)=>{setClientId(event.target.value)}}  maxLength="250" className={clientIdErrBorder?"inputErrorBorder middle__input__border-oidc form-control-oidc form-control-custom-oidc create":"middle__input__border-oidc form-control-oidc form-control-custom-oidc create"} placeholder="Public identifier for the client" />
				</div></div>
				<div className='adminControl-oidc'><div>
					<span className="leftControl-oidc" title="Public identifier for the client">Client Secret</span>
					<input type="text" autoComplete="off" id="oidcClientSecret" name="oidcClientSecret" value={secret} onChange={(event)=>{setSecret(event.target.value)}} maxLength="250" className={secretErrBorder?"inputErrorBorder middle__input__border-oidc form-control-oidc form-control-custom-oidc create":"middle__input__border-oidc form-control-oidc form-control-custom-oidc create"} placeholder="Secret used by the client to exchange an authorization code for a token"/>
				</div></div>
            </div>

            {showDeleteModal?
                <ModalContainer title="Delete Configuration" footer={deleteModalButtons(oidcConfManage, setshowDeleteModal)} close={closeModal} content="Are you sure you want to delete ? Users depending on this configuration will not be able to login." />
            :null} 
        </div>
        </ScrollBar>
  );
}

const deleteModalButtons = (oidcConfManage, setshowDeleteModal) =>{
    return(
        <div>
            <button id="deleteGlobalModalButton" onClick={()=>{oidcConfManage("delete");setshowDeleteModal(false);}} type="button" className="btn-default btnGlobalYes btn-margin">Yes</button>
            <button type="button" onClick={()=>{setshowDeleteModal(false)}} className="btn-default">No</button>
        </div>
    )
}    

export default OidcConfig;
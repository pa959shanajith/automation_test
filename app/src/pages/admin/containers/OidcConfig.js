import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, RedirectPage, ModalContainer} from '../../global' 
import {getOIDCConfig, manageOIDCConfig} from '../api';
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
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
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
    }

    const onClickEditButton = async () =>{
        oidcReset();
        setLoading("Fetching details...");
        try{    
            const data = await getOIDCConfig()
            setLoading(false);
			if(data === "Invalid Session") return RedirectPage(history);
			else if(data === "fail") setPopupState({show:true,title:"Edit Configuration",content:"Failed to fetch configurations."});
			else if(data === "empty") {
                setPopupState({show:true,title:"Edit Configuration",content:"There are no configurations created yet."});
                setSelBox([]);
			} else {
                data.sort();
                var dataOptions = [];
				for(var i = 0; i < data.length; i++) dataOptions.push(data[i].name);
				setSelBox(dataOptions);
			}
		}catch(error) {
			setLoading(false);
            setPopupState({show:true,title:"Edit Configuration",content:"Failed to fetch configurations."});
		};
    }

    const oidcGetServerData = async (name) =>{
		const failMsg = "Failed to fetch details for '"+name+"' configuration.";
        setLoading("Fetching details...");
		try{
            const data = await getOIDCConfig(name);
			setLoading(false);
			if(data === "Invalid Session") return RedirectPage(history);
            else if(data === "fail") setPopupState({show:true,title:"Edit Configuration",content:failMsg});
            else if(data === "empty") setPopupState({show:true,title:"Edit Configuration",content:failMsg + "No such configuration exists"});
			else {
                setUrl(data.url);
                setClientId(data.clientid);
                setSecret(data.secret);
			}
		}catch(error) {
			setLoading(false);
			setPopupState({show:true,title:"Edit Configuration",content:failMsg});
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
		const popupTitle = bAction+" OIDC Configuration";
		const failMsg = "Failed to "+action+" '"+confObj.name+"' configuration.";
        setLoading(bAction.slice(0,-1)+"ing configuration...");
		//Transaction Activity for Create/ Update/ Delete OIDC conf button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['OidcConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
            
        try{
            const data = await manageOIDCConfig(action, confObj);
			setLoading(false);
			if(data === "Invalid Session") {
				RedirectPage(history);
			} else if(data === "success") {
				if (action === "create") oidcReset();
                else onClickEditButton();
                setPopupState({show:true,title:popupTitle,content: "Configuration '"+confObj.name+"' "+action+"d successfully!"});
			} else if(data === "exists") {
                setNameErrBorder(true);
                setPopupState({show:true,title:popupTitle,content: "Configuration '"+confObj.name+"' already Exists!"});
			} else if(data === "fail") {
				if (action === "create") oidcReset();
                else onClickEditButton();
                setPopupState({show:true,title:popupTitle,content: "Failed to "+action+" '"+confObj.name+"' configuration."});
			} else if(/^1[0-3]{4}$/.test(data)) {
				if (JSON.parse(JSON.stringify(data)[1])) {
                    setPopupState({show:true,title:popupTitle,content: failMsg+" Invalid Request!"});
					return;
				}
				let errHints = "<br/>";
				if (JSON.parse(JSON.stringify(data)[2])) setNameErrBorder(true);
				if (JSON.parse(JSON.stringify(data)[3])) setUrl(true);
				if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints += "Issuer must start with http:// or https://<br/>";
				if (JSON.parse(JSON.stringify(data)[4])) setClientIdErrBorder(true);
				if (JSON.parse(JSON.stringify(data)[5])) setSecretErrBorder(true);
                setPopupState({show:true,title:popupTitle,content: "Some values are Invalid!" + errHints});
			}
		}catch (error) {
            setLoading(false);
            setPopupState({show:true,title:popupTitle,content:failMsg});
		};
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
            setPopupState({show:true,title:"Error",content:"Invalid Server Name provided! Name cannot contain any special characters other than hyphen. Also name cannot start or end with hyphen."});
			flag = false;
			popped = true;
		}
		if (url === "") {
			setUrlErrBorder(true);
			flag = false;
		} else if (regExURL.test(url) === false) {
			setUrlErrBorder(true);
			if (!popped)setPopupState({show:true,title:"Error",content:"Invalid URL provided! URL must start with http:// or https://"});
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

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const closeModal = () =>{
        setshowDeleteModal(false);
    }

    const deleteModalButtons = () =>{
        return(
            <div>
                <button id="deleteGlobalModalButton" onClick={()=>{oidcConfManage("delete");setshowDeleteModal(false);}} type="button" className="btn-default btnGlobalYes btn-margin">Yes</button>
				<button type="button" onClick={()=>{setshowDeleteModal(false)}} className="btn-default">No</button>
            </div>
        )
    }    

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}

            <div id="page-taskName"><span>{(oidcEdit===false)?"Create OpenID Connect Configuration":"Edit OpenID Connect Configuration"}</span></div>
            <div className="adminActionBtn-oidc">
                {oidcEdit===false?
                    <Fragment>
                        <button className="btn-md pull-right adminBtn" onClick={()=>{setOidcEdit(true);onClickEditButton();}}  title="Edit Configuration">Edit</button>
                        <button className="btn-md pull-right adminBtn btn-margin" onClick={()=>{oidcConfManage("create")}} title="Create Project">Create</button>            
                    </Fragment>
                :   <Fragment>
                        <button className="btn-md pull-right adminBtn oidc__btn_edit" onClick={()=>{oidcConfManage("update")}} disabled={name===''} title="Update Configuration">Update</button>
                        <button className="btn-md pull-right adminBtn oidc__btn_edit btn-margin" onClick={()=>{oidcConfDelete()}} disabled={name===''} title="Delete Configuration">Delete</button>
                    </Fragment>
                }
            </div> 
            <div className="col-xs-9 form-group__conv-oidc adminForm" >
                <div className={oidcEdit?'userForm-oidc adminControl-oidc':'adminControl-oidc'}><div>
                    {(oidcEdit===false)?
                    <Fragment>
                        <span className="leftControl-oidc" title="Server Name">Server Name</span>
                        <input type="text" autoComplete="off" id="oidcServerName" name="oidcServerName" value={name} onChange={(event)=>{setName(event.target.value)}} maxLength="50" className={nameErrBorder?"inputErrorBorder middle__input__border-oidc form-control-oidc form-control-custom-oidc validationKeydown preventSpecialChar create":" middle__input__border-oidc form-control-oidc form-control-custom-oidc validationKeydown preventSpecialChar create"} placeholder="Server Name"/>
                    </Fragment>
                    :<Fragment>
                        <span className="leftControl-oidc" title="Server Name">Server Name</span>
                        <select onChange = {(event)=>{setName(event.target.value); oidcGetServerData(event.target.value);}} className={nameErrBorder?'selectErrorBorder adminSelect-oidc form-control-oidc':'adminSelect-oidc form-control-oidc'} id="oidcServerName" >
                            <option value="" disabled selected>Select Server</option>
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
                <ModalContainer title="Delete Configuration" footer={deleteModalButtons()} close={closeModal} content="Are you sure you want to delete ? Users depending on this configuration will not be able to login." />
            :null} 
        </Fragment>
  );
}

export default OidcConfig;
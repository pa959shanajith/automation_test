import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ModalContainer, ScrollBar} from '../../global' 
import {getSAMLConfig, manageSAMLConfig} from '../api';
import ValidationExpression from '../../global/components/ValidationExpression';
import '../styles/SamlConfig.scss'


/*Component SamlConfig
  use: defines Admin middle Section for Saml Configuration
  ToDo:
*/

const SamlConfig = (props) => {

    const [samlEdit,setSamlEdit] = useState(false)
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
    const [name,setName] = useState("")
    const [url,setUrl] = useState("")
    const [idp,setIdp] = useState("")
    const [cert,setCert] = useState("")
    const [certName,setCertName] = useState("No file choosen")
    const [nameErrBorder,setNameErrBorder] = useState(false)
    const [urlErrBorder,setUrlErrBorder] = useState(false)
    const [idpErrBorder,setIdpErrBorder] = useState(false)
    const [certNameErrBorder,setCertNameErrBorder] = useState(false)
    const [selBox,setSelBox] = useState([])
    const [showDeleteModal,setshowDeleteModal] = useState(false)

    useEffect(()=>{
        setSamlEdit(false);
        samlReset();
        // eslint-disable-next-line
    },[props.resetMiddleScreen["samlConfigTab"],props.MiddleScreen])

    const samlReset = () =>{
        setName("");
		setUrl("");
		setIdp("");
        setCertName("No file choosen");
        setCert("");
        setUrlErrBorder(false);
        setIdpErrBorder(false);
        setCertNameErrBorder(false);
        setNameErrBorder(false);
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const samlConfValidate = (action) =>{
        let flag = true;
		let popped = false;
		setUrlErrBorder(false);
        setIdpErrBorder(false);
        setCertNameErrBorder(false);
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
            if (!popped) setPopupState({show:true,title:"Error",content:"Invalid URL provided! URL must start with http:// or https://"})
			flag = false;
			popped = true;
		}
		if (idp === "") {
            setIdpErrBorder(true);
			flag = false;
		}
		if (cert === "") {
			setCertNameErrBorder(true);
			flag = false;
		}
		return flag;
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const samlConfManage = async (action) =>{

		if (!samlConfValidate(action)) return;
		const bAction = action.charAt(0).toUpperCase() + action.substr(1);
		var confObj = {
			name: name,
			url: url,
			idp: idp,
			cert: cert
		};
		const popupTitle = bAction+" SAML Configuration";
		const failMsg = "Failed to "+action+" '"+confObj.name+"' configuration.";
        setLoading(bAction.slice(0,-1)+"ing configuration...");
		//Transaction Activity for Create/ Update/ Delete SAML conf button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['SamlConfmanage']);
		// infoArr.push(action);
		// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
		const data = await manageSAMLConfig(action, confObj);
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "success") {
            if (action === "create") samlReset();
            else samlEditClick();
            setPopupState({show:true,title:popupTitle,content:"Configuration '"+confObj.name+"' "+action+"d successfully!"});
        } else if(data === "exists") {
            setNameErrBorder(true);
            setPopupState({show:true,title:popupTitle,content:"Configuration '"+confObj.name+"' already Exists!"});
        } else if(data === "fail") {
            if (action === "create") samlReset();
            else samlEditClick();
            setPopupState({show:true,title:popupTitle,content:failMsg});
        } else if(/^1[0-2]{4}$/.test(data)) {
            if (JSON.parse(JSON.stringify(data)[1])) {
                setPopupState({show:true,title:popupTitle,content: failMsg+" Invalid Request!"});
                return;
            }
            let errHints = "<br/>";
            if (JSON.parse(JSON.stringify(data)[2])) setNameErrBorder(true);
            if (JSON.parse(JSON.stringify(data)[3]))setUrlErrBorder(false);
            if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints += "Single Sign-On URL must start with http:// or https://<br/>";
            if (JSON.parse(JSON.stringify(data)[4])) setIdpErrBorder(true);
            if (JSON.parse(JSON.stringify(data)[5])) setCertNameErrBorder(true);
            if (JSON.parse(JSON.stringify(data)[5]) === 2) errHints += "File uploaded is not a valid certificate";
            setPopupState({show:true,title:popupTitle,content: "Some values are Invalid!" + errHints});
        }
    }

    const samlEditClick = async () =>{
		samlReset();
        setLoading("Fetching details...");
        const data = await getSAMLConfig();
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "empty") {
            setPopupState({show:true,title:"Edit Configuration",content:"There are no configurations created yet."});
            setSelBox([]);
        } else {
            data.sort();
            var dataOptions = [];
            for(var i = 0; i < data.length; i++) dataOptions.push(data[i].name);
            setSelBox(dataOptions);
        }
    }

    const samlConfDelete = () =>{
        setshowDeleteModal(true);
    }

    const samlGetServerData = async (name) =>{
		const failMsg = "Failed to fetch details for '"+name+"' configuration.";
        setLoading("Fetching details...");
        const data = await getSAMLConfig(name)
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if(data === "empty") setPopupState({show:true,title:"Edit Configuration",content: failMsg + "No such configuration exists"});
        else {
            setUrl(data.url);
            setIdp(data.idp);
            setCert(data.cert);
            setCertName("No file choosen");
        }
    }

    const updateCert = (targetFile) =>{
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsBinaryString(targetFile);
        })
    }

    const certInputClick = async (event) => {
        // eslint-disable-next-line
        const target = event && (event.srcElement || event.target) || null;
        // eslint-disable-next-line
		const targetFile = target && target.files[0] || null;
		if (targetFile === null) return;
		// var conf = (target.name.includes('ldap'))? $scope.ldapConf:$scope.samlConf;
        setCertName(targetFile.name);
        var certData = await updateCert(targetFile) ;
        setCert(certData);
    }
    
    const closeModal = () =>{
        setshowDeleteModal(false);
    }

    const deleteModalButtons = () =>{
        return(
            <div>
                <button id="deleteGlobalModalButton" onClick={()=>{samlConfManage("delete");setshowDeleteModal(false);}} type="button" className="btn-default btnGlobalYes btn-right" >Yes</button>
				<button type="button" onClick={()=>{setshowDeleteModal(false);samlReset();}} className="btn-default">No</button>
            </div>
        )
    }
    
    const updateSamlServerName = (value) => {
        value = ValidationExpression(value,"samlServerName")
        setName(value);
    }

    return (
        <ScrollBar thumbColor="#929397">
        <div className="saml_container">
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div id="page-taskName"><span>{(samlEdit===false)?"Create SAML Configuration":"Edit SAML Configuration"}</span></div>
            
            <div className="adminActionBtn-saml">
                {samlEdit===false?
                    <Fragment>
                        <button className="btn-md pull-right adminBtn" onClick={()=>{setSamlEdit(true);samlEditClick();}}  title="Edit Configuration">Edit</button>
                        <button className="btn-md pull-right adminBtn btn-right-saml" onClick={()=>{samlConfManage("create")}}  title="Create Project">Create</button>            
                    </Fragment>
                :   <Fragment>
                        <button className="btn-md pull-right adminBtn saml__btn_edit" onClick={()=>{samlConfManage("update")}} disabled={name===''} title="Update Configuration">Update</button>
                        <button className="btn-md pull-right adminBtn saml__btn_edit btn-right-saml" onClick={()=>{samlConfDelete()}} disabled={name===''} title="Delete Configuration">Delete</button>
                    </Fragment>
                }
            </div>

            <div className="col-xs-9 form-group__conv-saml adminForm" >
                <div className={samlEdit?'userForm-saml adminControl-saml':'adminControl-saml'}><div>
                    {(samlEdit===false)?
                    <Fragment>
                        <span className="leftControl-saml" title="Server Name">Server Name</span>
                        <input type="text" autoComplete="off" id="samlServerName" name="samlServerName" value={name} onChange={(event)=>{updateSamlServerName(event.target.value)}} maxLength="50" className={nameErrBorder?"inputErrorBorder middle__input__border-saml form-control-saml form-control-custom-saml validationKeydown preventSpecialChar create":" middle__input__border-saml form-control-saml form-control-custom-saml validationKeydown preventSpecialChar create"} placeholder="Server Name"/>
                    </Fragment>
                    :<Fragment>
                        <span className="leftControl-saml" title="Server Name">Server Name</span>
                        <select defaultValue={""} onChange = {(event)=>{setName(event.target.value); samlGetServerData(event.target.value);}} className={nameErrBorder?'selectErrorBorder adminSelect-saml form-control-saml':'adminSelect-saml form-control-saml'} id="samlServerName" >
                            <option value="" disabled >Select Server</option>
                            {selBox.map((data,index)=>(
                                <option key={index}  value={data}>{data}</option>
                            ))}
                        </select>
                    </Fragment>
                }    
            	</div></div>
                <div className='adminControl-saml'><div>
					<span className="leftControl-saml" title="Single Sign-On URL (SAML assertion URL)">Single Sign-On URL</span>
					<input type="text" autoComplete="off" id="samlAcsUrl" name="samlAcsUrl" value={url} onChange={(event)=>{setUrl(event.target.value)}} maxLength="250" className={urlErrBorder?"inputErrorBorder middle__input__border-saml form-control-saml form-control-custom-saml create":"middle__input__border-saml form-control-saml form-control-custom-saml create"} placeholder="Single Sign-On URL (SAML assertion URL)"/>
				</div></div>
				<div className='adminControl-saml'><div>
					<span className="leftControl-saml" title="Identity Issuer (Can be text or URL)">Issuer</span>
					<input type="text" autoComplete="off" id="samlIDP" name="samlIDP" value={idp} onChange={(event)=>{setIdp(event.target.value)}}  maxLength="250" className={idpErrBorder?"inputErrorBorder middle__input__border-saml form-control-saml form-control-custom-saml create":"middle__input__border-saml form-control-saml form-control-custom-saml create"} placeholder="Identity Issuer (Can be text or URL)" />
				</div></div>

                <div className='adminControl-saml'><div>
					<span className="leftControl-saml" title="X.509 certificate issued by provider">Certificate</span>
					<label   id="samlCert"  htmlFor="certInput" className={certNameErrBorder?"inputErrorText saml-cursor":"certInput-saml saml-cursor"}><span className="fa fa-upload cert-input-cust" ></span>{certName}</label>
					<input type="file" accept=".cer,.crt,.cert,.pem" onChange={(event)=>{certInputClick(event)}} autoComplete="off" id="certInput" name="samlCert" className="no-disp cert-saml"/>
                    {samlEdit?<textarea autoComplete="off" id="samlCertValue" name="samlCertValue" disabled="" readOnly="readOnly" className="certTextarea-saml" value={cert} />:null}
                </div></div>
            </div>

            {showDeleteModal?
                <ModalContainer title="Delete Configuration" footer={deleteModalButtons()} close={closeModal} content="Are you sure you want to delete ? Users depending on this configuration will not be able to login." />
            :null} 
        </div>
    </ScrollBar>
  );
}

export default SamlConfig;
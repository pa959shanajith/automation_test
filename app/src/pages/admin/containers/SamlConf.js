import { useState, useEffect, useRef } from "react";
import AvoInput from "../../../globalComponents/AvoInput";
import { ScreenOverlay, ModalContainer, Messages as MSG, VARIANT, ValidationExpression } from '../../global'
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import { getSAMLConfig, manageSAMLConfig } from '../api';
import "../styles/SamlConf.scss";
import { Toast } from 'primereact/toast';
import { Dropdown } from "primereact/dropdown";


const SamlConf = () => {
  const [samlEdit, setSamlEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [idp, setIdp] = useState("")
  const [cert, setCert] = useState("")
  const [certName, setCertName] = useState("No file choosen")
  const [nameErrBorder, setNameErrBorder] = useState(false)
  const [urlErrBorder, setUrlErrBorder] = useState(false)
  const [idpErrBorder, setIdpErrBorder] = useState(false)
  const [certNameErrBorder, setCertNameErrBorder] = useState(false)
  const [selBox, setSelBox] = useState([])
  const [showDeleteModal, setshowDeleteModal] = useState(false)
  const toast = useRef();

  useEffect(() => {
    setSamlEdit(false);
    samlReset();
  }, [])

  const toastError = (erroMessage) => {
    if (erroMessage.CONTENT) {
      toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
    }
    else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
  }

  const toastWarn = (warnMessage) => {
    if (warnMessage.CONTENT) {
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
  const samlReset = () => {
    setName("");
    setUrl("");
    setIdp("");
    setCertName("No file choosen");
    setCert("");
    setUrlErrBorder(false);
    setIdpErrBorder(false);
    setCertNameErrBorder(false);
    setNameErrBorder(false);
    if (document.getElementById("samlServerName")) document.getElementById("samlServerName").selectedIndex = "0";
  }

  const displayError = (error) => {
    setLoading(false)
    toastError(error)
  }

  const samlConfValidate = (action) => {
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
      displayError(MSG.ADMIN.WARN_EMPTY_CONFIG);
      flag = false;
      popped = true;
    }
    if (url === "") {
      setUrlErrBorder(true);
      flag = false;
    } else if (regExURL.test(url) === false) {
      setUrlErrBorder(true);
      if (!popped) displayError(MSG.ADMIN.WARN_INVALID_URL);
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

  const samlConfManage = async (action) => {

    if (!samlConfValidate(action)) return;
    const bAction = action.charAt(0).toUpperCase() + action.substr(1);
    var confObj = {
      name: name,
      url: url,
      idp: idp,
      cert: cert
    };
    const popupTitle = bAction + " SAML Configuration";
    const failMsg = "Failed to " + action + " '" + confObj.name + "' configuration.";
    setLoading(bAction.slice(0, -1) + "ing configuration...");
    const data = await manageSAMLConfig(action, confObj);
    if (data.error) { displayError(data.error); return; }
    setLoading(false);
    if (data === "success") {
      if (action === "create") samlReset();
      else samlEditClick();
      toastSuccess(MSG.CUSTOM("Configuration '" + confObj.name + "' " + action + "d successfully!", VARIANT.SUCCESS));
    } else if (data === "exists") {
      setNameErrBorder(true);
      toastWarn(MSG.CUSTOM("Configuration '" + confObj.name + "' already Exists!", VARIANT.WARNING));
    } else if (data === "fail") {
      if (action === "create") samlReset();
      else samlEditClick();
      toastWarn(MSG.CUSTOM(failMsg, VARIANT.WARNING));
    } else if (/^1[0-2]{4}$/.test(data)) {
      if (JSON.parse(JSON.stringify(data)[1])) {
        toastError(MSG.CUSTOM(failMsg + " Invalid Request!", VARIANT.ERROR));
        return;
      }
      let errHints = "<br/>";
      if (JSON.parse(JSON.stringify(data)[2])) setNameErrBorder(true);
      if (JSON.parse(JSON.stringify(data)[3])) setUrlErrBorder(false);
      if (JSON.parse(JSON.stringify(data)[3]) === 2) errHints += "Single Sign-On URL must start with http:// or https://<br/>";
      if (JSON.parse(JSON.stringify(data)[4])) setIdpErrBorder(true);
      if (JSON.parse(JSON.stringify(data)[5])) setCertNameErrBorder(true);
      if (JSON.parse(JSON.stringify(data)[5]) === 2) errHints += "File uploaded is not a valid certificate";
      toastWarn(MSG.CUSTOM("Some values are Invalid!" + errHints, VARIANT.WARNING));
    }
  }

  const samlEditClick = async () => {
    samlReset();
    setLoading("Fetching details...");
    const data = await getSAMLConfig();
    if (data.error) { displayError(data.error); return; }
    setLoading(false);
    if (data === "empty") {
      displayError(MSG.ADMIN.WARN_EMPTY_CONFIG);
      setSelBox([]);
    } else {
      data.sort();
      var dataOptions = [];
      for (var i = 0; i < data.length; i++) dataOptions.push(data[i].name);
      setSelBox(dataOptions);
    }
  }

  const samlConfDelete = () => {
    setshowDeleteModal(true);
  }

  const samlGetServerData = async (name) => {
    const failMsg = "Failed to fetch details for '" + name + "' configuration.";
    setLoading("Fetching details...");
    const data = await getSAMLConfig(name)
    if (data.error) { displayError(data.error); return; }
    setLoading(false);
    if (data === "empty") toastWarn(MSG.CUSTOM(failMsg + "No such configuration exists", VARIANT.WARNING));
    else {
      setUrl(data.url);
      setIdp(data.idp);
      setCert(data.cert);
      setCertName("No file choosen");
    }
  }

  const updateCert = (targetFile) => {
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
    const files = event?.files[0];
    setCertName(event?.files[0]?.name);
    var certData = await updateCert(files);
    setCert(certData);
  }

  const updateSamlServerName = (value) => {
    value = ValidationExpression(value, "samlServerName")
    setName(value);
  }

  return (
    <div className="grid saml_container">

      <div id="page-taskName">{ 
        (samlEdit === false) ? <span>"Create SAML Configuration"</span>:
          <div id="page-taskName flex flex-row">
            <i className="m-2 pi pi-arrow-left" onClick={() =>  setSamlEdit(false)} />
            <span> "Edit SAML Configuration" </span>
          </div>
      }
      </div>

      <div className="col-6 lg:col-6 xl:col-6 md:col-6 sm:col-12">
        {(samlEdit === false) ? <AvoInput
          autoComplete="off"
          htmlFor="servername"
          labelTxt="Server Name"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Server Name"
          inputTxt={name}
          customClass={`inputColumn ${nameErrBorder ? 'p-invalid' : ''}`}
          setInputTxt={updateSamlServerName}
          inputType="lablelRowReqInfo"
          charCheck={nameErrBorder}
        /> : <>
          <label className='serverNamelabel' style={{ paddingLeft: '0.7rem' }}>Server Name</label>
          <Dropdown data-test="confServer"
            id="confServer"
            className='w-full p-inputtext-sm'
            value={name}
            options={selBox}
            onChange={(e) => { setName(e.target.value); samlGetServerData(e.target.value); }}
            // optionLabel="name"
            // disabled={confExpired === server}
            placeholder='Select server'
          />
        </>}
        <AvoInput
          htmlFor="singleSign"
          labelTxt="Single Sign On URL"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Single Sign On URL"
          inputTxt={url}
          customClass={`inputColumn ${urlErrBorder ? 'p-invalid' : ''}`}
          setInputTxt={setUrl}
          inputType="lablelRowReqInfo"
          charCheck={urlErrBorder}
        />
        <AvoInput
          htmlFor="issueDetails"
          labelTxt="Issue Details"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Issue Details"
          inputTxt={idp}
          customClass={`inputColumn ${idpErrBorder ? 'p-invalid' : ''}`}
          setInputTxt={setIdp}
          inputType="lablelRowReqInfo"
          charCheck={idpErrBorder}
        />
        <div className="flex flex-row pb-3 align-items-center	">
          <FileUpload
            name="cert file"
            multiple={false}
            auto
            mode="basic"
            customUpload={true}
            accept=".cer,.crt,.cert,.pem"
            uploadHandler={certInputClick}
          />
          <label className="pl-2 serverNamelabel">{certName}</label>
        </div>

        <div className="flex flex-row gap-3">
          {samlEdit === false ? <>
            <Button label="Edit" size="small" onClick={() => { setSamlEdit(true); samlEditClick(); }} ></Button>
            <Button label="Create" size="small" onClick={() => { samlConfManage("create") }} />
          </> : <>
            <Button label="Update" size="small" onClick={() => { samlConfManage("update") }} disabled={name === ''} ></Button>
            <Button label="Delete" size="small" onClick={() => { samlConfDelete() }} disabled={name === ''} ></Button>
          </>}
        </div>
      </div>
    </div>
  );
};

export default SamlConf;

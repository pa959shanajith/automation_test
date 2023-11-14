import { useState } from "react";
import AvoInput from "../../../globalComponents/AvoInput";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import "../styles/SamlConf.scss";

const SamlConf = () => {
  const [serverName, setServerName] = useState("");
  const [singleSign, setSingleSign] = useState("");
  const [issueDetails, setIssueDetails] = useState("");
  return (
    <div className="grid saml_container">
      <div className="col-6 lg:col-6 xl:col-6 md:col-6 sm:col-12">
        <AvoInput
          htmlFor="servername"
          labelTxt="Server Name"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Server Name"
          inputTxt={serverName}
          customClass="inputColumn"
          setInputTxt={setServerName}
          inputType="lablelRowReqInfo"
        />
        <AvoInput
          htmlFor="singleSign"
          labelTxt="Single Sign On URL"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Single Sign On URL"
          inputTxt={singleSign}
          customClass="inputColumn"
          setInputTxt={setSingleSign}
          inputType="lablelRowReqInfo"
        />
        <AvoInput
          htmlFor="issueDetails"
          labelTxt="Issue Details"
          infoIcon="static/imgs/Info_icon.svg"
          required={true}
          placeholder="Enter Issue Details"
          inputTxt={issueDetails}
          customClass="inputColumn"
          setInputTxt={setIssueDetails}
          inputType="lablelRowReqInfo"
        />
        <FileUpload
          name="demo[]"
          url={"/api/upload"}
          multiple
          accept="image/*"
          auto
          maxFileSize={1000000}
          emptyTemplate={
            <p className="m-0">Drag and drop files to here to upload.</p>
          }
        />
        <div className="col-8 lg:col-8 xl:col-8 md:col-6 sm:col-12 flex">
            <Button label="Cancel" link />
            <Button label="Submit" />
        </div>
      </div>
    </div>
  );
};

export default SamlConf;

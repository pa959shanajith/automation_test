import AceEditor from "react-ace";
import "ace-builds";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/worker-javascript";
//import 'ace-builds/src-noconflict/worker-python';
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-error_marker";
import "ace-builds/webpack-resolver";
//import 'eslint';
//import 'brace/worker/javascript'

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import {
  Messages as MSG,
  ScreenOverlay,
  RedirectPage,
  SelectRecipients,
} from "../../global";
import "../../landing/styles/ProjectCreation.scss";
import * as DesignApi from "../../design/api";
import { createKeyword } from "../../design/api";
import { Toast } from "primereact/toast";
import AvoInput from "../../../globalComponents/AvoInput";
// import {ScreenOverlay} from "../../global/components/ScreenOverlay";
import { useState, useRef } from "react";

const CustomKeyword = (props) => {
  
  const [overlay, setOverlay] = useState("");

  const [customkeyword, setCustomKeyWord] = useState(false);
  const [langSelect, setLangSelect] = useState("javascript");
  const [inputKeywordName, setInputKeywordName] = useState("");
  const [inputEditor, setInputEditor] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  // Initialize ESLint
  //const eslint = require("eslint");
  //const eslintCli = new eslint.CLIEngine();

  // Initialize Pyodide
  //const pyodide = require('pyodide');

  const keywordtypes = [
    { name: "Generic", code: "GE" },
    { name: "Specific Element", code: "SE" },
  ];

  const handleAceEditor = (e) => {
    setInputEditor(e);
  };
  const onSelectLanguage = (e) => {
    setLangSelect(e.target.value);
  };
  
  const createCustomeKeywordFooter = () => (
    <>
      <Button
        data-test="cancelButton"
        label="Debug"
        text
        // onClick={() => {
        //     editUser ? createUserDialogHide() :  userCreateHandler();
        // }}
      ></Button>
      {/* {(selectedTab === "userDetails") &&  */}
      <Button
        data-test="createButton"
        label={"Send for approval"}
        onClick={async () => {
          if(selectedType===null){
            props.toastWarn(MSG.DESIGN.WARN_DROPDOWN_SELECTED_NOT_ENTERED.CONTENT);
          }
          if (inputKeywordName === "") {
            props.toastWarn(MSG.DESIGN.WARN_CUSTOMKEY_NOT_ENTERED.CONTENT);
          } else if (inputEditor === "") {
            props.toastWarn(MSG.DESIGN.WARN_ACE_EDITOR_NOT_ENTERED.CONTENT);
          } else {
            try {
              setCustomKeyWord(false);

              setOverlay("Creating the Kewyord");

              await createKeyword({
                name: inputKeywordName,
                objecttype: customkeyword,
                apptype: "web",
                code: inputEditor,
                language: langSelect,
              });
              setOverlay("Updating the list ");
              
              
              //  let keywordData = await DesignApi.getKeywordDetails_ICE("Web")
              //     let sortedKeywordList = {};
              //     for(let object in keywordData) {
              //         let firstList = [];
              //         let secondList = [];
              //         for(let keyword in keywordData[object]){
              //             if(keywordData[object][keyword]['ranking']){
              //                 firstList[keywordData[object][keyword]['ranking'] - 1] = ({
              //                     [keyword] : keywordData[object][keyword]
              //                 });
              //             } else {
              //                 secondList.push(({
              //                     [keyword] :keywordData[object][keyword]
              //                 }));
              //             }
              //         };
              //         // console.log('firstList', firstList);
              //         // console.log('secondList', secondList);
              //         secondList = [...firstList, ...secondList];
              //         // console.log('secondList2', secondList);

              //         let keyWordObject = {};
              //         // secondList = secondList.forEach((keyword) => {
              //         //     keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0]
              //         // });

              //         for(let keyword of secondList){
              //             if(keyword&& Object.keys(keyword)[0] && Object.values(keyword)[0])
              //                 keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0];
              //             // console.log('Object.keys(keyword)[0]', Object.keys(keyword)[0]);
              //             // console.log('Object.values(keyword)[0]', Object.values(keyword)[0]);
              //         }
              //         // console.log('keyWordObject', keyWordObject);
              //         // sortedKeywordList[object] = secondList.reduce((kerwordobjects, currentKeyword) => {
              //         //     return ({...kerwordobjects, [Object.keys(currentKeyword)[0]]: Object.values(currentKeyword)[0]})
              //         // }, {});
              //         // console.log('sortedKeywordList[object]', sortedKeywordList[object]);
              //         // sortedKeywordList[object] = { ...secondList };
              //         sortedKeywordList[object] = keyWordObject;
              //     }
              props.toastSuccess(MSG.DESIGN.SUCC_CUSTOMKEY_ENTERED.CONTENT);
              //     setKeywordList(sortedKeywordList);
              //     setStepSelect({ edit: false, check: [stepOfCustomKeyword], highlight: [] })
              setOverlay("");

              setInputEditor("");
              setInputKeywordName("");
              setLangSelect("javascript");
            } catch (error) {
              props.toastError(MSG.DESIGN.ERR_CUSTOMKEY_NOT_ENTERED.CONTENT);
              console.error(
                "Error: Failed to communicate with the server ::::",
                error
              );
            }
          }
        }}
        // disabled={nocreate}
      >
        {/* {editUser ? "" : <i className="m-1 pi pi-arrow-right"/>} */}
      </Button>
      {/* } */}
    </>
  );
  const handleCreateCustom = () => {
    setCustomKeyWord(true);
  };

  return (
    <>
      {/* <Toast ref={toast} position="bottom-center" baseZIndex={11000} style={{zIndex: 10000 }}/> */}

      <div
        className="p-4 surface-100 flex flex-column"
        style={{ overflow: "auto" }}
      >
        <div>
          <Card className="proj-card" title="Create Custom Keyword">
            <div className="card_container">
              <div className="flex flex-column" style={{ alignItems: "start" }}>
                <span style={{ marginBottom: "0.5rem" }}>
                  <p className="sentence-cls" style={{ fontSize: "14px" }}>
                    {" "}
                    Can change the name of the project, can manage roles of the
                    people, can add or remove users from the project
                  </p>
                </span>
                <Button
                  className="manageProj_btn"
                  size="small"
                  label="Create"
                  onClick={handleCreateCustom}
                ></Button>
              </div>
              <div className="image-settings">
                <img
                  src="static/imgs/custom_keyword_icon.svg"
                  alt="project"
                  style={{ width: "50px", height: "50px" }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        visible={customkeyword}
        onHide={() => {
          setCustomKeyWord(false);
          setInputEditor("");
          setInputKeywordName("");
          setLangSelect("JavaScript");
        }}
        footer={createCustomeKeywordFooter}
        header={"Custom Keyword"}
        style={{ width: "50.06rem", overflow: "hidden", zIndex: 1300 }}
        position="center"
      >
        <div className="flex flex-column">
          <label htmlFor="firstname" className="pb-2 font-medium">
            Type
          </label>

          <Dropdown
          required={true}
            value={selectedType}
            onChange={(e) => setSelectedType(e.value)}
            options={keywordtypes}
            optionLabel="name"
            placeholder="Select the type of Keyword"
            className="w-full md:w-20rem"
          />

          <label htmlFor="firstname" className="pb-2 font-medium"></label>
          <AvoInput
            required={true}
            htmlFor="username"
            labelTxt="Name"
            data-test="firstName-input__create"
            maxLength="100"
            width=""
            className={`w-full md:w-20rem p-inputtext-sm ${
              props.firstnameAddClass ? "inputErrorBorder" : ""
            }`}
            type="text"
            onChange={(event) => setInputKeywordName(event.target.value)}
            placeholder={"Enter custom keyword name"}
            inputTxt={inputKeywordName}
            setInputTxt={setInputKeywordName}
          ></AvoInput>
        </div>

        <div className="buildtype_container" style={{ overflow: "hidden" }}>
          <div
            className="flex flex-wrap gap-8"
            style={{ padding: "0.5rem 2.5rem 2rem 0rem" }}
          >
            <div className="flex align-items-center">
              <RadioButton
                onChange={onSelectLanguage}
                className="ss__build_type_rad"
                type="radio"
                name="program_language"
                value="javascript"
                checked={langSelect === "javascript"}
              />
              <label
                htmlFor="ingredient1"
                className="ml-2 ss__build_type_label"
              >
                JavaScript
              </label>
            </div>
            <div className="flex align-items-center">
              <RadioButton
                onChange={onSelectLanguage}
                className="ss__build_type_rad"
                type="radio"
                name="program_language"
                value="python"
                checked={langSelect === "python"}
              />
              <label
                htmlFor="ingredient2"
                className="ml-2 ss__build_type_label"
              >
                Python
              </label>
            </div>
          </div>
        </div>

        <div className="languageEditor">
          <AceEditor
            mode={langSelect}
            name="editor"
            //value={this.props.data}
            theme="monokai"
            fontSize={14}
            onChange={handleAceEditor}
            editorProps={{ $blockScrolling: true }}
            style={{ width: "100%" }}
            value={inputEditor}
            //   onValidate={(annotations)=>{
            //     console.log(annotations);
            //   }}

            setOptions={{
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 3,
              useWorker: true,
              highlightActiveLine: true,
              behavioursEnabled: true,
              showPrintMargin: false,
              hScrollBarAlwaysVisible: false,
              vScrollBarAlwaysVisible: false,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
            }}
          />
        </div>
      </Dialog>
    </>
  );
};
export default CustomKeyword;

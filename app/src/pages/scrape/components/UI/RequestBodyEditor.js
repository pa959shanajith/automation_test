import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Editor from "@monaco-editor/react";
import "../../styles/WebserviceScrape.scss";
import RequestEditor from "./RequestEditor";

const modeOptions = ["none", "form-data", "x-www-form-urlencoded", "raw"];
const rawModeOptions = ["Text", "Javascript", "JSON", "XML", "HTML"];

const RequestBodyEditor = ({state, onStateChange}) => {
  const [mode, setMode] = useState("0");
  const [rawMode, setRawMode] = useState("Text");
  // manage state change by component itself
  const [editorValues, setEditorValues] = useState({form: state.form, raw: state.raw});

  useEffect(() => {
    setEditorValues({form: state.form, raw: state.raw});
    setMode(state.mode !== "" ? state.mode : "0");
    setRawMode(state.rawMode !== "" ? state.rawMode: "Text");
  }, []);

  useEffect(() => {
    onStateChange({mode, rawMode, form: editorValues.form, raw: editorValues.raw});
  }, [mode, rawMode, editorValues])

  const valueChangeHandler = (val) => {
    const newEditorValues = {...editorValues};
    if(mode === "raw") {
      newEditorValues.raw = val;
    } else {
      newEditorValues.form = val;
    }
    setEditorValues(newEditorValues);
  };
  const modeChangeHandler = (event) => {
    const val = event.target.value;
    setMode(val);
  };

  const rawModeChangeHandler = (event) => {
    setRawMode(event.target.value);
  };

  return (
    <div className="ws__editor_wrapper">
      <div className="ws__editor_options">
        <select
          className={"ws__select"}
          onChange={modeChangeHandler}
          value={mode}
        >
          <option disabled value="0">
            Select Method
          </option>
          {modeOptions.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {mode === "raw" ? (
          <select
            className={"ws__select"}
            onChange={rawModeChangeHandler}
            value={rawMode}
          >
            {rawModeOptions.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {mode === "none" && <div>This request does not have a body</div>}
      {(mode === "form-data" || mode === "x-www-form-urlencoded") && (
        <RequestEditor
          value={editorValues.form}
          onChangeHandler={(val) => valueChangeHandler(val)}
          placeholder="key:value"
        />
      )}
      {mode === "raw" && (
        <Editor
          value={editorValues.raw}
          onChange={(val) => valueChangeHandler(val)}
          options={{
            contextmenu: false,
            quickSuggestions: { other: false, comments: false, strings: false },
            suggest: {
              showClasses: false,
              showKeywords: false,
              showWords: false,
              showVariables: false,
              showProperties: false,
              showMethods: false,
              showFunctions: false,
              showModules: false,
              showFields: false,
            },
          }}
          height="400px"
          language={rawMode.toLowerCase()}
        />
      )}
    </div>
  );
};

export default RequestBodyEditor;

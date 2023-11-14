import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import "./AvoInputText.scss";

const AvoInputText = ({
  name,
  rows,
  customeClass,
  value,
  onInputTextChange,
  placeholder,
  required = false,
  labelTxt,
  disabled = false,
  parentClass = ""
}) => {
  const [touched, setTouched] = useState(false);
  return (
    <div className={`${parentClass} avo_inputText`}>
      <label>
        <span>{labelTxt}</span>
        {required && <img src="static/imgs/Required.svg" className="required_icon" />}
      </label>
      <InputTextarea
        name={name}
        rows={rows}
        className={`${(touched && !value && required) ? "p-invalid" : ""} ${customeClass}`}
        value={value}
        onBlur={() => setTouched(true)}
        onChange={onInputTextChange}
        disabled={disabled}
      />
      {required && (
        <div className="validation_container">
          <small
            className={touched && !value ? "txt_invalid" : "txt_valid"}
          >
            {labelTxt} is required.
          </small>
        </div>
      )}
    </div>
  );
};

export default AvoInputText;

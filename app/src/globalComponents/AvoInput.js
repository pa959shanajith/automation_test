import { InputText } from "primereact/inputtext";
import { useState, useRef } from "react";
import { Toast } from 'primereact/toast';
import "./AvoInput.scss";

const AvoInput = ({
  htmlFor = null,
  labelTxt = null,
  infoIcon,
  required = null,
  placeholder,
  inputTxt,
  setInputTxt,
  customClass = "",
  icon = null,
  charCheck = false
}) => {
  const [touched, setTouched] = useState(false);
  const inputJsx = (
    <div className={`input_container ${customClass}`}>
      {(labelTxt || infoIcon || required) && (
        <div className="icons_container">
          {labelTxt && (
            <label htmlFor={htmlFor}>
              <span>{labelTxt}</span>
            </label>
          )}
          <div className="input_icons">
            {infoIcon && <img src={infoIcon} className="configinfo_icon" />}
            {required && (
              <img src="static/imgs/Required.svg" className="required_icon" />
            )}
          </div>
        </div>
      )}
      <div className="input_subcontainer">
        <InputText
          {...(htmlFor && { id: htmlFor })}
          placeholder={placeholder}
          value={inputTxt}
          onInput={(e) => {
            if (e.target.value === '') {
              setInputTxt('');
            } else {
            const enteredChar = e.target.value.slice(-1); 
            if (charCheck && !/^[a-zA-Z0-9_]+$/.test(enteredChar)) {
              return;
            }
          }
            setInputTxt(e.target.value);
          }}
          onBlur={() => setTouched(true)}
          {...(required && { className: (touched && !inputTxt) ? 'p-invalid' : ''})}
        />
        {(required && !charCheck) && (
          <div className="validation_container">
              <small className={(touched && !inputTxt) ? 'txt_invalid' : 'txt_valid'}>
                {labelTxt} is required.
              </small>
          </div>
        )}
        {charCheck && (
          <div className="validation_container">
              <small className='txt_invalid'>
                Only letters, numbers, and underscore are allowed.
              </small>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="avo_input">
      {icon ? (
        <span className="p-input-icon-left">
          <i className={icon} />
          {inputJsx}
        </span>
      ) : (
        inputJsx
      )}
    </div>
  );
};

export default AvoInput;

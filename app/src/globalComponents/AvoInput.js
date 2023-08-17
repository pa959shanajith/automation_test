import { InputText } from "primereact/inputtext";
import { useState } from "react";
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
          onInput={(e) => setInputTxt(e.target.value)}
          onBlur={() => setTouched(true)}
          {...(required && { className: (touched && !inputTxt) ? 'p-invalid' : ''})}
        />
        {required && (
          <div className="validation_container">
              <small className={(touched && (!inputTxt || charCheck)) ? 'txt_invalid' : 'txt_valid'}>
                {charCheck ? "only Alpha Numerical and '_' is allowed" : `${labelTxt} is required` }
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

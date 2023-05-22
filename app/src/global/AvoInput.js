import { InputText } from "primereact/inputtext";
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
}) => {
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
      <InputText
        {...(htmlFor && { id: htmlFor })}
        placeholder={placeholder}
        value={inputTxt}
        onInput={(e) => setInputTxt(e.target.value)}
      />
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

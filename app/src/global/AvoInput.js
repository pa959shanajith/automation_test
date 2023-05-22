import { InputText } from "primereact/inputtext";
import "./AvoInput.scss";

const AvoInput = ({
  htmlFor,
  labelTxt = null,
  infoIcon,
  icon = null,
  required = null,
  placeholder,
  inputTxt,
  setInputTxt,
  inputType,
}) => {
  const inputObj = {
    lablelRowReqInfo: (
      <div className="avo_input">
        <label htmlFor={htmlFor}>
          <span>{labelTxt}</span>
          <img src={infoIcon} className="configinfo_icon" />
          {required && (
            <img src="static/imgs/Required.svg" className="required_icon" />
          )}
        </label>
        <InputText
          id={htmlFor}
          value={inputTxt}
          onInput={(e) => setInputTxt(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    ),
    searchIcon: (
      <span className="p-input-icon-left">
        <i className={icon} />
        <InputText
          placeholder="Search"
          value={inputTxt}
          onInput={(e) => setInputTxt(e.target.value)}
        />
      </span>
    ),
  };
  return <>{inputObj[inputType]}</>
};

export default AvoInput;

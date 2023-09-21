import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import './AvoDropdown.scss';

const AvoDropdown = ({
  dropdownOptions,
  dropdownValue,
  onDropdownChange,
  placeholder,
  name,
  required = false,
  labelTxt,
  customeClass = "",
  parentClass = "",
  disabled = false
}) => {
  const [touched, setTouched] = useState(false);
  return (
    <div className={`${parentClass} avo_dropdown`}>
      <label>
        <span>{labelTxt}</span>
        {required && <img src="static/imgs/Required.svg" className="required_icon" />}
      </label>
      <Dropdown
        className={customeClass}
        value={dropdownValue}
        onChange={(e) => onDropdownChange(e)}
        options={dropdownOptions}
        optionLabel="name"
        onBlur={() => setTouched(true)}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...(required && { className: touched && !dropdownValue ? "p-invalid" : "" })}
      />
      {required && (
        <div className="validation_container">
          <small className={touched && !dropdownValue ? "txt_invalid" : "txt_valid"}>
            {labelTxt} is required.
          </small>
        </div>
      )}
    </div>
  );
};

export default AvoDropdown;

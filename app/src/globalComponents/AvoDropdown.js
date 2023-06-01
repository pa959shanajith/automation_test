import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import './AvoDropdown.scss';

const AvoDropdown = ({
  dropdownOptions,
  dropdownValue,
  onDropdownChange,
  placeholder,
  name,
  required,
  labelTxt,
}) => {
  const [touched, setTouched] = useState(false);
  return (
    <div className="avo_dropdown">
      <label>
        <span>{labelTxt}</span>
        <img src="static/imgs/Required.svg" className="required_icon" />
      </label>
      <Dropdown
        value={dropdownValue}
        onChange={(e) => onDropdownChange(e)}
        options={dropdownOptions}
        optionLabel="name"
        onBlur={() => setTouched(true)}
        name={name}
        placeholder={placeholder}
        required={required}
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

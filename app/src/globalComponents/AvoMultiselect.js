import { MultiSelect } from "primereact/multiselect";
import { useState } from "react";
import './AvoMultiselect.scss';

const AvoMultiselect = ({
  multiSelectValue,
  onMultiSelectChange,
  multiSelectOptions,
  name,
  placeholder,
  required,
  labelTxt,
  disabled,
  labelForNotWebApp,
  showSelectAll
}) => {
  const [touched, setTouched] = useState(false);
  return (
    <div className="avo_multiselect">
      { required && 
      <label>
        <span>{labelTxt}</span>
        <img src="static/imgs/Required.svg" className="required_icon" />
      </label>
      }
      { labelForNotWebApp && 
      <label>
        <span>{labelTxt}</span>
      </label>
      }

      <MultiSelect
        value={multiSelectValue}
        onChange={(e) => onMultiSelectChange(e)}
        options={multiSelectOptions}
        optionLabel="name"
        name={name}
        placeholder={placeholder}
        onBlur={() => setTouched(true)}
        {...(required && { className: touched && !multiSelectValue ? "p-invalid" : "" })}
        disabled={disabled}
        showSelectAll={showSelectAll}
      />
      {required && (
        <div className="validation_container">
          <small className={touched && !multiSelectValue ? "txt_invalid" : "txt_valid"}>
            {labelTxt} is required.
          </small>
        </div>
      )}
    </div>
  );
};

export default AvoMultiselect;

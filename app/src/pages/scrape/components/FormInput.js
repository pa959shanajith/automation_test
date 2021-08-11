import React from "react";
import "../styles/WebserviceScrape.scss";

const FormInput = (props) => {
  return (
    <div className="ws__form_input_group">
      <div className="ws__form_input_label">{props.label}</div>
      {props.select ? 
      <select
        name={props.name || props.label}
        className="ws__select"
        onChange={props.onChange}
        value={props.value}
      >
        <option disabled value="0">
          Select Method
        </option>
        {props.selectOptions.map((opt, i) => (
          <option key={i} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
      :<input
        name={props.name || props.label}
        className="ws__input"
        onChange={props.onChange}
        type={props.type || "text"}
        placeholder={props.placeholder || props.label}
        value={props.value}
        disabled={props.disabled}
      />}
    </div>
  );
};

export default FormInput;

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import "../../styles/WebserviceScrape.scss";


// TODO - change value type to object
const RequestEditor = ({
  activeView,
  onChangeHandler,
  value,
  disabled,
  placeholder,
}) => {
  const convertFromRaw = (raw) => {
    const keyValuePairs = raw
      .split("\n")
      .filter((curr) => curr.includes(":"))
      .map((curr) => {
        const keyValue = curr.split(/:(.*)/);
        return {
          key: keyValue[0].startsWith("//")
            ? keyValue[0].substring(2).trim()
            : keyValue[0].trim(),
          value: keyValue[1] ? keyValue[1]?.trim() : "",
          deletable: true,
          disabled: curr.startsWith("//"),
        };
      });
    // add empty key value pair in the end
    keyValuePairs.push({ key: "", value: "" });
    return keyValuePairs;
  };
  const actionError = useSelector((state) => state.scrape.actionError);
  const [isBulkEdit, setBulkEdit] = useState(false);
  const [raw, setRaw] = useState(value || '');
  const [formRows, setFormRows] = useState(convertFromRaw(value || ''));
  const [isDisabled, setDisabled] = useState(disabled);

  // TODO - testing and modularity
  const currValue = useRef(value);

  useEffect(() => {
    setFormRows(convertFromRaw(raw));
  }, []);

  useEffect(() => {
    if (currValue.current !== value) {
      setFormRows(convertFromRaw(value));
      setRaw(value);
      currValue.current = value;
    }
    if (disabled !== isDisabled) {
      setDisabled(disabled);
    }
  }, [value, disabled]);

  useEffect(() => {
    onChangeHandler(currValue.current);
  }, [currValue.current]);

  const onBulkChangeHandler = (event) => {
    setRaw(event.target.value);
    currValue.current = event.target.value;
  };

  const onFormInputChangeHandler = (event) => {
    const currID = Number.parseInt(event.target.parentNode.id);
    const { name, value } = event.target;
    const newFormRows = [...formRows];
    newFormRows[currID][name] = value;

    const newRaw = newFormRows.reduce((raw, curr) => {
      const line = `${curr.disabled ? "//" : ""}${curr.key}:${curr.value}\n`;
      return curr.key !== "" || curr.value !== "" ? raw.concat(line) : raw;
    }, ``);
    currValue.current = newRaw;
    if (currID === formRows.length - 1) {
      newFormRows[currID].deletable = true;
      setFormRows([...newFormRows, { key: "", value: "" }]);
    } else {
      setFormRows(newFormRows);
    }
  };

  const onDeleteHandler = (index) => {
    const newFormRows = [...formRows];
    newFormRows.splice(index, 1);
    const newRaw = newFormRows.reduce((raw, curr) => {
      const line = (curr.disabled ? "//" : "") +`${curr.key}:${curr.value}\n`;
      return curr.key !== "" && curr.value !== "" ? raw.concat(line) : raw;
    }, ``);
    currValue.current = newRaw;
    setFormRows(newFormRows);
  };

  const onSwitchHandler = () => {
    if (isBulkEdit) {
      setFormRows(convertFromRaw(raw));
    } else {
      setRaw(currValue.current);
    }
    setBulkEdit(!isBulkEdit);
  };

  const rowDisableHandler = (event, i) => {
    const newFormRows = [...formRows];
    newFormRows[i].disabled = !event.target.checked;
    const newRawArr = currValue.current.split("\n");
    newRawArr[i] = event.target.checked
      ? newRawArr[i].substring(2).trim()
      : "//" + newRawArr[i];
    currValue.current = newRawArr.join("\n");
    setFormRows(newFormRows);
  };

  return (
    <div className="ws__editor_wrapper">
      <div className="ws__row" style={{ marginBottom: "5px" }}>
        <button className="ws__action_btn" onClick={onSwitchHandler}>
          {!isBulkEdit ? "Bulk Edit" : "Key Value Edit"}
        </button>
      </div>

      <div
        style={isDisabled ? { pointerEvents: "none", opacity: 0.9 } : {}}
        className="ws__editor_edit"
      >
        {isBulkEdit ? (
          <textarea
            className={
              "ws__rqst_resp_body" +
              (actionError.includes("reqHeader") && activeView === "req"
                ? " ws_eb"
                : "")
            }
            onChange={onBulkChangeHandler}
            placeholder={placeholder}
            value={raw}
          />
        ) : (
          <div className="ws__editor_formWrapper">
            <div className="ws__editor_formRow">
              <div className="ws__editor_formItem">KEY</div>
              <div className="ws__editor_formItem">VALUE</div>
            </div>
            {formRows.map((row, i) => {
              return (
                <div
                  key={i}
                  id={i}
                  className={"ws__editor_formRow"}
                  disabled={row.disabled}
                >
                  {row.key && row.value && <input
                    data-test="appendInput"
                    id="enable_append"
                    type="checkbox"
                    onChange={(event) => rowDisableHandler(event, i)}
                    checked={!row.disabled}
                  />}
                  <input
                    name="key"
                    onChange={onFormInputChangeHandler}
                    placeholder="Key"
                    className="ws__editor_formItem"
                    value={row.key}
                  ></input>
                  <input
                    name="value"
                    onChange={onFormInputChangeHandler}
                    placeholder="Value"
                    className="ws__editor_formItem"
                    value={row.value}
                  ></input>
                  {row.deletable ? (
                    <div
                      className="ws__editor_rowClose"
                      onClick={() => onDeleteHandler(i)}
                    >
                      x
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

RequestEditor.propTypes = {
  activeView: PropTypes.string,
  onChangeHandler: PropTypes.func,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.string,
  placeholder: PropTypes.string,
};

export default RequestEditor;

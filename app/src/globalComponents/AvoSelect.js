import { SelectButton } from "primereact/selectbutton";
import './AvoSelect.scss';

const AvoSelect = ({ selectOptions, selectMode, setSelectMode, labelTxt,disabled }) => {
  return (
    <div className="avo_select">
      <label>
        <span>{labelTxt}</span>
      </label>
      <SelectButton
        value={selectMode}
        onChange={(e) => setSelectMode(e.value)}
        options={selectOptions}
        disabled={disabled}
      />
    </div>
  );
};

export default AvoSelect;

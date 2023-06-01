import { SelectButton } from "primereact/selectbutton";
import './AvoSelect.scss';

const AvoSelect = ({ selectOptions, selectMode, setSelectMode, labelTxt }) => {
  return (
    <div className="avo_select">
      <label>
        <span>{labelTxt}</span>
        <img src="static/imgs/Required.svg" className="required_icon" />
      </label>
      <SelectButton
        value={selectMode}
        onChange={(e) => setSelectMode(e.value)}
        options={selectOptions}
      />
    </div>
  );
};

export default AvoSelect;

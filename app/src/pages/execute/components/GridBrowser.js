import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { avogrids, browsers, selections } from "../../utility/mockData";
import { MultiSelect } from "primereact/multiselect";

const GridBrowser = ({ mode, setMode, avodropdown, onAvoSelectChange }) => {
  return (
    <div className="avogrid_section">
      <div className="avogrid_container">
        <div className="avogrid_fields">
          <label>
            <span>Avo Agent / Avo Grid</span>
            <span className="icon_required">*</span>
          </label>
          <Dropdown
            value={avodropdown.avogrid}
            onChange={(e) => onAvoSelectChange(e)}
            options={avogrids}
            optionLabel="name"
            name="avogrid"
            placeholder="Select Avo Grid"
          />
        </div>
        <div className="avogrid_fields">
          <label>
            <span>Select Browsers</span>
            <span className="icon_required">*</span>
          </label>
          <MultiSelect
            value={avodropdown.browser}
            onChange={(e) => onAvoSelectChange(e)}
            options={browsers}
            optionLabel="name"
            name="browser"
            placeholder="Select a Browser"
          />
        </div>
        <div className="avogrid_fields">
          <label>
            <span>Execution Mode</span>
            <span className="icon_required">*</span>
          </label>
          <SelectButton
            value={mode}
            onChange={(e) => setMode(e.value)}
            options={selections}
          />
        </div>
      </div>
    </div>
  );
};

export default GridBrowser;

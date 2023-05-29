import { SelectButton } from "primereact/selectbutton";
import { Dropdown } from "primereact/dropdown";
import { browsers, selections } from "../../utility/mockData";
import { MultiSelect } from "primereact/multiselect";

const GridBrowser = ({ mode, setMode, avodropdown, onAvoSelectChange, avogrids }) => {
  avogrids.forEach((el, index, arr) => {
    if(Object.keys(el).includes('Hostname')){
      avogrids[index] = { ...el, name: el.Hostname }
    }
  });

  return (
    <div className="avogrid_section col-12 lg:col-12 xl:col-3 md:col-12 sm:col-12">
      <div className="avogrid_container">
        <div className="avogrid_fields">
          <label>
            <span>Avo Agent / Avo Grids</span>
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

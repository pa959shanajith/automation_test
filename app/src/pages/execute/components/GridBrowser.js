import { browsers, selections } from "../../utility/mockData";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import AvoMultiselect from "../../../globalComponents/AvoMultiselect";
import AvoSelect from "../../../globalComponents/AvoSelect";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkRequired } from "../configureSetupSlice";

const GridBrowser = ({
  mode,
  setMode,
  avodropdown,
  onAvoSelectChange,
  avogrids,
}) => {
  const dispatch = useDispatch();
  avogrids.forEach((el, index, arr) => {
    if (Object.keys(el).includes("Hostname")) {
      avogrids[index] = { ...el, name: el.Hostname };
    }
  });

  useEffect(() => {
    dispatch(checkRequired({ selectedBrowser: avodropdown?.browser }));
    dispatch(checkRequired({ avoGrids: avodropdown?.avogrid }));
  }, [avodropdown.avogrid, avodropdown.browser]);

  return (
    <div className="avogrid_section col-12 lg:col-12 xl:col-3 md:col-12 sm:col-12">
      <div className="avogrid_container">
        <div className="avogrid_fields">
          <AvoDropdown
            dropdownValue={avodropdown.avogrid}
            onDropdownChange={onAvoSelectChange}
            dropdownOptions={avogrids}
            name="avogrid"
            placeholder="Select Avo Grid"
            required={true}
            labelTxt="Avo Agent / Avo Grid"
          />
        </div>
        <div className="avogrid_fields">
          <AvoMultiselect
            multiSelectValue={avodropdown.browser}
            onMultiSelectChange={onAvoSelectChange}
            multiSelectOptions={browsers}
            name="browser"
            placeholder="Select a Browser"
            labelTxt="Select Browsers"
            required={true}
          />
        </div>
        <div className="avogrid_fields">
          <AvoSelect
            selectOptions={selections}
            selectMode={mode}
            setSelectMode={setMode}
            labelTxt="Execution Mode"
          />
        </div>
      </div>
    </div>
  );
};

export default GridBrowser;

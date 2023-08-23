import { browsers, selections } from "../../utility/mockData";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import AvoMultiselect from "../../../globalComponents/AvoMultiselect";
import AvoSelect from "../../../globalComponents/AvoSelect";
import { useDispatch } from "react-redux";
import { useEffect ,useState,useRef} from "react";
import { checkRequired } from "../configureSetupSlice";
import { Dropdown } from 'primereact/dropdown';
import "../styles/GridBrowser.scss"
import IntegrationDropDown  from '../../global/components/IntegrationDropDown';
import { Toast } from "primereact/toast";

const GridBrowser = ({
  mode,
  setMode,
  avodropdown,
  onAvoSelectChange,
  avogrids,
  integration,
  setIntegration,
  props
}) => {
  const dispatch = useDispatch();
  avogrids.forEach((el, index, arr) => {
    if (Object.keys(el).includes("Hostname")) {
      avogrids[index] = { ...el, name: el.Hostname };
    }
  });
  const dataParametersCollection = [];
  const [showIntegrationModal,setShowIntegrationModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState(false);
  const toast = useRef(null);

  const tools = [
    { name: 'ALM' },
    { name: 'qTest' },
    { name: 'Zephyr' }
];

const selectedToolTemplate = (option, props) => {
  
  if (option) {
      return (
          <div>{option.name}</div>
      );
  }

  return <span>{props.placeholder}</span>;
};
const toolOptionTemplate = (option) => {
  return (
      <div>{option.name}</div>
  );
};

const setshowModal = (status) => {
  setShowIntegrationModal(status);
}

  useEffect(() => {
    dispatch(checkRequired({ selectedBrowser: avodropdown?.browser }));
    dispatch(checkRequired({ avoGrids: avodropdown?.avogrid }));
  }, [avodropdown.avogrid, avodropdown.browser]);

  // const [integrationConfig, setIntegrationConfig] = useState({
    // ...props.currentIntegration,
    // dataParameters: dataParametersCollection
// });
const syncScenarioChange = (value) => {
  setShowIntegrationModal(value);
  // setIntegration(value);
}
// const [integration,setIntegration] = useState(props.currentIntegration.executionRequest ? props.currentIntegration.executionRequest.integration : {
//   alm: {url:"",username:"",password:""}, 
//   qtest: {url:"",username:"",password:"",qteststeps:""}, 
//   zephyr: {url:"",username:"",password:""}
// });
const displayError = (error) =>{
  // props.setLoading(false);

  toast.current.show({
    severity: 'error',
    summary: 'Error',
    detail: error,
    life: 5000
  });
}


  return (
    <>
    { showIntegrationModal ? 
      <IntegrationDropDown
          setshowModal={setshowModal}
          type={showIntegrationModal} 
          showIntegrationModal={showIntegrationModal} 
          appType=''
          setCredentialsExecution={setIntegration}
          integrationCred={integration}
          displayError={displayError}
          browserTypeExe={avodropdown.browser.map((browser)=> browser.key)}
      />
  :null}
    <Toast ref={toast} position="bottom-center" />
    <div className="avogrid_section col-12 lg:col-12 xl:col-3 md:col-12 sm:col-12">
      <div className="avogrid_container">
        <div className="avogrid_fields">
          <AvoDropdown
            dropdownValue={avodropdown?.avogrid ? avodropdown?.avogrid : {name: 'Any Agent', _id: '1111'} }
            onDropdownChange={onAvoSelectChange}
            dropdownOptions={avogrids}
            name="avogrid"
            placeholder="Select Avo Grid"
            labelTxt="Avo Agent / Avo Grid"
            required={false}
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
        <div>
          <label className="integration_label">Select Integration</label>
        </div>
        <div>

        <Dropdown 
        value={selectedTool} 
        onChange={(selectedIntegration) => {
          setSelectedTool(selectedIntegration.value)
          syncScenarioChange(selectedIntegration.value.name)
        } }
        options={tools}
         optionLabel="name" 
         placeholder="Select Integration"  
        valueTemplate={selectedToolTemplate} 
        itemTemplate={toolOptionTemplate} 
        className="custom-dropdown w-full md:w-16rem" />
   
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
    </>
  );
};

export default GridBrowser;

import { browsers, selections } from "../../utility/mockData";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import AvoMultiselect from "../../../globalComponents/AvoMultiselect";
import AvoSelect from "../../../globalComponents/AvoSelect";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { checkRequired } from "../configureSetupSlice";
import { Dropdown } from 'primereact/dropdown';
import "../styles/GridBrowser.scss"
import IntegrationDropDown from '../../global/components/IntegrationDropDown';
import { Toast } from "primereact/toast";
import { InputSwitch } from "primereact/inputswitch";
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";


const GridBrowser = ({
  mode,
  setMode,
  avodropdown,
  onAvoSelectChange,
  avogrids,
  integration,
  setIntegration,
  defaultValues = {},
  setDefaultValues,
  setIsNotifyOnExecutionCompletion,
  isNotifyOnExecutionCompletion,
  handleSubmit,
  isEmailNotificationEnabled,
  setIsEmailNotificationEnabled,
  displayModal,
  onHide,
  onClick,
  checkedExecution,
  setCheckedExecution
}) => {
  const dispatch = useDispatch();
  avogrids.forEach((el, index, arr) => {
    if (Object.keys(el).includes("Hostname")) {
      avogrids[index] = { ...el, name: el.Hostname };
    }
  });
  const NameOfAppType = useSelector((state) => state.landing.defaultSelectProject);
  const typesOfAppType = NameOfAppType.appType;
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  
  const determineIntegration = (integrationData) => {
    if (integrationData?.alm?.url) {
      return 'ALM';
    } else if (integrationData?.qtest?.url) {
      return 'qTest';
    } else if (integrationData?.zephyr?.url) {
      return 'Zephyr';
    } else if (integrationData?.azure?.url) {
      return 'Azure';
    }
     else {
      return 'None';
    }
  };
  const [selectedTool, setSelectedTool] = useState({name: determineIntegration(integration)});
  const [checkedNotify, setCheckedNotify] = useState(false);
  // const[isNotifyOnExecutionCompletion,setIsNotifyOnExecutionCompletion]=useState('');
  const toast = useRef(null);

  const integrationList = [
    { name: 'ALM' },
    { name: 'qTest' },
    { name: 'Zephyr' },
    { name: 'Azure'}
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
  const displayError = (error) => {
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
      {showIntegrationModal ?
        <IntegrationDropDown
          setshowModal={setshowModal}
          type={showIntegrationModal}
          showIntegrationModal={showIntegrationModal}
          appType=''
          setCredentialsExecution={setIntegration}
          integrationCred={integration}
          displayError={displayError}
          browserTypeExe={avodropdown.browser.map((browser) => browser.key)}
        />
        : null}
      <Toast ref={toast} position="bottom-center" />
      <div className="avogrid_section col-12 lg:col-12 xl:col-3 md:col-12 sm:col-12">
        <div className="avogrid_container">
          <div className="avogrid_fields">
            <AvoDropdown
              dropdownValue={avodropdown?.avogrid ? avodropdown?.avogrid : { name: 'Any Agent', _id: '1111' }}
              onDropdownChange={onAvoSelectChange}
              dropdownOptions={avogrids}
              name="avogrid"
              placeholder="Select Avo Grid"
              labelTxt="Avo Agent / Avo Grid"
              required={false}
              disabled={typesOfAppType !== 'Web'}
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
              required={typesOfAppType !== 'Web'? false:true}
              disabled={(typesOfAppType !== 'Web')}
              labelForNotWebApp = {typesOfAppType !== 'Web'? true:false}
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
              }}
              options={integrationList}
              optionLabel="name"
              placeholder="Select Integration"
              valueTemplate={selectedToolTemplate}
              itemTemplate={toolOptionTemplate}
              className="custom-dropdown w-full md:w-18rem"
              disabled={!(avodropdown.browser && avodropdown.browser.length > 0 && typesOfAppType === 'Web')}
            />

          </div>
          <div className="avogrid_fields">
            <AvoSelect
              selectOptions={selections}
              selectMode={mode}
              setSelectMode={setMode}
              disabled={(typesOfAppType !== 'Web')}
              labelTxt="Execution Mode"
            />
          </div>
          <div>
            <label className="executionlevel_lable">Execution Level:</label>
            <label className="testsuite_lable">Test Suite</label>
            <InputSwitch className="switch_executionlevel" checked={checkedExecution} onChange={(e) => setCheckedExecution(e.value)} />
            <label className="testcase_lable">Test case</label>
          </div>
          <div>
            <label className="email_lable">Email Notification:</label>
            <lable className="off_lable">Off</lable>
            <InputSwitch className="switch_executionnotify" checked={isEmailNotificationEnabled} onChange={() => { setIsEmailNotificationEnabled(!isEmailNotificationEnabled); onClick("displayModal") }} />
            <lable className="on_lable">On</lable>
            <div>
              {isEmailNotificationEnabled ?
                <div>
                  <Dialog
                    visible={displayModal}
                    onHide={() => onHide('displayModal')}
                    header="Email Notification Configuration"
                    modal
                    style={{ width: '40rem', height: "25rem" }}

                  >
                    <label className="receiver_lable">Receiver:</label>
                    <InputText className='receiver_name' value={defaultValues.EmailRecieverAddress} onChange={(event) => {
                      setDefaultValues({ ...defaultValues, EmailRecieverAddress: event.target.value });
                    }} > </InputText>
                    <div>
                      Add multiple receiver emails separated by a comma(,).</div>
                    <div>
                      <label className="notify_label">Notify only on Execution Completion:</label>
                      <label className="offpopup">off</label>
                      <InputSwitch className="switch_notify" checked={isNotifyOnExecutionCompletion} onChange={() => { setIsNotifyOnExecutionCompletion(!isNotifyOnExecutionCompletion) }} />
                      <label className="onPopup">On</label>
                    </div>
                    <div>
                      <Button className="savebutton" size="small" onClick={() => { handleSubmit(defaultValues) }} >Save</Button>
                    </div>
                  </Dialog>
                </div> : null
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GridBrowser;

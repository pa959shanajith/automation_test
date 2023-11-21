import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { TabView, TabPanel } from "primereact/tabview";
import { MultiSelect } from "primereact/multiselect";
import { Column } from "primereact/column";
import { TreeTable } from "primereact/treetable";
import {
  accessibilities,
  conditions,
  configTableHead,
} from "../../utility/mockData";
import "../styles/ConfigureSetup.scss";
import GridBrowser from "./GridBrowser";
import AvoInput from "../../../globalComponents/AvoInput";
import { useDispatch, useSelector } from "react-redux";
import { checkRequired, readTestSuite } from "../configureSetupSlice";
import { Tooltip } from 'primereact/tooltip';
const ConfigureSetup = ({
  configData,
  tabIndex,
  setTabIndex,
  xpanded,
  setXpanded,
  dataparam,
  setDataparam,
  condition,
  setCondition,
  accessibility,
  setAccessibility,
  modules,
  setModules,
  configTxt,
  setConfigTxt,
  avodropdown,
  setAvodropdown,
  mode,
  setMode,
  selectedNodeKeys,
  setSelectedNodeKeys,
  dotNotExe,
  integration,
  setIntegration,
  defaultValues,
  setDefaultValues,
  isNotifyOnExecutionCompletion,
  setIsNotifyOnExecutionCompletion,
  handleSubmit,
  isEmailNotificationEnabled,
  setIsEmailNotificationEnabled,
  displayModal,
  onHide,
  onClick,
  typeOfExecution,
  checkedExecution,
  setCheckedExecution,
  typesOfAppType
}) => {
  const [configTable, setConfigTable] = useState([]);
  const [tableFilter, setTableFilter] = useState("");
  const [useDefault, setUseDefault] = useState("");
  
  const dispatch = useDispatch();
  const getProjectData = useSelector((store) => store.configsetup);

  const isModuleRequired = modules === "e2eExecution";
  const isTestsuiteRequired = modules === "normalExecution";


  useEffect(() => {
    const mainTree = [];
    configData?.configureData && configData?.configureData[modules]?.map((el, index) => {
      const childTree = [];
      if (!!el?.scenarios.length) {
        el?.scenarios.forEach((e, ind) => {
          const dataParamName = `dataParamName${ind}${index}`;
          const conditionName = `conditionName${ind}${index}`;
          const accessibilityName = `accessibilityName${ind}${index}`;
          childTree.push({
            key: `${index}-${ind}`,
            data: {
              name: e?.name,
              dataParameterization: (
                <InputText
                  value={dataparam[dataParamName]?.value}
                  placeholder="Enter Text"
                  name={dataParamName}
                  className="p-inputtext-sm"
                  onChange={(e) => onDataparamChange(e, index)}
                />
              ),
              condition: (
                <Dropdown
                  value={condition[conditionName]?.value}
                  options={conditions}
                  optionLabel="name"
                  name={conditionName}
                  placeholder="Select a Condition"
                  onChange={(e) => onConditionChange(e, index)}
                  className="condition_dropdown"
                />
              ),
              accessibility: (
                <MultiSelect
                  value={
                    Array.isArray(accessibility[accessibilityName]?.value)
                      ? accessibility[accessibilityName]?.value
                      : []
                  }
                  onChange={(e) => onAccessibilityChange(e, index)}
                  name={accessibilityName}
                  options={accessibilities}
                  placeholder="Select a Accessibility"
                  optionLabel="name"
                />
              ),
            },
          });
        });
      }
      mainTree.push({
        key: `${index}`,
        id: el?.moduleid,
        data: {
          name: el?.name,
        },
        children: childTree,
      });
    });
    setConfigTable(mainTree);
  }, [configData?.configureData, modules, dataparam, condition, accessibility]);

  // useEffect(() => {
  //   dispatch(checkRequired({ configName: configTxt }));
  // }, [configTxt]);

  useEffect(() => {
    const getXpanded = [...xpanded];
    const getStateOfParam = { ...dataparam };
    const getStateOfCondition = { ...condition };
    const getStateOfAccess = { ...accessibility };
    configTable.forEach((el, ind) => {
      if (el.id === getProjectData?.testsuiteId) {
        getXpanded.forEach((item, i) => {
          if(el.key === item.key){
            getXpanded.splice(i, 1);
          }
        });
        const getSuiteId =
          getProjectData?.testsuiteData[getProjectData?.testsuiteId];
        const duplicate = getXpanded.findIndex(
          (item) => item?.testsuiteid === getSuiteId?.testsuiteid
        );
        if (duplicate === -1)
          getXpanded.push({
            testsuiteid: getSuiteId?.testsuiteid,
            key: el.key,
            suitescenarios: getSuiteId?.scenarioids,
            suitename: getSuiteId?.testsuitename,
            suiteid: getProjectData?.testsuiteId,
          });
        el.children.forEach((item, index) => {
          const dataParamValue = `dataParamName${index}${ind}`;
          const conditionValue = `conditionName${index}${ind}`;
          const accessibilityValue = `accessibilityName${index}${ind}`;
          getStateOfParam[dataParamValue] = {
            value: getSuiteId?.dataparam[index],
            key: el.key,
          };
          const getCondition = getSuiteId?.condition[index];
          getStateOfCondition[conditionValue] = {
            value: {
              name: getCondition ? "True" : "False",
              code: getCondition ? "T" : "F",
            },
            key: el.key,
          };
          getStateOfAccess[accessibilityValue] = {
            value: Array.isArray(getSuiteId?.accessibilityParameters[index])
              ? getSuiteId?.accessibilityParameters[index]
              : [],
            key: el.key,
          };
          setDataparam(getStateOfParam);
          setCondition(getStateOfCondition);
          setAccessibility(getStateOfAccess);
        });
      }
    });
    setXpanded(getXpanded);
  }, [getProjectData.testsuiteData]);

  useEffect(() => {
    if (!!Object.keys(dotNotExe).length) {
      const getExecutions = configData?.configureData ? configData?.configureData[modules] : [];
      const getNotExe = dotNotExe?.executionRequest?.donotexe?.current;
      const nodeObj = {};
      const getXpanded = [...xpanded];
      getExecutions.forEach((el, ind) => {
        if (Object.keys(getNotExe).includes(el.moduleid)) {
          nodeObj[ind] = {
            checked: true,
            partialChecked:
              getNotExe[el.moduleid].length !== el.scenarios.length,
          };
          if (getNotExe[el.moduleid].length) {
            getNotExe[el.moduleid].forEach((item) => {
              nodeObj[`${ind}-${item}`] = {
                checked: true,
                partialChecked: false,
              };
            });
          }
          const duplicate = getXpanded.findIndex(
            (item) => item?.suiteid === el?.moduleid
          );
          if (duplicate === -1) {
            getXpanded.push({
              testsuiteid: 0,
              key: ind.toString(),
              suitescenarios: el?.scenarios.map((item) => item._id),
              suitename: el?.name,
              suiteid: el?.moduleid,
            });
          }
        }
      });
      setXpanded(getXpanded);
      setSelectedNodeKeys(nodeObj);
    }
  }, [dotNotExe]);

  const onDataparamChange = (e, getKey) => {
    setDataparam({
      ...dataparam,
      [e.target.name]: { value: e.target.value, key: getKey },
    });
  };

  const onConditionChange = (e, getKey) => {
    setCondition({
      ...condition,
      [e.target.name]: { value: e.target.value, key: getKey },
    });
  };

  const onAccessibilityChange = (e, getKey) => {
    setAccessibility({
      ...accessibility,
      [e.target.name]: { value: e.target.value, key: getKey },
    });
  };

  const onAvoSelectChange = (e) => {
    setAvodropdown({
      ...avodropdown,
      [e.target.name]: e.target.value,
    });
  };

  const onCheckboxChange = (e) => {
    setSelectedNodeKeys(e.value);
  };

  const onNodeXpand = (e) => {
    const dataObj = {
      dataKey: e?.node?.key,
      dataId: e?.node?.id,
      dataParams: [
        {
          releaseid: getProjectData?.projects[0].releases[0].name,
          cycleid: getProjectData?.projects[0].releases[0].cycles[0]._id,
          testsuiteid: e?.node?.id,
          testsuitename: e?.node?.data?.name,
          projectidts: getProjectData?.projects[0]._id,
        },
      ],
    };
    dispatch(readTestSuite(dataObj));
  };

  const tableTreeHeader = (
    <div className="flex align-items-center justify-content-between">
      <div className="flex align-items-center">
      <div className="radioButton"
        tooltipOptions={{ showOnDisabled: true }}>
          {typeOfExecution === "normalExecution" && <Tooltip target=".radioButton" position="bottom" content="You cannot switch between the test suite and end-to-end flow while editing."/>}
        <RadioButton
          inputId="module1"
          name="module"
          value="e2eExecution"
          onChange={(e) => {setModules(e.value);setSelectedNodeKeys({});}}
          checked={modules === "e2eExecution"}
          required={isModuleRequired}
          disabled={typeOfExecution === "normalExecution"}  
          >
        </RadioButton></div>
        <label  htmlFor="module1" className={typeOfExecution === "normalExecution"? "disabledEffect":"ml-2"}>
          End to End Flow{isModuleRequired && <span className="required-asterisk">*</span>}
        </label>
      </div>
      <div className="flex align-items-center">
        <div className="radioButton"
        tooltipOptions={{ showOnDisabled: true }}>
          {typeOfExecution === "e2eExecution" && <Tooltip target=".radioButton" position="bottom" content="You cannot switch between the test suite and end-to-end flow while editing."/>}
        <RadioButton
          inputId="module2"
          name="module"
          value="normalExecution"
          onChange={(e) => {setModules(e.value);setSelectedNodeKeys({});}}
          checked={modules === "normalExecution"}
          required={isTestsuiteRequired} 
          disabled={typeOfExecution === "e2eExecution"}>
        </RadioButton></div>
        <label htmlFor="module2" className={typeOfExecution === "e2eExecution"? "disabledEffect":"ml-2"}>
          Test Suites{isTestsuiteRequired && <span className="required-asterisk">*</span>}
        </label>
      </div>
      <div className="flex align-items-center config_text">
        <AvoInput
          icon="pi pi-search"
          placeholder="Search"
          inputTxt={tableFilter}
          setInputTxt={setTableFilter}
          inputType="searchIcon"
        />
      </div>
    </div>
  );

  const rowClassName = (node) => {
    if (node?.key?.includes('-')) {
      return { genaralRow: true };
    } else {
      return { ...(modules === "normalExecution" ? {customNormalRow: true} : {customE2ERow: true} )};
    }
  };

  return (
    <div className="grid config_setup">
      <div className="config_container">
        <div className="grid">
          <div class="col-12 lg:col-12 xl:col-6 md:col-12 sm:col-12 flex flex-column">
            <AvoInput
              htmlFor="username"
              labelTxt="Configuration Name"
              infoIcon="static/imgs/Info_icon.svg"
              required={true}
              placeholder="Enter Configuration Name"
              inputTxt={configTxt}
              customClass="inputRow"
              setInputTxt={setConfigTxt}
              inputType="lablelRowReqInfo"
            />
          </div>
        </div>
        <div className="grid config_subcontainer">
          <div className="table_section col-12 lg:col-12 xl:col-9 md:col-12 sm:col-12">
            <TreeTable
              onExpand={(e) => onNodeXpand(e)}
              onSelect={(e) => onNodeXpand(e)}
              header={tableTreeHeader}
              value={configTable}
              selectionMode="checkbox"
              selectionKeys={selectedNodeKeys}
              loading={configData.loading}
              onSelectionChange={(e) => onCheckboxChange(e)}
              className="tabletree_class"
              rowClassName={rowClassName}
              showGridlines
              globalFilter={tableFilter}
            >
              {configTableHead.map((el) => (
                <Column
                  field={el.field}
                  header={el.code}
                  className={`column_${el.field}`}
                  {...(el.field === "name" ? { expander: true } : {})}
                ></Column>
              ))}
            </TreeTable>
          </div>
          <GridBrowser
            mode={mode}
            setMode={setMode}
            avodropdown={avodropdown}
            onAvoSelectChange={onAvoSelectChange}
            // setCurrentIntegration={setCurrentIntegration} currentIntegration={currentIntegration}
            integration={integration}
            setIntegration={setIntegration}
            avogrids={[
              ...configData?.avoAgentAndGrid?.avoagents,
              ...configData?.avoAgentAndGrid?.avogrids,
            ]}
            defaultValues={defaultValues}
            setDefaultValues={setDefaultValues}
            isNotifyOnExecutionCompletion={isNotifyOnExecutionCompletion}
            setIsNotifyOnExecutionCompletion={setIsNotifyOnExecutionCompletion}
            handleSubmit={handleSubmit}
            isEmailNotificationEnabled={isEmailNotificationEnabled}
            setIsEmailNotificationEnabled={setIsEmailNotificationEnabled}
            displayModal={displayModal}
            onHide={onHide}
            onClick={onClick}
            checkedExecution={checkedExecution}
            setCheckedExecution={setCheckedExecution}
            typesOfAppType={typesOfAppType}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigureSetup;

import { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { TabView, TabPanel } from "primereact/tabview";
import { MultiSelect } from "primereact/multiselect";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { TreeTable } from "primereact/treetable";
import { Tree } from "primereact/tree";
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
  setDotNotExe
}) => {
  const [configTable, setConfigTable] = useState([]);
  const [tableFilter, setTableFilter] = useState("");
  const [useDefault, setUseDefault] = useState("");
  const dispatch = useDispatch();
  const getProjectData = useSelector((store) => store.configsetup);

  useEffect(() => {
    const mainTree = [];
    configData?.configureData[modules].map((el, index) => {
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

  useEffect(() => {
    console.log(configData?.configureData);
    console.log(dotNotExe);
  }, [dotNotExe]);

  useEffect(() => {
    dispatch(checkRequired({ configName: configTxt }));
  }, [configTxt]);

  useEffect(() => {
    const getXpanded = [...xpanded];
    const getStateOfParam = { ...dataparam };
    const getStateOfCondition = { ...condition };
    const getStateOfAccess = { ...accessibility };
    configTable.forEach((el, ind) => {
      if (el.id === getProjectData?.testsuiteId) {
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
            suiteid: getProjectData?.testsuiteId
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
    setSelectedNodeKeys(e.value)
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
        <RadioButton
          inputId="module1"
          name="module"
          value="e2eExecution"
          onChange={(e) => setModules(e.value)}
          checked={modules === "e2eExecution"}
        />
        <label htmlFor="module1" className="ml-2">
          End to End Modules
        </label>
      </div>
      <div className="flex align-items-center">
        <RadioButton
          inputId="module2"
          name="module"
          value="normalExecution"
          onChange={(e) => setModules(e.value)}
          checked={modules === "normalExecution"}
        />
        <label htmlFor="module2" className="ml-2">
          Normal Modules
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
    if (node?.key?.length === 1) {
      return { customRow: true };
    } else {
      return { genaralRow: true };
    }
  };

  const exeinfo = [
    {
      key: "0",
      label: (
        <span>
          <span>
            <img src="static/imgs/PlayIcon.svg" className="exe_icons" />
          </span>
          <span>Execution Information</span>
        </span>
      ),
      data: "Documents Folder",
      children: [
        {
          key: "0-0",
          label: (
            <span>
              <span>
                <img src="static/imgs/clock.svg" className="exe_icons" />
              </span>
              <span>Implicit timeout</span>
            </span>
          ),
          data: "Documents Folder",
          children: [
            {
              key: "0-0-0",
              label: (
                <span>
                  <RadioButton
                    inputId="useDefault"
                    name="timeout"
                    value="Use default"
                    onChange={(e) => setUseDefault(e.value)}
                    checked={useDefault === "Use default"}
                  />
                  <label htmlFor="useDefault" className="ml-2">
                    Use default
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
            {
              key: "0-0-1",
              label: (
                <span>
                  <RadioButton
                    inputId="userdefine"
                    name="timeout"
                    value="User define"
                    onChange={(e) => setUseDefault(e.value)}
                    checked={useDefault === "User define"}
                  />
                  <label htmlFor="userDefine" className="ml-2">
                    User define
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
          ],
        },
        {
          key: "0-1",
          label: (
            <span>
              <span>
                <img src="static/imgs/refresh.svg" className="exe_icons" />
              </span>
              <span>Retry executions</span>
            </span>
          ),
          data: "Documents Folder",
          children: [
            {
              key: "0-0-0",
              label: (
                <span>
                  <RadioButton
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Don’t retry
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
            {
              key: "0-0-1",
              label: (
                <span>
                  <RadioButton
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Retry failed executions immediately
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
            {
              key: "0-0-2",
              label: (
                <span>
                  <RadioButton
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Retry after executing all
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
            {
              key: "0-0-3",
              label: (
                <span>
                  <RadioButton
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Retry all executions
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
            {
              key: "0-0-4",
              label: (
                <span>
                  <RadioButton
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Retry failed executions only
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
          ],
        },
        {
          key: "0-2",
          label: (
            <span>
              <span>
                <img src="static/imgs/video.svg" className="exe_icons" />
              </span>
              <span>Execution Video</span>
            </span>
          ),
          data: "Documents Folder",
          children: [
            {
              key: "0-0-0",
              label: (
                <span>
                  <Checkbox
                    inputId="executeVideo"
                    name="pizza"
                    value="Cheese"
                    // onChange={onIngredientsChange}
                    // checked={ingredients.includes("Cheese")}
                  />
                  <label htmlFor="executeVideo" className="ml-2">
                    Record execution Video
                  </label>
                </span>
              ),
              data: "Documents Folder",
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="grid config_setup">
      <TabView activeIndex={tabIndex} onTabChange={(e) => setTabIndex(e.index)}>
        <TabPanel header="Configuration Information">
          <div className="config_container">
            <div className="grid">
              <div class="col-12 lg:col-12 xl:col-5 md:col-12 sm:col-12 flex flex-column">
                <AvoInput
                  htmlFor="username"
                  labelTxt="Configuration Name"
                  infoIcon="static/imgs/Info_icon.svg"
                  required={true}
                  placeholder="Enter Configuration Name"
                  inputTxt={configTxt}
                  customClass="inputColumn"
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
                      className={
                        el.field === "name"
                          ? "column_class_name"
                          : "column_class"
                      }
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
                avogrids={[
                  ...configData?.avoAgentAndGrid?.avoagents,
                  ...configData?.avoAgentAndGrid?.avogrids,
                ]}
              />
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Execution Information">
          <Tree value={exeinfo} className="config_tree" />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ConfigureSetup;

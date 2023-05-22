import { useState } from "react";
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
  selections,
} from "../../utility/mockData";
import "../styles/ConfigureSetup.scss";
import GridBrowser from "./GridBrowser";
import AvoInput from "../../../global/AvoInput";

const ConfigureSetup = () => {
  const [dataparam, setDataparam] = useState({});
  const [condition, setCondition] = useState({});
  const [accessibility, setAccessibility] = useState({});
  const [avodropdown, setAvodropdown] = useState({});
  const [selectedNodeKeys, setSelectedNodeKeys] = useState(null);
  const [mode, setMode] = useState(selections[0]);
  const [modules, setModules] = useState("");
  const [configTxt, setConfigTxt] = useState("");
  const [tableFilter, setTableFilter] = useState("");

  const onDataparamChange = (e) => {
    setDataparam({
      ...dataparam,
      [e.target.name]: e.target.value,
    });
  };

  const onConditionChange = (e) => {
    setCondition({
      ...condition,
      [e.target.name]: e.target.value,
    });
  };

  const onAccessibilityChange = (e) => {
    setAccessibility({
      ...accessibility,
      [e.target.name]: e.target.value,
    });
  };

  const onAvoSelectChange = (e) => {
    setAvodropdown({
      ...avodropdown,
      [e.target.name]: e.target.value,
    });
  };

  const configTableData = [
    {
      key: "0",
      data: {
        name: "Sign-up Module",
      },
      children: [
        {
          key: "0-0",
          data: {
            name: "Sign Up Scenario1",
            dataParameterization: (
              <InputText
                value={dataparam.singup0}
                placeholder="Enter Text"
                name="singup0"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition0}
                options={conditions}
                optionLabel="name"
                name="condition0"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
                className="condition_dropdown"
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access0}
                onChange={(e) => onAccessibilityChange(e)}
                name="access0"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-1",
          data: {
            name: "Sign Up Scenario2",
            dataParameterization: (
              <InputText
                value={dataparam.singup1}
                placeholder="Enter Text"
                name="singup1"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition1}
                options={conditions}
                optionLabel="name"
                name="condition1"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access1}
                onChange={(e) => onAccessibilityChange(e)}
                name="access1"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-2",
          data: {
            name: "Sign Up Scenario3",
            dataParameterization: (
              <InputText
                value={dataparam.singup2}
                placeholder="Enter Text"
                name="singup2"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition2}
                options={conditions}
                optionLabel="name"
                name="condition2"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access2}
                onChange={(e) => onAccessibilityChange(e)}
                name="access2"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-3",
          data: {
            name: "Sign Up Scenario4",
            dataParameterization: (
              <InputText
                value={dataparam.singup3}
                placeholder="Enter Text"
                name="singup3"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition3}
                options={conditions}
                optionLabel="name"
                name="condition3"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access3}
                onChange={(e) => onAccessibilityChange(e)}
                name="access3"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-4",
          data: {
            name: "Sign Up Scenario5",
            dataParameterization: (
              <InputText
                value={dataparam.singup4}
                placeholder="Enter Text"
                name="singup4"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition4}
                options={conditions}
                optionLabel="name"
                name="condition4"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access4}
                onChange={(e) => onAccessibilityChange(e)}
                name="access4"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-5",
          data: {
            name: "Sign Up Scenario6",
            dataParameterization: (
              <InputText
                value={dataparam.singup5}
                placeholder="Enter Text"
                name="singup5"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition5}
                options={conditions}
                optionLabel="name"
                name="condition5"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access5}
                onChange={(e) => onAccessibilityChange(e)}
                name="access5"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-6",
          data: {
            name: "Sign Up Scenario7",
            dataParameterization: (
              <InputText
                value={dataparam.singup6}
                placeholder="Enter Text"
                name="singup6"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition6}
                options={conditions}
                optionLabel="name"
                name="condition6"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access6}
                onChange={(e) => onAccessibilityChange(e)}
                name="access6"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-7",
          data: {
            name: "Sign Up Scenario8",
            dataParameterization: (
              <InputText
                value={dataparam.singup7}
                placeholder="Enter Text"
                name="singup7"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition7}
                options={conditions}
                optionLabel="name"
                name="condition7"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access7}
                onChange={(e) => onAccessibilityChange(e)}
                name="access7"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-8",
          data: {
            name: "Sign Up Scenario9",
            dataParameterization: (
              <InputText
                value={dataparam.singup8}
                placeholder="Enter Text"
                name="singup8"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition8}
                options={conditions}
                optionLabel="name"
                name="condition8"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access8}
                onChange={(e) => onAccessibilityChange(e)}
                name="access8"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-9",
          data: {
            name: "Sign Up Scenario10",
            dataParameterization: (
              <InputText
                value={dataparam.singup9}
                placeholder="Enter Text"
                name="singup9"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition9}
                options={conditions}
                optionLabel="name"
                name="condition9"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access9}
                onChange={(e) => onAccessibilityChange(e)}
                name="access9"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
      ],
    },
    {
      key: "1",
      data: {
        name: "Login Module",
      },
      children: [
        {
          key: "0-0",
          data: {
            name: "Login Scenario zero",
            dataParameterization: (
              <InputText
                value={dataparam.singup0}
                placeholder="Enter Text"
                name="singup0"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition0}
                options={conditions}
                optionLabel="name"
                name="condition0"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
                className="condition_dropdown"
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access0}
                onChange={(e) => onAccessibilityChange(e)}
                name="access0"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-1",
          data: {
            name: "Login Scenario one",
            dataParameterization: (
              <InputText
                value={dataparam.singup1}
                placeholder="Enter Text"
                name="singup1"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition1}
                options={conditions}
                optionLabel="name"
                name="condition1"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access1}
                onChange={(e) => onAccessibilityChange(e)}
                name="access1"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-2",
          data: {
            name: "Login Scenario two",
            dataParameterization: (
              <InputText
                value={dataparam.singup2}
                placeholder="Enter Text"
                name="singup2"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition2}
                options={conditions}
                optionLabel="name"
                name="condition2"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access2}
                onChange={(e) => onAccessibilityChange(e)}
                name="access2"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-3",
          data: {
            name: "Login Scenario three",
            dataParameterization: (
              <InputText
                value={dataparam.singup3}
                placeholder="Enter Text"
                name="singup3"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition3}
                options={conditions}
                optionLabel="name"
                name="condition3"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access3}
                onChange={(e) => onAccessibilityChange(e)}
                name="access3"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-4",
          data: {
            name: "Login Scenario four",
            dataParameterization: (
              <InputText
                value={dataparam.singup4}
                placeholder="Enter Text"
                name="singup4"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition4}
                options={conditions}
                optionLabel="name"
                name="condition4"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access4}
                onChange={(e) => onAccessibilityChange(e)}
                name="access4"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-5",
          data: {
            name: "Login Scenario Five",
            dataParameterization: (
              <InputText
                value={dataparam.singup5}
                placeholder="Enter Text"
                name="singup5"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition5}
                options={conditions}
                optionLabel="name"
                name="condition5"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access5}
                onChange={(e) => onAccessibilityChange(e)}
                name="access5"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-6",
          data: {
            name: "Login Scenario six",
            dataParameterization: (
              <InputText
                value={dataparam.singup6}
                placeholder="Enter Text"
                name="singup6"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition6}
                options={conditions}
                optionLabel="name"
                name="condition6"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access6}
                onChange={(e) => onAccessibilityChange(e)}
                name="access6"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-7",
          data: {
            name: "Login Scenario seven",
            dataParameterization: (
              <InputText
                value={dataparam.singup7}
                placeholder="Enter Text"
                name="singup7"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition7}
                options={conditions}
                optionLabel="name"
                name="condition7"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access7}
                onChange={(e) => onAccessibilityChange(e)}
                name="access7"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-8",
          data: {
            name: "Login Scenario eight",
            dataParameterization: (
              <InputText
                value={dataparam.singup8}
                placeholder="Enter Text"
                name="singup8"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition8}
                options={conditions}
                optionLabel="name"
                name="condition8"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access8}
                onChange={(e) => onAccessibilityChange(e)}
                name="access8"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
        {
          key: "0-9",
          data: {
            name: "Login Scenario nine",
            dataParameterization: (
              <InputText
                value={dataparam.singup9}
                placeholder="Enter Text"
                name="singup9"
                className="p-inputtext-sm"
                onChange={(e) => onDataparamChange(e)}
              />
            ),
            condition: (
              <Dropdown
                value={condition.condition9}
                options={conditions}
                optionLabel="name"
                name="condition9"
                placeholder="Select a Condition"
                onChange={(e) => onConditionChange(e)}
              />
            ),
            accessibility: (
              <MultiSelect
                value={accessibility.access9}
                onChange={(e) => onAccessibilityChange(e)}
                name="access9"
                options={accessibilities}
                placeholder="Select a Accessibility"
                optionLabel="name"
              />
            ),
          },
        },
      ],
    },
  ];

  const tableTreeHeader = (
    <div className="flex align-items-center justify-content-between">
      <div className="flex align-items-center">
        <RadioButton
          inputId="module1"
          name="module"
          value="End to End Modules"
          onChange={(e) => setModules(e.value)}
          checked={modules === "End to End Modules"}
        />
        <label htmlFor="module1" className="ml-2">
          End to End Modules
        </label>
      </div>
      <div className="flex align-items-center">
        <RadioButton
          inputId="module2"
          name="module"
          value="Normal Modules"
          onChange={(e) => setModules(e.value)}
          checked={modules === "Normal Modules"}
        />
        <label htmlFor="module2" className="ml-2">
          Normal Modules
        </label>
      </div>
      <div className="flex align-items-center config_text">
        <AvoInput
          icon="pi pi-search"
          placeholder="Enter Configuration Name"
          inputTxt={tableFilter}
          setInputTxt={setTableFilter}
          inputType="searchIcon"
        />
      </div>
    </div>
  );

  const rowClassName = (node) => {
    if (node.key.length === 1) {
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
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
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
                    inputId="ingredient4"
                    name="pizza"
                    value="Onion"
                  />
                  <label htmlFor="ingredient4" className="ml-2">
                    Use default
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
            }
          ],
        },
      ],
    },
  ];

  return (
    <div className="grid config_setup">
      <TabView>
        <TabPanel header="Configuration Information">
          <div className="config_container">
            <div className="grid">
              <div class="col-5 flex flex-column">
                <AvoInput
                  htmlFor="username"
                  labelTxt="Configuration Name"
                  infoIcon="static/imgs/Info_icon.svg"
                  required={true}
                  placeholder="Enter Configuration Name"
                  inputTxt={configTxt}
                  setInputTxt={setConfigTxt}
                  inputType="lablelRowReqInfo"
                />
              </div>
            </div>
            <div className="config_subcontainer">
              <div className="table_section">
                <TreeTable
                  header={tableTreeHeader}
                  value={configTableData}
                  selectionMode="checkbox"
                  selectionKeys={selectedNodeKeys}
                  onSelectionChange={(e) => setSelectedNodeKeys(e.value)}
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

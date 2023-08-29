import React, { useEffect, useRef, useState } from "react";
import { Column } from "primereact/column";
import { TreeTable } from "primereact/treetable";
import { Button } from "primereact/button";
import { connectAzure_ICE, connectAzure_ICE_Fields, connectJira_ICE, connectJira_ICE_Fields, connectJira_ICE_create, getDetails_JIRA, viewAzureMappedList_ICE, viewReport } from "../api";
import { InputText } from "primereact/inputtext";
import "../styles/ReportTestTable.scss";
import { OverlayPanel } from "primereact/overlaypanel";
import { Checkbox } from "primereact/checkbox";
import CollapsibleCard from "./CollapsibleCard";
import { Accordion, AccordionTab } from "primereact/accordion";
import { FooterTwo } from "../../global";
import { getStepIcon } from "../containers/ReportUtils";
import AvoModal from "../../../globalComponents/AvoModal";
import { Menu } from "primereact/menu";
import AvoDropdown from "../../../globalComponents/AvoDropdown";
import AvoMultiselect from "../../../globalComponents/AvoMultiselect";
import { browsers, scheduleMonths } from "../../utility/mockData";
import { InputTextarea } from "primereact/inputtextarea";
import { Divider } from "primereact/divider";

export default function BasicDemo() {
  const [reportData, setReportData] = useState([]);
  const [reportViewData, setReportViewData] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [loginKey, setLoginKey] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [searchTest, setSearchTest] = useState("");
  const [userData, setUserData] = useState({});
  const [visibleBug, setVisibleBug] = useState(false);
  const [logBug, setLogBug] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [reportSummaryCollaps, setReportSummaryCollaps] = useState(true);
  const filterRef = useRef(null);
  const [reportid, setReportId] = useState(null);
  const [executed, setExecuted] = useState(null);
  const [jiraDropDown, setJiraDropDown] = useState(null);
  const [issueDropDown, setIssueDropDown] = useState(null);
  const [jiraDetails, setJiraDetails] = useState({ projects: [], issuetype: [] });
  const [configureFeilds, setConfigureFeilds] = useState([]);
  const [selectedFiels, setSelectedFiels] = useState([]);
  const [configValues, setConfigValues] = useState({});
  const [selectedRow, setSelectedRow] = useState([]);
  const filterValues = [
        { name: 'Pass', key: 'P' },
        { name: 'Fail', key: 'F' },
        { name: 'Terminated', key: 'T' }
  ];
  const [selectedFilter, setSelectedFilter] = useState([]);
  const bugRef = useRef(null);
  const userRef = useRef(null);
  useEffect(() => {
    const getQueryParam = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("reportID");
      return id;
    };
    const id = getQueryParam();
    const getUrl = new URLSearchParams(window.location.search);
    const execution = getUrl.get("execution");
    setExecuted(execution);
    setReportId(id);
  }, []);

  useEffect(() => {
    (async () => {
      if(reportid){
        const view = await viewReport(reportid);
        setReportData(JSON.parse(view));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportid]);
  useEffect(() => {
    const parent = [];
    if (reportData && Array.isArray(reportData?.rows)) {
      for (const obj of reportData?.rows) {
        if (obj.hasOwnProperty("Step") && obj?.Step !== "Terminated") {
          if (!parent[parent.length - 1]?.children) {
            parent[parent.length - 1].children = [obj]; // Push the new object into parent array
          } else {
            parent[parent.length - 1]?.children.push(obj); // Push the object into existing children array
          }
        } else {
          parent.push(obj); // Push the object into parent array
        }
      }
    } else {
      // Handle the case when reportData or reportData.rows is not as expected.
      // console.error("reportData.rows is not defined or not an array.");
    }
    setReportViewData(parent);
  }, [reportData]);

  const handdleExpend = (e) => {
    setExpandedKeys(e.value);
  };

  const onBugBtnClick = async (getBtn) => {
    if (getBtn === "Cancel") setVisibleBug(false);
    else if (getBtn === "Connect") {
      if (bugTitle === "Jira") {
        const getJiraDetails = await connectJira_ICE(
          loginUrl,
          loginName,
          loginKey
        );
        setJiraDetails(getJiraDetails);
        // await viewAzureMappedList_ICE("646b3f5695cef4ee0ababfdd", reportData?.overallstatus?.scenarioName);
        setVisibleBug(false);
      } else if (bugTitle === "Azure DevOps") {
        const getAzureDetails = await connectAzure_ICE({
          url: loginUrl,
          username: loginName,
          action: "loginToAzure",
          pat: loginKey,
        });
        setJiraDetails({
          ...getAzureDetails,
          issuetype: [
            {
              id: "10000",
              name: "Bug",
            },
          ],
        });
        setVisibleBug(false);
      }
    }
  };

  console.log(reportData);
  console.log(selectedRow);
  const onLogBugBtnClick = async(getClick) => {
    if (getClick === "Cancel") setLogBug(false);
    else if (getClick === "Proceed") { 
      const userDetails = await connectJira_ICE_create({
        issue_dict: {
          project: jiraDropDown?.id,
          issuetype: issueDropDown?.name,
          summary: selectedRow[0]?.Comments,
          description: selectedRow[0]?.StepDescription,
          url: "https://mnb.atlassian.net/",
          username: "priyanka.r@slkgroup.com",
          password: "B8RUqqKt8B28MSz9zq1Q14AD",
          parentissue: "",
          reportId: reportData?.overallstatus?.reportId,
          slno: selectedRow[0]?.slno,
          executionId: reportData?.overallstatus?.executionId,
          Reporter: {
              field_name: "reporter",
              userInput: "priyanka.r",
              type: "user"
          },
          Environment: {
              field_name: "environment",
              userInput: "yes",
              type: "string"
          },
          executionReportNo: `Execution No: ${executed}`
        },
        action: "createIssueInJira"
      });
    }
  };

  const onFilterChange = (e) => {
    let _selectedFilters = [...selectedFilter];

    if (e.checked) _selectedFilters.push(e.value);
    else {
      _selectedFilters = _selectedFilters.filter(
        (category) => category.key !== e.value.key
      );
    }
    setSelectedFilter(_selectedFilters);
    setSearchTest(_selectedFilters[0]?.name ? _selectedFilters[0].name : "");
  };

  const handleBug = (getBugtype) => {
    setVisibleBug(true);
    setBugTitle(getBugtype);
    (async () => {
      const resp = await getDetails_JIRA();
      setUserData(resp);
    })();
  };

  const getTableHeader = (
    <div className="grid">
      <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex align-items-center">
        {(reportData?.browserType === "NA" || "chrome") && (
          <img
            src="static/imgs/chrome_icon.svg"
            alt="chrome icon"
            style={{ width: "25px", height: "25px", margin: "0.5rem" }}
          />
        )}
        {reportData?.browserType === "edge" && (
          <img
            src="static/imgs/edge_icon.svg"
            alt="edge icon"
            style={{ width: "25px", height: "25px", margin: "0.5rem" }}
          />
        )}
        {reportData?.browserType === "edge" && (
          <img
            src="static/imgs/safari_icon.svg"
            alt="safari icon"
            style={{ width: "25px", height: "25px", margin: "0.5rem" }}
          />
        )}
      </div>
      <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex justify-content-center align-items-center">
        <div className="p-input-icon-left">
          <i className="pi pi-search"></i>
          <InputText
            type="search"
            className="search_testCase"
            onInput={(e) => setSearchTest(e.target.value)}
            placeholder="Search for Test Cases"
          />
        </div>
      </div>
      <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex justify-content-end">
        <Button
          type="button"
          icon="pi pi-filter"
          label="Add Filter"
          outlined
          onClick={(e) => {
            filterRef.current.toggle(e);
          }}
        />
      </div>
    </div>
  );

  const onBugClick = (e, rowData) => {
    setSelectedRow(reportData?.rows.filter((el) => el?.Comments === rowData?.data?.Comments));
    if((bugTitle === "Jira" && (jiraDetails?.projects && !!jiraDetails?.projects.length)) || (bugTitle === "Azure DevOps" && (jiraDetails?.projects && !!jiraDetails?.projects.length))){
      setLogBug(true)
    } else {
      bugRef.current.toggle(e)
    }
  }

  const defectIDForJiraAndAzure = (rowData) => {
    const hasChildren = rowData?.children && (rowData?.children?.length > 0);
    const getIcon = (iconType) => {
      let icon = "static/imgs/bug.svg";
      if(iconType === "Jira" && (jiraDetails?.projects && !!jiraDetails?.projects.length)) icon = "static/imgs/jira_icon.svg";
      else if(iconType === "Azure DevOps" && (jiraDetails?.projects && !!jiraDetails?.projects.length)) icon = "static/imgs/azure_devops_icon.svg";
      return icon;
    }
    return hasChildren ? null : (
      <img
        src={getIcon(bugTitle)}
        alt="bug defect"
        className={((bugTitle === "Jira" && (jiraDetails?.projects && !!jiraDetails?.projects.length)) || (bugTitle === "Azure DevOps" && (jiraDetails?.projects && !!jiraDetails?.projects.length))) ? "img_jira" : "" }
        onClick={(e) => onBugClick(e, rowData)}
      />
    );
  };
  const convertDataToTree = (data) => {
    const treeDataArray = [];
    for (let i = 0; i < data.length; i++) {
      const rootNode = {
        key: data[i].id,
        data: {
          StepDescription: data[i].StepDescription,
          slno: data[i].slno,
          key: data[i].id,
        },
        children: [],
      };
      data[i].children?.forEach((child) => {
        const modifiedChild = { ...child }; // Create a new object with the same properties as child
        if (modifiedChild?.EllapsedTime) {
          modifiedChild.EllapsedTime = modifiedChild.EllapsedTime.split(":")
            .slice(0, 3)
            .join(":");
        }
        if (modifiedChild?.Keyword) {
          const stepIcon = getStepIcon(modifiedChild.Keyword);
          const stepDesc = modifiedChild.StepDescription;
          if (stepDesc) {
            modifiedChild.StepDescription = (
              <div key={modifiedChild.key} style={{ display: "flex" }}>
                <img
                  src={stepIcon}
                  alt=""
                  style={{
                    width: "25px",
                    position: "sticky",
                    height: "25px",
                    top: "0rem",
                  }}
                />
                <p className="desc_text">{stepDesc}</p>
              </div>
            );
          }
        }
        const statusIcon =
          modifiedChild.status === "Pass"
            ? "static/imgs/pass.png"
            : modifiedChild.status === "Fail"
            ? "static/imgs/fail.png"
            : "static/imgs/treminated.png";
        const statusDesc = modifiedChild.status;
        modifiedChild.status = (
          <div key={modifiedChild.key} style={{ display: "flex" }}>
            <img
              src={statusIcon}
              alt=""
              style={{
                width: "12px",
                height: "12px",
                position: "relative",
                top: "0.3rem",
              }}
            />
            <p className="desc_text">{statusDesc}</p>
          </div>
        );
        rootNode.children.push({
          data: modifiedChild, // Push the new object with modified properties
        });
      });
      treeDataArray.push(rootNode); // Add the rootNode to the array
    }
    return treeDataArray; // Return the array of treeData
  };

  const treeData = convertDataToTree(reportViewData);

  const onUserName = () => {
    setLoginName(userData?.jiraUsername);
    setLoginKey(userData?.jirakey);
    setLoginUrl(userData?.jiraURL);
  }

  useEffect(() => {
    if(jiraDropDown && issueDropDown){
      (async() => {
        const getFields =
          bugTitle === "Jira"
            ? await connectJira_ICE_Fields(
                jiraDropDown?.id,
                issueDropDown?.name,
                "https://mnb.atlassian.net/",
                "priyanka.r@slkgroup.com",
                "B8RUqqKt8B28MSz9zq1Q14AD",
                jiraDetails?.projects
              )
            : connectAzure_ICE_Fields(
                jiraDropDown?.id,
                issueDropDown?.name,
                "https://dev.azure.com/AvoAutomation",
                "krishna_azure",
                "2mf2gzlewrvjcb3rbqbrnq3lcnanlytv7idaf6bqd22ht5czndcq",
                jiraDetails?.projects
              );
        const fieldValues = Object.keys(getFields).map((el) => ({
          key: getFields[el].key,
          name: el,
          disabled: getFields[el].required,
        }));
        setSelectedFiels(fieldValues);
      })();
    }
  }, [jiraDropDown, issueDropDown]);

  useEffect(() => {
    const autoFill = [];
    const autoValue = {};
    selectedFiels.forEach((item) => {
      if (item.disabled) {
        if(item.name === "Summary")autoValue[item.name] = selectedRow[0]?.Comments;
        else if(item.name === "Description")autoValue[item.name] = selectedRow[0]?.StepDescription;
        autoFill.push({ key: item.key, name: item.name, disabled: item.disabled });
      }
    })
    setConfigureFeilds(autoFill);
    setConfigValues({
      ...configValues,
      ...autoValue
    });
  }, [selectedFiels]);

  const handleConfigValues = (e) => {
    setConfigValues({
      ...configValues,
      [e.target.name] : e.target.value
    });
  };

  return (
    <div className="reportsTable_container">
      <div className="reportSummary">
        <Accordion
          activeIndex={0}
          tabIndex={0}
          onTabOpen={() => setReportSummaryCollaps(false)}
          onTabClose={() => setReportSummaryCollaps(true)}
        >
          <AccordionTab className="content" header="Result Summary">
            <CollapsibleCard
              collapsible={false}
              width="100%"
              className={"card"}
              type="Execution"
              summaryValues={reportData?.overallstatus}
            />
          </AccordionTab>
        </Accordion>
      </div>
      <br></br>
      <TreeTable
        globalFilter={searchTest}
        header={getTableHeader}
        value={treeData}
        className={reportSummaryCollaps ? "viewTable" : "ViewTable"}
        expandedKeys={expandedKeys}
        dataKey="id"
        onToggle={(e) => handdleExpend(e)}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          field="slno"
          header="S No."
          style={{ width: "8rem", padding: "0rem" }}
          align="center"
          expander
        />
        <Column
          field="Step"
          header="Steps"
          style={{ width: "8rem", padding: "0rem" }}
        />
        <Column
          field="StepDescription"
          header="Description"
          style={{ width: "18rem", padding: "0rem" }}
        />
        <Column
          field="EllapsedTime"
          header="Time Elapsed"
          style={{ width: "10rem", padding: "0rem" }}
        />
        <Column
          field="status"
          header="Status"
          style={{ width: "8rem", padding: "0rem" }}
        />
        <Column
          field="Comments"
          header="Comments"
          style={{ width: "18rem", padding: "0rem" }}
        />
        <Column
          header="No. Defect ID"
          body={defectIDForJiraAndAzure}
          style={{ padding: "0rem", textAlign: "center" }}
        />
        <Column header="Action" style={{ padding: "0rem" }} />
      </TreeTable>
      <OverlayPanel ref={filterRef} className="reports_download">
        {filterValues.map((category) => {
          return (
            <div key={category.key} className="flex align-items-center">
              <Checkbox
                inputId={category.key}
                name="category"
                value={category}
                onChange={onFilterChange}
                checked={selectedFilter.some(
                  (item) => item?.key === category?.key
                )}
              />
              <label htmlFor={category.key} className="ml-2">
                {category.name}
              </label>
            </div>
          );
        })}
      </OverlayPanel>
      <div>
        <FooterTwo />
      </div>
      <AvoModal
        visible={visibleBug}
        setVisible={setVisibleBug}
        onModalBtnClick={onBugBtnClick}
        content={
          <div className="flex flex-column">
            <div className="jira_user">Username</div>
            <InputText
              className="jira_credentials"
              onClick={(e) => userRef.current.toggle(e)}
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
            <div className="jira_user">Password/API Key</div>
            <InputText
              className="jira_credentials"
              value={loginKey}
              onChange={(e) => setLoginKey(e.target.value)}
            />
            <div className="jira_user">URL</div>
            <InputText
              className="jira_credentials"
              value={loginUrl}
              onChange={(e) => setLoginUrl(e.target.value)}
            />
          </div>
        }
        customClass="jira_modal"
        headerTxt={`${bugTitle} Login`}
        modalSytle={{
          width: "40vw",
          background: "#FFFFFF",
        }}
        footerType="Connect"
      />
      <OverlayPanel ref={bugRef} className="report_bug">
        <Menu
          model={[
            {
              label: (
                <span onClick={() => handleBug("Jira")}>
                  <img src="static/imgs/jira_icon.svg" className="img_jira" />
                  Jira
                </span>
              ),
            },
            {
              label: (
                <span onClick={() => handleBug("Azure DevOps")}>
                  <img
                    src="static/imgs/azure_devops_icon.svg"
                    className="img_azure"
                  />
                  Azure DevOps
                </span>
              ),
            },
          ]}
        />
      </OverlayPanel>
      {userData?.jiraUsername && (
        <OverlayPanel ref={userRef} className="jira_user">
          <Menu
            model={[
              {
                label: (
                  <span onClick={() => onUserName()}>
                    {userData?.jiraUsername}
                  </span>
                ),
              },
            ]}
          />
        </OverlayPanel>
      )}
      <AvoModal
        visible={logBug}
        setVisible={setLogBug}
        onModalBtnClick={onLogBugBtnClick}
        content={
          <div className="grid">
            <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12">
              <AvoDropdown
                dropdownValue={jiraDropDown}
                onDropdownChange={(e) => setJiraDropDown(e.target.value)}
                dropdownOptions={jiraDetails?.projects}
                name="jiratype"
                placeholder="Select Projects"
                labelTxt={`${bugTitle} Projects`}
                required={true}
                parentClass="flex flex-column"
              />
            </div>
            <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12">
              <AvoDropdown
                dropdownValue={issueDropDown}
                onDropdownChange={async (e) => {
                  setIssueDropDown(e.target.value);
                }}
                dropdownOptions={jiraDetails?.issuetype}
                name="issuetype"
                placeholder="Select Issue Type"
                labelTxt="Issue Type"
                required={true}
                parentClass="flex flex-column"
              />
            </div>
            <div className="col-12 lg:col-4 xl:col-4 md:col-4 sm:col-12 flex align-items-center">
              <AvoMultiselect
                multiSelectValue={configureFeilds}
                onMultiSelectChange={(e) => setConfigureFeilds(e.value)}
                multiSelectOptions={selectedFiels}
                name="configureFeilds"
                placeholder="Configure Fields"
                required={false}
              />
            </div>
            <Divider />
            {configureFeilds.map((el) => (
              <div className="col-12">
                <div>
                  <label>
                    <span>{el.name}</span>
                    {
                     el.disabled && <img
                        src="static/imgs/Required.svg"
                        className="required_icon"
                      />
                    }
                  </label>
                </div>
                <InputTextarea
                  className="text_desc"
                  rows={1}
                  name={el.name}
                  value={configValues[el.name]}
                  onChange={(e) => handleConfigValues(e)}
                />
              </div>
            ))}
          </div>
        }
        customClass="jira_modal"
        headerTxt="Create Issue"
        modalSytle={{
          width: "60vw",
          background: "#FFFFFF",
        }}
        footerType="Proceed"
      />
    </div>
  );
}

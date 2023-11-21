import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import HSBar from "react-horizontal-stacked-bar-chart";
import { Column } from "primereact/column";
import { NavLink } from 'react-router-dom';
import AvoInput from "../../../globalComponents/AvoInput";
import "./Profile.scss";
import { Badge } from "primereact/badge";
import { Tree } from "primereact/tree";
import { reportsBar } from "../../utility/mockData";
import { useLocation } from "react-router-dom";
import { downloadReports, fetchScenarioInfo, getAccessibilityData, getReportList, getReportListSuites, getScreenData, getTestSuite } from "../api";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Menu } from "primereact/menu";
import { FooterTwo } from "../../global";

const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const [testSuite, setTestSuite] = useState({});
  const [accessibilityValues, setAccessibilityValues] = useState({});
  const [reportsTable, setReportsTable] = useState([]);
  const [toggleBtn, setToggleBtn] = useState(true);
  const [downloadId, setDownloadId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [selectedExe, setSelectedExe] = useState(0);
  const location = useLocation();
  const downloadRef = useRef(null);

  const checkStatus = (statusArr) => {
    let statusVal;
    if(statusArr.includes('Fail')) statusVal = "Fail";
    else if(statusArr.includes('Inprogress')) statusVal = "In progress";
    else if(statusArr.includes('Queued')) statusVal = "Queued";
    else statusVal = "Completed"
    return statusVal;
  };

  const tableColumns = [
    { field: "name", header: "Execution" },
    { field: "status", header: "" },
    { field: "dateTime", header: "Date and Time" },
    { field: "module", header: <div><span className="suite_text">Test Suite(s)</span><span className="case_text">Test Case(s)</span></div> }
  ];

  const tableColumnsAccess = [
    { field: "name", header: "Title" },
    { field: "dateTime", header: "Date and Time" },
    { field: "icon", header: "" },
    { field: "statusAccess", header: ""  }
  ];

  useEffect(() => {
    (async () => {
      let executionProfiles;
      if(location?.state?.viewBy === "Execution Profile"){
        executionProfiles = await getReportList(location?.state?.configureKey)
      } else if(location?.state?.viewBy === "Test Suites"){
        executionProfiles = await getReportListSuites(location?.state?.configureKey);
      } else if(location?.state?.viewBy === "Accessibility"){
        executionProfiles = await getScreenData(location?.state?.screen);
      };

      // let sortExecutions= [...executionProfiles].reverse();
      if (location?.state?.viewBy === "Execution Profile") {
        setReportsTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Execution ${ind + 1}`,
            dateTime: el.startDate,
            status: checkStatus(el.modStatus),
            testSuites: el.modStatus.reduce(
              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
              {}
            ),
            testCases: el.scestatus.reduce(
              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
              {}
            ),
          }))
        );
      } else if(location?.state?.viewBy === "Test Suites") {
        setReportsTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Execution ${ind + 1}`,
            dateTime: el?.starttime,
            status: checkStatus(el.modstatus),
            testSuites: el.modstatus.reduce(
              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
              {}
            ),
            testCases: el.scestatus.reduce(
              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
              {}
            ),
          }))
        );
      } else if(location?.state?.viewBy === "Accessibility") {
        setReportsTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el?._id,
            key: ind.toString(),
            name: el?.title,
            dateTime: el?.executedtime,
          }))
        );
      }
    })();
  }, [location]);

  const onTestSuiteClick = async (getRow) => {
    setSelectedExe(getRow?.node?.key);
    let testSuiteList =
      location?.state?.viewBy === "Execution Profile"
        ? await getTestSuite({
            query: "fetchModSceDetails",
            param: "modulestatus",
            executionListId: getRow?.node?.data,
          })
        : await fetchScenarioInfo(getRow?.node?.data);

    const nestedTable =
      location?.state?.viewBy === "Execution Profile"
        ? testSuiteList.map((el, i) => {
            let nestedtreeArr = {
              key: i.toString(),
              label: (
                <div>
                  <Badge
                    className="badge_icon"
                    value={`${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) =>
                            item === "Terminate" ||
                            item === "Skipped" ||
                            item === "Incomplete"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    } / ${Object.values(
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )
                    ).reduce((ac, cv) => ac + cv, 0)}`}
                    severity="info"
                  ></Badge>
                  <span className="badge_txt">Executed</span>
                  <Badge
                    className="badge_icon"
                    value={`${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) =>
                            item === "Terminate" ||
                            item === "Skipped" ||
                            item === "Incomplete" ||
                            item === "fail" ||
                            item === "Fail"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    } / ${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) => item === "Skipped" || item === "Incomplete"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    }`}
                    severity="success"
                  ></Badge>
                  <span className="badge_txt">Passed</span>
                  <Badge
                    className="badge_icon"
                    value={`${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) =>
                            item === "Terminate" ||
                            item === "Skipped" ||
                            item === "Incomplete" ||
                            item === "pass" ||
                            item === "Pass"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    } / ${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) => item === "Skipped" || item === "Incomplete"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    }`}
                    severity="danger"
                  ></Badge>
                  <span className="badge_txt">Failed</span>
                  <Badge
                    className="badge_icon"
                    value={`${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) =>
                            item === "Skipped" ||
                            item === "Incomplete" ||
                            item === "fail" ||
                            item === "Fail" ||
                            item === "pass" ||
                            item === "Pass"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    } / ${
                      Object.values(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      ).reduce((ac, cv) => ac + cv, 0) -
                      Object.keys(
                        el.scenarioStatus.reduce(
                          (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                          {}
                        )
                      )
                        .filter(
                          (item) => item === "Skipped" || item === "Incomplete"
                        )
                        .map(
                          (e) =>
                            el.scenarioStatus.reduce(
                              (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                              {}
                            )[e]
                        )
                        .reduce((ac, cv) => ac + cv, 0)
                    }`}
                    severity="warning"
                  ></Badge>
                  <span className="badge_txt">Terminated</span>
                </div>
              ),
              data: el.id,
              icon: "pi pi-fw pi-chevron-right",
            };
            return {
              key: i,
              testSuite: el?.modulename,
              testSuiteBar: (
                <Tree value={[nestedtreeArr]} className="modules_tree" />
              ),
              id: el?._id,
            };
          })
        : [
            {
              key: 0,
              testSuite: location?.state?.execution,
              testSuiteBar: (
                <DataTable
                  showHeaders={false}
                  className="statusTable"
                  value={testSuiteList.map((item, i) => ({
                    scenarioname: item?.testscenarioname,
                    status: item?.status,
                    downLoad: (
                      <i
                        className="pi pi-download"
                        onClick={(e) => {
                          setDownloadId(item?.reportid);
                          downloadRef.current.toggle(e);
                        }}
                      ></i>
                    ),
                    statusView: (
                      <Button
                        label="View"
                        severity="secondary"
                        size="small"
                        outlined
                        className="view_button"
                        onClick={() => handleViweReports(item.reportid)}
                      />
                    ),
                  }))}
                >
                  <Column field="scenarioname"></Column>
                  <Column field="status"></Column>
                  <Column field="statusView"></Column>
                  <Column field="downLoad"></Column>
                </DataTable>
              ),
            },
          ];

    setTestSuite({
      ...testSuite,
      [getRow?.node?.key]: [
        {
          key: "0-0",
          label:
            location?.state?.viewBy === "Execution Profile" ? (
              <DataTable
                showHeaders={false}
                value={nestedTable}
                onRowClick={(e) => onTestCaseClick(e, getRow)}
                className="module_table"
              >
                <Column field="testSuite"></Column>
                <Column field="testSuiteBar"></Column>
              </DataTable>
            ) : (
              <DataTable
                showHeaders={false}
                value={nestedTable}
                className="module_table"
              >
                <Column field="testSuite"></Column>
                <Column field="testSuiteBar"></Column>
              </DataTable>
            ),
        },
      ],
    });
  };
 const handleViweReports = async (reportid) =>{
    setSelectedExe((prev) => {
      const win = window.open(`/viewReports?reportID=${reportid}&execution=${Number(prev) + 1}`, "_blank"); 
      win.focus();
      return prev;
    })
  }

  const handleAccessibilityReports = (accessibilityId, getRuleMap) => {
    window.open(`/viewReports?accessibilityID=${accessibilityId}&rulemap=${getRuleMap}`, "_blank"); 
  }
 
  const onTestCaseClick = async (row, parentRow) => {

    const testCaseList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "modulestatus",
      executionListId: parentRow?.node?.data,
    });

    const testsList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "scenarioStatus",
      executionId: row?.data?.id,
    });

    const nestedTable = testCaseList.map((el, i) => {
      let nestedtreeArr = {
        key: i.toString(),
        label: (
          <div>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete"
                  )
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${Object.values(
                el.scenarioStatus.reduce(
                  (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                  {}
                )
              ).reduce((ac, cv) => ac + cv, 0)}`}
              severity="info"
            ></Badge>
            <span className="badge_txt">Executed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "fail" ||
                      item === "Fail"
                  )
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter((item) => item === "Skipped" || item === "Incomplete")
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              }`}
              severity="success"
            ></Badge>
            <span className="badge_txt">Passed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "pass" ||
                      item === "Pass"
                  )
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter((item) => item === "Skipped" || item === "Incomplete")
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              }`}
              severity="danger"
            ></Badge>
            <span className="badge_txt">Failed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter(
                    (item) =>
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "fail" ||
                      item === "Fail" ||
                      item === "pass" ||
                      item === "Pass"
                  )
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                ).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter((item) => item === "Skipped" || item === "Incomplete")
                  .map(
                    (e) =>
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[e]
                  )
                  .reduce((ac, cv) => ac + cv, 0)
              }`}
              severity="warning"
            ></Badge>
            <span className="badge_txt">Terminated</span>
            {row?.index === i ? (
              <DataTable
                showHeaders={false}
                className="statusTable"
                value={testsList.map((item) => ({
                  ...item,
                  downLoad: (
                    <i
                      className="pi pi-download"
                      onClick={(e) => {
                        setDownloadId(item?._id);
                        downloadRef.current.toggle(e);
                      }}
                    ></i>
                  ),
                  statusView: (
                    <Button
                      label="View"
                      severity="secondary"
                      size="small"
                      outlined
                      className="view_button"
                      onClick={() => handleViweReports(item._id)}
                    />
                  ),
                }))}
              >
                <Column field="scenarioname"></Column>
                <Column field="status"></Column>
                <Column field="statusView"></Column>
                <Column field="downLoad"></Column>
              </DataTable>
            ) : null}
          </div>
        ),
        data: el.id,
        icon:
          row?.index === i
            ? "pi pi-fw pi-chevron-down"
            : "pi pi-fw pi-chevron-right",
      };
      return {
        key: i,
        testSuite: el?.modulename,
        testSuiteBar: (
          <Tree
            value={[nestedtreeArr]}
            className="modules_tree"
          />
        ),
        id: el?._id,
      };
    });

    setTestSuite({
      ...testSuite,
      [parentRow?.node?.key]: [
        {
          key: "0-0",
          label: (
            <DataTable
              showHeaders={false}
              value={nestedTable}
              onRowClick={(e) => onTestCaseClick(e, parentRow)}
              className="nested_table"
            >
              <Column field="testSuite"></Column>
              <Column field="testSuiteBar"></Column>
            </DataTable>
          ),
        },
      ],
    });
  };

  const tableHeader = () => {
    return (
      <div className="flex flex-column">
        <div className="flex justify-content-between align-items-center">
          <div>
            <NavLink to="/reports" className="pi pi-angle-left"></NavLink>
            Execution List : {location?.state?.execution}
          </div>
          <div className="search_container">
            <AvoInput
              icon="pi pi-search"
              placeholder="Search"
              inputTxt={searchScenario}
              setInputTxt={setSearchScenario}
              inputType="searchIcon"
            />
          </div>
        </div>
      </div>
    );
  };

  const statusBodyTemplate = (rowData) => {
    let statusSeverity = {
      Queued: "info",
      Completed: "success",
      ["In Progress"]: "warning",
      Fail: "danger",
    };
    return (
      <Badge
        value={rowData?.status}
        severity={statusSeverity[rowData?.status]}
      ></Badge>
    );
  };

  const handleOnAccessibility = async(getRow) => {
    setAccessKey(getRow?._id);
    let accessibilityData = await getAccessibilityData(getRow?._id);
    let getState = { ...accessibilityValues };
    reportsTable.forEach((el) => {
      if (el.key === getRow?.key) {
        getState[getRow?.key] = accessibilityData[0];
      }
    });
    setAccessibilityValues(getState);
  }

  const moduleBodyTemplate = (e) => {
    let treeArr = {
      key: e.key,
      label: (
        <div className="flex">
          <div className="flex testSuite_col1">
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testSuites)
                  .filter(
                    (item) =>
                      item === "Queued" ||
                      item === "Inprogress" ||
                      item === "inprogress"
                  )
                  .map((el) => e.testSuites[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${Object.values(e.testSuites).reduce(
                (ac, cv) => ac + cv,
                0
              )}`}
              severity="info"
            ></Badge>
            <span className="badge_txt">Executed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testSuites)
                  .filter(
                    (item) =>
                      item === "Queued" ||
                      item === "Inprogress" ||
                      item === "inprogress" ||
                      item === "fail" ||
                      item === "Fail" ||
                      item === "Terminate"
                  )
                  .map((el) => e.testSuites[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) }`}
              severity="success"
            ></Badge>
            <span className="badge_txt">Passed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testSuites)
                  .filter(
                    (item) =>
                      item === "Queued" ||
                      item === "Inprogress" ||
                      item === "inprogress" ||
                      item === "pass" ||
                      item === "Pass" ||
                      item === "Terminate"
                  )
                  .map((el) => e.testSuites[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) }`}
              severity="danger"
            ></Badge>
            <span className="badge_txt">Failed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testSuites)
                  .filter(
                    (item) =>
                      item === "Queued" ||
                      item === "Inprogress" ||
                      item === "inprogress" ||
                      item === "fail" ||
                      item === "Fail" ||
                      item === "pass" ||
                      item === "Pass"
                  )
                  .map((el) => e.testSuites[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0)}`}
              severity="warning"
            ></Badge>
            <span className="badge_txt">Terminated</span>
          </div>
          <div className="flex testSuite_col2">
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testCases)
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete"
                  )
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0)}`}
              severity="info"
            ></Badge>
            <span className="badge_txt">Executed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testCases)
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "fail" ||
                      item === "Fail"
                  )
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0)}`}
              severity="success"
            ></Badge>
            <span className="badge_txt">Passed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testCases)
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "pass" ||
                      item === "Pass"
                  )
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) }`}
              severity="danger"
            ></Badge>
            <span className="badge_txt">Failed</span>
            <Badge
              className="badge_icon"
              value={`${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                Object.keys(e.testCases)
                  .filter(
                    (item) =>
                      item === "Skipped" ||
                      item === "Incomplete" ||
                      item === "pass" ||
                      item === "Pass" ||
                      item === "fail" ||
                      item === "Fail"
                  )
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0)
              } / ${
                Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) }`}
              severity="warning"
            ></Badge>
            <span className="badge_txt">Terminated</span>
          </div>
        </div>
      ),
      data: e.id,
      children: testSuite[e.key] ? testSuite[e.key] : [{ key: "0-0" }],
    };
    return (
      <Tree
        value={[treeArr]}
        onExpand={(e) => onTestSuiteClick(e)}
        className="modules_tree"
      />
    );
  };

  const iconBodyTemplate = (event) => {
    return <span className="pi pi-angle-right" onClick={() => handleOnAccessibility(event)}></span>
  }

  const statusAccessBodyTemplate = (event) => {
    let tableData = [];
    if(accessibilityValues[event?.key]){
      tableData = accessibilityValues[event?.key]['access-rules']
    };
    return accessibilityValues[event?.key] ? (
      <div className="flex flex-column access_rules">
        <div className="flex access_rules_status">
          <div className="flex">
            <Badge
              className="badge_icon"
              value={`${accessibilityValues[event?.key]["access-rules"].filter((el) => el?.pass).length} / ${accessibilityValues[event?.key]["access-rules"].length}`}
              severity="success"
            ></Badge>
            <span className="badge_txt">Passed</span>
          </div>
          <div className="flex">
            <Badge
              className="badge_icon"
              value={`${accessibilityValues[event?.key]["access-rules"].filter((el) => !el?.pass).length} / ${accessibilityValues[event?.key]["access-rules"].length}`}
              severity="danger"
            ></Badge>
            <span className="badge_txt">Failed</span>
          </div>
        </div>
        <DataTable
          showHeaders={false}
          className="statusTable"
          value={tableData.map((item, i) => ({
            scenarioname: item?.name,
            status: item?.pass ? "Pass" : "Fail",
            statusView: (
              <Button
                label="View"
                severity="secondary"
                size="small"
                outlined
                className="view_button"
                onClick={() =>
                  handleAccessibilityReports(accessKey, item?.name)
                }
              />
            ),
          }))}
        >
          <Column field="scenarioname"></Column>
          <Column field="status"></Column>
          <Column field="statusView"></Column>
        </DataTable>
      </div>
    ) : null;
  };

  const onDownload = async (getId,SS) => {
    let data = await downloadReports({ id: downloadId, type: getId }, SS);
    
    // if (getId === "json") data = JSON.stringify(data, undefined, 2);

    let filedata = new Blob([data], {
      type: "application/" + getId + ";charset=utf-8",
    });

    if (window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(filedata, downloadId);
    else {
      let a = document.createElement("a");
      a.href = URL.createObjectURL(filedata);
      a.download = downloadId;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <div className="profile_container">
        {location?.state?.viewBy !== "Accessibility" ? (
          <DataTable
            value={reportsTable}
            tableStyle={{ minWidth: "50rem" }}
            header={tableHeader}
            globalFilter={searchScenario}
            className="reports_table"
          >
            {tableColumns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                {...(col.field === "testCases"
                  ? { filter: true, filterPlaceholder: "Search by name" }
                  : {})}
                {...(col.field === "name" || col.field === "dateTime"
                  ? { sortable: true }
                  : {})}
                {...(col.field === "status"
                  ? { body: statusBodyTemplate }
                  : {})}
                {...(col.field === "module"
                  ? { body: moduleBodyTemplate }
                  : {})}
              />
            ))}
          </DataTable>
        ) : (
          <DataTable
            value={reportsTable}
            tableStyle={{ minWidth: "50rem" }}
            header={tableHeader}
            globalFilter={searchScenario}
            className="accessibility_table"
          >
            {tableColumnsAccess.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                {...(col.field === "icon" ? { body: iconBodyTemplate } : {})}
                {...(col.field === "statusAccess" ? { body: statusAccessBodyTemplate } : {})}
              />
            ))}
          </DataTable>
        )}
        <OverlayPanel ref={downloadRef} className="reports_download">
          <div
            className="flex downloadItem"
            onClick={() => onDownload("json", false)}
          >
            <span className="pi pi-fw pi-file"></span>
            <span>JSON</span>
          </div>
          <div
            className="flex downloadItem"
            onClick={() => onDownload("pdf", false)}
          >
            <span className="pi pi-fw pi-file"></span>
            <span>PDF</span>
          </div>
          <div
            className="flex downloadItem"
            onClick={() => onDownload("pdf", true)}
          >
            <span className="pi pi-fw pi-file"></span>
            <span>PDF with screenshots</span>
          </div>
        </OverlayPanel>
      </div>
      <div>
        <FooterTwo />
      </div>
    </>
  );
};

export default Profile;

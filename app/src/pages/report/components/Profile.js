import { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import HSBar from "react-horizontal-stacked-bar-chart";
import { Column } from "primereact/column";
import { NavLink } from 'react-router-dom';
import AvoInput from "../../../globalComponents/AvoInput";
import "./Profile.scss";
import { Badge } from "primereact/badge";
import { Tree } from "primereact/tree";
import { reportsBar, reportsData } from "../../utility/mockData";
import { useLocation } from "react-router-dom";
import { downloadReports, fetchScenarioInfo, getAccessibilityData, getReportList, getReportListSuites, getScreenData, getTestSuite } from "../api";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Menu } from "primereact/menu";
import { FooterTwo } from "../../global";
import { Divider } from "primereact/divider";
import { Dialog } from 'primereact/dialog';
import { RadioButton } from "primereact/radiobutton";
import { Tooltip } from 'primereact/tooltip';
import moment from "moment";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";
import { reportsDateFormat, addReportEllapsedTimes } from "../../design/components/UtilFunctions";


const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const [testSuite, setTestSuite] = useState({});
  const [accessibilityValues, setAccessibilityValues] = useState({});
  const [reportsTable, setReportsTable] = useState([]);
  const [reportsDataTable, setReportsDataTable] = useState([]);
  const [toggleBtn, setToggleBtn] = useState(true);
  const [downloadId, setDownloadId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [selectedExe, setSelectedExe] = useState(0);
  const location = useLocation();
  const downloadRef = useRef(null);
  const [scenarioName, setScenarioName] = useState("");
  const [visibleDownloadPopup, setVisibleDownloadPopup] = useState(false);
  const [exportLevel, setExportLevel] = useState("summary");
  const [fileType, setFileType] = useState("pdf");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadLevel, setDownloadLevel] = useState("row");
  const [executionListId, setExecutionListId] = useState("");
  const toast = useRef(null);
  const [testSuiteName, setTestSuiteName] = useState("");
  const [exeProfileLength, setExeprofileLength] = useState(0);

  const checkStatus = (statusArr) => {
    let statusVal;
    if(statusArr.includes('Fail')) statusVal = "Fail";
    else if(statusArr.includes('Inprogress')) statusVal = "In progress";
    else if(statusArr.includes('Queued')) statusVal = "Queued";
    else statusVal = "Completed"
    return statusVal;
  };

  const tableColumns = [
    { field: "name", header: "Run Details" },
    { field: "dateTime", header: "Date and Time" },
    { field: "status", header: "Status" },
    { field: "module", header: <div><span className="suite_text">Test Suite(s)</span><span className="case_text">Test Case(s)</span></div> },
    { field: "action", header: "Action" }
  ];

  const tableColumnsAccess = [
    { field: "name", header: "Title" },
    { field: "dateTime", header: "Date and Time" },
    { field: "icon", header: "" },
    { field: "statusAccess", header: ""  }
  ];

  function handleSearch(event) {
    const inputValue = event.target.value;
    console.log(reportsTable);
    setSearchScenario(inputValue);
    if (inputValue) { 
      {const filterData = reportsDataTable.filter((item) =>item?.name?.props?.children[1]===inputValue)
      setReportsDataTable(filterData)
      }
    } else {
      setReportsDataTable(reportsTable);
    }
  }

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
      setExeprofileLength(executionProfiles?.length)
      // let sortExecutions= [...executionProfiles].reverse();
      if (location?.state?.viewBy === "Execution Profile") {
        setReportsTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Run No: ${executionProfiles.length - (ind)}`,
            dateTime: moment(el?.startDate).utcOffset("+05:30").format("DD MMM YYYY hh:mm A"),
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
        setReportsDataTable((
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Run No: ${executionProfiles.length - (ind)}`,
            dateTime: moment(el?.startDate).utcOffset("+05:30").format("DD MMM YYYY hh:mm A"),
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
        ));
      } else if(location?.state?.viewBy === "Test Suites") {
        setReportsTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Run No: ${executionProfiles.length - (ind)}`,
            dateTime: moment(el?.startDate).utcOffset("+05:30").format("DD MMM YYYY hh:mm A"),
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
        setReportsDataTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el._id,
            key: ind.toString(),
            name: `Run No: ${executionProfiles.length - (ind)}`,
            dateTime: moment(el?.startDate).utcOffset("+05:30").format("DD MMM YYYY hh:mm A"),
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
            dateTime: <span className="rundatetime">{moment(el?.executedtime).utcOffset("+05:30").format("DD MMM YYYY hh:mm A")}</span>,
          }))
        );
        setReportsDataTable(
          executionProfiles.map((el, ind) => ({
            ...el,
            id: el?._id,
            key: ind.toString(),
            name: el?.title,
            dateTime: <span className="rundatetime">{moment(el?.executedtime).utcOffset("+05:30").format("DD MMM YYYY hh:mm A")}</span>,
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
                  <div className="flex flex-row align-items-center">
                    <div className="flex flex-row exestatusbar_container pr-2">
                      <div className="exestrips flex flex-row justify-content-center align-items-center exeexebg">{
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
                      }</div>
                      <div className="exestrips flex flex-row justify-content-center align-items-center exepassbg">{
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
                      }</div>
                      <div className="exestrips flex flex-row justify-content-center align-items-center exefailbg">{
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
                      }</div>
                      <div className="exestrips flex flex-row justify-content-center align-items-center exeterminatebg">
                        {
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
                        }
                      </div>
                    </div>
                    <div className="flex flex-column pl-2">
                      <div className="flex align-items-start mb-1">
                        <span className="exeHeader">Elapsed Time : </span>
                        <span className="exeSubHeader">{el?.ellapsedTime?.length ? addReportEllapsedTimes(el?.ellapsedTime) : "NA"}</span>
                      </div>
                      <div className="flex align-items-start">
                        <span className="exeHeader">Total Test Cases : </span>
                        <span className="exeSubHeader">{Object.values(
                          el.scenarioStatus.reduce(
                            (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                            {}
                          )
                        ).reduce((ac, cv) => ac + cv, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ),
              data: el.id,
              icon: "pi pi-fw pi-chevron-right",
            };
            return {
              key: i,
              testSuite: testSuiteTemplate(el),
              testSuiteBar: (
                <Tree value={[nestedtreeArr]} showGridlines className="modules_tree" />
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
                    extras: singleTestCaseTemplate(item)
                  }))}
                >
                  <Column field="scenarioname"></Column>
                  <Column field="extras"></Column>
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
      const win = window.open(`/viewReports?reportID=${reportid}&execution=${Number(prev) + 1}&exportLevel=${exportLevel}&downloadLevel=testCase&viewReport=true`, "_blank"); 
      win.focus();
      return prev;
    })
  }

  const handleAccessibilityReports = (accessibilityId, getRuleMap) => {
    window.open(`/viewReports?accessibilityID=${accessibilityId}&rulemap=${getRuleMap}`, "_blank"); 
  }

  const singleTestCaseTemplate = (item) => {
    const filterData = exeStatusList?.filter(exe => exe.name == item?.status);
    const tcData = filterData.length ? filterData[0] : {};
    return <div className="flex flex-row justify-content-between align-items-center">
      <Tooltip target=".report_view" content="View Reports" position="bottom" />
      <div className="flex ml-3 justify-content-center align-items-center">
        <div className={`mr-1 exestatus_icon ${tcData?.bgColor}`}></div>
        <div className={`${tcData?.color}`}>{item?.status}</div>
      </div>
      <div className="report_view" style={{ width: "auto", minWidth: "40px", cursor: "pointer" }} onClick={() => handleViweReports(item?._id ? item?._id : item?.reportid)}>
        <img src="static/imgs/report_view.svg" alt="reports_view_image" className="w-full" />
      </div>
      <div style={{ width: "auto", minWidth: "20px", cursor: "pointer" }} onClick={(e) => {
        setDownloadId(item?._id ? item?._id : item?.reportid);
        setScenarioName(item?.scenarioname ? item?.scenarioname : item?.testscenarioname)
        setDownloadLevel("testCase")
        downloadRef.current.toggle(e);
      }}>
        <img src="static/imgs/report_download.svg" />
      </div>
    </div>
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
            <div className="flex flex-row align-items-center">
              <div className="flex flex-row exestatusbar_container pr-2">
                <div className="exestrips flex flex-row justify-content-center align-items-center exeexebg">{
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
                }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exepassbg">{
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
                }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exefailbg">{
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
                }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exeterminatebg">{
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
                }</div>
              </div>
              <div className="flex flex-column pl-2">
                <div className="flex align-items-start mb-1">
                  <span className="exeHeader">Elapsed Time : </span>
                  <span className="exeSubHeader">{el?.ellapsedTime?.length ? addReportEllapsedTimes(el?.ellapsedTime) : "NA"}</span>
                </div>
                <div className="flex align-items-start">
                  <span className="exeHeader">Total Test Cases : </span>
                  <span className="exeSubHeader">{
                    Object.values(
                      el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )
                    ).reduce((ac, cv) => ac + cv, 0)}</span>
                </div>
              </div>
            </div>
            {row?.index === i ? (
              <DataTable
                showHeaders={false}
                className="statusTable"
                value={testsList.map((item) => ({
                  ...item,
                  extras: singleTestCaseTemplate(item)
                }))}
              >
                <Column field="scenarioname"></Column>
                <Column field="extras"></Column>
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
        testSuite: testSuiteTemplate(el),
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

  const exeStatusList = [
    {
      name: "Execute",
      status: "Executed",
      bgColor: "exeexebg",
      color: "exeexecolor"
    },
    {
      name: "Pass",
      status: "Passed",
      bgColor: "exepassbg",
      color: "exepasscolor"
    },
    {
      name: "Fail",
      status: "Failed",
      bgColor: "exefailbg",
      color: "exefailcolor"
    },
    {
      name: "Terminate",
      status: "Terminated",
      bgColor: "exeterminatebg",
      color: "exeterminatecolor"
    }
  ]
  const tableHeader = () => {
    return (
      // <div className="flex flex-column">
      <div className="flex justify-content-between align-items-center">
        <div>
          <NavLink to="/reports" className="pi pi-angle-left"></NavLink>
          <span className="exelist_title">Execution List : {location?.state?.execution}</span>
        </div>
        <div className="flex flex-row exestatus_container">
          {
            exeStatusList?.map(({status,bgColor, color})=>{
              return <div className="flex ml-3 justify-content-center align-items-center">
                <div className={`mr-1 exestatus_icon ${bgColor}`}></div>
                <div className={`${color}`}>{status}</div>
              </div>
            })
          }
        </div>
          {/* Search Bar Commented */}
          {/* <div className="search_container">
            <InputNumber
              icon="pi pi-search"
              placeholder="Search With Execution Number"
              value={searchScenario}
              onValueChange={handleSearch}
              useGrouping={false}
              style={{width:'16rem'}}
            />
          </div> */}
      </div>
      // </div>
    );
  };
  const nameBodyTemplate = (rowData) => {
    return <span className="runtitle">{rowData?.name}</span>
  }
  const dateBodyTemplate = (rowData) => {
    return <span className="rundatetime">{rowData?.dateTime}</span>
  }

  const statusBodyTemplate = (rowData) => {
    let statusSeverity = {
      Queued: "info",
      Completed: "success",
      ["In Progress"]: "warning",
      Fail: "danger",
    };
    return (
      <div className="statusBadge">
      <Badge
        value={rowData?.status}
        severity={statusSeverity[rowData?.status]}
      ></Badge></div>
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
        <div className="flex flex-row">
          <div className="flex">
            <div className="flex testSuite_col1">
              <div className="flex flex-row justify-content-center align-items-center">
                <div className="flex flex-row exestatusbar_container pr-2">
                  <div className="exestrips flex flex-row justify-content-center align-items-center exeexebg">{Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                    Object.keys(e.testSuites)
                      .filter(
                        (item) =>
                          item === "Queued" ||
                          item === "Inprogress" ||
                          item === "inprogress"
                      )
                      .map((el) => e.testSuites[el])
                      .reduce((ac, cv) => ac + cv, 0)
                  }</div>
                  <div className="exestrips flex flex-row justify-content-center align-items-center exepassbg">{Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
                  <div className="exestrips flex flex-row justify-content-center align-items-center exefailbg">{Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
                  <div className="exestrips flex flex-row justify-content-center align-items-center exeterminatebg">{Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
                </div>
                <div className="flex flex-column pl-2">
                  <div className="flex align-items-start mb-1">
                    <span className="exeHeader">Elapsed Time : </span>
                    <span className="exeSubHeader">{addReportEllapsedTimes(e?.ellapsedTime)}</span>
                  </div>
                  <div className="flex align-items-start">
                    <span className="exeHeader">Total Test Suites : </span>
                    <span className="exeSubHeader">{Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex testSuite_col2">
              <div className="flex flex-row exestatusbar_container pr-2">
                <div className="exestrips flex flex-row justify-content-center align-items-center exeexebg">{Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                  Object.keys(e.testCases)
                    .filter(
                      (item) =>
                        item === "Terminate" ||
                        item === "Skipped" ||
                        item === "Incomplete"
                    )
                    .map((el) => e.testCases[el])
                    .reduce((ac, cv) => ac + cv, 0)
                  }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exepassbg">{Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exefailbg">{Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
                <div className="exestrips flex flex-row justify-content-center align-items-center exeterminatebg">{Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
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
                  }</div>
              </div>
              <div className="flex flex-column pl-2">
                <div className="flex align-items-start mb-1">
                  <span className="exeHeader">Elapsed Time : </span>
                  <span className="exeSubHeader">{addReportEllapsedTimes(e?.ellapsedTime)}</span>
                </div>
                <div className="flex align-items-start">
                  <span className="exeHeader">Total Test Cases : </span>
                  <span className="exeSubHeader">{Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0)}</span>
                </div>
              </div>
            </div>
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
        showGridlines
        resizableColumns
        outlined
      />
    );
  };

  const iconBodyTemplate = (event) => {
    return <span className="pi pi-angle-right" onClick={() => handleOnAccessibility(event)}></span>
  }

  const testSuiteTemplate = (e) => {
    return <div className="flex justify-content-between">
      <div>{e?.modulename}</div>
      {/* Commented for time being */}
      {/* <div>
        <i
          className="pi pi-download"
          onClick={(e) => {
            setDownloadId(e?.reportid);
            // getExportLevelOptions("testSuiteLevel")
            setVisibleDownloadPopup(true);
            setExportLevel("summary");
            setFileType("pdf");
            setDownloadLevel("testSuite")
            
          }}
        ></i>
      </div> */}
    </div>
  }

  const actionsTemplate = (e) => {
    return <div className="actions_container">
      <div style={{ width: "auto", minWidth: "20px", cursor:"pointer" }} onClick={(event) => {
        setVisibleDownloadPopup(true);
        setExportLevel("executiveSummary");
        setFileType("pdf");
        setDownloadLevel("row");
        setExecutionListId(e?.executionListId ? e?.executionListId : e?._id);
        setTestSuiteName(`run_number_${exeProfileLength - Number((e?.key))}`)
      }}>
        <img className="w-full" src="static/imgs/report_download.svg"/>
      </div>
    </div>
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
    let data = await downloadReports({ id: downloadId, type: getId, exportLevel: exportLevel, downloadLevel: downloadLevel, executionListId: executionListId }, SS);
    
    // if (getId === "json") data = JSON.stringify(data, undefined, 2);

    let filedata = new Blob([data], {
      type: "application/" + getId + ";charset=utf-8",
    });

    if (window.navigator.msSaveOrOpenBlob)
      window.navigator.msSaveOrOpenBlob(filedata, downloadId);
    else {
      let a = document.createElement("a");
      a.href = URL.createObjectURL(filedata);
      // setting download fileName
      if(downloadLevel == "testCase"){
        a.download = SS ? `${scenarioName}_screenshots` : scenarioName;
      }else{
        a.download = `${testSuiteName}_${exportLevel}`;
      }
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }
  };

  const onDownloadClick = () => {
    setDownloadLoading(true)
    onDownload(fileType, false)
    setTimeout(() => {
      setDownloadLoading(false);
      toast.current.show({ severity: 'success', summary: 'Success', detail: 'Data Saved' });
      setVisibleDownloadPopup(false)
    }, 2000);

  }

  const OpenPdfPopup = () => {
    return <>
      <Dialog
        visible={visibleDownloadPopup}
        modal
        header={<h4>Download</h4>}
        footer={<><Toast ref={toast}></Toast><Button
          label="Download"
          icon="pi"
          onClick={onDownloadClick}
          autoFocus
          loading={downloadLoading}
        /></>}
        style={{ width: '30rem' }}
        onHide={() => setVisibleDownloadPopup(false)}
        className="download_popup_container"
        draggable={false}
      >        
        <div className="flex flex-column m-3">
          <div className="flex flex-row mb-3">
            <div className="w-3 font-bold">Export Level:</div>
            <div className="flex flex-column flex-wrap gap-3 w-9 pl-2">
              {downloadLevel == "row" && <div className="flex align-items-center">
                <RadioButton inputId="exportLevelZero" name="Executive Summary" value="executiveSummary" onChange={(e) => setExportLevel(e?.value)} checked={exportLevel === "executiveSummary"} />
                <label htmlFor="exportLevelZero" className="ml-2">Executive Summary</label>
              </div>}
              <div className="flex align-items-center">
                <RadioButton inputId="exportLevelOne" name="summary" value="summary" onChange={(e) => setExportLevel(e?.value)} checked={exportLevel === "summary"} />
                <label htmlFor="exportLevelOne" className="ml-2">Summary</label>
              </div>
              <div className="flex align-items-center">
                <RadioButton inputId="exportLevelTwo" name="detailed" value="detailed" onChange={(e) => setExportLevel(e?.value)} checked={exportLevel === "detailed"} />
                <label htmlFor="exportLevelTwo" className="ml-2">Detailed</label>
              </div>
            </div>
          </div>
          <div className="flex flex-row mb-3">
            <div className="w-3 font-bold">File Type:</div>
            <div className="flex flex-column flex-wrap gap-3 w-9 pl-2">
              <div className="flex align-items-center">
                <RadioButton inputId="ingredient1" name="pdf" value="pdf" onChange={(e) => { setFileType(e?.value) }} checked={fileType === "pdf"} />
                <label htmlFor="ingredient1" className="ml-2">Export PDF</label>
              </div>
              {/* {exportLevel == "detailed" && <div className="flex align-items-center">
                <RadioButton inputId="ingredient1" name="pdfss" value="pdfss" onChange={(e) => { setFileType(e?.value) }} checked={fileType === "pdfss"} />
                <label htmlFor="ingredient1" className="ml-2">Export PDF with Screenshots</label>
              </div>} */}
              {exportLevel == "detailed" && <div className="flex align-items-center">
                <RadioButton inputId="ingredient1" name="json" value="json" onChange={(e) => { setFileType(e?.value) }} checked={fileType === "json"} />
                <label htmlFor="ingredient1" className="ml-2">Export JSON</label>
              </div>}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  }

  return (
    <>
      <div className="profile_container">
        {location?.state?.viewBy !== "Accessibility" ? (
          <DataTable
            value={reportsDataTable}
            // tableStyle={{ minWidth: "50rem" }}
            header={tableHeader}
            // globalFilter={searchScenario}
            className="reports_table"
            showGridlines
          >
            {tableColumns.map((col) => (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                {...(col.field === "testCases"
                  ? { filter: true, filterPlaceholder: "Search by name" }
                  : {})}
                {...(col.field === "name"
                  ? { sortable: true, body: nameBodyTemplate }
                  : {})}
                {...(col.field === "dateTime"
                  ? { sortable: true, body: dateBodyTemplate }
                  : {})}
                {...(col.field === "status"
                  ? { body: statusBodyTemplate }
                  : {})}
                {...(col.field === "module"
                  ? { body: moduleBodyTemplate }
                  : {})}
                {...(col.field === "action"
                  ? { body: actionsTemplate }
                  : {})}
              />
            ))}
          </DataTable>
        ) : (
          <DataTable
            value={reportsDataTable}
            tableStyle={{ minWidth: "50rem" }}
            header={tableHeader}
            // globalFilter={searchScenario}
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
            <span className="pi pi-fw pi-file-pdf"></span>
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
      {visibleDownloadPopup && OpenPdfPopup()}
    </>
  );
};

export default Profile;

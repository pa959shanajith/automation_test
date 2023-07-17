import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import HSBar from "react-horizontal-stacked-bar-chart";
import { Column } from "primereact/column";
import { Breadcrumbs, Link } from "@mui/material";
import AvoInput from "../../../globalComponents/AvoInput";
import "./Profile.scss";
import { Badge } from "primereact/badge";
import { Tree } from "primereact/tree";
import { reportsBar } from "../../utility/mockData";
import { useLocation } from "react-router-dom";
import { getReportList, getTestSuite } from "../api";
import { Button } from "primereact/button";

const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const [testSuite, setTestSuite] = useState({});
  const [testCase, setTestCase] = useState({});
  const [reportsTable, setReportsTable] = useState([]);
  const location = useLocation();

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
    { field: "module", header: "Test Suite(s)" },
    { field: "testCases", header: "Test Case(s)" },
  ];

  useEffect(async () => {
    const executionProfiles = await getReportList(
      location?.state?.configureKey
    )
    
    setReportsTable(executionProfiles.map((el, ind) => ({
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
    })));
  }, []);
  
  const onTestSuiteClick = async (getRow) => {
    const testSuiteList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "modulestatus",
      executionListId: getRow?.node?.data,
    });

    setTestSuite({
      ...testSuite,
      [getRow?.node?.key]: testSuiteList.map((item, ind) => ({
        key: `0-${ind}`,
        label: item?.modulename,
        data: item?._id,
      })),
    });

    setTestCase({
      ...testCase,
      [getRow?.node?.key]: testSuiteList.map((el, i) => ({
        key: i.toString(),
        label: (
          <div className="grid">
            <div className="col-6">
              <div>Execution Progress</div>
              <HSBar
                showTextIn
                data={[
                  {
                    value:
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
                        .reduce((ac, cv) => ac + cv, 0),
                    description: `${
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
                    ).reduce((ac, cv) => ac + cv, 0)} Executed`,
                    color: "#6a5acd",
                  },
                  {
                    value: Object.keys(
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
                      .reduce((ac, cv) => ac + cv, 0),
                    color: "#808080",
                  },
                ]}
              />
            </div>
            <div className="col-6">
              <div>Execution Status</div>
              <HSBar
                showTextIn
                data={Object.keys(
                  el.scenarioStatus.reduce(
                    (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                    {}
                  )
                )
                  .filter((el) => el === "Pass" || el === "fail")
                  .map((item, ind) => {
                    return {
                      value: el.scenarioStatus.reduce(
                        (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                        {}
                      )[item],
                      description:
                        item === "Pass"
                          ? `${
                              el.scenarioStatus.reduce(
                                (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                                {}
                              )[item]
                            } / ${Object.values(
                              Object.keys(
                                el.scenarioStatus.reduce(
                                  (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
                                  {}
                                )
                              )
                                .filter(
                                  (key) => key === "Pass" || key === "fail"
                                )
                                .reduce((obj, key) => {
                                  return Object.assign(obj, {
                                    [key]: el.scenarioStatus.reduce(
                                      (ac, cv) => (
                                        (ac[cv] = ac[cv] + 1 || 1), ac
                                      ),
                                      {}
                                    )[key],
                                  });
                                }, {})
                            ).reduce((ac, cv) => ac + cv, 0)} Passed`
                          : "",
                      color: reportsBar[item],
                    };
                  })}
              />
            </div>
          </div>
        ),
        data: { id: el._id, selected: getRow?.node?.key },
        children: [{ key: "0-0" }],
      })),
    });
  };

  const onTestCaseClick = async (row) => {
    const testSuiteList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "scenarioStatus",
      executionId: row?.node?.data?.id,
    });
    const getState = { ...testCase };
    getState[row?.node?.data?.selected][row?.node?.key].children = [
      {
        key: "0-0",
        label: (
          <div className="grid">
            {testSuiteList.map((item) => (
              <>
                <div className="col-4 flex align-items-center">{item?.scenarioname}</div>
                <div className="col-3 flex align-items-center">{item?.status}</div>
                <div className="col-3 flex align-items-center"><Button label="View" severity="secondary" size="small" outlined /></div>
                <div className="col-2 flex align-items-center"><i className="pi pi-download"></i></div>
              </>
            ))}
          </div>
        ),
      },
    ];
    setTestCase(getState);
  };

  const tableHeader = () => {
    return (
      <div className="flex flex-column">
        <div className="exeprofile_txt">{location?.state?.execution}</div>
        <div className="flex justify-content-between align-items-center">
          <div>Execution List</div>
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

  const moduleBodyTemplate = (e) => {
    let treeArr = {
      key: e.key,
      label: (
        <div className="grid">
          <div className="col-6">
            <div>Execution Progress</div>
            <HSBar
              showTextIn
              data={[
                {
                  value:
                    Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                    Object.keys(e.testSuites)
                      .filter(
                        (item) => item === "Queued" || item === "Inprogress"
                      )
                      .map((el) => e.testSuites[el])
                      .reduce((ac, cv) => ac + cv, 0),
                  description: `${
                    Object.values(e.testSuites).reduce((ac, cv) => ac + cv, 0) -
                    Object.keys(e.testSuites)
                      .filter(
                        (item) => item === "Queued" || item === "Inprogress"
                      )
                      .map((el) => e.testSuites[el])
                      .reduce((ac, cv) => ac + cv, 0)
                  } / ${Object.values(e.testSuites).reduce(
                    (ac, cv) => ac + cv,
                    0
                  )} Executed`,
                  color: "#6a5acd",
                },
                {
                  value: Object.keys(e.testSuites)
                    .filter(
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testSuites[el])
                    .reduce((ac, cv) => ac + cv, 0),
                  color: "#808080",
                },
              ]}
            />
          </div>
          <div className="col-6">
            <div>Execution Status</div>
            <HSBar
              showTextIn
              data={Object.keys(e.testSuites)
                .filter((el) => el === "Pass" || el === "fail")
                .map((item, ind) => ({
                  value: e.testSuites[item],
                  description:
                    item === "Pass"
                      ? `${e.testCases[item]} / ${Object.values(
                          Object.keys(e.testCases)
                            .filter((key) => key === "Pass" || key === "fail")
                            .reduce((obj, key) => {
                              return Object.assign(obj, {
                                [key]: e.testCases[key],
                              });
                            }, {})
                        ).reduce((ac, cv) => ac + cv, 0)} Passed`
                      : "",
                  color: reportsBar[item],
                }))}
            />
          </div>
        </div>
      ),
      data: e.id,
      children: testSuite[e.key] ? testSuite[e.key] : [{ key: '0-0' }],
    };
    return (
      <Tree
        value={[treeArr]}
        onExpand={(e) => onTestSuiteClick(e)}
        className="modules_tree"
      />
    );
  };

  const testCaseBodyTemplate = (e) => {
    return (
      <div className="grid">
        <div className="col-6">
          <div>Execution Progress</div>
          <HSBar
            showTextIn
            data={[
              {
                value:
                  Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                  Object.keys(e.testCases)
                    .filter(
                      (item) =>
                        item === "Terminate" ||
                        item === "Skipped" ||
                        item === "Incomplete"
                    )
                    .map((el) => e.testCases[el])
                    .reduce((ac, cv) => ac + cv, 0),
                description: `${
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
                } / ${Object.values(e.testCases).reduce(
                  (ac, cv) => ac + cv,
                  0
                )} Executed`,
                color: "#6a5acd",
              },
              {
                value: Object.keys(e.testCases)
                  .filter(
                    (item) =>
                      item === "Terminate" ||
                      item === "Skipped" ||
                      item === "Incomplete"
                  )
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0),
                color: "#808080",
              },
            ]}
          />
        </div>
        <div className="col-6">
          <div>Execution Status</div>
          <HSBar
            showTextIn
            data={Object.keys(e.testCases)
              .filter((el) => el === "Pass" || el === "fail")
              .map((item, ind) => {
                return {
                  value: e.testCases[item],
                  description:
                    item === "Pass"
                      ? `${e.testCases[item]} / ${Object.values(
                          Object.keys(e.testCases)
                            .filter((key) => key === "Pass" || key === "fail")
                            .reduce((obj, key) => {
                              return Object.assign(obj, {
                                [key]: e.testCases[key],
                              });
                            }, {})
                        ).reduce((ac, cv) => ac + cv, 0)} Passed`
                      : "",
                  color: reportsBar[item],
                };
              })}
          />
        </div>
        <Tree
          value={testCase[e.key]}
          onExpand={(e) => onTestCaseClick(e)}
          className="modules_tree"
        />
      </div>
    );
  };

  return (
    <div className="profile_container">
      <Breadcrumbs>
        <Link>Home</Link>
        <Link>Reports</Link>
        <Link>Executions</Link>
      </Breadcrumbs>
      <DataTable
        value={reportsTable}
        tableStyle={{ minWidth: "50rem" }}
        header={tableHeader}
        globalFilter={searchScenario}
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
            {...(col.field === "status" ? { body: statusBodyTemplate } : {})}
            {...(col.field === "module" ? { body: moduleBodyTemplate } : {})}
            {...(col.field === "testCases" ? { body: testCaseBodyTemplate } : {})}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Profile;

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
import { downloadReports, getReportList, getTestSuite } from "../api";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { Menu } from "primereact/menu";
import { FooterTwo } from "../../global";

const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const [testSuite, setTestSuite] = useState({});
  const [reportsTable, setReportsTable] = useState([]);
  const [downloadId, setDownloadId] = useState("");
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

  useEffect(() => {
    (async() => {
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
          })()
  }, [location]);
  
  const onTestSuiteClick = async (getRow) => {
    const testSuiteList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "modulestatus",
      executionListId: getRow?.node?.data,
    });
        
    const nestedTable = testSuiteList.map((el, i) => {
      let nestedtreeArr = {
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
                    color: "#605BFF",
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
                    color: "#DEE2E6",
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
                  .filter((el) => el === "Pass" || el === "Fail")
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
                                  (key) => key === "Pass" || key === "Fail"
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
        data: el.id,
        icon: 'pi pi-fw pi-chevron-right',
      };
      return {
        key: i,
        testSuite: el?.modulename,
        testSuiteBar: (
          <Tree
            value={[nestedtreeArr]}
            // onExpand={(e) => onTestSuiteClick(e)}
            className="modules_tree"
          />
        ),
        id: el?._id,
      };
    });

    setTestSuite({
      ...testSuite,
      [getRow?.node?.key]: [
        {
          key: "0-0",
          label: (
            <DataTable
              showHeaders={false}
              value={nestedTable}
              onRowClick={(e) => onTestCaseClick(e, getRow)}
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
    const win = window.open(`/viewReports?reportID=${reportid}`, "_blank"); 
    win.focus();
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
                    color: "#605BFF",
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
                    color: "#DEE2E6",
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
                  .filter((el) => el === "Pass" || el === "Fail")
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
                                  (key) => key === "Pass" || key === "Fail"
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
            {row?.index === i ? (
              <DataTable
                showHeaders={false}
                className="statusTable"
                value={testsList.map((item) => ({
                  ...item,
                  downLoad: <i className="pi pi-download" onClick={(e) => {
                    setDownloadId(item?._id);
                    downloadRef.current.toggle(e)
                  }}></i>,
                  statusView: (
                      <Button
                      label="View"
                      severity="secondary"
                      size="small"
                      outlined
                      onClick={()=>handleViweReports(item._id)}
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
        icon: row?.index === i ? "pi pi-fw pi-chevron-down" : "pi pi-fw pi-chevron-right",
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

  const moduleBodyTemplate = (e) => {
    let treeArr = {
      key: e.key,
      label: (
        <div className="grid">
          <div className="col-3">
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
                  color: "#605BFF",
                },
                {
                  value: Object.keys(e.testSuites)
                    .filter(
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testSuites[el])
                    .reduce((ac, cv) => ac + cv, 0),
                  color: "#DEE2E6",
                },
              ]}
            />
          </div>
          <div className="col-3">
            <div>Execution Status</div>
            <HSBar
              showTextIn
              data={Object.keys(e.testSuites)
                .filter((el) => el === "pass" || el === "fail")
                .map((item, ind) => ({
                  value: e.testSuites[item],
                  description:
                    item === "pass"
                      ? `${e.testSuites[item]} / ${Object.values(
                          Object.keys(e.testSuites)
                            .filter((key) => key === "pass" || key === "fail")
                            .reduce((obj, key) => {
                              return Object.assign(obj, {
                                [key]: e.testSuites[key],
                              });
                            }, {})
                        ).reduce((ac, cv) => ac + cv, 0)} Passed`
                      : "",
                  color: reportsBar[item],
                }))}
            />
          </div>
          <div className="col-3">
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
                  color: "#605BFF",
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
                  color: "#DEE2E6",
                },
              ]}
            />
          </div>
          <div className="col-3">
            <div>Execution Status</div>
            <HSBar
              showTextIn
              data={Object.keys(e.testCases)
                .filter((el) => el === "Pass" || el === "Fail")
                .map((item, ind) => {
                  return {
                    value: e.testCases[item],
                    description:
                      item === "Pass"
                        ? `${e.testCases[item]} / ${Object.values(
                            Object.keys(e.testCases)
                              .filter((key) => key === "Pass" || key === "Fail")
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

  const onDownload = async (getId) => {
    let data = await downloadReports({ id: downloadId, type: getId });

    if (getId === "json") data = JSON.stringify(data, undefined, 2);

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
            {...(col.field === "status" ? { body: statusBodyTemplate } : {})}
            {...(col.field === "module" ? { body: moduleBodyTemplate } : {})}
          />
        ))}
      </DataTable>
      <OverlayPanel ref={downloadRef} className="reports_download">
      <Menu model={[
        {label: <span onClick={() => onDownload('json')}>JSON</span>, icon: 'pi pi-fw pi-file'},
        {label: <span onClick={() => onDownload('pdf')}>PDF</span>, icon: 'pi pi-fw pi-file'},
        {label: <span onClick={() => onDownload('pdfwithimg')}>PDF with screenshots</span>, icon: 'pi pi-fw pi-file'}
    ]} />
      </OverlayPanel>
    </div>
    <div><FooterTwo/></div>
    </>
  );
};

export default Profile;

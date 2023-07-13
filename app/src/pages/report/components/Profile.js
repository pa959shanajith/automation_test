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

const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const [testSuite, setTestSuite] = useState({ key: "0-0" });
  const [testCase, setTestCase] = useState([]);
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
    const getScenarioStatus = testSuiteList[0]?.scenarioStatus.reduce(
      (ac, cv) => ((ac[cv] = ac[cv] + 1 || 1), ac),
      {}
    );
    setTestSuite({
      ...testSuite,
      label: (
        <div className="flex align-items-center justify-content-between">
          <div>{testSuiteList[0]?.modulename}</div>
          <div>
            <HSBar
              showTextIn
              data={Object.keys(getScenarioStatus).map((item, ind) => ({
                value: getScenarioStatus[item],
                description: `${getScenarioStatus[item]} ${item}`,
                color: reportsBar[item],
              }))}
            />
          </div>
        </div>
      ),
      data: testSuiteList[0]?._id,
      icon: 'pi pi-fw pi-chevron-right'
    });
  };

  const onTestSceneClick = async() => {
    const testSuiteList = await getTestSuite({
      query: "fetchModSceDetails",
      param: "scenarioStatus",
      executionId: testSuite?.data
    })
    setTestCase(testSuiteList);
  };

  const tableHeader = () => {
    return (
      <div className="flex flex-column">
        <div className="exeprofile_txt">Execution Profile 1</div>
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
                  } Executed`,
                  color: "#6a5acd",
                },
                {
                  value: Object.keys(e.testSuites)
                    .filter(
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testSuites[el])
                    .reduce((ac, cv) => ac + cv, 0),
                  description: `${Object.keys(e.testSuites)
                    .filter(
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testSuites[el])
                    .reduce((ac, cv) => ac + cv, 0)} Not Executed`,
                  color: "#808080",
                },
              ]}
            />
          </div>
          <div className="col-6">
            <div>Status</div>
            <HSBar
              showTextIn
              data={Object.keys(e.testSuites).map((item, ind) => ({
                value: e.testSuites[item],
                description: `${e.testSuites[item]} ${item}`,
                color: reportsBar[item],
              }))}
            />
          </div>
        </div>
      ),
      data: e.id,
      children: [testSuite],
    };
    console.log(testSuite);
    return (
      <Tree
        value={[treeArr]}
        onExpand={(e) => onTestSuiteClick(e)}
        onNodeClick={(e) => onTestSceneClick(e)}
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
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testCases[el])
                    .reduce((ac, cv) => ac + cv, 0),
                description: `${
                  Object.values(e.testCases).reduce((ac, cv) => ac + cv, 0) -
                  Object.keys(e.testCases)
                    .filter(
                      (item) => item === "Queued" || item === "Inprogress"
                    )
                    .map((el) => e.testCases[el])
                    .reduce((ac, cv) => ac + cv, 0)
                } Executed`,
                color: "#6a5acd",
              },
              {
                value: Object.keys(e.testCases)
                  .filter((item) => item === "Queued" || item === "Inprogress")
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0),
                description: `${Object.keys(e.testCases)
                  .filter((item) => item === "Queued" || item === "Inprogress")
                  .map((el) => e.testCases[el])
                  .reduce((ac, cv) => ac + cv, 0)} Not Executed`,
                color: "#808080",
              },
            ]}
          />
        </div>
        <div className="col-6">
          <div>Status</div>
          <HSBar
            showTextIn
            data={Object.keys(e.testCases).map((item, ind) => ({
              value: e.testCases[item],
              description: `${e.testCases[item]} ${item}`,
              color: reportsBar[item],
            }))}
          />
        </div>
        {
          testCase.map((el) => <>
            <div className="col-4">
              {el?.scenarioname}
            </div>
            <div className="col-4">
              {el?.status}
            </div>
            <div className="col-4">
              View
            </div>
          </>)
        }
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

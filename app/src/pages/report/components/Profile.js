import { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Breadcrumbs, Link } from '@mui/material';
import AvoInput from "../../../globalComponents/AvoInput";
import "./Profile.scss";

const Profile = () => {
  const [searchScenario, setSearchScenario] = useState("");
  const products = [
    {
      id: "1000",
      name: "Add Execution No: E1",
      dateTime: "22 Aug 2022, 12:54:15 PM",
      browser: "chrome",
      module: 100,
      testScenario: 8,
    },
    {
      id: "1000",
      name: "Check Execution No: E1",
      dateTime: "22 Aug 2022, 12:54:15 PM",
      browser: "chrome",
      module: 100,
      testScenario: 8,
    },
    {
      id: "1000",
      name: "Remove Execution No: E2",
      dateTime: "22 Aug 2022, 12:54:15 PM",
      browser: "chrome",
      module: 100,
      testScenario: 8,
    },
    {
      id: "1000",
      name: "Test Execution No: E3",
      dateTime: "22 Aug 2022, 12:54:15 PM",
      browser: "chrome",
      module: 100,
      testScenario: 8,
    },
    {
      id: "1000",
      name: "Final Execution No: E4",
      dateTime: "22 Aug 2022, 12:54:15 PM",
      browser: "chrome",
      module: 100,
      testScenario: 8,
    },
  ];

  const columns = [
    { field: "name", header: "Name" },
    { field: "dateTime", header: "Date and Time" },
    { field: "browser", header: "Browser(s)" },
    { field: "module", header: "Module(s)" },
    { field: "testScenario", header: "Test scenarios(s)" },
  ];

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

  return (
    <div className="profile_container">
      <Breadcrumbs>
        <Link>Home</Link>
        <Link>Reports</Link>
        <Link>Executions</Link>
      </Breadcrumbs>
      <DataTable
        value={products}
        tableStyle={{ minWidth: "50rem"}}
        header={tableHeader}
        globalFilter={searchScenario}
      >
        {columns.map((col, i) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            {...(col.field === "testScenario"
              ? { filter: true, filterPlaceholder: "Search by name" }
              : {})}
            {...(col.field === "name" || col.field === "dateTime"
              ? { sortable: true }
              : {})}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Profile;

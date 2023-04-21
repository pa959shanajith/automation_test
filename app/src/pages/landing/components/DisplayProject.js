import React, { useRef } from "react";
import { useState } from "react";
import { Card } from "primereact/card";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { Ripple } from "primereact/ripple";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import CreateProject from "../components/CreateProject";
import ProjectOverview from "../components/ProjectOverview";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";

const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [sortItem, setSortItem] = useState(null);
  const sortItems = [
    { label: "Last Modified", value: "dateCreated"},
    { label: "Date Created", value: "lastModified"  },
    { label: "Alphabetical" , value: "name" },
  ];

  const projects = [
    {
      id: 1,
      name: "Project 1",
      modifiedBy: "User 1",
      appType: "Web",
      createdDate: "2022-01-02",
    },
    {
      id: 2,
      name: "Project 2",
      modifiedBy: "User 2",
      appType: "Mobile",
      createdDate: "2022-01-01",
    },
    {
      id: 3,
      name: "Project 3",
      modifiedBy: "User 3",
      appType: "Web",
      createdDate: "2022-01-03",
    },
    {
      id: 4,
      name: "Project 4",
      modifiedBy: "User 4",
      appType: "Mobile",
      createdDate: "2022-01-04",
    },
    {
      id: 5,
      name: "Project 5",
      modifiedBy: "User 5",
      appType: "Web",
      createdDate: "2022-01-05",
    },
  ];

  const handleSearchProject = (event) => {
    setSearchProjectName(event.target.value);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchProjectName.toLowerCase())
  );
  function showSortMenu(event) {
    // setSortItem(event.target.value);
    setSortVisible(!sortVisible);
  }

  
  const handleOpenDialog = () => {
    setVisible(true); 
  };

  const handleCloseDialog = () => {
    setVisible(false); 
  };

  const template = (options) => {
    
    const toggleIcon = options.collapsed
      ? "pi pi-chevron-down"
      : "pi pi-chevron-up";
    const className = `${options.className} justify-content-start`;
    const titleClassName = `${options.titleClassName} ml-2 text-primary`;
    const style = { fontSize: "1.1rem" };

    return (
      <>
        <div className="card flex justify-content-center">
          {sortVisible && <Menu className="sort-Menu" setsortVisible={setSortVisible} model={sortItems} />}
        </div>
        {/* {visible && <CreateProject setVisible={setVisible} />} */}
        <div className={className}>
          <button
            className={options.togglerClassName}
            onClick={options.onTogglerClick}
          >
            <span className={toggleIcon}></span>
            <Ripple />
          </button>
          <span className={titleClassName} style={style}>
            ALL PROJECTS
          </span>
          <div>
            <span style={{ margin: "0rem 1rem 0rem 1.378rem" }}>
              <button
                className="pi pi-plus"
                style={{ border: "none", cursor: "pointer" }}
                onClick={handleOpenDialog}
              ></button>
              <CreateProject visible={visible} onHide={handleCloseDialog} /> 
            </span>
          </div>
          <div>
            <span>
              <button
                className="pi pi-sort-amount-down"
                style={{ border: "none", cursor: "pointer" }}
                onClick={showSortMenu }
              />
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Panel
        className="Project-Panel"
        headerTemplate={template}
        toggleable
      >
        <span className="p-input-icon-left Project-search ">
          <i className="pi pi-search" />
          <InputText
            id="i"
            placeholder="Search"
            value={searchProjectName}
            onChange={handleSearchProject}
          />
        </span>
        <div className="project-list">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <h2 className="projectInside">{project.name}</h2>
              <p className="projectInsideLast">
                Last Modified By {project.modifiedBy}
              </p>
              {/* <p>App Type: {project.appType}</p> */}
              {/* <p>Created Date: {project.createdDate}</p> */}
            </div>
          ))}
        </div>
      </Panel>
      {/* <ProjectOverview defaultProject={projects[0]} /> */}
    </>
  );
};
export default DisplayProject;

import React, { Fragment, useRef } from "react";
import { useState } from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { Ripple } from "primereact/ripple";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";

const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(1);
  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified() },
    { label: "Date Created", value: "lastModified", command: () => sortByCreated() },
    { label: "Alphabetical", value: "name", command: () => sortByName() },
  ];

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "webserivces",
      modifiedBy: "User 1",
      appType: "Web",
      createdDate: "2022-01-02",
      modifiedDate: "2022-02-04"
    },
    {
      id: 2,
      name: "Mobile_app",
      modifiedBy: "User 2",
      appType: "Mobile",
      createdDate: "2022-01-28",
      modifiedDate: "2022-05-06"
    },
    {
      id: 3,
      name: "Desktop_app",
      modifiedBy: "User 3",
      appType: "Desktop",
      createdDate: "2022-01-03",
      modifiedDate: "2022-02-04"
    },
    {
      id: 4,
      name: "Project 4",
      modifiedBy: "User 4",
      appType: "WebService",
      createdDate: "2022-01-14",
      modifiedDate: "2022-02-05"
    },
    {
      id: 5,
      name: "Project 5",
      modifiedBy: "User 5",
      appType: "SAP",
      createdDate: "2022-01-08",
      modifiedDate: "2022-02-06"
    },
  ])



  const sortByName = () => {
    const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));
    setProjects(sortedProjects);
    setSortVisible(false);
  };
  const sortByCreated = () => {
    const sortedProjects = [...projects].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    setProjects(sortedProjects);
    setSortVisible(false);
  };
  const sortByModified = () => {
    const sortedProjects = [...projects].sort((a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate));
    setProjects(sortedProjects);
    setSortVisible(false);
  };
  const handleSearchProject = (event) => {
    setSearchProjectName(event.target.value);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchProjectName.toLowerCase())
  );
  function showSortMenu(event) {
    setSortVisible(!sortVisible);
  }


  const handleOpenDialog = () => {
    setVisible(true);
  };

  const handleCloseDialog = () => {
    setVisible(false);
  };

  const defaultProject = projects.find((project) => project.id === defaultProjectId);

  const template = (options) => {
    const toggleIcon = options.collapsed
      ? "pi pi-chevron-down"
      : "pi pi-chevron-up";
    const className = `${options.className} justify-content-start`;
    return (
      <>
        {sortVisible && <Menu className="sort-Menu" setsortVisible={setSortVisible} model={sortItems} id="sort_menu_color" />}
        <div className={className}>
          <button className={options.togglerClassName} onClick={options.onTogglerClick}>
            <span className={toggleIcon}></span>
            <Ripple />
          </button>
          <span className="All_Project_font" >ALL PROJECTS</span>
          <button className="pi pi-plus add_btn" onClick={handleOpenDialog} />
          <CreateProject visible={visible} onHide={handleCloseDialog} />
          <button className="pi pi-sort-amount-down sort_btn" onClick={showSortMenu} />
        </div>
      </>
    )
  };


  return (
    <>
      <Panel className="Project-Panel" headerTemplate={template} toggleable>
        <div className="p-input-icon-left Project-search ">
          <i className="pi pi-search" />
          <InputText className="Search_name" placeholder="Search" value={searchProjectName} onChange={handleSearchProject} />
        </div>
        <div className="project-list">
          {filteredProjects.map((project) => (
            <div key={project.id} >
              <button
                className={project.id === defaultProjectId ? 'default-project project-card' : 'project-card'}
                onClick={() => setDefaultProjectId(project.id)}>
                <h2 className="projectInside">{project.name} </h2>
                <>
                  {project.appType === "Web" && (<img src="static/imgs/web.png" alt="Web App Icon" height="20" />)}
                  {project.appType === "Mobile" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "Desktop" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "WebService" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "SAP" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" width='18' />)}
                  {project.appType === "OEBS" && (<img src="static/imgs/OEBS.png" alt="Mobile App Icon" height="20" />)}
                </>
                <p className="projectInsideLast">Last Modified By {project.modifiedBy}</p>
              </button>
            </div>))}
        </div>
      </Panel>
      <p className="DefaultProjectName">{defaultProject.name}</p>
      <div className="Default_Project_icon">
        {defaultProject.appType === "Web" && (<img src="static/imgs/web.png" alt="Web App Icon" height="25" />)}
        {defaultProject.appType === "Mobile" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject.appType === "Desktop" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject.appType === "WebService" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject.appType === "SAP" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject.appType === "OEBS" && (<img src="static/imgs/OEBS.png" alt="Mobile App Icon" height="25" />)}
      </div>
      {/* <HomePage defaultProjectName={defaultProject.name} /> */}
    </>
  );
};
export default DisplayProject;

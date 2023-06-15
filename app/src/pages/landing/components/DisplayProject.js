import React, { useEffect, useState } from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";
import { fetchProjects } from "../api"
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';



const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectsDetails, setProjectsDetails] = useState([]);
  const [getProjectLists, setProjectList] = useState([]);
  const createdProject = useSelector((state) => state.landing.savedNewProject);
  const dispatch = useDispatch();


  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified() },
    { label: "Date Created", value: "lastModified", command: () => sortByCreated() },
    { label: "Alphabetical", value: "name", command: () => sortByName() },
  ];


  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
      setDefaultProjectId(filteredProjects[0].projectId);
    }
  }, [filteredProjects]);

  const DateTimeFormat = (inputDate) => {
    const convertedDate = new Date(inputDate);
    const offsetHours = 5;
    const offsetMinutes = 30;
    convertedDate.setHours(convertedDate.getHours() - offsetHours);
    convertedDate.setMinutes(convertedDate.getMinutes() - offsetMinutes);
    var currentDate = new Date();
    var previousDate = new Date(convertedDate); 
    var timeDifference = currentDate.getTime() - previousDate.getTime();
    var seconds = Math.floor(timeDifference / 1000) % 60;
    var minutes = Math.floor(timeDifference / (1000 * 60)) % 60;
    var hours = Math.floor(timeDifference / (1000 * 60 * 60)) % 24;
    var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    var months = Math.floor(days / 30);
    var years = Math.floor(months / 12);
    var output = "";
    if (years == 0 && months == 0 && hours == 0 && minutes == 0 && seconds >= 0) {
      output = "Created Now";
    }
    else if (years == 0 && months == 0 && hours == 0 && minutes >= 1 ) {
      output ="Last Modified On " + minutes + "min ago";
    }
    else if (years == 0 && months == 0 && hours >= 1 ) {
      output ="Last Modified On " + hours + "h ago";
    }
    else if (years == 0 && months >= 1 ) {
      output ="Last Modified On " + months + "months ago";
    }
    else
    {
      output ="Last Modified On " + years + "y ago";
    }

    return output;
  }

  useEffect(() => {
    (async () => {
      const projectList = await fetchProjects({ readme: "projects" });
        setProjectsDetails(projectList);
        const arrayNew = projectList.map((element, index) =>{ 
          const lastModified =  DateTimeFormat(element.releases[0].modifiedon);
          console.log(lastModified);
          return {
          key: index,
          projectName: element.name,
          modifiedName: element.firstname,
          modifieDateProject:element.releases[0].modifiedon,
          modifiedDate: lastModified,
          createdDate: element.releases[0].createdon,
          appType: element.type,
          projectId: element._id,
          }
      });
        const sortedProject = arrayNew.sort((a,b)=> new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
        setProjectList(sortedProject);
    })();
  }, []);

  useEffect(() => {
    if (createdProject) {
      (async () => {
        const ProjectList = await fetchProjects({ readme: "projects" });
        setProjectsDetails(ProjectList)
        if (ProjectList.error) {
          // setMsg(MSG.CUSTOM("Error while fetching the project Details"));
        } else {
          const arraynew = ProjectList.map((element, index) => {
            const lastModified =  DateTimeFormat(element.releases[0].modifiedon);
            return (
              {
                key: index,
                projectName: element.name,
                modifiedName: element.firstname,
                modifiedDate: lastModified,
                modifieDateProject:element.releases[0].modifiedon,
                createdDate: element.releases[0].createdon,
                appType: element.type,
                projectId: element._id,
              }
            )
          })
          const sortedProject = arraynew.sort((a,b)=> new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
          setProjectList(sortedProject);
          dispatch(loadUserInfoActions.savedNewProject(false))
        }
      })()

    }
  }, [createdProject])



  const sortByName = () => {
    const sortedProjects = [...getProjectLists].sort((a, b) => a.projectName.localeCompare(b.projectName));
    setProjectList(sortedProjects);
    setSortVisible(false);
  };
  const sortByCreated = () => {
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    setProjectList(sortedProjects);
    setSortVisible(false);
  };
  const sortByModified = () => {
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate));
    setProjectList(sortedProjects);
    setSortVisible(false);
  };
  const handleSearchProject = (event) => {
    setSearchProjectName(event.target.value);
  };

  const filteredProjects = getProjectLists.length > 0 ? getProjectLists.filter((project) =>
    project.projectName.toLowerCase().includes(searchProjectName.toLowerCase())
  ) : [];
  function showSortMenu(event) {
    setSortVisible(!sortVisible);
  }


  const handleOpenDialog = () => {
    setVisible(true);
  };

  const handleCloseDialog = () => {
    setVisible(false);
  };


  useEffect(() => {
    const selectedProject = filteredProjects.find(project => project.projectId === defaultProjectId);
    setDefaultProject(selectedProject);
  }, [defaultProjectId, filteredProjects]);

  useEffect(() => { if (getProjectLists && getProjectLists.length > 0) { setDefaultProjectId(getProjectLists[0].projectId); } }, [getProjectLists]);

  const template = (options) => {
    const className = `${options.className} justify-content-start`;
    return (
      <>
        {sortVisible && <Menu className="sort-Menu" setsortVisible={setSortVisible} model={sortItems} id="sort_menu_color" />}
        <div className={className}>
          <span className="All_Project_font" >ALL PROJECTS</span>
          <button className="pi pi-plus add_btn" title="Create Project" onClick={handleOpenDialog} />
          <CreateProject visible={visible} onHide={handleCloseDialog} />
          <button className="pi pi-sort-amount-down sort_btn" title="Sort Projects" onClick={showSortMenu} />
        </div>
      </>
    )
  };


  return (
    <>
      <Panel className="Project-Panel" headerTemplate={template} >
        <div className="p-input-icon-left Project-search ">
          <i className="pi pi-search" />
          <InputText className="Search_name" placeholder="Search" value={searchProjectName} onChange={handleSearchProject} />
        </div>
          <div className="project-list project">
            {filteredProjects.map((project) => (
              <div  key={project.projectId} >
                <button
                  className={project.projectId === defaultProjectId ? 'default-project project-card' : 'project-card'}
                  onClick={() => {
                    if (project.projectId !== defaultProjectId) {
                      setDefaultProjectId(project.projectId);
                    }
                  }}>
                    {project.appType === "5db0022cf87fdec084ae49b6" && (<img src="static/imgs/web.png" alt="Web App Icon" height="20"/>)}
                    {project.appType === "5db0022cf87fdec084ae49b2" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="20" />)}
                    {project.appType === "5db0022cf87fdec084ae49af" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
                    {project.appType === "5db0022cf87fdec084ae49b7" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="20" />)}
                    {project.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="20" width='18' />)}
                    {project.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="17" width='25' />)}
                    {project.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
                    {project.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
                    {/* <Tooltip target=".projectInside .projectInsideLast" position="bottom" content={project.projectName}{project.modifiedDate}/> */}
                    <h2 className="projectInside" title={project.projectName}>{project.projectName}</h2>
                  <h2 className="projectInsideLast" title={project.modifiedName}>{project.modifiedDate} By {project.modifiedName}</h2>
                </button>
              </div>))}
          </div>
      </Panel>
      <p className="DefaultProjectName">{defaultProject && defaultProject.projectName}</p>
      <div className="Default_Project_icon">
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b6" && (<img src="static/imgs/web.png" alt="Web App Icon" height="25" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b2" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49af" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b7" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="20" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="17" width='25' />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
      </div>
    </>
  );
};
export default DisplayProject;

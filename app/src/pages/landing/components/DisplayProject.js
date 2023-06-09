import React, { Fragment, useRef ,useEffect,useState} from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { Ripple } from "primereact/ripple";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";
import {getProjectList} from "../../design/api"
import {fetchProjects} from "../api"
import { useSelector, useDispatch} from 'react-redux';




const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectsDetails, setProjectsDetails] = useState({});
  const [projectsModifiedDetails, setProjectsModifiedDetails] = useState([]);
  const [getProjectLists,setProjectList]=useState([]);
  const [getProjectModifiedLists,setProjectModifiedList]=useState([]);
  const [selectedProjectModified,setSelectedProjectModified]=useState(null);
  const [appTypeDialog, setAppTypeDialog] = useState(null)
  const [assignedUsers, setAssignedUsers] = useState({});
  const [projectName, setProjectName] = useState("");


  
  const [date, setDate] = useState("Wed, 07 Jun 2023 17:18:39 GMT");
  const [timeDiff, setTimeDiff] = useState(null);

  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified() },
    { label: "Date Created", value: "lastModified", command: () => sortByCreated() },
    { label: "Alphabetical", value: "name", command: () => sortByName() },
  ];


  useEffect(() => {
    const givenDate = new Date(date);
    const currentDate = new Date();
    const timeDiff = currentDate - givenDate;

    // Calculate time and month difference
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const months = (currentDate.getFullYear() - givenDate.getFullYear()) * 12 +
      (currentDate.getMonth() - givenDate.getMonth());

    // Set the time difference in the state
    setTimeDiff({ months, hours, minutes });
  }, [date]);

  
  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
    setDefaultProjectId(filteredProjects[0].projectId);
    }
    }, [filteredProjects]);

    useEffect(()=>{
      (async()=>{
        const ProjectList = await fetchProjects({ readme: "projects" });
        setProjectsDetails(ProjectList)
        if(ProjectList.error){
          // setMsg(MSG.CUSTOM("Error while fetching the project Details"));
  }else{
          const arraynew = ProjectList.map((element,index)=>{
            return(
              {
                key:index,

                projectName:element.name,
                modifiedName:element.firstname,
                modifiedDate:element.releases[0].modifiedon,
                createdDate:element.releases[0].createdon,
                appType:element.type,
                projectId:element._id,
              }
            )
          })
          setProjectList(arraynew);
         }
      })()
    },[])

 
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
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate));
    setProjectList(sortedProjects);
    setSortVisible(false);
  };
  const handleSearchProject = (event) => {
    setSearchProjectName(event.target.value);
  };

  const filteredProjects = getProjectLists.length >0 ? getProjectLists.filter((project) =>
    project.projectName.toLowerCase().includes(searchProjectName.toLowerCase())
  ):[];
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

  useEffect(() => {if (getProjectLists && getProjectLists.length > 0) {setDefaultProjectId(getProjectLists[0].projectId);}}, [getProjectLists]);

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
            <div key={project.projectId} >
              <button
                className={project.projectId === defaultProjectId ? 'default-project project-card' : 'project-card'}
                onClick={() =>{
                  if(project.projectId !== defaultProjectId){
                    setDefaultProjectId(project.projectId);
                  }}}>
                <h2 className="projectInside">{project.projectName} </h2>
                <>
                  {project.appType === "5db0022cf87fdec084ae49b6" && (<img src="static/imgs/web.png" alt="Web App Icon" height="20" />)}
                  {project.appType === "5db0022cf87fdec084ae49b2" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "5db0022cf87fdec084ae49af" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "5db0022cf87fdec084ae49b7" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="20" />)}
                  {project.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" width='18' />)}
                  {project.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/oracleApps.png" alt="Mobile App Icon" height="17" width='25'/>)}
                  {project.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
                  {project.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
                </>
                <p className="projectInsideLast" title="project.modifiedDate">LastModifiedon {project.modifiedDate.slice(0, 3)} By {project.modifiedName}</p>
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
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/oracleApps.png" alt="Mobile App Icon" height="17" width='25'/>)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
        {defaultProject && defaultProject.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
      </div>
    </>
  );
};
export default DisplayProject;

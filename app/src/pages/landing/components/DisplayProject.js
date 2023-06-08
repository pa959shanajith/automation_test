import React, { Fragment, useRef ,useEffect,useState} from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { Ripple } from "primereact/ripple";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";
import {getProjectList} from "../../design/api"
import { useSelector, useDispatch} from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';
import {userCreateProject_ICE,getProjectIDs,getUserDetails} from "../api"
import { selectedProj, selectedModule, isEnELoad } from '../../design/designSlice';



const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectsDetails, setProjectsDetails] = useState({});
  const [appTypeDetails, setApptypeDetails] = useState([]);
  const [getProjectLists,setProjectList]=useState([]);
  const [appTypeDialog, setAppTypeDialog] = useState(null)
  const [assignedUsers, setAssignedUsers] = useState({});
  const [projectName, setProjectName] = useState("");
  const dispatch = useDispatch();
  const selectProj = useSelector(state=>state.design.selectedProj);  
  const prjList = useSelector(state=>state.design.projectList)
  const projectDetail = useSelector((state) => state.landing.projectDetails);

  
  // const [userDetailList,setUserDetailList]=useState([]);
  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified() },
    { label: "Date Created", value: "lastModified", command: () => sortByCreated() },
    { label: "Alphabetical", value: "name", command: () => sortByName() },
  ];


  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
    setDefaultProjectId(filteredProjects[0].key);
    }
    }, [filteredProjects]);
    useEffect(()=>{
      (async() => {
          const ProjectList = await getProjectList();
          // loadProjectDetails(ProjectList)
          // const createdList = await userCreateProject_ICE();
          setProjectsDetails(ProjectList)
          // setApptypeDetails(createdList)
          // console.log(createdList);
      if(ProjectList.error){
              // setMsg(MSG.CUSTOM("Error while fetching the project Details"));
      }else{

              const arraynew = ProjectList.projectId.map((element, index) => {
                  return (
                      {
                          key: element,
                          text: ProjectList.projectName[index], 
                          value: ProjectList.appTypeName[index], 
                      }
                  )
              });
              setProjectList(arraynew);
          }
      })()
  },[])

//   const loadProjectDetails = ProjectList => {
//     console.log(loadProjectDetails);
//     dispatch(loadUserInfoActions.setProjectDetails(ProjectList.projectDetails));
// }

  


  const sortByName = () => {
    const sortedProjects = [...getProjectLists].sort((a, b) => a.text.localeCompare(b.text));
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

  const filteredProjects = getProjectLists.filter((project) =>
    project.text.toLowerCase().includes(searchProjectName.toLowerCase())
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

useEffect(() => {
  const selectedProject = filteredProjects.find(project => project.key === defaultProjectId);
  setDefaultProject(selectedProject);
  }, [defaultProjectId, filteredProjects]);


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
            <div key={project.key} >
              <button
                className={project.key === defaultProjectId ? 'default-project project-card' : 'project-card'}
                onClick={() =>{
                  if(project.key !== defaultProjectId){
                    setDefaultProjectId(project.key);
                  }}}>
                <h2 className="projectInside">{project.text} </h2>
                <>
                  {project.value === "Web" && (<img src="static/imgs/web.png" alt="Web App Icon" height="20" />)}
                  {project.value === "MobileWeb" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="20" />)}
                  {project.value === "Desktop" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
                  {project.value === "Webservice" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="20" />)}
                  {project.value === "SAP" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" width='18' />)}
                  {project.value === "OEBS" && (<img src="static/imgs/oracleApps.png" alt="Mobile App Icon" height="17" width='25'/>)}
                  {project.value === "Mainframe" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
                  {project.value === "Mobileapps" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
                </>
                <p className="projectInsideLast">Last Modified By Swati{project.modifiedBy}</p>
              </button>
            </div>))}
        </div>
      </Panel>
      <p className="DefaultProjectName">{defaultProject && defaultProject.text}</p>
      <div className="Default_Project_icon">
        {defaultProject && defaultProject.value === "Web" && (<img src="static/imgs/web.png" alt="Web App Icon" height="25" />)}
        {defaultProject && defaultProject.value === "MobileWeb" && (<img src="static/imgs/mobileWeb.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject && defaultProject.value === "Desktop" && (<img src="static/imgs/desktop.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject && defaultProject.value === "Webservice" && (<img src="static/imgs/webService.png" alt="Mobile App Icon" height="25" />)}
        {defaultProject && defaultProject.value === "SAP" && (<img src="static/imgs/SAP.png" alt="Mobile App Icon" height="20" />)}
        {defaultProject && defaultProject.value === "OEBS" && (<img src="static/imgs/oracleApps.png" alt="Mobile App Icon" height="17" width='25'/>)}
        {defaultProject && defaultProject.value === "Mainframe" && (<img src="static/imgs/mainframe.png" alt="Mobile App Icon" height="18" width='18' />)}
        {defaultProject && defaultProject.value === "MobileApps" && (<img src="static/imgs/mobileApps.png" alt="Mobile App Icon" height="20" />)}
      </div>
    </>
  );
};
export default DisplayProject;

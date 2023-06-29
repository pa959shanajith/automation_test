import React, { useEffect, useState ,useRef} from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";
import { Tooltip } from 'primereact/tooltip';
import { fetchProjects } from "../api"
import { useSelector, useDispatch } from 'react-redux';
import { updateSteps, getStep } from './VerticalComponentsSlice';
import { loadUserInfoActions } from '../LandingSlice';



const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectsDetails, setProjectsDetails] = useState([]);
  const [getProjectLists, setProjectList] = useState([]);
  const [selectedsortItems, setSelectedsortItems] = useState(null)
  const userInfo = useSelector((state) => state.landing.userinfo);
  const createdProject = useSelector((state) => state.landing.savedNewProject);
  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0 ,bottom:0});
  const [showTooltip, setShowTooltip] = useState(false);
  // const defaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  const dispatch = useDispatch();

  const imageRefadd = useRef(null);


  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified('Last Modified'), icon: selectedsortItems === 'Last Modified' ? 'pi pi-check' : '', },
    { label: "Date Created", value: "lastModified", icon: selectedsortItems === 'Date Created' ? 'pi pi-check' : '', command: () => sortByCreated('Date Created') },
    { label: "Alphabetical", value: "name", icon: selectedsortItems === 'Alphabetical' ? 'pi pi-check' : '', command: () => sortByName('Alphabetical') },
  ];

  const handleTooltipToggle = () => {
    const rect = imageRefadd.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, left: rect.left, top: rect.top ,bottom:rect.bottom});
    setShowTooltip(true);
  };

  const handleMouseLeave1 = () => {
    setShowTooltip(false);
  };

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
    var minute_ago= minutes > 1 ?  " minutes" : " minute";
    var hours = Math.floor(timeDifference / (1000 * 60 * 60)) % 24;
    var hours_ago= hours > 1 ?  " hours" : " hour";
    var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    var months = Math.floor(days / 30);
    var months_ago= months > 1 ?  " months" : " month";
    var years = Math.floor(months / 12);
    var years_ago= years > 1 ?  " years" : " year";
    var output = "";
    if (years == 0 && months == 0 && hours == 0 && minutes == 0 && seconds >= 0) {
      output = "Created now";
    }
    else if (years == 0 && months == 0 && hours == 0 && minutes >= 1) {
      output = "Last modified " + minutes + minute_ago +" ago";
    }
    else if (years == 0 && months == 0 && hours >= 1) {
      output = "Last modified " + hours + hours_ago +" ago";
    }
    else if (years == 0 && months >= 1) {
      output = "Last modified " + months + months_ago +" ago";
    }
    else {
      output = "Last modified " + years + years_ago + " ago";
    }

    return output;
  }

  useEffect(() => {
    (async () => {
      const projectList = await fetchProjects({ readme: "projects" });
      setProjectsDetails(projectList);
      const arrayNew = projectList.map((element, index) => {
        const lastModified = DateTimeFormat(element.releases[0].modifiedon);
        return {
          key: index,
          projectName: element.name,
          modifiedName: element.firstname,
          modifieDateProject: element.releases[0].modifiedon,
          modifiedDate: lastModified,
          createdDate: element.releases[0].createdon,
          appType: element.type,
          projectId: element._id,
        }
      });
      const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
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
            const lastModified = DateTimeFormat(element.releases[0].modifiedon);
            return (
              {
                key: index,
                projectName: element.name,
                modifiedName: element.firstname,
                modifiedDate: lastModified,
                modifieDateProject: element.releases[0].modifiedon,
                createdDate: element.releases[0].createdon,
                appType: element.type,
                projectId: element._id,
              }
            )
          })
          const sortedProject = arraynew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
          setProjectList(sortedProject);
          dispatch(loadUserInfoActions.savedNewProject(false))
        }
      })()

    }
  }, [createdProject])


  useEffect(() => {
    if (sortItems.length > 0) {
      setSelectedsortItems(sortItems[0].label);
    }
  }, []);

  const sortByName = (item) => {
    const sortedProjects = [...getProjectLists].sort((a, b) => a.projectName.localeCompare(b.projectName));
    setProjectList(sortedProjects);
    setSelectedsortItems(item);
    setSortVisible(false);
  };
  const sortByCreated = (item) => {
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    setProjectList(sortedProjects);
    setSelectedsortItems(item);
    setSortVisible(false);
  };
  const sortByModified = (item) => {
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate));
    setProjectList(sortedProjects);
    setSelectedsortItems(item);
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
    dispatch(loadUserInfoActions.setDefaultProject(defaultProject));
  }, [defaultProjectId, filteredProjects]);


  useEffect(() => { if (getProjectLists && getProjectLists.length > 0) { setDefaultProjectId(getProjectLists[0].projectId); } }, [getProjectLists]);

  const allProjectTemplate = () => {
    return (
      <>
        <Tooltip target=".add_btn" position="bottom" content="Create Project" />
        {/* <Tooltip target=".sort_btn" position="bottom" content="Sort Projects" />
         */}
        <CreateProject visible={visible} onHide={handleCloseDialog} />
        {sortVisible && <Menu className="sort-Menu" setsortVisible={setSortVisible} model={sortItems} icon={selectedsortItems && 'pi pi-check'} id="sort_menu_color" />}
        <div className="flex flex-row All_Project"> 
          <div className="All_Project_font" >ALL PROJECTS</div>
          <div className="add_sort_btn">
            {userInfo.rolename === "Test Manager" ? (
            <button className="pi pi-plus add_btn" onClick={handleOpenDialog}  />
           
            
            ) : null}
            {/* <button className="pi pi-sort-amount-down sort_btn" onClick={showSortMenu} /> */}
            <button className="pi pi-sort-amount-down sort_btn" onClick={showSortMenu}  ref={imageRefadd} onMouseEnter={() => handleTooltipToggle()} onMouseLeave={() => handleMouseLeave1()}/>
            {showTooltip && (
              <div className='card__add' style={{ position: 'absolute', left: `${cardPosition.left - 80}px`, top: `${cardPosition.top- -20}px`, display: 'block' }}>
                <h3> Sort projects</h3>
                <p className='text__insprint__info1'>Click here to sort projects.</p>
              
              </div>
            )}
          </div>
        </div>
      </>
    )
  };


  useEffect(() => {
    dispatch(getStep(defaultProjectId));
  }, [defaultProjectId])

  return (
    <>
      <Panel className="Project-Panel" headerTemplate={allProjectTemplate} >
        <div className="p-input-icon-left Project-search ">
          <i className="pi pi-search" />
          <InputText className="Search_name" placeholder="Search" value={searchProjectName} onChange={handleSearchProject}  title=" Search all projects."/>
        </div>
        <div className="project-list project">
          {filteredProjects.map((project) => (
            <div key={project.projectId} >
              <button
                className={project.projectId === defaultProjectId ? 'default-project project-card' : 'project-card'}
                onClick={() => {
                  if (project.projectId !== defaultProjectId) {
                    setDefaultProjectId(project.projectId);
                  }
                }}>
                {project.appType === "5db0022cf87fdec084ae49b6" && (<img src="static/imgs/Web.svg" alt="Web App Icon" height="20" />)}
                {project.appType === "5db0022cf87fdec084ae49b2" && (<img src="static/imgs/MobileWeb.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "5db0022cf87fdec084ae49af" && (<img src="static/imgs/Desktop.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "5db0022cf87fdec084ae49b7" && (<img src="static/imgs/WebService.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "5db0022cf87fdec084ae49b4" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="20" width='18' />)}
                {project.appType === "5db0022cf87fdec084ae49b3" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="18" width='15' />)}
                {project.appType === "5db0022cf87fdec084ae49b0" && (<img src="static/imgs/Mainframes.svg" alt="Mobile App Icon" height="18" width='18' />)}
                {project.appType === "5db0022cf87fdec084ae49b1" && (<img src="static/imgs/MobileApps.svg" alt="Mobile App Icon" height="20" />)}
                <h2 className="projectInside" title={project.projectName + "\n" + project.modifiedDate + " by " + project.modifiedName}>{project.projectName}</h2>
                <h2 className="projectInsideLast" >{project.modifiedDate} by {project.modifiedName}</h2>
              </button>
            </div>))}
        </div>
      </Panel>
    </>
  );
};
export default DisplayProject;

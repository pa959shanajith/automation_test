import React, { useEffect, useState, useRef } from "react";
import "../styles/DisplayProject.scss";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import CreateProject from "../components/CreateProject";
import { Menu } from "primereact/menu";
import { Tooltip } from 'primereact/tooltip';
import { fetchProjects } from "../api"
import { useSelector, useDispatch } from 'react-redux';
import { getStep } from './VerticalComponentsSlice';
import { loadUserInfoActions } from '../LandingSlice';
const moment = require('moment');


const DisplayProject = (props) => {
  const [visible, setVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const [defaultProject, setDefaultProject] = useState(null);
  const [projectsDetails, setProjectsDetails] = useState([]);
  const [getProjectLists, setProjectList] = useState([]);
  const [selectedsortItems, setSelectedsortItems] = useState(null)
 
  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if(!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo ;
  
  const createdProject = useSelector((state) => state.landing.savedNewProject);
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow)
  const [cardPosition, setCardPosition] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  // const defaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  const dispatch = useDispatch();
  const imageRefadd = useRef(null);
  const menuRef = useRef(null);
  const sortButtonRef = useRef(null);


  const sortItems = [
    { label: "Last Modified", value: "dateCreated", command: () => sortByModified('Last Modified'), icon: selectedsortItems === 'Last Modified' ? 'pi pi-check' : '', },
    { label: "Date Created", value: "lastModified", icon: selectedsortItems === 'Date Created' ? 'pi pi-check' : '', command: () => sortByCreated('Date Created') },
    { label: "Alphabetical", value: "name", icon: selectedsortItems === 'Alphabetical' ? 'pi pi-check' : '', command: () => sortByName('Alphabetical') },
  ];

  const handleTooltipToggle = () => {
    const rect = imageRefadd.current.getBoundingClientRect();
    setCardPosition({ right: rect.right, left: rect.left, top: rect.top, bottom: rect.bottom });
    setShowTooltip(true);
  };

  const handleMouseLeave1 = () => {
    setShowTooltip(false);
  };

  const filteredProjects = getProjectLists.length > 0 ? getProjectLists.filter((project) =>
    project.projectName.toLowerCase().includes(searchProjectName.toLowerCase())
  ) : [];


  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
      setDefaultProjectId(filteredProjects[0].projectId);
    }
  }, []);


  const DateTimeFormat = (inputDate) => {
    // Provided date
    const providedDate = new Date(inputDate);

    // Current date
    const currentDate = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentDate - providedDate;

    // Calculate years, months, days, hours, and seconds
    const millisecondsInASecond = 1000;
    const millisecondsInAMinute = 60 * millisecondsInASecond;
    const millisecondsInAnHour = 60 * millisecondsInAMinute;
    const millisecondsInADay = 24 * millisecondsInAnHour;
    const millisecondsInAYear = 365 * millisecondsInADay;

    // const years = Math.floor(timeDifference / millisecondsInAYear);
    // const months = Math.floor((timeDifference % millisecondsInAYear) / (30 * millisecondsInADay)); // Assuming 30 days in a month for simplicity
    // const days = Math.floor((timeDifference % millisecondsInADay) / millisecondsInADay);
    // const hours = Math.floor((timeDifference % millisecondsInADay) / millisecondsInAnHour);
    // const minutes = Math.floor((timeDifference % millisecondsInAnHour) / millisecondsInAMinute);
    // const seconds = Math.floor((timeDifference % millisecondsInAMinute) / millisecondsInASecond);

    const date1 = moment(inputDate, 'ddd, DD MMM YYYY HH:mm:ss ZZ');
    const date2 = moment(new Date(), 'ddd MMM DD YYYY HH:mm:ss ZZ');

    //convert the difference to other units, such as seconds, minutes, hours, etc.
    const seconds = date2.diff(date1, 'seconds');
    const minutes = date2.diff(date1, 'minutes');
    const hours = date2.diff(date1, 'hours');
    const days = date2.diff(date1, 'days');
    const months = date2.diff(date1, 'months');
    const years = date2.diff(date1, 'years');

    let output="";
      if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes <= 0 && seconds >= 0) {
        output = "Created now";
      }
      else if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes >= 1) {
        output = `Last Edited ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      else if (years <= 0 && months <= 0 && days <= 0 && hours >= 1) {
        output = `Last Edited ${hours} hr${hours > 1 ? 's' : ''} ago`;
      }
      else if (years <= 0 && months <= 0 && days >=1) {
        output = `Last Edited ${days} day${days > 1 ? 's' : ''} ago`;
      }
      else if (years <= 0 && months >= 1) {
        output = `Last Edited ${months} month${months > 1 ? 's' : ''} ago`;
      }
      else {
        output = `Last Edited ${years} year${years > 1 ? 's' : ''} ago`;
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
          progressStep: element.progressStep,
          modifiedName: element.firstname,
          modifieDateProject: element.releases[0].modifiedon,
          modifiedDate: lastModified,
          createdDate: element.releases[0].createdon,
          appType: convertIdIntoNameOfAppType(element.type),
          projectId: element._id,
        }
      });
      const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
      const selectedProject = sortedProject.find(project => project.projectId === defaultProjectId);
    if (selectedProject) {
      localStorage.setItem('DefaultProject', JSON.stringify(selectedProject));
      dispatch(loadUserInfoActions.setDefaultProject(selectedProject));
    }
      setProjectList(sortedProject);
    })();
  }, [showGeniusDialog]);

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
            const modified_Date = element.releases[0].modifiedon;
            return (
              {
                key: index,
                projectName: element.name,
                progressStep: element.progressStep,
                modifiedName: element.firstname,
                modifiedDate: lastModified,
                modifieDateProject: modified_Date,
                createdDate: element.releases[0].createdon,
                appType: convertIdIntoNameOfAppType(element.type),
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
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    setProjectList(sortedProjects);
    setSelectedsortItems(item);
    setSortVisible(false);
  };
  
  const sortByModified = (item) => {
    const sortedProjects = [...getProjectLists].sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
    setProjectList(sortedProjects);
    setSelectedsortItems(item);
    setSortVisible(false);
  };

  const handleSearchProject = (event) => {
    setSearchProjectName(event.target.value);
  };


  const showSortMenu=()=> {
    setSortVisible(!sortVisible);
  }
  const handleClickOutside = (event) => {
    if (
      sortVisible &&
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      sortButtonRef.current &&
      !sortButtonRef.current.contains(event.target)
    ) {
      setSortVisible(false);
    }
  };

  const handleOpenDialog = () => {
    setVisible(true);
  };

  const handleCloseDialog = () => {
    setVisible(false);
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [sortVisible]);

  useEffect(() => {
    const selectedProject = filteredProjects.find(project => project.projectId === defaultProjectId);
    setDefaultProject(selectedProject);

    if (selectedProject) {
      localStorage.setItem('DefaultProject', JSON.stringify(selectedProject));
      dispatch(loadUserInfoActions.setDefaultProject(selectedProject));
    }
  }, [defaultProjectId]);


  useEffect(() => { if (getProjectLists && getProjectLists.length > 0) { setDefaultProjectId(getProjectLists[0].projectId); } }, [getProjectLists]);

  const allProjectTemplate = () => {
    return (
      <div className="Project_header">
        <Tooltip target=".add_btn" position="bottom" content="Create Project" />
        <Tooltip target=".sort_btn" position="bottom" content="Sort Projects" />

        <CreateProject visible={visible} onHide={handleCloseDialog} setProjectsDetails={setProjectsDetails} projectsDetails={projectsDetails} toastSuccess={props.toastSuccess} toastError={props.toastError}/>
        {sortVisible && (<div ref={menuRef}><Menu className="sort-Menu" setsortVisible={setSortVisible} model={sortItems} icon={selectedsortItems && 'pi pi-check'} id="sort_menu_color"/>
        </div>)}
        <div className="flex flex-row All_Project">
          <div className="All_Project_font" >ALL PROJECTS</div>
          <div className="add_sort_btn">
            <button className="pi pi-sort-amount-down sort_btn" onClick={showSortMenu} ref={sortButtonRef}/>
            {userInfo && userInfo.rolename === "Quality Manager" ? (
              <button className="pi pi-plus add_btn" onClick={handleOpenDialog} />
            ) : null}

          </div>
        </div>
      </div>
    )
  };


  useEffect(() => {
    dispatch(getStep(defaultProjectId));
  }, [defaultProjectId])
  
  // const apptypeID =()=>{
  //     getProjectLists.map((apptype)=> apptype.appType)
  // };

  const convertIdIntoNameOfAppType = (apptypeID) => {
    switch (apptypeID) {
      case "5db0022cf87fdec084ae49b6":
        return "Web";
      case "5db0022cf87fdec084ae49b2":
        return "MobileWeb";
      case "5db0022cf87fdec084ae49af":
        return "Desktop";
      case "5db0022cf87fdec084ae49b7":
        return "Webservice";
      case "5db0022cf87fdec084ae49b4":
        return "SAP";
      case "5db0022cf87fdec084ae49b3":
        return "OEBS";
      case "5db0022cf87fdec084ae49b0":
        return "Mainframe";
      case "5db0022cf87fdec084ae49b1":
        return "MobileApp";
      case "5db0022cf87fdec084ae49b5":
        return "System";
      default:
        return "";
    }
}
  //  const appName = convertIdIntoNameOfAppType();
  //  console.log(appName);
  //  console.log(convertIdIntoNameOfAppType);
  return (
    <>
      <Panel className="Project_Display" headerTemplate={allProjectTemplate} >
        <div className="p-input-icon-left Project-search ">
          <i className="pi pi-search" />
          <InputText className="Search_name" placeholder="Search" value={searchProjectName} onChange={handleSearchProject} title=" Search all projects." />
        </div>
        <div className="project-list project">
          {filteredProjects.map((project) => (
            <div title={project.projectName + "\n" + project.modifiedDate + " by " + project.modifiedName} key={project.projectId} >
              <button
                className={project.projectId === defaultProjectId ? 'default-project project-card' : 'project-card'}
                onClick={() => {
                  if (project.projectId !== defaultProjectId) {
                    setDefaultProjectId(project.projectId);
                  }
                }}>
                <div className="Project_Display_Nav">
                <div className="ProjectApp_Name">
                {project.appType === "Web" && (<img src="static/imgs/Web.svg" alt="Web App Icon" height="20" />)}
                {project.appType === "MobileWeb" && (<img src="static/imgs/MobileWeb.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "Desktop" && (<img src="static/imgs/Desktop.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "Webservice" && (<img src="static/imgs/WebService.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "SAP" && (<img src="static/imgs/SAP.svg" alt="Mobile App Icon" height="20" width='18' />)}
                {project.appType === "OEBS" && (<img src="static/imgs/OEBS.svg" alt="Mobile App Icon" height="18" width='20' />)}
                {project.appType === "Mainframe" && (<img src="static/imgs/Mainframes.svg" alt="Mobile App Icon" height="18" width='20' />)}
                {project.appType === "MobileApp" && (<img src="static/imgs/MobileApps.svg" alt="Mobile App Icon" height="20" />)}
                {project.appType === "System" && (<img src="static/imgs/System_application.svg" alt="Mobile App Icon" height="20"/>)}
                <div className="Project_name">
                <p id="projectInside">{project.projectName}</p>
                </div>
                </div>
                <div className="projectInsideLast">
                <p id="Last_modifie">{project.modifiedDate} by {project.modifiedName}</p>
                </div>
                </div>
              </button>
            </div>))}
        </div>
      </Panel>
    </>
  );
};
export default DisplayProject;

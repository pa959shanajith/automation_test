import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetch_git_exp_details } from '../../admin/api';
import { fetchProjects } from "../../landing/api";
import { importGitMindmap } from '../api';
import { Button } from 'primereact/button';
import { Toast } from "primereact/toast";
import { Dropdown } from 'primereact/dropdown';
import 'primeicons/primeicons.css';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import { getModules, getScreens, updateTestSuiteInUseBy } from '../api';
import { screenData, moduleList, selectedModuleReducer, selectedProj, selectedModulelist, dontShowFirstModule } from '../designSlice'
import CreateProject from '../../landing/components/CreateProject';
import { convertIdIntoNameOfAppType } from "../../design/components/UtilFunctions";
import { ResetSession, Messages as MSG } from '../../global';
const moment = require('moment');

const GitVersionHistory = (props) => {

  const [data, setData] = useState([]);
  const [modlist, setModList] = useState(moduleListed);
  const [blockui, setBlockui] = useState({ show: false });
  const [isCreateProjectVisible, setCreateProjectVisible] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [visible, setVisible] = useState(true);
  const [projectsDetails, setProjectsDetails] = useState([]);
  const [getProjectLists, setProjectList] = useState([]);
  const [searchProjectName, setSearchProjectName] = useState("");
  const [sourceProjectId, setSourceProjectId] = useState(null);
  const [desProjectId, setDesProjectId] = useState(null);
  const [hasTestsuite, setHasTestsuite] = useState(false);
  const [importPop, setImportPop] = useState(false);
  const [error, setError] = useState('')
  const dispatch = useDispatch();
  const toast = useRef(null);
  const moduleListed = useSelector(state => state.design.moduleList);
  const initProj = useSelector(state => state.design.selectedProj);
  let userInfo1 = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo);
  const prjList = useSelector(state => state.design.projectList);
  const showGeniusDialog = useSelector((state) => state.progressbar.showGenuisWindow);
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const userInfo = userInfo1 || userInfoFromRedux;
  const [versionname, setVersionname] = useState("");
  // if(!userInfo) userInfo = userInfoFromRedux; 
  // else userInfo = userInfo ;
  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  if (localStorageDefaultProject) {
    dispatch(selectedProj(JSON.parse(localStorageDefaultProject).projectId));
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
          projectLevelRole: element?.projectlevelrole?.assignedrole ?? ""
        }
      });
      const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
      const selectedProject = sortedProject.find(project => project.projectId === defaultProjectId);
      if (selectedProject) {
        localStorage.setItem('DefaultProject', JSON.stringify(selectedProject));
        dispatch(loadUserInfoActions.setDefaultProject(selectedProject));
      }
      if (!showGeniusDialog) {
        setProjectList(sortedProject);
      }
    })();
  }, [showGeniusDialog]);
  const filteredProjects = getProjectLists.length > 0 ? getProjectLists.filter((project) =>
    project.projectName.toLowerCase().includes(searchProjectName.toLowerCase())
  ) : [];

  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
      setDefaultProjectId(filteredProjects[0].projectId);
    }
  }, []);

  const DateTimeFormat = (inputDate) => {
    const providedDate = new Date(inputDate);
    const currentDate = new Date();
    const millisecondsInASecond = 1000;
    const millisecondsInAMinute = 60 * millisecondsInASecond;
    const millisecondsInAnHour = 60 * millisecondsInAMinute;
    const millisecondsInADay = 24 * millisecondsInAnHour;
    const millisecondsInAYear = 365 * millisecondsInADay;
    const date1 = moment(providedDate, 'ddd, DD MMM YYYY HH:mm:ss ZZ');
    const date2 = moment(new Date(), 'ddd MMM DD YYYY HH:mm:ss ZZ');

    //convert t to units, such as seconds, minutes, hours, etc.
    const seconds = date2.diff(date1, 'seconds');
    const minutes = date2.diff(date1, 'minutes');
    const hours = date2.diff(date1, 'hours');
    const days = date2.diff(date1, 'days');
    const months = date2.diff(date1, 'months');
    const years = date2.diff(date1, 'years');

    let output = "";
    if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes <= 0) {
      output = "Created now";
    }
    else if (years <= 0 && months <= 0 && days <= 0 && hours <= 0 && minutes >= 1) {
      output = `Last Edited ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    else if (years <= 0 && months <= 0 && days <= 0 && hours >= 1) {
      output = `Last Edited ${hours} hr${hours > 1 ? 's' : ''} ago`;
    }
    else if (years <= 0 && months <= 0 && days >= 1) {
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
    const fetchData = async () => {
      try {
        const jsonData = await fetch_git_exp_details(props.projectId);
        setVersionname(jsonData[0].version);
        const mappedData = jsonData.map((item, index) => ({
          sno: index + 1,
          version: item.version,
          datetime: item.modifiedon,
          Comments: item.commitmessage,
          Status: item.gittask,
          SelectDestination: (
            <React.Fragment>
              <div className='desination_cls'>
                <Dropdown
                  data-test="projectSelect"
                  className='projectSelect'
                  value={initProj}
                  options={projectList.map(e => ({ label: e[1].name, value: e[1].id }))}
                  onChange={(e) => handleProjectSelecte(e.value)}
                  placeholder="Select a Project"
                  panelFooterTemplate={panelFooterTemplate}
                  itemTemplate={customItemTemplate}
                />
                <Button
                  data-test="git-restore"
                  label="Restore"
                  title="restore"
                  onClick={() => handleRestore()}
                  className='restore_cls'
                 //disabled={isButtonDisabled}
                />
              </div>
            </React.Fragment>
          ),
        }));
        setData(mappedData);
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error Message',
          detail: ' Please select a Project which has no test suite.',
        });
      }
    };
    fetchData();
  }, [props.projectId]);

  const panelFooterTemplate = () => {
    return (
      <div className="py-2 px-3">
        <Button label="create a project" icon="pi pi-plus" size="small" onClick={openGeniusDialogue} />
      </div>
    );
  };
  const openGeniusDialogue = () => {
    setCreateProjectVisible(true);
    setVisible(true);
  }
  const displayError = (error) => {
    toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 2000 })
  }
  const columns = [
    { field: 'sno', header: 'Sno' },
    { field: 'version', header: 'Version' },
    { field: 'datetime', header: 'datetime' },
    { field: 'Comments', header: 'Comments' },
    { field: 'Status', header: 'Status' },
    { field: 'SelectDestination', header: 'SelectDestination' }
  ];

  const handleRestore = async () => {
    console.log("sourceProjectId@@",sourceProjectId)
    console.log("desProjectId@@",desProjectId)
    var data = await importGitMindmap({
      "appType": props.appType,
      "expProj": sourceProjectId,
      "gitVersion": versionname,
      "projectId": desProjectId,
      "projectName": props.projectName
    });
    if (data.error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
      ; return;
    }
    else if (data === "InProgress") { Toast.current.show({ severity: 'warn', summary: 'Warning', detail: MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); return; }
    else if (data === "dupMod") { Toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); return; }
    else if (data === "dupSce") { Toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); return; }
    else if (data === "appType") { Toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DIFF_APP_TYPE.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); return; }
    else toast.current.show({ severity: 'success', summary: 'Success', detail: ' testsuites Restored sucessfully  ', life: 3000 });

    var req = {
      "tab": "tabCreate",
      "projectid": desProjectId,
      "moduleid": null,
      "query": "modLength"
    };
    var res = await getModules(req);
    var Screen = await getScreens(desProjectId);

    if (Screen.error) {
      displayError(Screen.error);
      ResetSession.end();
      return;
    }
    setTimeout(function () {
      dispatch(moduleList(res));
      setImportPop(false);
    }, 100);

    if (res.error) {
      displayError(res.error.CONTENT);
      ResetSession.end();
      return;
    }
    var importData = res;
    setBlockui({ show: false });
  };

  var projectList = Object.entries(prjList)
  const handleProjectSelecte = async (proj) => {
    console.log("setSourceProjectId",initProj)
    setSourceProjectId(initProj);
    var reqForOldModule = {
      tab: "createTab",
      projectid: initProj,
      version: 0,
      cycId: null,
      modName: "",
      moduleid: localStorage.getItem('OldModuleForReset')
    }
    var moduledataold = await getModules(reqForOldModule)
    if (userInfo?.username === moduledataold.currentlyInUse) {
      await updateTestSuiteInUseBy("Web", localStorage.getItem('OldModuleForReset'), localStorage.getItem('OldModuleForReset'), userInfo?.username, false, true)
    }
    var reqForNewModule = {
      "tab": "tabCreate", "projectid": proj, "moduleid": null, "query": "modLength"
    }
    var firstModld = await getModules(reqForNewModule)
    if (firstModld.length > 0) {
           toast.current.show({
        severity: 'error',
        summary: 'Error Message',
        detail: '  Project which has no test suite.',
      });
      //setDesProjectId(proj)
        setIsButtonDisabled(true);

      //      var reqForFirstModule = {
      //   tab: "createTab",
      //   projectid: proj,
      //   version: 0,
      //   cycId: null,
      //   modName: "",
      //   moduleid: firstModld[0]?._id
      // }
      // var firstModDetails = await getModules(reqForFirstModule)
      // if (!firstModDetails.currentlyInUse.length > 0) {
      //   await updateTestSuiteInUseBy("Web", firstModld[0]._id, "123", userInfo?.username, true, false)
      //   setHasTestsuite(true)
      //   setIsButtonDisabled(false);
      // } else {
      //   setHasTestsuite(false);
      // }
    }
    else {
      setIsButtonDisabled(false);
     // setDesProjectId(proj)
    }
     setDesProjectId(proj)
     console.log("setDesProjectIdpppppp",proj);
  // selectProj(proj)
  }
  const customItemTemplate = (option) => {
    const icon = hasTestsuite ? <img src="static/imgs/Testsuite.svg" alt="Testsuite" /> : <img src="static/imgs/NoTestsuite.svg" alt="NoTestsuite" />;
    return (
      <div className="custom-dropdown-item">
        {icon}
        <span className="project-name">{option.label}</span>
      </div>
    );
  };

  const selectProj = async (proj) => {
    setBlockui({ show: true, content: 'Loading Modules ...' })
    dispatch(dontShowFirstModule(false))
    dispatch(selectedProj(proj))
    const defaultProjectData = {
      ...(JSON.parse(localStorageDefaultProject)),
      projectId: proj,
      projectName: prjList[proj]?.name,
      appType: prjList[proj]?.apptypeName,
      projectLevelRole: prjList[proj]?.projectLevelRole
    };

    localStorage.setItem("DefaultProject", JSON.stringify(defaultProjectData));
    dispatch(moduleList([]))
    dispatch(selectedModuleReducer({}))
    var moduledata = await getModules({ "tab": "endToend", "projectid": proj, "moduleid": null })
    if (moduledata.error) { displayError(moduledata.error); return; }
    var screendata = await getScreens(proj)
    if (screendata.error) { displayError(screendata.error); return; }
    setModList(moduledata)
    dispatch(moduleList(moduledata))
    dispatch(selectedModulelist([]))
    dispatch(screenData(screendata));
    if (screendata) dispatch(screenData(screendata))
    // if(SearchInp){
    //     SearchInp.current.value = ""
    // }
    setBlockui({ show: false })
  }

  const handleCloseDialog = () => {
    setVisible(false);
  };
  return (
    <div className="import_cls">
      <DataTable value={data}>
        {columns.map((col, i) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
      </DataTable>
      <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
      {isCreateProjectVisible && <div>
        <CreateProject visible={visible} onHide={handleCloseDialog} setProjectsDetails={setProjectsDetails} projectsDetails={projectsDetails} toastSuccess={props.toastSuccess} toastError={props.toastError} />
      </div>}
    </div>
  );
};

export default GitVersionHistory;

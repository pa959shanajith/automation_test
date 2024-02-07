import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetch_git_exp_details } from '../../design/api';
import { fetchProjects } from "../../landing/api";
import { importGitMindmap } from '../api';
import { Button } from 'primereact/button';
import { Toast } from "primereact/toast";
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { getModules, getScreens, updateTestSuiteInUseBy } from '../api';
import { screenData, moduleList, selectedModuleReducer, selectedProj } from '../designSlice'
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
  const [sourceProjectId, setSourceProjectId] = useState('');
  const [desProjectId, setDesProjectId] = useState('');
  const [hasTestsuite, setHasTestsuite] = useState(false);
  const dispatch = useDispatch();
  const toast = useRef(null);
  const moduleListed = useSelector(state => state.design.moduleList);
  const initProj = useSelector(state => state.design.selectedProj);
  let userInfo1 = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo);
  const prjList = useSelector(state => state.design.projectList);
  const [defaultProjectId, setDefaultProjectId] = useState(null);
  const userInfo = userInfo1 || userInfoFromRedux;
  const [versionname, setVersionname] = useState("");
  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  const [projectListDropdown, setProjectListDropdown] = useState([]);
  const [allProjectlist, setAllProjectlist] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [restorebtnDisable, setRestorebtnDisable] = useState(true);
  if (localStorageDefaultProject) {
    dispatch(selectedProj(JSON.parse(localStorageDefaultProject).projectId));
  }

  const columns = [
    { field: 'sno', header: 'Sno' },
    { field: 'version', header: 'Version' },
    { field: 'datetime', header: 'datetime' },
    { field: 'comments', header: 'Comments' },
    { field: 'status', header: 'status' },
  ];

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
    (async () => {
      const projectList = await fetchProjects({ readme: "projects" });
      setProjectsDetails(projectList);
      const projectListForDropdown = [];
      const arrayNew = projectList.map((element, index) => {
        const lastModified = DateTimeFormat(element.releases[0].modifiedon);
        projectListForDropdown.push({ "name": element.name, "id": element._id })
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
      setProjectListDropdown(projectListForDropdown);
      const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
      setAllProjectlist(sortedProject);
      console.log("sortedProject", sortedProject);
    })();
  }, []);

  const filteredProjects = getProjectLists.length > 0 ? getProjectLists.filter((project) =>
    project.projectName.toLowerCase().includes(searchProjectName.toLowerCase())
  ) : [];

  useEffect(() => {
    if (filteredProjects && filteredProjects.length > 0) {
      setDefaultProjectId(filteredProjects[0].projectId);
    }
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData = await fetch_git_exp_details(props.projectId);
        setVersionname(jsonData[0].version);
        const mappedData = jsonData.map((item, index) => ({
          key: index,
          sno: index + 1,
          version: item.version,
          datetime: item.modifiedon,
          comments: item.commitmessage,
          status: item.gittask,
          selectedProject: {},
        }));
        setData(mappedData);
        setDataLoading(false);
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Error Message',
          detail: ' Please select a Project which has no test suite.',
        });
        setDataLoading(false);
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

  const handleRestore = (rowdata) => {
    (async () => {
      try {
        var reqForNewModule = {
          "tab": "tabCreate", "projectid": rowdata.selectedProject.id, "moduleid": null, "query": "modLength"
        }
        var firstModld = await getModules(reqForNewModule)
        if (firstModld.length > 0) {
          toast.current.show({
            severity: 'error',
            summary: 'Error Message',
            detail: 'Please select a Project which has no test suite.',
          });
          setIsButtonDisabled(true);
        }
        else {
          setRestorebtnDisable(true);
          let rowSelectedProject = allProjectlist.find(projectdetails => {
            if (projectdetails.projectId === rowdata.selectedProject.id) {
              return projectdetails
            }
          })
          ResetSession.start();
          let data = await importGitMindmap({
            "appType": rowSelectedProject.appType,
            "expProj": sourceProjectId,
            "gitVersion": rowdata.version,
            "projectId": rowdata.selectedProject.id,
            "projectName": rowdata.selectedProject.name
          });
          if (data.error) {
            // toast.current.show({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
            if (data.error === "No entries") {
              displayError(data.error); ResetSession.end();
              return;
            }
            else {
              displayError(data.error.CONTENT);
            }
            ResetSession.end();
            return;
          }
          else if (data === "InProgress") { toast.current.show({ severity: 'warn', summary: 'Warning', detail: MSG.MINDMAP.WARN_IMPORT_INPROGRESS.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); setRestorebtnDisable(false); return; }
          else if (data === "dupMod") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_MOD_DATA.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); setRestorebtnDisable(false); return; }
          else if (data === "dupSce") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DUPLI_ZIP_SCE_DATA.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); setRestorebtnDisable(false); return; }
          else if (data === "appType") { toast.current.show({ severity: 'error', summary: 'Error', detail: MSG.MINDMAP.ERR_DIFF_APP_TYPE.CONTENT, life: 2000 }); setBlockui({ show: false, content: '' }); ResetSession.end(); setRestorebtnDisable(false); return; }

          var req = {
            "tab": "tabCreate",
            "projectid": rowdata.selectedProject.id,
            "moduleid": null,
            "query": "modLength"
          };
          var res = await getModules(req);
          var Screen = await getScreens(rowdata.selectedProject.id);

          if (Screen.error) {
            displayError(Screen.error);
            ResetSession.end();
            return;
          }
          if (res.error) {
            displayError(res.error.CONTENT);
            ResetSession.end();
            return;
          }
          toast.current.show({ severity: 'success', summary: 'Success', detail: ' Testsuites Restored sucessfully  ', life: 3000 });
          setRestorebtnDisable(false);
          setBlockui({ show: false });
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })()
  };

  const handleProjectSelect = (proj, rowData) => {
    let rowdatacopy = { ...rowData }
    rowdatacopy.selectedProject = proj;
    let newRowData = [];
    setSourceProjectId(initProj);
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === rowData.key) {
        newRowData.push(rowdatacopy);
      } else {
        newRowData.push(data[i]);
      }
    }
    (async () => {
      try {
        var reqForNewModule = {
          "tab": "tabCreate", "projectid": proj.id, "moduleid": null, "query": "modLength"
        }
        var firstModld = await getModules(reqForNewModule)
        if (firstModld.length > 0) {
          toast.current.show({
            severity: 'error',
            summary: 'Error Message',
            detail: 'Please select a Project which has no test suite.',
          });
          setIsButtonDisabled(true);
        }
        else {
          setRestorebtnDisable(false);
          setDesProjectId(proj);
          setIsButtonDisabled(false);
          setData(newRowData);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })()

  }

  const handleCloseDialog = () => {
    setVisible(false);
  };

  const customItemTemplate = (option) => {
    const icon = hasTestsuite ? <img src="static/imgs/Testsuite.svg" alt="Testsuite" /> : <img src="static/imgs/NoTestsuite.svg" alt="NoTestsuite" />;
    return (<>
      <div className={`git-config-custom-dropdown-item`}>
        {icon}
        <Tooltip target={`.project-name${option.name}`} content={option.name} position='bottom-center' />
        <span className={`project-name${option.name}`}>{option.name}</span>
      </div>
    </>

    );
  };

  const bodyTemplate = (rowData) => {
    return (<React.Fragment>
      <div className='desination_cls'>
        <Dropdown
          filter
          data-test="projectSelect"
          className='projectSelect'
          value={rowData.selectedProject}
          options={projectListDropdown}
          onChange={(e) => handleProjectSelect(e.value, rowData)}
          placeholder="Select a Project"
          panelFooterTemplate={panelFooterTemplate}
          itemTemplate={customItemTemplate}
          optionLabel="name"
        />
        <Button
          data-test="git-restore"
          label="Restore"
          title="restore"
          onClick={() => handleRestore(rowData)}
          className='restore_cls'
          disabled={restorebtnDisable}
        />
      </div>
    </React.Fragment>)
  }
  return (
    <div className="import_cls">
      <DataTable value={data}
        loading={dataLoading}
        size={"Normal"}
        emptyMessage={"No results found"}
        showGridlines
        scrollable
        scrollHeight="383px"
        virtualScrollerOptions={{ itemSize: 46 }}  >
        {columns.map((col, i) => (
          <Column key={col.field} field={col.field} header={col.header} />
        ))}
        <Column field="Actions" body={bodyTemplate} />
      </DataTable>
      <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
      {isCreateProjectVisible && <div>
        <CreateProject visible={visible} onHide={handleCloseDialog} setProjectsDetails={setProjectsDetails} projectsDetails={projectsDetails} toastSuccess={props.toastSuccess} toastError={props.toastError} />
      </div>}
    </div>
  );
};

export default GitVersionHistory;

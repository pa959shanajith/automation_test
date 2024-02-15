import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import '../styles/GitDropdown.scss';
import { gitSaveConfig, gitEditConfig } from '../../admin/api';
import { useDispatch, useSelector } from 'react-redux';
import { Toast } from "primereact/toast";
import GitCommit from './GitCommit';
import GitVersionHistory from './GitVersionHistory';
import { exportToGit, checkExportVer, getProjectList, getScreens, getModules } from '../api';
import { Messages as MSG, ResetSession, VARIANT, ScreenOverlay } from '../../global';
import { isCreateProjectVisible, projectList, moduleList, screenData } from '../designSlice';
import GitConfigurationForm from './GitConfigurationForm';
import { convertIdIntoNameOfAppType } from "../../design/components/UtilFunctions";
import CreateProject from '../../landing/components/CreateProject';
import { fetchProjects } from "../../landing/api";
import { parseProjList } from '../containers/MindmapUtils';

const GitDropdown = (props) => {
  const dropdownOptions = [
    { label: 'Commit', value: 'commit', icon: <img src="static/imgs/Commit_icon.svg" alt="commit Icon" style={{ marginRight: '1rem' }} /> },
    { label: 'Version History', value: 'version_history', icon: <img src="static/imgs/Version_icon.svg" alt="Version History" style={{ marginRight: '1rem' }} /> },
  ];
  // const toast = useRef();
  const [showToken, setShowToken] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [commitMsg, setCommitMsg] = useState('');
  const [commitID, setCommitID] = useState('');
  const [commitModuleList, setCommitModuleList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const moduleLists = useSelector(state => state.design.moduleList)
  const CreateProjectVisible = useSelector(state => state.design.isCreateProjectVisible);
  const toast = useRef(null);
  const userRef = useRef();
  const domainRef = useRef();
  const ProjectRef = useRef();
  const gitconfigRef = useRef();
  const tokenRef = useRef();
  const urlRef = useRef();
  const gituserRef = useRef();
  const gitemailRef = useRef();
  const gitbranchRef = useRef();
  const dispatch = useDispatch();
  const [isData, setIsData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [visibleGitconfFormAfterCreatePrj, setVisibleGitconfFormAfterCreatePrj] = useState(false)
  const [projectListDropdown, setProjectListDropdown] = useState([]);
  const [allProjectlist, setAllProjectlist] = useState([]);
  const [projectListForCreateProject, setProjectListForCreateProject] = useState([]);
  const projectName = useRef();
  const [createdProjectDetails, setCreatedProjectDetails] = useState({})
  const [projectlistRefresher, setProjectlistRefresher ] = useState(false);

  useEffect(() => {
    (async () => {
      const projectList = await fetchProjects({ readme: "projects" });
      setProjectListForCreateProject(projectList);
      const projectListForDropdown = [];
      const arrayNew = projectList.map((element, index) => {
        if (projectName.current === element.name) setCreatedProjectDetails(element);
        // const lastModified = DateTimeFormat(element.releases[0].modifiedon);
        projectListForDropdown.push({ "name": element.name, "id": element._id })
        return {
          key: index,
          projectName: element.name,
          progressStep: element.progressStep,
          modifiedName: element.firstname,
          modifieDateProject: element.releases[0].modifiedon,
          // modifiedDate: lastModified,
          createdDate: element.releases[0].createdon,
          appType: convertIdIntoNameOfAppType(element.type),
          projectId: element._id,
          projectLevelRole: element?.projectlevelrole?.assignedrole ?? ""
        }
      });
      setProjectListDropdown(projectListForDropdown);
      const sortedProject = arrayNew.sort((a, b) => new Date(b.modifieDateProject) - new Date(a.modifieDateProject));
      setAllProjectlist(sortedProject);
    })();
  }, [visibleGitconfFormAfterCreatePrj === false]);


  const projectListUpdateHandler = async () => {
    // setBlockui({ show: true, content: 'Loading modules ...' })
    var res = await getProjectList()
    if (res.error) { props.toastError(res.error); return; }
    var data = parseProjList(res)
    dispatch(projectList(data))
    // if (!importRedirect) {
    // dispatch(selectedProj(props.projectId))
    var req = {
      tab: "endToend" || "tabCreate",
      projectid: props.projectId,
      version: 0,
      cycId: null,
      modName: "",
      moduleid: null
    }
    var moduledata = await getModules(req);
    if (moduledata.error) { props.toastError(moduledata.error); return; }
    var screendata = await getScreens(props.projectId)
    if (screendata.error) { props.toastError(screendata.error); return; }
    dispatch(screenData(screendata))
    dispatch(moduleList(moduledata))
    // }
    // setBlockui({ show: false, content: '' })
    // setLoading(false)
  }

  const editConfig = async () => {
    const data = await gitEditConfig(props.userId, props.projectId);
    if (data.error) { props.toastError(data.error); return; }
    else if (data == "empty") {
      // props.toastWarn(MSG.ADMIN.WARN_NO_CONFIG)
    }
    else {
      setIsData(true)
      gitconfigRef.current.value = data[0];
      gitconfigRef.current.readOnly = true;
      tokenRef.current.value = data[1];
      urlRef.current.value = data[2];
      gituserRef.current.value = data[3];
      gitemailRef.current.value = data[4];
      gitbranchRef.current.value = data[5];
    }
  }

  const setProjectNamehandler = (value) => {
    projectName.current = value;
  }
  const commitIdChange = (value) => {
    setCommitID(value);
  }
  const handleToggleToken = () => {
    setShowToken(!showToken);
  };
  const versionChange = (value) => {
    setVersionName(value);
  }
  const commitMsgChange = (value) => {
    setCommitMsg(value);
  }
  const moduleListChange = (value) => {
    setCommitModuleList(value);
  }
  const handleDropdownChange = (event, value) => {
    setSelectedImage(event.value);
    setDialogVisible(true);
  }
  function clickhandler() {
    setDialogVisible(true);
    editConfig();
  }
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 5000 });
  };
  const gitReset = () => {
    gitconfigRef.current.value = "";
    tokenRef.current.value = "";
    urlRef.current.value = "";
    gituserRef.current.value = "";
    gitemailRef.current.value = "";
    gitbranchRef.current.value = "";
  }

  const gitConfigAction = async (action) => {
    try {
      if (!gitValidate(action, userRef, domainRef, ProjectRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef)) return;
      setLoading("Loading...");
      const data = await gitSaveConfig(action, props.userId, visibleGitconfFormAfterCreatePrj ? createdProjectDetails._id : props.projectId, gitconfigRef.current.value.trim(), tokenRef.current.value.trim(), urlRef.current.value.trim(), gituserRef.current.value.trim(), gitemailRef.current.value.trim(), gitbranchRef.current.value.trim());
      if (data.error) { props.toastError(data.error); return; }
      else if (data === 'GitConfig exists') props.toastWarn(MSG.ADMIN.WARN_GITCONFIG_EXIST);
      else if (data === 'GitUser exists') props.toastWarn(MSG.ADMIN.WARN_GIT_PROJECT_CONFIGURED);
      else {
        props.toastSuccess(MSG.CUSTOM("Git configuration " + action + "d successfully", VARIANT.SUCCESS));
      }
      visibleGitconfFormAfterCreatePrj ? setVisibleGitconfFormAfterCreatePrj(false) : setDialogVisible(false);
      setDropdownVisible(true);

    } catch (error) {
      showToast('error', 'Error', `Error in integration with Git. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const commitAndPushOnClick = async () => {
    setLoading(true);
    try {
      const exportVer = await checkExportVer({ "exportname": "exportname", "query": "exportgit", "projectId": props.projectId })
      if (exportVer.includes(versionName)) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: "Version is already used, Please provide a unique version", life: 3000 }); return;
      }
      else {
        ResetSession.start();
        var res = await exportToGit({
          gitVersion: versionName,
          mindmapId: commitModuleList,
          "exportProjAppType": props.appType,
          "projectId": props.projectId,
          "projectName": props.projectName,
          gitComMsgRef: commitMsg
        });
        if (res.error) { props.toastError(res.error); return; }
        else {
          toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'Test Suite committed successfully' });
          setDialogVisible(false);
          setSelectedImage("")
          setCommitModuleList([]);
        }
      }

    } catch (error) {
      console.error("Error:", error);
      props.toastError("An error occurred during commit.", res.error);
    } finally {
      setLoading(false);
      ResetSession.end();
    }
  };


  const dialogFooter = () => (
    <div> {isData ?
      <>
        <Button data-test="git_reset" label='reset' title="reset" onClick={() => gitReset()} />
        <Button data-test="git_create" label='save' onClick={() => gitConfigAction('create')} className="btn-edit" title="Create" />
      </> : <>
        <Button data-test="git_create" label='Create' onClick={() => gitConfigAction('create')} className="btn-edit" title="Create" />

      </>
    }</div>
  );
  const commitFooter = () => (
    <Button label={loading ? "Committing..." : "Commit & Push"} size="small" onClick={commitAndPushOnClick} disabled={loading} />
  )

  const renderIcon = (icon) => {
    if (typeof icon === 'string' && icon.startsWith('<')) {
      return <div dangerouslySetInnerHTML={{ __html: icon }} />;
    } else if (typeof icon === 'object' && React.isValidElement(icon)) {
      return icon;
    }
    return null;
  };

  const createProjectCloseDialogHandler = () => {
    dispatch(isCreateProjectVisible(false));
    setVisibleGitconfFormAfterCreatePrj(true);
    setIsData(false);
    setProjectlistRefresher(true);
  }

  const DialogCloseHandle = () => {
    setDialogVisible(false);
    setCreatedProjectDetails({});
    setSelectedImage(null);
    if (isData) setDropdownVisible(true);
    if(projectlistRefresher) {
      projectListUpdateHandler()
      setProjectlistRefresher(false);
    }
  }
  return (
    <div className='GitVersion_cls'>
      {moduleLists?.length > 0 ?
        <>
          {dropdownVisible ? <Dropdown
            value={selectedImage}
            options={dropdownOptions}
            onChange={handleDropdownChange}
            className='p-inputtext-sm'
            optionLabel="label"
            style={{ height: '2rem', display: "flex", alignItems: "center" }}
            placeholder={"Select"}
          // itemTemplate={(option) => (
          //   <div>
          //     {renderIcon(option.icon)}
          //     {option.label}
          //   </div>
          // )}
          />
            : <div onClick={clickhandler} style={{ width: "6rem" }}> <span className='git_icon_and_icon'><img src="static/imgs/GitIcon.svg" style={{ height: "1.2rem", width: "2rem" }} alt="Git Icon" className="dropdown-image" /> Git </span></div>} </> : null
      }

      <Toast ref={toast} position="bottom-center" />
      <Dialog
        header={selectedImage === 'commit' ? 'Git Commit Configuration' : selectedImage === 'version_history' ? 'Version History' : 'Git Configurations'}
        visible={dialogVisible}
        style={selectedImage === 'commit' ? { width: "50vw", height: '85vh' } : { width: "58vw", height: '85vh' }}
        onHide={DialogCloseHandle}
        footer={selectedImage === 'commit' ? commitFooter : selectedImage === 'version_history' ? ' ' : dialogFooter}
        className='gitVersion_dialog  Git-config_cls'
      >
        {(selectedImage !== "commit" && selectedImage !== "version_history") &&
          <GitConfigurationForm
            gitconfigRef={gitconfigRef}
            tokenRef={tokenRef}
            urlRef={urlRef}
            gituserRef={gituserRef}
            gitemailRef={gitemailRef}
            gitbranchRef={gitbranchRef}
          />}
        {selectedImage === 'commit' ? (
          <GitCommit
            commitMsg={commitMsg}
            versionName={versionName}
            commitMsgChange={commitMsgChange}
            commitId={commitIdChange}
            versionChange={versionChange}
            moduleListChange={moduleListChange}
          />
        ) : selectedImage === 'version_history' ? (
          <GitVersionHistory {...props} commitId={commitID} setSelectedImage={setSelectedImage} allProjectlist={allProjectlist} projectListDropdown={projectListDropdown} />
        ) : null}
      </Dialog>

      {CreateProjectVisible && <div>
        <CreateProject setProjectName={setProjectNamehandler} visible={CreateProjectVisible} onHide={() => createProjectCloseDialogHandler()} projectsDetails={projectListForCreateProject} toastSuccess={props.toastSuccess} toastError={props.toastError} />
      </div>}
      <Dialog
        header={'Git Configurations'}
        visible={visibleGitconfFormAfterCreatePrj}
        style={{ width: "58vw", height: '85vh' }}
        onHide={() => { setVisibleGitconfFormAfterCreatePrj(false); setCreatedProjectDetails({}); }}
        footer={dialogFooter}
      >
        <div className='createProject_GitConfig'>
          <GitConfigurationForm
            gitconfigRef={gitconfigRef}
            tokenRef={tokenRef}
            urlRef={urlRef}
            gituserRef={gituserRef}
            gitemailRef={gitemailRef}
            gitbranchRef={gitbranchRef}
          />
        </div>
      </Dialog>
    </div>
  );
};
const gitValidate = (action, user, domain, Project, gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail, gitBranch) => {
  var flag = true;
  const errBorder = '2px solid red';
  var regExUrl = /^https:\/\//g;
  gitConfigName.current.style.outline = "";
  gitAccToken.current.style.outline = "";
  gitUrl.current.style.outline = "";
  gitUsername.current.style.outline = "";
  gitEmail.current.style.outline = "";
  gitBranch.current.style.outline = "";

  if (gitConfigName.current.value === "" && action !== "delete") {
    gitConfigName.current.style.outline = errBorder
    flag = false;
  }
  if (gitAccToken.current.value === "" && action !== "delete") {
    gitAccToken.current.style.outline = errBorder
    flag = false;
  }
  if (gitUrl.current.value === "" && action !== "delete") {
    gitUrl.current.style.outline = errBorder
    flag = false;
  }
  if (gitUsername.current.value === "" && action !== "delete") {
    gitUsername.current.style.outline = errBorder
    flag = false;
  }
  if (gitEmail.current.value === "" && action !== "delete") {
    gitEmail.current.style.outline = errBorder
    flag = false;
  }
  if (gitBranch.current.value === "" && action !== "delete") {
    gitBranch.current.style.outline = errBorder
    flag = false;
  }
  if (!regExUrl.test(gitUrl.current.value.trim())) {
    gitUrl.current.style.outline = errBorder;
    flag = false;
  }
  return flag;
}

export default GitDropdown;

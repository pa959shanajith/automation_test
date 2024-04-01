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
  const bitProjectKey = useRef();
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
  const [projectlistRefresher, setProjectlistRefresher] = useState(false);
  const [versionNameError, setversionNameError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  if (CreateProjectVisible) { projectName.current = '' }

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;
  const isQualityEngineer = userInfo && userInfo?.rolename === 'Quality Engineer';


  useEffect(() => {
    (async () => {
      if (selectedImage === "version_history") {
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
      }
    })();
  }, [selectedImage, visibleGitconfFormAfterCreatePrj]);


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
    const apiPayload = {
      param: props.configurationName, // "git" for git and "bit" for Bitbucket
      projectId: props.projectId,
      userId: props.userId
    }
    const data = await gitEditConfig(apiPayload);
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
      gitconfigRef.current.disabled = true;
      if(apiPayload.param === 'bit') bitProjectKey.current.value = data[6];
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
    gitconfigRef.current.readOnly = false;
    gitconfigRef.current.disabled = false;
    bitProjectKey.current.value = ""
  }

  const gitConfigAction = async (action) => {
    try {
      const apiPayloadData = {}
      if (["update", "create"].includes(action)) {
        if (!gitValidate(action, userRef, domainRef, ProjectRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef)) return;
        setLoading("Loading...");

        if (props.configurationName === "git") {
          apiPayloadData.param = "git";
          apiPayloadData.action = action;
          apiPayloadData.userId = props.userId;
          apiPayloadData.projectId = visibleGitconfFormAfterCreatePrj ? createdProjectDetails._id : props.projectId;
          apiPayloadData.gitConfigName = gitconfigRef.current.value.trim();
          apiPayloadData.gitAccToken = tokenRef.current.value.trim();
          apiPayloadData.gitUrl = urlRef.current.value.trim();
          apiPayloadData.gitUsername = gituserRef.current.value.trim();
          apiPayloadData.gitEmail = gitemailRef.current.value.trim();
          apiPayloadData.gitBranch = gitbranchRef.current.value.trim();
        } else if (props.configurationName === "bit") {
          apiPayloadData.param = "bit";
          apiPayloadData.action = action;
          apiPayloadData.userId = props.userId;
          apiPayloadData.projectId = visibleGitconfFormAfterCreatePrj ? createdProjectDetails._id : props.projectId;
          apiPayloadData.bitConfigName = gitconfigRef.current.value.trim();
          apiPayloadData.bitAccToken = tokenRef.current.value.trim();
          apiPayloadData.bitUrl = urlRef.current.value.trim();
          apiPayloadData.bitUsername = gituserRef.current.value.trim();
          apiPayloadData.bitWorkSpace = gitemailRef.current.value.trim();
          apiPayloadData.bitBranch = gitbranchRef.current.value.trim();
          apiPayloadData.bitProjectKey = bitProjectKey.current.value.trim()
        }
      }
      const data = await gitSaveConfig(apiPayloadData);

      if (data.error) { props.toastError(data.error); return; }

      if (["update", "create"].includes(action)) {
        if (data === `${apiPayloadData.param}Config exists`) props.toastWarn(`${props.configurationName} configration name already exists.`);
        else if (data === `${apiPayloadData.param}User exists`) props.toastWarn(`${props.configurationName} configuration already exists for this user and project combination.`);
        else {
          props.toastSuccess(MSG.CUSTOM(`${props.configurationName} configuration ${action}d successfully`, VARIANT.SUCCESS));
        }
        visibleGitconfFormAfterCreatePrj ? setVisibleGitconfFormAfterCreatePrj(false) : setDialogVisible(false);
        setDropdownVisible(true);
      } 
    } catch (error) {
      showToast('error', 'Error', `Error in integration with ${props.configurationName}. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateCommitAndPushInputs = async () => {
    if (versionName === '' || commitModuleList.length <= 0 || commitMsg === '') {
      if (versionName === '' || commitMsg === '') {
        if (commitMsg === '') setCommentError(true);
        if (versionName === '') setversionNameError(true);
        props.toastWarn("Please fill all the mandatory fields.");
      }
      if (versionName !== '' && commitMsg !== '' && commitModuleList.length <= 0) {
        setversionNameError(false);
        setCommentError(false);
        props.toastWarn("Please select at least one test suite.");
      }
    }
    else {
      setversionNameError(false);
      setCommentError(false);
      setLoading(true);
      commitAndPushOnClick();
    }
  }


  const commitAndPushOnClick = async () => {
    setLoading(true);
    try {
      let exportValue = {
        "param": props.configurationName,
        "exportname": "exportname",
        "query": "exportgit",
        "projectId": props.projectId
      }
      const exportVer = await checkExportVer(exportValue)
      if (exportVer.includes(versionName)) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: "Version is already used, Please provide a unique version", life: 3000 }); return;
      }
      else {
        ResetSession.start();
        const apiData = props.configurationName === "git" ? {
          param: props.configurationName,
          gitVersion: versionName,
          mindmapId: commitModuleList,
          "exportProjAppType": props.appType,
          "projectId": props.projectId,
          "projectName": props.projectName,
          gitComMsgRef: commitMsg.trim()
        } : {
              param: props.configurationName,
              bitVersion: versionName,
              mindmapId: commitModuleList,
              "exportProjAppType": props.appType,
              "projectId": props.projectId,
              "projectName": props.projectName,
              bitComMsgRef: commitMsg.trim()
            }
        var res = await exportToGit(apiData);
        if (res.error) { props.toastError(res.error); return; }
        else {
          toast.current.show({ severity: 'success', summary: 'Success Message', detail: `Test suite(s) pushed to ${props.configurationName}` });
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
        <Button data-test="git_reset" size="small" label='Reset' onClick={() => gitReset()} outlined />
        <Button data-test="git_create" size="small" label='Save' onClick={() => gitConfigAction('update')} className="btn-edit" />
      </> : <>
        <Button data-test="git_create" size="small" label='Create' onClick={() => gitConfigAction('create')} className="btn-edit" />
      </>
    }</div>
  );
  const commitFooter = () => (
    <Button label={loading ? "Committing..." : "Commit & Push"} size="small" onClick={validateCommitAndPushInputs} disabled={loading} />
  )

  const createProjectCloseDialogHandler = () => {
    dispatch(isCreateProjectVisible(false));
    if (projectName.current !== '') setVisibleGitconfFormAfterCreatePrj(true);
    setIsData(false);
    setProjectlistRefresher(true);
  }

  const DialogCloseHandle = () => {
    setDialogVisible(false);
    setCreatedProjectDetails({});
    setSelectedImage(null);
    if (isData) setDropdownVisible(true);
    if (projectlistRefresher) {
      projectListUpdateHandler()
      setProjectlistRefresher(false);
    }
  }
  return (
    <div className='GitVersion_cls'>
      {moduleLists?.length > 0 ?
        <>
          {dropdownVisible ?
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">
                <img src="static/imgs/GitIcon.svg" style={{ height: "1.2rem", width: "2rem" }} alt="Git Icon" className="dropdown-image" />
              </span>
              <Dropdown
                value={selectedImage}
                options={dropdownOptions}
                onChange={handleDropdownChange}
                className='p-inputtext-sm'
                optionLabel="label"
                style={{ height: '2rem', display: "flex", alignItems: "center" }}
                placeholder={"Select"}
              />
            </div>

            : props.configurationName !== "noconfig" ? <div onClick={!isQualityEngineer ? clickhandler : null} style={{ width: props.configurationName === "git" ? "6rem" : "8rem" }} title={isQualityEngineer ? "you dont't have previlage to perform this action" : null}> 
                <span className={!isQualityEngineer ? 'git_icon_and_text' : "git_icon_and_text_engg"}>
                  <img src={props.configurationName === "git" ? "static/imgs/GitIcon.svg" : "static/imgs/bitbucket_icon.svg"} style={{ height: "1.2rem", width: "2rem" }} alt="Git Icon" className="dropdown-image" />
                  {props.configurationName === "git" ? "Git" : "Bitbucket" }
                </span>
              </div> : null
            } </> : null
      }

      <Toast ref={toast} position="bottom-center" />
      <Dialog
        header={selectedImage === 'commit' ? `${(props.configurationName !== "noconfig" && props.configurationName === "git") ? "Git" : "BitBucket"} Commit Configuration` : selectedImage === 'version_history' ? 'Version History' : `${(props.configurationName !== "noconfig" && props.configurationName === "git") ? "Git" : "BitBucket"} Configuration`}
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
            configName={props.configurationName }
            bitProjectKey={bitProjectKey}
          />}
        {selectedImage === 'commit' ? (
          <GitCommit
            commitMsg={commitMsg}
            versionName={versionName}
            commitMsgChange={commitMsgChange}
            commitId={commitIdChange}
            versionChange={versionChange}
            moduleListChange={moduleListChange}
            commentError={commentError}
            versionNameError={versionNameError}
          />
        ) : selectedImage === 'version_history' ? (
          <GitVersionHistory {...props} configName={props.configurationName} commitId={commitID} setSelectedImage={setSelectedImage} allProjectlist={allProjectlist} projectListDropdown={projectListDropdown} />
        ) : null}
      </Dialog>

      {CreateProjectVisible && <div>
        <CreateProject setProjectName={setProjectNamehandler} visible={CreateProjectVisible} onHide={() => createProjectCloseDialogHandler()} projectsDetails={projectListForCreateProject} toastSuccess={props.toastSuccess} toastError={props.toastError} />
      </div>}
      <Dialog
        header={props.configurationName === "git" ? 'Git Configuration' : props.configurationName === "bit" ? "BitBucket Configuration" : ''}
        visible={visibleGitconfFormAfterCreatePrj}
        style={{ width: "58vw", height: '85vh' }}
        onHide={() => { setVisibleGitconfFormAfterCreatePrj(false); setCreatedProjectDetails({}); }}
        footer={dialogFooter}
        className='git_config_after_create_project'
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

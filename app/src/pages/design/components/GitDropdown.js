import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import { FormInputGit } from '../../admin/components/FormComp';
import '../styles/GitDropdown.scss';
import { gitSaveConfig, gitEditConfig } from '../../admin/api';
import { useSelector } from 'react-redux';
import { Toast } from "primereact/toast";
import GitCommit from './GitCommit';
import GitVersionHistory from './GitVersionHistory';
import { exportToGit } from '../api';
import { Messages as MSG, ResetSession, VARIANT, ScreenOverlay } from '../../global';
import { moduleList } from '../designSlice';

const GitDropdown = (props) => {
  const dropdownOptions = [
         { label: 'Commit', value: 'commit', icon: <img src="static/imgs/Commit_icon.svg" alt="commit Icon" style={{ marginRight: '1rem' }} /> },
    { label: 'Version History', value: 'version_history', icon: <img src="static/imgs/Version_icon.svg" alt="Version History" style={{ marginRight: '1rem' }} /> },
  ];
  const [showToken, setShowToken] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [commitMsg, setCommitMsg] = useState('');
  const [commitID, setCommitID] = useState('');
  const [moduleList, setmoduleList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const moduleLists = useSelector(state => state.design.moduleList)
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
  const [isData, setIsData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(true);
  // const currentTab = useSelector(state => state.admin.screen);
  // const isUsrSetting = props.userConfig

  const editConfig = async () => {
    const data = await gitEditConfig(props.userId, props.projectId);
    if (data.error) { props.toastError(data.error); return; }
    else if (data == "empty") {
      props.toastWarn(MSG.ADMIN.WARN_NO_CONFIG)
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
    setmoduleList(value);
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
      const data = await gitSaveConfig(action, props.userId, props.projectId, gitconfigRef.current.value.trim(), tokenRef.current.value.trim(), urlRef.current.value.trim(), gituserRef.current.value.trim(), gitemailRef.current.value.trim(), gitbranchRef.current.value.trim());
      if (data.error) { props.toastError(data.error); return; }
      else if (data === 'GitConfig exists') props.toastWarn(MSG.ADMIN.WARN_GITCONFIG_EXIST);
      else if (data === 'GitUser exists') props.toastWarn(MSG.ADMIN.WARN_GIT_PROJECT_CONFIGURED);
      else {
        props.toastSuccess(MSG.CUSTOM("Git configuration " + action + "d successfully", VARIANT.SUCCESS));
      }
      setTimeout(() => {
        setDialogVisible(false);
      }, 2000);
      setDropdownVisible(false);
    } catch (error) {
      showToast('error', 'Error', `Error in integration with Git. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const commitAndPushOnClick = async () => {
    setLoading(true);
    try {
      ResetSession.start();
      var res = await exportToGit({
        gitVersion: versionName,
        mindmapId: moduleList,
        "exportProjAppType": props.appType,
        "projectId": props.projectId,
        "projectName": props.projectName,
        gitComMsgRef: commitMsg
      });
      if (res.error) { props.toastError(res.error); return; }
      else {
        toast.current.show({ severity: 'success', summary: 'Success Message', detail: 'test_suit committed successfully' });
        setTimeout(() => {
          setDialogVisible(false);
        }, 2000);
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
        <Button data-test="git_save" label='save' onClick={() => gitConfigAction('save')} className="btn-save" title="Create" />
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
  return (
    <div className='GitVersion_cls'>
      {moduleLists.length > 0 ?
        <div onClick={dropdownVisible ? clickhandler : false}>
          <Dropdown
            value={selectedImage}
            options={dropdownOptions}
            onChange={handleDropdownChange}
            className='p-inputtext-sm'
            optionLabel="label"
            style={{height:'2rem'}}
            placeholder={<span className='flex' style={{height:"15px", position:'relative', bottom:'0.2rem'}}><img src="static/imgs/GitIcon.svg" style={{height:"0.99rem", width:"2rem"}} alt="Git Icon" className="dropdown-image" /> Git </span>}
            itemTemplate={(option) => (
              <div>
                {renderIcon(option.icon)}
                {option.label}
              </div>
            )}
          />
        </div> : null
      }

      <Toast ref={toast} position="bottom-center" />
      <Dialog
        header={selectedImage === 'commit' ? 'Git Commit Configuration' : selectedImage === 'version_history' ? 'Version History' : 'Git Configurations'}
        visible={dialogVisible}
        style={ selectedImage === 'commit' ? { width: "50vw",  height: '85vh'} : { width: "58vw",  height: '85vh' }}
        onHide={() => setDialogVisible(false)}
        footer={selectedImage === 'commit' ? commitFooter : selectedImage === 'version_history' ? ' ' : dialogFooter}
        className='gitVersion_dialog Git-config_cls'
      >
        {(selectedImage !== "commit" && selectedImage !== "version_history") && (
          <div className="mt-2">
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git Configuration</span>
                <FormInputGit data-test="name_git" inpRef={gitconfigRef} placeholder={'Enter Git Configuration Name'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel'>Git Access Token</span>
                <FormInputGit data-test="token_git" inpRef={tokenRef} placeholder={'Enter Git Access Token'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git URL</span>
                <FormInputGit data-test="url_git" inpRef={urlRef} placeholder={'Enter Git URL'} />
              </div>
            </div>

            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel'>Git User Name</span>
                <FormInputGit data-test="username_git" inpRef={gituserRef} placeholder={'Enter Git Username'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git User Email</span>
                <FormInputGit data-test="email_git" inpRef={gitemailRef} placeholder={'Enter Git Email Id'} />
              </div>
            </div>
            <div className='git_input'>
              <div className='flex flex-row justify-content-between align-items-center'>
                <span htmlFor='label_git' className='gitConfigurationLabel' >Git Branch</span>
                <FormInputGit data-test="email_git" inpRef={gitbranchRef} placeholder={'Enter Branch'} />
              </div>
            </div>
          </div>)}
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
          <GitVersionHistory {...props} commitId={commitID} />
        ) : null}
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

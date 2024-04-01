///GitButtonActions .js
import React, { useState, useEffect, useRef } from 'react';
import { ModalContainer, VARIANT, Messages, setMsg } from '../../global';
import { gitSaveConfig } from '../../admin/api';
import '../styles/GitConfig.scss'
import { Button } from 'primereact/button';

/*Component GitButtonActions
  use: defines Admin middle Section for Git Configuration buttons
  ToDo:
*/

const GitButtonActions = (props) => {
    const updateBtnRef = useRef()
    const onClickEdit = props.onClickEdit;
    const user = props.user
    const Project = props.Project
    const gitConfigName = props.gitname
    const gitAccToken = props.token
    const gitUsername = props.gituser
    const gitEmail = props.gitemail
    const gitBranch = props.gitbranch
    const gitUrl = props.url
    const userData = props.userData
    const projectData = props.projectData
    const setLoading = props.setLoading
    const resetFields = props.resetFields
    const displayError = props.displayError
    const bitProjectKey = props.bitProjectKey
    const domain = props.domain
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isConfigExists, setIsConfigExists] = useState(false);

    useEffect(() => {
        if (updateBtnRef !== undefined && updateBtnRef.current !== undefined)
            updateBtnRef.current.disabled = (gitConfigName.current.value === 'none' || gitAccToken.current.value === 'none' || gitUrl.current.value === "def-opt" || gitUsername.current.value === 'none' || gitEmail.current.value === 'none' || gitBranch.current.value === 'none')
    }, [gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail, gitBranch])

    const gitConfigAction = async (action) => {
        
        let apiPayloadData = {}
        if (['update', 'create'].includes(action)) {
            if (!gitValidate(action, user, domain, Project, gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail, gitBranch)) return;
            setLoading("Loading...");
            if (props.screenName === "Git") {
                apiPayloadData.param = "git";
                apiPayloadData.action = action;
                apiPayloadData.userId = userData[user.current.value];
                apiPayloadData.projectId = projectData[Project.current.value];
                apiPayloadData.gitConfigName = gitConfigName.current.value.trim();
                apiPayloadData.gitAccToken = gitAccToken.current.value.trim();
                apiPayloadData.gitUrl = gitUrl.current.value.trim();
                apiPayloadData.gitUsername = gitUsername.current.value.trim();
                apiPayloadData.gitEmail = gitEmail.current.value.trim();
                apiPayloadData.gitBranch = gitBranch.current.value.trim();
            } else {
                apiPayloadData.param = "bit";
                apiPayloadData.action = action;
                apiPayloadData.userId = userData[user.current.value];
                apiPayloadData.projectId = projectData[Project.current.value];
                apiPayloadData.bitConfigName = gitConfigName.current.value.trim();
                apiPayloadData.bitAccToken = gitAccToken.current.value.trim();
                apiPayloadData.bitUrl = gitUrl.current.value.trim();
                apiPayloadData.bitUsername = gitUsername.current.value.trim();
                apiPayloadData.bitWorkSpace = gitEmail.current.value.trim();
                apiPayloadData.bitBranch = gitBranch.current.value.trim();
                apiPayloadData.bitProjectKey = bitProjectKey.current.value.trim();
            }
        } else if(action === "delete"){
            apiPayloadData.param = isConfigExists ? ( props.screenName === "Git" ? 'bit' : props.screenName === "Bitbucket" ? 'git' : '') : props.screenName === "Git" ? 'git' : 'bit'; // if the project has git config and trying to do bitbucket config send "param" as earlier configured ,---> here Param=git
            apiPayloadData.action = action;
            apiPayloadData.userId = userData[user.current.value];
            apiPayloadData.projectId = projectData[Project.current.value];
        } 
        // else {
        //     apiPayloadData.param = "verify";
        //     apiPayloadData.action = action;
        //     apiPayloadData.userId = userData[user.current.value];
        //     apiPayloadData.projectId = projectData[Project.current.value];
        // }
        // const data = await gitSaveConfig(action, userData[user.current.value],projectData[Project.current.value],gitConfigName.current.value.trim(),gitAccToken.current.value.trim(),gitUrl.current.value.trim(),gitUsername.current.value.trim(),gitEmail.current.value.trim(), gitBranch.current.value.trim());

        const data = await gitSaveConfig(apiPayloadData);
        if (data.error) { displayError(data.error); return; }
        else if (data === `${apiPayloadData.param == 'git' ? 'bit' : 'git'}Config exists`) {
            if (['update', 'create'].includes(action)) {
                // props.toastWarn(`${props.screenName} configration name already exists.`);
                if(apiPayloadData.param === "bit"  && data === 'gitConfig exists') {
                    setShowDeleteModal(true); 
                    setIsConfigExists( true);
                }
                if(apiPayloadData.param === "git"  && data === 'bitConfig exists') {
                    setShowDeleteModal(true); 
                    setIsConfigExists( true);
                }
            } 
        }
        else if (data === `${apiPayloadData.param}User exists`) {
            if (['update', 'create'].includes(action)) {
                props.toastWarn(`${props.screenName} configuration already exists for this user and project combination.`);
            } 
            // else if (action === "verify") {setShowDeleteModal(true); setIsConfigExists({value:data, exist: true});}
        }
        else { 
            props.toastSuccess(Messages.CUSTOM(`Configuration ${action}d successfully`, VARIANT.SUCCESS));
            resetFields();
            setIsConfigExists(false);
        }
        setLoading(false);
        if (!['create'].includes(action)) {resetFields();}
        if (action === "update") {
            Project.current.value = '';
            user.current.value = '';
            props.setSelectProject('');
        }
    }

    return (
        <>
            <div className="adminActionBtn_git">
                {!props.showEdit ?
                    <>
                        <Button data-test="git_create" label='Create' onClick={() => gitConfigAction('create')} className="btn-edit" title="Create" />
                        <Button data-test="git_edit" label='Edit' onClick={onClickEdit} className="a__btn" title="Edit" />
                    </> : <>
                        <Button data-test="git_update" label='Update' ref={updateBtnRef} onClick={() => gitConfigAction('update')} className="btn-edit" title="Update" disabled={Project.current.value === "def-opt"} />
                        <Button data-test="git_delete" label='Delete' onClick={() => setShowDeleteModal(true)} className="a__btn" title="Delete" disabled={Project.current.value === "def-opt"} />
                    </>
                }
            </div>
            {showDeleteModal ?
                <ModalContainer
                    show={showDeleteModal}
                    title={"Delete configuration"}
                    content={isConfigExists? `This project is configured with "${props.screenName === 'Git'? 'Bitbucket' : 'Git'}" if u want to change the configuration, then all data will be deleted. Are u sure want to delete/change the Configuration?`:`Are you sure you want to delete ? Users depending on this configuration will not be able to perform ${props.screenName === 'Git'? 'Git' : 'Bitbucket'} operation.`}
                    close={() => setShowDeleteModal(false)}
                    footer={
                        <>
                            <Button outlined label="No" size='small' onClick={() => setShowDeleteModal(false)} />
                            <Button label="Yes" size='small' onClick={() => { gitConfigAction('delete', props.screenName === "Git" ? 'bit' : props.screenName === "Bitbucket" ? 'git' : '' ); setShowDeleteModal(false); }} />
                        </>
                    }
                    width='28rem'
                    modalClass=" modal-sm"
                />
                : null}
        </>
    );
}

const gitValidate = (action, user, domain, Project, gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail, gitBranch) => {
    var flag = true;
    const errBorder = '2px solid red';
    var regExUrl = /^https:\/\//g;
    user.current.style.outline = "";
    // domain.current.style.outline = "";
    Project.current.style.outline = "";
    gitConfigName.current.style.outline = "";
    gitAccToken.current.style.outline = "";
    gitUrl.current.style.outline = "";
    gitUsername.current.style.outline = "";
    gitEmail.current.style.outline = "";
    gitBranch.current.style.outline = "";

    if (user.current.value === 'def-opt') {
        user.current.style.outline = errBorder;
        flag = false;
    }
    // if (domain.current.value === 'def-opt') {
    //     domain.current.style.outline = errBorder
    //     flag = false;
    // }
    if (Project.current.value === 'def-opt') {
        Project.current.style.outline = errBorder
        flag = false;
    }
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
        gitBranch.current.style.outline = errBorder                       ////
        flag = false;
    }
    if (!regExUrl.test(gitUrl.current.value.trim())) {
        gitUrl.current.style.outline = errBorder;
        // toastWarn(Messages.ADMIN.WARN_GIT_URL);
        flag = false;
    }
    return flag;
}

export default GitButtonActions;    
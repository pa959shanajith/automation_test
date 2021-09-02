import React, { useState, useEffect, useRef } from 'react';
import { ModalContainer, VARIANT, Messages, setMsg } from '../../global';
import {gitSaveConfig} from '../api';
import '../styles/GitConfig.scss'

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
    const gitUrl = props.url
    const userData = props.userData
    const projectData = props.projectData
    const setLoading = props.setLoading
    const resetFields = props.resetFields
    const displayError = props.displayError
    const domain = props.domain
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(()=>{
        if(updateBtnRef!== undefined && updateBtnRef.current !==undefined )
        updateBtnRef.current.disabled = (gitConfigName.current.value === 'none' || gitAccToken.current.value === 'none' || gitUrl.current.value === "def-opt" || gitUsername.current.value ==='none' || gitEmail.current.value==='none')
    },[gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail])

    const gitConfigAction = async (action) => {
        if (!gitValidate(action, user, domain, Project, gitConfigName ,gitAccToken, gitUrl, gitUsername, gitEmail)) return;
        setLoading("Loading...");
        const data = await gitSaveConfig(action, userData[user.current.value],projectData[Project.current.value],gitConfigName.current.value.trim(),gitAccToken.current.value.trim(),gitUrl.current.value.trim(),gitUsername.current.value.trim(),gitEmail.current.value.trim());
        if(data.error){displayError(data.error);return;}
        else if (data === 'GitConfig exists') setMsg(Messages.ADMIN.WARN_GITCONFIG_EXIST);
        else if(data  === 'GitUser exists')  setMsg(Messages.ADMIN.WARN_GIT_PROJECT_CONFIGURED);
        else setMsg(Messages.CUSTOM("Git configuration "+action+ "d successfully",VARIANT.SUCCESS));
        setLoading(false);
        resetFields();
    }

    return (
        <>
            <div className="adminActionBtn">
                {!props.showEdit?
                    <>
                        <button data-test="git_create" onClick={()=>gitConfigAction('create')} className="a__btn btn-edit" title="Create">Create</button>
                        <button data-test="git_edit" onClick={onClickEdit} className="a__btn" title="Edit">Edit</button>
                    </>:<>
                        <button data-test="git_update" ref={updateBtnRef} onClick={()=>gitConfigAction('update')} className="a__btn btn-edit" title="Update" disabled={Project.current.value ==="def-opt"}>Update</button>
                        <button data-test="git_delete" onClick={()=>setShowDeleteModal(true)} className="a__btn" title="Delete" disabled={Project.current.value ==="def-opt"} >Delete</button>
                    </>
                }
            </div>  
            {showDeleteModal?
                <ModalContainer
                    title="Delete Git configuration"
                    content={"Are you sure you want to delete ? Users depending on this configuration will not be able to perform Git operation."}
                    close={()=>setShowDeleteModal(false)}
                    footer={
                        <>
                        <button onClick={()=>{gitConfigAction('delete');setShowDeleteModal(false);}}>Yes</button>
                        <button onClick={()=>setShowDeleteModal(false)}>No</button>
                        </>
                    }
                    modalClass=" modal-sm"
                />
            :null}
        </>
    );
}

const gitValidate = (action, user, domain, Project, gitConfigName, gitAccToken, gitUrl, gitUsername, gitEmail) => {
    var flag = true;
    const errBorder = '2px solid red';
    var regExUrl = /^https:\/\//g;
    user.current.style.outline = "";
    domain.current.style.outline = "";
    Project.current.style.outline = "";
    gitConfigName.current.style.outline = "";
    gitAccToken.current.style.outline = "";
    gitUrl.current.style.outline = "";
	gitUsername.current.style.outline = "";
    gitEmail.current.style.outline = "";

    if(user.current.value === 'def-opt'){
        user.current.style.outline = errBorder;
        flag = false;
    }
    if (domain.current.value === 'def-opt') {
        domain.current.style.outline = errBorder
        flag = false;
    }
    if (Project.current.value === 'def-opt') {
        Project.current.style.outline = errBorder
        flag = false;
    }
    if(gitConfigName.current.value === "" && action!=="delete"){
        gitConfigName.current.style.outline = errBorder
        flag = false;
    }
    if(gitAccToken.current.value === "" && action!=="delete"){
        gitAccToken.current.style.outline = errBorder
        flag = false;
    }
    if(gitUrl.current.value === "" && action!=="delete"){
        gitUrl.current.style.outline = errBorder
        flag = false;
    }
	if(gitUsername.current.value === "" && action!=="delete"){
        gitUsername.current.style.outline = errBorder
        flag = false;
    }
    if(gitEmail.current.value === "" && action!=="delete"){
        gitEmail.current.style.outline = errBorder
        flag = false;
    }
    if(!regExUrl.test(gitUrl.current.value.trim())){
        gitUrl.current.style.outline = errBorder;
        setMsg(Messages.ADMIN.WARN_GIT_URL);
        flag = false;
    }
    return flag;
}

export default GitButtonActions;    
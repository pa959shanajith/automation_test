import React, { useState, useEffect, useRef } from 'react';
import { ModalContainer } from '../../global';
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
    const gitAccToken = props.token
    const gitUrl = props.url
    const userData = props.userData
    const projectData = props.projectData
    const setLoading = props.setLoading
    const setPopupState = props.setPopupState
    const resetFields = props.resetFields
    const displayError = props.displayError
    const domain = props.domain
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(()=>{
        if(updateBtnRef!== undefined && updateBtnRef.current !==undefined )
        updateBtnRef.current.disabled = (gitAccToken.current.value === 'none' || gitUrl.current.value === "def-opt")
    },[gitAccToken, gitUrl])

    const gitConfigAction = async (action) => {
        if (!gitValidate(action, user, domain, Project, gitAccToken, gitUrl, setPopupState)) return;
        setLoading("Loading...");
        const data = await gitSaveConfig(action, userData[user.current.value],projectData[Project.current.value],gitAccToken.current.value.trim(),gitUrl.current.value.trim());
        if(data.error){displayError(data.error);return;}
        else if(data  === 'GitUser Exists')  setPopupState({show:true,title:"Save Git Config",content:"Git user already exists!!"});
        else setPopupState({show:true,title:"Save Git Config",content:"Git user "+action+ "d successfully"});
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
                    title="Delete Git Configuration"
                    content={"Are you sure you want to delete ? Users depending on this configuration will not be able to perform git operation."}
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

const gitValidate = (action, user, domain, Project, gitAccToken, gitUrl, setPopupState) => {
    var flag = true;
    const errBorder = '2px solid red';
    var regExUrl = /^https:\/\//g;
    user.current.style.outline = "";
    domain.current.style.outline = "";
    Project.current.style.outline = "";
    gitAccToken.current.style.outline = "";
    gitUrl.current.style.outline = "";

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
    if(gitAccToken.current.value === "" && action!=="delete"){
        gitAccToken.current.style.outline = errBorder
        flag = false;
    }
    if(gitUrl.current.value === "" && action!=="delete"){
        gitUrl.current.style.outline = errBorder
        flag = false;
    }
    if(!regExUrl.test(gitUrl.current.value.trim())){
        gitUrl.current.style.outline = errBorder;
        setPopupState({show:true,title:"Error",content:"Invalid URL provided! URL must start with 'https://' !!"});
        flag = false;
    }
    return flag;
}

export default GitButtonActions;    
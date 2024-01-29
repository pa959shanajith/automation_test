import React, { useState, useEffect, useRef } from 'react';
import { ScreenOverlay, ScrollBar, Messages as MSG, setMsg } from '../../global'
import { FormInputGit, FormSelect } from '../../admin/components/FormComp'
import { getUserDetails, getDomains_ICE, getDetails_ICE, gitEditConfig } from '../../admin/api';
import GitButtonActions from '../../settings/Components/GitButtonActions'
import { useDispatch, useSelector } from 'react-redux';

import '../styles/GitConfig.scss'

/*Component GitConfig
  use: defines Admin middle Section for Git Configuration
  ToDo:
*/

const GitConfig = (props) => {
    const userRef = useRef();
    const domainRef = useRef();
    const ProjectRef = useRef();
    const gitconfigRef = useRef();
    const tokenRef = useRef();
    const urlRef = useRef();
    const gituserRef = useRef();
    const gitemailRef = useRef();
    const gitbranchRef = useRef();
    const [domainList, setDomainList] = useState([])
    const [projectList, setProjectList] = useState([])
    const [userData, setUserData] = useState({})
    const [projectData, setProjectData] = useState({})
    const [showEdit, setShowEdit] = useState(false)
    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(false)
    const currentTab = useSelector(state => state.admin.screen);
    const isUsrSetting = props.userConfig //for user settings

    useEffect(() => {
        if (props.userConfig) {
            userRef.current.value = props.username;
            setUserData({ [props.username]: props.userID });
        }
    }, [props.userConfig, props.username, props.userID])

    useEffect(() => {
        setShowEdit(false);
        if (!isUsrSetting) {
            refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
            // eslint-disable-next-line
        } else {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        }
    }, [currentTab === "Git Configuration"])

    const onClickEdit = () => {
        setShowEdit(true);
        if (!isUsrSetting) {
            refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        } else {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        }
    }

    const displayError = (error) => {
        setLoading(false)
        props.toastError(error)
    }

    const resetSelectList = (changeDropDown) => {
        if (changeDropDown === "userChange") {
            if (document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0";
            if (document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
            setProjectList([])
            setProjectData({})
        } else if (changeDropDown === "domainChange") if (document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
        urlRef.current.style.outline = "";
        gitconfigRef.current.style.outline = "";
        tokenRef.current.style.outline = "";
        // domainRef.current.style.outline= "";
        ProjectRef.current.style.outline = "";
        userRef.current.style.outline = "";
        gituserRef.current.style.outline = "";
        gitemailRef.current.style.outline = "";
        gitbranchRef.current.style.outline = "";
        if (showEdit) {
            gitconfigRef.current.value = "";
            tokenRef.current.value = "";
            urlRef.current.value = "";
            gituserRef.current.value = "";
            gitemailRef.current.value = "";
            gitbranchRef.current.style.outline = "";
        }
    }

    const resetFields = () => {
        refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        if (isUsrSetting) {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        }
    }

    return (
        <div className="git_container">
            {loading ? <ScreenOverlay content={loading} /> : null}
            {!isUsrSetting &&
                <div className='git_comp'>
                    <div className='flex flex-row justify-content-between align-items-center'>
                        <span className="label_git">User</span>
                        <FormSelect data-test="user_git" inpId={'userGit'} inpRef={userRef}
                            // onChangeFn={() => fetchDomainList(resetSelectList, setDomainList, displayError, setLoading)} 
                            onChangeFn={() => fetchProjectList(resetSelectList, userData, userRef, setProjectList, setProjectData, displayError, setLoading)}
                            defValue={"Select User"} option={userList} />
                    </div>
                </div>}
            {isUsrSetting && <span ref={userRef} ></span>}
            {/* <div className='git_comp'>
                    <div className='flex flex-row justify-content-between align-items-center'>
                    <span className="label_git">Domain</span>
                    <FormSelect data-test="domain_git" inpId={'domainGit'} inpRef={domainRef} onChangeFn={() => fetchProjectList(resetSelectList, domainRef.current.value, userData, userRef, setProjectList, setProjectData, displayError, setLoading)} defValue={"Select Domain"} option={domainList} />
                    </div>
                    </div> */}
            <div className='git_comp'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span className="label_git">Project</span>
                    <FormSelect data-test="project_git" inpId={'projectGit'} inpRef={ProjectRef} onChangeFn={() => { onChangeProject(resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, gitbranchRef, userData, userRef, projectData, ProjectRef, setLoading) }} defValue={"Select Project"} option={projectList} />
                </div>
            </div>
            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git' >Git Configuration</span>
                    <FormInputGit data-test="name_git" inpRef={gitconfigRef} placeholder={'Enter Git Configuration Name'} />
                </div>
            </div>

            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git' >Git Access Token</span>
                    <FormInputGit data-test="token_git" inpRef={tokenRef} placeholder={'Enter Git Access Token'} />
                </div>
            </div>
            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git' >Git URL</span>
                    <FormInputGit data-test="url_git" inpRef={urlRef} placeholder={'Enter Git URL'} />
                </div>
            </div>

            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git'>Git User Name</span>
                    <FormInputGit data-test="username_git" inpRef={gituserRef} placeholder={'Enter Git Username'} />
                </div>
            </div>
            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git' >Git User Email</span>
                    <FormInputGit data-test="email_git" inpRef={gitemailRef} placeholder={'Enter Git Email Id'} />
                </div>
            </div>
            <div className='git_input'>
                <div className='flex flex-row justify-content-between align-items-center'>
                    <span htmlFor='label_git' >Git Branch</span>
                    <FormInputGit data-test="email_git" inpRef={gitbranchRef} placeholder={'Enter Branch'} />
                </div>
            </div>


            <GitButtonActions resetFields={resetFields} showEdit={showEdit} onClickEdit={onClickEdit} domain={domainRef} user={userRef} Project={ProjectRef} gitname={gitconfigRef} token={tokenRef} url={urlRef} gituser={gituserRef} gitemail={gitemailRef}  gitbranch={gitbranchRef}userData={userData} projectData={projectData} setLoading={setLoading} displayError={displayError} refreshFields={refreshFields} toastError={props.toastError} toastSuccess={props.toastSuccess} toastWarn={props.toastWarn} />
        </div>
    );
}

const onChangeProject = async (resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef,gitbranchRef, userData, userRef, projectData, ProjectRef, setLoading) => {
    urlRef.current.style.outline = "";
    gitconfigRef.current.style.outline = "";
    tokenRef.current.style.outline = "";
    ProjectRef.current.style.outline = "";
    gituserRef.current.style.outline = "";
    gitemailRef.current.style.outline = "";
    gitbranchRef.current.style.outline = "";
    if (!showEdit) return;
    setLoading("Loading...");
    const data = await gitEditConfig(userData[userRef.current.value], projectData[ProjectRef.current.value]);
    if (data.error) { displayError(data.error); return; }
    else if (data == "empty") {
        // toastWarn(MSG.ADMIN.WARN_NO_CONFIG)
        resetFields();
    } else {
        gitconfigRef.current.value = data[0];
        gitconfigRef.current.readOnly = true;
        tokenRef.current.value = data[1];
        urlRef.current.value = data[2];
        gituserRef.current.value = data[3];
        gitemailRef.current.value = data[4];
        gitbranchRef.current.value = data[5];
    }
    setLoading(false);
}

const refreshFields = (domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, gituserRef, gitemailRef,gitbranchRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading) => {
    fetchUsers(setUserList, setUserData, displayError, setLoading);
    setDomainList([])
    setProjectList([])
    setUserData({})
    setProjectData({})
    gitconfigRef.current.value = "";
    gitconfigRef.current.readOnly = false;
    tokenRef.current.value = "";
    urlRef.current.value = "";
    gituserRef.current.value = "";
    gitemailRef.current.value = "";
    gitbranchRef.current.style.outline = "";
    if (document.getElementById("userGit") !== null) document.getElementById("userGit").selectedIndex = "0";
    if (document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0";
    if (document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
    gitconfigRef.current.style.outline = "";
    urlRef.current.style.outline = "";
    tokenRef.current.style.outline = "";
    // domainRef.current.style.outline = "";
    ProjectRef.current.style.outline = "";
    userRef.current.style.outline = "";
    gituserRef.current.style.outline = "";
    gitemailRef.current.style.outline = "";
    gitbranchRef.current.value ="";
}

const fetchDomainList = async (resetSelectList, setDomainList, displayError, setLoading) => {
    setLoading("Loading...");
    let data = await getDomains_ICE()
    console.log(data);
    if (data.error) { displayError(data.error); return; }
    setDomainList(data);
    resetSelectList("userChange");
    setLoading(false);
}



const fetchUsers = async (setUserList, setUserData, displayError, setLoading) => {
    setLoading("Loading...");
    const data = await getUserDetails("user");
    if (data.error) { displayError(data.error); return; }
    var userOptions = [];
    var userData = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i][3] !== "Admin") {
            userOptions.push(data[i][0]);
            userData[data[i][0]] = data[i][1];
        }
    }
    setUserData(userData);
    setUserList(userOptions.sort());
    setLoading(false);
}

const fetchProjectList = async (resetSelectList, userData, userRef, setProjectList, setProjectData, displayError, setLoading) => {
    setLoading("Loading Projects...");
    var idtype = ["gitdomaindetails"];
    var requestedname = {};
    requestedname.domainname = 'banking';
    requestedname.userid = userData[userRef.current.value];
    const getDetailsResponse = await getDetails_ICE(idtype, [requestedname]);
    if (getDetailsResponse.error) {
        displayError(getDetailsResponse.error);
        return;
    }
    const uniqueProjectNames = [...new Set(getDetailsResponse.projectNames)];

    const projectData = {};
    uniqueProjectNames.forEach((projectName) => {
        const index = getDetailsResponse.projectNames.indexOf(projectName);
        if (index !== -1) {
            projectData[projectName] = getDetailsResponse.projectIds[index];
        }
    });

    setProjectData(projectData);
    setProjectList(uniqueProjectNames);
    resetSelectList("domainChange");
    setLoading(false);

    return projectData;
}


export default GitConfig;
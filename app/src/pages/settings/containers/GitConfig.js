///gitconfig.js
import React, { useState, useEffect, useRef } from 'react';
import { ScreenOverlay, ScrollBar, Messages as MSG, setMsg } from '../../global'
import { FormInputGit, FormSelect } from '../../admin/components/FormComp'
import { getUserDetails, getDomains_ICE, getDetails_ICE, gitEditConfig } from '../../admin/api';
import GitButtonActions from '../../settings/Components/GitButtonActions'
import { useDispatch, useSelector } from 'react-redux';

import '../styles/GitConfig.scss'
import { Dropdown } from 'primereact/dropdown';

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
    const bitProjectKey = useRef();
    const [domainList, setDomainList] = useState([])
    const [projectList, setProjectList] = useState([])
    const [userData, setUserData] = useState({})
    const [projectData, setProjectData] = useState({})
    const [showEdit, setShowEdit] = useState(false)
    const [userList, setUserList] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectProject, setSelectProject] = useState(false)

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
        // if (!isUsrSetting) {
        refreshFields(bitProjectKey, domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        ProjectRef.current.value = '';
        userRef.current.value = '';
        setSelectProject('');
        setProjectList('');
        
        // eslint-disable-next-line
        // } else {
        //     fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        // }
    }, [props.screenName])

    const onChangeProject = (resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, gitbranchRef, userData, userRef, projectData, ProjectRef, setLoading) => {
        urlRef.current.style.outline = "";
        gitconfigRef.current.style.outline = "";
        tokenRef.current.style.outline = "";
        ProjectRef.current.style.outline = "";
        gituserRef.current.style.outline = "";
        gitemailRef.current.style.outline = "";
        gitbranchRef.current.style.outline = "";
        setSelectProject(ProjectRef.current?.value);
        if(bitProjectKey.current) bitProjectKey.current.value = '';

        (async () => {
            if (showEdit) {
                setLoading("Loading...");
                const apiPayload = {
                    param: props.screenName === "Bitbucket" ? "bit" : props.screenName === 'Git' ? 'git' : '',
                    projectId: projectData[ProjectRef.current.value],
                    userId: userData[userRef.current.value]
                }
                const data = await gitEditConfig(apiPayload);

                if (data.error) { displayError(data.error); return; }
                else if (data == "empty") {
                    props.toastWarn(`No ${apiPayload.param} configuration created yet.`);
                    resetFields();
                } else {
                    gitconfigRef.current.value = data[0];
                    gitconfigRef.current.readOnly = true;
                    gitconfigRef.current.disabled = true;
                    tokenRef.current.value = data[1];
                    urlRef.current.value = data[2];
                    gituserRef.current.value = data[3];
                    gitemailRef.current.value = data[4];
                    gitbranchRef.current.value = data[5];
                    if(apiPayload.param === "bit" ) { 
                        bitProjectKey.current.value = data[6];
                        bitProjectKey.current.readOnly = true;
                        bitProjectKey.current.disabled = true;
                    }
                }
                setLoading(false);
            }
        }
        )()

        // return ProjectRef;
    }

    const refreshFields = (bitProjectKey,domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, gitbranchRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading) => {
        fetchUsers(setUserList, setUserData, displayError, setLoading);
        setDomainList([])
        // setProjectList([])
        setUserData({})
        // setProjectData({})
        gitconfigRef.current.value = "";
        gitconfigRef.current.readOnly = false;
        gitconfigRef.current.disabled = false;
        tokenRef.current.value = "";
        urlRef.current.value = "";
        gituserRef.current.value = "";
        gitemailRef.current.value = "";
        gitbranchRef.current.value = "";
        // bitProjectKey.current.value = '';
        // if (document.getElementById("userGit") !== null) document.getElementById("userGit").selectedIndex = "0";
        // if (document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0";
        // if (document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "1";
        gitconfigRef.current.style.outline = "";
        urlRef.current.style.outline = "";
        tokenRef.current.style.outline = "";
        // domainRef.current.style.outline = "";
        ProjectRef.current.style.outline = "";
        userRef.current.style.outline = "";
        gituserRef.current.style.outline = "";
        gitemailRef.current.style.outline = "";
        gitbranchRef.current.style.outline = "";
        if (bitProjectKey.current) {
            bitProjectKey.current.value ="";
            bitProjectKey.current.readOnly = false;
            bitProjectKey.current.disabled = false;
        }
        
    }

    const fetchDomainList = async (resetSelectList, setDomainList, displayError, setLoading) => {
        setLoading("Loading...");
        let data = await getDomains_ICE()
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

    const fetchProjectList = async (resetSelectList, userData, userRef, setProjectList, setProjectData, displayError, setLoading, ProjectRef) => {
        ProjectRef.current.value = '';
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
    const onClickEdit = () => {
        setShowEdit(true);
        // if (!isUsrSetting) {
            refreshFields(bitProjectKey, domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
            ProjectRef.current.value = '';
            userRef.current.value = '';
            setSelectProject('');
            setProjectList([]);
            // } else {
        //     fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        // }
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
        }
        // else if (changeDropDown === "domainChange") if (document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
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
            gitbranchRef.current.value = "";
        }
        if(bitProjectKey.current ) bitProjectKey.current.value ="";
    }

    const resetFields = () => {
        refreshFields(bitProjectKey, domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, gitbranchRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        // if (isUsrSetting) {
        //     fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        // }
        if (!showEdit) {
            ProjectRef.current.value = '';
            userRef.current.value = '';
            setSelectProject('');
            setProjectList('');
            setShowEdit(false);
        }

    }

    return (
        <div className="git_container">
            {loading ? <ScreenOverlay content={loading} /> : null}

            <div className='flex flex-row w-full align-items-center justify-content-between ' >
                <span className="label_git" >User</span>
                <Dropdown data-test="user_git" value={userRef?.current?.value} className='w-full md:w-25rem' inputId={'userGit'} inputRef={userRef}
                    onChange={() => fetchProjectList(resetSelectList, userData, userRef, setProjectList, setProjectData, displayError, setLoading, ProjectRef)}
                    placeholder={"Select User"} options={userList} />
            </div>
          
            <div className='flex flex-row w-full align-items-center justify-content-between'>
                <span className="label_git" >Project</span>
                <Dropdown data-test="project_git" value={selectProject} className='w-full md:w-25rem' inputId={'projectGit'} inputRef={ProjectRef} onChange={() => { onChangeProject(resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, gitbranchRef, userData, userRef, projectData, ProjectRef, setLoading) }} placeholder={"Select Project"} options={projectList} />
            </div>
     
            <FormInputGit label={"Configuration"} data-test="name_git" inpRef={gitconfigRef} placeholder={`Enter ${props.screenName} Name`} />
           
            <FormInputGit label="Access Token" data-test="token_git" inpRef={tokenRef} placeholder={`Enter ${props.screenName} Access Token`} />
            
            <FormInputGit label={`${props.screenName} URL`} data-test="url_git" inpRef={urlRef} placeholder={`Enter ${props.screenName} URL`} />
            
            <FormInputGit label={`${props.screenName} User Name`} data-test="username_git" inpRef={gituserRef} placeholder={`Enter ${props.screenName} Username`} />
            
            <FormInputGit label={`${props.screenName} ${props.screenName === "Bitbucket" ? "Work space" : "User Email"}`} data-test="email_git" inpRef={gitemailRef} placeholder={`Enter ${props.screenName === "Bitbucket" ? "Work space" : 'Email Id'}`} />
            
            <FormInputGit label={`${props.screenName} Branch`} data-test="branch" inpRef={gitbranchRef} placeholder={'Enter Branch'} />
            
            {props.screenName === "Bitbucket" && <FormInputGit label={`${props.screenName} Project Key`} data-test="project_key" inpRef={bitProjectKey} placeholder={'Enter key'} />}

            <GitButtonActions bitProjectKey={bitProjectKey} screenName={props.screenName} resetFields={resetFields} showEdit={showEdit} onClickEdit={onClickEdit} domain={domainRef} user={userRef} Project={ProjectRef} gitname={gitconfigRef} token={tokenRef} setSelectProject={setSelectProject}
                url={urlRef} gituser={gituserRef} gitemail={gitemailRef} gitbranch={gitbranchRef} userData={userData} projectData={projectData} setLoading={setLoading} displayError={displayError} refreshFields={refreshFields} toastError={props.toastError} toastSuccess={props.toastSuccess} toastWarn={props.toastWarn} />
        </div>
    );
}



export default GitConfig;
import React, { useState, useEffect, useRef } from 'react';
import {ScreenOverlay, ScrollBar, Messages as MSG, VARIANT} from '../../global' 
import {FormInput,FormSelect} from '../components/FormComp'
import {getUserDetails, getDomains_ICE, getDetails_ICE, gitEditConfig } from '../api';
import GitButtonActions from '../components/GitButtonActions'
import '../styles/GitConfig.scss'

/*Component GitConfig
  use: defines Admin middle Section for Git Configuration
  ToDo:
*/

const GitConfig = (props) => {
    const userRef =  useRef();
    const domainRef =  useRef();
    const ProjectRef =  useRef();
    const gitconfigRef = useRef();
    const tokenRef =  useRef();
    const urlRef =  useRef();
    const gituserRef = useRef();
    const gitemailRef = useRef();
    const [domainList,setDomainList] = useState([])
    const [projectList,setProjectList] = useState([])
    const [userData,setUserData] = useState({})
    const [projectData,setProjectData] = useState({})
    const [showEdit,setShowEdit] = useState(false)
    const [userList,setUserList] = useState([])
    const [loading,setLoading] = useState(false)
    const setPopupState=props.setPopupState;
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
		refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        // eslint-disable-next-line
        } else {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
        }
    }, [props.resetMiddleScreen["gitConfigure"], props.MiddleScreen])

    const onClickEdit = () => {
        setShowEdit(true);
        if (!isUsrSetting) {
        refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading); 
        } else {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
    }
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            variant:error.VARIANT,
            content:error.CONTENT,
            submitText:'Ok',
            show:true
        })
    }

    const resetSelectList = (changeDropDown) => {
        if(changeDropDown === "userChange") {
            if(document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0"; 
            if(document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
            setProjectList([])
            setProjectData({})
        } else if(changeDropDown === "domainChange")  if(document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
        urlRef.current.style.outline = "";
        gitconfigRef.current.style.outline = "";
        tokenRef.current.style.outline = "";
        domainRef.current.style.outline = "";
        ProjectRef.current.style.outline = "";
        userRef.current.style.outline = "";
        gituserRef.current.style.outline = "";
        gitemailRef.current.style.outline = "";
        if(showEdit) {
            gitconfigRef.current.value = "";
            tokenRef.current.value = "";
            urlRef.current.value = "";
            gituserRef.current.value = "";
            gitemailRef.current.value = "";
        }
    } 

    const resetFields = () => {
        refreshFields(domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, urlRef, gituserRef, gitemailRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading); 
        if (isUsrSetting) {
            fetchDomainList(resetSelectList, setDomainList, displayError, setLoading);
    }
    }

    return (
        <ScrollBar thumbColor="#929397">
            <div className="git_container">
                {loading?<ScreenOverlay content={loading}/>:null}

                <div id="page-taskName"><span>{(showEdit===false)?"Git Configuration":"Edit Git Configuration"}</span></div>
                <GitButtonActions resetFields={resetFields} showEdit={showEdit} onClickEdit={onClickEdit} domain={domainRef} user={userRef} Project={ProjectRef} gitname={gitconfigRef} token={tokenRef} url={urlRef} gituser={gituserRef} gitemail={gitemailRef} userData={userData} projectData={projectData} setLoading={setLoading} displayError={displayError} refreshFields={refreshFields} setPopupState={setPopupState} />        
                <div className="git_token" >
                    {!isUsrSetting && <FormSelect data-test="user_git" inpId={'userGit'} inpRef={userRef} onChangeFn={() => fetchDomainList(resetSelectList, setDomainList, displayError, setLoading)} defValue={"Select User"} label={"User"} option={userList} />}
                    {isUsrSetting && <span ref={userRef} ></span>}
                    <FormSelect data-test="domain_git" inpId={'domainGit'} inpRef={domainRef} onChangeFn={() => fetchProjectList(resetSelectList, domainRef.current.value, userData, userRef, setProjectList, setProjectData, displayError, setLoading)} defValue={"Select Domain"} label={"Domain"} option={domainList} />
                    <FormSelect data-test="project_git" inpId={'projectGit'} inpRef={ProjectRef} onChangeFn={() => { onChangeProject(resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, userData, userRef, projectData, ProjectRef, setLoading, setPopupState) }} defValue={"Select Project"} label={"Project"} option={projectList} />
                    <FormInput data-test="name_git" inpRef={gitconfigRef} label={'Git Configuration'} placeholder={'Enter Git Configuration Name'} />
                    <FormInput data-test="token_git" inpRef={tokenRef} label={'Git Access Token'} placeholder={'Enter Git Access Token'} />
                    <FormInput data-test="url_git" inpRef={urlRef} label={'Git URL'} placeholder={'Enter Git URL'} />
                    <FormInput data-test="username_git" inpRef={gituserRef} label={'Git User Name'} placeholder={'Enter Git Username'} />
                    <FormInput data-test="email_git" inpRef={gitemailRef} label={'Git User Email'} placeholder={'Enter Git Email Id'} />
                </div>
            </div>
        </ScrollBar>
    );
}

const onChangeProject = async (resetFields, displayError, showEdit, urlRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, userData, userRef, projectData, ProjectRef, setLoading, setPopupState ) =>{
    urlRef.current.style.outline = "";
    gitconfigRef.current.style.outline = "";
    tokenRef.current.style.outline = "";
    ProjectRef.current.style.outline = "";
    gituserRef.current.style.outline = "";
    gitemailRef.current.style.outline = "";
    if(!showEdit) return;
    setLoading("Loading...");
    const data = await gitEditConfig(userData[userRef.current.value], projectData[ProjectRef.current.value]);
    if(data.error){displayError(data.error);return;}
    else if(data == "empty") {
        setPopupState({show:true,content:MSG.ADMIN.WARN_NO_CONFIG.CONTENT,variant:VARIANT.WARNING})
        resetFields();
    } else {
        gitconfigRef.current.value = data[0];
        gitconfigRef.current.readOnly = true;
        tokenRef.current.value = data[1];
        urlRef.current.value = data[2];
        gituserRef.current.value = data[3];
        gitemailRef.current.value = data[4];
    }
    setLoading(false);
}

const refreshFields = ( domainRef, ProjectRef, userRef, gitconfigRef, tokenRef, gituserRef, gitemailRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading) => {
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
    if(document.getElementById("userGit") !== null) document.getElementById("userGit").selectedIndex = "0"; 
    if(document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0"; 
    if(document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
    gitconfigRef.current.style.outline = "";
    urlRef.current.style.outline = "";
    tokenRef.current.style.outline = "";
    domainRef.current.style.outline = "";
    ProjectRef.current.style.outline = "";
    userRef.current.style.outline = "";
    gituserRef.current.style.outline = "";
    gitemailRef.current.style.outline = "";
}

const fetchDomainList = async (resetSelectList, setDomainList, displayError, setLoading) => {
    setLoading("Loading...");
    let data = await getDomains_ICE() 
    if(data.error){displayError(data.error);return;}
    setDomainList(data);
    resetSelectList("userChange");
    setLoading(false);
}

const fetchUsers = async (setUserList, setUserData, displayError, setLoading)=>{
    setLoading("Loading...");
    const data = await getUserDetails("user");
    if(data.error){displayError(data.error);return;}
    var userOptions = [];
    var userData = {};
    for(var i=0; i<data.length; i++){
        if(data[i][3] !== "Admin"){
            userOptions.push(data[i][0]);
            userData[data[i][0]] = data[i][1];
        }
    }
    setUserData(userData);
    setUserList(userOptions.sort());   
    setLoading(false); 
}

const fetchProjectList = async (resetSelectList, domain, userData, userRef, setProjectList, setProjectData, displayError, setLoading) => {
    setLoading("Loading Projects...")
    var idtype = ["gitdomaindetails"];
    var requestedname = {};
    requestedname.domainname = domain;
    requestedname.userid = userData[userRef.current.value];
    const getDetailsResponse = await getDetails_ICE(idtype, [requestedname])
    if(getDetailsResponse.error){displayError(getDetailsResponse.error);return;}
    const projectOptions=[];
    const projectData = {};
    for (var i = 0; i < getDetailsResponse.projectNames.length; i++) {
        projectOptions.push(getDetailsResponse.projectNames[i]);
        projectData[getDetailsResponse.projectNames[i]] = getDetailsResponse.projectIds[i];
    }    
    projectOptions.sort();
    setProjectData(projectData);
    setProjectList(projectOptions);
    resetSelectList("domainChange");
    setLoading(false);
}

export default GitConfig;
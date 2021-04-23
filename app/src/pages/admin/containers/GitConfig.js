import React, { useState, useEffect, useRef } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
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
    const tokenRef =  useRef();
    const urlRef =  useRef();
    const [domainList,setDomainList] = useState([])
    const [projectList,setProjectList] = useState([])
    const [userData,setUserData] = useState({})
    const [projectData,setProjectData] = useState({})
    const [showEdit,setShowEdit] = useState(false)
    const [userList,setUserList] = useState([])
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
    
    
    useEffect(()=>{
        setShowEdit(false);
		refreshFields(domainRef, ProjectRef, userRef, tokenRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading);
        // eslint-disable-next-line
	},[props.resetMiddleScreen["gitConfigure"],props.MiddleScreen])

    const onClickEdit = () => {
        setShowEdit(true);
        refreshFields(domainRef, ProjectRef, userRef, tokenRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading); 
    }

    const displayError = (error,header) =>{
        setLoading(false)
        setPopupState({
            title:header?header:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const resetFields = () => {
        refreshFields(domainRef, ProjectRef, userRef, tokenRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading); 
    }

    return (
        <ScrollBar thumbColor="#929397">
            <div className="git_container">
                {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={()=>{setPopupState({show:false,title:"",content:""})}} close={()=>{setPopupState({show:false,title:"",content:""})}} submitText={"Ok"} />:null}
                {loading?<ScreenOverlay content={loading}/>:null}

                <div id="page-taskName"><span>{(showEdit===false)?"Git Configuration":"Edit Git Configuration"}</span></div>
                <GitButtonActions resetFields={resetFields} showEdit={showEdit} onClickEdit={onClickEdit} domain={domainRef} user={userRef} Project={ProjectRef} token={tokenRef} url={urlRef} userData={userData} projectData={projectData} setLoading={setLoading} displayError={displayError} refreshFields={refreshFields} setPopupState={setPopupState} />        
                <FormSelect data-test="user_git" inpId={'userGit'} inpRef={userRef} onChangeFn={()=>fetchDomainList(setDomainList, displayError, setLoading)} defValue={"Select User"} label={"User"} option={userList}/>
                <FormSelect data-test="domain_git" inpId={'domainGit'} inpRef={domainRef} onChangeFn={()=>fetchProjectList(domainRef.current.value, setProjectList, setProjectData, displayError, setLoading)} defValue={"Select Domain"} label={"Domain"} option={domainList}/>
                <FormSelect data-test="project_git" inpId={'projectGit'} inpRef={ProjectRef} onChangeFn={()=>{onChangeProject(resetFields,displayError, showEdit, urlRef, tokenRef ,userData, userRef, projectData, ProjectRef, setLoading, setPopupState)}} defValue={"Select Project"} label={"Project"} option={projectList}/>
                <div className="git_token" >
                    <FormInput data-test="token_git" inpRef={tokenRef} label={'Git Access Token'} placeholder={'Enter Git Access Token'} />
                    <FormInput data-test="url_git" inpRef={urlRef} label={'Git URL'} placeholder={'Enter Git URL'}/>
                </div>
            </div>
        </ScrollBar>
    );
}

const onChangeProject = async (resetFields, displayError, showEdit, urlRef, tokenRef ,userData, userRef, projectData, ProjectRef, setLoading, setPopupState ) =>{
    if(!showEdit) return;
    setLoading("Loading...");
    const data = await gitEditConfig(userData[userRef.current.value], projectData[ProjectRef.current.value]);
    if(data.error){displayError(data.error);return;}
    else if(data == "empty") {
        setPopupState({show:true,title:"Edit Git User",content:"No git configuration created yet."})
        resetFields();
    } else {
        tokenRef.current.value = data[0];
        urlRef.current.value = data[1]
    }
    setLoading(false);
}

const refreshFields = ( domainRef, ProjectRef, userRef, tokenRef, urlRef, setDomainList, setProjectList, setProjectData, setUserList, setUserData, displayError, setLoading) => {
    fetchUsers(setUserList, setUserData, displayError, setLoading);
    setDomainList([])
    setProjectList([])
    setUserData({})
    setProjectData({})
    tokenRef.current.value = "";
    urlRef.current.value = "";
    if(document.getElementById("userGit") !== null) document.getElementById("userGit").selectedIndex = "0"; 
    if(document.getElementById("domainGit") !== null) document.getElementById("domainGit").selectedIndex = "0"; 
    if(document.getElementById("projectGit") !== null) document.getElementById("projectGit").selectedIndex = "0";
    urlRef.current.style.outline = "";
    tokenRef.current.style.outline = "";
    domainRef.current.style.outline = "";
    ProjectRef.current.style.outline = "";
    userRef.current.style.outline = "";
}

const fetchDomainList = async (setDomainList, displayError, setLoading) => {
    setLoading("Loading...");
    let data = await getDomains_ICE() 
    if(data.error){displayError(data.error);return;}
    setDomainList(data);
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

const fetchProjectList = async (domain, setProjectList, setProjectData, displayError, setLoading) => {
    setLoading("Loading Projects...")
    var idtype = ["domaindetails"];
    var requestedname = [];
    requestedname.push(domain);
    const getDetailsResponse = await getDetails_ICE(idtype, requestedname)
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
    setLoading(false);
}

export default GitConfig;
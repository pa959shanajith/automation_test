import React ,  { Fragment, useState} from 'react';
import { getNames_ICE, createProject_ICE, updateProject_ICE, getDomains_ICE} from '../api';
import {ScreenOverlay, PopupMsg} from '../../global'
import { useSelector} from 'react-redux'; 
import '../styles/ProjectButtons.scss';

/*Component ProjectButtons
  use: Contains Project Management Buttons and Create and Update Actions
  todo: Modals
*/
    
const ProjectButtons = (props) => {
    const userInfo = useSelector(state=>state.login.userinfo);
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 

    // Create Project Action
    const create_project = async()=>{
        document.getElementById("create_button").disabled = true;
        props.setProjectNameInputErrorBorder(false);
        if (props.projectName.trim() === "") props.setProjectNameInputErrorBorder(true);
        else if (props.projectTypeSelected=== ""){
            setPopupState({show:true,title:"Create Project",content:"Please select Application Type"});
        } else if (props.releaseList.length === 0) {
            setPopupState({show:true,title:"Create Project",content:"Please add atleast one release"});
        }else {
			var proceedToCreate = true;
			var relNames = "";
			for (var i = 0; i < props.projectDetails.length; i++) {
				if (props.projectDetails[i].cycles.length <= 0) {
					relNames = relNames.length > 0 ? relNames + ", " + props.projectDetails[i].name : props.projectDetails[i].name;
					proceedToCreate = false;
				}
			}
			if (proceedToCreate === false) {
                setPopupState({show:true,title:"Update Project",content:"Please add atleast one cycle for release: " + relNames});
            } 
            else if (proceedToCreate === true) {
				var requestedids = [];
				var idtype = [];
				if ( checkCycle(props.flag)){
                    document.getElementById("create_button").disabled = false;
                    return false;
                } 
                else if (props.selDomain !== "") {
                    requestedids.push(props.selDomain);
                    idtype.push('domainsall');
                    var proceeed = false;
                    const response = await getNames_ICE(requestedids, idtype)
                    if(response.error){displayError(response.error);document.getElementById("create_button").disabled = false;return;}
                    else if (response === "No Projects") {
                        proceeed = true;
                    } else if (response.projectNames.length > 0) {
                        for ( i = 0; i < response.projectNames.length; i++) {
                            if (props.projectName === response.projectNames[i]) {
                                setPopupState({show:true,title:"Create Project",content:"Project Name already Exists"});
                                document.getElementById("create_button").disabled = false;
                                return false;
                            } else proceeed = true;
                        }
                    } else {
                        setPopupState({show:true,title:"Create Project",content:"Failed to create project"});
                        document.getElementById("create_button").disabled = false;
                        return false;
                    }
                    if (proceeed === true) {
                        setLoading("Saving...");
                        const createprojectObj = {};
                        createprojectObj.domain = props.selDomain;
                        createprojectObj.projectName = props.projectName.trim();
                        createprojectObj.appType = props.projectTypeSelected;
                        createprojectObj.projectDetails = props.projectDetails;
                        console.log("Controller: " + createprojectObj);
                        const createProjectRes = await createProject_ICE(createprojectObj)
                        if(createProjectRes.error){displayError(createProjectRes.error);document.getElementById("create_button").disabled = false;return;}
                        else if (createProjectRes === 'success') {
                            setPopupState({show:true,title:"Create Project",content:"Project created successfully"});
                            props.resetForm();
                            props.setProjectDetails([]);
                            refreshDomainList();
                        } else {
                            setPopupState({show:true,title:"Create Project",content:"Failed to create project"});
                            props.resetForm();
                        }
                        setLoading(false);
                    }
				}
            }
            else {
				setLoading(false);
                setPopupState({show:true,title:"Create Project",content:"Please add atleast one cycle for a release"});
			}
        }
        document.getElementById("create_button").disabled = false;
    }

    const refreshDomainList = async () => {
        let data = await getDomains_ICE() 
        if(data.error){displayError(data.error);return;}
        else if(data.length===0){
            data=['Banking','Manufacturing','Finance'];
        }
        props.setSelDomainOptions(data);
    }

    const checkCycle = (flag)=>{
        for (var j = 0; j < props.releaseList.length; j++) {    
			for (var i = 0; i < props.projectDetails.length; i++) {
				if (props.releaseList[j] === props.projectDetails[i].name) {
					if (props.projectDetails[i].cycles.length === 0) {
                        setPopupState({show:true,title:"Create Project",content:"Please add atleast one cycle for a release"});
                        return true;
					}
				}
			}
        };
        return false;
    }
    
    //Update Project Action
    const updateProject = async () =>{
        props.setDomainSelectErrorBorder(false);props.setProjectSelectErrorBorder(false);
        
        if (props.selDomain === "") {
			props.setDomainSelectErrorBorder(true);
		} else if (props.selProject === "") {
			props.setProjectSelectErrorBorder(true);
		} else if (props.releaseList.length === 0) {
            setPopupState({show:true,title:"Update Project",content:"Please add atleast one release"});
		}else {
            setLoading("Loading...");
			props.setFlag(false);
			//Update project details json with editedProjectDetails, deletedProjectDetails, newProjectDetails
            
            var updateProjectObj = {};
			updateProjectObj.projectId = props.selProjectId;
			updateProjectObj.projectName = props.selProject;
			updateProjectObj.appType = props.projectTypeSelected;
			updateProjectObj.editedProjectDetails = "";
			updateProjectObj.deletedProjectDetails = "";
            updateProjectObj.newProjectDetails = "";

            if (updateProjectObj.editedProjectDetails.length <= 0)
				updateProjectObj.editedProjectDetails = props.editedProjectDetails;
			else
				updateProjectObj.editedProjectDetails.push(props.editedProjectDetails);

			if (updateProjectObj.deletedProjectDetails.length <= 0)
				updateProjectObj.deletedProjectDetails = props.deletedProjectDetails;
			else
				updateProjectObj.deletedProjectDetails.push(props.deletedProjectDetails);
            
            var proceedFlag = true;
            var relName = "";
            if (props.newProjectDetails.length > 0) {
                for (var i = 0; i < props.newProjectDetails.length; i++) {
                    var testFlag = true;
                    if (props.newProjectDetails[i].cycles.length <= 0) {
                        for (var j = 0; j < props.updateProjectDetails.length; j++) {
                            if (props.updateProjectDetails[j].name === props.newProjectDetails[i].name && props.updateProjectDetails[j].cycles.length <= 0) {
                                relName = relName.length > 0 ? relName + ", " + props.newProjectDetails[i].name : relName + props.newProjectDetails[i].name;
                                proceedFlag = false;
                                testFlag = false;
                            }
                        }
                        if (testFlag) {
                            relName = relName.length > 0 ? relName + ", " + props.newProjectDetails[i].name : relName + props.newProjectDetails[i].name;
                            proceedFlag = false;
                        }
                    }
                }
            }
            if (props.updateProjectDetails.length > 0) {
				for ( i = 0; i < props.updateProjectDetails.length; i++) {
					if (props.updateProjectDetails[i].cycles.length <= 0) {
						testFlag = true;
						for (j = 0; j < props.newProjectDetails.length; j++) {
							if (props.updateProjectDetails[i].name === props.newProjectDetails[j].name) {
								testFlag = false;
								if (props.newProjectDetails[j].cycles.length <= 0) {
									relName = relName.length > 0 ? relName + ", " + props.updateProjectDetails[i].name : relName + props.updateProjectDetails[i].name;
									proceedFlag = false;
								}
							}
						}
						if (props.newProjectDetails.length <= 0 || testFlag) {
							relName = relName.length > 0 ? relName + ", " + props.updateProjectDetails[i].name : relName + props.updateProjectDetails[i].name;
							proceedFlag = false;
						}
					}
				}
            }
            if (proceedFlag === false) {
                setPopupState({show:true,title:"Update Project",content:"Please add atleast one cycle for release: " + relName});
                setLoading(false);
                return false;
            }
            if (proceedFlag === true) {
                if (updateProjectObj.newProjectDetails.length <= 0)
					updateProjectObj.newProjectDetails = props.newProjectDetails;
				else
					updateProjectObj.newProjectDetails.push(props.newProjectDetails);
                if( updateProjectObj.projectName !== props.editProjectName && props.editProjectName !== "" && props.editProjectName!==false){
                    var requestedids = [];
                    var idtype = [];
                    requestedids.push(props.selDomain);
                    idtype.push('domainsall');
                    var proceeed = false;
                    const response = await getNames_ICE(requestedids, idtype)
                    if(response.error){displayError(response.error);return;}
                    else if (response === "No Projects") {
                        proceeed = true;
                    } else if (response.projectNames.length > 0) {
                        for ( i = 0; i < response.projectNames.length; i++) {
                            if (props.editProjectName.trim() === response.projectNames[i]) {
                                setPopupState({show:true,title:"Create Project",content:"Project Name already Exists"});
                                proceeed = false;
                                setLoading(false);
                                return;
                            } else proceeed = true;
                        }
                    } 
                    if (proceeed === true) updateProjectObj.newProjectName  = props.editProjectName.trim();
                }
                 
                const updateProjectRes = await updateProject_ICE(updateProjectObj, userInfo);
                if(updateProjectRes.error){displayError(updateProjectRes.error);return;}
                props.clearUpdateProjectObjects();
                props.resetForm();
                if (updateProjectRes === 'success') {
                    setPopupState({show:true,title:"Update Project",content:"Project updated successfully"});
                } else {
                    setPopupState({show:true,title:"Update Project",content:"Failed to update project"});
                    // props.resetForm();
                }
                setLoading(false);   
            }
        }    
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    return(
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div className="adminActionBtn">
                {props.taskName==="Create Project"?
                    <Fragment>
                        <button className="btn-md pull-right adminBtn" onClick={()=>props.editProjectTab()}  title="Edit Project">Edit</button>
                        <button id="create_button" onClick={()=>{create_project()}} title="Create Project"  className="btn-md pull-right adminBtn btn-project-cust">Create</button>            
                    </Fragment>
                :<button className="btn-md pull-right adminBtn" onClick={()=>{updateProject()}}  title="Update Project">Update</button>
                }
            </div> 
        </Fragment>
    )
}

export default ProjectButtons;

import React ,  { Fragment, useState} from 'react';
import { getNames_ICE, createProject_ICE, updateProject_ICE} from '../api';
import {ScreenOverlay} from '../../global' 
import '../styles/ProjectButtons.scss';

/*Component ProjectButtons
  use: Contains Project Management Buttons and Create and Update Actions
  todo: Modals
*/
    
const ProjectButtons = (props) => {
    const [valid,setValid] = useState("")
    const [loading,setLoading] = useState(false)
    const [loadingContent,setLoadingContent] = useState("")

    // Create Project Action
    const create_project = async()=>{
        props.setProjectNameInputErrorBorder(false);
        if (props.projectName === "") props.setProjectNameInputErrorBorder(true);
        else if (props.projectTypeSelected=== "") {
            // openModalPopup("Create Project", "Please select Application Type");
            alert("Please select Application Type");
        } else if (props.releaseList.length === 0) {
            // openModalPopup("Create Project", "Please add atleast one release");
            alert("Please add atleast one release");
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
                // openModalPopup("Update Project", "Please add atleast one cycle for release: " + relNames);
                alert("Please add atleast one cycle for release: " + relNames);
            } 
            else if (proceedToCreate === true) {
				// var projectExists = false; //check needed or not
				var requestedids = [];
				var idtype = [];
				checkCycle(props.flag);

				if (valid === "false") {
					return false;
            	} 
            else if (props.selDomain !== "") {
                    //check down line
                    // $('#selDomain').val($('#selDomain').val()[0].toUpperCase()+$('#selDomain').val().slice(1))
                    requestedids.push(props.selDomain);
                    idtype.push('domainsall');
                    var proceeed = false;
                    try{
                        const response = await getNames_ICE(requestedids, idtype)
                        
                        if (response === "Invalid Session");//$rootScope.redirectPage();
                        if (response === "No Projects") {
                            proceeed = true;
                        } else if (response.projectNames.length > 0) {
                            for ( i = 0; i < response.projectNames.length; i++) {
                                if (props.projectName === response.projectNames[i]) {
                                    // openModalPopup("Create Project", "Project Name already Exists");
                                    alert("Project Name already Exists");
                                    // projectExists = true;
                                    return false;
                                } else proceeed = true;
                            }
                        } else {
                            // openModalPopup("Create Project", "Failed to create project");
                            alert("Failed to create project");
                            return false;
                        }
                        if (proceeed === true) {
                            setLoadingContent("Loading...");
                            setLoading(true);
                            // var userDetails = JSON.parse(window.localStorage['_UI']);
                            const createprojectObj = {};
                            createprojectObj.domain = props.selDomain;
                            createprojectObj.projectName = props.projectName.trim();
                            createprojectObj.appType = props.projectTypeSelected;
                            createprojectObj.projectDetails = props.projectDetails;
                            console.log("Controller: " + createprojectObj);
                            try{
                                const createProjectRes = await createProject_ICE(createprojectObj)
                                
                                if (createProjectRes === "Invalid Session");//$rootScope.redirectPage();
                                
                                if (createProjectRes === 'success') {
                                    // openModalPopup("Create Project", "Project created successfully");
                                    alert("Project created successfully");
                                    props.resetForm();
                                    props.setProjectDetails([]);
                                } else {
                                    // openModalPopup("Create Project", "Failed to create project");
                                    alert("Failed to create project");
                                    props.resetForm();
                                }
                                setLoading(false);
                            }catch(error){
                                console.log("Error:::::::::::::", error);
                            }    
                        }
                    }catch(error){
                        console.log("Error:::::::::::::", error);
                    }
				}
            }
            else {
				setLoading(false);
                // openModalPopup("Create Project", "Please add atleast one cycle for a release");
                alert("Please add atleast one cycle for a release");
			}
		}
    }

    const checkCycle = (flag)=>{
        for (var j = 0; j < props.releaseList.length; j++) {    
			for (var i = 0; i < props.projectDetails.length; i++) {
				if (props.releaseList[j] === props.projectDetails[i].name) {
					if (props.projectDetails[i].cycles.length === 0) {
						// openModalPopup("Create Project", "Please add atleast one cycle for a release");
                        alert("Please add atleast one cycle for a release");
                        setValid(false);
						return flag;
					}
				}
			}
        };
    }
    
    //Update Project Action
    const updateProject = async () =>{
        props.setDomainSelectErrorBorder(false);props.setProjectSelectErrorBorder(false);
        
        if (props.selDomain === "") {
			props.setDomainSelectErrorBorder(true);
		} else if (props.selProject === "") {
			props.setProjectSelectErrorBorder(true);
		} else if (props.releaseList.length === 0) {
            alert("Please add atleast one release");
            // openModalPopup("Update Project", "Please add atleast one release");
		}else {
            setLoadingContent("Loading...");
            setLoading(true);
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
				setLoading(false);
				// openModalPopup("Update Project", "Please add atleast one cycle for release: " + relName);
                alert( "Please add atleast one cycle for release: " + relName);
                return false;
            }
            if (proceedFlag === true) {
                if (updateProjectObj.newProjectDetails.length <= 0)
					updateProjectObj.newProjectDetails = props.newProjectDetails;
				else
					updateProjectObj.newProjectDetails.push(props.newProjectDetails);
                 
                try{    
                    const updateProjectRes = await updateProject_ICE(updateProjectObj);
                    if (updateProjectRes === "Invalid Session") {
                        //$rootScope.redirectPage();
                    }
                    props.clearUpdateProjectObjects();
                    if (updateProjectRes === 'success') {
                        //Clearing old data from updateProject object
                        alert("Project updated successfully");
                        // openModalPopup("Update Project", "Project updated successfully");
                        // $timeout(function () {
                        //     $("#projectTab").trigger("click");
                        //     $(".adminActionBtn button:nth-child(1)").trigger("click");
                        // }, 200);
                        // resetForm();  //check if needed or not 
                        
                    } else {
                        // openModalPopup("Update Project", "Failed to update project");
                        alert("Failed to update project");
                        props.resetForm();
                    }
                    setLoading(false);
                }catch(error){
                    console.log("Error:::::::::::::", error);
                }    
            }
        }    
    }

    return(
        <Fragment>
            {loading?<ScreenOverlay content={loadingContent}/>:null}
            <div className="adminActionBtn">
                {props.taskName==="Create Project"?
                    <Fragment>
                        <button className="btn-md pull-right adminBtn" onClick={()=>props.editProjectTab()}  title="Edit Project">Edit</button>
                        <button className="btn-md pull-right adminBtn" onClick={()=>{create_project()}} style={{marginRight:"10px"}} title="Create Project">Create</button>            
                    </Fragment>
                :<button className="btn-md pull-right adminBtn" onClick={()=>{updateProject()}}  title="Update Project">Update</button>
                }
            </div> 
        </Fragment>
    )
}

export default ProjectButtons;

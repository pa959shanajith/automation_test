import React ,  { Fragment, useState} from 'react';
import { getNames_ICE, createProject_ICE, updateProject_ICE, getDomains_ICE, exportProject} from '../api';
import {ScreenOverlay, Messages, VARIANT, ValidationExpression, setMsg} from '../../global'
import { useSelector} from 'react-redux'; 
import '../styles/ProjectButtons.scss';

/*Component ProjectButtons
  use: Contains Project Management Buttons and Create and Update Actions
  todo: Modals
*/
    
const ProjectButtons = (props) => {
    const userInfo = useSelector(state=>state.login.userinfo);
    const [loading,setLoading] = useState(false)

    // Create Project Action
    const create_project = async()=>{
        document.getElementById("create_button").disabled = true;
        props.setProjectNameInputErrorBorder(false);
        if (props.projectName.trim() === "" || !ValidationExpression(props.projectName, "validName")) props.setProjectNameInputErrorBorder(true);
        else if (props.projectTypeSelected=== ""){
            displayError(Messages.ADMIN.WARN_SELECT_APPTYPE);
        } else if (props.releaseList.length === 0) {
            displayError(Messages.ADMIN.WARN_ADD_RELEASE);
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
                setMsg(Messages.CUSTOM("Please add atleast one cycle for release: " + relNames,VARIANT.WARNING));
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
                                displayError(Messages.ADMIN.WARN_PROJECT_EXIST);
                                document.getElementById("create_button").disabled = false;
                                return false;
                            } else proceeed = true;
                        }
                    } else {
                        displayError(Messages.ADMIN.ERR_CREATE_PROJECT);
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
                        const createProjectRes = await createProject_ICE(createprojectObj)
                        if(createProjectRes.status !== undefined ){
                            if(createProjectRes.status === 'fail'){
                                setMsg(Messages.CUSTOM(createProjectRes.message,VARIANT.ERROR))
                                props.resetForm();
                            }
                        }else {
                            if(createProjectRes.error){displayError(createProjectRes.error);document.getElementById("create_button").disabled = false;return;}
                            else if (createProjectRes === 'success') {
                                displayError(Messages.ADMIN.SUCC_PROJECT_CREATE);
                                props.resetForm();
                                props.setProjectDetails([]);
                                refreshDomainList();
                            } else {
                                displayError(Messages.ADMIN.ERR_CREATE_PROJECT);
                                props.resetForm();
                            }
                        }
                        setLoading(false);
                    }
				}
            }
            else {
				setLoading(false);
                displayError(Messages.ADMIN.WARN_ADD_CYCLE);
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
                        displayError(Messages.ADMIN.WARN_ADD_CYCLE);
                        return true;
					}
				}
			}
        };
        return false;
    }

    const validateSubmit = () =>{
        props.setDomainSelectErrorBorder(false);props.setProjectSelectErrorBorder(false);
        if (props.selDomain === "") {
			props.setDomainSelectErrorBorder(true);
		} else if (props.selProject === "") {
			props.setProjectSelectErrorBorder(true);
		} else if (props.releaseList.length === 0) {
            displayError(Messages.ADMIN.WARN_ADD_RELEASE);
        } else{
            return true
        }
        return false 
    }

    const exportProj = async () => {
        var pass = validateSubmit()  
        if(pass){
            setLoading("Loading...");    
            props.setFlag(false);
            var arg = {
                projectId :  props.selProjectId,
                projectName : props.selProject
            }
            var result = await exportProject(arg)
            if(result.error){displayError(result.error);return;}
            var val = downloadFile({result,projectName:props.selProject})
            setLoading(false)
            setMsg(Messages.CUSTOM(val?'Data Exported Successfully.':'Data Export Failed.',val?VARIANT.SUCCESS:VARIANT.ERROR))
        }
    }
    
    //Update Project Action
    const updateProject = async () =>{
        var pass = validateSubmit()        
        if (pass) {
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
                setMsg(Messages.CUSTOM("Please add atleast one cycle for release: " + relName,VARIANT.WARNING));
                setLoading(false);
                return false;
            }
            if (proceedFlag === true) {
                if (updateProjectObj.newProjectDetails.length <= 0)
					updateProjectObj.newProjectDetails = props.newProjectDetails;
				else
					updateProjectObj.newProjectDetails.push(props.newProjectDetails);
                if( updateProjectObj.projectName !== props.editProjectName && props.editProjectName !== "" && props.editProjectName!==false && ValidationExpression(props.editProjectName, "validName")){
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
                                displayError(Messages.ADMIN.WARN_PROJECT_EXIST);
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
                if (updateProjectRes === 'success') displayError(Messages.ADMIN.SUCC_PROJECT_UPDATE);
                else  displayError(Messages.ADMIN.ERR_UPDATE_PROJECT)
                 setLoading(false);   
            }
        }    
    }

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    return(
        <Fragment>
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div className="adminActionBtn">
                {props.taskName==="Create Project"?
                    <Fragment>
                        <button className="a__btn pull-right " onClick={()=>props.editProjectTab()}  title="Edit Project">Edit</button>
                        <button id="create_button" onClick={()=>{create_project()}} title="Create Project"  className="a__btn pull-right  btn-project-cust">Create</button>            
                    </Fragment>
                :
                <>
                    <button className="a__btn pull-right " onClick={()=>{updateProject()}}  title="Update Project">Update</button>
                    <button className="a__btn pull-right btn-project-cust" onClick={()=>{exportProj()}}  title="Export Project">Export</button>
                </>
                }
            </div> 
        </Fragment>
    )
}

/*
function : downloadFile()
Purpose : download zip file
*/

const downloadFile = ({result,projectName}) =>{
    try{
        var file = new Blob([result], { type: 'application/zip' });
        var fileURL = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = fileURL;
        a.download = projectName+'.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        return true
    }catch(err){
        console.log(err)
        return false
    }
}

export default ProjectButtons;

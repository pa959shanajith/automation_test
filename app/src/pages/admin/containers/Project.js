import React ,  { useEffect, useState } from 'react';
import {getAvailablePlugins , getDomains_ICE, getDetails_ICE} from '../api';
import {ScreenOverlay, ModalContainer, ScrollBar, Messages, ValidationExpression, setMsg} from '../../global' 
import ProjectButtons from '../components/ProjectButtons';
import ReleaseCycle from '../components/ReleaseCycle';
import '../styles/Project.scss';

/*Component ProjectNew
  use: renders create New Project page
  todo: 
*/
    
const ProjectNew = (props) => {

    const [taskName,setTaskName] = useState("Create Project")
    const [selProject,setSelProject] = useState("")
    const [selProjectId,setSelProjectId] = useState("")
    const [selProjectOptions,setSelProjectOptions] = useState([])
    const [projectName,setProjectName] = useState("")
    const [selDomain,setSelDomain] = useState("")
    const [projectTypeSelected,setprojectTypeSelected] = useState("")
    const [flag,setFlag] = useState(true);
    const [deletedProjectDetails,setDeletedProjectDetails] = useState([])
    const [updateProjectDetails,setUpdateProjectDetails] = useState([])
    const [newProjectDetails,setNewProjectDetails] = useState([])
    const [editedProjectDetails,setEditedProjectDetails] = useState([])
    const [projectDetails,setProjectDetails] = useState([])
    const [delCount,setDelCount] = useState(0)
    const [count,setCount] = useState(0)
    const [title,setTitle] = useState([])
    const [placeholder,setPlaceholder] = useState([])
    const [applicationType,setApplicationType] = useState([])
    const [selDomainOptions,setSelDomainOptions] = useState([])
    const [showEditModalRelease,setShowEditModalRelease] = useState(false)
    const [showEditNameModalRelease,setShowEditNameModalRelease] = useState(false)
    const [showEditModalCycle,setShowEditModalCycle] = useState(false)
    const [releaseTxt,setReleaseTxt] = useState("")
    const [cycleTxt,setCycleTxt] = useState("")
    const [modalInputErrorBorder,setModalInputErrorBorder] = useState("")
    const [projectNameErrorBorder,setProjectNameInputErrorBorder] = useState(false)
    const [releaseList,setReleaseList] = useState([])
    const [cycleList,setCycleList] = useState([])
    const [disableAddRelease,setDisableAddRelease] = useState(true)
    const [disableAddCycle,setDisableAddCycle] = useState(true)
    const [activeRelease,setActiveRelease] = useState(undefined)
    const [domainSelectErrorBorder,setDomainSelectErrorBorder] = useState(false)
    const [projectSelectErrorBorder,setProjectSelectErrorBorder] = useState(false)
    const [oldCyclename,setOldCyclename] = useState("")
    const [showEditNameModalCycle,setShowEditNameModalCycle] = useState("")
    const [showProjectEditModal,setShowProjectEditModal] = useState(false)
    const [editProjectName,setEditProjectName] = useState(false)
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        getDomains("Create Project");
        setDisableAddRelease(true);
        setDisableAddCycle(true);
        setSelProject("");
        setModalInputErrorBorder(false);
        setDomainSelectErrorBorder(false);
        setProjectSelectErrorBorder(false);
        setProjectNameInputErrorBorder(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["projectTab"]])

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    const getDomains = (screen) => {
        (async()=>{    
            setTaskName("Create Project")
            resetForm(screen);
            setProjectDetails([]);
            setUpdateProjectDetails([]);
            var plugins = []; 
            setLoading("Loading...");
            const plugins_list = await getAvailablePlugins();
            if(plugins_list.error){displayError(plugins_list.error);return;}
            plugins = Object.keys(plugins_list);
            // for (var i = 0; i < plugins_list.length; i++) {
            //     plugins[i] = plugins_list[i];
            // }
            let data = await getDomains_ICE() 
            if(data.error){displayError(data.error);return;}
            else if(data.length===0){
                data=['Banking','Manufacturing','Finance'];
            }
            setSelDomainOptions(data);
            var details = {
                "web":{"data":"Web","title":"Web","img":"web"},
                "webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
                "desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
                "oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
                "mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
                "mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
                "sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
                // "system":{"data":"System","title":"System Apps","img":"desktop"},
                "mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"}
            };
            var listPlugin = [];
            "WEBT" in plugins_list ?  listPlugin.push({...details["web"], enabled: true}):listPlugin.push({...details["web"], enabled: false})
            "APIT" in plugins_list ?  listPlugin.push({...details["webservice"], enabled: true}):listPlugin.push({...details["webservice"], enabled: false})
            "MOBT" in plugins_list ?  listPlugin.push({...details["mobileapp"], enabled: true}):listPlugin.push({...details["mobileapp"], enabled: false})
            "MOBWT" in plugins_list ?  listPlugin.push({...details["mobileweb"], enabled: true}):listPlugin.push({...details["mobileweb"], enabled: false})
            "ETOAP" in plugins_list ?  listPlugin.push({...details["oebs"], enabled: true}):listPlugin.push({...details["oebs"], enabled: false})
            "DAPP" in plugins_list ?  listPlugin.push({...details["desktop"], enabled: true}):listPlugin.push({...details["desktop"], enabled: false})
            "MF" in plugins_list ?  listPlugin.push({...details["mainframe"], enabled: true}):listPlugin.push({...details["mainframe"], enabled: false})
            "ETSAP" in plugins_list ?  listPlugin.push({...details["sap"], enabled: true}):listPlugin.push({...details["sap"], enabled: false})
            if(screen !== undefined) setSelDomain(data[0]);
            else if(taskName==="Create Project") setSelDomain(data[0]);
            else if(taskName==="Update Project") setSelDomain("");
            setApplicationType(listPlugin);
            setLoading(false); 
        })()
    }
    const toggleCycleClick = (props)=>{
        var releaseListLen = releaseList.length;
        var cyclesListLen = cycleList.length;
        if (cyclesListLen === 0 && releaseListLen === 0) setDisableAddCycle(true);
        else if (releaseListLen === 0) setDisableAddCycle(true);
        else setDisableAddCycle(false);
    }   

    const editProjectTab = ()=>{
        setTaskName("Update Project");
        setNewProjectDetails([]);
        setDeletedProjectDetails([]);
        setEditedProjectDetails([]);
        setProjectDetails([]);
        setUpdateProjectDetails([]);
        setprojectTypeSelected("");
        setSelDomain("");
        setReleaseList([])
        setCycleList([])
        setModalInputErrorBorder(false);
        setDomainSelectErrorBorder(false);
        setProjectSelectErrorBorder(false);
        setProjectNameInputErrorBorder(false);
    }

    const resetForm = (screen)=>{
        setProjectDetails([]);
        setProjectName("");
        setEditProjectName(false);
        setSelProjectId("");
        setprojectTypeSelected("");
        setReleaseList([]);
        setCycleList([]);
        setSelProjectOptions([]);
        toggleCycleClick();
        setDisableAddRelease(true);
        setDisableAddCycle(true);
        if (screen===undefined && taskName==="Update Project"){
            setSelProject("");
            setSelDomain("");
        } 
        if(document.getElementById("selProjectOption") !== null)
            document.getElementById("selProjectOption").value="";
	}
    
    const clearUpdateProjectObjects = ()=>{
		setNewProjectDetails([])
        setDeletedProjectDetails([])
        setEditedProjectDetails([])
    }

    const clickAddRelease = (props)=>{
        setFlag(false);
        setTitle("Add Release"); setPlaceholder("Add Release Name");
        setModalInputErrorBorder(false);
        setReleaseTxt("");
        setShowEditModalRelease(true);
    }

    const clickAddReleaseName = (props)=>{
        // eslint-disable-next-line
        var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
        if (releaseTxt.trim() === "") {
            setModalInputErrorBorder(true);
            return false;
        } 
        else if (!reg.test(releaseTxt)) {
            setModalInputErrorBorder(true);
            setReleaseTxt("");
            return false;
        } else {
            setModalInputErrorBorder(false);
            for( var i = 0; i < releaseList.length; i++){
                if ( releaseList[i] === releaseTxt) {
                    setShowEditModalRelease(false);
                    displayError(Messages.ADMIN.WARN_RELEASE_EXIST);
                    setFlag(true);
                    setShowEditModalRelease(false);
                    return false;
                }
            }
            
            setShowEditModalRelease(false);
            if (taskName === "Create Project") {
                releaseList.push(releaseTxt);
                setReleaseList(releaseList);
                setActiveRelease(releaseList[releaseList.length-1]);
                
                var releCycObj = {
                    "name": '',
                    "cycles": []
                };
                releCycObj.name = releaseTxt;
                projectDetails.push(releCycObj);
                setProjectDetails(projectDetails);
                toggleCycleClick();
                setCount(count+1);
                setCycleList([]);
            }
            if (taskName === "Update Project") {
                
                var createNewRelCyc = {
                    "name": releaseTxt,
                    "newStatus": true,
                    "cycles": []
                };
                releaseList.push(releaseTxt);
                setReleaseList(releaseList);
                const dataAdd = [...newProjectDetails];
                dataAdd.push(createNewRelCyc);
                setNewProjectDetails(dataAdd);
                toggleCycleClick();
                setActiveRelease(releaseList[releaseList.length-1]);
                setCount(count+1);
                setCycleList([]);
            }
        }
    }

    const updateReleaseName = ()=>{
		var existingReleaseName = activeRelease;
		setFlag(false);
        var editRelid = existingReleaseName;
        // eslint-disable-next-line
        var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
        if (releaseTxt=== "") {
            setModalInputErrorBorder(true);
            return false;
        } else if (!reg.test(releaseTxt)) {
            setModalInputErrorBorder(true);
            setReleaseTxt("");
            return false;
        } else {
            setModalInputErrorBorder(false);
            for (var i = 0; i < releaseList.length; i++) {
                if (releaseList[i] === releaseTxt) {
                    displayError(Messages.ADMIN.WARN_RELEASE_EXIST);
                    setFlag(true);
                    return false;
                }
            }
            const releaseName = releaseTxt;
            if (taskName === "Create Project") {
                setShowEditNameModalRelease(false);
                for (i = 0; i < projectDetails.length; i++) {
                    if (projectDetails[i].name === existingReleaseName) {
                        projectDetails[i].name = releaseName;
                        setProjectDetails(projectDetails);
                        break;
                    }
                }
                for (i = 0; i < releaseList.length; i++) {
                    if (releaseList[i] === existingReleaseName) {
                        releaseList[i] = releaseName;
                        setReleaseList(releaseList);
                        break;
                    }
                }
                setActiveRelease(releaseName);
            } 
            else if (taskName === "Update Project") {
                for (i = 0; i < updateProjectDetails.length; i++) {
                    if (releaseName.trim() === updateProjectDetails[i].name) {
                        setShowEditNameModalRelease(false);
                        displayError(Messages.ADMIN.WARN_RELEASE_EXIST);
                        return false;
                    }
                }
                for (i = 0; i < newProjectDetails.length; i++) {
                    if (releaseName.trim() === newProjectDetails[i].name) {
                        displayError(Messages.ADMIN.WARN_RELEASE_EXIST);
                        return false;
                    } else {
                        if (existingReleaseName === newProjectDetails[i].name) {
                            newProjectDetails[i].name = releaseName.trim();
                            setNewProjectDetails(newProjectDetails);
                        }
                    }
                }
                setShowEditNameModalRelease(false);
                var oldRelText = existingReleaseName;
                for ( i = 0; i < projectDetails.length; i++) {
                    if (projectDetails[i].name === existingReleaseName) {
                        projectDetails[i].name = releaseName;
                        setProjectDetails(projectDetails);
                        break;
                    }
                }
                for ( i = 0; i < releaseList.length; i++) {
                    if (releaseList[i] === existingReleaseName) {
                        releaseList[i] = releaseName;
                        setReleaseList(releaseList);
                        break;
                    }
                }
                for (i = 0; i < updateProjectDetails.length; i++) {
                    if(updateProjectDetails[i].name === existingReleaseName){
                        var editRelCyc = {
                            "releaseId": "",
                            "name": "",
                            "oldreleaseName": "",
                            "cycles": [],
                            "editStatus": false
                        };
                        updateProjectDetails[i].name = releaseName;
                        setUpdateProjectDetails(updateProjectDetails);

                        //For update project json
                        if (editedProjectDetails.length <= 0) {
                            editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
                            editRelCyc.name = releaseName; //updateProjectDetails[i].name;
                            editRelCyc.oldreleaseName = oldRelText;
                            editRelCyc.editStatus = true;
                            editedProjectDetails.push(editRelCyc);
                            setEditedProjectDetails(editedProjectDetails);
                        } else {
                            var chkPresent = true;
                            for (var m = 0; m < editedProjectDetails.length; m++) {
                                if (editedProjectDetails[m].releaseId === editRelid /*updateProjectDetails[i].releaseId*/) {
                                    editedProjectDetails[m].name = releaseName; //updateProjectDetails[i].name;
                                    editedProjectDetails[m].oldreleaseName = oldRelText;
                                    editedProjectDetails[m].editStatus = true;
                                    setEditedProjectDetails(editedProjectDetails);
                                    chkPresent = false;
                                    break;
                                }
                            }
                            if (chkPresent === true) {
                                editRelCyc.releaseId = editRelid; //updateProjectDetails[i].releaseId;
                                editRelCyc.name = releaseName; //updateProjectDetails[i].name;
                                editRelCyc.oldreleaseName = oldRelText;
                                editRelCyc.editStatus = true;
                                editedProjectDetails.push(editRelCyc);
                                setEditedProjectDetails(editedProjectDetails);
                            }
                        }
                        //For update project json
                        break;
                    }
                }
                setActiveRelease(releaseName);
            }
        }
    }

    const clickEditRelease = (editId) =>{
        // setEditReleaseId(editId);
        setTitle("Edit Release Name");setPlaceholder("Enter New Release Name");
        if (editId !== "releaseName") {
            setModalInputErrorBorder(false);
        }
        setShowEditNameModalRelease(true);
    }

    const clickEditCycle = (editId,oldCycName) =>{
        setOldCyclename(oldCycName);
        setTitle("Edit Cycle Name");setPlaceholder("Enter New Cycle Name");
        setCycleTxt(oldCycName);
        setModalInputErrorBorder(false);
        if (editId !== "cycleName") {
            setModalInputErrorBorder(false);
        }
        setShowEditNameModalCycle(true);
    }
    
    const updateCycleName = () =>{
        var existingCycleName = oldCyclename;
        setFlag(false);
        // eslint-disable-next-line
        var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
        
        for (var i = 0; i < cycleList.length; i++) {
            if (cycleList[i] === cycleTxt.trim()) {
                displayError(Messages.ADMIN.WARN_CYCLE_EXIST);
                setFlag(true);
                return false;
            }
        }
        if (cycleTxt === "") {
            setModalInputErrorBorder(true);
            return false;
        } else if (!reg.test(cycleTxt)) {
            setModalInputErrorBorder(true);
            setCycleTxt("");
            return false;
        }  else {
            var relID = activeRelease;
            for (i = 0; i < updateProjectDetails.length; i++) {
                if (relID === updateProjectDetails[i].name) {
                    for (var j = 0; j < updateProjectDetails[i].cycles.length; j++) {
                        if (cycleTxt.trim() === updateProjectDetails[i].cycles[j].name) {
                            setShowEditNameModalCycle(false);
                            displayError(Messages.ADMIN.WARN_EXIST_CYCLENAME);
                            return false;
                        }
                    }
                    break;
                }
            }
            setModalInputErrorBorder(false);
            var cycleName = cycleTxt;
            setShowEditNameModalCycle(false);
            if (taskName === "Create Project") {
                for ( i = 0; i < cycleList.length; i++) {
                    if (cycleList[i] === existingCycleName) {
                        cycleList[i] = cycleName;
                        setCycleList(cycleList);
                        break;
                    }
                }
                for ( i = 0; i < projectDetails.length; i++) {
                    if (projectDetails[i].name === activeRelease) {
                        for ( j = 0; j < projectDetails[i].cycles.length; j++) {
                            if (projectDetails[i].cycles[j].name === existingCycleName) {
                                projectDetails[i].cycles[j] = {"name":cycleTxt};
                                setProjectDetails(projectDetails);
                            }
                        }
                    }
                }
            } else if (taskName === "Update Project") {
                var oldCycText = oldCyclename;
                for ( i = 0; i < cycleList.length; i++) {
                    if (cycleList[i] === existingCycleName) {
                        cycleList[i] = cycleName;
                        setCycleList(cycleList);
                        break;
                    }
                }
                
                for ( i = 0; i < updateProjectDetails.length; i++) {
                    if (updateProjectDetails[i].name === activeRelease) {
                        for ( j = 0; j < updateProjectDetails[i].cycles.length; j++) {
                            var objectType = typeof(updateProjectDetails[i].cycles[j]);
                            if (objectType === "object" && (updateProjectDetails[i].cycles[j].name === existingCycleName) && (updateProjectDetails[i].name === activeRelease) ) {
                                var editCycId= updateProjectDetails[i].cycles[j]._id;
                                var editRelCyc = {
                                    "releaseId": "",
                                    "name": "",
                                    "oldreleaseName": "",
                                    "cycles": [],
                                    "editStatus": false
                                };
                                var editCycle = {
                                    "oldCycleName": "",
                                    "name": "",
                                    "_id": "",
                                    "editStatus": false
                                };
                                updateProjectDetails[i].cycles[j].name = cycleTxt;

                                //For update project json
                                if (editedProjectDetails.length <= 0) {
                                    //building release details
                                    editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
                                    editRelCyc.name = activeRelease; //updateProjectDetails[i].releaseName;
                                    //building cycle details with release
                                    editCycle.oldCycleName = oldCycText;
                                    editCycle.cyclename = cycleTxt; //updateProjectDetails[i].cycles[j].cycleName;
                                    editCycle._id = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
                                    editCycle.editStatus = true;
                                    editRelCyc.cycles.push(editCycle);
                                    //pushing all data to an array
                                    editedProjectDetails.push(editRelCyc);
                                    setEditedProjectDetails(editedProjectDetails);
                                } else {
                                    var chkRelPresent = true;
                                    for (var m = 0; m < editedProjectDetails.length; m++) {
                                        if (editedProjectDetails[m].name === relID /*updateProjectDetails[i].releaseId*/) {
                                            var chkcycinrel = true;
                                            for (var n = 0; n < editedProjectDetails[m].cycles.length; n++) {
                                                if (editedProjectDetails[m].cycles[n].cycleId === editCycId /*updateProjectDetails[i].cycles[j].cycleId*/) {
                                                    editedProjectDetails[m].cycles[n].cycleName = cycleTxt; //updateProjectDetails[i].cycles[j].cycleName;
                                                    editedProjectDetails[m].cycles[n].oldCycleName = oldCycText;
                                                    editedProjectDetails[m].cycles[n].editStatus = true;
                                                    setEditedProjectDetails(editedProjectDetails);
                                                    chkcycinrel = false;
                                                    break;
                                                }
                                            }
                                            if (chkcycinrel === true) {
                                                //building cycle details with release
                                                editCycle.oldCycleName = oldCycText;
                                                editCycle.cycleName = cycleTxt; //updateProjectDetails[i].cycles[j].cycleName;
                                                editCycle.cycleId = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
                                                editCycle.editStatus = true;
                                                editedProjectDetails[m].cycles.push(editCycle);
                                                setEditedProjectDetails(editedProjectDetails);
                                                break;
                                            }
                                            chkRelPresent = false;
                                        }
                                    }
                                    if (chkRelPresent === true) {
                                        //building release details
                                        editRelCyc.releaseId = relID; //updateProjectDetails[i].releaseId;
                                        editRelCyc.name = activeRelease; //updateProjectDetails[i].releaseName;
                                        //building cycle details with release
                                        editCycle.oldCycleName = oldCycText;
                                        editCycle.cycleName = cycleTxt; //updateProjectDetails[i].cycles[j].cycleName;
                                        editCycle.cycleId = editCycId; //updateProjectDetails[i].cycles[j].cycleId;
                                        editCycle.editStatus = true;
                                        editRelCyc.cycles.push(editCycle);
                                        //pushing all data to an array
                                        editedProjectDetails.push(editRelCyc);
                                        setEditedProjectDetails(editedProjectDetails);
                                    }
                                }
                                break;
                            }
                            //For update project json
                            if (objectType === "string" && (updateProjectDetails[i].cycles[j].name === existingCycleName)) {
                                updateProjectDetails[i].cycles[j] = cycleTxt;
                                setUpdateProjectDetails(updateProjectDetails);
                            }
                        }
                    }
                }
            }
        }
    }

    const clickAddCycle = (props)=>{
        setFlag(false);
        setTitle("Add Cycle");setPlaceholder("Add Cycle Name");
        setModalInputErrorBorder(false);
        setCycleTxt("");
        setShowEditModalCycle(true);
    }

    //Add Cycle Name Functionality
    const clickAddCycleName = (props)=>{
        // eslint-disable-next-line 
        var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
        var relName = activeRelease;
        // e.preventDefault();
        setModalInputErrorBorder(false);
        if (cycleTxt.trim() === "") {
            setModalInputErrorBorder(true);
            return false;
        } else if (!reg.test(cycleTxt)) {
            setModalInputErrorBorder(true);
            setCycleTxt("");
            return false;
        }else {
            for( var i = 0; i < cycleList.length; i++){
                if ( cycleList[i] === cycleTxt) {
                    setShowEditModalCycle(false);
                    displayError(Messages.ADMIN.WARN_CYCLE_EXIST);
                    setFlag(true);
                    return false;
                }
            }
            setModalInputErrorBorder(false);
            const cycleName = cycleTxt;

            setShowEditModalCycle(false);
            if (taskName === "Create Project") {
                cycleList.push(cycleName);
                
                const ProjectDetails = projectDetails;
                for (i = 0; i < ProjectDetails.length; i++) {
                    if (ProjectDetails[i].name === activeRelease) {
                        ProjectDetails[i].cycles.push({"name":cycleName});
                    }
                }
                setProjectDetails(ProjectDetails);
                toggleCycleClick();
                setDelCount(delCount+1);
            }
            if (taskName === "Update Project") {
                var createNewRelCyc = {
                    "name": "",
                    "releaseId": "",
                    "newStatus": false,
                    "cycles": []
                };
                var createCyc = {
                    "name": "",
                    "newStatus": true
                };
                setDelCount((delCount + 1) * 3);
                cycleList.push(cycleName);
                // var RelID = activeRelease;
                var RelID = activeRelease;// please check why in orignal also undefined 
                //For update project json
                if (newProjectDetails.length <= 0) {
                    createNewRelCyc.name = relName;
                    createNewRelCyc.releaseId = RelID;
                    createCyc.name = cycleName;
                    createNewRelCyc.cycles.push(createCyc);
                    newProjectDetails.push(createNewRelCyc);
                    setNewProjectDetails(newProjectDetails);
                } else {
                    var chk = true;
                    for (var j = 0; j < newProjectDetails.length; j++) {
                        // if (newProjectDetails[j].name === relName && newProjectDetails[j].releaseId === RelID) {
                        //check when cycle is added to new created release RelID is undefined (check not needed)
                        if (newProjectDetails[j].name === relName ) {
                            createCyc.name = cycleName;
                            newProjectDetails[j].cycles.push(createCyc);
                            setNewProjectDetails(newProjectDetails);
                            chk = false;
                            break;
                        }
                    }
                    if (chk === true) {
                        createNewRelCyc.name = relName;
                        createNewRelCyc.releaseId = RelID;
                        createCyc.name = cycleName;
                        createNewRelCyc.cycles.push(createCyc);
                        newProjectDetails.push(createNewRelCyc);
                        setNewProjectDetails(newProjectDetails);
                    }
                }
                //console.log(newProjectDetails); 
                toggleCycleClick();
                setDelCount(delCount+1);
                
            }
        }    
    }

    const clickReleaseListName = (props)=>{
        var releaseName = props.releaseName;
        setActiveRelease(props.releaseName);
        setReleaseTxt(props.releaseName);
        if (releaseList.length === 0) {
            setCycleList([]);
			setUpdateProjectDetails([]);
		}
		toggleCycleClick();
        var id = "#".concat(props.id);
		if (taskName === "Create Project" && id.indexOf("edit") !== 0 && id.indexOf("delete") !== 0) {
            const CycleList = [];
			if (projectDetails.length > 0) {
				for (var i = 0; i < projectDetails.length; i++) {
					if (projectDetails[i].name === releaseName && 'cycles' in projectDetails[i]) {
						for (var j = 0; j < projectDetails[i].cycles.length; j++) {
                            CycleList.push(projectDetails[i].cycles[j].name);
						}
					}
				}
            }
            setCycleList(CycleList);
        }

        if (taskName === "Update Project" && id.indexOf("edit") !== 1 && id.indexOf("delete") !== 1) {
            const CycleList = [];
			//Check Release details if already exist
			if (updateProjectDetails.length > 0) {
				for ( i = 0; i < updateProjectDetails.length; i++) {
					if (updateProjectDetails[i].name === releaseName && 'cycles' in updateProjectDetails[i]) {
						for ( j = 0; j < updateProjectDetails[i].cycles.length; j++) {
							var objectType = typeof(updateProjectDetails[i].cycles[j]);
							if (objectType === "object") {
                                CycleList.push(updateProjectDetails[i].cycles[j].name);
							} else if (objectType === "string") {
                                CycleList.push(updateProjectDetails[i].cycles[j])
                            }
						}
					}
                }
                setCycleList(CycleList);
			}

			//Check Release details if newly added
			if (newProjectDetails.length > 0) {
				for (i = 0; i < newProjectDetails.length; i++) {
					if (newProjectDetails[i].name === releaseName && 'cycles' in newProjectDetails[i]) {
						for (j = 0; j < newProjectDetails[i].cycles.length; j++) {
							objectType = typeof(newProjectDetails[i].cycles[j]);
							if (objectType === "object") {
                                CycleList.push(newProjectDetails[i].cycles[j].name);
                            } else if (objectType === "string") {
                                CycleList.push(newProjectDetails[i].cycles[j])
                            }
						}
					}
                }
                setCycleList(CycleList);
            }
		}
    }

    const fetchProjectList = async (domain) =>{
        if(taskName==="Update Project"){
            setLoading("Loading Projects...")
            var domainName =domain;
			var requestedname = [];
            requestedname.push(domainName);
            var idtype = ["domaindetails"];

            const getDetailsResponse = await getDetails_ICE(idtype, requestedname)
            if(getDetailsResponse.error){displayError(getDetailsResponse.error);return;}
            setSelProjectOptions([])
            const projectOptions=[];
            for (var i = 0; i < getDetailsResponse.projectNames.length; i++) {
                projectOptions.push({id:getDetailsResponse.projectIds[i],name:getDetailsResponse.projectNames[i]})
            }    
            
            projectOptions.sort((a,b)=>a.name.localeCompare(b.name));
            setSelProjectOptions(projectOptions);
            document.getElementById("selProjectOption").selectedIndex = "0";  
            setEditProjectName(false);
            setSelProject("")
            setLoading(false);
            clearUpdateProjectObjects();
        }    
    }
   
    const selectProject = async (projectId) =>{
        setModalInputErrorBorder(false);
        setSelProjectId(projectId);
        for (var i = 0; i < selProjectOptions.length; i++) {
            if(selProjectOptions[i].id === projectId){
                setSelProject(selProjectOptions[i].name);
                setEditProjectName(selProjectOptions[i].name)
                break;
            }
        }
        setDisableAddRelease(false);
        setUpdateProjectDetails([])
        var domaiprojectId = projectId;
        var projects = [];
        var requestedids = [domaiprojectId];
        var idtype = ["projectsdetails"];
        projects.push(domaiprojectId);
        const selProjectRes = await getDetails_ICE(idtype, requestedids);
        if(selProjectRes.error){displayError(selProjectRes.error);return;}
        setprojectTypeSelected(selProjectRes.appType);
        setUpdateProjectDetails(selProjectRes.projectDetails);
        setCycleList([]);
        const RelaseNames = [];
        selProjectRes.projectDetails.map((objctNames)=>(
            RelaseNames.push(objctNames.name)
        ))
        const cycleNames = [];
        selProjectRes.projectDetails[0].cycles.map((objctNames)=>(
            cycleNames.push(objctNames.name)
        ))
        setReleaseList(RelaseNames);
        setCycleList(cycleNames)
        setActiveRelease(RelaseNames[0]);
        setDisableAddCycle(false);
        clearUpdateProjectObjects();
    }

    const closeModal = () =>{
        setShowProjectEditModal(false);
    }

    const editModalButtons = () =>{
        return(
            <div>
                <button type="button" onClick={()=>{setShowProjectEditModal(false);}} >Save</button>
            </div>
        )
    } 

    const projectEditFunction = (newName) =>{
        newName = ValidationExpression(newName,"projectName");
        setEditProjectName(newName);
        setModalInputErrorBorder(false);
        if(newName.trim() === ""){
            setModalInputErrorBorder(true);
        } 
    } 

    const updateProjectName = (value) => {
        value = ValidationExpression(value,"projectName");
        setProjectName(value);
    }

    return (
    <ScrollBar thumbColor="#929397">
    <div className="project_conatiner">
        {loading?<ScreenOverlay content={loading}/>:null}
        <div id="page-taskName">
				{taskName==="Create Project"?
                <span>Create Project</span>
                :<span>Update Project</span>
                }
		</div>
        
        <ProjectButtons setSelDomainOptions={setSelDomainOptions} editProjectName={editProjectName} setProjectDetails={setProjectDetails} selDomain={selDomain} resetForm={resetForm} newProjectDetails={newProjectDetails} projectDetails={projectDetails} releaseList={releaseList} selProject={selProject} updateProjectDetails={updateProjectDetails} projectTypeSelected={projectTypeSelected} projectName={projectName} flag={flag} clearUpdateProjectObjects={clearUpdateProjectObjects} setProjectNameInputErrorBorder={setProjectNameInputErrorBorder} taskName={taskName} setFlag={setFlag} editProjectTab={editProjectTab} selProjectId={selProjectId} editedProjectDetails={editedProjectDetails} deletedProjectDetails={deletedProjectDetails} setDomainSelectErrorBorder={setDomainSelectErrorBorder} setProjectSelectErrorBorder={setProjectSelectErrorBorder}/>

        <div className="col-xs-9 form-group" style={{width: "83%"}}>
            <div className='userForm-project projectForm-project display-project' >
                <div className='domainTxt'>Domain</div>
                <select defaultValue={""} value={selDomain} onChange={(event)=>{fetchProjectList(event.target.value);setSelDomain(event.target.value);}} className={domainSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project domain-custom':"adminSelect-project form-control__conv-project domain-custom"} id="selDomain" >
                    {(taskName==="Update Project")?
                        <option disabled={true} value="">Please Select Your Domain</option>
                    :null}
                    {selDomainOptions.map((e,i)=>(
                        <option key={i}  value={selDomainOptions[i]} onClick={()=>{fetchProjectList();setSelDomain(selDomainOptions[i]);}}>{selDomainOptions[i]}</option>
                    ))}
                </select>
            </div>
            {(taskName==="Update Project")?
            <div className='userForm-project projectForm-project display-project'  >
                <div className='domainTxt'>Project</div>
                <select onChange={(event)=>{selectProject(event.target.value);}}  className={projectSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project sel-domain-wid':"adminSelect-project form-control__conv-project sel-domain-wid"} id="selProjectOption" >
                        <option disabled={true} value="" selected>Please Select Your Project</option>
                        {selProjectOptions.map((optionProject)=>(
                            <option key={optionProject.id} name={optionProject.name} value={optionProject.id}>{optionProject.name}</option>
                        ))}
                </select>
                <span  className={"edit-project "+(selProject===""?" disableEditProject-span":"")} >
                    <img onClick={()=>{setShowProjectEditModal(true)}} title='Edit Project Name' src={"static/imgs/ic-edit-sm.png"} alt="Edit Project Name" className={'editProjectName'+(selProject===""?" disableEditProject":"")}/>
                </span>
            </div>
            
            :<div className='userForm-project adminControl-project display-project' >
                <div className='domainTxt'>Name</div>
                <input value={projectName} onChange={(event)=>{updateProjectName(event.target.value)}} type="text" autoComplete="off" id="projectName" name="projectName" maxLength="100" className={projectNameErrorBorder?"inputErrorBorder middle__input__border form-control__conv-project form-control-custom def-margin":"middle__input__border form-control__conv-project form-control-custom def-margin"} placeholder="Project Name"/>
            </div>
            }
            <div className='userForm-project adminControl-project display-project'>
                {editProjectName!==selProject && editProjectName!=="" && editProjectName!==false && showProjectEditModal===false && ValidationExpression(editProjectName, "validName") ? 
                <div className='edit-project__label'>New Project Name : {editProjectName}. Please click on Update.</div>:null}
            </div>
            
            
            {(taskName==="Update Project" && projectTypeSelected !== "") ? <>
                <div className='domainTxt appTypeTxt'>Selected Application Type</div>
                <div className="appTypesContainer">
                    {applicationType.map((app)=>(
                        (app.data === projectTypeSelected) && <div key={app.data} style={app['enabled'] ? {} : {cursor: 'no-drop'}} className="projectTypeSelected projectTypes_create" data-app={app['data']}  title={app['enabled'] ? app['title'] : 'License Not Available'} ><img style={app['enabled'] ? {} : {filter: 'contrast(0)'}} src={"static/imgs/"+app['img']+".png"} alt={app['title']}/><label style={app['enabled'] ? {} : {cursor: 'no-drop'}}>{app['title']}</label></div>
                    ))}
                </div>
            </> : <>
                <div className='domainTxt appTypeTxt'>Application Type</div>
                <div className={taskName==="Update Project" ? "disableApplicationType appTypesContainer" : "appTypesContainer"}>
                    {applicationType.map((e,i)=>(
                        <div key={i} style={applicationType[i]['enabled'] ? {} : {cursor: 'no-drop'}} onClick={()=>{(applicationType[i]['enabled']) && setprojectTypeSelected(applicationType[i]['data'])}}  className={(projectTypeSelected===applicationType[i]['data'])?"projectTypeSelected projectTypes_create":"projectTypes_create"} data-app={applicationType[i]['data']}  title={applicationType[i]['enabled'] ? applicationType[i]['title'] : 'License Not Available'} ><img style={applicationType[i]['enabled'] ? {} : {filter: 'contrast(0)'}} src={"static/imgs/"+applicationType[i]['img']+".png"} alt={applicationType[i]['title']}/><label style={applicationType[i]['enabled'] ? {} : {cursor: 'no-drop'}}>{applicationType[i]['title']}</label></div>
                    ))}
                </div>
            </>}
        </div>

        <ReleaseCycle clickAddRelease={clickAddRelease} releaseList={releaseList} clickReleaseListName={clickReleaseListName} setActiveRelease={setActiveRelease} clickEditRelease={clickEditRelease} activeRelease={activeRelease} count={count} clickAddCycle={clickAddCycle} cycleList={cycleList} clickEditCycle={clickEditCycle} delCount={delCount} disableAddRelease={disableAddRelease} taskName={taskName} disableAddCycle={disableAddCycle} />
       
        {(showEditModalRelease)? <ModalContainer title={title} footer={ModalButtonsFooter(clickAddReleaseName)} close={()=>{setShowEditModalRelease(false)}} content={ModalContainerMiddleContent(modalInputErrorBorder, releaseTxt, setReleaseTxt, placeholder, "releaseTxt" )} modalClass=" modal-sm" />:null}   
        {(showEditModalCycle)? <ModalContainer title={title} footer={ModalButtonsFooter(clickAddCycleName)} close={()=>{setShowEditModalCycle(false)}} content={ModalContainerMiddleContent(modalInputErrorBorder, cycleTxt, setCycleTxt, placeholder, "cycleTxt" )} modalClass=" modal-sm" /> :null} 
        {(showEditNameModalRelease)? <ModalContainer title={title} footer={ModalButtonsFooter(updateReleaseName)} close={()=>{setShowEditNameModalRelease(false)}} content={ModalContainerMiddleContent(modalInputErrorBorder, releaseTxt, setReleaseTxt, placeholder, "releaseTxt" )} modalClass=" modal-sm" />:null} 
        {(showEditNameModalCycle)? <ModalContainer title={title} footer={ModalButtonsFooter(updateCycleName)} close={()=>{setShowEditNameModalCycle(false)}} content={ModalContainerMiddleContent(modalInputErrorBorder, cycleTxt, setCycleTxt, placeholder, "cycleTxt" )} modalClass=" modal-sm" /> :null}
        {showProjectEditModal? <ModalContainer title="Edit Project Name" footer={editModalButtons()} close={closeModal} content={editModalcontent(editProjectName, projectEditFunction, modalInputErrorBorder, projectNameErrorBorder)} modalClass=" modal-sm" /> :null}  
    </div>
    </ScrollBar>
  );
}

const ModalContainerMiddleContent = (modalInputErrorBorder,Txt,setTxt, placeholder, ValidExpression) => {
    const updateName = (value) => {
        value = ValidationExpression(value,ValidExpression);
        setTxt(value);
    }
    return(
        <p><input autoComplete="off" value={Txt} onChange={(event)=>{updateName(event.target.value)}} maxLength="100" type="text" className={(modalInputErrorBorder)?"middle__input__border form-control__conv form-control-custom inputErrorBorder":"middle__input__border form-control__conv form-control-custom"}  placeholder={placeholder}/></p>
    )
}

const ModalButtonsFooter = (saveAction) =>{
    return(
        <div>
            <button type="button" onClick={()=>{saveAction();}} >Save</button>
        </div>
    )
} 

const editModalcontent = (editProjectName, projectEditFunction, modalInputErrorBorder, projectNameErrorBorder) =>{
    return(
        <div>
            <input value={editProjectName} onChange={(event)=>{projectEditFunction(event.target.value)}} type="text" autoComplete="off" id="editProjectName" name="editProjectName" maxLength="100" className={ (modalInputErrorBorder?"inputErrorBorder ":"") + (projectNameErrorBorder?"inputErrorBorder ":"") + "middle__input__border form-control__conv-project form-control-custom"} placeholder="Project Name"/>
        </div>
    )
} 


export default ProjectNew;
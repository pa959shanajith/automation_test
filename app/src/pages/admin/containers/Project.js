import React ,  { Fragment, useEffect, useState } from 'react';
import {getAvailablePlugins , getDomains_ICE, getDetails_ICE} from '../api';
import EditGlobalModal from '../components/EditGlobalModal'
import {ScreenOverlay,PopupMsg} from '../../global' 
import ProjectButtons from '../components/ProjectButtons';
import ReleaseCycle from '../components/ReleaseCycle';
import 'font-awesome/css/font-awesome.min.css';
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
    const [inputID,setInputID] = useState([])
    const [placeholder,setPlaceholder] = useState([])
    const [buttonID,setButtonID] = useState([])
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
    // const [cycleListClass,setCycleListClass] = useState(true)
    const [disableAddCycle,setDisableAddCycle] = useState(true)
    const [activeRelease,setActiveRelease] = useState(undefined)
    const [domainSelectErrorBorder,setDomainSelectErrorBorder] = useState(false)
    const [projectSelectErrorBorder,setProjectSelectErrorBorder] = useState(false)
    // const [editReleaseID,setEditReleaseId] = useState("")
    const [oldCyclename,setOldCyclename] = useState("")
    const [showEditNameModalCycle,setShowEditNameModalCycle] = useState("")
    const [loading,setLoading] = useState(false)
    const [loadingContent,setLoadingContent] = useState("")
    const [showPopup,setShowPopup] = useState(false)   
    const [popupContent,setPopupContent] = useState("")  
    const [popupTitle,setPopupTitle] = useState("") 

    useEffect(()=>{
        getDomains();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["projectTab"]])

    const getDomains = () => {
        (async()=>{    
            setTaskName("Create Project")
            resetForm();
            setProjectDetails([]);
            setUpdateProjectDetails([]);
            var plugins = []; 
            try{
                setLoadingContent("Loading...");
                setLoading(true);
                const plugins_list = await getAvailablePlugins();
                for (var i = 0; i < plugins_list.length; i++) {
                    plugins[i] = plugins_list[i];
                }
                // $timeout(function () {
                // 	$('.scrollbar-inner').scrollbar();
                // 	toggleCycleClick();
                // }, 10);
                try{
                    const data = await getDomains_ICE()
                    if (data === "Invalid Session") ;// $rootScope.redirectPage();
                    else {
                        if(data.length===0){
                            // eslint-disable-next-line
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
                            "system":{"data":"System","title":"System Apps","img":"desktop"},
                            "mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"}
                        };
                        var listPlugin = [];
                        for ( i = 0; i < plugins.length; i++) {
                            listPlugin.push(details[plugins[i]]);
                        }
                        if(taskName==="Create Project") setSelDomain(data[0]);
                        if(taskName==="Update Project") setSelDomain("");
                        setApplicationType(listPlugin);
                    }
                }catch(error){
                    console.log("Error:::::::::::::", error);
                } 
                setLoading(false);   
            }catch(error){
                setLoading(false);
                console.log("Error:::::::::::::", error);
            }
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
    }

    const resetForm = ()=>{
        setProjectDetails([]);
        setProjectName("");
        setSelProjectId("");
        setprojectTypeSelected("");
        setReleaseList([]);
        setCycleList([]);
		toggleCycleClick();
	}
    
    const clearUpdateProjectObjects = ()=>{
		setNewProjectDetails([])
        setDeletedProjectDetails([])
        setEditedProjectDetails([])
    }

    const clickAddRelease = (props)=>{
        setFlag(false);
        setTitle("Add Release"); setInputID("releaseTxt"); setPlaceholder("Add Release Name");setButtonID("addReleaseName");
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
            var flag1 = flag;
            for( var i = 0; i < releaseList.length; i++){
                if ( releaseList[i] === releaseTxt) {
                    setShowEditModalRelease(false);
                    setPopupTitle("Add Release");
                    setPopupContent("Release Name already exists");
                    setShowPopup(true);
                    setFlag(true);
                    flag1 = true;
                }
            }
            if (flag1 === true) {
                setShowEditModalRelease(false);
                return false;
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
            // if ($("#releaseList li").length >= 11)
            //     $('.scrollbar-inner').scrollbar();
            // e.stopImmediatePropagation();
        }
    }

    const updateReleaseName = ()=>{
		var existingReleaseName = activeRelease;
		setFlag(false);
		// var editReleaseId = editReleaseID;
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
            var flag1 = flag;
            setModalInputErrorBorder(false);
            for (var i = 0; i < releaseList.length; i++) {
                if (releaseList[i] === releaseTxt) {
                    // $(".close:visible").trigger('click');
                    setPopupTitle("Add Release");
                    setPopupContent("Release Name already exists");
                    setShowPopup(true);
                    setFlag(true);
                    flag1 = true;
                }
            }

            if (flag1 === true) {
                return false;
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
                        setPopupTitle("Add Release");
                        setPopupContent("Release Name already exists");
                        setShowPopup(true);
                        return false;
                    }
                }
                for (i = 0; i < newProjectDetails.length; i++) {
                    if (releaseName.trim() === newProjectDetails[i].name) {
                        setShowEditNameModalRelease(false);
                        setPopupTitle("Edit Release Name");
                        setPopupContent("Release Name already exists");
                        setShowPopup(true);
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
            
            //$("#"+editReleaseId).addClass("editedRelease");
            //$("#"+editReleaseId).siblings(".deleteRelease").addClass("editedRelease");
            // event.stopImmediatePropagation();
        }
    }

    const clickEditRelease = (editId) =>{
        // setEditReleaseId(editId);
        setTitle("Edit Release Name"); setInputID("releaseName"); setPlaceholder("Enter New Release Name");setButtonID("updateReleaseName");
        if (editId !== "releaseName") {
            setModalInputErrorBorder(false);
        }
        setShowEditNameModalRelease(true);
    }

    const clickEditCycle = (editId,oldCycName) =>{
        setOldCyclename(oldCycName);
        setTitle("Edit Cycle Name"); setInputID("cycleName"); setPlaceholder("Enter New Cycle Name");setButtonID("updateCycleName");
        setCycleTxt(oldCycName);
        setModalInputErrorBorder(false);
        if (editId !== "cycleName") {
            setModalInputErrorBorder(false);
        }
        setShowEditNameModalCycle(true);
    }
    
    const updateCycleName = () =>{
        var existingCycleName = oldCyclename;
        // var editCycId = oldCyclename; //check if needed or not || using from updateProjectDetails
        setFlag(false);
        // eslint-disable-next-line
        var reg = /^[a-zA-Z0-9\s\.\-\_]+$/;
        var flag1 = flag;
        for (var i = 0; i < cycleList.length; i++) {
            if (cycleList[i] === cycleTxt.trim()) {
                setPopupTitle("Add Cycle");
                setPopupContent("Cycle Name already exists for this release");
                setShowPopup(true);
                setFlag(true);
                flag1 = true;
            }
        }
        if (flag1 === true) {
            return false;
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
                            setPopupTitle("Edit Cycle Name");
                            setPopupContent("Cycle Name already exists");
                            setShowPopup(true);
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
                            if (objectType === "object" && (updateProjectDetails[i].cycles[j].name === existingCycleName) && (updateProjectDetails[i].name === activeRelease) ) { //&& (updateProjectDetails[i].cycles[j]._id === editCycleId)
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
                                //console.log("objectType", typeof(updateProjectDetails[i].cycles[j]))
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
            //$("#"+editCycleId).addClass("editedCycle");
            //$("#"+editCycleId).siblings(".deleteCycle").addClass("editedCycle");
            // event.stopImmediatePropagation();
            // $("#" + event.target.id).unbind('click');
        }
    }

    const clickAddCycle = (props)=>{
        setFlag(false);
        setTitle("Add Cycle"); setInputID("cycleTxt"); setPlaceholder("Add Cycle Name");setButtonID( "addCycleName");
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
            var flag1 = flag;
            for( var i = 0; i < cycleList.length; i++){
                if ( cycleList[i] === cycleTxt) {
                    setShowEditModalCycle(false);
                    setPopupTitle("Add Cycle");
                    setPopupContent("Cycle Name already exists for this release");
                    setShowPopup(true);
                    setFlag(true);
                    flag1 = true;
                }
            }
            if (flag1 === true) {
                return false;
            }
            setModalInputErrorBorder(false);
            const cycleName = cycleTxt;

            setShowEditModalCycle(false);
            // setCycleListClass(false);
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
                var RelID = undefined;// please check why in orignal also undefined 
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
                        if (newProjectDetails[j].name === relName && newProjectDetails[j].releaseId === RelID) {
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
            // if ($("#cycleList li:visible").length >= 11)
            //     $('.scrollbar-inner').scrollbar();
            // e.stopImmediatePropagation();
        }    
    }

    //Toggle Release Edit Delete Icons
    const showHideEditDeleteIcons =  ()=>{
        // $("#releaseList li").each(function () {
		// 	if ($(this).hasClass("active")) {
		// 		$(this).children("span.actionOnHover").children("img").show();
		// 	} else {
		// 		$(this).children("span.actionOnHover").children("img").hide();
		// 	}
		// });
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
    	showHideEditDeleteIcons();
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
            var domainName =domain;
			var requestedname = [];
            requestedname.push(domainName);
            var idtype = ["domaindetails"];

            try{
                const getDetailsResponse = await getDetails_ICE(idtype, requestedname)
                setSelProjectOptions([])
                const projectOptions=[];
                for (var i = 0; i < getDetailsResponse.projectNames.length; i++) {
                    projectOptions.push({id:getDetailsResponse.projectIds[i],name:getDetailsResponse.projectNames[i]})
                }    
                setSelProjectOptions(projectOptions)
                if (getDetailsResponse === "Invalid Session");// $rootScope.redirectPage();
            }catch(error){
                console.log("Error:::::::::::::", error);
            }
            clearUpdateProjectObjects();
        }    
    }
   
    const selectProject = async (projectId) =>{

        setSelProjectId(projectId);
        for (var i = 0; i < selProjectOptions.length; i++) {
            if(selProjectOptions[i].id === projectId){
                setSelProject(selProjectOptions[i].name);
                break;
            }
        }
        setUpdateProjectDetails([])
        var domaiprojectId = projectId;
        var projects = [];
        var requestedids = [domaiprojectId];
        var idtype = ["projectsdetails"];
        projects.push(domaiprojectId);
        try{    
            const selProjectRes = await getDetails_ICE(idtype, requestedids);
            if (selProjectRes === "Invalid Session");//$rootScope.redirectPage();
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
            // for (var i = 0; i < updateProjectDetails.length; i++) {
            //     $("#releaseList:not(.createRelBox)").append("<li class='updateRelease' id='releaseList_" + i + "'><img src='imgs/ic-release.png' /><span title=" + updateProjectDetails[i].name + " data-releaseid=" + updateProjectDetails[i].name + " class='releaseName'>" + updateProjectDetails[i].name + "</span><span class='actionOnHover'><img id=editReleaseName_" + i + " title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_" + i + " title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
            //     $("#releaseList:not(.createRelBox) li:first").trigger('click');
            // }
            // showHideEditDeleteIcons();
            }catch(error){
            console.log("Error:::::::::::::", error);
        }
        clearUpdateProjectObjects();
    }

    const closePopup = () =>{
        setShowPopup(false);
    }
    
    return (
    <Fragment>
        {showPopup?<PopupMsg content={popupContent} title={popupTitle} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}    
        {loading?<ScreenOverlay content={loadingContent}/>:null}
        <div id="page-taskName">
				{taskName==="Create Project"?
                <span>Create Project</span>
                :<span>Update Project</span>
                }
		</div>
        
        <ProjectButtons setProjectDetails={setProjectDetails} selDomain={selDomain} resetForm={resetForm} newProjectDetails={newProjectDetails} projectDetails={projectDetails} releaseList={releaseList} selProject={selProject} updateProjectDetails={updateProjectDetails} projectTypeSelected={projectTypeSelected} projectName={projectName} flag={flag} clearUpdateProjectObjects={clearUpdateProjectObjects} setProjectNameInputErrorBorder={setProjectNameInputErrorBorder} taskName={taskName} setFlag={setFlag} editProjectTab={editProjectTab} selProjectId={selProjectId} editedProjectDetails={editedProjectDetails} deletedProjectDetails={deletedProjectDetails} setDomainSelectErrorBorder={setDomainSelectErrorBorder} setProjectSelectErrorBorder={setProjectSelectErrorBorder}/>

        <div className="col-xs-9 form-group" style={{width: "83%"}}>
            <div className='userForm-project projectForm-project' style={{display: "flex"}} >
                <div className='domainTxt'>Domain</div>
                <select onChange={(event)=>{fetchProjectList(event.target.value);setSelDomain(event.target.value);}} className={domainSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project ':"adminSelect-project form-control__conv-project "} id="selDomain" style={{width: "100%"}} >
                    {(taskName==="Update Project")?
                        <option value="" selected>Please Select Your Domain</option>
                    :null}
                    {selDomainOptions.map((e,i)=>(
                        <option key={i}  value={selDomainOptions[i]} onClick={()=>{fetchProjectList();setSelDomain(selDomainOptions[i]);}}>{selDomainOptions[i]}</option>
                    ))}
                </select>
            </div>
            {(taskName==="Update Project")?
            <div className='userForm-project projectForm-project' style={{display: "flex"}} >
                <div className='domainTxt'>Project</div>
                <select onChange={(event)=>{selectProject(event.target.value);}}  className={projectSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project ':"adminSelect-project form-control__conv-project "} id="selDomain" style={{width: "100%"}} >
                        <option value="" selected>Please Select Your Project</option>
                        {selProjectOptions.map((optionProject)=>(
                            <option key={optionProject.id} name={optionProject.name} value={optionProject.id}>{optionProject.name}</option>
                        ))}
                </select>
            </div>
            :<div className='userForm-project adminControl-project'>
                <input value={projectName} onChange={(event)=>{setProjectName(event.target.value)}} type="text" autoComplete="off" id="projectName" name="projectName" maxLength="50" className={projectNameErrorBorder?"inputErrorBorder middle__input__border form-control__conv-project form-control-custom validationKeydown preventSpecialChar":"middle__input__border form-control__conv-project form-control-custom validationKeydown preventSpecialChar"} placeholder="Project Name"/>
            </div>
            }
            
            <div className='domainTxt appTypeTxt'>Application Type</div>

            <div className={taskName==="Update Project"?" disableApplicationType appTypesContainer":"appTypesContainer"}>
                {applicationType.map((e,i)=>(
                    <div key={i} onClick={()=>{setprojectTypeSelected(applicationType[i]['data'])}}  className={(projectTypeSelected===applicationType[i]['data'])?"projectTypeSelected projectTypes_create":"projectTypes_create"} data-app={applicationType[i]['data']}  title={applicationType[i]['title']} ><img src={"static/imgs/"+applicationType[i]['img']+".png"} alt={applicationType[i]['title']}/><label>{applicationType[i]['title']}</label></div>
                ))}
            </div>
        </div>

        <ReleaseCycle clickAddRelease={clickAddRelease} releaseList={releaseList} clickReleaseListName={clickReleaseListName} setActiveRelease={setActiveRelease} clickEditRelease={clickEditRelease} activeRelease={activeRelease} count={count} clickAddCycle={clickAddCycle} cycleList={cycleList} clickEditCycle={clickEditCycle} delCount={delCount} disableAddCycle={disableAddCycle} />
       
        {(showEditModalRelease)?
            <EditGlobalModal modalInputErrorBorder={modalInputErrorBorder} saveAction={clickAddReleaseName} Txt={releaseTxt} setTxt={setReleaseTxt} setShowEditModal={setShowEditModalRelease} title ={ title} inputID={inputID} placeholder={ placeholder} buttonID={ buttonID}/>
            :null}   
        {showEditModalCycle?
            <EditGlobalModal modalInputErrorBorder={modalInputErrorBorder} saveAction={clickAddCycleName} Txt={cycleTxt} setTxt={setCycleTxt} setShowEditModal={setShowEditModalCycle} title ={ title} inputID={inputID} placeholder={ placeholder} buttonID={ buttonID}/>
        :null} 
        {(showEditNameModalRelease)?
            <EditGlobalModal modalInputErrorBorder={modalInputErrorBorder} saveAction={updateReleaseName} Txt={releaseTxt} setTxt={setReleaseTxt} setShowEditModal={setShowEditNameModalRelease} title ={ title} inputID={inputID} placeholder={ placeholder} buttonID={ buttonID}/>
        :null} 
        {(showEditNameModalCycle)?
            <EditGlobalModal modalInputErrorBorder={modalInputErrorBorder} saveAction={updateCycleName} Txt={cycleTxt} setTxt={setCycleTxt} setShowEditModal={setShowEditNameModalCycle} title ={ title} inputID={inputID} placeholder={ placeholder} buttonID={ buttonID}/>
        :null} 
    </Fragment>
  );
}

export default ProjectNew;
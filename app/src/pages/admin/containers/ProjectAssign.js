import React ,  { Fragment, useEffect, useState} from 'react';
import {getUserDetails, getDomains_ICE, getAssignedProjects_ICE, getDetails_ICE, assignProjects_ICE} from '../api';
import '../styles/ProjectAssign.scss';
import AssignProjectmodal from '../components/AssignProjectModal'

/*Component ProjectAssign
  use: renders Project Assign Middle Screen
  todo: 
*/
    
const ProjectNew = (props) => {
    
    const [userSelectErrorBorder,setUserSelectErrorBorder] = useState(false)
    const [domainSelectErrorBorder,setDomainSelectErrorBorder] = useState(false)
    const [selectBox,setSelectBox] = useState([])
    const [assignProj,setAssignProj] = useState({allProjectAP:[],assignedProjectAP:[]})
    const [assignedProjectInitial,setAssignedProjectInitial] = useState([])
    const [showload,setShowload] = useState(false)
    const [selDomainsOptions,setSelDomainsOptions] = useState([])
    const [selectedUserName,setSelectedUserName] = useState("")
    const [selectedProject,setSelectedProject] = useState("")
    const [selectedUserId,setSelectedUserId] = useState("")
    const [getAssignedProjectsLen,setGetAssignedProjectsLen] = useState(0)
    const [unAssignedProjects,setUnAssignedProjects] = useState([])
    const [assignedProjects,setAssignedProjects] = useState([])
    const [diffprj,setDiffprj] = useState("")
    const [unAssignedFlag,setUnAssignedFlag] = useState(false)
    const [showAssignProjectModal,setShowAssignProjectModal] = useState(false)
    const [statechange,setStateChange] = useState(true)

    useEffect(()=>{
        setShowload(false);
            resetAssignProjectForm();
            fetchUsers();
            // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["assignProjectTab"]])

    const fetchUsers= async ()=>{
        try{
            const data = await getUserDetails("user");
            if(data === "Invalid Session") {
                // $rootScope.redirectPage();
            } else if(data === "fail") {
                alert("Failed to fetch users.");
                // openModalPopup("Assign Project", "Failed to fetch users.");
            } else if(data === "empty") {
                alert("There are no users present.");
                // openModalPopup("Assign Project", "There are no users present.");
            } else {
                // data.sort(function(a,b){ return a[0] > b[0]; });
                
                // var selectBox = $("#selAssignUser");
                // selectBox.empty();
                // selectBox.append('<option data-id="" value disabled selected>Select User</option>');
                var userOptions = [];
                for(var i=0; i<data.length; i++){
                    if(data[i][3] !== "Admin"){
                        userOptions.push(data[i]);
                        // selectBox.append('<option data-id="'+data[i][1]+'" value="'+data[i][0]+'">'+data[i][0]+'</option>');
                    }
                }
                setSelectBox(userOptions);
                // selectBox.prop('selectedIndex', 0);
            }
        }catch(error){
            console.log("Error:::::::::::::", error);
        }    
    }

    const resetAssignProjectForm = () =>{
		// $("#selAssignUser, #selAssignProject").prop('selectedIndex', 0);
		assignProj.allProjectAP = [];
        assignProj.assignedProjectAP = []; 
        setAssignProj(assignProj);   
        setSelDomainsOptions([]);
        setSelectBox([]);
    }

    const clickSelAssignUser = async (userName)=>{
        
        
        for(var i=0; i<selectBox.length; i++){
            if(selectBox[i][0] === userName){
                setSelectedUserId(selectBox[i][1])
                break;
            }
        }
        setSelectedUserName(userName);
        setAssignedProjectInitial([]);
		assignProj.allProjectAP = [];
        assignProj.assignedProjectAP = [];
        setAssignProj(assignProj);
		setShowload(true);
		// $("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", true);
        // $("#overlayContainer").prop("style", "opacity: 1;");
        try{
            const data = await getDomains_ICE();
            if (data === "Invalid Session") {
                //$rootScope.redirectPage();
            } else setSelDomainsOptions(data);
        }catch(error){
            console.log("Error:::::::::::::", error);
        }    
    }

    const ClickSelDomains = async(domainname) =>{
        setSelectedProject(domainname);
		assignProj.allProjectAP = [];
        assignProj.assignedProjectAP = [];
        setAssignProj(assignProj);
		var requestedids = [];
		requestedids.push(domainname);
		var idtype = ["domaindetails"];
		var userId = selectedUserId;
		var getAssignProj = {};
		getAssignProj.domainname = domainname;
		getAssignProj.userId = userId;
		var assignedProjectsArr = [];
		var assignedProjectNames = [];
		var unassignedProjectIds = [];
		var unassignedProjectNames = [];
        var unAssignedProjects1 = {};
        try{
            const data1 = await getAssignedProjects_ICE(getAssignProj);
			setGetAssignedProjectsLen(data1.length);
			if (data1 === "Invalid Session") {
				//$rootScope.redirectPage();
            }
			assignProj.assignedProjectAP = [];
            setAssignProj(assignProj);
			if (data1.length > 0) {
				for (var i = 0; i < data1.length; i++) {
					assignProj.assignedProjectAP.push({'projectid':data1[i]._id,'projectname':data1[i].name});
                }
                setAssignProj(assignProj);
				setAssignedProjectInitial(assignProj.assignedProjectAP);
				for (var j = 0; j < data1.length; j++) {
					assignedProjectsArr.push(data1[j]._id);
					assignedProjectNames.push(data1[j].name);
				}

                try{    
                    const detResponse = await getDetails_ICE(idtype, requestedids);
				
					if (detResponse === "Invalid Session") {
						//$rootScope.redirectPage();
					}
					assignProj.allProjectAP = [];
                    setAssignProj(assignProj);
                    if (detResponse.projectIds.length > 0) {
						for (var k = 0; k < detResponse.projectIds.length; k++) {
							if (!eleContainsInArray(assignedProjectsArr, detResponse.projectIds[k])) {
								unassignedProjectIds.push(detResponse.projectIds[k]);
							}
						}

						for (var l = 0; l < detResponse.projectNames.length; l++) {
							if (!eleContainsInArray(assignedProjectNames, detResponse.projectNames[l])) {
								unassignedProjectNames.push(detResponse.projectNames[l]);
							}
						}

						unAssignedProjects1.projectIds = unassignedProjectIds;
						unAssignedProjects1.projectNames = unassignedProjectNames;
						for (var m = 0; m < unAssignedProjects1.projectIds.length; m++) {
							assignProj.allProjectAP.push({'projectname':unAssignedProjects1.projectNames[m],'projectid':unAssignedProjects1.projectIds[m]});
                        }
                        setAssignProj(assignProj);
						if (selectedUserName === '') {
							assignProj.allProjectAP = [];
                            assignProj.assignedProjectAP = [];
                            setAssignProj(assignProj);
						}
						setShowload(false);
						// $("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", false);
					}
                }catch(error){
                    console.log("Error:::::::::::::", error);
                }
			} else {
                try{    
                    const res = await getDetails_ICE(idtype, requestedids);
					if (res === "Invalid Session") {
						//$rootScope.redirectPage();
					}
					if (res.projectIds.length > 0) {
						assignProj.allProjectAP = [];
						assignProj.assignedProjectAP = [];
						for (var n = 0; n < res.projectIds.length; n++) {
							assignProj.allProjectAP.push({'projectname':res.projectNames[n],'projectid':res.projectIds[n]});
                        }
                        setAssignProj(assignProj);
					}
					setShowload(false);
					// $("#selAssignUser, #rightall, #rightgo, #leftgo, #leftall, .adminBtn").prop("disabled", false);
                }catch(error){
                    console.log("Error:::::::::::::", error);
                }
            }
        }catch(error){
            console.log("Error:::::::::::::", error);
        }   

    }

    const eleContainsInArray = (arr, element)=> {
        if (arr !== null && arr.length > 0) {
            for (var s = 0; s < arr.length; s++) {
                if (arr[s] === element)
                    return true;
            }
        }
        return false;
    }
    
	const moveItemsLeftgo = (to,from) =>{
		setUnAssignedFlag(true);
        
        var selectId = document.getElementById("assignedProjectAP");

        var newAllProj = [];
        var newAssignProj = [];
        for(var i=0;i<selectId.options.length;i++){
            if(selectId.options[i].selected ===  true){
                newAllProj.push(JSON.parse(selectId.options[i].value));
            }
            else{
                newAssignProj.push(JSON.parse(selectId.options[i].value));
            }
        }
        newAllProj = assignProj.allProjectAP.concat(newAllProj);
        setAssignProj({allProjectAP:newAllProj,assignedProjectAP:newAssignProj});
        selectId.selectedIndex = "-1";
    };
    
	const moveItemsRightgo = (from,to) =>{
		setUnAssignedFlag(false);

        var selectId = document.getElementById("allProjectAP");
        var newAllProj = [];
        var newAssignProj = [];
        for(var i=0;i<selectId.options.length;i++){
            if(selectId.options[i].selected ===  true){
                newAssignProj.push(JSON.parse(selectId.options[i].value));
            }
            else{
                newAllProj.push(JSON.parse(selectId.options[i].value));
            }
        }
        newAssignProj = assignProj.assignedProjectAP.concat(newAssignProj);
        setAssignProj({allProjectAP:newAllProj,assignedProjectAP:newAssignProj});
        selectId.selectedIndex = "-1";
	};

	const moveItemsLeftall =  ()=> {
		setUnAssignedFlag(true);
        for(var i=0; i<assignProj.assignedProjectAP.length; i++){
            assignProj.allProjectAP.push(assignProj.assignedProjectAP[i]);
        }
        assignProj.assignedProjectAP=[];
        setAssignProj(assignProj);
        setStateChange(!statechange);
	};

	const moveItemsRightall =() =>{

        setUnAssignedFlag(false);
        for(var i=0; i<assignProj.allProjectAP.length; i++){
            assignProj.assignedProjectAP.push(assignProj.allProjectAP[i]);
        }
        assignProj.allProjectAP=[];
        setAssignProj(assignProj);
        setStateChange(!statechange);
    };

    const clickAssignProjects = () =>{
        if(unAssignedFlag === true) setShowAssignProjectModal(true);
        else clickAssignProjects1();
    }

    const clickAssignProjects1 = async () =>{
        setShowAssignProjectModal(false);
        setUnAssignedProjects([]);
		setAssignedProjects([]);
        
        setUserSelectErrorBorder(false);
        setDomainSelectErrorBorder(false);
        
        if (selectedUserName === "") {
            setUserSelectErrorBorder(true);
			return false;
		} else if (selectedProject === "") {
            setDomainSelectErrorBorder(true);
			return false;
		}

        var unAssignedProjects1 = [];
        for(var i=0; i<assignProj.allProjectAP.length; i++){
            var unassignedProj = {};
			unassignedProj.projectId = assignProj.allProjectAP[i].projectid;
			unassignedProj.projectName = assignProj.allProjectAP[i].projectname;
            unAssignedProjects1.push(unassignedProj);
            setUnAssignedProjects(unAssignedProjects1);
        }

        var assignedProjects1 = [];
        for( i=0; i<assignProj.assignedProjectAP.length; i++){
            var assignedProj = {};
			assignedProj.projectId = assignProj.assignedProjectAP[i].projectid;
			assignedProj.projectName = assignProj.assignedProjectAP[i].projectname;
            assignedProjects1.push(assignedProj);
            setAssignedProjects(assignedProjects1);
        }

        // var userDetails = JSON.parse(window.localStorage['_UI']);
		var userId = selectedUserId;

		var assignProjectsObj = {};
		assignProjectsObj.domainname = selectedProject;
		// assignProjectsObj.userInfo = userDetails;
		assignProjectsObj.userId = userId;
		assignProjectsObj.assignedProjects = assignedProjects1;
		assignProjectsObj.getAssignedProjectsLen = getAssignedProjectsLen;

		/* Logic to get unassigned project list */
        setDiffprj([]);
        var currentDiffPrj = getDifferentProjects(assignedProjects1);
		//console.log($scope.diffprj);
		/*End of logic to get unassigned project list */
		assignProjectsObj.deletetasksofprojects = currentDiffPrj;
		//console.log(assignProjectsObj);

		//Transaction Activity for Assign Project Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['AssignProjects']);
        // txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
        
        try{
            // blockUI('Saving in Progress. Please Wait...');
            const data = await assignProjects_ICE(assignProjectsObj)
            // unblockUI();
            if (data === "Invalid Session") {
                //$rootScope.redirectPage();
            }
            if (data === 'success') {
                if (assignedProjects1.length !== 0) alert("Projects assigned to user successfully");
                    //openModalPopup("Assign Projects", "Projects assigned to user successfully");
                else alert("Projects unassigned successfully")
                    // openModalPopup("Assign Projects", "Projects unassigned successfully");
                resetAssignProjectForm();
            } else {
                alert("Failed to assign projects to user");
                // openModalPopup("Assign Projects", "Failed to assign projects to user");
            }

            fetchUsers();
        }catch(error){
            console.log("Error:::::::::::::", error);
        }
    }

    const getDifferentProjects= (assignedProjects1)=>{
        setDiffprj(assignedProjectInitial);
        var diffprjNew = [];
        
        for (var i = 0; i < assignedProjectInitial.length; i++) { 
            var flag1 = false; 
            for (var j = 0; j < assignedProjects1.length; j++) { 
                if(assignedProjectInitial[i].projectid === assignedProjects1[j].projectId){
                    flag1 = true;
                    break;
                }
            }
            if(flag1 === false) diffprjNew.push(assignedProjectInitial[i]);
        }
        setDiffprj(diffprjNew);
        return diffprjNew
    }
    
    return (
        <Fragment>
            
            <div id="page-taskName">
                <span>Assign Project</span>
		    </div>

            <div className="adminActionBtn">
                <button className=" btn-md adminBtn " onClick={()=>{clickAssignProjects()}}  title="Save">Save</button>
            </div> 

            <div className="col-xs-9 form-group" style={{width: "83%"}}>
                <div className='userForm-project projectForm-project' style={{display: "flex"}} >
                    <div className='domainTxt'>User</div>
                    <select onChange={(event)=>{clickSelAssignUser(event.target.value)}} className={userSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project select-margin':"adminSelect-project form-control__conv-project select-margin"} id="selAssignUser" >
                        <option key="" value="" selected>Select User</option>
                        
                        {selectBox.map((data)=>(
                            <option key={data[0]} data-id={data[1]} value={data[0]}>{data[0]}</option>
                        ))}
                    </select>
                </div>
                
                <div className='userForm-project projectForm-project' style={{display: "flex"}} >
                    <div className='domainTxt'>Domain</div>
                    <select onChange={(event)=>{ClickSelDomains(event.target.value)}}  className={domainSelectErrorBorder===true?'selectErrorBorder adminSelect-project form-control__conv-project ':"adminSelect-project form-control__conv-project "} id="selDomains" style={{width: "100%"}} >
                            <option key="" value="" selected>Please Select Your Domain</option>
                            {selDomainsOptions.map((data)=>(
                                <option key={data} value={data}>{data}</option>
                            ))}
                    </select>
                </div>
            </div>


            <div className="col-xs-9 form-group" style={{width: "100%"}}>
				<div className="project-left2">
					{/* <!--Left Select Box--> */}
					<div className="wrap left-select scrollbar-inner">
						{/* <!--Labels--> */}
						<label className="labelStyle1">All Projects</label>
                        {/* {((selectedProject ==="" && selectedUserName!=="") || showload)?
                        <img className="load" style={{position: "relative", left: "10px", bottom: "4px"}} src={"static/imgs/loader.gif"} alt="Loading..."/>
                        :null} */}
                        {/* <!--Labels--> */}
						<div className="seprator" style={{marginBottom:"0px"}}>
							<select multiple id="allProjectAP" className="ng-pristine ng-untouched ng-valid">
								{/* <option ng-repeat="prj in assignProj.allProjectAP" value="{{prj.projectid}}">{{prj.projectname}}</option> */}
                                {assignProj.allProjectAP.map((prj) => ( 
                                    // <option onClick={()=>{addSelectAllProjectAP(prj.projectid)}} value={prj.projectid}  className={(  allProjSelectedBackground[prj.projectid]===true)?"selected-project":""}>{prj.projectname} </option>
                                    <option key={prj.projectname} value={JSON.stringify(prj)} >{prj.projectname} </option>
                                
                                ))}
                            </select>
							{/* <span ng-show="projectNameRequired" className="error-msg ng-binding ng-hide"></span> */}
						</div>
					</div>
					{/* <!--Left Select Box--> */}

					{/* <!--Center Input--> */}
					<div className="wrap wrap-editpro center-button">
						<button type="button" id="rightgo"  onClick={()=>{moveItemsRightgo('#allProjectAP', '#assignedProjectAP')}} title="Move to right"> &gt; </button>
						<button id="rightall" type="button" onClick={()=>{moveItemsRightall('#allProjectAP', '#assignedProjectAP')}} title="Move all to right"> &gt;&gt; </button>
						<button id="leftall" type="button" onClick={()=>{moveItemsLeftall('#assignedProjectAP','#allProjectAP')}} title="Move all to left"> &lt;&lt; </button>
                        <button type="button" id="leftgo" onClick={()=>{moveItemsLeftgo('#assignedProjectAP','#allProjectAP')}} title="Move to left"> &lt; </button>
						</div>
					{/* <!--Center Input--> */}

					{/* <!--Right Select Box--> */}
					<div className="wrap right-select">
						{/* <!--Labels--> */}
						<label className="labelStyle1">Assigned Projects</label>
                        {/* {((selectedProject ==="" && selectedUserName!=="") || showload)?
                        <img className="load" style={{position: "relative", left: "10px", bottom: "4px"}} src={"static/imgs/loader.gif"} alt="Loading..."/>
                        :null} */}
                        {/* <!--Labels--> */}

						<div className="seprator" style={{marginBottom:"0px"}}>
							<select multiple id="assignedProjectAP"  size="" className="ng-pristine ng-untouched ng-valid">
								{assignProj.assignedProjectAP.map((prj,index) => ( 
                                   <option key={index} value={JSON.stringify(prj)}  >{prj.projectname} </option>
                                //    <option onClick={()=>addSelectAssignProjectAP(prj.projectid)} value={prj.projectid} className={(assignProjSelectedBackground[prj.projectid]===true)?"selected-project":""}>{prj.projectname}</option>
                                ))}
                            </select>
						</div>
					</div>
					{/* <!--Right Select Box--> */}
				</div>
            </div>    

            {showAssignProjectModal?
                <AssignProjectmodal setShowAssignProjectModal={setShowAssignProjectModal} clickAssignProjects1={clickAssignProjects1}  />
                :null
            }

        </Fragment>
    )
}

export default ProjectNew;
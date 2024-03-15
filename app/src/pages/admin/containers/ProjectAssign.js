import React ,  { useEffect, useState, useRef} from 'react';
import {getUserDetails, getDomains_ICE, getAssignedProjects_ICE, getDetails_ICE, assignProjects_ICE, unlockTestSuites} from '../api';
import {ScreenOverlay, ModalContainer, ScrollBar, Messages, setMsg} from '../../global'
import { useSelector} from 'react-redux'; 
import '../styles/ProjectAssign.scss';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

/*Component ProjectAssign
  use: renders Project Assign Middle Screen
  todo: 
*/
    
const ProjectNew = (props) => {
    
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo ;
    const toast = useRef();
    const [userSelectErrorBorder,setUserSelectErrorBorder] = useState(false)
    const [domainSelectErrorBorder,setDomainSelectErrorBorder] = useState(false)
    const [selectBox,setSelectBox] = useState([])
    const [assignProj,setAssignProj] = useState({allProjectAP:[],assignedProjectAP:[]})
    const [assignedProjectInitial,setAssignedProjectInitial] = useState([])
    const [unAssignedFlag,setUnAssignedFlag] = useState(false)
    const [showAssignProjectModal,setShowAssignProjectModal] = useState(false)
    const [statechange,setStateChange] = useState(true)
    const [selDomainsOptions,setSelDomainsOptions] = useState([])
    const [selectedUserName,setSelectedUserName] = useState("")
    const [selectedProject,setSelectedProject] = useState(["banking"])
    const [selectedProject1,setSelectedProject1] = useState("banking")
    const [selectedUserId,setSelectedUserId] = useState("")
    const [loading,setLoading] = useState(false)
    
    const [getAssignedProjectsLen,setGetAssignedProjectsLen] = useState(0)
    // eslint-disable-next-line
    const [showload,setShowload] = useState(false)
    // eslint-disable-next-line
    const [unAssignedProjects,setUnAssignedProjects] = useState([])
    // eslint-disable-next-line
    const [assignedProjects,setAssignedProjects] = useState([])
    // eslint-disable-next-line
    const [diffprj,setDiffprj] = useState("")
    

    useEffect(()=>{
        setShowload(false);
            resetAssignProjectForm();
            fetchUsers();
            // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.resetMiddleScreen["assignProjectTab"]])

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
        if (error.CONTENT) {
            toast.current.show({ severity: error.VARIANT, summary: 'Error', detail: error.CONTENT, life: 5000 });
          }
          else toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 5000 });
    }
    const displaySuccess = (successMessage) => {
        setLoading(false)
        setMsg(successMessage)
        if (successMessage.CONTENT) {
          toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
      }

    const fetchUsers= async ()=>{
        const data = await getUserDetails("user");
        if(data.error){displayError(data.error);return;}
        var userOptions = [];
        for(var i=0; i<data.length; i++){
            if(data[i][3] !== "Admin"){
                userOptions.push(data[i]);
            }
        }
        setSelectBox(userOptions.sort());
        if(document.getElementById("selAssignUser") !== null)
            document.getElementById("selAssignUser").selectedIndex = "0"; 
        if(document.getElementById("selDomains") !== null)
        document.getElementById("selDomains").selectedIndex = "0";       

    }

    const resetAssignProjectForm = () =>{
        setAssignProj({allProjectAP:[],assignedProjectAP:[]});   
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
		setAssignProj({allProjectAP:[],assignedProjectAP:[]});
		setShowload(true);
        const data = await getDomains_ICE();
        if(data.error){displayError(data.error);return;}
        setSelDomainsOptions(data); 
        if(document.getElementById("selDomains") !== null){
            document.getElementById("selDomains").selectedIndex = "0";
         }else{
        document.addEventListener("selAssignUser", function() {
            document.getElementById("selAssignUser").selectedIndex = "0";
        });
        document.addEventListener("selDomains", function() {
            document.getElementById("selDomains").selectedIndex = "0";
        });
    }
    }
    useEffect(()=>{
        if(selectedUserId.length>0){
            for(let i = 0; i<selectedProject.length; i++){
                ClickSelDomains(selectedProject[i])
            } 
        }

    },[selectedUserId])
    const ClickSelDomains = async(domainname) =>{
        setSelectedProject1(domainname);
		setAssignProj({allProjectAP:[],assignedProjectAP:[]});
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
            if(data1.error){displayError(data1.error);return;}
            setGetAssignedProjectsLen(data1.length);
            assignProj.assignedProjectAP = [];
            if (data1.length > 0) {
                for (var i = 0; i < data1.length; i++) {
                    assignProj.assignedProjectAP.push({'projectid':data1[i]._id,'projectname':data1[i].name});
                }
                setAssignedProjectInitial(assignProj.assignedProjectAP);
                for (var j = 0; j < data1.length; j++) {
                    assignedProjectsArr.push(data1[j]._id);
                    assignedProjectNames.push(data1[j].name);
                }
                const detResponse = await getDetails_ICE(idtype, requestedids);
                if(detResponse.error){displayError(detResponse.error);return;}
                assignProj.allProjectAP = [];
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
                    if (selectedUserName === '') {
                        setAssignProj({allProjectAP:[],assignedProjectAP:[]});
                    }
                    setShowload(false);
                }
            } else {
                const res = await getDetails_ICE(idtype, requestedids);
                if(res.error){displayError(res.error);return;}
                if (res.projectIds.length > 0) {
                    assignProj.allProjectAP = [];
                    assignProj.assignedProjectAP = [];
                    for (var n = 0; n < res.projectIds.length; n++) {
                        assignProj.allProjectAP.push({'projectname':res.projectNames[n],'projectid':res.projectIds[n]});
                    }
                }
                setShowload(false);
            }
            setAssignProj(assignProj)
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
        if(newAllProj.length>0){
           findProject(newAllProj)
        }
        newAllProj = assignProj.allProjectAP.concat(newAllProj);
        setAssignProj({allProjectAP:newAllProj,assignedProjectAP:newAssignProj});
        selectId.selectedIndex = "-1";
    };
    const findProject =async(data)=>{ 
        let req = {
            qurey:"projectDomain", 
            projectidss:data
        }
        const projectDomain = await unlockTestSuites(req)
        if(projectDomain.error)return;
        else setSelectedProject(projectDomain)
    }
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
        let unAssignProjectList = []
		setUnAssignedFlag(true);
        for(var i=0; i<assignProj.assignedProjectAP.length; i++){
            unAssignProjectList.push(assignProj.assignedProjectAP[i])
            assignProj.allProjectAP.push(assignProj.assignedProjectAP[i]);
        }
        assignProj.assignedProjectAP=[];
        if(unAssignProjectList.length>0){
            findProject(unAssignProjectList)
        }
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
        else clickAssignProjects1(selectedProject1);
    }
    const clickAssignProjects2 = () =>{
            clickAssignProjects1();
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
		assignProjectsObj.domainname = selectedProject.reverse();
		// assignProjectsObj.userInfo = userDetails;
		assignProjectsObj.userId = userId;
		assignProjectsObj.assignedProjects = assignedProjects1;
        assignProjectsObj.getAssignedProjectsLen = getAssignedProjectsLen;
        assignProjectsObj.userInfo = userInfo

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
        
        setLoading('Saving in Progress. Please Wait...');
        const data = await assignProjects_ICE(assignProjectsObj)
        if(data.error){displayError(data.error);return;}
        setLoading(false);
        if (data === 'success') {
            if (assignProjectsObj.deletetasksofprojects.length === 0) displaySuccess(Messages.ADMIN.SUCC_PROJECT_ASSIGN);
            else displaySuccess(Messages.ADMIN.SUCC_PROJECT_UNASSIGN);
            resetAssignProjectForm();
        } else  displayError(Messages.ADMIN.ERR_PROJECT_ASSIGN)
        fetchUsers();
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
        <div className="projAssign_container">
            <Toast ref={toast} position="bottom-center" baseZIndex={9999} />
            {loading?<ScreenOverlay content={loading}/>:null}
                {/* <div id="page-taskName">
                    <span>Assign Project</span>
                </div> */}

                <div className="adminActionBtn" style={{float:'inline-end'}}>
                    <Button className=" a__btn " size='small' onClick={()=>{clickAssignProjects()}} label='Save' title="Save"></Button>
                </div> 

                <div className="col-xs-9 form-group" style={{width: "83%", paddingBottom:'20px'}}>
                    <div style={{display:'flex'}} className='userForm-project projectForm-project project-custom-top' >
                        <div className='domainTxt'>User</div>
                        <select defaultValue={""} onChange={(event)=>{clickSelAssignUser(event.target.value)}} className={userSelectErrorBorder===true?'selectErrorBorder adminSelect-project-assign form-control__conv-project select-margin':"adminSelect-project-assign form-control__conv-project select-margin"} id="selAssignUser" >
                            <option disabled={true} key="" value="" >Select User</option>
                            {selectBox.map((data)=>(
                                <option key={data[0]} data-id={data[1]} value={data[0]}>{data[0]}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* <div style={{display:'flex'}} className='userForm-project projectForm-project display-project'  >
                        <div className='domainTxt'>Domain</div>
                        {/* <select defaultValue={""} onChange={(event)=>{ClickSelDomains(event.target.value)}}  className={domainSelectErrorBorder===true?'selectErrorBorder adminSelect-project-assign form-control__conv-project ':"adminSelect-project-assign form-control__conv-project "} id="selDomains" style={{width: "100%",marginLeft:"16px"}} >
                                <option disabled={true} key="" value="">Please Select Your Domain</option>
                                {selDomainsOptions.map((data)=>(
                                    <option key={data} value={data}>{data}</option>
                                ))}
                        </select>
                    </div> */}
                </div>


                <div className="col-xs-9 form-group assign-container" style={{width: "100%"}}>
                    <div className="project-left2">
                        {/* <!--Left Select Box--> */}
                        <div className="wrap assign-select">
                            {/* <!--Labels--> */}
                            <label className="labelStyle1">All Projects</label>
                            <div className="seprator" >
                                <select multiple id="allProjectAP">
                                    {assignProj.allProjectAP.map((prj) => ( 
                                        <option key={prj.projectname} value={JSON.stringify(prj)} >{prj.projectname} </option>
                                    ))}
                                </select>
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
                        <div className="wrap assign-select">
                            {/* <!--Labels--> */}
                            <label className="labelStyle1">Assigned Projects</label>
                            <div className="seprator seprator-custom" >
                                <select multiple id="assignedProjectAP"  size="">
                                    {assignProj.assignedProjectAP.map((prj,index) => ( 
                                    <option key={index} value={JSON.stringify(prj)}  >{prj.projectname} </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* <!--Right Select Box--> */}
                    </div>
                </div>    

                <Dialog header="Update Projects" visible={showAssignProjectModal} footer={ModalButtons(clickAssignProjects2, setShowAssignProjectModal)} onHide={()=>{setShowAssignProjectModal(false)}} className=" modal-sm" >
                    <span>Do you want to proceed?</span>
                </Dialog>
        </div>
    )
}

const ModalButtons = (clickAssignProjects2, setShowAssignProjectModal) =>{
    return(
        <div className="modal-footer-edit">
            <Button onClick={()=>{clickAssignProjects2()}} className=" btn-assign-popup" label='Yes'/>
            <Button  onClick={()=>{setShowAssignProjectModal(false)}} label='No' />
        </div>
    )
}

export default ProjectNew;
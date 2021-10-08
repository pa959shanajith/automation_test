import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ScrapeContext } from './ScrapeContext';
import { reviewTask } from '../../global/api';
import {getUserDetails,getNotificationGroups} from '../../admin/api';
import { Messages as MSG, setMsg, SelectRecipients, ModalContainer } from '../../global';
import "../styles/SubmitTask.scss";

const SubmitTask = () => {

    const { isUnderReview, hideSubmit } = useContext(ScrapeContext);
    const current_task = useSelector(state=>state.plugin.CT);
    const [recipients,setRecipients] =useState({groupids:[],additionalrecepients:[]})
    const [allUsers,setAllUsers] = useState([])
    const [groupList,setGroupList] = useState([])
    const [showPopup, setShow] = useState(false);
    const history = useHistory();

    const redirectToPlugin = () => {
        window.localStorage['navigateScreen'] = "plugin";
        history.replace('/plugin');
    }

    const onAction = operation => {
        switch(operation){
            case "submit": setShow({'title':'Submit Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
            case "reassign": setShow({'title':'Reassign Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
            case "approve": setShow({'title':'Approve Task', 'content': operation, 'onClick': ()=>submitTask(operation)}); break;
            default: break;
        }                       
    }

    const resetData = () => {
        setAllUsers([]);
        setGroupList([]);
        setRecipients({groupids:[],additionalrecepients:[]});
    }

    const fetchSelectRecipientsData = async () => {
        let checkAddUsers = document.getElementById("ss__checkbox").checked
        if(!checkAddUsers) resetData()
        else {
            var userOptions = [];
            let data = await getUserDetails("user");
            if(data.error){setMsg(data.error);return;}
            for(var i=0; i<data.length; i++) if(data[i][3] !== "Admin") userOptions.push({_id:data[i][1],name:data[i][0]}); 
            setAllUsers(userOptions.sort()); 
            data = await getNotificationGroups({'groupids':[],'groupnames':[]});
            if(data.error){
                if(data.val === 'empty'){
                    setMsg(data.error);
                    data = {};
                } else{ setMsg(data.error); return true; }
            }
            setGroupList(data.sort())
        }
    }

    const submitTask = submitOperation => {
        let taskid = current_task.subTaskId;
		let taskstatus = current_task.status;
		let version = current_task.versionnumber;
		let batchTaskIDs = current_task.batchTaskIDs;
        let projectId = current_task.projectId;
        let nodeid = current_task.screenId;
        let taskname = current_task.taskName
		if (submitOperation === 'reassign') {
			taskstatus = 'reassign';
        }
        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs, nodeid, taskname, recipients.groupids, recipients.additionalrecepients)
        .then(result => {
            if (result === "fail") setMsg(MSG.SCRAPE.WARN_NO_REVIEWER);
            else if (taskstatus === 'reassign') {
                setMsg(MSG.SCRAPE.SUCC_TASK_REASSIGN);
                redirectToPlugin();
            }    
            else if (taskstatus === 'underReview') {
                setMsg(MSG.SCRAPE.SUCC_TASK_APPROVED);
                redirectToPlugin();
            }
            else {
                setMsg(MSG.SCRAPE.SUCC_TASK_SUBMIT);
                redirectToPlugin();
            }
        })
        .catch(error => {
			console.error(error);
        })
        
        setShow(false);
    }

    const ConfirmPopup = () => (
        <ModalContainer 
            title={showPopup.title}
            content={<div>
                <span>Are you sure you want to {showPopup.content} the task ?</span>
                <p className="ss__checkbox-addRecp" >
                    <input  id="ss__checkbox" onChange={()=>{fetchSelectRecipientsData()}} type="checkbox" title="Notify Additional Users" className="checkAddUsers"/>
                    <span >Notify Additional Users</span>
                </p>
                <div className='ss__select-recpients'>
                    <div>
                        <span className="leftControl" title="Token Name">Select Recipients</span>
                        <SelectRecipients recipients={recipients} setRecipients={setRecipients} groupList={groupList} allUsers={allUsers} />
                    </div>
                </div>
            </div>}
            close={()=>{setShow(false);resetData();}}
            footer={
                <>
                <button onClick={()=>{submitTask(showPopup.content)}}>
                    {showPopup.continueText ? showPopup.continueText : "Yes"}
                </button>
                <button onClick={()=>{setShow(false);resetData()}}>
                    {showPopup.rejectText ? showPopup.rejectText : "No"}
                </button>
                </>
            }
        /> 
    )

    return (
        <>
            { showPopup && ConfirmPopup()}
            <div className="ss__right-btns">
                { isUnderReview && 
                    <>
                    <button data-test="reassignButton" className="ss__reassignBtn" title="Reassign Task" onClick={()=>onAction("reassign")}>
                        Reassign
                    </button>
                    <button data-test="approveButton" className="ss__approveBtn" title="Approve Task" onClick={()=>onAction("approve")}>
                        Approve
                    </button>
                    </>
                }
                { !hideSubmit && !isUnderReview &&
                    <button data-test="submitButton"className="ss__submitBtn" title="Submit Task" onClick={()=>onAction("submit")}>
                        Submit
                    </button>
                }
            </div>
        </>
    );
}

export default SubmitTask;
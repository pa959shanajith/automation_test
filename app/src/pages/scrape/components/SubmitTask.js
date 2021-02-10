import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ScrapeContext } from './ScrapeContext';
import { reviewTask } from '../../global/api';
import "../styles/SubmitTask.scss";

const SubmitTask = () => {

    const { isUnderReview, hideSubmit, setShowConfirmPop, setShowPop } = useContext(ScrapeContext);
    const current_task = useSelector(state=>state.plugin.CT);
    const history = useHistory();
    

    const redirectToPlugin = () => {
        window.localStorage['navigateScreen'] = "plugin";
        history.replace('/plugin');
    }

    const onAction = operation => {
        switch(operation){
            case "submit": setShowConfirmPop({'title':'Submit Task', 'content': 'Are you sure you want to submit the task ?', 'onClick': ()=>submitTask(operation)});
                           break;
            case "reassign": setShowConfirmPop({'title':'Reassign Task', 'content': 'Are you sure you want to reassign the task ?', 'onClick': ()=>submitTask(operation)});
                             break;
            case "approve": setShowConfirmPop({'title':'Approve Task', 'content': 'Are you sure you want to approve the task ?', 'onClick': ()=>submitTask(operation)});
                            break;
            default: break;
        }                       
    }

    const submitTask = submitOperation => {
		let taskid = current_task.subTaskId;
		let taskstatus = current_task.status;
		let version = current_task.versionnumber;
		let batchTaskIDs = current_task.batchTaskIDs;
        let projectId = current_task.projectId;
        
		if (submitOperation === 'reassign') {
			taskstatus = 'reassign';
        }

        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs)
        .then(result => {
            if (result === "fail") setShowPop({'title': 'Task Submission Error', 'content': 'Reviewer is not assigned !'});
            else if (taskstatus === 'reassign') setShowPop({'title': "Task Reassignment Success", 'content': "Task Reassigned successfully!", onClick: ()=>redirectToPlugin()});
            else if (taskstatus === 'underReview') setShowPop({'title': "Task Completion Success", 'content': "Task Approved successfully!", onClick: ()=>redirectToPlugin()});
            else setShowPop({'title': "Task Submission Success", 'content': "Task Submitted successfully!", onClick: ()=>redirectToPlugin()});
        })
        .catch(error => {
			console.error(error);
        })
        
        setShowConfirmPop(false);
    }

    return (
        <div className="ss__right-btns">
            { isUnderReview && 
                <>
                <button className="ss__reassignBtn" onClick={()=>onAction("reassign")}>
                    Reassign
                </button>
                <button className="ss__approveBtn" onClick={()=>onAction("approve")}>
                    Approve
                </button>
                </>
            }
            { !hideSubmit && !isUnderReview &&
                <button className="ss__submitBtn" onClick={()=>onAction("submit")}>
                    Submit
                </button>
            }
        </div>
    );
}

export default SubmitTask;
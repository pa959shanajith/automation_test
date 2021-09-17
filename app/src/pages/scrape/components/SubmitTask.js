import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ScrapeContext } from './ScrapeContext';
import { reviewTask } from '../../global/api';
import { Messages as MSG, setMsg } from '../../global';
import "../styles/SubmitTask.scss";

const SubmitTask = () => {

    const { isUnderReview, hideSubmit, setShowConfirmPop } = useContext(ScrapeContext);
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
        let nodeid = current_task.screenId;
        let taskname = current_task.taskName
		if (submitOperation === 'reassign') {
			taskstatus = 'reassign';
        }

        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs, nodeid, taskname)
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
        
        setShowConfirmPop(false);
    }

    return (
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
    );
}

export default SubmitTask;
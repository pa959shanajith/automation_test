import React, { Fragment} from 'react';
import '../styles/EditGlobalModal.scss'

/*Component CreateOptions
  use:  Edit Global Model
  props: 
*/

const CreateOptions = (props) => { 

    return (
    <Fragment>

        <div className="modal fade" id="editGlobalModal" role="dialog" style={{display: "block" , opacity:"1"}} data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog-edit modal-sm-edit" id="modalDialog">
                <div className="modal-content">
                    <div className="modal-header-edit">
                        <button type="button" onClick={()=>{props.setShowAssignProjectModal(false)}} className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">Update Projects</h4>
                    </div>
                    <div className="modal-body-edit">
                        <p>All the tasks that has been assigned to this user will be removed from this user's queue from the project(s) which are being unassigned (if any). Do you want to proceed?</p>
                    </div>
                    <div className="modal-footer-edit">
                        <button onClick={()=>{props.clickAssignProjects1()}} type="button" className="btn  btnGlobalSave validationBlur">Yes</button>
                        <button  onClick={()=>{props.setShowAssignProjectModal(false)}} type="button" className="btn  btnGlobalSave validationBlur">No</button>
                    </div>
                </div>
            </div>
        </div>

    </Fragment>
  );
}

export default CreateOptions;
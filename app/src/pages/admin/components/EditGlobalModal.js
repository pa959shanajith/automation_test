import React, { Fragment, useEffect } from 'react';
import '../styles/EditGlobalModal.scss'

/*Component CreateOptions
  use:  Edit Global Model
  props: 
*/

const CreateOptions = (props) => {

    
    useEffect(()=>{
        (async()=>{
           

        })()
    },[])   

    return (
    <Fragment>

        <div className="modal fade" id="editGlobalModal" role="dialog" style={{display: "block" , opacity:"1"}} data-keyboard="false" data-backdrop="static">
            <div className="modal-dialog-edit modal-sm-edit" id="modalDialog">
                <div className="modal-content">
                    <div className="modal-header-edit">
                        <button type="button" onClick={()=>{props.setShowEditModal(false)}} className="close" data-dismiss="modal">&times;</button>
                        <h4 className="modal-title">{props.title}</h4>
                    </div>
                    <div className="modal-body-edit">
                        <p><input autoComplete="off" value={props.Txt} onChange={(event)=>{props.setTxt(event.target.value)}} maxLength="50" type="text" className={(props.modalInputErrorBorder)?"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar inputErrorBorder":"middle__input__border form-control__conv form-control-custom validationKeydown preventSpecialChar"}  placeholder={props.placeholder} id={props.inputID}/></p>
                    </div>
                    <div className="modal-footer-edit">
                        <button id={props.buttonID} onClick={()=>{props.saveAction()}} type="button" className="btn  btnGlobalSave validationBlur">Save</button>
                    </div>
                </div>
            </div>
        </div>

    </Fragment>
  );
}

export default CreateOptions;
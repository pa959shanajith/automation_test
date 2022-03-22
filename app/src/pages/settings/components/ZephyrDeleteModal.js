import React from 'react'
import { ModalContainer } from '../../global'

/*Component ZephyrDeleteModal 
  use: shows popup
  props:
    confirmDelete: fn for confirm button
    cancelDelete: fn for cancel button 
*/

const ZephyrDeleteModal = (props) => {

    return <ModalContainer
        title="Delete Zephyr Configuration"
        content={"Are you sure you want to delete Zephyr configuration? Deleting the Zephyr Configuration will delete both auth type configurations."}
        close={props.cancelDelete}
        footer={
            <>
                <button onClick={props.confirmDelete }>Yes</button>
                <button onClick={props.cancelDelete}>No</button>
            </>
        }
        modalClass="modal-mmd"
    />
}
export default ZephyrDeleteModal;
import React from 'react'
import { ModalContainer } from '../../global'

/*Component JiraDeleteModal 
  use: shows popup
  props:
    confirmDelete: fn for confirm button
    cancelDelete: fn for cancel button 
*/

const SaucelabsDeleteModal = (props) => {

    return <ModalContainer
        title="Delete Saucelabs Configuration"
        content={"Are you sure you want to delete Saucelabs configuration?"}
        close={props.cancelDelete}
        footer={
            <>
                <button onClick={props.confirmDelete }>Yes</button>
                <button onClick={props.cancelDelete}>No</button>
            </>
        }
        modalClass="modal-sm"
    />
}
export default SaucelabsDeleteModal;
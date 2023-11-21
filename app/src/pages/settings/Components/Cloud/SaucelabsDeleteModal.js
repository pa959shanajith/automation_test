import React from 'react'
import { Button } from 'primereact/button';
import { ModalContainer } from "../../../global"

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
        show={props.show}
        close={props.cancelDelete}
        footer={
            <>
                <Button label="Yes" onClick={props.confirmDelete }></Button>
                <Button label="No" onClick={props.cancelDelete}></Button>
            </>
        }
        modalClass="modal-sm"
    />
}
export default SaucelabsDeleteModal;
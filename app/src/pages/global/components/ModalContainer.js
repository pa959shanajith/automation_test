import React from 'react';
import '../styles/ModalContainer.scss'
import {Dialog} from 'primereact/dialog';

/*Component ModalContainer
  use: shows popup
  props:
    content : "content component"
    footer : "footer component"
    title : "title of the popup"
    close : "event on close"
    modalClass : bootstrap modal-class for dialogue
*/


const ModalContainer = (props) => {
    return(
        <Dialog header={props.title} visible={props.show} onHide={props.close} footer={props.footer} >
            <div className=''> 
                {props.content}
            </div>         
        </Dialog>
    )
}

export default ModalContainer;
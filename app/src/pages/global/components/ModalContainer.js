import React from 'react';
import '../styles/ModalContainer.scss'

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
        <div className='modal__container'>
            <div className={'modal-dialog '+(props.modalClass?props.modalClass:"")}>
                <div className='modal__content modal-content'>
                    <div className='modal-header modal__header'>
                        <button data-test="modal_close_btn"onClick={(e)=>props.close(e)}>×</button>
                        <h4 data-test="modal_title_head" className='modal-title'>{props.title}</h4>
                    </div>
                    <div className='modal-body modal__body'>
                        {props.content}
                    </div>
                    <div className='modal-footer modal__footer'>
                        {props.footer}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalContainer;
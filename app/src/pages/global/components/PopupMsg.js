import React from 'react';
import '../styles/PopupMsg.scss'

/*Component PopupMsg
  use: block screen and show popup
  props:
    content : "content to be shown in the box"
    submitText : "submit buttons text"
    title : "title of the popup"
    submit : "event on sumbit"
    close : "event on close"
*/

const PopupMsg = (props) => {
    return(
        <div className='popup__container'>
            <div className='popup__content modal-content modal-sm'>
                <div className='modal-header popup__header'>
                    <button onClick={(e)=>props.close(e)}>×</button>
                    <h4 className='modal-title'>{props.title}</h4>
                </div>
                <div className='modal-body popup__body'>
                    <p>{props.content}</p>
                </div>
                <div className='modal-footer popup__footer'>
                    <button onClick={(e)=>props.submit(e)} >{props.submitText}</button>
                </div>
            </div>
        </div>
    )
}

export default PopupMsg;
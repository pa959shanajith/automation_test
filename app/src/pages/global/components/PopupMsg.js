import React, {useEffect} from 'react';
import '../styles/PopupMsg.scss'
import { VARIANT } from '..';

/*Component PopupMsg
  use: block screen and show popup
  props:
    content : "content to be shown in the box"
    variant : "variant of popup ( Success/Warn/Error )"
    close : "event on close"
*/

const PopupMsg = (props) => {
    const content = typeof(props.content) === "object" ? "Something went wrong. " : props.content
    const variant = props.variant;
    let messageType = "warn";
    let iconType = "fa fa-exclamation-triangle ";
    let btnType = "black-btn";
    switch(variant) {
        case VARIANT.ERROR: messageType = "error";  iconType = "fa fa-exclamation-triangle "; btnType = "white-btn"; break;
        case VARIANT.SUCCESS: messageType = "success";  iconType = "fa fa-check"; btnType = "white-btn"; break;
        case VARIANT.WARNING: messageType = "warn";  iconType = "fa fa-info-circle"; btnType = "black-btn"; break;
        default: messageType = "warn";
    }

    useEffect(() => {
        setTimeout((e) => props.close(e), 5000);
    }, []);
      
    return (
        <div data-test="popup-comp" className='messageBar' >
            <div className='messageBar-container'>
                <div className={"message-icon "+iconType}></div>
                <button className={btnType} onClick={(e)=>props.close(e)}>×</button>
                <div className={'messageBar-message ' + messageType}>{content}</div>
            </div>
        </div>
    )
}

export default PopupMsg;
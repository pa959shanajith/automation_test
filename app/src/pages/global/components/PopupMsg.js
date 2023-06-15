import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../styles/PopupMsg.scss'

/*Component PopupMsg
  use: block screen and show popup
  props:
    message : object contains variant and text of message
*/

const popupVariants = {
    hidden: { y: "200%", x: "-50%" },
    visible: { y: 0, x:"-50%" }
}

const PopupMsg = () => {
    const message = useSelector(state=>state.progressbar.popup);

    useEffect(() => {
        if(message) setTimeout(5000);
    }, [message]);
      
    return (
        <></>
    )
}

export const setMsg = (message) => {

}

export default PopupMsg;
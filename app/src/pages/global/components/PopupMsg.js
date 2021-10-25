import React, { useEffect } from 'react';
import '../styles/PopupMsg.scss'
import { useSelector } from 'react-redux';
import * as actionTypes from "../state/action";
import { motion, AnimatePresence } from 'framer-motion';
import {Messagebar} from '@avo/designcomponents';
import { store } from '../../../reducer';

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
        if(message) setTimeout(() =>store.dispatch({type: actionTypes.SET_POPUP, payload: false}), 5000);
    }, [message]);
      
    return (
        <AnimatePresence>
            {message &&
                <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="hidden" className="popup__message" >
                    <Messagebar text={message.CONTENT} variant={message.VARIANT} width={"auto"} />
                </motion.div>   
            }
        </AnimatePresence>
    )
}

export const setMsg = (message) => {
    store.dispatch({type: actionTypes.SET_POPUP, payload: message});
}

export default PopupMsg;
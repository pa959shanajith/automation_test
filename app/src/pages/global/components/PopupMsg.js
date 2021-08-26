import React, { useState, useEffect } from 'react';
import '../styles/PopupMsg.scss'
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from "../state/action";
import { motion } from 'framer-motion';
import {Messagebar} from '@avo/designcomponents';
import { store } from '../../../reducer';

/*Component PopupMsg
  use: block screen and show popup
  props:
    message : object contains variant and text of message
*/

const popupVariants = {
    hidden: { y: "150vh" },
    visible: { y: 0, transition: { delay: 2, type: "spring", duration: 1 } },
    exit: { y: "150vh"}
}

const PopupMsg = ({message}) => {
    
    return (
        message &&
            <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="exit" className="popup__message" >
                <Messagebar text={message.CONTENT} variant={message.VARIANT} width={"auto"} />
            </motion.div>   
    )
}

export const setMsg = (message) => {
    store.dispatch({type: actionTypes.SET_POPUP, payload: message});
}

export default PopupMsg;
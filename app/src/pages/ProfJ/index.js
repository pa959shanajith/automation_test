import React from 'react';
import ChatBot from './components/ChatBot';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
export var history;

/*Renders the main ProfJ Ui */
const ProfJ = (props)=>{
    const onCloseClick=()=>{
        props.setshowProfJ(false)
    }
    return (
        <ChatBot onCloseClick={onCloseClick}/>
    );
}

export default ProfJ;

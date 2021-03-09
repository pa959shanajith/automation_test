import React from 'react';
import ChatBot from './components/ChatBot';
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

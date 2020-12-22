import React ,{useState} from 'react';
import {ReferenceBar } from '../../global';
import '../styles/Rightbar.scss'

const Rightbar=()=>{
    const hideTask = true ;
    return (
        
            <ReferenceBar 
                hideTask={hideTask} 
            />
           
            )
}

export default Rightbar;

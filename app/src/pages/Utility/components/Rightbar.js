import React ,{useState} from 'react';
import {ReferenceBar } from '../../global';
import '../styles/Rightbar.scss'

const Rightbar=()=>{
    const hideInfo = true ;
    return (
        
            <ReferenceBar 
                hideInfo={hideInfo} 
            />
           
            )
}

export default Rightbar;

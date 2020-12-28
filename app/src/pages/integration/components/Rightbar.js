import React ,{useState} from 'react';
import {ReferenceBar } from '../../global';
import '../styles/Rightbar.scss'

const Rightbar=()=>{
    const hideTask = true ;
    return (
        <div className="right_barr">
            <ReferenceBar 
                hideTask={hideTask} 
            />
        </div>
           
            )
}

export default Rightbar;

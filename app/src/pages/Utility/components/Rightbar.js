import React ,{useState} from 'react';
import {ReferenceBar } from '../../global';
import '../styles/Rightbar.scss'

const Rightbar=()=>{
    const hideInfo = true ;
    return (
        <div className="right_barr">
            <ReferenceBar 
                hideInfo={hideInfo} 
                style={{pposition:"absolute"}}
            />
        </div>
           
            )
}

export default Rightbar;

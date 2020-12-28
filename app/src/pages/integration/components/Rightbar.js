import React from 'react';
import {ReferenceBar } from '../../global';

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

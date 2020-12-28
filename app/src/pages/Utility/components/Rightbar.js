import React from 'react';
import {ReferenceBar } from '../../global';

const Rightbar=()=>{
    const hideInfo = true ;
    return (
        <div className="right_barr">
            <ReferenceBar 
                hideInfo={hideInfo} 
            />
        </div>
           
            )
}

export default Rightbar;

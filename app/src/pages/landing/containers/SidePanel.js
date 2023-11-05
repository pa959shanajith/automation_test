import React from 'react';
import SideBarTiles from '../components/SideBarTiles';
import  DisplayProject from '../components/DisplayProject';
import '../styles/SidePanel.scss';


const SidePanel = (props) => {

    return(
            <div className="sidePanel_container h-full">
                <DisplayProject validateProjectLicense={props.validateProjectLicense} toastError={props.toastError} toastSuccess={props.toastSuccess}/>
            </div> 
    )
}

export default SidePanel;
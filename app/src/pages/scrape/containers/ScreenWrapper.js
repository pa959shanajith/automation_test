import React, { useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import * as pluginApi from "../../plugin/api";
import "../styles/ScreenWrapper.scss";

const ScreenWrapper = props => {
    const { taskName } = useSelector(state=>state.plugin.CT);
    const [projectDetails, setProjectDetails]= useState(null)
    const [projectNames, setProjectNames] = useState(null)

    useEffect(()=>{
        pluginApi.getProjectIDs()
        .then(data => {
                setProjectNames(data)
                pluginApi.getTaskJson_mindmaps(data)
                .then(tasksJson => {
                    setProjectDetails(tasksJson)
                })
                    
})},[])
    return (
        <div className="ss__content">
        <Breadcrumb  className='breadcrumb-item'>
                <Breadcrumb.Item  className='breadcrumb-item-inner' active><span style={{color: 'blue'}}>{projectNames && projectNames.projectName[0]}</span></Breadcrumb.Item>
                <Breadcrumb.Item  className='breadcrumb-item-inner' active><span style={{color: 'blue'}}>{projectDetails && projectDetails[0].taskDetails[0].taskName}</span></Breadcrumb.Item>
                <Breadcrumb.Item  className='breadcrumb-item-inner' active><span style={{color: 'blue'}}>{projectDetails && projectDetails[1].taskDetails[0].taskName}</span></Breadcrumb.Item>
                <Breadcrumb.Item  className='breadcrumb-item-inner' active><span style={{color: 'blue'}}>{taskName}</span></Breadcrumb.Item>
                {/* <Breadcrumb.Item  className='breadcrumb-item-inner' active><span  style={{textDecoration:'none'}} id={isCaptured?'bluecolor':'graycolor'}>Capture Object</span></Breadcrumb.Item> */}
            </Breadcrumb>
            <div className="ss__content_wrap" style={ props.fullHeight ? {height: "100%"} : {}}>
                { /* Task Name */ }
                <div className="ss__task_title">
                    <div className="ss__task_name">{taskName}</div>
                </div>
                {props.compareContent}
                {props.buttonGroup}
                {props.webserviceContent}
            </div>
            {props.scrapeObjectList}
        </div>
    )
}

export default ScreenWrapper;
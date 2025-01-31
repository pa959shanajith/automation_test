import React from 'react';
import { useSelector } from 'react-redux';
// import Breadcrumb from 'react-bootstrap/Breadcrumb';
// import * as pluginApi from "../../plugin/api";
import "../styles/ScreenWrapper.scss";

const ScreenWrapper = props => {
    return (
        <div className="ss__content">
            <div className="ss__content_wrap" style={ props.fullHeight ? {height: "75vh"} : {}}>
                { /* Task Name */ }
                <div className="ss__task_title">
                    {/* <div className="ss__task_name">{taskName}</div> */}
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
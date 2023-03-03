import React from 'react';
import { useSelector } from 'react-redux';
import "../styles/ScreenWrapper.scss";

const ScreenWrapper = props => {
    const { taskName } = useSelector(state=>state.plugin.CT);
    return (
        <div className="ss__content">
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
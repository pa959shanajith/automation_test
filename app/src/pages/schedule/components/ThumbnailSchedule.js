import React from 'react';
import "../styles/ThumbnailSchedule.scss";
import {CheckBox} from "@avo/designcomponents"

const ThumbnailSchedule = (props) => {

    return (
        <div className={"sch__thumbnail " + (props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id) ? " sch__selectedBrowser" : "" )} title={props.tooltip} onClick={()=>{props.UpdateBrowserTypeExe(props.id)}}>
            {props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id)?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
            <img className={"sch__thumbnail__img " + (props.svg ? "svg_ic" : "" )} src={props.img || props.svg} alt={props.title}/>
            <span className="sch__thumbnail__title">{props.title}</span>
        </div>
    );
}

export default ThumbnailSchedule;
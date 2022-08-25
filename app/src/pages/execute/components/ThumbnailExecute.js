import React from 'react';
import "../styles/ThumbnailExecute.scss";
import {CheckBox} from "@avo/designcomponents";

const ThumbnailExecute = (props) => {

    return (
        <div className={"ex__thumbnail" + (props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id) ? " e__selectedBrowser" : "" )} title={props.tooltip} onClick={()=>{props.UpdateBrowserTypeExe(props.id)}}>
            {props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id)?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
            <img className={"ex__thumbnail__img " + (props.svg ? "svg_ic" : "" )} src={props.img || props.svg} alt={props.title}/>
            <span className="ex__thumbnail__title">{props.title}</span>
        </div>
    );
}

export default ThumbnailExecute;
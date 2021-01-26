import React from 'react';
import "../styles/ThumbnailSchedule.scss";

const ThumbnailSchedule = (props) => {

    return (
        <div className="sch__thumbnail" onClick={()=>{props.UpdateBrowserTypeExe(props.id)}}>
            <img className={"sch__thumbnail__img " + (props.svg ? "svg_ic" : "" ) + (props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id) ? " sch__selectedBrowser" : "" )} src={props.img || props.svg} alt={props.title}/>
            <span className="sch__thumbnail__title">{props.title}</span>
        </div>
    );
}

export default ThumbnailSchedule;
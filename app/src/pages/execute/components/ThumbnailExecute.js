import React from 'react';
import "../styles/ThumbnailExecute.scss";

const ThumbnailExecute = (props) => {

    return (
        <div className="ex__thumbnail" onClick={()=>{props.UpdateBrowserTypeExe(props.id)}}>
            <img className={"ex__thumbnail__img " + (props.svg ? "svg_ic" : "" ) + (props.browserTypeExe!==undefined && props.browserTypeExe.includes(props.id) ? " e__selectedBrowser" : "" )} src={props.img || props.svg} alt={props.title}/>
            <span className="ex__thumbnail__title">{props.title}</span>
        </div>
    );
}

export default ThumbnailExecute;
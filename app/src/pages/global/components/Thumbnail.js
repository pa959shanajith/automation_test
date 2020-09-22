import React from 'react';
import "../styles/Thumbnail.scss";

/*
    Component: Icon Thumbnail for ActionBar
    Uses: Render Action Bar Icon by passing only img, title and on click event
    Props : action -> onClick event
            title -> title/caption of the icon, also the alt for img
            img -> img-src string or svg -> for svg images (pass svg jsx as whole)
*/

const Thumbnail = (props) => {

    return (
        <div className="thumbnail" onClick={props.action}>
            {props.svg ? <span className="thumbnail__svg">{props.svg}</span>  : <img className="thumbnail__img" src={props.img} alt={props.title}/>}
            <span className="thumbnail__title">{props.title}</span>
        </div>
    );
}

export default Thumbnail;
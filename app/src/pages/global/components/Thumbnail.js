import React from 'react';
import "../styles/Thumbnail.scss";

/*
    Component: Icon Thumbnail for ActionBar
    Uses: Render Action Bar Icon by passing only img, title and on click event
    Props : action -> onClick event
            title -> title/caption of the icon, also the alt for img
            img -> img-src string or svg -> for svg images (pass svg jsx as whole)
            disable -> disables the thumbnail and renders it unclickable
*/

const Thumbnail = (props) => {

    return (
        <div style={props.idx===4?{borderBottom:'1px solid grey',marginBottom:'2px'}:null}className={"thumbnail" + (props.disable ? " disable-thumbnail" : "")}  title={props.tooltip} onClick={props.action}>
            <img style={props.idx===5?{height:'39px'}:null}className={"thumbnail__img " + (props.svg ? "svg_ic" : "" )} src={props.img || props.svg} alt={props.title}/>
            <span className="thumbnail__title">{props.title}</span>
        </div>
    );
}

export default Thumbnail;
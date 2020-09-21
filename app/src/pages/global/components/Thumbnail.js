import React from 'react';
import "../styles/Thumbnail.scss";

const Thumbnail = (props) => {

    return (
        <div className="thumbnail" onClick={props.action}>
            <img className="thumbnail__img" src={props.img} alt={props.title}/>
            <span className="thumbnail__title">{props.title}</span>
        </div>
    );
}

export default Thumbnail;
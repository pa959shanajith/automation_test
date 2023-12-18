import React from 'react';
import "../styles/ExecutionCard.scss"

const ExecutionCard = ({ item, onExecutionClick, selected, onScreenClick }) => {

    const onClick = onExecutionClick || onScreenClick || function(){}

    return (
        <div className="report__exeCardContainer" onClick={onClick(item._id, item.title, item.onSelId, item.batch_id, item.execution_id)} >
            <div className="report__exeCardHeader">
                { item.smart && <img src="static/imgs/bulb-icon.png" className="report__exeSmartIcon" />}
                <div className="report__exeTitle" >{item.title}</div>
                { item.status && <div className={`report__exeStatus report__exeStatusColor_${item.status}`} >{item.status}</div> }
            </div>
            { item.msg_one && <div className="report__exeDate" > {item.msg_one} </div> }
            { item.msg_two && <div className="report__exeDate" > {item.msg_two} </div> }
            { selected && <div className="selected_execution" /> }
        </div>
    );
}

export default ExecutionCard;
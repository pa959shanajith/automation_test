import React, { useState } from 'react';
import "../styles/TaskSection.scss";

const TaskSection = () =>{

    const [showSearch, setShowSearch] = useState(false);

    return (
        <div className="task-section">
            <div className="task-header">
                <span className="my-task">My Task(s)</span>
                <input className="task-search-bar" style={showSearch ? {visibility: "visible"} : {visibility: "hidden"}}/>
                <span className="task-ic-container" onClick={()=>setShowSearch(!showSearch)}><img className="search-ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/></span>
                <span className="task-ic-container"><img className="filter-ic" alt="filter-ic" src="static/imgs/ic-filter-task.png"/></span>
            </div>
            <div className="task-nav-bar">
                <span className="task-nav-item">To Do</span>
                <span className="task-nav-item">To Review</span>
            </div>
            <div className="task-content">

            </div>
        </div>
    );
}

export default TaskSection;
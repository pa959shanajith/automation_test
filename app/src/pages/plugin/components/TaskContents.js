import React, { useState, useEffect } from 'react';
import TaskPanel from './TaskPanel';


const TaskContents = ({items, filterDat, taskJson}) => {

    const [showPanel, setShowPanel] = useState("");

    useEffect(()=>{
        setShowPanel("");
    }, [items]);

    return (
        <>
        {items.length !== 0 ? 
        <>
        {items.map(item=>{
            return <TaskPanel item={item} showPanel={showPanel} setShowPanel={setShowPanel} filterDat={filterDat} taskJson={taskJson} />
        })}
        </>
        : null }
        </>
    );

}

export default TaskContents;
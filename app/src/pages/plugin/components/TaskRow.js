import React from 'react';



const TaskRow = ({items}) => {

    return (
        <>
        {/* {items.length !== 0 ? 
        <div class='panel panel-default' panel-id='"+i+"'>
            <div id='panelBlock_"+i+"' class='panel-heading'>
                <div class='taskDirection' href='#collapse"+counter+"'>
                    <h4 class='taskNo "+classIndex+" taskRedir'>"+ countertodo +"</h4>
                    <span class='assignedTask' data-testsuitedetails='"+testSuiteDetails+"' data-dataobj='"+dataobj+"' onclick='taskRedirection(this.dataset.testsuitedetails,this.dataset.dataobj,event)'>"+taskname+"</span>
                    <div class='panel-additional-details'>
                        <button class='panel-head-tasktype'>"+tasktype+"</button>
                    </div>
                </div>
            </div>
        </div>
        : null } */}
        </>
    );

}

export default TaskRow;
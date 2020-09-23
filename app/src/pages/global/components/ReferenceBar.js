import React, { useState, useEffect } from 'react';
import {ScrollBar, TaskContents} from '../../global';
import { useSelector } from 'react-redux';
import "../styles/ReferenceBar.scss";

    /* 
        Component : ReferenceBar (Right Bar)
        Uses: Renders the Reference bar on the page
        Props :
            collapsible : if true ReferenceBar can be collapsed or expand. Default is false 
            hideInfo : to hide the default info Icon . by default hideInfo is false
            children : renders the children passed above the task icon. 
    */

const ReferenceBar = (props) => {

    const [collapse, setCollapse] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchItems, setSearchItems] = useState([]);
    const [showTask, setShowTask] = useState(false);
    const [taskPopY, setTaskPopY] = useState(null);


    const tasksJson = useSelector(state=>state.plugin.tasksJson);
    const filterDat = useSelector(state=>state.plugin.FD);

    useEffect(()=>{
            // if(window.location.pathname != '/mindmap'){
            //     $("#mindmapCSS1, #mindmapCSS2").remove();
            // } else if(window.location.pathname != "/neuronGraphs") {
            //     $("#nGraphsCSS").remove();
            // }
            if (Object.keys(tasksJson)!==0){
                setTaskList([]);
            }
            let counter = 1;
            let lenght_tasksJson = tasksJson.length;
            let task_list = [];
            for(let i=0; i < lenght_tasksJson; i++) {
                let testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
                let tasktype = tasksJson[i].taskDetails[0].taskType;
                let taskname = tasksJson[i].taskDetails[0].taskName;
                let dataobj = {
                    'scenarioflag':tasksJson[i].scenarioFlag,
                    'apptype':tasksJson[i].appType,
                    'projectid':tasksJson[i].projectId,
                    'screenid':tasksJson[i].screenId,
                    'screenname':tasksJson[i].screenName,
                    'testcaseid':tasksJson[i].testCaseId,
                    'testcasename':tasksJson[i].testCaseName,
                    'scenarioid':tasksJson[i].scenarioId,
                    'taskname':taskname,
                    'taskdes':tasksJson[i].taskDetails[0].taskDescription,
                    'tasktype':tasksJson[i].taskDetails[0].taskType,
                    'subtask':tasksJson[i].taskDetails[0].subTaskType,
                    'subtaskid':tasksJson[i].taskDetails[0].subTaskId,
                    'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
                    'assignedto':tasksJson[i].taskDetails[0].assignedTo,
                    'startdate':tasksJson[i].taskDetails[0].startDate,
                    'exenddate':tasksJson[i].taskDetails[0].expectedEndDate,
                    'status':tasksJson[i].taskDetails[0].status,
                    'versionnumber':tasksJson[i].versionnumber,
                    'batchTaskIDs':tasksJson[i].taskDetails[0].batchTaskIDs,
                    'releaseid':tasksJson[i].taskDetails[0].releaseid,
                    'cycleid':tasksJson[i].taskDetails[0].cycleid,
                    'reuse':tasksJson[i].taskDetails[0].reuse
                }
                dataobj = JSON.stringify(dataobj)
                task_list.push({'panel_idx': i, 'counter': counter, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype});
                
                // let limit = 45;
                // let chars = $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text();
                // if (chars.length > limit) {
                //    let visiblePart = chars.substr(0, limit-1);
                //    let dots = $("<span class='dots'>...</span>");
                //    let hiddenPart = chars.substr(limit-1);
                //    let assignedTaskText = visiblePart + hiddenPart;
                //    $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text(visiblePart).attr('title',assignedTaskText).append(dots);
                // }
                counter++;
            }
            setTaskList(task_list);
    }, [tasksJson]);

    const onSearchHandler = event => {
        searchTask(event.target.value)
        setSearchValue(event.target.value);
    };

    const searchTask = (value) => {
        let items = taskList;
        let filteredItem = [];
        let counter = 1;
        items.forEach(item => {
            if (item.taskname.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                item.type_counter = counter++;
                filteredItem.push(item)
            }
        });
        setSearchItems(filteredItem);
    }

    const toggleTaskPop = event => {
        setTaskPopY(event.clientY)
        setShowTask(!showTask)
    }

    return (
        <div className="ref__bar">
            { props.collapsible &&
                 <div className={"caret__ref_bar " + (collapse && " caret_ref_collapsed") } onClick={()=>setCollapse(!collapse)}>
                {collapse ? "<" : ">"}
                </div>
            }
            { !collapse && 
                <>
                <div className="min_height_div">
                    <div id="ref_bar_scroll" className="inside_min">
                    {
                        showTask && 
                        <div className="task_pop" style={{marginTop: `calc(${taskPopY}px - 15vh)`}}>
                            <h4 className="pop__header" onClick={()=>setShowTask(false)}><span className="pop__title">My task(s)</span><img className="task_close_arrow" src="static/imgs/ic-arrow.png"/></h4>
                            <div className="input_group">
                                <span className="search_task__ic_box">
                                    <img className="search_task__ic" src="static/imgs/ic-search-icon.png"/>
                                </span>
                                <input className="search_task__input" onChange={onSearchHandler} value={searchValue} placeholder="Seach My task(s)"/>
                            </div>
                            <div className="task_pop__list">
                                <div id='task_pop_scroll' className="task_pop__overflow">
                                    <ScrollBar scrollId='task_pop_scroll' trackColor="#46326b" thumbColor="#fff">
                                        <div className="task_pop__content" id="rb__pop_list">
                                            <TaskContents items={searchValue ? searchItems : taskList} filterDat={filterDat} taskJson={tasksJson}/>
                                        </div>
                                    </ScrollBar>
                                </div>
                            </div>
                        </div>
                    }
                    <ScrollBar scrollId="ref_bar_scroll" trackColor="transparent" thumbColor="#7143b3">
                        <div className="ref__content">
                            <div className="rb_upper_contents">
                                    {props.children}
                                <div className="ic_box" onClick={toggleTaskPop}><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>
                                { !props.hideInfo && <div className="ic_box"><img className="rb__ic-info thumb__ic" src="static/imgs/ic-info.png"/><span className="rb_box_title">Info</span></div>}
                            </div>
                        </div>
                    </ScrollBar>
                </div>
            </div>
            <div className="rb__bottom_content">
                <div className="ic_box"><img className="rb__ic-assist thumb__ic" src="static/imgs/ic-assist.png"/><span className="rb_box_title">Assist</span></div>
                </div>
        </>
        }
        </div>
    );
}
export default ReferenceBar;
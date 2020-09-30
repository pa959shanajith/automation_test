import React, { useState, useEffect } from 'react';
import {ScrollBar, TaskContents} from '../../global';
import { useSelector } from 'react-redux';
import "../styles/ReferenceBar.scss";
import ClickAwayListener from 'react-click-away-listener';

    /* 
        Component : ReferenceBar (Right Bar)
        Uses: Renders the Reference bar on the page
        Props :
            collapsible : if true ReferenceBar can be collapsed or expand. Default is false 
            hideInfo : to hide the default info Icon . by default hideInfo is false
            children : renders the children passed above the task icon. 
            taskTop : send true to keep task before children
            collapse : set true to collpase Refernce bar
            taskName : to let the reference bar know which task to highlight as disabled.
    */

const ReferenceBar = (props) => {

    const [collapse, setCollapse] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchItems, setSearchItems] = useState([]);
    const [showTask, setShowTask] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
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

                task_list.push({'panel_idx': i, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype});
                
            }
            setTaskList(task_list);
    }, [tasksJson]);
    useEffect(()=>{
        setCollapse(props.collapse)
    },[props.collapse])

    useEffect(()=>{
        setShowTask(false);
    }, [props.taskName]);

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

    const closePopups = () => {
        setShowInfo(false);
        setShowTask(false);
    }

    const toggleTaskPop = event => {
        closePopups();
        setTaskPopY(event.clientY)
        setShowTask(!showTask)
    }

    const toggleInfoPop = event => {
        closePopups();
        setTaskPopY(event.clientY);
        setShowInfo(!showInfo);
    }

    return (
        <div className={"ref__wrapper " + (!collapse && "ref__wrapper__expand")}>
        <div className="ref__bar">
            { props.collapsible &&
                <div className={"caret__ref_bar " + (collapse ? "fa fa-caret-left caret_ref_collapsed" : "fa fa-caret-right") } onClick={()=>setCollapse(!collapse)}></div>
            }
            { !collapse && 
                <>
                <div className="min_height_div">
                    <div id="ref_bar_scroll" className="inside_min">
                    {
                        showTask && 
                        <ClickAwayListener onClickAway={closePopups}>
                        <div className="ref_pop task_pop" style={{marginTop: `calc(${taskPopY}px - 15vh)`}}>
                            <h4 className="pop__header" onClick={()=>setShowTask(false)}><span className="pop__title">My task(s)</span><img className="task_close_arrow" alt="close_task" src="static/imgs/ic-arrow.png"/></h4>
                            <div className="input_group">
                                <span className="search_task__ic_box">
                                    <img className="search_task__ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/>
                                </span>
                                <input className="search_task__input" onChange={onSearchHandler} value={searchValue} placeholder="Seach My task(s)"/>
                            </div>
                            <div className="task_pop__list">
                                <div id='task_pop_scroll' className="task_pop__overflow">
                                    <ScrollBar scrollId='task_pop_scroll' trackColor="#46326b" thumbColor="#fff">
                                        <div className="task_pop__content" id="rb__pop_list">
                                            <TaskContents items={searchValue ? searchItems : taskList} taskName={props.taskName} filterDat={filterDat} taskJson={tasksJson}/>
                                        </div>
                                    </ScrollBar>
                                </div>
                            </div>
                        </div>
                        </ClickAwayListener>
                    }

                    {
                        showInfo && 
                        <ClickAwayListener onClickAway={closePopups}>
                        <div className="ref_pop info_pop" style={{marginTop: `calc(${taskPopY}px - 15vh)`}}>
                            <h4 className="pop__header" onClick={()=>setShowInfo(false)}><span className="pop__title">Information</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
                            <div className="info_pop__contents">
                            {
                                Object.keys(props.taskInfo).map(key => 
                                    <>
                                        <div className="task_info__title">{key}:</div>
                                        <div className="task_info__content">{props.taskInfo[key]}</div>
                                    </>
                                )
                            }
                            </div>
                        </div>
                        </ClickAwayListener>
                    }
                    

                    <ScrollBar scrollId="ref_bar_scroll" trackColor="transparent" thumbColor="#7143b3">
                        <div className="ref__content">
                            <div className="rb_upper_contents">
                                {props.taskTop?<div className="ic_box" onClick={toggleTaskPop}><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>:null}
                                    {props.children}
                                {!props.taskTop?<div className="ic_box" onClick={toggleTaskPop}><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>:null}
                                {!props.hideInfo && <div className="ic_box"><img className="rb__ic-info thumb__ic" src="static/imgs/ic-info.png"/><span className="rb_box_title">Info</span></div>}
                            </div>
                        </div>
                    </ScrollBar>
                </div>
            </div>
            <div className="rb__bottom_content">
                <div className="ic_box"><img className="rb__ic-assist thumb__ic" alt="assist-ic" src="static/imgs/ic-assist.png"/><span className="rb_box_title">Assist</span></div>
                </div>
        </>
        }
        </div>
        </div>
    );
}
export default ReferenceBar;
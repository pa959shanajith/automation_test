import React, { useState, useEffect, Fragment } from 'react';
import {ScrollBar, TaskContents, GenerateTaskList } from '../../global';
import { useSelector } from 'react-redux';
import "../styles/ReferenceBar.scss";
import ClickAwayListener from 'react-click-away-listener';
import ProfJ from '../../profJ';

    /* 
        Component : ReferenceBar (Right Bar)
        Uses: Renders the Reference bar on the page
        Props :
            collapsible : if true ReferenceBar can be collapsed or expand. Default is false 
            hideInfo : to hide the default info Icon . by default hideInfo is false
            hideTask : to hide the default task Icon . by default hideTask is false
            children : renders the children passed above the task icon. 
            taskTop : send true to keep task before children
            collapse : set true to collpase Refernce bar
            taskName : to let the reference bar know which task to highlight as disabled.
            popups : to render pop up menus like filter, screenshot 
            closeAllpopups : method to close all passed popups
            scrapeScreenURL : populating the URL field for scrape screen
            taskInfo: task Information to display in taskInfo popup
    */

const ReferenceBar = (props) => {

    const [collapse, setCollapse] = useState(false);
    const [showTask, setShowTask] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [taskPopY, setTaskPopY] = useState(null);
    const [showProfJ , setshowProfJ]= useState(false);
    
    const { uid } = useSelector(state=>state.plugin.CT);

    useEffect(()=>{
        setCollapse(props.collapse)
    },[props.collapse])

    useEffect(()=>{
        setShowTask(false);
    }, [uid]);

    const closePopups = () => {
        if (props.popups) props.closeAllPopups();
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
    const callProfJ = event =>{
        closePopups();
        setshowProfJ(!showProfJ);
    }
    return (
        <div className={"ref__wrapper " + (!collapse && "ref__wrapper__expand")}>
        <div className="ref__bar">
            { props.collapsible &&
                <div className={"caret__ref_bar " + (collapse ? "fa fa-caret-left caret_ref_collapsed" : "fa fa-caret-right") } onClick={()=>{ setCollapse(!collapse); closePopups() }}></div>
            }
            { !collapse && 
                <>
                <div className="min_height_div">
                    <div id="ref_bar_scroll" className="inside_min">
                    { props.popups }
                    {
                        showTask && 
                        <SearchPopup 
                            closePopups={closePopups}
                            taskPopY={taskPopY}
                            setShowTask={setShowTask}
                        />
                    }
                    { showInfo && 
                        <TaskInfoPopup 
                            closePopups={closePopups}
                            taskPopY={taskPopY}
                            setShowInfo={setShowInfo}
                            scrapeScreenURL={props.scrapeScreenURL}
                            providedTaskInfo={props.taskInfo}
                        />
                    }
                    {
                        showProfJ && <ProfJ setshowProfJ={setshowProfJ} />
                    }
                    <ScrollBar scrollId="ref_bar_scroll" trackColor="transparent" thumbColor="#7143b3">
                        <div className="ref__content">
                            <div className="rb_upper_contents">
                                {props.taskTop?<div className="ic_box" onClick={toggleTaskPop} title="Tasks"><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} alt="task-ic" src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>:null}
                                    {props.children}
                                {!props.taskTop && !props.hideTask?<div className="ic_box" onClick={toggleTaskPop} title="Tasks"><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} alt="task-ico" src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>:null}
                                {!props.hideInfo && <div className="ic_box"  onClick={toggleInfoPop} title="Info"><img className="rb__ic-info thumb__ic" alt="info-ic" src="static/imgs/ic-info.png"/><span className="rb_box_title">Info</span></div>}
                            </div>
                        </div>
                    </ScrollBar>
                    
                </div>
            </div>
            <div className="rb__bottom_content" title="Prof J">
                <div className="ic_box"><img className="rb__ic-assist thumb__ic" alt="assist-ic" src="static/imgs/ic-assist.png" onClick={(e)=>callProfJ(e)}/><span className="rb_box_title">Assist</span></div>
            </div>
        </>
        }
        </div>
        </div>
    );
}

/* 
    closePopups
    taskPopY
    setShowInfo
    taskInfo
    scrapeScreenURL
*/

const TaskInfoPopup = ({ closePopups, taskPopY, setShowInfo, providedTaskInfo, scrapeScreenURL}) => {

    const dataDict = useSelector(state=>state.plugin.FD);
    const current_task = useSelector(state=>state.plugin.CT);

    const [taskInfo, setTaskInfo] = useState({});

    useEffect(()=>{
        let newTaskInfo = {};

        if ('uid' in current_task) {
            newTaskInfo = {
                'Project Name': dataDict.projectDict[current_task.projectId] || dataDict.projectDict[current_task.testSuiteDetails[0].projectidts],
                'Screen': current_task.screenName,
                'TestCase': current_task.testCaseName,
                'Release': current_task.releaseid,
                'Cycle': dataDict.cycleDict[current_task.cycleid],
                'URL': scrapeScreenURL || '',
            }
    
            let screen = current_task.taskName.slice(0, 3).toLowerCase();
    
            if (screen === 'exe') {
                delete newTaskInfo['Screen'];
                delete newTaskInfo['TestCase'];
                delete newTaskInfo['URL'];
            }
            else if (screen === 'des') delete newTaskInfo['URL'];
            else if (screen === 'scr') delete newTaskInfo['TestCase'];
        }

        setTaskInfo(providedTaskInfo || newTaskInfo);
    }, [taskPopY, providedTaskInfo])

    return (
        <ClickAwayListener onClickAway={closePopups}>
        <div className={"ref_pop" + (taskInfo?" info_pop":"")} style={{marginTop: `calc(${taskPopY}px - 15vh)`}}>
            <h4 className="pop__header" onClick={()=>setShowInfo(false)}><span className="pop__title">Information</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
            <div className="info_pop__contents">
            {
                Object.keys(taskInfo).map(key => <Fragment key={key}>
                    <div className="task_info__title">{key}:</div>
                    <div className="task_info__content">{taskInfo[key]}</div>
                </Fragment>)
            }
            </div>
        </div>
        </ClickAwayListener> 
    );
}


/* 
    closePopups
    taskPopY
    setShowTask
*/


const SearchPopup = ({ closePopups, taskPopY, setShowTask }) => {

    const { cycleDict } = useSelector(state=>state.plugin.FD);
    const tasksJson = useSelector(state=>state.plugin.tasksJson);
    const { uid } = useSelector(state=>state.plugin.CT);

    const [taskList, setTaskList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchItems, setSearchItems] = useState([]);

    useEffect(()=>{
        let taskList = GenerateTaskList(tasksJson, "refList");
        setTaskList(taskList);
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
            if (item.taskname.toLowerCase().includes(value.toLowerCase())) {
                item.type_counter = counter++;
                filteredItem.push(item)
            }
        });
        setSearchItems(filteredItem);
    }

    return (
        <ClickAwayListener onClickAway={closePopups}>
        <div className="ref_pop task_pop" style={{marginTop: `calc(${taskPopY}px - 15vh)`}}>
            <h4 className="pop__header" onClick={()=>setShowTask(false)}><span className="pop__title">My task(s)</span><img className="task_close_arrow" alt="close_task" src="static/imgs/ic-arrow.png"/></h4>
            <div className="input_group">
                <span className="search_task__ic_box">
                    <img className="search_task__ic" alt="search-ic" src="static/imgs/ic-search-icon.png"/>
                </span>
                <input className="search_task__input" onChange={onSearchHandler} value={searchValue} placeholder="Search My task(s)" autoFocus />
            </div>
            <div className="task_pop__list">
                <div id='task_pop_scroll' className="task_pop__overflow">
                    <ScrollBar scrollId='task_pop_scroll' trackColor={'transparent'} thumbColor={'grey'} minScrollbarLength={30}>
                        <div className="task_pop__content" id="rb__pop_list">
                            <TaskContents items={searchValue ? searchItems : taskList} cycleDict={cycleDict} taskJson={tasksJson} currUid={uid} />
                        </div>
                    </ScrollBar>
                </div>
            </div>
        </div>
        </ClickAwayListener>
    );
}

export default ReferenceBar;
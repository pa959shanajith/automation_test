import React, { useState, useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'
import "../styles/FilterDialog.scss";

const FilterDialog = ({setShow, dataDict, filterData, filterTasks}) => {

    const [proj, setProj] = useState("Select Project");
    const [rel, setRel] = useState("Select Release");
    const [cyc, setCyc] = useState("Select Cycle");
    const [task, setTask] = useState({});
    const [app, setApp] = useState({});

    useEffect(()=>{
        setProj(filterData['prjval']);
        setRel(filterData['relval']);
        setCyc(filterData['cycval']);
        
        if (filterData['tasktype']){
            let types = {}
            Object.keys(filterData.tasktype).forEach(item=>{
                types[item] = filterData.tasktype[item]
            })
            setTask(types);
        }
        if (filterData['apptype']){
            let types = {}
            Object.keys(filterData.apptype).forEach(item=>(
                types[item] = filterData.apptype[item]
            ))
            setApp(types);
        }
        //eslint-disable-next-line
    }, []);

    const onProjSel = event => {
        let prj = event.target.value;
        let rl = "Select Release";
        let cy = "Select Cycle";

        if (Object.keys(dataDict.project[prj].release).length === 1) {
            rl = Object.keys(dataDict.project[prj].release)[0];
            
            if (dataDict.project[prj].release[rl].length === 1) 
                cy = dataDict.project[prj].release[rl][0];
        }

        setProj(prj)
        setRel(rl);
        setCyc(cy);
    };


    const onRelSel = event => {
        let rl = event.target.value;
        let cy = "Select Cycle";

        if (dataDict.project[proj].release[rl].length === 1)
            cy = dataDict.project[proj].release[rl][0];

        setRel(rl)
        setCyc(cy);
    };

    const onCycSel = event => setCyc(event.target.value);

    const onTaskSel = event => {
        if (event.target.checked) setTask({...task, [event.target.value]: true})   
        else setTask({...task, [event.target.value]: false})   
    }

    const onAppSel = event => {
        if (event.target.checked) setApp({...app, [event.target.value]: true})
        else setApp({...app, [event.target.value]: false})
    }

    const Content = () => (
        <div className="filter_body">
            <ScrollBar thumbColor="#311d4e" trackColor="#fff" hideXbar={true}>
            <div data-test="filterContent" className="filter_content">
                
                { /* Project Selection */ }
                <div data-test="selectProjectLabel" className="selection-lbl">
                    <span>Select Project</span>
                </div>
                
                <select data-test="selectProjectDrop" className="selection-select" onChange={onProjSel} value={proj}>
                    <option className="select__menu" disabled value="Select Project">Select Project</option>
                    {Object.keys(dataDict.project).map((id, i)=>(
                        <option key={i} className="select__menu" value={id}>
                            {dataDict.projectDict[id]}
                        </option>   
                    ))}
                </select>
            
                { /* Release Selection */ }
                <div data-test="selectReleaseLabel" className="selection-lbl">
                    <span>Select Release</span>
                </div>
                
                <select  data-test="selectReleaseDrop" className="selection-select" onChange={onRelSel} disabled={proj==="Select Project"} value={rel}>
                    <option className="select__menu" disabled value="Select Release">Select Release</option>
                    { dataDict.project[proj] && Object.keys(dataDict.project[proj].release).map((rel, i)=>(
                        <option key={i} className="select__menu" value={rel}>
                            {rel}
                        </option>
                    ))}
                </select>
            
                { /* Cycle Selection */ }
                <div  data-test="selectCycleLabel" className="selection-lbl">
                    <span>Select Cycle</span>
                </div>
                <select data-test="selectCycleDrop" className="selection-select" onChange={onCycSel} disabled={rel==="Select Release"} value={cyc}>
                    <option className="select__menu" disabled value="Select Cycle">Select Cycle</option>
                    { dataDict.project[proj] && dataDict.project[proj].release[rel] && dataDict.project[proj].release[rel].map((cycID, i)=>(
                        <option key={i} className="select__menu" value={cycID}>
                            {dataDict.cycleDict[cycID]}
                        </option>
                    ))}
                </select>

                {/*  Task Types */}
                <div data-test="taskTypeLabel" className="selection-lbl">
                    <span>Task Type:</span>
                </div>
                <span data-test="taskTypeCheckBox" className="chkbx_div">{dataDict.tasktypes.map((item, i)=>(
                    <label key={i} className="filter_checkbox"><input className="chkbx" type="checkbox" checked={task[item]} onChange={onTaskSel} value={item}/>{item}</label>
                ))}</span>

                {/*  App Types */}
                <div  data-test="appTypeLabel" className="selection-lbl">
                    <span>AppTypes:</span>
                </div>
                <span data-test="appTypeCheckBox" className="chkbx_div">{dataDict.apptypes.map((item, i)=>(
                    <label key={i} className="filter_checkbox"><input className="chkbx" type="checkbox" checked={app[item]} onChange={onAppSel} value={item}/>{item}</label>
                ))}</span>
            </div>
            </ScrollBar>
        </div>
    )

    const onResetFields = event => {
        setProj("Select Project");
        setRel("Select Release");
        setCyc("Select Cycle");
        setTask({});
        setApp({});
    }

    const filter = () =>{
        let p = proj;
        let r = rel;
        let c = cyc;
        let filterData = {'prjval': p,'relval': r,'cycval':c,'apptype':app,'tasktype':task};
        filterTasks(filterData);
    }

    const Footer = () => (
        <>
            <button data-test="reset" onClick={onResetFields}>Reset Fields</button>
            <button data-test="filter" onClick={filter}>Filter</button>
        </>
    )

    return (
        <div data-test="filterModalPop" className="filter__pop">
        <ModalContainer 
            title="Filter Tasks"
            content={Content()}
            close={()=>setShow(false)}
            footer={Footer()}
        />
        </div>
    );
}

export default FilterDialog;
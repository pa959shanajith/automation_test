import React, { useState, useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'
import "../styles/FilterDialog.scss";

const FilterDialog = ({setShow, filterDat, filterData, filterTasks}) => {

    const [proj, setProj] = useState("Select Project");
    const [rel, setRel] = useState("Select Release");
    const [cyc, setCyc] = useState("Select Cycle");
    const [task, setTask] = useState({});
    const [app, setApp] = useState({});

    const onProjSel = event => setProj(event.target.value);
    const onRelSel = event => setRel(event.target.value);
    const onCycSel = event => setCyc(event.target.value);
    const onTaskSel = event => {
        if (event.target.checked) setTask({...task, [event.target.value]: true})
        else setTask({...task, [event.target.value]: false})
    }
    const onAppSel = event => {
        if (event.target.checked) setApp({...app, [event.target.value]: true})
        else setApp({...app, [event.target.value]: false})
    }

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
        if (filterData['apptypes']){
            let types = {}
            Object.keys(filterData.apptype).forEach(item=>(
                types[item] = filterData.apptype[item]
            ))
            setApp(types);
        }
    }, []);

    const content = () => (
        <div className="filter_body">
            {console.log(task)}
            <ScrollBar thumbColor="#311d4e" trackColor="#fff">
            <div className="filter_content">
                
                <div className="selection-lbl">
                    <span>Select Project</span>
                </div>
                <select className="selection-select" onChange={onProjSel} value={proj}>
                    <option className="select__menu" disabled value="Select Project">Select Project</option>
                    {Object.keys(filterDat.idnamemapprj).map(id=>(
                        <option className="select__menu" value={id}>{filterDat.idnamemapprj[id]}</option>   
                    ))}
                </select>
            
                <div className="selection-lbl">
                    <span>Select Release</span>
                </div>
                <select className="selection-select" onChange={onRelSel} disabled={!proj} value={rel}>
                    <option className="select__menu" disabled value="Select Release">Select Release</option>
                    {Object.keys(filterDat.idnamemaprel).map(id=>(
                        <option className="select__menu" value={id}>{filterDat.idnamemaprel[id]}</option>
                    ))}
                </select>
            
                <div className="selection-lbl">
                    <span>Select Cycle</span>
                </div>
                <select className="selection-select" onChange={onCycSel} disabled={!rel} value={cyc}>
                    <option className="select__menu" disabled value="Select Cycle">Select Cycle</option>
                    {Object.keys(filterDat.idnamemapcyc).map(id=>(
                        <option className="select__menu" value={id}>{filterDat.idnamemapcyc[id]}</option>
                    ))}
                </select>

                <div className="selection-lbl">
                    <span>Task Type:</span>
                </div>
                <span className="chkbx_div">{filterDat.tasktypes.map(item=>(
                    <label className="filter_checkbox"><input className="chkbx" type="checkbox" checked={task[item]} onChange={onTaskSel} value={item}/>{item}</label>
                ))}</span>

                <div className="selection-lbl">
                    <span>AppTypes:</span>
                </div>
                <span className="chkbx_div">{filterDat.apptypes.map(item=>(
                    <label className="filter_checkbox"><input className="chkbx" type="checkbox" checked={app[item]} onChange={onAppSel} value={item}/>{item}</label>
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
        if (!p) p = "Select Project";
        if (!r) r = "Select Release";
        if (!c) c = "Select Cycle";
        let filterData = {'prjval': p,'relval': r,'cycval':c,'apptype':app,'tasktype':task};
        filterTasks(filterData);
    }

    const footer = () => (
        <>
            <button onClick={onResetFields}>Reset Fields</button>
            <button onClick={filter}>Filter</button>
        </>
    )

    return (
        <div className="filter__pop">
        <ModalContainer 
            title="Filter Tasks"
            content={content()}
            close={()=>setShow(false)}
            footer={footer()}
        />
        </div>
    );
}

export default FilterDialog;
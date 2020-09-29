import React, { useState, useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global'
import "../styles/FilterDialog.scss";

const FilterDialog = ({setShow, filterDat, filterData, filterTasks}) => {

    const [proj, setProj] = useState("Select Project");
    const [rel, setRel] = useState("Select Release");
    const [cyc, setCyc] = useState("Select Cycle");
    const [task, setTask] = useState({});
    const [app, setApp] = useState({});

    const onProjSel = event => {
        let prj = event.target.value;
        let rl = "Select Release";
        let cy = "Select Cycle";
        if (Object.keys(filterDat.prjrelmap[prj]).length === 1) {
            rl = filterDat.prjrelmap[prj][0];
            if (Object.keys(filterDat.relcycmap[rl]).length === 1) cy = filterDat.relcycmap[rl][0];
        }
        setProj(prj)
        setRel(rl);
        setCyc(cy);
    };
    const onRelSel = event => {
        let rl = event.target.value;
        let cy = "Select Cycle";
        if (Object.keys(filterDat.relcycmap[rl]).length === 1) cy = filterDat.relcycmap[rl];
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

    const Content = () => (
        <div className="filter_body">
            <ScrollBar thumbColor="#311d4e" trackColor="#fff">
            <div className="filter_content">
                <div className="selection-lbl">
                    <span>Select Project</span>
                </div>
                <select className="selection-select" onChange={onProjSel} value={proj}>
                    <option className="select__menu" disabled value="Select Project">Select Project</option>
                    {Object.keys(filterDat.idnamemapprj).map((id, i)=>(
                        <option key={i} className="select__menu" value={id}>{filterDat.idnamemapprj[id]}</option>   
                    ))}
                </select>
            
                <div className="selection-lbl">
                    <span>Select Release</span>
                </div>
                <select className="selection-select" onChange={onRelSel} disabled={proj==="Select Project"} value={rel}>
                    <option className="select__menu" disabled value="Select Release">Select Release</option>
                    { filterDat.prjrelmap[proj] && filterDat.prjrelmap[proj].map((rel, i)=>(
                        <option key={i} className="select__menu" value={rel}>{filterDat.idnamemaprel[rel]}</option>
                    ))}
                </select>
            
                <div className="selection-lbl">
                    <span>Select Cycle</span>
                </div>
                <select className="selection-select" onChange={onCycSel} disabled={rel==="Select Release"} value={cyc}>
                    <option className="select__menu" disabled value="Select Cycle">Select Cycle</option>
                    { filterDat.relcycmap[rel] && filterDat.relcycmap[rel].map((id, i)=>(
                        <option key={i} className="select__menu" value={id}>{filterDat.idnamemapcyc[id]}</option>
                    ))}
                </select>

                <div className="selection-lbl">
                    <span>Task Type:</span>
                </div>
                <span className="chkbx_div">{filterDat.tasktypes.map((item, i)=>(
                    <label key={i} className="filter_checkbox"><input className="chkbx" type="checkbox" checked={task[item]} onChange={onTaskSel} value={item}/>{item}</label>
                ))}</span>

                <div className="selection-lbl">
                    <span>AppTypes:</span>
                </div>
                <span className="chkbx_div">{filterDat.apptypes.map((item, i)=>(
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
        if (!p) p = "Select Project";
        if (!r) r = "Select Release";
        if (!c) c = "Select Cycle";
        let filterData = {'prjval': p,'relval': r,'cycval':c,'apptype':app,'tasktype':task};
        filterTasks(filterData);
    }

    const Footer = () => (
        <>
            <button onClick={onResetFields}>Reset Fields</button>
            <button onClick={filter}>Filter</button>
        </>
    )

    return (
        <div className="filter__pop">
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
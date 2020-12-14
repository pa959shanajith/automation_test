import React, { Fragment } from 'react';
import '../styles/ToolbarMenuEnE.scss'
import ModuleListDropEnE from './ModuleListDropEnE';

const ToolbarMenuEnE = () =>{
    const projectList = ['ok','lol']
    const initProj='lol'
    const selectProj = () =>{}
    return(
        <Fragment>
        <div className='ene_toolbar__header'>
            <div className='ene_toolbar_module_header'>
                <label>Project:</label>
                <select value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                    {projectList.map((e,i)=><option value={e} key={i}>{e}</option>)}
                </select>
                <span className='ene_toolbar__header-searchbox'>
                    <input placeholder="Search Modules"onChange={(e)=>selectProj(e.target.value)}></input>
                    <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                </span>
            </div>
            <div className='ene_toolbar_scenario'>
                <label>Scenarios:</label>
                <span className='ene_toolbar__header-searchbox'>
                    <input placeholder="Search Modules"onChange={(e)=>selectProj(e.target.value)}></input>
                    <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                </span>
            </div>
            <ModuleListDropEnE/>
        </div>
        </Fragment>
    )
}

export default ToolbarMenuEnE;
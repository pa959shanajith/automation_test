import React from 'react'; 
import  { useState} from 'react';
import { Card } from 'primereact/card';
import '../styles/DisplayProject.scss'
import { Panel } from 'primereact/panel';
import { Ripple } from 'primereact/ripple';
import { InputText } from "primereact/inputtext";
import CreateProject from './CreateProject';


export default function BasicDemo() {
    const SidePanelProjectsDisplay = {
        description: "Description for Project 1"
    }
    const [visible, setVisible] = useState( false );
    const template = (options) => {
        const toggleIcon = options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up';
        const className = `${options.className} justify-content-start`;
        const titleClassName = `${options.titleClassName} ml-2 text-primary`;
        const style = { fontSize: '1.1rem' };
        
        return (
            <>
            {visible && <CreateProject setVisible={setVisible} />}
            <div className={className}>
                <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <span className={toggleIcon}></span>
                    <Ripple />
                </button>
                <span className={titleClassName} style={style}>ALL PROJECTS</span>
                <span style={{margin: '0rem 1rem 0rem 1.378rem'}}><button className="pi pi-plus" style={{border: 'none',cursor:'pointer'}} onClick={() => setVisible(true)}></button> </span>
                <span><button className="pi pi-sort-amount-down" style={{border: 'none',cursor:'pointer'}}/></span>
            </div>
            </>
        );
    };
    

    return (
        <>
        <div style={{ width: '4vw'}}>
            <Card style={{height: '35rem'}}></Card>
        <div>
                <Card className='cardSize p c align'>
                    <Panel className='projectDisplay' headerTemplate={template} toggleable>
                        <div className="card flex flex-wrap justify-content-center gap-3">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText id='i' placeholder="Search" autoComplete='off'/>
                            </span>
                            {/* <span>{Dispalyproject.description}</span> */}
                        </div>
                    </Panel>
                </Card>
            </div>
        </div>
            </>
       
    )
}
        
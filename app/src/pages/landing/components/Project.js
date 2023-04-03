
import React from 'react'; 
import { Card } from 'primereact/card';
import '../styles/Project.scss'
// import projectToggle from './projectToggle'
import { Panel } from 'primereact/panel';
import { Ripple } from 'primereact/ripple';
// import { Button } from 'primereact/button';
import { InputText } from "primereact/inputtext";
// import { Icon } from 'primereact/icon';

// import 'primeicons/primeicons.css';

export default function BasicDemo() {
    const template = (options) => {
        const toggleIcon = options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up';
        const className = `${options.className} justify-content-start`;
        const titleClassName = `${options.titleClassName} ml-2 text-primary`;
        const style = { fontSize: '1.25rem' };


        return (
            <div className={className}>
                <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <span className={toggleIcon}></span>
                    <Ripple />
                </button>
                <span className={titleClassName} style={style}>ALL PROJECTS</span>
                {/* <div> */}
                {/* <div className="flex flex-wrap justify-content-center "> */}
                {/* <div className="card"> */}
                {/* <div className="flex flex-wrap justify-content-center gap-3 mb-4"> */}
                <span style={{margin: '0rem 1rem 0rem 1.378rem'}}><button className="pi pi-plus" style={{border: 'none',cursor:'pointer'}}></button> </span>
                <span><button className="pi pi-sort-amount-down" style={{border: 'none',cursor:'pointer'}}/></span>
                {/* <Button icon="pi pi-times" rounded text severity="danger" aria-label="Cancel" /> */}
                {/* <button icon="pi pi-times" /> */}


                {/* </div> */}
                {/* </div> */}
                    
                {/* </button> */}
            </div>
        );
    };

    return (
        <><div style={{ width: '4vw'}}>
            <Card style={{height: '35rem'}}></Card>
       
        <div>
                <Card className='cardSize p c align'>
                    <Panel className='projectDisplay' headerTemplate={template} toggleable>
                        <div className="card flex flex-wrap justify-content-center gap-3">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText id='i' placeholder="Search" />
                            </span>
                        </div>
                    </Panel>

                </Card>

            </div>
            </div>
            </>
       
    )
}
        
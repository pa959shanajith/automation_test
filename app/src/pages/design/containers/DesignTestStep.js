import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState, useRef, useEffect } from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';


const DesignModal = (props) => {
    const [showTable, setShowTable] = useState(false);

    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Step</h5>
                <h4 className='dailog_header2'>Signup screen 1</h4>
                <img className="screen_btn" src="static/imgs/ic-screen-icon.png" />
        <div className='btn__grp'>
            <button className='debug__btn'>Debug</button>
            <button className='add__step__btn'>Add Test Step</button>
        </div>
            </div>
        </>
    );

    const toggleTableVisibility = () => {
        setShowTable(!showTable);
    };


    return (
        <>
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin:'0px' }} onHide={() => props.setVisibleDesignStep(false)}>
                <div className='toggle__tab'>
                    <Accordion activeIndex={0}>
                        <AccordionTab header="Header I" onClick={toggleTableVisibility}>
                            {showTable && (
                                <DataTable
                                    value={[]}
                                    rowReorder
                                    emptyMessage="No data found"
                                >
                                    <Column style={{ width: '3em' }} rowReorder />
                                    <Column field="selectall" header="Select all"></Column>
                                    <Column field="keyword" header="Keyword"></Column>
                                    <Column field="input" header="Input"></Column>
                                    <Column field="output" header="Output"></Column>
                                    <Column field="remark" header="Remarks"/>
                                    <Column field="detail" header="Details"/>
                                    <Column field="action" header="Actions"/>
                                </DataTable>
                            )}
                        </AccordionTab>
                    </Accordion>
                </div>
            </Dialog>
        </>
    )
}
export default DesignModal;
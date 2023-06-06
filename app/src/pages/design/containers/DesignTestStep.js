import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState, useRef, useEffect } from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';


const DesignModal = (props) => {
    const [showTable, setShowTable] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [visible, setVisible] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [addedTestCase, setAddedTestCase] = useState([]);

    const handleDesignBtn = () => {
        setVisible(true);
    }

    const handleSpanClick = (index) => {
        if (selectedSpan === index) {
            setSelectedSpan(null);
        } else {
            setSelectedSpan(index);
        }
    };

    const toggleTableVisibility = () => {
        setShowTable(true);
    };
    const handleAdd = () => {
        setAddedTestCase([...addedTestCase, testCases]);
        setTestCases('');
    };


    const AddTestCases = [
        { name: 'Test1', code: 't1' },
        { name: 'Test2', code: 't2' },
        { name: 'Test3', code: 't3' },
        { name: 'Test4', code: 't4' },
        { name: 'Test5', code: 't5' }
    ];

    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Step</h5>
                <h4 className='dailog_header2'>Signup screen 1</h4>
                <img className="screen_btn" src="static/imgs/ic-screen-icon.png" />
                <div className='btn__grp'>
                    <Button size='small' onClick={handleDesignBtn} label='Debug' outlined></Button>
                    <Button size='small' label='Add Test Step'></Button>
                </div>
            </div>
        </>
    );

    const emptyMessage = (
        <div className='empty__msg1'>
            <div className='empty__msg'>
            <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
            <p className="not_captured_message">No Design Step yet</p>
            </div>
            <Button className="btn-design-single" label='Design Test Steps'></Button>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Cancel" className="p-button-text" />
            <Button label="Debug" autoFocus />
        </div>
    );

    return (
        <>
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => props.setVisibleDesignStep(false)} >
                <div className='toggle__tab'>
                    <Accordion activeIndex={0}>
                        <AccordionTab header="Header I" onClick={toggleTableVisibility}>
                            <DataTable
                                value={[]}
                                rowReorder
                                emptyMessage={emptyMessage}>
                                <Column style={{ width: '3em' }} rowReorder />
                                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                                <Column field="selectall" header="Select all"></Column>
                                <Column field="keyword" header="Keyword"></Column>
                                <Column field="input" header="Input"></Column>
                                <Column field="output" header="Output"></Column>
                                <Column field="remark" header="Remarks" />
                                <Column field="detail" header="Details" />
                                <Column field="action" header="Actions" />
                            </DataTable>
                        </AccordionTab>
                    </Accordion>
                </div>
            </Dialog>

            <Dialog className={"debug__object__modal"} header="Design:Sign up screen 1" style={{ height: "31.06rem", width: "47.06rem" }} visible={visible} onHide={() => setVisible(false)} footer={footerContent}>
                <div className='debug__btn'>
                    <div className={"debug__object"}>
                        <span className='debug__opt'>
                            <p className='debug__otp__text'>Choose Browsers</p>
                        </span>
                        <span className='browser__col'>
                            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chorme.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                        </span>
                    </div>
                    <div>
                        <div className='design__fst__card'>
                            <span>Add Dependent Test Case (Optional)</span>
                            <div className='add__test__case'>
                                <Dropdown className='add__depend__test' value={testCases} onChange={(e) => setTestCases(e.value)} options={AddTestCases} optionLabel="name"
                                    placeholder="Select"></Dropdown>
                                <Button size='small' label='Add' className='add__btn' onClick={handleAdd}></Button>
                            </div>
                        </div>
                        <div className='design__snd__card'>
                            <div className='design__thr__card'>
                                <span className='design__thr__card'>
                                    <p>Added Dependent Test Cases</p>
                                    <p>Clear</p>
                                </span>
                            </div>
                            <div className={addedTestCase.length>0?'added__card':''}>
                                {addedTestCase.map((value, index) => (
                                <div key={index}>
                                    <p className={addedTestCase.length>0?'text__added__step' : ''}>{value.name}</p>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                </div>

            </Dialog>
        </>
    )
}
export default DesignModal;
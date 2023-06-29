/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import '../styles/reports.scss';
import ReportTestTable from './ReportTestTable';
import { RadioButton } from "primereact/radiobutton";
import { InputText } from 'primereact/inputtext';
// import ExecutionprofileTable from './ExecutionprofileTable';



const reports = () => {
    const [activeIndex, setActiveIndex] = useState("Functional Test");
    const [testSteps, setTestSteps] = useState(false);
    const [testStep, setTestStep] = useState(true);
    const [testSteped, setTestSteped] = useState(false);
    const [actionDropDown, setActionDropDown] = useState(false);
    const [actionedDropDown, setActionedDropDown] = useState(false);
    const [show, setShow] = useState(false);
    const [dropdownData, setDropdownData] = useState([]);
    const [executionButon, setExecutionButon] = useState('');
    const prjList = useSelector(state => state.design.projectList)
    // const selectProj = useSelector(state=>state.plugin.PN)
    const initProj = useSelector(state => state.design.selectedProj)
    const [reportData, setReportData] = useState([
        {
            key: "Execution Profile 1",
            value: ""
        }, {
            key: "Execution Profile 2",
            value: ""
        }, {
            key: "Execution Profile 3",
            value: ""
        }, {
            key: "Execution Profile 4",
            value: ""
        }, {
            key: "Execution Profile 5",
            value: ""
        }, {
            key: "Execution Profile 6",
            value: ""
        }
    ])
    var projectList = Object.entries(prjList)
    const [selectedItem, setSelectedItem] = useState(null);
    const sort = [
        { name: 'Last modified', code: '0' },
        { name: 'Report Generation Date', code: '1' },
        { name: 'Alphabetical', code: '2' },
    ];
    const defaultSort = sort[0].code;
    const project = [
        { name: 'Project1', code: '0' },
        { name: 'Project2', code: '1' },
        { name: 'Project3', code: '2' },
        { name: 'Project4', code: '3' },
    ];
    const defaultProject = project[0].code;
    const [selectedProject, setSelectedProject] = useState(null);
    function handleTest(options) {
        if (options === "Functional Test") {
            setActiveIndex(options)
            setTestStep(true)
            setTestSteped(false)
            setTestSteps(false)
        }
        else if (options === "Accessibility Test") {
            setActiveIndex(options)
            setTestSteps(true)
            setTestStep(false)
            setTestSteped(false)
        }
        else {
            setActiveIndex(options)
            setTestSteped(true)
            setTestSteps(false)
            setTestStep(false)
        }
    }

    const handleClicked = (e) => {
        setSelectedItem(e.value);
    }
    const handleToggle = (e) => {
        setSelectedProject(e.value)

    }
    function handleClick(event) {
        event.preventDefault();
        console.info('You clicked a breadcrumb.');
    }
    function handleData() {
        setShow(true);
    }

    return (
        <div className='report_landing'>
            <div className='report'>
                {/* <div role="presentation" onClick={handleClick}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/landing">
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" href="/reports">
                        Reports
                    </Link>
                    <Typography color="text.primary">Functional Test</Typography>
                </Breadcrumbs>
            </div> */}
                {/* <div className='Projectreport'><h2 className='projectDropDown'>Reports: </h2><Dropdown value={selectedProject} onChange={handleToggle} options={project} optionLabel="name" placeholder='Select a Project' className="w-full md:w-10rem ml-2" /> */}
                <div>
                    <label data-test="projectLabel" className='Projectreport'>Reports:</label>
                    <select data-test="projectSelect" className='projectSelectreport' value={initProj} >
                        {projectList.map((e, i) => <option value={e[1].id} key={i}>{e[1].name}</option>)}
                    </select>
                </div>
                {!show && <div id="reports" className="cards">
                    <div className="buttonReports">
                        <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{ height: "1.2rem" }} src="static/imgs/Functional.png" />} id="buttonF" className={testStep !== false ? "textf" : "textF"} label="Functional Test" value="Functional Test" />
                        <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{ height: "1.2rem" }} src="static/imgs/Accessibility.png" />} id="buttonA" className={testSteps !== false ? "texta" : "textA"} label="Accessibility Test" value="Accessibility Test" />
                        <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{ height: "1.2rem" }} src="static/imgs/Functional&Accessibility.png" />} id="buttonFA" className={testSteped !== false ? "textFA" : "textfa"} label="Functional and Accessibility" value="Functional and Accessibility" />
                    </div>

                    <>
                        {reportData  ? (<>
                            <div className="card flex justify-content-start relative report_btn">
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex align-items-center">
                                        <RadioButton inputId="View by Execution Profile" name="View by Execution Profile" value="View by Execution Profile" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Execution Profile'} />
                                        <label htmlFor="View by Execution Profile" className="ml-2">View by Execution Profile</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <RadioButton inputId="View by Modules" name="View by Modules" value="View by Modules" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Modules'} />
                                        <label htmlFor="View by Modules" className="ml-2">View by Modules</label>
                                    </div>
                                </div>
                            </div>

                            <div className="p-input-icon-left report-search">
                                <i className="pi pi-search" />
                                <InputText className='report_search_input' placeholder="Search" />
                            </div>
                            {/* <div className='sort' ><h2 className='projectDropDown'>Sort: </h2><Dropdown value={selectedItem} onChange={handleClicked} options={sort} optionLabel="name" className="w-full md:w-14rem ml-2" placeholder='Select a Sort' /></div> */}
                            <label data-test="projectLabel" className='Projectreport'>Sort:</label>
                            <select data-test="projectSelect" className='projectSelectreport' value={selectedItem} onChange={handleClicked} options={sort} optionLabel="name"/>
                            {activeIndex === "Functional Test" && <div className="grid ml-2" >
                                {reportData.map((data) => <div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p onMouseDownCapture={handleData}>{data.key}</p></Card></div>)}
                            </div>}
                            {activeIndex === "Accessibility Test" && <div className="grid ml-2" >
                                {reportData.map((data) => <div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p>Accessibility Test</p></Card></div>)}
                            </div>}
                            {activeIndex === "Functional and Accessibility" && <div className="grid ml-2" >
                                {reportData.map((data) => <div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p>Functional and Accessibility</p></Card></div>)}
                            </div>}</>)
                            : (<div className='Report_Image'><img src="static/imgs/Functional_report_not_found.svg" alt="Empty data" /></div>)}
                    </>
                </div>}
                {show && <ReportTestTable />}
            </div>
        </div>
    )
}

export default reports;
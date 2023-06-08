/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import {Card} from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import '../styles/reports.scss';
import ReportTestTable from './ReportTestTable';
// import ExecutionprofileTable from './ExecutionprofileTable';



const reports = () => {
    const [activeIndex, setActiveIndex] = useState("Functional Test");
    const [testSteps, setTestSteps] = useState(false);
    const [testStep, setTestStep] = useState(true);
    const [testSteped, setTestSteped] = useState(false);
    const [actionDropDown, setActionDropDown] = useState(false);
    const [actionedDropDown, setActionedDropDown] = useState(false);
    const [show , setShow] = useState(false);
    const [dropdownData, setDropdownData] = useState([]);
    const [reportData, setReportData] = useState([
        {
            key: "Execute 1",
            value: ""
        },{
            key: "Execute 2",
            value:""
        },{
            key: "Execute 3",
            value:""
        },{
            key: "Execute 4",
            value:""
        },{
            key: "Execute 5",
            value: ""
        },{
            key: "Execute 6",
            value: ""
        }
    ])
    const [selectedItem, setSelectedItem] = useState(null);
    const sort = [
        { name: 'Last modified', code: '0' },
        { name: 'Report Generation Date', code: '1' },
        { name: 'Aldhabetical', code: '2' },
    ];
    const project = [
        {name: 'Project1', code: '0'},
        {name: 'Project2', code: '1'},
        {name: 'Project3', code: '2'},
        {name: 'Project4', code: '3'},
    ];
    const [selectedProject, setSelectedProject] = useState(null);
    function handleTest(options){
        if(options === "Functional Test"){
            setActiveIndex(options)
            setTestStep(true)
            setTestSteped(false)
            setTestSteps(false)
        }
        else if (options === "Accessibility Test"){
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
    function handleData(){
        setShow(true);
    }
    return(
        <div className='report'>
            <div role="presentation" onClick={handleClick}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/landing">
                    Home
                    </Link>
                    <Link underline="hover" color="inherit" href="/reports">
                    Reports
                    </Link>
                    <Typography color="text.primary">Functional Test</Typography>
                </Breadcrumbs>
            </div>
            <div style={{display:"inline-flex"}}><h2 className='projectDropDown'>Reports: </h2><Dropdown value={selectedProject} onChange={handleToggle} options={project} optionLabel="name" placeholder='Select a Project' className="w-full md:w-10rem" />
        </div>
        {!show && <div id="reports" className="cards">
                <div className="buttonReports">
                    <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{height: "1.2rem"}} src="static/imgs/Functional.png"/>} id="buttonF" className={testStep !== false?"textf":"textF"} label="Functional Test" value="Functional Test" />
                    <Button onClick={(e) => handleTest(e.target.value)}  icon={<img alt="function" style={{height: "1.2rem"}} src="static/imgs/Accessibility.png"/>} id="buttonA" className={testSteps !== false?"texta":"textA"} label="Accessibility Test" value="Accessibility Test"/>
                    <Button onClick={(e) => handleTest(e.target.value)}  icon={<img alt="function" style={{height: "1.2rem"}} src="static/imgs/Functional&Accessibility.png"/>} id="buttonFA" className={testSteped !== false?"textFA":"textfa"} label="Functional and Accessibility" value="Functional and Accessibility" />
                </div>
                <div className='sort' ><h2 className='projectDropDown'>Sort: </h2><Dropdown value={selectedItem} onChange={handleClicked} options={sort}  optionLabel="name" className="w-full md:w-14rem" placeholder='Select a Sort' /></div>
                {activeIndex === "Functional Test" && <div className="grid ml-0" >
                    {reportData.map((data)=><div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p onMouseDownCapture={handleData}>Functional Test</p></Card></div>)}
                </div>}
                {activeIndex === "Accessibility Test" && <div className="grid ml-0" >
                    {reportData.map((data)=><div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p>Accessibility Test</p></Card></div>)}
                </div>}
                {activeIndex === "Functional and Accessibility" && <div className="grid ml-0" >
                    {reportData.map((data)=><div className='xl:col-3 md:col-6 sm:col-12'><Card key={data.key} className='testCards' ><p>Functional and Accessibility</p></Card></div>)}
                </div>}
            </div>}
            {show && <ReportTestTable/>}
        </div>
    )
}

export default reports;
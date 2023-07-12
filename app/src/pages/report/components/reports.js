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
import { AvatarGroup } from 'primereact/avatargroup';
import { Avatar } from 'primereact/avatar';
import { fetchConfigureList, getProjectList } from "../api";
import { NavLink } from 'react-router-dom';
// import ExecutionprofileTable from './ExecutionprofileTable';



const reports = () => {
    const [activeIndex, setActiveIndex] = useState("Functional Test");
    const [testSteps, setTestSteps] = useState(false);
    const [testStep, setTestStep] = useState(true);
    const [testSteped, setTestSteped] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchReportData, setSearchReportData] = useState('');
    const [configProjectId, setConfigProjectId] = useState("");
    const [projectList, setProjectList] = useState([]);
    const [show, setShow] = useState(false);
    const [dropdownData, setDropdownData] = useState([]);
    const [executionButon, setExecutionButon] = useState('View by Execution Profile');

    useEffect(() => {
        (async () => {
            var data = [];
            const Projects = await getProjectList();
            for (var i = 0; Projects.projectName.length > i; i++) {
                data.push({ name: Projects.projectName[i], id: Projects.projectId[i] });
            }
            setConfigProjectId(data[0] && data[0]?.id);
            setProjectList(data);
        })();
    }, []);

    useEffect(() => {
        configProjectId && (async () => {
            const executionProfileName = await fetchConfigureList({ projectid: configProjectId });
            if (executionProfileName && executionProfileName.length > 0) {
                const extractedExecutionProfileData = executionProfileName.map((obj) => ({
                    configurename: obj?.configurename || '',
                    selectedModuleType: obj?.executionRequest?.selectedModuleType || '',
                    configurekey: obj?.configurekey || '',
                }));
                console.log(executionProfileName);
                setReportData(extractedExecutionProfileData);
            } else {
                setReportData([]);
            }
        })();
    }, [configProjectId]);

    const [reportData, setReportData] = useState([]);
    const [reportDataModule, setReportDataModule] = useState([
        {
            key: "moduleName_1",
            scenariovalue: "4 scenarios",
            value: <img className='browser__img' src='static/imgs/chrome.png' />
        }, {
            key: "moduleName_2",
            scenariovalue: "2 scenarios",
            value: <img className='browser__img' src='static/imgs/fire-fox.png' />
        }, {
            key: "moduleName_3",
            scenariovalue: "3 scenarios",
            value: <img className='browser__img' src='static/imgs/chrome.png' />
        }, {
            key: "moduleName_4",
            scenariovalue: "1 scenarios",
            value: <img className='browser__img' src='static/imgs/edge.png' />
        }, {
            key: "moduleName_5",
            scenariovalue: "4 scenarios",
            value: <img className='browser__img' src='static/imgs/chrome.png' />
        }, {
            key: "moduleName_6",
            scenariovalue: "5 scenarios",
            value: <img className='browser__img' src='static/imgs/edge.png' />
        }
    ])
    const [selectedItem, setSelectedItem] = useState(null);
    const sort = [
        { name: 'Last modified', code: '0' },
        { name: 'Report Generation Date', code: '1' },
        { name: 'Alphabetical', code: '2' },
    ];
    const defaultSort = sort[0].code;

    const filteredExecutionData = reportData.filter((data) =>
        data.configurename.toLowerCase().includes(searchReportData.toLowerCase())
    );

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
        const sortType = e.value;

        let sortedData = [...filteredExecutionData];
        if (sortType === '2') {
            sortedData.sort((a, b) => a.configurename.localeCompare(b.configurename));
        }
        setReportData(sortedData);
        setSelectedItem(sortType);
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
                    <select data-test="projectSelect" className='projectSelectreport' value={configProjectId} onChange={(e) => { setConfigProjectId(e.target.value); }}>
                        {projectList.map((project, index) => (<option value={project.id} key={index}>{project.name}</option>))}
                    </select>
                </div>
                {!show && <div id="reports" className="cards">
                    <div className="buttonReports">
                        <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{ height: "1.2rem" }} src="static/imgs/Functional.png" />} id="buttonF" className={testStep !== false ? "textf" : "textF"} label="Functional Test" value="Functional Test" />
                        <Button onClick={(e) => handleTest(e.target.value)} icon={<img alt="function" style={{ height: "1.2rem" }} src="static/imgs/Accessibility.png" />} id="buttonA" className={testSteps !== false ? "textFA" : "textfa"} label="Accessibility Test" value="Accessibility Test" />
                    </div>

                    <>
                        {filteredExecutionData.length > 0 ? (<>
                            {activeIndex === "Functional Test" &&
                                <div className="card flex justify-content-start relative report_btn">
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex align-items-center">
                                            <RadioButton inputId="View by Execution Profile" name="View by Execution Profile" value="View by Execution Profile" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Execution Profile'} />
                                            <label htmlFor="View by Execution Profile" className="ml-2" value="ExecutionProfile" checked={selectedOption === 'ExecutionProfile'}>View by Execution Profile</label>
                                        </div>
                                        <div className="flex align-items-center">
                                            <RadioButton inputId="View by Modules" name="View by Modules" value="View by Modules" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Modules'} />
                                            <label htmlFor="View by Modules" className="ml-2" value="ViewByModules" checked={selectedOption === 'ViewByModules'}>View by Modules</label>
                                        </div>
                                    </div>
                                </div>}
                            <div>
                                {activeIndex === "Accessibility Test" &&
                                    <div className="card flex justify-content-start relative report_btn">
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex align-items-center">
                                                <RadioButton inputId="View by Execution Profile" name="View by Execution Profile" value="View by Execution Profile" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Execution Profile'} />
                                                <label htmlFor="View by Execution Profile" className="ml-2" value="ExecutionProfile" checked={selectedOption === 'ExecutionProfile'}>View by Execution Profile</label>
                                            </div>
                                            <div className="flex align-items-center">
                                                <RadioButton inputId="View by Modules" name="View by Modules" value="View by Modules" onChange={(e) => setExecutionButon(e.value)} checked={executionButon === 'View by Modules'} />
                                                <label htmlFor="View by Modules" className="ml-2" value="ViewByModules" checked={selectedOption === 'ViewByModules'}>View by Modules</label>
                                            </div>
                                        </div>
                                    </div>}
                            </div>

                            <div>
                                <div className="p-input-icon-left report-search">
                                    <i className="pi pi-search" />
                                    <InputText className='report_search_input' placeholder="Search" value={searchReportData} onChange={(e) => setSearchReportData(e.target.value)} />
                                </div>
                                <div className='sort' ><h2 className='projectDropDown'>Sort: </h2><Dropdown value={selectedItem} onChange={(e)=>handleClicked(e)} options={sort} optionLabel="name" className="w-full md:w-14rem h-2rem	ml-2" placeholder='Select a Sort' /></div>
                            </div>
                        </>) : ''}
                    </>

                    
                        {filteredExecutionData.length > 0 ? (<div className='report_Data ml-4'>
                            {activeIndex === "Functional Test" && executionButon === 'View by Execution Profile' && (<div className='flex flex-wrap'>
                                {filteredExecutionData.map((data, index) => (<div className='flex flex-wrap p-4'><Card key={index} className='testCards'>
                                <NavLink to="/reports/profile" state= {{configureKey: data.configurekey}} activeClassName="active">{data.configurename}</NavLink><p>{data.selectedModuleType}</p><p>Last executed through {data.configurename}</p><p>Last executed on {data.date}</p>
                                </Card></div>))}
                            </div>)}
                            {activeIndex === "Functional Test" && executionButon === 'View by Modules' && (<div className="grid ml-4" >
                                {reportDataModule.map((data) => <div className='flex flex-wrap p-2'><Card key={data.key} className='testCards' ><p m={handleData}>{data.key}</p><p>{data.scenariovalue}</p>
                                    <Avatar key={data.value} className='browser-avatar' />
                                </Card></div>)}
                            </div>)}
                            {activeIndex === "Accessibility Test" && executionButon === 'View by Execution Profile' && (<div className="grid ml-4" >
                                {reportData.map((data) => <div className='flex flex-wrap p-2'><Card key={data.key} className='testCards' ><NavLink to="/reports/profile" state= {{configureKey: data.configurekey}} activeClassName="active">{data.key}</NavLink><p>{data.Modulevalue + data.scenariovalue}</p>
                                    <AvatarGroup>
                                        {data.value.map((image, index) => (
                                            <Avatar key={index} image={image.props.src} className='browser-avatar' />
                                        ))}

                                    </AvatarGroup>
                                </Card></div>)}
                            </div>)}
                            {activeIndex === "Accessibility Test" && executionButon === 'View by Modules' && (<div className="grid ml-4" >
                                {reportDataModule.map((data) => <div className='flex flex-wrap p-2'><Card key={data.key} className='testCards' ><NavLink to="/reports/profile" state= {{configureKey: data.configurekey}} activeClassName="active">{data.key}</NavLink><p>{data.scenariovalue}</p>
                                    <Avatar key={data.value} className='browser-avatar' />
                                </Card></div>)}
                            </div>)}
                        </div>)
                            : (<div className='Report_Image'><img id='report_icon' src="static/imgs/Functional_report_not_found.svg" alt="Empty data" />
                            <div>{activeIndex === "Functional Test" ? (<div className='flex flex-column align-items-center relative report_text'><span>Functional reports not found</span><span className='text-sm'>Execute one execution profile to see its reports</span></div>)
                            :(<div className='flex flex-column align-items-center relative report_text'><span>Accessibility reports not found</span><span className='text-sm'>Execute one execution profile to see its reports</span></div>)}</div></div>)}
                </div>}
                {show && <ReportTestTable />}
            </div>
        </div>
    )
}

export default reports;
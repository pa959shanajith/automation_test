/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import '../styles/reports.scss';
import ReportTestTable from './ReportTestTable';
import { RadioButton } from "primereact/radiobutton";
import { InputText } from 'primereact/inputtext';
import { AvatarGroup } from 'primereact/avatargroup';
import { Avatar } from 'primereact/avatar';
import { classNames } from 'primereact/utils';
import {FooterTwo as Footer} from '../../global';
import { fetchConfigureList, getFunctionalReports, getProjectList } from "../api";
import { NavLink } from 'react-router-dom';
import { loadUserInfoActions } from '../../landing/LandingSlice';
import { SelectButton } from 'primereact/selectbutton';
import { testTypesOptions, viewByOptions } from '../../utility/mockData';



const reports = () => {
    const dispatch = useDispatch();
    const [activeIndex, setActiveIndex] = useState("Functional Test");
    const [testSteps, setTestSteps] = useState(false);
    const [testStep, setTestStep] = useState(true);
    const [testSteped, setTestSteped] = useState(false);
    const [selectedOption, setSelectedOption] = useState("");
    const [searchReportData, setSearchReportData] = useState("");
    const [configProjectId, setConfigProjectId] = useState("");
    const [projectList, setProjectList] = useState([]);
    const [show, setShow] = useState(false);
    const [viewBy, setViewBy] = useState(viewByOptions[0]?.value);
    const [testType, setTestType] = useState(testTypesOptions[0]?.value);
    const [dropdownData, setDropdownData] = useState([]);
    const [project, setProject] = useState({});
    const [executionButon, setExecutionButon] = useState(
      "View by Execution Profile"
    );
    const customDropdownIcon = classNames("pi", "pi-sort-amount-down");

    const [reportData, setReportData] = useState([]);
    const [reportDataModule, setReportDataModule] = useState([
      {
        key: "moduleName_1",
        scenariovalue: "4 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/chrome.png" alt="" />
        ),
      },
      {
        key: "moduleName_2",
        scenariovalue: "2 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/fire-fox.png" alt="" />
        ),
      },
      {
        key: "moduleName_3",
        scenariovalue: "3 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/chrome.png" alt="" />
        ),
      },
      {
        key: "moduleName_4",
        scenariovalue: "1 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/edge.png" alt="" />
        ),
      },
      {
        key: "moduleName_5",
        scenariovalue: "4 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/chrome.png" alt="" />
        ),
      },
      {
        key: "moduleName_6",
        scenariovalue: "5 scenarios",
        value: (
          <img className="browser__img" src="static/imgs/edge.png" alt="" />
        ),
      },
    ]);
    const sort = [
      { name: "Last modified", code: "0" },
      { name: "Report Generation Date", code: "1" },
      { name: "Alphabetical", code: "2" },
    ];
    const defaultSort = sort[0].name;
    const [selectedItem, setSelectedItem] = useState(defaultSort);
    const filteredExecutionData = reportData.filter((data) =>
      data.configurename.toLowerCase().includes(searchReportData.toLowerCase())
    );
    const [selectedProject, setSelectedProject] = useState(null);

    const selectProjects=useSelector((state) => state.landing.defaultSelectProject)
    const initProj = selectProjects.projectId;
    const handeSelectProject=(initProj)=>{
        dispatch(loadUserInfoActions.setDefaultProject({ ...selectProjects, projectId: initProj, appType: project?.appType[project?.projectId.indexOf(initProj)] }));
        fetchReportData(initProj);
    };
    useEffect(() => {
            (async () => {
                try{
                const Projects = await getProjectList();
                setProject(Projects);
                if(Projects && Projects.projectName && Projects.projectId){
                    const data = Projects.projectName.map((name,index)=>({
                        name,
                        id:Projects.projectId[index]

                    }));
                    setProjectList(data);
                    if(!initProj || !data.find((proj)=> proj.id === initProj)){
                        handeSelectProject(data[0]?.id || '');
                    }else{
                        fetchReportData(initProj, selectProjects);
                    }
                }
            }catch(error){
                console.error('Error fetching project list:',error);
            }
        })();
    }, [viewBy]);

    const fetchReportData = async (initProj) => {
        try{
            const executionProfileName = viewBy === "Execution Profile" ? await fetchConfigureList({ projectid: initProj ,"param":"reportData"}) :
            await getFunctionalReports(initProj, project?.releases[project?.projectId.indexOf(initProj)][0]?.name, project?.releases[project?.projectId.indexOf(initProj)][0]?.cycles[0]?._id);
            if (executionProfileName && executionProfileName.length > 0) {
                const extractedExecutionProfileData = executionProfileName.map((obj) => ({
                    configurename: obj?.configurename || '',
                    execDate: obj?.execDate || '',
                    selectedModuleType: obj?.executionRequest?.selectedModuleType || '',
                    configurekey: obj?.configurekey || '',
                    noOfExecution: obj?.noOfExecution || 0,
                }));
                setReportData(extractedExecutionProfileData);
            } else if(!!executionProfileName?.rows?.modules.length){
              const extractedExecutionProfileData = executionProfileName?.rows?.modules.map((obj) => ({
                configurename: obj?.name || '',
                execDate: obj?.lastExecutedtime || '',
                selectedModuleType: obj?.type || '',
                configurekey: obj?._id || '',
                noOfExecution: obj?.executionCount || 0,
            }));
            setReportData(extractedExecutionProfileData);
            } else {
                setReportData([]);
            }
        }catch(error){
            console.error('Error fetching report data :',error);
        }
        };

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

    const viewByTemplate = (option) => {
      return <div><i className={option.icon}></i><span>{option.value}</span></div>;
    };

    return (
      <div className="reports_container">
        <div className="grid options_box">
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12">
            <div className="flex align-items-center ml-4">
              <label data-test="projectLabel" className="Projectreport">
                <b>Project:</b>
              </label>
              <select
                data-test="projectSelect"
                className="projectSelectreport"
                value={initProj}
                onChange={(e) => {
                  handeSelectProject(e.target.value);
                }}
              >
               
                 {projectList
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex(
                      (item) => item.name === value.name
                    )
                )
                .map((project, index) => (
                  <option value={project.id} key={index}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12 selectBtnTest">
            <div className="testType">
              <b>Test Type: </b>
              <SelectButton
                value={testType}
                itemTemplate={viewByTemplate}
                onChange={(e) => {
                  handleTest(e.value);
                  setTestType(e.value);
                }}
                options={testTypesOptions}
              />
            </div>
          </div>
          <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12 selectBtnView">
            <div className="testView">
              <b>View By: </b>
              <SelectButton
                value={viewBy}
                itemTemplate={viewByTemplate}
                onChange={(e) => {
                  setViewBy(e.value);
                }}
                options={viewByOptions}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-content-center ml-4 mr-4 mt-5 mb-3 search_container">
          <div className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              className="report_search_input"
              placeholder="Search"
              value={searchReportData}
              onChange={(e) => setSearchReportData(e.target.value)}
            />
          </div>
          <div>
            <h2 className="projectDropDown"></h2>
            <Dropdown
              value={selectedItem}
              onChange={(e) => handleClicked(e)}
              options={sort}
              optionLabel="name"
              dropdownIcon={customDropdownIcon}
              className="sort_dropdown"
              placeholder={selectedItem}
            />
          </div>
        </div>
        <div className="report_landing mt-2">
          <div className="report">
            {!show && (
              <div id="reports" className="cards">
                {filteredExecutionData.length > 0 ? (
                  <div className="report_Data ml-4 mr-4">
                    {/* {activeIndex === "Functional Test" && executionButon === 'View by Execution Profile' && (<div className='flex flex-wrap'>
                                {filteredExecutionData.map((data, index) => (<div className='flex flex-wrap'><Card key={index} className='testCards'>
                                <NavLink to="/reports/profile" state= {{execution: data.configurename, configureKey: data.configurekey}} className='Profile_Name' activeClassName="active">{data.configurename}</NavLink><p className='Profile_Name_report'>{data.selectedModuleType}</p><p className='Profile_Name_report'>Last executed through CI/CD</p><p className='Profile_Name_report'>Last executed on {data.execDate.slice(5,16)}</p>
                                </Card></div>))}
                            </div>)} */}
                    {activeIndex === "Functional Test" &&
                      executionButon === "View by Execution Profile" && (
                        <div className="grid">
                          {filteredExecutionData.map((data, index) => (
                            <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
                              <NavLink
                                to="/profile"
                                state={{
                                  execution: data.configurename,
                                  configureKey: data.configurekey,
                                  viewBy: viewBy
                                }}
                                className="Profile_Name"
                                activeClassName="active"
                              >
                                <Card key={index} className="testCards">
                                  <div className="grid box_header">
                                    <div className="col-6">
                                      <span className="exe_profile">
                                        Execution Profile
                                      </span>
                                    </div>
                                    <div className="col-6 flex justify-content-end">
                                    <span className="exe_type">
                                        <img
                                          src={
                                            (data.selectedModuleType ===
                                            "e2eExecution" || data.selectedModuleType === "endtoend")
                                              ? "static/imgs/E2EModuleSideIcon.png"
                                              : "static/imgs/moduleIcon.png"
                                          }
                                          className='exe_type_icon'
                                        />
                                        <span style={{ display: 'inline-block', marginLeft: '0.4rem' }}>{(data.selectedModuleType ===
                                        "e2eExecution" || data.selectedModuleType === "endtoend")
                                          ? "End to End"
                                          : "Test Suite"}</span>
                                      </span>
                                    </div>
                                    <div className="col-12 exe_namebox">
                                      <span className="exe_name">
                                        {data.configurename}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid box_body">
                                    <div className="col-12 exe_details">
                                      Last execution details
                                    </div>
                                    <div className="col-4 lg:col-4 xl:col-4 md:col-12 sm:col-12">
                                      <span className="exe_details">
                                        Executed On
                                      </span>
                                      <span className="exe_date">
                                        {data?.execDate ? new Date(data.execDate).toLocaleDateString() : ""}
                                      </span>
                                    </div>
                                    <div className="col-4 lg:col-4 xl:col-4 md:col-12 sm:col-12">
                                      <span className="exe_details">
                                        Executed via
                                      </span>
                                      <span className="exe_date">Manual</span>
                                    </div>
                                    <div className="col-4 lg:col-4 xl:col-4 md:col-12 sm:col-12 flex justify-content-end" style={{ position: 'relative' }}>
                                      <i className="pi pi-cog" style={{ fontSize: '2rem', marginRight: '1.2rem' }}></i>
                                      <span className='count_exe'>{data?.noOfExecution ? data?.noOfExecution : 0 }</span>
                                    </div>
                                  </div>
                                </Card>
                              </NavLink>
                            </div>
                          ))}
                        </div>
                      )}
                    {activeIndex === "Functional Test" &&
                      executionButon === "View by Modules" && (
                        <div className="grid">
                          {reportDataModule.map((data) => (
                            <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
                              <Card key={data.key} className="testCards">
                                <p m={handleData}>{data.key}</p>
                                <p>{data.scenariovalue}</p>
                                <Avatar
                                  key={data.value}
                                  className="browser-avatar"
                                />
                              </Card>
                            </div>
                          ))}
                        </div>
                      )}
                    {activeIndex === "Accessibility Test" &&
                      executionButon === "View by Execution Profile" && (
                        <div className="grid">
                          {reportData.map((data) => (
                            <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
                              <Card key={data.key} className="testCards">
                                <NavLink
                                  to="/reports/profile"
                                  state={{
                                    execution: data.configurename,
                                    configureKey: data.configurekey,
                                  }}
                                  activeClassName="active"
                                >
                                  {data.key}
                                </NavLink>
                                <p>{data.Modulevalue + data.scenariovalue}</p>
                                <AvatarGroup>
                                  {data?.value?.map((image, index) => (
                                    <Avatar
                                      key={index}
                                      image={image.props.src}
                                      className="browser-avatar"
                                    />
                                  ))}
                                </AvatarGroup>
                              </Card>
                            </div>
                          ))}
                        </div>
                      )}
                    {activeIndex === "Accessibility Test" &&
                      executionButon === "View by Modules" && (
                        <div className="grid">
                          {reportDataModule.map((data) => (
                            <div className="col-12 lg:col-3 xl:col-3 md:col-6 sm:col-12">
                              <Card key={data.key} className="testCards">
                                <NavLink
                                  to="/reports/profile"
                                  state={{
                                    execution: data.configurename,
                                    configureKey: data.configurekey,
                                  }}
                                  activeClassName="active"
                                >
                                  {data.key}
                                </NavLink>
                                <p>{data.scenariovalue}</p>
                                <Avatar
                                  key={data.value}
                                  className="browser-avatar"
                                />
                              </Card>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="Report_Image">
                    <img
                      id="report_icon"
                      src="static/imgs/Functional_report_not_found.svg"
                      alt="Empty data"
                    />
                    <div className="report_text">
                      {activeIndex === "Functional Test" ? (
                        <div className="flex flex-column align-items-center">
                          <span>Functional reports not found</span>
                          <span className="text-sm">
                            Execute one execution profile to see its reports.
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-column align-items-center">
                          <span>Accessibility reports not found</span>
                          <span className="text-sm">
                            Execute one execution profile to see its reports.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {show && <ReportTestTable />}
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </div>
    );
}

export default reports;
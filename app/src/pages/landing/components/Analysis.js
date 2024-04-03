import { Card } from 'primereact/card';
import '../styles/Analysis.scss';
import { TabMenu } from 'primereact/tabmenu';
import React, { useState,useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchAvoAgentAndAvoGridList , defect_analysis , profileLevel_ExecutionStatus,moduleLevel_ExecutionStatus,teststepLevel_ExecutionStatus} from "../api";
import { Button } from 'primereact/button';
import { setMsg, VARIANT, Messages as MSG } from '../../global'
import { Chart } from 'primereact/chart';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { useSelector } from 'react-redux';
import PromptBasedAnalysis from './PromptBasedAnalysis';




 

const Analysis = (props) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [originalAgentData, setOriginalAgentData] = useState([]);
    const [showRefresh,setShowRefresh] = useState(false);

    //chart implementation for defect analysis of projects 
    const [chartData, setChartData] = useState({});
    const [projectData, setProjectData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTab, setSelectedTab] = useState('item1');
    const [responseStatic, setResponseStatic] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [chartType, setChartType] = useState('bar'); // Default chart type
    // const [projectData, setProjectData] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [apiResponse, setApiResponse] = useState(null);
    const [executionProfiles,setExecutionProfiles] = useState([]);
    const [defectData , setDefectData] = useState({});
    const [isDrilldown, setIsDrilldown] = useState(false);/////////////////////////////////
    const [detailedData, setDetailedData] = useState(null);
    const [moduleData, setModuleData] = useState(null);
    const [mainChartData, setMainChartData] = useState(null);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [moduleChartData, setModuleChartData] = useState(null);
    const [currentProfile,setCurrentProfile] = useState([]);
    const [testcaseData,setTesecaseData] = useState([]);
    const [currentModule,setCurrentModule]=useState([]);
    const [scenarioDrilldown,setScenarioDrilldown]=useState(false);///////////////////////////////////////
    const [selectedModuleData,setSelectedModuleData]=useState([]);
    const [dummyChartType, setDummyChartType] = useState('bar'); 
    const [firstDrilldown, setFirstDrilldown] = useState(true);/////////////////////////////////////////////

    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let defaultselectedProject = reduxDefaultselectedProject;

    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        defaultselectedProject = JSON.parse(localStorageDefaultProject);
    }

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if(!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo ;
  

    const handleTabChange = (event) => {
        setSelectedTab(event.value);
      };

    useEffect(() => {
        const fetchData = async () => {
          try {
            const apiResponse = await profileLevel_ExecutionStatus({
              "projectid":defaultselectedProject.projectId,
              "userid": userInfo.user_id,
            //   "start_time": "2023-11-01",
            //   "end_time": "2023-09-23"
            });
           console.log(apiResponse)
            const data = apiResponse.data.data;
    
            if (data && data.length > 0) {
              const defaultProfile = data[0].profilename;
                console.log(apiResponse);
              const { start_time, end_time } = apiResponse.data;

            const formattedStartDate = formatDateDefault(start_time);
            const formattedEndDate = formatDateDefault(end_time);
            console.log(formatDateDefault(end_time), formatDateDefault(start_time))

            setStartDate(new Date(formattedStartDate));
            setEndDate(new Date(formattedEndDate));

              
              setSelectedProfile(data[0].profileid);
              setDropdownOptions(data.map((profile) => ({ label: profile.profilename, value: profile.profileid })));
              processChartData(data, defaultProfile);
            //   setStartDate(sixMonthsAgo);
            //   setEndDate(currentDate);
              setExecutionProfiles(data);
              setCurrentProfile(data[0]);
              
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
      }, []);

      const formatDateDefault = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${month}/${day}/${year}`;
      };

    const processChartData = (data, selectedProfile) => {
        const profileData = data.find((entry) => entry.profilename === selectedProfile);
      
        if (!profileData) {
          console.error('Selected profile not found');
          return;
        }
      
        const executions = profileData.exec_details;
        console.log('Executions:', executions);
      
        const labels = executions.map((exec) => exec.execlist_name);
        console.log('Labels:', labels);
      
        const datasets = [];
      
        const statusTypes = new Set();
      
        executions.forEach((exec) => {
          Object.keys(exec.sce_status).forEach((type) => {
            statusTypes.add(type);
          });
        });
      
        console.log('Status Types:', statusTypes);
      
        statusTypes.forEach((type) => {
          const dataPoints = executions.map((exec) => exec.sce_status[type] || 0);
          const backgroundColor = getBackgroundColor(type.toLowerCase()); 
      
          datasets.push({
            label: type,
            data: dataPoints,
            backgroundColor,
          });
        });
      
        const chartData = {
          labels,
          datasets,
        };
      
        console.log('Chart Data:', chartData);
      
        setMainChartData(chartData);
        setChartData(chartData);
      };
       
      //////Module level Drill Down Function
      
      const fetchDataForModule = async (exeId) => {
        try {
          const response = await moduleLevel_ExecutionStatus ( {
            "execlistid": exeId,
            "start_time": "2022-11-23",
            "end_time": "2023-09-23"
          });
      
          const data = response.data;
          setSelectedModuleData(data);
          setCurrentModule(data[0]);
          if (data && data.data.length > 0) {
            processModuleData(data.data); // Directly set the state
          } else {
            setModuleChartData(null);
          }
          
        } catch (error) {
          console.error('Error fetching data:', error);
          setModuleChartData(null);
        }
      };
  
   
      const processModuleData = (moduleData) => {
        const groupedData = moduleData.reduce((acc, module) => {
          const { modulename, scenarioStatus , _id } = module;
          if (!acc[modulename]) {
            acc[modulename] = { pass: 0, fail: 0 , terminate: 0 };
          }
      
          acc[modulename].pass += scenarioStatus.Pass || 0;
          acc[modulename].fail += scenarioStatus.Fail || 0;
          acc[modulename].terminate += scenarioStatus.Terminate || 0;
          return acc;
        }, {});
      
        const labels = Object.keys(groupedData);
        const passData = labels.map((moduleName) => groupedData[moduleName].pass);
        const failData = labels.map((moduleName) => groupedData[moduleName].fail);
        const terminateData = labels.map((moduleName) => groupedData[moduleName].terminate);
      
        const newModuleChartData = {
          labels,
          datasets: [
            {
              label: 'Pass',
              data: passData,
              backgroundColor: '#00ff00',
            },
            {
              label: 'Fail',
              data: failData,
              backgroundColor:'#ff0000',
            },
            {
                label: 'Terminate',
                data: terminateData,
                backgroundColor: '#0000ff',
              },
          ],
        };
      
        setModuleChartData(newModuleChartData);
      };
      
      const handleBarClick1 = (elements) => {
        if (elements && elements.length > 0) {
          const clicked_index = elements[0].index;
          if(currentProfile && currentProfile.exec_details && currentProfile.exec_details.length){
            let execution_profile = currentProfile.exec_details.filter((el,index) => index === clicked_index)
            if(execution_profile && execution_profile.length){
                fetchDataForModule(execution_profile[0].execlistid);
            }
          }  
          const clickedExecution = mainChartData?.labels?.[clicked_index] || '';
          setSelectedExecution(clickedExecution);
          setFirstDrilldown(false);
          setIsDrilldown(true);

        }
      };


      /////Scenario Level Drilldown

    const handleBarClick2 = (elements) => {
        if (elements && elements.length > 0) {
          const clicked_index_scenario = elements[0].index;
          if(selectedModuleData && selectedModuleData.data.length){
            let testcase_scenario = selectedModuleData.data.filter((el,index) => index === clicked_index_scenario)
            if(testcase_scenario && testcase_scenario.length){
                handleClickSenario(testcase_scenario[0]._id);
            }
          }  
          const clickedModule = moduleChartData?.labels?.[clicked_index_scenario] || '';
          setSelectedModuleData(clickedModule);
          setIsDrilldown(false);
          setScenarioDrilldown(true);
        }
      };

    const handleClickSenario = async (tcId) => {
            //  setIsDrilldown(false);
              try {
                const testcaseResponse = await teststepLevel_ExecutionStatus({
                  "executionid": tcId,
                });
      
                const data = testcaseResponse.data;
                console.log('Test Case Data:', data);
      
                if (data && data.length > 0) {
                  const processedData = processTestcaseData(data);
                  setTesecaseData(processedData);
                  console.log("test Data",processedData)
                  // setIsDrilldown(false)

                } else {
                  setTesecaseData(null);
                }
        } catch (error) {
          console.error('Error in handleClickSenario:', error);
        }
      };
      console.log("scenario Data",testcaseData)
      

      const processTestcaseData = (rawData) => {
        const chartData = {
          labels: [],
          datasets: [
            {
              label: 'Pass',
              backgroundColor: 'green', 
              data: [],
            },
            {
              label: 'Fail',
              backgroundColor: 'red', 
              data: [],
            },
          ],
        };
        console.log('Raw Data:', rawData);
        rawData.forEach((entry) => {
            chartData.labels.push(entry.TCgroup_name);
            chartData.datasets[0].data.push(entry.TCStatus.Pass);
            chartData.datasets[1].data.push(entry.TCStatus.Fail);
          });
          console.log('Chart Data:', chartData);
          return chartData;
        };

   
          const handleDropdownChange = (event) => {
            setSelectedProfile(event.target.value);
            console.log(executionProfiles);
            const profileData = executionProfiles.find((entry) => entry.profileid === event.target.value);
            if (profileData ) {
                let currentProfile = profileData.profilename;
            //     const sixMonthsAgo = new Date();
            //   sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            //   const currentDate = new Date();
                // const {start_time,end_time} = apiResponse.data;
                // const formattedStartDate = formatDateDefault(start_time);
                // const formattedEndDate = formatDateDefault(end_time);
                // console.log(formatDateDefault(end_time), formatDateDefault(start_time))

                // setStartDate(new Date(formattedStartDate));
                // setEndDate(new Date(formattedEndDate));

              setCurrentProfile(profileData);
              setSelectedProfile(profileData.profileid)
              setDropdownOptions(executionProfiles.map((profile) => ({ label: profile.profilename, value: profile.profileid })));
              processChartData(executionProfiles, currentProfile);  
            //   fetchDataForProfile(profileData);
            }

          };

      const getBackgroundColor = (type) => {
        const documentStyle = getComputedStyle(document.documentElement);
      
        switch (type) {
          case 'pass':
            return documentStyle.getPropertyValue('--green-500'); 
          case 'fail':
           return documentStyle.getPropertyValue('--red-500');  
          case 'queued':
            return documentStyle.getPropertyValue('--blue-500'); 
          case 'inprogress':
            return documentStyle.getPropertyValue('--yellow-500');
          default:
            return '';
        }
      };

      const handleBackButtonClick = () => {
        setIsDrilldown(false);
        // setChartData(mainChartData); 
        setModuleData(null);
        setFirstDrilldown(true);
      };

      const handleBackButtonClick2 = ()=>{
        setScenarioDrilldown(false);
        setTesecaseData(null);
        setIsDrilldown(true)
      }

      //////////Defect Analysis /////////////////////
      useEffect(() => {
        const fetchDefectData = async () => {
          try {
            const defectResponse = await defect_analysis({
                "projectid":defaultselectedProject.projectId,
                "userid": userInfo.user_id,
              "start_time": "2022-11-23",
              //   "end_time": "2023-09-23"
            });
      
            const data = defectResponse.data;
            console.log("defect data ",defectResponse.data)
            let maxNoOfExecution = 0;
            for(let data of defectResponse.data) {
                if(maxNoOfExecution < data.defect_details.length) maxNoOfExecution = data.defect_details.length;
            }
            let newDataSet = new Array(maxNoOfExecution);
            for(let count = 0; count<=maxNoOfExecution; count++){
                newDataSet[count] = {
                    type: 'bar',
                    label: `Execution ${count+1}`
                };
                newDataSet[count]["data"] = new Array(defectResponse.data.length)
                const dataIdx = [];
                for(let minorIdx in defectResponse.data) {
                   const failCount =(defectResponse.data[parseInt(minorIdx)].defect_details.length > count) ? defectResponse.data[parseInt(minorIdx)].defect_details[count].fail_count : 0;
                   dataIdx.push(failCount);

                   if (failCount > 0){
                    newDataSet[count].label = `Execution ${count + 1} (Fail Count: ${failCount})`;
                   }
                }

                newDataSet[count]["data"] = dataIdx;
            }
            const filteredDataSet = newDataSet.filter(dataset =>
              dataset.data.some(failCount => failCount > 0)
            );
            const chartData = {
                labels: data.map((entry) => entry.profilename),
                datasets: filteredDataSet,
            };


            const options = {
              maintainAspectRatio: false,
              plugins: {
                tooltips: {
                  mode: 'index',
                  intersect: false,
                },
               
                legend: {
                  labels: {
                    color: 'black',
                  },
                },
              },
              scales: {
                x: {
                  stacked: true,
                  ticks: {
                    color: 'black',
                  },
                  grid: {
                    color: 'gray',
                  },
                  title: {
                    display: true,
                    text: 'Profiles',
                    color: '#666',
                    font: {
                        size: 16,
                    },
                },
                },
                y: {
                  stacked: true,
                  ticks: {
                    color: 'black',
                  },
                  grid: {
                    color: 'gray',
                  },
                  title: {
                    display: true,
                    text: 'Defect Count',
                    color: '#666',
                    font: {
                        size: 16,
                    },
                },
                },
              },
              onClick: (_, elements) => handleBarClick(elements),
            };
      
            setDefectData(chartData);
            setChartOptions(options);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
      
        fetchDefectData();
      }, []); 
      
      
      const handleBarClick = (elements) => {
        if (elements.length > 0) {
          const datasetIndex = elements[0].datasetIndex;
          const index = elements[0].index;
      
          if (!isDrilldown) {
            setIsDrilldown(true);
      
            // Simulate fetching detailed data
            const fetchedDetailedData = [
              { label: 'Fail', count: 2 },
              { label: 'Pass', count: 5 },
              { label: 'In Progress', count: 1 },
              { label: 'Queued', count: 2 },
            ];
      
            setDetailedData(fetchedDetailedData);
          } else {
            setIsDrilldown(false);
            setDetailedData(null);
          }
        }
      };
  
    useEffect(() => {
    (async () => {
      const agentList = await fetchAvoAgentAndAvoGridList({
        query: "avoAgentList",
      });
      if (agentList.error) {
        if (agentList.error.CONTENT) {
          setMsg(MSG.CUSTOM(agentList.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(MSG.CUSTOM("Error While Fetching Agent List", VARIANT.ERROR));
        }
      } else {
        setOriginalAgentData(agentList.avoagents);
      }
      
    })();
  }, [showRefresh]);
    const header = (
        <div className='no_report_card_content'>
            {/* <img alt="Card" src="static/imgs/execution_report.png" height="70px" />
            <span >No Test Report Available</span> */}
        </div>
    )
    const tileButtonClickHandler = () => {
        const win = window.open("https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow", "_blank");
        win.focus();
    }
    const items = [
        { label: 'Agent Health Status' },
        { label: 'Project Analysis' },
        { label: 'Prompt based Project Analysis'}
    ];
    const getMessage = (dateTime, event) => {
        let localdate = new Date(dateTime + " UTC").toLocaleString();
        let [newDate, newTime] = localdate.split(' ')
        let result = `${event} on ${newDate}, ${newTime}`;
        if (typeof localdate === 'string' && localdate !== '-') {
            let [date, time, amOrPm] = localdate.split(' ');
            date = date.replace(/\//g, "-");
            result = `${event} on ${date} at ${time} ${amOrPm}`;
        }
        return result;
    }
    const ProgressBar = ({ total, used }) => {
        return (
            <div className="progressBar_card">
                <div
                    style={{
                        height: "1.5rem",
                        width: `${(used * 100) / total}%`,
                        backgroundColor: "#00695c",
                        borderRadius: "inherit",
                        textAlign: "right",
                    }}
                >
                    <span style={{ padding: 5, color: "white", fontWeight: "bold" }}>
                        {(!isNaN(used)) ? ((used * 100) / total).toFixed(2).replace(/\.00$/, "") : 0}%
                    </span>
                </div>
            </div>
        );
    };
    const refresherHandler=() =>{
        setShowRefresh(true);
        setTimeout(() => {
          setShowRefresh(false);
        }, 2000);
      }


      const fetchData = async (dateObj) => {
        try {
          const apiResponse = await profileLevel_ExecutionStatus ( {
            "projectid":defaultselectedProject.projectId,
              "userid": userInfo.user_id,
            "start_time": dateObj.start ? formatDate(dateObj.start) : formatDate(startDate),
            "end_time": dateObj.end ? formatDate(dateObj.end) : formatDate(endDate)
          });
          console.log(apiResponse)
          const data = apiResponse.data.data;
          
  
          if (data && data.length > 0) {
            const defaultProfile = data[0].profilename;
            const {start_time,end_time} = apiResponse.data;
            const formattedStartDate = formatDateDefault(start_time);
            const formattedEndDate = formatDateDefault(end_time);
            console.log(formatDateDefault(end_time), formatDateDefault(start_time))

            setStartDate(new Date(formattedStartDate));
            setEndDate(new Date(formattedEndDate));
            
            setSelectedProfile(data[0].profileid);
            setDropdownOptions(data.map((profile) => ({ label: profile.profilename, value: profile.profileid })));
            processChartData(data, defaultProfile);
            setExecutionProfiles(data);
            setCurrentProfile(data[0]);
            
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };  
    const dateChangeHandler = (currDate,dateType) => {
        console.log(currDate);
        // check the date is valid
        let dateObj = {
            start:dateType === 'start' ? currDate:'',
            end:dateType === 'end' ? currDate:'',
        }
        // format the date and call API
        if(dateType === 'start'){setStartDate(currDate)} // 0.02 sec 
        if(dateType === 'end'){setEndDate(currDate)}
        fetchData(dateObj); // 0.01 sec previous date current state 
    }

    function formatDate(inputDate) {
        // Parse the input date string
        var date = new Date(inputDate);
      
        // Get year, month, and day components
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        var day = date.getDate().toString().padStart(2, '0');
      
        // Construct the formatted date string
        var formattedDate = `${year}-${month}-${day}`;
      
        return formattedDate;
      }


    return (
        <>
            <div className='tabAndBut'>
                <Button style={{display:activeIndex === 0? "" : "none"}} className="p-button-rounded p-button-help p-button-text mr-1 mb-1" icon="pi pi-refresh" loading={showRefresh} onClick={refresherHandler} title="Refresh" ></Button>
                <TabMenu style={{width:activeIndex === 0? "49rem" : "67rem"}} className='tab-menuInAnalysis' model={items} activeIndex={activeIndex} onTabChange={(e) => {setChartData({}); setActiveIndex(e.index); }} />
            </div>
            {activeIndex === 0 ?(
                <div className='agentHealthStatus'>
                    <div className="card" width='85%'>
                        <DataTable className='wholeTable' value={(originalAgentData && originalAgentData.length >0 ) ? originalAgentData.map((agent, index) => ({
                            id: '1000',
                            agent: agent.Hostname,
                            agentCapacity: parseInt(agent.icecount),
                            availableAgent: parseInt(agent.icecount) - ((isNaN(parseInt(agent.currentIceCount))) ? parseInt(agent.icecount) : parseInt(agent.currentIceCount)),
                            utilization: (
                                <>
                                    <ProgressBar
                                        total={parseInt(agent.icecount)}
                                        used={parseInt(agent.currentIceCount)}
                                    />
                                </>
                            ),
                            lastUpdated: getMessage(agent.recentCall, "Started"),
                            currentStatus: (
                                <div className='agent_state'>
                                    <div
                                        className={`agent_state__div agent_state__${agent.status}`}
                                    ></div>
                                    <p>{agent.status}</p>
                                </div>
                            ),
                        })) : []}
                        >
                            <Column field="agent" header="Agents" className='Agents' sortable ></Column>
                            <Column field="agentCapacity" header="Capacity" className='Capacity' sortable ></Column>
                            <Column field="availableAgent" header="Available" className='Available' sortable ></Column>
                            <Column field="utilization" header="Utilization" className='Utilization' ></Column>
                            <Column field="lastUpdated" header="Last Updated" className='LastUpdated' sortable ></Column>
                            <Column field="currentStatus" header="Current Status" className='CurrentStatus' sortable ></Column>
                        </DataTable>
                    </div>
                </div>
            )
                :activeIndex === 1 ? (
                <>
                    <div className='radio_btn'>
                        <div className="p-field-radiobutton">
                            <RadioButton
                                inputId="item1"
                                name="tab"
                                value="item1"
                                onChange={handleTabChange}
                                checked={selectedTab === 'item1'}
                            />
                            <label className="ml-2" htmlFor="item1">Execution Analysis</label>
                        </div>
                        <div className="p-field-radiobutton">
                            <RadioButton
                                inputId="item2"
                                name="tab"
                                value="item2"
                                onChange={handleTabChange}
                                checked={selectedTab === 'item2'}
                            />
                            <label className="ml-2" htmlFor="item2">Defect Analysis</label>
                        </div>
                        </div>
                    <div className='date_div'>
                        <div className='date-div'>
                            <div><label>Start Date:</label></div>
                            <Calendar 
                                value={startDate}
                                onChange={(e) => dateChangeHandler(e.value,'start')}
                                showIcon={true}
                                readOnlyInput
                                placeholder="Select a date"
                               disabled={!firstDrilldown}
                            />
                        </div>

                        <div className='date-div'>
                            <div><label>End Date:</label></div>
                            <Calendar 
                                value={endDate}
                                onChange={(e) => dateChangeHandler(e.value,'end')}
                                showIcon={true}
                                readOnlyInput
                                placeholder="Select a date"
                                disabled={!firstDrilldown}
                            />
                        </div>

                        {selectedTab === 'item1' ? (
                            <div className='profile_drop'>
                                 <label>Select a Profile</label>
                             <Dropdown
                             value={selectedProfile}
                             options={dropdownOptions}
                             onChange={handleDropdownChange}
                             placeholder="Select a Profile"
                             disabled={!firstDrilldown}
                         />
                         </div>) :""
                          }

                    </div>

                

                    {selectedTab === 'item1' && (
                        <>
                            <div className='analysis_container surface-100'>
                              {firstDrilldown &&<>  {mainChartData && (
                                    <div className='chart-div'>
                                        <Chart
                                            type="bar"
                                            data={mainChartData}
                                            options={{
                                                scales: {
                                                    x: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: 'Executions',
                                                            color: '#666',
                                                            font: {
                                                                size: 16,
                                                            },
                                                        },
                                                    },
                                                    y: {
                                                        ticks: {
                                                            beginAtZero: true,
                                                            stepSize: 1,
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Test case Count',
                                                            color: '#666',
                                                            font: {
                                                                size: 16,
                                                            },
                                                        },
                                                    },
                                                },
                                                plugins: {
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                var label = context.dataset.label || '';
                                                                if (label) {
                                                                    label += ': ';
                                                                }
                                                                label += context.parsed.y;
                                                                return label;
                                                            },
                                                        },
                                                    },

                                                    datalabels: {
                                                        anchor: 'end',
                                                        align: 'end',
                                                        display: true,
                                                        color: 'black', 
                                                      },
                                                },
                                                onClick: function (event, elements) {
                                                    if (elements && elements.length > 0) {
                                                        handleBarClick1(elements);
                                                    }
                                                },
                                            }}
                                            style={{ width: '800px', height: '380px', marginLeft: '12rem' }}
                                        />
                                    </div>
                                )}</>}
                                {isDrilldown && <>{moduleChartData &&  (
                                    <div className='chart-div'>
                                    <Chart
                                        type="bar"
                                        data={moduleChartData}
                                        options={{
                                            scales: {
                                                x: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Modules',
                                                        color: '#666',
                                                        font: {
                                                            size: 16,
                                                        },
                                                    },
                                                },
                                                y: {
                                                    ticks: {
                                                    beginAtZero: true,
                                                    stepSize: 1,
                                                },
                                                    title: {
                                                        display: true,
                                                        text: 'Test case Count',
                                                        color: '#666',
                                                        font: {
                                                            size: 16,
                                                        },
                                                    },
                                                },
                                            },

                                            plugins: {
                                                datalabels: {
                                                  anchor: 'end',
                                                  align: 'top',
                                                  font: {
                                                    size: 14,
                                                  },
                                                  color: function (context) {
                                                    // Set color based on your condition
                                                    return context.dataset.label === 'Pass' ? 'green' : 'red';
                                                  },
                                                  formatter: function (value, context) {
                                                    // Display the count inside each bar
                                                    return value;
                                                  },
                                                },
                                                datalabels: {
                                                    anchor: 'end',
                                                    align: 'end',
                                                    display: true,
                                                    color: 'black', // You can customize the color
                                                  },
                                              },
                                              onClick: function (event, elements) {
                                                console.log('Click Event:', event);
                                                console.log('Clicked Elements:', elements);
                                                if (elements && elements.length > 0) {
                                                    handleBarClick2(elements);
                                                }
                                            },
                                        }}
                                        style={{ width: '800px', height: '380px', marginLeft: '9rem' }}
                                    />
                                    </div>
                                )}</>}


{ scenarioDrilldown &&  <> { testcaseData && (
                                    <div className='chart-div'>
                                    <Chart
                                        type="bar"
                                        data={testcaseData}
                                        options={{
                                            scales: {
                                                x: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Test case Group',
                                                        color: '#666',
                                                        font: {
                                                            size: 16,
                                                        },
                                                    },
                                                },
                                                y: {
                                                    ticks: {
                                                    beginAtZero: true,
                                                    stepSize: 1,
                                                },
                                                    title: {
                                                        display: true,
                                                        text: 'Test case Status',
                                                        color: '#666',
                                                        font: {
                                                            size: 16,
                                                        },
                                                    },
                                                },
                                            },

                                            plugins: {
                                                datalabels: {
                                                  anchor: 'end',
                                                  align: 'top',
                                                  font: {
                                                    size: 14,
                                                  },
                                                  color: function (context) {
                                                    // Set color based on your condition
                                                    return context.dataset.label === 'Pass' ? 'green' : 'red';
                                                  },
                                                  formatter: function (value, context) {
                                                    // Display the count inside each bar
                                                    return value;
                                                  },
                                                },
                                                datalabels: {
                                                    anchor: 'end',
                                                    align: 'end',
                                                    display: true,
                                                    color: 'black', // You can customize the color
                                                  },
                                              },
                                        }}
                                        style={{ width: '800px', height: '380px', marginLeft: '9rem' }}
                                    />
                                    </div>
                                )}</>}
                                
                            {isDrilldown && moduleChartData && (
                                <div className='back-btn' >
                                <Button onClick={handleBackButtonClick} label='Back'></Button>
                                </div>
                            )}
                             {scenarioDrilldown  && testcaseData  &&(
                                 <div className='back-btn' >
                                 <Button onClick={handleBackButtonClick2} label='Back'></Button>
                                 </div>
                             )}
                            
                        </div>
                     
                       </> 
                      
            )}
           



                    {selectedTab === 'item2' &&  defectData && chartOptions && (
                        <div>
                             <div className='right_card_container11'>
                        <Card header={header} className='surface-card shadow-3 m-3 analysis_big_card'>

<div>
    {isDrilldown  && detailedData ? (
      <Chart
        type="bar"
        data={{
          labels: detailedData.map((item) => item.label),
          datasets: [
            {
              label: 'Detailed Data',
              data: detailedData.map((item) => item.count),
              backgroundColor: ['red', 'green', 'orange', 'blue'],
            },
          ],
        }}
        options={chartOptions}
        style={{ width: '500px', height: '340px' }}
        onElementsClick={handleBarClick}
      />
    ) : (
      <Chart
        type="bar"
        data={defectData}
        options={chartOptions}
        style={{ width: '500px', height: '340px' }}
        onElementsClick={handleBarClick}
      />
    )}
  </div>


                        </Card>
                        </div>
                        </div>
                    )}
                </>
                ): activeIndex === 2 ? (
                    <>
                    <PromptBasedAnalysis />
             
                    </>
                ):null
            }
        </>
    );
}

export default Analysis;
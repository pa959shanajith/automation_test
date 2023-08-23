import React,{useState,useEffect} from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {getQueueState,fetchAgentModuleList,fetchHistory} from '../api';
import {setMsg, Messages as MSG, VARIANT } from "../../global";
import "../styles/ExecutionProfileStatistics.scss";
import { Dialog } from "primereact/dialog";
import {Button} from 'primereact/button';
import {InputSwitch} from 'primereact/inputswitch';
import { Calendar } from "primereact/calendar";


const ExecutionProfileStatistics = ({data}) => {
    const [showRefresh,setShowRefresh] = useState(false);
    const [originalExecutionProfileData, setOriginalExecutionProfileData] = useState([]);
    const [displayMaximizable, setDisplayMaximizable] = useState(false);
    const [moduleAgentList, setModuleAgentList] = useState([]);
    const [historymoduleAgentList, setHistoryModuleAgentList] = useState([]);
    const [historyExecutionDataList, setHistoryExecutionDataList] = useState([]);
    const [checked, setChecked] = useState(true);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [minDate, setMinDate] = useState();
    useEffect(() => {
        (async () => {
          const queueState = await getQueueState();
          if (queueState.error) {
            if (queueState.error.CONTENT) {
              setMsg(MSG.CUSTOM(queueState.error.CONTENT, VARIANT.ERROR));
            } else {
              setMsg(MSG.CUSTOM("Error While Fetching Current Execution Profile Statistics List", VARIANT.ERROR));
            }
          } else {
            const queueStatedata = [];
            Object.keys(queueState).forEach((key, index) => {
              queueStatedata.push(queueState[key]);
            });
            setOriginalExecutionProfileData(queueStatedata);
          }
        })();
      }, [showRefresh]);

      const handleCount = (listData) => {
        let queueCount = 0;
        let completedCount = 0;
        let inProgressCount = 0;
        listData.map((element) => {
          if (element.status.toUpperCase() === "QUEUED")
            return (queueCount = queueCount + 1);
          else if (element.status.toUpperCase() === "COMPLETED")
            return (completedCount = completedCount + 1);
          else if (element.status.toUpperCase() === "IN_PROGRESS")
            return (inProgressCount = inProgressCount + 1);
          else return 0;
        });
        let total = queueCount + completedCount + inProgressCount;
        return {
          queueCount: queueCount,
          completedCount: completedCount,
          inProgressCount: inProgressCount,
          total: total,
        };
      };

      const viewModuleList = async (executionListID) => {
        const agentModuleList = await fetchAgentModuleList(executionListID);
        if (agentModuleList.error) {
          if (agentModuleList.error.CONTENT) {
            setMsg(MSG.CUSTOM(agentModuleList.error.CONTENT, VARIANT.ERROR));
          } else {
            setMsg(MSG.CUSTOM("Error While Fetching Agent List", VARIANT.ERROR));
          }
        } else {
          setModuleAgentList(agentModuleList);
          setDisplayMaximizable(true);
        }
      };

      const onHide = () => {
        setDisplayMaximizable(false);
      };

      const itemsForRender = (() => {
        let tempArr = [];
        const getMessage = (dateTime, event) => {
          let localdate = new Date(dateTime+" UTC").toLocaleString();
          let [newDate,newTime] = localdate.split(' ');
          let result = `${event} on ${newDate}, ${newTime}`;
          if (typeof localdate === 'string' && localdate !== '-') {
              let [date, time, amOrPm] = localdate.split(' ');
              date = date.replace(/\//g, "-");
              result = `${event} on ${date} at ${time} ${amOrPm}`;
          }
          return result;
        }
        for (let j = 0; j < originalExecutionProfileData.length; j++) {
          let executionData = originalExecutionProfileData[j];
          for (let i = 0; i < executionData.length; i++) {
            let exceutionProfile = executionData[i];
            let  date = getMessage(exceutionProfile[0].startTime,"Started");
            let count = handleCount(exceutionProfile);
            tempArr.push({
              exceutionProfile: exceutionProfile[0].configurename,
              DateTime: date,
              inQueue: count.queueCount,
              completed: count.completedCount,
              inProgress: count.inProgressCount,
              totalCount: count.total,
              moduleStatistics: (
                <button
                  className="btn_statistics"
                  label="Show"
                  icon="pi pi-external-link"
                  onClick={() => {
                    viewModuleList(exceutionProfile[0].executionListId);
                  }}
                >
                  View module details
                </button>
              ),
            });
          }
        }
        return tempArr;
      })();


      const viewButtonDateFilteringHandler = async() => {
        const executionProfileStatisticsDataList = await fetchHistory(fromDate,toDate);
        if (executionProfileStatisticsDataList.error) {
          if (executionProfileStatisticsDataList.error.CONTENT) {
            setMsg(MSG.CUSTOM(executionProfileStatisticsDataList.error.CONTENT, VARIANT.ERROR));
          } else {
            setMsg(MSG.CUSTOM("Error While Fetching Execution List", VARIANT.ERROR));
          }
        } else {
          let historyExecutedData={};
          for (let data of executionProfileStatisticsDataList) {
            if (data.elistsuiteID in historyExecutedData) {
              if (
                new Date(historyExecutedData[data.elistsuiteID].StartTime) >
                new Date(data.StartTime)
              )
                historyExecutedData[data.elistsuiteID].StartTime = data.StartTime;
              if (
                new Date(historyExecutedData[data.elistsuiteID].EndTime) < new Date(data.EndTime)
              )
                historyExecutedData[data.elistsuiteID].EndTime = data.EndTime;
              switch (data.Status) {
                case "Pass": {
                  historyExecutedData[data.elistsuiteID].passed++;
                  break;
                }
                case "Fail": {
                  historyExecutedData[data.elistsuiteID].failed++;
                  break;
                }
                case "Terminate": {
                  historyExecutedData[data.elistsuiteID].termianted++;
                  break;
                }
              }
              historyExecutedData[data.elistsuiteID].total++;
              historyExecutedData[data.elistsuiteID].moduleList.push({
                modulename: data.Module,
                status: data.Status,
                agent: data.Agentname,
                startTime: data.StartTime,
                endTime: data.EndTime,
              });
            } else {
              historyExecutedData[data.elistsuiteID] = {
                project: data.Project,
                configurename: data.configurename,
                startTime: data.StartTime,
                endTime: data.EndTime,
                passed: data.Status === "Pass" ? 1 : 0,
                failed: data.Status === "Fail" ? 1 : 0,
                terminated: data.Status === "Terminate" ? 1 : 0,
                total: 1,
                moduleList: [
                  {
                    modulename: data.Module,
                    status: data.Status,
                    agent: data.Agentname,
                    startTime: data.StartTime,
                    endTime: data.EndTime,
                    passed : data.passCount,
                    failed : data.failCount,
                    terminated : data.terminateCount,
                    total : data.scenarioCount
                  },
                ],
              };
            }
          }
          setHistoryExecutionDataList(Object.keys(historyExecutedData).map((executionRow) => ({
            exceutionProfile: historyExecutedData[executionRow].project+" / "+historyExecutedData[executionRow].configurename,
            startTime: historyExecutedData[executionRow].startTime,
            endTime: historyExecutedData[executionRow].endTime,
            passed: historyExecutedData[executionRow].passed,
            failed: historyExecutedData[executionRow].failed,
            terminated: historyExecutedData[executionRow].terminated,
            total: historyExecutedData[executionRow].total,
            moduleStatistics: (
              <button
                className="btn_statistics"
                label="Show"
                icon="pi pi-external-link"
                onClick={() => {
                  setHistoryModuleAgentList(historyExecutedData[executionRow].moduleList.map((module) => ({
                    name: module.modulename,
                    agent: module.agent,
                    status: module.status,
                    report: module.passed+" / "+module.total
                  })));
                  setDisplayMaximizable(true);
                }}
              >
                View module details
              </button>
            )
          })));
        }
      }

      const dateFormatHandler = (datePicker,inputDate) =>{  
        let year = inputDate.getFullYear();
        let month = inputDate.getMonth() + 1;
        if(month < 10) month = '0'+month;
        let day = inputDate.getDate();
        if(datePicker === "fromDate"){
          let resultDate = `${year}-${month}-${day} 00:00:00`;
          setMinDate(inputDate);
          setFromDate(resultDate);
        }
        else {
          let resultDate = `${year}-${month}-${day} 23:59:59`;
          setToDate(resultDate)
        };
    }
      // const moduleDataList = checked ? [
      //   {
      //     fieldName: "moduleData",
      //     isResizable: true,
      //     isSortedDescending: true,
      //     key: "1",
      //     minWidth: 150,
      //     maxWidth: 200,
      //     name: "Module",
      //   },
      //   {
      //     data: {
      //       isSort: true,
      //     },
      //     fieldName: "agentName",
      //     key: "2",
      //     minWidth: 250,
      //     maxWidth: 300,
      //     name: "Agent",
      //   },
      // ] : [
      //   {
      //     fieldName: "name",
      //     isResizable: true,
      //     isSortedDescending: true,
      //     key: "1",
      //     minWidth: 150,
      //     maxWidth: 200,
      //     name: "Module Name",
      //   },
      //   {
      //     data: {
      //       isSort: true,
      //     },
      //     fieldName: "agent",
      //     key: "2",
      //     minWidth: 250,
      //     maxWidth: 300,
      //     name: "Agent",
      //   },
      //   {
      //     data: {
      //       isSort: true,
      //     },
      //     fieldName: "status",
      //     key: "3",
      //     minWidth: 250,
      //     maxWidth: 300,
      //     name: "Status",
      //   },
      //   {
      //     data: {
      //       isSort: true,
      //     },
      //     fieldName: "report",
      //     key: "4",
      //     minWidth: 250,
      //     maxWidth: 300,
      //     name: "Pass / Total",
      //   }
      // ];

      const refresherHandler=() =>{
        setShowRefresh(true);
        setTimeout(() => {
          setShowRefresh(false);
        }, 2000);
      }
      
 
        const items = moduleAgentList.map((moduleName, index) => ({
          moduleData: (
            <div key={index}>
              <p title={moduleName.testsuiteName}>{moduleName.testsuiteName}</p>
            </div>
          ),
          agentName: moduleName.agentName === '' ? (
            <div className="null_agentName">Yet to be assigned</div>
          ) : (
            moduleName.agentName
          ),
        }));
      

      
  const getMessage = (dateTime, event) => {
    let localdate = new Date(dateTime+" UTC").toLocaleString();
    let [newDate,newTime] = localdate.split(' ')
    let result = `${event} on ${newDate}, ${newTime}`;
    if (typeof localdate === 'string' && localdate !== '-') {
        let [date, time, amOrPm] = localdate.split(' ');
        date = date.replace(/\//g, "-");
        result = `${event} on ${date} at ${time} ${amOrPm}`;
    }
    return result;
  }


    return (
      <>
      {/* {(originalExecutionProfileData.length !== 0) && checked ?
      <div className="refresh_btn">
        <Button className="p-button-rounded p-button-help p-button-text mr-1 mb-1" icon="pi pi-refresh"  loading={showRefresh} onClick={refresherHandler} title="Refresh" ></Button>
      </div>:''} */}
      
      <div className= "filtering_date" >
        <div className="filtering_date__inputSwitch">
          <label>Currently Executing  </label>
          <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
        </div>

      {checked && (originalExecutionProfileData.length !== 0) ?
      <div className="refresh_btn">
        <Button className="p-button-rounded p-button-help p-button-text mr-1 mb-1" icon="pi pi-refresh"  loading={showRefresh} onClick={refresherHandler} title="Refresh" ></Button>
      </div>:''}

        {!checked && <div className="date_time flex flex-row">
          <span className="flex flex-row mr-2 ">
            <label className="filtering_date__text font-bold">From : </label>
            <Calendar label="From Date" onChange={(e) =>{ e.value === null ? setFromDate("") : dateFormatHandler("fromDate",e.value)}} maxDate={new Date()} showButtonBar readOnlyInput showIcon />
          </span>
          <span className="flex flex-row mr-2 ">
            <label className="filtering_date__text font-bold">To : </label>
            <Calendar label="To Date"  onChange={(e) => { e.value === null ? setToDate("") : dateFormatHandler("toDate", e.value)}} minDate={minDate} maxDate={new Date()} disabled={!fromDate} showButtonBar readOnlyInput showIcon />
          </span>
          <Button label="View" onClick={viewButtonDateFilteringHandler} disabled={!(fromDate && toDate)}></Button>
        </div>
        }
         {/* {(originalExecutionProfileData.length === 0) && checked &&
         <div className="null_data_in_Agent_matrices_">
              <img src="static/imgs/Agent_metrices_no_report.png" className="Agent_matrices_landing_img"/>
              <h3 className="image_text">No Current Trends To Display</h3>
              <Button label="Refresh" className ="Agent_matrices_img_btn" icon="pi pi-refresh"  loading={showRefresh} onClick={refresherHandler}></Button>
          </div>} */}

      </div>
      

     {(originalExecutionProfileData.length !== 0) && checked &&
      <div className="datatable-responsive">
        <DataTable value={itemsForRender}  scrollable scrollHeight="440px">
          <Column field="exceutionProfile" header="Project/Profile"   />
          <Column field="DateTime" header="Start Date and Time"   />
          <Column field="inQueue" header="In Queue"   />
          <Column field="completed" header="Completed"   />
          <Column field="inProgress" header="In Progress"   />
          <Column field="totalCount" header="Total"   />
          <Column field="moduleStatistics" header="All Module Statistics" />
        </DataTable>
      </div>}

     {(!checked && !!originalExecutionProfileData.length) &&
       <div className="datatable-responsive">
       <DataTable value={historyExecutionDataList} scrollable scrollHeight="440px" className='datatable-notchecked'>
         <Column field="exceutionProfile" header="Project/Profile"   />
         <Column field="startTime" header="Start Date"   />
         <Column field="endTime" header="End Time"  />
         <Column field="passed" header="Passed"   />
         <Column field="failed" header="Failed"   />
         <Column field="terminated" header="Terminated"   />
         <Column field="total" header="Total"   />
         <Column field="moduleStatistics" header="All Module Statistics" />
       </DataTable>
       {historyExecutionDataList.length === 0 && 
        <div className="null_data_in_Agent_matrices_">
        <img src="static/imgs/no_report_data.png" className="Agent_matrices_landing_img"/>
        <h3 className="image_text">No History Data to Display</h3>
        <Button label="Refresh" className ="Agent_matrices_img_btn" icon="pi pi-refresh"  loading={showRefresh} onClick={refresherHandler}></Button>
      </div>}
     </div>} 
    
       
       

     {/* {!checked && (originalExecutionProfileData.length === 0) &&
     <div className="null_data_in_Agent_matrices_">
                <img src="static/imgs/no_reports.png" className="Agent_matrices_landing_img"/>
                <h3 className="image_text">No History Data to Display</h3>
                <Button label="Refresh" className ="Agent_matrices_img_btn" icon="pi pi-refresh"  loading={showRefresh} onClick={refresherHandler}></Button>
              </div>
              } */}
  
{checked ? <Dialog
      header="Module Details"
      visible={displayMaximizable}
      className="module_details_dialog p-dialog-metrices"
      modal
      position={"center"}
      onHide={() => onHide("displayMaximizable")}
    >
      <div className="p-maximized-inner">
        <div className="dailog-maximize">
        <div className="datatable-responsive">
        <DataTable value={items} scrollable scrollHeight="200px">
          <Column field="moduleData" header="Module"/>
          <Column field="agentName" header="Agent"/>
        </DataTable>
      </div>
          {/* <DetailsList
            variant="variant-two"
            columns={moduleDataList}
            layoutMode={1}
            selectionMode={0}
            items={moduleAgentList.map((moduleName, index) => ({
              moduleData: (
                <div>
                  <p title={moduleName.testsuiteName}>{moduleName.testsuiteName}</p>
                </div>
              ),
              agentName: moduleName.agentName === '' ? <div className="null_agentName">Yet to be assigned</div> : moduleName.agentName,
            }))}
          /> */}
        </div>
      </div>
    </Dialog> : <Dialog
      header="Module Details"
      visible={displayMaximizable}
      className="module_details_dialog p-dialog-history-metrices"
      modal
      position={"center"}
      onHide={() => onHide("displayMaximizable")}
    >
      <div className="p-maximized-inner">
        <div className="dailog-maximize">
        <div className="datatable-responsive">
        <DataTable value={historymoduleAgentList} scrollable scrollHeight="200px">
          <Column field="name" header="Module"/>
          <Column field="agent" header="Agent"/>
          <Column field="status" header="Status"/>
          <Column field="report" header="Pass / Total"/>
        </DataTable>
      </div>
{/* };
          <DetailsList
            variant="variant-two"
            columns={moduleDataList}
            layoutMode={1}
            selectionMode={0}
            items={historymoduleAgentList}
          /> */}
        </div>
      </div>
    </Dialog>
  }
  </>
    );
  };

  export default ExecutionProfileStatistics;
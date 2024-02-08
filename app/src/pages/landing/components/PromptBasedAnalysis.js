import React, { useState, useEffect , useRef} from 'react';
import { Card } from 'primereact/card';
import '../styles/Analysis.scss';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { rasa_prompt_model } from '../api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { useSelector } from 'react-redux';
import { TabMenu } from 'primereact/tabmenu';


const PromptBasedAnalysis = (props) => {
  const [dataType, setDataType] = useState('');
  const [userInput, setUserInput] = useState('');
  const [rasaData, setRasaData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [chartType, setChartType] = useState('');
  const [summary , setSummary] = useState('');
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const chartInstances = useRef([]);

  const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  let defaultselectedProject = reduxDefaultselectedProject;

  const localStorageDefaultProject = localStorage.getItem('DefaultProject');
  if (localStorageDefaultProject) {
    defaultselectedProject = JSON.parse(localStorageDefaultProject);
  }

  let userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
  if (!userInfo) userInfo = userInfoFromRedux;
  else userInfo = userInfo;
 

  const fetchingDynamicData = async () => {
    try {
      const dynamicData = await rasa_prompt_model({
        "projectid": defaultselectedProject.projectId,//"650008dcc357c249be3d66b5",
        "sender": userInfo.user_id,//"650002ffc357c249be3d6663",
        "roleid": userInfo.role,
        "message": userInput,
        "metadata": {
          "profileid": "",
          "moduleid": "",
          "scenarioid": ""
        }
      });

      const data = dynamicData.data.data.data;
      setRasaData(data);
      const type = dynamicData.data.data._type;
      setDataType(type);
      console.log('Rasa data:', data);
      const summary = dynamicData.data.data._summary;
      setSummary(summary);
      
      if (data?.table_data && data?.table_data.length > 0) {
        const dynamicColumns = Object.keys(data.table_data[0]).map((key) => ({
          field: key,
          header: key,
        }));
        setColumns(dynamicColumns);
        setTableData(data.table_data);
      }

      const chart_data = data?.chart_data;

      if (chart_data) {
        const chartTypes = Array.isArray(chart_data.chartType) ? chart_data.chartType : [chart_data.chartType];
        destroyCharts();
      
        chartTypes.forEach((chartType, index) => {
          let newChartData;
      
          if (chartType === 'bar' || chartType === 'line') {
            newChartData = {
              labels: chart_data.labels || [],
              datasets: [
                {
                  data: chart_data.chartsData || [],
                  backgroundColor: chart_data.backgroundColor || '',
                },
              ],
            };
          } else if (chartType === 'doughnut' || chartType === 'pie') {
            newChartData = {
              labels: [chart_data.labels || ''],
              datasets: [
                {
                  data: [chart_data.chartsData || 0],
                  backgroundColor: [chart_data.backgroundColor || ''],
                },
              ],
            };
          } else if (chartType === 'trend'){
            const { datasets } = chart_data.chartsData;
            newChartData = {
              labels: chart_data.labels || [],
              datasets: datasets.map((dataset) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: dataset.borderColor,
                fill: dataset.fill,
                tension: dataset.tension,
              })),
            };
          } 
          else {
            // Handle other chart types as needed
          }
      
          if (newChartData) {
            setChartType(chartTypes); // Set the array of chart types
      
            setChartData((prevData) => ({ ...prevData, [chartType]: newChartData }));
      
            const newChartOptions = {
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                display: true,
                labels: {
                  text: chart_data.labels || '',
                },
              },
              title: {
                display: true,
                text: chart_data.title || '',
              },
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: chart_data.xtitle,
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
                    text: chart_data.ytitle,
                    color: '#666',
                    font: {
                      size: 16,
                    },
                  },
                },
              },
            };
      
            setChartOptions((prevOptions) => ({ ...prevOptions, [chartType]: newChartOptions }));
          } else {
            console.error("Invalid chart_data structure:", chart_data);
          }
        });
      
        destroyCharts();
      } else {
        console.error("chart_data is undefined:", data);
      }
      
    

    } catch (error) {
      console.error('Error in dynamicData:', error);
    }
  };

  
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchingDynamicData();
  };
  const destroyCharts = () => {
    chartInstances.current.forEach((chart) => {
      if (chart && chart.chart) {
        chart.chart.destroy();
      }
    });
    chartInstances.current = [];
  };

  const renderChartTabs = () => {
    const chartTypes = chartType || [];
    return chartTypes.map((type, index) => ({
      label: type,
      command: () => setActiveChartIndex(index),
    }));
  };

  const handleTabChange = (e) => {
    setActiveChartIndex(e.index);
  };



  const customColors = ['#FF5733', '#33FF57', '#5733FF', '#33A1FF', '#FF33A1'];

  return (
    <>
      <div className="container-promptbase">
        <div className='question_div' >
        <label style={{ marginLeft: '1rem',marginTop:'2rem' }}>Ask a Question:</label>
          <InputText
            value={userInput}
            onChange={handleInputChange}
            placeholder='Please ask your question...!'
          />
           <div className='question_btn'>
          <Button
            label="Submit"
            icon="pi pi-check"
            onClick={handleFormSubmit}
          />
        </div>

        </div>
       
        
        <div className='date-div-container'>
          {!rasaData && (
            <>
              <div className='date-div11'>
              <label>Start Date:</label>
                <Calendar
                  value={startDate}
                  // onChange={(e) => dateChangeHandler(e.value,'start')}
                  showIcon={true}
                  readOnlyInput
                  placeholder="Select a date"
                />
              </div>
  
              <div className='date-div11'>
              <label>End Date:</label>
                <Calendar
                  value={endDate}
                  // onChange={(e) => dateChangeHandler(e.value,'end')}
                  showIcon={true}
                  readOnlyInput
                  placeholder="Select a date"
                />
              </div>
            </>
          )}
        </div>
  
        {rasaData && (dataType !== "text") && (
          <div className='sum-div'>
            <h3 className='summary-nlp'> Summary: <span style={{ fontWeight: "400" }}> {summary} </span></h3>
          </div>
        )}
  
        {rasaData && (dataType === "table/chart") ? (
          <div className='chart-table-container'>
            <div>
            <Card className='table-card'>
              <div className='datatable'>
              <DataTable value={tableData} scrollable scrollHeight="98%" showGridlines>
                {columns.map((col) => (
                  <Column key={col.field} field={col.field} header={col.header} />
                ))}
              </DataTable>
              </div>
            </Card>
            </div>
             <div>
            <Card className='chart-card'>
              {chartData && chartType && chartType.length > 1 && (
                <div className="chart-tabs">
                   <TabMenu model={renderChartTabs()} activeIndex={activeChartIndex} onTabChange={handleTabChange} />
                </div>
              )}
              {chartData && chartType && chartType.length > 0 && (
                <div className="chart-container">
                  <div className='right-pane'>
                  <Chart type={chartType[activeChartIndex]}
          data={chartData[chartType[activeChartIndex]]} 
          options={chartOptions[chartType[activeChartIndex]]}
          style={{ width: '580px', height: '330px', }} />
                  </div>
                </div>
              )}
            </Card>
            </div>
          </div>
        ) : (dataType === "table") ? (
          <div className='table-container'>
            <Card>
              <div className='datatable-1'>
              <DataTable value={tableData} scrollable scrollHeight="350px" showGridlines size='small'>
                {columns.map((col) => (
                  <Column key={col.field} field={col.field} header={col.header} />
                ))}
              </DataTable>
              </div>
            </Card>
          </div>
        ) : (dataType === "text") ? (
          <div className='text-container'>
            <h3 className='text-type'>
              {summary}
            </h3>
          </div>
        ) : (dataType === "chart") ? (
          <div className='chart-container'>
            <Card className='card-trend'>
              <div className='right-pane'>
              <Chart type="line"    
           data={chartData[chartType[activeChartIndex]]} 
          options={chartOptions[chartType[activeChartIndex]]} 
          style={{ width: '1040px', height: '300px', }} />
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* ... Your message for other cases */}
          </>
        )}
      </div>
    </>
  );
  

}

export default PromptBasedAnalysis;
import { Card } from 'primereact/card';
import '../styles/Analysis.scss';
import { TabMenu } from 'primereact/tabmenu';
import React, { useState,useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { fetchAvoAgentAndAvoGridList } from "../api";
import { Button } from 'primereact/button';
import { setMsg, VARIANT, Messages as MSG } from '../../global'

const Analysis = (props) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [originalAgentData, setOriginalAgentData] = useState([]);
    const [showRefresh,setShowRefresh] = useState(false);
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
            <img alt="Card" src="static/imgs/execution_report.png" height="70px" />
            <span >No Test Report Available</span>
        </div>
    )
    const tileButtonClickHandler = () => {
        const win = window.open("https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow", "_blank");
        win.focus();
    }
    const items = [
        { label: 'Agent Health Status' },
        { label: 'Project Analysis' }
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
    return (
        <>
            <div className='tabAndBut'>
                <Button style={{display:activeIndex === 0? "" : "none"}} className="p-button-rounded p-button-help p-button-text mr-1 mb-1" icon="pi pi-refresh" loading={showRefresh} onClick={refresherHandler} title="Refresh" ></Button>
                <TabMenu style={{width:activeIndex === 0? "49rem" : "67rem"}} className='tab-menuInAnalysis' model={items} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} />
            </div>
            {activeIndex === 0 ?
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

                :
                <div className='analysis_container surface-100'>

                    <div className=' left_card_container'>
                        <div className='flex flex-row'>
                            <img src="static/imgs/analysis_time_icon.png" className='card_header'></img>
                            <span className='card_header__text'><h5>Latest Tested Build</h5></span>
                        </div>
                        <Card header={header} className='surface-card shadow-3 m-3 analysis_small_card'></Card>
                        <div className='flex flex-row'>
                            <img src="static/imgs/analysis_time_icon.png" className='card_header'></img>
                            <span className='card_header__text'><h5>Latest Tested Build</h5></span>
                        </div>
                        <Card header={header} className='surface-card shadow-3 m-3 analysis_small_card'></Card>
                    </div>

                    <div className='right_card_container'>
                        <div className='flex flex-row'>
                            <span className='card_header__Execution_text'><h5>Recent Execution Reports</h5></span>
                        </div>
                        <Card header={header} className='surface-card shadow-3 m-3 analysis_big_card'></Card>

                        {/* <div className='flex flex-row'>
                <div className='tiles_container'>
                    <img src="static/imgs/blue_tile.png" className='avo_tile'></img>
                    <div className='first_tile_text'>  
                        <span className='tile_header'>DO MORE WITH AVO</span>
                        <h3>Use Pre-built Automation Libraries</h3>
                        <a target="_blank" href="https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow">
                            <Button className='btn' size="small" rounded text raised>Go to Learning Center</Button>
                        </a>
                     </div>
                </div>

                <div className='tiles_container'>
                    <img src="static/imgs/blue_tile.png"className='avo_tile'></img>
                    <div className='second_tile_text'> 
                        <span className='tile_header'>DO MORE WITH AVO</span>
                        <h3> Set-up Test Data Management</h3>
                        <a target="_blank" href="https://avoautomation.gitbook.io/avo-trial-user-guide/executing-a-test-flow">
                            <Button className='btn' size="small" rounded text raised>Go to Learning Center</Button>
                        </a>   
                    </div>
                </div>  
            </div> */}
                    </div>

                </div>
            }
        </>
    );
}

export default Analysis;
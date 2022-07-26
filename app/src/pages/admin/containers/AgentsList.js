import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, IntegrationDropDown, ScreenOverlay } from '../../global';
// import { fetchProjects, getPools, storeConfigureKey } from '../api';
import { useSelector } from 'react-redux';
import { SearchDropdown, TextField, Toggle, MultiSelectDropdown, CheckBox, DetailsList, SpinInput, SearchBox, SmallCard } from '@avo/designcomponents';


// import classes from "../styles/DevOps.scss";
import '../styles/Agents.scss';
import { Selection } from '@fluentui/react';
// import "../styles/DevOps.scss";
const AgentsList = ({ setLoading, setShowConfirmPop, showMessageBar }) => {
    const [searchText, setSearchText] = useState("");
    const [dataUpdated, setDataUpdated] = useState(true);
    const [agentData, setAgentData] = useState([
        {
            state: 'idle',
            name: '981srv',
            count: 1,
            status: 'active'
        },
        {
            state: 'in-progress',
            name: '982srv',
            count: 4,
            status: 'inactive'
        },
        {
            state: 'busy',
            name: '983srv',
            count: 10,
            status: 'active'
        },
        {
            state: 'offline',
            name: '984srv',
            count: 2,
            status: 'inactive'
        },
        {
            state: 'inactive',
            name: '985srv',
            count: 3,
            status: 'inactive'
        }
    ]);
    const onClientCountChange = (operation, index, newVal = '') => {
        console.log(agentData[index].count);
        console.log(operation);
        console.log(newVal);
        if((operation === 'add') || ((operation === 'sub') && agentData[index].count > 1)) {
            const updatedData = [...agentData];
            updatedData[index] = {...agentData[index], count: (operation === 'add') ? agentData[index].count+1 : agentData[index].count-1};
            setAgentData([...updatedData]);
        }else if(operation === 'update' && newVal > 0) {
            const updatedData = [...agentData];
            updatedData[index] = {...agentData[index], count: parseInt(newVal)};
            setAgentData([...updatedData]);
        }
    }
    const onAgentToggle = (index) => {
        const updatedData = [...agentData];
        updatedData[index] = {...agentData[index], status: (agentData[index].status === 'active') ? 'inactive' : 'active'};
        setAgentData([...updatedData]);
    }
    const deleteAgent = () => {
        setShowConfirmPop({'title': 'Delete Avo Agent', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Agent?</p>, 'onClick': ()=>{ setShowConfirmPop(false); showMessageBar('Name 1 Agent Deleted', 'SUCCESS'); }});
    }
    const agentListHeader = [
        {
            data: {
                isSort: true
            },
            fieldName: 'agent',
            isResizable: true,
            isSortedDescending: true,
            key: '1',
            minWidth: 200,
            maxWidth: 750,
            name: 'Agents'
        },
        {
            fieldName: 'clientCount',
            key: '2',
            minWidth: 200,
            maxWidth: 500,
            name: 'Avo Client Count'
        },
        {
            fieldName: 'status',
            key: '3',
            minWidth: 200,
            maxWidth: 500,
            name: 'Status'
        },
        {
            fieldName: 'deleteIcon',
            key: '3',
            minWidth: 30,
            maxWidth: 30,
            name: ''
        }
    ];
    // useEffect(()=> {
    //     (async()=>{
    //         const args = {
    //             poolid:"all",
    //             projectids:[]
    //         };
    //         const poolList = await getPools(args);
    //         console.log(poolList);
    //         if(poolList.error) {
    //             if(poolList.error.CONTENT) {
    //                 setMsg(MSG.CUSTOM(poolList.error.CONTENT,VARIANT.ERROR));
    //             } else {
    //                 setMsg(MSG.CUSTOM("Error While Fetching PoolsList",VARIANT.ERROR));
    //             }
    //         }else {
    //             console.log(poolList);
    //         }
    //     })()
    // }, []);
    // useEffect(()=> {
    //     let isUpdated = false;
    //     console.log(integrationConfig);
    //     Object.keys(integrationConfig).some(element => {
    //         if(typeof(integrationConfig[element]) === 'string' && integrationConfig[element] !== props.currentIntegration[element]) {
    //             isUpdated = true;
    //             return true;
    //         } else if(typeof(integrationConfig[element]) === 'object' && element === 'scenarioList' && (integrationConfig[element].length !== props.currentIntegration[element].length || integrationConfig[element].some((scenario) => { return !props.currentIntegration[element].includes(scenario) }) )) {
    //             isUpdated = true;
    //             return true;
    //         }
    //     });
    //     if (dataUpdated !== isUpdated) setDataUpdated(isUpdated);
    // }, [integrationConfig]);
    // const displayError = (error) =>{
    //     setLoading(false)
    //     setMsg(error)
    // }
    const [filteredList, setFilteredList] = useState(agentData);
    const handleSearchChange = (value) => {
        let filteredItems = agentData.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    const showLegend = (state, name) => {
        return (<div className='agent_state'>
            <div className={`agent_state__div agent_state__${state}`}></div><p>{name}</p>
        </div>);
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                Manage Agents
            </span>
        </div>
        <div className="api-ut__btnGroup" style={{ display: 'flex', justifyContent: 'end' }}>
            <div className='agent_state__legends'>
                {showLegend('inactive','Inactive')}
                {showLegend('idle','Active - Idle')}
                {showLegend('in-progress','Active - In Progress')}
                {showLegend('busy','Active - Busy')}
                {showLegend('offline','Offline')}
            </div>
            {
                agentData.length > 0 && <>
                    <div className='searchBoxInput'>
                        <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                    </div>
                </>
            }
            <button data-test="submit-button-test" onClick={() => console.log(agentData)} disabled={!dataUpdated} >Save</button>
        </div>
        <div style={{ position: 'absolute', width: '96%', height: '82%' }}>
            <DetailsList columns={agentListHeader} items={
                ((searchText.length > 0) ? filteredList : agentData).map((agent, index) => ({
                    agent: <div className='agent_state'><ReactTooltip id={agent.name} effect="solid" backgroundColor="black" /><div data-for={agent.name} data-tip={agent.state} className={`agent_state__div agent_state__${agent.state}`}></div><p>{agent.name}</p></div>,
                    clientCount: <SpinInput disabled={agent.status !== 'active'} value={agent.count} onChange={(ev, newVal) => onClientCountChange('update', index, newVal)} onDecrement={() => onClientCountChange('sub', index)} onIncrement={() => onClientCountChange('add', index)} width="5%" />,
                    status: <div className='detailslist_status'><p>Inactive</p> <Toggle onChange={() => onAgentToggle(index)} checked={agent.status === 'active'} inlineLabel label="Active" /></div>,
                    deleteIcon: <img onClick={() => deleteAgent()} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon"/>
                }))
            } layoutMode={1} selectionMode={0} variant="variant-two" />
        </div>
    </>);
}


export default AgentsList;
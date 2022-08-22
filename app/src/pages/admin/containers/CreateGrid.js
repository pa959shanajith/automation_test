import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, IntegrationDropDown, ScreenOverlay } from '../../global';
import { saveAvoGrid, fetchAvoAgentAndAvoGridList,  } from '../api';
import { useSelector } from 'react-redux';
import { SearchDropdown, TextField, Toggle, MultiSelectDropdown, CheckBox, DetailsList, SpinInput, Label, SearchBox } from '@avo/designcomponents';
import '../styles/Agents.scss';
import { Selection } from '@fluentui/react';

const CreateGrid = ({ currentGrid, setCurrentGrid, showMessageBar, setLoading }) => {
    const [gridName, setGridName] = useState(currentGrid.name);
    const [searchText, setSearchText] = useState("");
    const [dataUpdated, setDataUpdated] = useState(false);
    // const agentlistAPIResponse = [
    //     {
    //         key: '981srv',
    //         state: 'idle',
    //         name: '981srv',
    //         count: 1,
    //         status: 'active'
    //     },
    //     {
    //         key: '982srv',
    //         state: 'in-progress',
    //         name: '982srv',
    //         count: 4,
    //         status: 'inactive'
    //     },
    //     {
    //         key: '983srv',
    //         state: 'busy',
    //         name: '983srv',
    //         count: 10,
    //         status: 'active'
    //     },
    //     {
    //         key: '984srv',
    //         state: 'offline',
    //         name: '984srv',
    //         count: 2,
    //         status: 'inactive'
    //     },
    //     {
    //         key: '985srv',
    //         state: 'inactive',
    //         name: '985srv',
    //         count: 3,
    //         status: 'inactive'
    //     }
    // ];
    const [agentData, setAgentData] = useState([]);
    let selectedAgents = undefined;
    // const trackSelection = new Selection({
    //     onSelectionChanged: () => {
    //         selectedAgents = trackSelection.getSelection()
    //     },
    //     selectionMode: 2
    // });
    // const [selectedAgents, setSelectedAgents] = useState([]);
    let firstRenderCheck = true;
    const [selection] = useState( new Selection({
        onSelectionChanged: () => {
            console.log(firstRenderCheck);
            console.log(selection.getSelectedCount());
            console.log(currentGrid.agents.length);
            console.log(selectedAgentsNumbers);
            console.log(newselectedAgentsNumbers);
            if(firstRenderCheck && selection.getSelectedCount() === 0 && currentGrid.agents.length > 0){
                for(let i = 0; i<newselectedAgentsNumbers; i++) {
                    selection.setIndexSelected(i, true);
                }
                firstRenderCheck = false;
            }
                console.log(selection.getItems());
                console.log(selection.getSelection());
                console.log(selection.getSelectedCount());
                // setSelectedAgents(selection.getSelection());
                selectedAgents = selection.getSelection();
        }
    }) );
    const onClientIceCountChange = (operation, name, newVal = '') => {
        const updatedData = [...agentData];
        const index = updatedData.findIndex((agent) => agent.name === name);
        console.log(index);
        if((operation === 'add') || ((operation === 'sub') && agentData[index].icecount > 1)) {
            updatedData[index] = {...agentData[index], icecount: (operation === 'add') ? agentData[index].icecount+1 : agentData[index].icecount-1};
            setAgentData([...updatedData]);
        }else if(operation === 'update' && newVal > 0) {
            updatedData[index] = {...agentData[index], icecount: parseInt(newVal)};
            setAgentData([...updatedData]);
        }
    }
    const [filteredList, setFilteredList] = useState(agentData);
    const handleSearchChange = (value) => {
        let filteredItems = agentData.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
        console.log(selectedAgents);
    }
    const agentListHeader = [
        {
            fieldName: 'checkbox',
            key: '0',
            minWidth: 30,
            maxWidth: 50,
            name: ''
        }
        ,{
            fieldName: 'agent',
            isResizable: true,
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
        }
    ];
    useEffect(()=> {
        (currentGrid.name === gridName) ? setDataUpdated(false) : setDataUpdated(true);
    }, [gridName]);
    const [selectedAgentsNumbers, setSelectedAgentsNumbers] = useState(0);
    let newselectedAgentsNumbers = 0;
    useEffect(()=> {
        (async() => {
            setLoading('Loading...');
            const agentList = await fetchAvoAgentAndAvoGridList({
                query: 'avoAgentList'
            });
            if(agentList.error) {
                if(agentList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(agentList.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching Agent List",VARIANT.ERROR));
                }
            }else {
                if(currentGrid.agents.length > 0) {
                    let selectedAgentsList = [];
                    let unSelectedAgentsList = [];
                    const selectedAgentnameList = currentGrid.agents.map((agent) => agent.Hostname);
                    agentList.avoagents.forEach((agent) => {
                        if(selectedAgentnameList.includes(agent.Hostname)){
                            selectedAgentsList.push(agent);
                        } else{
                            unSelectedAgentsList.push(agent);
                        }
                    });
                    // selection.setItems(
                    //     agentList.avoagents.map((agent) => ({
                    //         agent: <div className='agent_state'><ReactTooltip id={agent.Hostname} effect="solid" backgroundColor="black" /><div data-for={agent.Hostname} data-tip={agent.state} className={`agent_state__div agent_state__${agent.state}`}></div><p>{agent.Hostname}</p></div>,
                    //         clientCount: <SpinInput disabled={agent.status !== 'active'} value={agent.icecount} onChange={(ev, newVal) => onClientIceCountChange('update', agent.Hostname, newVal)} onDecrement={() => onClientIceCountChange('sub', agent.Hostname)} onIncrement={() => onClientIceCountChange('add', agent.Hostname)} width="5%" />,
                    //         status: <div className='detailslist_status'><p>{agent.status}</p></div>
                    //     }))
                    // );
                    // setAgentData([...selectedAgentsList, ...unSelectedAgentsList]);
                    // if(selectedAgentsList.length > 0) {
                    //     setSelectedAgentsNumbers(selectedAgentsList.length);
                    //     newselectedAgentsNumbers = selectedAgentsList.length;
                    // }
                    setAgentData(
                        [
                            ...selectedAgentsList.map((agent) => ({
                                ...agent,
                                isSelected: true,
                                name: agent.Hostname,
                                state: 'idle'
                            })),
                            ...unSelectedAgentsList.map((agent) => ({
                                ...agent,
                                isSelected: false,
                                name: agent.Hostname,
                                state: 'idle'
                            }))
                        ]
                    );
                } else {
                    setAgentData(
                        agentList.avoagents.map((agent) => ({
                            ...agent,
                            isSelected: false,
                            name: agent.Hostname,
                            state: 'idle'
                        }))
                    );
                }
            }
            setLoading(false);
        })()
    }, []);
    // useEffect(()=> {
    //     console.log(selectedAgents);
    //     if(firstRenderCheck) {
    //         for(let i = 0; i<selectedAgentsNumbers; i++) {
    //             selection.setIndexSelected(i, true, false);
    //         }
    //     }
    //     firstRenderCheck = false;
    // }, [selectedAgents]);
    useEffect(()=> {
        console.log(agentData);
        console.log(selectedAgentsNumbers);
        // if(agentData.length > 0 && selectedAgentsNumbers > 0) {
        //     let flag = true;
        //     while(flag) {
        //         console.log(selection.getItems());
        //         if(selection.getItems().length > 0){
        //             for(let i = 0; i<selectedAgentsNumbers; i++) {
        //                 selection.setIndexSelected(i, true);
        //             }
        //             flag = false;
        //         }
        //     }
        // }
        // if(selection.getItems().length > 0 && selectedAgentsNumbers > 0 ){
        //     console.log('Under select agetn loop');
        //     for(let i = 0; i<selectedAgentsNumbers; i++) {
        //         selection.setIndexSelected(i, true);
        //     }
        // }
        // console.log(selection.getItems());
        // selection.setIndexSelected(0, true);
        // selection.setKeySelected('985srv', true);
    }, [selectedAgentsNumbers]);
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
    const showLegend = (state, name) => {
        return (<div className='agent_state'>
            <div className={`agent_state__div agent_state__${state}`}></div><p>{name}</p>
        </div>);
    }
    const handleConfigSave  = async() => {
        setLoading('Loading...');
        const storeConfig = await saveAvoGrid({
            name: gridName,
            agents: agentData.filter((agent) => agent.isSelected).map((agent) => ({
                Hostname: agent.name,
                icecount: agent.icecount,
                _id: agent._id
            }))
        });
        if(storeConfig !== 'success') {
            if(storeConfig.error && storeConfig.error.CONTENT) {
                setMsg(MSG.CUSTOM(storeConfig.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Something Went Wrong",VARIANT.ERROR));
            }
        }else {
            showMessageBar( 'Grid Create Successfully' , 'SUCCESS');
            setCurrentGrid(false);
        }
        setLoading(false);
    }
    const onAgentSelection = (name) => {
        const updatedData = [...agentData];
        const index = updatedData.findIndex((agent) => agent.name === name);
        updatedData[index] = {...agentData[index], isSelected: !agentData[index].isSelected};
        setAgentData([...updatedData]);
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                {/* { props.currentIntegration.name === '' ? 'Create New' : 'Update'} Grid */}
                Create New Grid
            </span>
        </div>
        <div className="api-ut__btnGroup">
            {/* <button data-test="submit-button-test" onClick={() => console.log()} >{props.currentIntegration.name == '' ? 'Save' : 'Update'}</button> */}
            <button data-test="submit-button-test" onClick={handleConfigSave} >Save</button>
            <button data-test="submit-button-test" onClick={() => setCurrentGrid(false)} >{dataUpdated ? 'Cancel' : 'Back'}</button>
            {
                agentData.length > 0 && <>
                    <div className='searchBoxInput'>
                        <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                    </div>
                </>
            }
            <div className="devOps_config_name">
                <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Avo Grid Name : </span>
                &nbsp;&nbsp;
                <span className="api-ut__inputLabel">
                    <TextField value={gridName} width='150%' label="" standard={true} onChange={(event) => setGridName(event.target.value)} autoComplete="off" placeholder="Enter Grid Name" />
                </span>
            </div>
        </div>
        <div>
            <div className='agent_state__legends'>
                {showLegend('inactive','Inactive')}
                {showLegend('idle','Active - Idle')}
                {showLegend('in-progress','Active - In Progress')}
                {showLegend('busy','Active - Busy')}
                {showLegend('offline','Offline')}
            </div>
        </div>
        <div style={{ position: 'absolute', width: '100%', height: '70%', marginTop: '1.5%' }}>
            <DetailsList columns={agentListHeader} items={
                ((searchText.length > 0) ? filteredList : agentData).map((agent) => ({
                    checkbox : <CheckBox checked={agent.isSelected} onChange={() => onAgentSelection(agent.name)} />,
                    agent: <div className='agent_state'><ReactTooltip id={agent.name} effect="solid" backgroundColor="black" /><div data-for={agent.name} data-tip={agent.state} className={`agent_state__div agent_state__${agent.state}`}></div><p>{agent.name}</p></div>,
                    clientCount: <SpinInput disabled={agent.status !== 'active'} value={agent.icecount} onChange={(ev, newVal) => onClientIceCountChange('update', agent.name, newVal)} onDecrement={() => onClientIceCountChange('sub', agent.name)} onIncrement={() => onClientIceCountChange('add', agent.name)} width="5%" />,
                    status: <div className='detailslist_status'><p>{agent.status}</p></div>
                }))
            } selection={selection} layoutMode={1} selectionMode={0} variant="variant-two" />
        </div>
    </>);
}


export default CreateGrid;
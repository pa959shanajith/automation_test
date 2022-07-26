import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar} from '../../global';
import { SearchBox, DetailsList, Tab } from '@avo/designcomponents';
import '../styles/Agents.scss';
import ReactTooltip from 'react-tooltip';
import CreateGrid from './CreateGrid';

/* Component Grids List */

const GridList = ({ setShowConfirmPop, showMessageBar }) => {
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState("");
    const deleteGridConfig = () => {
        setShowConfirmPop({'title': 'Delete Avo Grid Configuration', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Configuration?</p>, 'onClick': ()=>{ setShowConfirmPop(false); showMessageBar('Name 1 Configuration Deleted', 'SUCCESS'); }});
    }
    // const [gridList, setGridList] = useState([]);
    const [gridList, setGridList] = useState([
        {
            name: 'Name 1ansadnsa,mdnas,mdnasm,dnsad   dasd as ',
            editIcon: <img style={{ marginRight: '10%' }} onClick={() => setCurrentGrid({
                name: 'Name 1ansadnsa,mdnas,mdnasm,dnsad   dasd as ',
                agents: [
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
                    }
                ]
            })} src="static/imgs/EditIcon.svg" className="agents__action_icons" alt="Edit Icon"/>,
            deleteIcon: <img onClick={() => deleteGridConfig()} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon"/>
        },{
            name: 'Name 2',
            editIcon: <img style={{ marginRight: '10%' }} onClick={() => setCurrentGrid({
                name: 'Name 2',
                agents: [
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
                    }
                ]
            })} src="static/imgs/EditIcon.svg" className="agents__action_icons" alt="Edit Icon"/>,
            deleteIcon: <img onClick={() => deleteGridConfig()} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon"/>
        },{
            name: 'Name 3',
            editIcon: <img style={{ marginRight: '10%' }} onClick={() => setCurrentGrid({
                name: 'Name 3',
                agents: [
                    {
                        state: 'idle',
                        name: '981srv',
                        count: 1,
                        status: 'active'
                    },
                    {
                        state: 'busy',
                        name: '983srv',
                        count: 10,
                        status: 'active'
                    },
                    {
                        state: 'inactive',
                        name: '985srv',
                        count: 3,
                        status: 'inactive'
                    }
                ]
            })} src="static/imgs/EditIcon.svg" className="agents__action_icons" alt="Edit Icon"/>,
            deleteIcon: <img onClick={() => deleteGridConfig()} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon"/>
        }
    ]);
    const listHeaders = [
        {
            data: {
                isSort: true
            },
            fieldName: 'name',
            isResizable: true,
            key: '1',
            minWidth: 750,
            maxWidth: 1400,
            name: 'Grid Name'
        },
        {
            fieldName: 'editIcon',
            key: '2',
            minWidth: 30,
            maxWidth: 30,
            name: ''
        },
        {
            fieldName: 'deleteIcon',
            key: '3',
            minWidth: 30,
            maxWidth: 30,
            name: ''
        }
    ];
    const [filteredList, setFilteredList] = useState(gridList);
    const handleSearchChange = (value) => {
        let filteredItems = gridList.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    return (
            (currentGrid) ? <CreateGrid setCurrentGrid={setCurrentGrid} currentGrid={currentGrid} /> : 
            <>
                <div className="page-taskName" >
                    <span data-test="page-title-test" className="taskname">
                        Avo Grid Configuration
                    </span>
                </div>
                <div className="api-ut__btnGroup">
                    <button data-test="submit-button-test" onClick={() => setCurrentGrid({
                        name: '',
                        agents: []
                    })} >New Grid</button>
                    { gridList.length > 0 && <>
                        <div className='searchBoxInput'>
                            <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                        </div>
                        <div>
                            <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>'''' Please Download Avo Agent '''' </span>
                        </div>
                    </> }
                </div>
                { gridList.length > 0 ? <div style={{ position: 'absolute', width: '100%', height: '82%', marginTop: '1.5%' }}>
                    <DetailsList columns={listHeaders} items={(searchText.length > 0) ? filteredList : gridList} layoutMode={1} selectionMode={0} variant="variant-two" />
                </div> : <div className="no_config_img"> <img src="static/imgs/empty-config-list.svg" alt="Empty List Image"/> </div> }
            </>
    );
}

export default GridList;
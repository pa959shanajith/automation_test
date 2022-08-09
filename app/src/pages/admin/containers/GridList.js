import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar} from '../../global';
import { SearchBox, DetailsList, Dialog, Tab, CardList } from '@avo/designcomponents';
import '../styles/Agents.scss';
import ReactTooltip from 'react-tooltip';
import { Icon } from '@fluentui/react';
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
    const [hideDialog, setHideDialog ] = useState(true);
    const [selectedTab, setSelectedTab] = useState('windows');
    const [selectedConfig, setSelectedConfig] = useState('x64');
    const configOptions = () => {
        if(selectedTab === 'windows') {
            return (
                <div>
                    <p className={`${selectedConfig === 'x64' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('x64')}>x64</p>
                    <p className={`${selectedConfig === 'x86' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('x86')}>x86</p>
                </div>
            );
        } else if(selectedTab === 'linux') {
            return (
                <div>
                    <p className={`${selectedConfig === 'x64' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('x64')}>x64</p>
                    <p className={`${selectedConfig === 'arm' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('arm')}>ARM</p>
                    <p className={`${selectedConfig === 'arm64' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('arm64')}>ARM64</p>
                    <p className={`${selectedConfig === 'rhel6' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => setSelectedConfig('rhel6')}>RHEL6</p>
                </div>
            );
        } else return <></>;
    }
    const [requisiteExpand, setRequisiteExpand] = useState(false);
    const dialogBody = () => {
        if(selectedTab === 'windows') {
            return (
                <div>
                    <p>System Prerequisites</p>
                </div>
            );
        } else if(selectedTab === 'mac') {
            return (
                <div>
                    <p>System Prerequisites</p>
                </div>
            );
        } else {
            return (
                <div className='grid_download_dialog__content'>
                    <div className='grid_download_dialog__prerequisite'>
                        <div className='grid_download_dialog__prerequisite__header'>
                            <p>System Prerequisites</p>
                            <Icon iconName={`chevron-${requisiteExpand ? 'up' : 'down'}`} style={{width: '1rem'}} onClick={() => setRequisiteExpand(!requisiteExpand)} />
                        </div>
                        {
                            requisiteExpand && <div className='grid_download_dialog__prerequisite__body'>
                                <ul>
                                    <li>Configure your account by following the steps</li>
                                    <li>Create the Agent</li>
                                </ul>
                            </div>
                        }
                    </div>
                    <div className='grid_download_dialog__content__br' />
                    <p>Configure your Account</p>
                    <h6>Configure your account by following the steps</h6>
                    <div className='grid_download_dialog__content__br' />
                    <p>Create the Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            PS C:\&gt; mkdir agent ; cd agent 
                            PS C:\agent&gt; Add-Type -AssemblyName System.IO.Compression.FileSystem ; [System.IO.Compression.ZipFile]::ExtractToDirectory("$HOME\Downloads\vsts-agent-win-x64-2.206.1.zip", "$PWD")
                        </code>
                    </pre>
                    <div className='grid_download_dialog__content__br' />
                    <p>Configure the Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            PS C:\agent&gt; .\config.cmd
                        </code>
                    </pre>
                </div>
            );
        }
    }
    return (
            (currentGrid) ? <CreateGrid setCurrentGrid={setCurrentGrid} currentGrid={currentGrid} /> : 
            <>
                <Dialog
                    hidden = {hideDialog}
                    onDismiss = {() => setHideDialog(!hideDialog)}
                    title = 'Get the Agent'
                    minWidth = '60rem'
                    confirmText = ''
                    declineText = ''
                    leftText = 'Download'
                    leftButtonProps = {{ icon: 'download' }}
                    content = {<div>
                        <Tab options={[
                            { key: 'windows', text: 'Windows' },
                            { key: 'mac', text: 'MacOS' },
                            { key: 'linux', text: 'Linux' }
                        ]} selectedKey={selectedTab} onLinkClick = {(item) => item && setSelectedTab(item.props.itemKey)} />
                        <hr className='grid_download_dialog__hr' />
                        <div className='grid_download_dialog'>
                            {configOptions()}
                            <div className='grid_download_dialog__seperator'></div>
                            {dialogBody()}
                        </div>
                    </div>} >
                </Dialog>
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
                            <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Click <a style={{ textDecoration: 'underline', color: 'blueviolet', cursor: 'pointer' }} onClick={() => setHideDialog(!hideDialog)}>here</a> to get the Agent </span>
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
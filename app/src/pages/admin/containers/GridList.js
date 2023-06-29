import React, { useState, useEffect } from 'react';
import {Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar} from '../../global';
import { SearchBox, DetailsList, Dialog, Tab, CardList } from '@avo/designcomponents';
import '../styles/Agents.scss';
import ReactTooltip from 'react-tooltip';
import { Icon } from '@fluentui/react';
import CreateGrid from './CreateGrid';
import { deleteAvoGrid, fetchAvoAgentAndAvoGridList } from '../api';

/* Component Grids List */

const GridList = ({ setShowConfirmPop, showMessageBar, setLoading }) => {
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [gridList, setGridList] = useState([]);
    const deleteGridConfig = (grid) => {
        setShowConfirmPop({
            title: 'Delete Avo Grid Configuration', 
            content: <p>Are you sure, you want to delete <b>{grid.name}</b> Configuration?</p>, 
        onClick: ()=>{ deleteDevopsAvoGrid(grid); }});
    }
    const deleteDevopsAvoGrid = (grid) => {
        setLoading('Please Wait...');
        setTimeout(async () => {
            const deletedAvoGrid = await deleteAvoGrid({'_id':grid._id});
            if(deletedAvoGrid.error) {
                if(deletedAvoGrid.error.CONTENT) {
                    setMsg(MSG.CUSTOM(deletedAvoGrid.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Deleting Execute Configuration",VARIANT.ERROR));
                }
            }else {
                const gridList = await fetchAvoAgentAndAvoGridList({
                    query: 'avoGridList'
                });
                if(gridList.error) {
                    if(gridList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(gridList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching Grid List",VARIANT.ERROR));
                    }
                }else {
                    setGridList(gridList.avogrids);
                    let filteredItems = gridList.avogrids.filter(item => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1);
                    setFilteredList(filteredItems);
                }
                setMsg(MSG.CUSTOM( grid.name+" Deleted Successfully.",VARIANT.SUCCESS));
            }
            setLoading(false);
        }, 500);
        setShowConfirmPop(false);
    }
   
    

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
                    <p title='Currently not supported' className={`grid_download_dialog__disabled ${selectedConfig === 'x86' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => console.log("setSelectedConfig('x86')")}>x86</p>
                </div>
            );
        } else if(selectedTab === 'linux') {
            return (
                <div>
                    <p title='Currently not supported' className={`grid_download_dialog__disabled ${selectedConfig === 'x64' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => console.log("setSelectedConfig('x64')")}>x64</p>
                    <p title='Currently not supported' className={`grid_download_dialog__disabled ${selectedConfig === 'arm' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => console.log("setSelectedConfig('arm')")}>ARM</p>
                    <p title='Currently not supported' className={`grid_download_dialog__disabled ${selectedConfig === 'arm64' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => console.log("setSelectedConfig('arm64')")}>ARM64</p>
                    <p title='Currently not supported' className={`grid_download_dialog__disabled ${selectedConfig === 'rhel6' ? 'grid_download_dialog__content__selectedConfig' : ''}`} onClick={() => console.log("setSelectedConfig('rhel6')")}>RHEL6</p>
                </div>
            );
        } else return <></>;
    }
    const [requisiteExpand, setRequisiteExpand] = useState(false);
    const dialogBody = () => {
        if(selectedTab === 'windows') {
            return (
                <div className='grid_download_dialog__content'>
                    {/* <div className='grid_download_dialog__prerequisite'>
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
                    </div> */}
                    <div className='grid_download_dialog__content__br' />
                    <p>Configure Avo Agent</p>
                    <h6>Configure Avo Agent by following below steps</h6>
                    <div className='grid_download_dialog__content__br' />
                    <p>Download the Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            Click <u><a onClick={onDownloadAgentClick}>Here</a></u> to Download the Agent
                        </code>
                    </pre>
                    <p>Run Avo Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            <ol>
                            <li>Place avo agent.exe file in a seperate folder to track agent logs and configuration file.</li>
                            <li><p>Run AvoAgent.exe</p></li>
                            <img src="static/imgs/Run-Agent.png" alt="Run AvoAgent.exe File"/>
                            <li><p>Track you Avo Agent in Tray Application</p></li>
                            <img src="static/imgs/Running-Agent.png" alt="Running AvoAgent.exe in Windows Tray Application"/>
                            </ol>
                        </code>
                    </pre>
                    {/* <p>Run Avo Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            PS C:\&gt; mkdir agent ; cd agent 
                            PS C:\agent&gt; Add-Type -AssemblyName System.IO.Compression.FileSystem ; [System.IO.Compression.ZipFile]::ExtractToDirectory("$HOME\Downloads\vsts-agent-win-x64-2.206.1.zip", "$PWD")
                        </code>
                    </pre> */}
                    <div className='grid_download_dialog__content__br' />
                    <p>Configure the Agent</p>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            {/* PS C:\agent&gt; .\config.cmd */}
                            You can Track and Update your Avo Agent Logs, Configuration, and Status.
                            <img src="static/imgs/Config-Agent.png" alt="Options to configure and Track Avo Agent"/>
                        </code>
                    </pre>
                </div>
            );
        } else if(selectedTab === 'mac') {
            return (
                <div>
                    <p>Coming Soon for MacOS.... Stay Tuned !!!</p>
                </div>
            );
        } else {
            return (
                <div>
                    <p>Coming Soon for Linux.... Stay Tuned !!!</p>
                </div>
            );
        }
    }
    const onDownloadAgentClick = () => {
        // const link = document.createElement('a');
        // link.href = "/downloadURL?link="+window.location.origin.split("//")[1];
        // console.log(window.location.origin.split("//")[1]);
        // link.setAttribute('download', "avoURL.txt");
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // window.location.href = window.location.origin+"/downloadAgent";
        // window.location.href = "https://driver.avoautomation.com/driver/avoagent.exe";
        window.location.href = "https://downloads.avoassure.ai/driver/avoagent.exe";


        // const link = document.createElement('a');
        // const file = new Blob([window.location.origin.split("//")[1]], {type: 'text/plain'});
        // link.href = URL.createObjectURL(file);
        // link.download = 'avoURL.txt';
        // document.body.appendChild(link);
        // link.click();
        // URL.revokeObjectURL(link.href);
        // document.body.removeChild(link);

        // getAgent();
        // const gridAgentList = await getAgent();
        // if(gridAgentList.error) {
        //     if(gridAgentList.error.CONTENT) {
        //         setMsg(MSG.CUSTOM(gridAgentList.error.CONTENT,VARIANT.ERROR));
        //     } else {
        //         setMsg(MSG.CUSTOM("Error While Fetching PoolsList",VARIANT.ERROR));
        //     }
        // }else {
        //     setIcepoollist([ ...gridAgentList.avoagents.map((agent) => ({key: agent._id, text: agent.name})), ...gridAgentList.avogrids ]);
        // }
    }
    useEffect( () => {
        (async () => {
            setLoading('Loading...');
            const gridList = await fetchAvoAgentAndAvoGridList({
                query: 'avoGridList'
            });
            console.log(gridList);
            if(gridList.error) {
                if(gridList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(gridList.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching Grid List",VARIANT.ERROR));
                }
            }else {
                setGridList(gridList.avogrids);
            }
            setLoading(false);
        }
        )();
    },[]);
    const fetchGridList = (bool) => {
        setCurrentGrid(bool);
        (async () => {
            setLoading('Loading...');
            const gridList = await fetchAvoAgentAndAvoGridList({
                query: 'avoGridList'
            });
            

            if(gridList.error) {
                if(gridList.error.CONTENT) {
                    setMsg(MSG.CUSTOM(gridList.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Fetching Grid List",VARIANT.ERROR));
                }
            }else {
                setGridList(gridList.avogrids);
            }
            setLoading(false);
        }
        )();
    }
    return (
            (currentGrid) ? <CreateGrid setCurrentGrid={fetchGridList} currentGrid={currentGrid} showMessageBar={showMessageBar} setLoading={setLoading} /> : 
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
                    onLeftClick={onDownloadAgentClick}
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
                <div className="api-ut__btnGroup__grid">
                    <button data-test="submit-button-test" onClick={() => setCurrentGrid({
                        name: '',
                        agents: []
                    })} >New Grid</button>
                    <div style={{margin: '0.5rem'}}>
                        <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Click <a style={{ textDecoration: 'underline', color: 'blueviolet', cursor: 'pointer' }} onClick={() => setHideDialog(!hideDialog)}>here</a> to get the Agent </span>
                    </div>
                    { gridList.length > 0 && <>
                        <div className='searchBoxInput'>
                            <SearchBox placeholder='Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                        </div>
                    </> }
                </div>
                { gridList.length > 0 ? <div style={{ position: 'absolute', width: '98%', height:'-webkit-fill-available', marginTop: '1.5%' }}>
                    <DetailsList columns={listHeaders} items={((searchText.length > 0) ? filteredList : gridList).map((grid) => ({
                        name: grid.name,
                        editIcon: <img style={{ marginRight: '10%' }} onClick={() => setCurrentGrid(grid)} src="static/imgs/EditIcon.svg" className="agents__action_icons" alt="Edit Icon"/>,
                        deleteIcon: <img onClick={() => deleteGridConfig(grid)} src="static/imgs/DeleteIcon.svg" className="agents__action_icons" alt="Delete Icon"/>
                    }))} layoutMode={1} selectionMode={0} variant="variant-two" />
                </div> : <div className="no_config_img"> <img src="static/imgs/empty-config-list.svg" alt="Empty List Image"/>  </div> }
            </>
    );
}

export default GridList;
import React, { useState} from 'react';
import { Dialog } from 'primereact/dialog';
import { TabMenu } from 'primereact/tabmenu';
import { Button } from 'primereact/button';
import '../styles/Agents.scss';


/* Component Grids List */

const Agent = (props) => {
    const { showDialogBox, setShowDialogBox } = props;
    const [showDialog, setShowDialog] = useState(showDialogBox);
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
    const dialogBody = () => {
        if(selectedTab === 'windows') {
            return (
                <div className='grid_download_dialog__content'>
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
        window.location.href = "https://driver.avoautomation.com/driver/avoagent.exe";
    }

    const resetFields = () => {
        setShowDialog(false);
        setShowDialogBox(false);
    };

    const items = [
        { label: 'Windows',key: 'windows', text: 'Windows' },
        { label: 'MacOS', key: 'mac', text: 'MacOS' },
        { label: 'Linux',key: 'linux', text: 'Linux'  },
    ];


    return (
            <>
                <Dialog
                   visible={showDialog}
                    // hidden = {hideDialog}
                    onHide =  {resetFields}
                    header = 'Get the Agent'
                    style={{minWidth: '60rem'}}
                    footer={<>
                        <Button
                            label="Download"
                            size='small'
                            onClick={onDownloadAgentClick}
                            className="p-button-text"/>
                    </>}
                    >
                    <div>
                        <TabMenu model={items} activeIndex={items.findIndex((item)=> item.key === selectedTab)} onTabChange={(e) => setSelectedTab(items[e.index].key)} />
                        <hr className='grid_download_dialog__hr' />
                        <div className='grid_download_dialog'>
                            {configOptions()}
                            <div className='grid_download_dialog__seperator'></div>
                            {dialogBody()}
                        </div>
                    </div>
                </Dialog>
            </>
    );
}

export default Agent;
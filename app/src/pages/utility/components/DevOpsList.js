import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, ModalContainer } from '../../global';
import { SearchBox } from '@avo/designcomponents';
import {v4 as uuid} from 'uuid';

import "../styles/DevOps.scss";

const DevOpsList = ({ setShowConfirmPop, setCurrentIntegration, url, showMessageBar }) => {
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [searchText, setSearchText] = useState("");
    const [configList, setConfigList] = useState([
        {
            name: 'Name 1ansadnsa,mdnas,mdnasm,dnsad   dasd as ',
            key: uuid(),
            project: 'Project 1',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 1',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 2',
            key: uuid(),
            project: 'Big Project Name 2',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 2',
            cycle: 'Cycle 2',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'synchronous'
        },{
            name: 'Name 3',
            key: uuid(),
            project: 'Very Big Big BIg  Big Big BIg Project 3',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 3',
            cycle: 'Cycle 3',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 4',
            key: uuid(),
            project: 'Project 4',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 4',
            cycle: 'Cycle 4',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 5',
            key: uuid(),
            project: 'Project 5',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 5',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 6',
            key: uuid(),
            project: 'Project 6',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 6',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 7',
            key: uuid(),
            project: 'Project 7',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 7',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 8',
            key: uuid(),
            project: 'Project 8',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 8',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 9',
            key: uuid(),
            project: 'Project 9',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 9',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 10',
            key: uuid(),
            project: 'Project 10',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 10',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 11',
            key: uuid(),
            project: 'Project 11',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 11',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 12',
            key: uuid(),
            project: 'Project 12',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 12',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 13',
            key: uuid(),
            project: 'Project 13',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 13',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 14',
            key: uuid(),
            project: 'Project 14',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 14',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        },{
            name: 'Name 15',
            key: uuid(),
            project: 'Project 15',
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '25%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '18%', disabled: true, selectedName: '' },
            ],
            release: 'Release 15',
            cycle: 'Cycle 1',
            scenarioList: [],
            avoAgentGrid: '',
            browser: '',
            integration: '',
            executionType: 'asynchronous'
        }
    ]);
    // const [configList, setConfigList] = useState([]);
    const [filteredList, setFilteredList] = useState(configList);

    const copyTokenFunc = () => {
        const data = url;
        if (!data) {
            setCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById('api-url');
        x.select();
        document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyConfigKey = (key) => {
        if (navigator.clipboard.writeText(key)) {
            setCopyToolTip("Copied!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
        }
    }
    const deleteDevOpsConfig = () => {
        setShowConfirmPop({'title': 'Delete DevOps Configuration', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Configuration?</p>, 'onClick': ()=>{ setShowConfirmPop(false); showMessageBar('Name 1 Configuration Deleted', 'SUCCESS'); }});
    }
    const handleSearchChange = (value) => {
        let filteredItems = configList.filter(item => (item.name.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.project.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.release.toLowerCase().indexOf(value.toLowerCase()) > -1));
        setFilteredList(filteredItems);
        setSearchText(value);
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                DevOps Integration Configuration
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => setCurrentIntegration({
                    name: '',
                    key: uuid(),
                    selectValues: [
                        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '30%', disabled: false, selectedName: '' },
                        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                    ],
                    project: '',
                    release: '',
                    cycle: '',
                    scenarioList: [],
                    avoAgentGrid: '',
                    browser: '',
                    integration: '',
                    executionType: 'asynchronous'
                })} >New Configuration</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput'>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                <div>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>DevOps Integration API url : </span>
                    <span className="api-ut__inputLabel"><input type="text" value={url} data-test="req-body-test" className="req-body" autoComplete="off" id="api-url" name="request-body" style={{width:"25%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/executeAutomation' />
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                            </div>
                        </label>
                    </span>
                </div>
            </> }
        </div>
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{ flex: 0 }}>
                <div className="d__table_header">
                    <span className=" d__step_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="d__obj_head tkn-table__name tkn-table__head" >Name</span>
                    <span className="d__key_head tkn-table__key tkn-table__head" >Configuration Key</span>
                    <span className="d__inp_head tkn-table__project tkn-table__head" >Project</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Release</span>
                    <span className="details_col d__det_head tkn-table__button" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token">
                <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.name}> <ReactTooltip id="name" effect="solid" backgroundColor="black" /><React.Fragment>{item.name}</React.Fragment> </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.key }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.key) }} ></i></td>
                                <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td>
                                <td className="tkn-table__button"> <img style={{ marginRight: '10%' }} onClick={() => setCurrentIntegration(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp; <img onClick={() => deleteDevOpsConfig()} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/></td>
                            </tr>)
                        }
                        {
                            searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.name}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.name} </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.key }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.key) }} ></i></td>
                                <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td>
                                <td className="tkn-table__button"> <img style={{ marginRight: '10%' }} onClick={() => setCurrentIntegration(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp; <img onClick={() => deleteDevOpsConfig()} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/></td>
                            </tr>)
                        }
                    </tbody>
                </table>
                </ScrollBar>
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/empty-config-list.svg" alt="Empty List Image"/> </div> }
    </>);
}

export default DevOpsList;
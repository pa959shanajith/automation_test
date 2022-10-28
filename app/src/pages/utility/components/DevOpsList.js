import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ModalContainer } from '../../global';
import { SearchBox , SearchDropdown, Toggle } from '@avo/designcomponents';
import { fetchConfigureList, deleteConfigureKey, execAutomation } from '../api';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
// import { fetchProjects } from '../api';
import * as pluginApi from "../../plugin/api";
import {v4 as uuid} from 'uuid';

import "../styles/DevOps.scss";



const DevOpsList = ({ setShowConfirmPop, setCurrentIntegration, url, showMessageBar, setLoading, setIntegrationConfig }) => {
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [searchText, setSearchText] = useState("");
    const [configList, setConfigList] = useState([]);
    const [filteredList, setFilteredList] = useState(configList);
    const [displayBasic, setDisplayBasic] = useState(false);
    const [displayBasic1, setDisplayBasic1] = useState(false);
    const [displayBasic2, setDisplayBasic2] = useState(false);
    const [position, setPosition] = useState('center');
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [projectdata, setProjectData] = useState('');


    useEffect(()=>{
                pluginApi.getProjectIDs()
                .then(data => {
                        setProjectData(data);
                        console.log(data)           
        })},[])
        const projects = [
            { name: projectdata},
        ];
        
    const dialogFuncMap = {
        'displayBasic': setDisplayBasic,
        'displayBasic1': setDisplayBasic1,
        'displayBasic2': setDisplayBasic2
    }
    
    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);

        if (position) {
            setPosition(position);
        }
    }
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="Execute" onClick={async () => onHide(name)} autoFocus />
            </div>
        );
    }
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }

    const copyKeyUrlFunc = (id) => {
        const data = document.getElementById(id).value;
        if (!data) {
            setApiKeyCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setApiKeyCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById(id);
        x.select();
        document.execCommand('copy');
        setApiKeyCopyToolTip("Copied!");
        setTimeout(() => {
            setApiKeyCopyToolTip("Click to Copy");
        }, 1500);
    }

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

    var myJsObj = {key:setCurrentIntegration && searchText.length == 0 && configList.length > 0 && configList.map((item, index) => item.configurekey)[0]};
    var str = JSON.stringify(myJsObj);

    const deleteDevOpsConfig = (key) => {
        setLoading('Please Wait...');
        setTimeout(async () => {
            const deletedConfig = await deleteConfigureKey(key);
            if(deletedConfig.error) {
                if(deletedConfig.error.CONTENT) {
                    setMsg(MSG.CUSTOM(deletedConfig.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Deleting DevOps Configuration",VARIANT.ERROR));
                }
            }else {
                const configurationList = await fetchConfigureList();
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setMsg(MSG.CUSTOM("DevOps Configuration deleted successfully",VARIANT.SUCCESS));
            }
            setLoading(false);
        }, 500);
        setShowConfirmPop(false);
    }
    const onClickDeleteDevOpsConfig = (name, key) => {
        setShowConfirmPop({'title': 'Delete DevOps Configuration', 'content': <p>Are you sure, you want to delete <b>{name}</b> Configuration?</p>, 'onClick': ()=>{ deleteDevOpsConfig(key) }});
    }
    const handleSearchChange = (value) => {
        let filteredItems = configList.filter(item => (item.configurename.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.project.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.release.toLowerCase().indexOf(value.toLowerCase()) > -1));
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    const getIntegrationSelected = (integration) => {
        let selectedIntegration = '';
        Object.keys(integration).forEach((currentInteg) => {
            if(integration[currentInteg].url !== '') {
                selectedIntegration = currentInteg;
            }
        });
        if(selectedIntegration === 'qtest') selectedIntegration = 'qTest'
        if(selectedIntegration === 'alm') selectedIntegration = 'ALM'
        if(selectedIntegration === 'zephyr') selectedIntegration = 'Zephyr'
        return selectedIntegration;
    }
    const handleEdit = (item) => {
        setCurrentIntegration({
            name: item.configurename,
            key: item.configurekey,
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '30%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
            ],
            scenarioList: getScenarioList(item.executionRequest.batchInfo, item.executionRequest.selectedModuleType),
            selectedModuleType: item.executionRequest.selectedModuleType,
            avoAgentGrid: 'cicdanyagentcanbeselected',
            browsers: item.executionRequest.browserType,
            integration: getIntegrationSelected(item.executionRequest.integration),
            executionType: item.executionRequest.executiontype,
            isHeadless: item.executionRequest.isHeadless,
            executionRequest: item.executionRequest
        });
        return;
    }
    const getScenarioList = (batchInfo, selectedModulesType) => {
        let scenarioList = [];
        for(let batch of batchInfo)
            for(let suiteIndex=0; suiteIndex<batch.suiteDetails.length; suiteIndex++) {
                if(selectedModulesType === 'normalExecution') scenarioList.push(batch.suiteDetails[suiteIndex].scenarioId)
                else if(selectedModulesType === 'batchExecution') scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)
                else {
                    scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)}
            }
        return scenarioList;
    }
    useEffect(() => {
        (() => {
            setLoading('Please Wait...');
            setTimeout(async () => {
                const configurationList = await fetchConfigureList();
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setLoading(false);
            }, 500);
        })()
    }, []);

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                Execution Profile
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
                    scenarioList: [],
                    avoAgentGrid: 'cicdanyagentcanbeselected',
                    browsers: [],
                    selectedModuleType: 'normalExecution',
                    integration: '',
                    executionType: 'asynchronous',
                    isHeadless: false
                })} >New Configuration</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput' style={{marginLeft: '35rem'}}>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                {/* <div style={{marginLeft: '7rem'}}>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>DevOps Integration API url : </span>
                    <span className="api-ut__inputLabel"><input type="text" value={url} data-test="req-body-test" className="req-body" autoComplete="off" id="api-url" name="request-body" style={{width:"25%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/execAutomation' />
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                            </div>
                        </label>
                    </span>
                </div> */}
                {/* <div>
                {setCurrentIntegration && searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <ReleaseCycleSelection selectValues={integrationConfig.selectValues} handleSelect={handleNewSelect} />)}
                </div> */}
                {/* <MultiSelect options={projects}  optionLabel="name" placeholder="Select a Project" /> */}
                { 
                setCurrentIntegration && searchText.length == 0 && configList.length > 0 && configList.map((item, index) => 
                <SearchDropdown
                    noItemsText={[ ]}
                    onChange={(selectedIce) => false}
                    options={[
                            {
                            key: 1,
                            text: item.project
                            },
                            {
                            key: 2,
                            text: item.project
                            }
                            
                        ]}
                    placeholder={item.project}
                    selectedKey={""}
                    width='15rem'

                    />)}
            </> }
        </div>
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{ flex: 0 }}>
                <div className="d__table_header">
                    <span className=" d__obj_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="d__obj_head tkn-table__name tkn-table__head" >Execution Name</span>
                    <span className="d__key_head tkn-table__key tkn-table__head" >Configuration Key</span>
                    {/* <span className="d__inp_head tkn-table__project tkn-table__head" >Project</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Release</span> */}
                    <span className="details_col tkn-table__key d__det_head ">Execution Action</span>
                    <span className="d__key_head tkn-table__key tkn-table__head" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token" style={{paddingLeft: '0px', paddingRight: '0px' }}>
                <ScrollBar  scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" /><React.Fragment>{item.configurename}</React.Fragment> </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__button" >
                                    <button onClick={async () =>{onClick('displayBasic2');
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic1')}>  Schedule </button>
                                    </td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '3rem'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                    </td>
                            </tr>)
                        }
                        {
                            searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.configurename} </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                {/* <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td> */}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <td className="tkn-table__button" >
                                <button onClick={async () =>{onClick('displayBasic2');
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                         }}> Execute Now </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                     {/* <button onClick={async ()=>{
                                         let temp = execAutomation(item.configurekey);
                                         setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                                     }}>Execute Now</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
                                     <button  onClick={() =>onClick('displayBasic')}> CI / CD </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                     <button  onClick={() =>onClick('displayBasic1')}>  Schedule </button>
                                    </td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <td className="tkn-table__button" >
                                        <img style={{marginRight: '3rem'}} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                    </td>
                            </tr>)
                        }
                    </tbody>
                </table>
                <Dialog header="Execute Now" visible={displayBasic2} style={{ width: '50vw' }}  footer={renderFooter('displayBasic2')} onHide={() => onHide('displayBasic2')}>
                <input type="radio" />&nbsp;&nbsp;
                <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Agent / Avo Grid</label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="radio" onSelect={()=>{}} />&nbsp;&nbsp;
                <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Assure Client</label>
                </Dialog>
                <Dialog header="Schedule" visible={displayBasic1} style={{ width: '50vw' }}  onHide={() => onHide('displayBasic1')}></Dialog>
                <Dialog header="Execute via CI/CD" visible={displayBasic} style={{ width: '50vw' }}  onHide={() => onHide('displayBasic')}>
                <div style={{display: 'flex', marginBottom:'1rem'}}>
                    <span className="devOps_dropdown_label devOps_dropdown_label_url" style={{marginRight: '1%', marginTop: '1.5rem'}}>DevOps Integration API url : </span>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                        {url}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px", marginTop: '1.5rem'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                            </div>
                        </label>
                </div>
                    <div style={{display: 'flex', marginBottom:'1rem'}}>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Asynchronous </label>
                            <Toggle checked={setIntegrationConfig == 'synchronous'} onChange={() => setIntegrationConfig({ executionType: (setIntegrationConfig.executionType === 'synchronous') ? 'asynchronous' : 'synchronous' })} label="" inlineLabel={true} />
                            <label>Synchronous </label>
                        </div>
                    </div>
                    <div style={{display: 'flex', marginBottom:'1rem'}}>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700', marginTop: '1.5rem'}}>DevOps Request Body : </span>
                    <pre className='grid_download_dialog__content__code'>
                        <code>
                            {str}
                        </code>
                    </pre>
                    <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px", marginTop: '1.5rem'}} data-for="copy" data-tip={copyToolTip} onClick={() => {  copyKeyUrlFunc('devops-key') }} ></i>
                            </div>
                        </label>
                </div>
                </Dialog>
                </ScrollBar>
                
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/no-devops-config.svg" alt="Empty List Image"/> </div> }
    </>);

}
export default DevOpsList;
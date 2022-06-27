import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT } from '../../global';
import { fetchProjects, getPools } from '../api';
import { useSelector } from 'react-redux';
import { SearchDropdown, TextField, Toggle } from '@avo/designcomponents';


// import classes from "../styles/DevOps.scss";
import "../styles/DevOps.scss";
import ReleaseCycleSelection from './ReleaseCycleSelection';
import { prepareOptionLists } from './DevOpsUtils';
import DevOpsModuleList from './DevOpsModuleList';

const DevOpsConfig = props => {
    // const reportData = useSelector(state => state.viewReport.reportData);
    const reportData = {hasData: false};
    const [api, setApi] = useState("Execution");
    const [apiKeyCopyToolTip, setApiKeyCopyToolTip] = useState("Click To Copy");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [configName, setConfigName] = useState("");
    const [dataDict, setDict] = useState({});
    const [integrationConfig, setIntegrationConfig] = useState(props.currentIntegration);
    const [icepoollist, setIcepoollist] = useState([]);
    const [browserlist, setBrowserlist] = useState([]);
    const [dataUpdated, setDataUpdated] = useState(false);
    const [integrationlist, setIntegrationlist] = useState([]);
    useEffect(()=> {
        (async()=>{
            const reportResponse = await fetchProjects({ readme: "projects" });
            if (reportResponse.error) {
                console.error(reportResponse.error);
                setMsg(MSG.REPORT.ERR_FETCH_PROJECT);
            }
            else {
                const [projList, newDict] = prepareOptionLists(reportResponse);
                let newSelectValues = [...integrationConfig.selectValues];
                newSelectValues[0].list = projList;

                if(reportData.hasData) {
                    // proj
                    newSelectValues[0]['selected'] = reportData.projectid;
                    newSelectValues[0]['selectedName'] = reportData.projectname;

                    // rel
                    newSelectValues[1]['disabled'] = false;
                    newSelectValues[1]['list'] = newDict[reportData.projectid].relList;
                    newSelectValues[1]['selected'] = reportData.releaseid;
                    newSelectValues[1]['selectedName'] = reportData.releaseid;

                    //cyc
                    newSelectValues[2]['disabled'] = false;
                    newSelectValues[2]['list'] = newDict[reportData.projectid].relDict[reportData.releaseid].cycList;
                    newSelectValues[2]['selected'] = reportData.cycleid;
                    newSelectValues[2]['selectedName'] = reportData.cyclename;

                    const projId = newSelectValues[0]['selected'];
                    const relName = newSelectValues[1]['selected'];
                    const cycId = newSelectValues[2]['selected'];

                    // fetchFunctionalReports(projId, relName, cycId);
                }
                
                setDict(newDict);
                setIntegrationConfig({...integrationConfig, selectValues: newSelectValues});
            }
        })()
        (async() => {
            const poolList = await getPools();
            console.log(poolList);
            if(poolList.error) {
                setMsg(MSG.CUSTOM("Error While Fetching PoolsList",VARIANT.ERROR));
            }else {
                // setIcepoollist(poolList);
            }
        })()
    }, []);
    useEffect(()=> {
        let isUpdated = false;
        console.log(integrationConfig);
        Object.keys(integrationConfig).some(element => {
            if(typeof(integrationConfig[element]) === 'string' && integrationConfig[element] !== props.currentIntegration[element]) {
                isUpdated = true;
                return true;
            } else if(typeof(integrationConfig[element]) === 'object' && element === 'scenarioList' && (integrationConfig[element].length !== props.currentIntegration[element].length || integrationConfig[element].some((scenario) => { return !props.currentIntegration[element].includes(scenario) }) )) {
                isUpdated = true;
                return true;
            }
        });
        if (dataUpdated !== isUpdated) setDataUpdated(isUpdated);
    }, [integrationConfig]);

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
    const handleNewSelect = fieldIndex => (selectedKey) => {
        let newSelectValues = [...integrationConfig.selectValues];
        if (fieldIndex === 0) {
            newSelectValues[0]['selected'] = selectedKey.key;
            newSelectValues[0]['selectedName'] = selectedKey.text;
            newSelectValues[1]['disabled'] = false;
            newSelectValues[1]['list'] = dataDict[selectedKey.key].relList;
            newSelectValues[1]['selected'] = ""; 
            newSelectValues[2]['selected'] = ""; newSelectValues[2]['list'] = []; newSelectValues[2]['disabled'] = true;
        }
        else if (fieldIndex === 1) {
            newSelectValues[1]['selected'] = selectedKey.key;
            newSelectValues[1]['selectedName'] = selectedKey.text;
            newSelectValues[2]['disabled'] = false;
            newSelectValues[2]['list'] = dataDict[newSelectValues[0]['selected']].relDict[selectedKey.key].cycList;
            newSelectValues[2]['selected'] = ""; 
        }
        else if (fieldIndex === 2) {
            newSelectValues[2]['selected'] = selectedKey.key;
            newSelectValues[2]['selectedName'] = selectedKey.text;

            const projId = newSelectValues[0]['selected'];
            const relName = newSelectValues[1]['selected'];
            const cycId = newSelectValues[2]['selected'];
        }
        setIntegrationConfig({...integrationConfig, selectValues: newSelectValues});
    }

    return (<>
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                { integrationConfig.key === '' ? 'Create New' : 'Update'} Configuration
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => props.showMessageBar( `Configuration ${(props.currentIntegration.name == '') ? 'Create' : 'Update'}d Successfully` , 'SUCCESS')} >{props.currentIntegration.name == '' ? 'Save' : 'Update'}</button>
            <button data-test="submit-button-test" onClick={() => props.setCurrentIntegration(false)} >{dataUpdated ? 'Cancel' : 'Back'}</button>
            <div className="devOps_config_name">
                <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>Configuration Name : </span>
                &nbsp;&nbsp;
                <span className="api-ut__inputLabel">
                    <TextField value={integrationConfig.name} width='150%' label="" standard={true} onChange={(event) => setIntegrationConfig({...integrationConfig, name: event.target.value})} autoComplete="off" placeholder="Enter Configuration Name" />
                </span>
            </div>
        </div>
        <div>
        {
            integrationConfig.selectValues && integrationConfig.selectValues.length > 0  && <ReleaseCycleSelection selectValues={integrationConfig.selectValues} handleSelect={handleNewSelect} />
        }
        </div>
        {
            <div style={{ display: 'flex', justifyContent:'space-between' }}>
                <div className="devOps_module_list">
                    <DevOpsModuleList integrationConfig={integrationConfig} setIntegrationConfig={setIntegrationConfig} />
                </div>
                <div className="devOps_pool_list">
                    <div style={{ marginTop: '0' }}>
                        <label className="devOps_dropdown_label devOps_dropdown_label_ice">Avo Agent / Avo Grid : </label>
                        <SearchDropdown
                            calloutMaxHeight="30vh"
                            noItemsText={'Avo Agent / Avo Grid is empty'}
                            onChange={(selectedIce) => setIntegrationConfig({...integrationConfig, avoAgentGrid: selectedIce})}
                            options={icepoollist}
                            placeholder="Select Avo Agent or Avo Grid"
                            selectedKey={integrationConfig.avoAgentGrid}
                            width='54%'
                        />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_browser">Select Browser : </label>
                        <SearchDropdown
                            calloutMaxHeight="30vh"
                            noItemsText={'No Browser available'}
                            onChange={(selectedBrowser) => setIntegrationConfig({...integrationConfig, browser: selectedBrowser})}
                            options={browserlist}
                            placeholder="Select Browser"
                            selectedKey={integrationConfig.browser}
                            width='54%'
                        />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_integration">Integration : </label>
                        <SearchDropdown
                            calloutMaxHeight="30vh"
                            noItemsText={'No Integration available'}
                            onChange={(selectedIntegration) => setIntegrationConfig({...integrationConfig, integration: selectedIntegration})}
                            options={integrationlist}
                            placeholder="Select Integration"
                            selectedKey={integrationConfig.integration}
                            width='54%'
                        />
                    </div>
                    <div>
                        <label className="devOps_dropdown_label devOps_dropdown_label_execution">Execution Type : </label>
                        <div className="devOps_dropdown_label_sync">
                            <label>Asynchronous </label>
                            <Toggle checked={integrationConfig.executionType == 'synchronous'} onChange={() => setIntegrationConfig({...integrationConfig, executionType: (integrationConfig.executionType === 'synchronous') ? 'asynchronous' : 'synchronous' })} label="" inlineLabel={true} />
                            <label>Synchronous </label>
                        </div>
                    </div>
                    <div className='devOps_seperation'>
                    </div>
                    <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_url">DevOps Integration API url : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={props.url} id='api-url' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/executeAutomation' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('api-url') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div>
                    <div>
                        <span className="devOps_dropdown_label devOps_dropdown_label_key">Configuration Key : </span>
                        <span className="devOps_dropdown_label_input"><input type="text" value={integrationConfig.key} id='devops-key' className="req-body" autoComplete="off" style={{width:"84%"}} placeholder='Configuration Key' />
                            <label>
                                <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return apiKeyCopyToolTip }, 0]} />
                                <div style={{fontSize:"24px"}}>
                                    <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={apiKeyCopyToolTip} onClick={() => { copyKeyUrlFunc('devops-key') }} ></i>
                                </div>
                            </label>
                        </span>
                    </div>
                </div>
            </div>
        }
    </>);
}


export default DevOpsConfig;
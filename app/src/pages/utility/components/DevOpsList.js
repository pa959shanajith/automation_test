import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import ReportApi from '../components/ReportApi'
import ExecMetricsApi from '../components/ExecMetricsApi'
import ExecutionApi from '../components/ExecutionApi'
import { ScrollBar, Messages as MSG, setMsg, ModalContainer } from '../../global';


import "../styles/DevOps.scss";

const DevOpsList = props => {
    const [api, setApi] = useState("Execution");
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [request, setRequest] = useState({});
    const [requestText, setRequestText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [searchEnable, setSearchEnable] = useState(false);
    const [configList, setConfigList] = useState([
        {
            name: 'Name 1',
            key: 'asdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasd12esadasda12312123',
            project: 'Project 1',
            release: 'Release 1'
        },{
            name: 'Name 2',
            key: 'asdasdasd22e2',
            project: 'Project 2',
            release: 'Release 2'
        },{
            name: 'Name 3',
            key: 'asdasdasd32e32332323',
            project: 'Project 3',
            release: 'Release 3'
        },{
            name: 'Name 4',
            key: 'asdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasd12esadasda12124',
            project: 'Project 4',
            release: 'Release 4'
        },{
            name: 'Name 5',
            key: 'asdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2esadasda12312123',
            project: 'Project 5',
            release: 'Release 5'
        },{
            name: 'Name 6',
            key: 'asdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaasd12esadasda12312123',
            project: 'Project 6',
            release: 'Release 6'
        },{
            name: 'Name 7',
            key: 'asdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaasda12312123',
            project: 'Project 7',
            release: 'Release 7'
        },{
            name: 'Name 8',
            key: 'asdasdaaaaaaaaaaaaaacxvaaaaaaaaaaasda12312123',
            project: 'Project 8',
            release: 'Release 8'
        },{
            name: 'Name 9',
            key: 'asdasdaaaasdkoiuiouo8asda12312123',
            project: 'Project 9',
            release: 'Release 9'
        },{
            name: 'Name 10',
            key: 'asdasdaa__asdhuy7-312123',
            project: 'Project 10',
            release: 'Release 10'
        },{
            name: 'Name 11',
            key: 'asdzxcdasdaaaaaaaaaaaaaaaaaaaaaaaaaaaaasda12312123',
            project: 'Project 11',
            release: 'Release 11'
        },{
            name: 'Name 12',
            key: 'asdadsfafaaaaaaaaaaaaaaaaaaasda12312123',
            project: 'Project 12',
            release: 'Release 12'
        },{
            name: 'Name 13',
            key: 'asdasdaaaaaaaaaaaaaaaaaaasafwefweraasda12312123',
            project: 'Project 13',
            release: 'Release 13'
        }
    ]);
    const [filteredList, setFilteredList] = useState(configList);
    const [error, setError] = useState({
        error: false,
        toDate: false,
        fromDate: false,
        LOB: false,
        executionId: false,
        scenarioIds: false,
        source: false,
        exectionMode: false,
        executionEnv: false,
        browserType: false,
        integration: {
            url: false,
            username: false,
            password: false,
            qteststeps: false
        },
        gitInfo: {
            gitConfiguration: false,
            gitbranch: false,
            folderPath: false,
            gitVersion: false
        },
        batchInfo: {
            testsuiteName: false,
            testsuiteId: false,
            versionNumber: false,
            appType: false,
            domainName: false,
            projectName: false,
            projectId: false,
            releaseId: false,
            cycleName: false,
            cycleId: false
        }
    });
    const [integration, setIntegration] = useState(-1);

    useEffect(() => {
        setRequestText("");
        setError({
            error: false,
            toDate: false,
            fromDate: false,
            LOB: false,
            executionId: false,
            scenarioIds: false,
            source: false,
            exectionMode: false,
            executionEnv: false,
            browserType: false,
            integration: {
                url: false,
                username: false,
                password: false,
                qteststeps: false
            },
            gitInfo: {
                gitConfiguration: false,
                gitbranch: false,
                folderPath: false,
                gitVersion: false
            },
            batchInfo: {
                testsuiteName: false,
                testsuiteId: false,
                versionNumber: false,
                appType: false,
                domainName: false,
                projectName: false,
                projectId: false,
                releaseId: false,
                cycleName: false,
                cycleId: false
            }
        });
    }, [api])

    const copyTokenFunc = () => {
        console.log(document.getElementById('request-body'));
        const data = requestText;
        if (!data) {
            setCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById('request-body');
        x.select();
        document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyConfigKey = (index) => {
        const x = document.getElementsByClassName('tkn_table_key_value')[index];
        // x.select();
        // document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const handleSubmit = () => {
        try {
            if (api !== "Execution" && api !== "Report" && api !== "Execution Metrics") {
                setMsg(MSG.UTILITY.ERR_SEL_API);
            }
            let obj = validate(request, api, integration);
            setError(obj);
            if (obj.error === true)  return;
            setMsg(MSG.UTILITY.SUCC_REQ_BODY_GEN);
            setRequestText(JSON.stringify(request, undefined, 4));
        } catch (e) {
            setMsg(MSG.UTILITY.ERR_GENERATE_RB);
        }
    }
    const deleteDevOpsConfig = () => {
        props.setShowConfirmPop({'title': 'Delete DevOps Integration Configuration', 'content': <p>Are you sure, you want to delete <b>Name 1</b> Integration Configuration?</p>, 'onClick': ()=>console.log('Delete config action clicked')});
    }
    const handleSearchChange = (value) => {
        let filteredItems = configList.filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
        setFilteredList(filteredItems);
        setSearchText(value);
    }

    return (<>
        <div>
            <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>DevOps Integration API url : </span>
            <span className="api-ut__inputLabel"><input type="text" value='' data-test="req-body-test" className="req-body" autoComplete="off" id="request-body" name="request-body" style={{width:"25%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/executeAutomation' />
                <label>
                    <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                    <div style={{fontSize:"24px"}}>
                        <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                    </div>
                </label>
            </span>
        </div>
        <div className="api-ut__btnGroup">
            {/* <button data-test="submit-button-test" onClick={handleSubmitReset} >Reset</button> */}
            {/* <configSearchBox /> */}
            {/* <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
                <h4 onClick={()=>{setShowList(!showList);}}>ICE Provisions</h4>
                <div className="search-ip">
                    <span className="searchIcon-provision search-icon-ip">
                        <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                    </span>
                    <input value={searchTasks} onChange={(event)=>{ setSearchTasks(event.target.value);searchIceList(event.target.value)}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
                </div>
            </div> */}
            {/* <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
                <h4 onClick={()=>{}}>Current DevOps Integration Configurations</h4>
                <div className="search-ip">
                    <span className="searchIcon-provision search-icon-ip">
                        <img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
                    </span>
                    <input value={''} onChange={(event)=>{}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
                </div>
            </div> */}
            <button data-test="submit-button-test" onClick={() => props.setCurrentIntegration(true)} >New Configuration</button>
            <div>
                <span className="searchIcon-provision search-icon-ip" style={{ border: `2px solid ${ searchEnable ? '#633693' : '#fff' }`, marginRight: '11px' }}>
                    <img src={"static/imgs/ic-search-icon.png"} onClick={() => setSearchEnable(!searchEnable)} className="search-img-ip" alt="search icon"/>
                </span>
                {
                    searchEnable && <input value={searchText} onChange={(event)=> handleSearchChange(event.target.value) } autoFocus autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" style={{ color: '#fff', background: '#633693', height: '33px' }} />
                }
            </div>
        </div>
        { /* Table */ }
        <div className="d__table" style={{ flex: 0 }}>
            <div className="d__table_header">
                <span className=" d__step_head tkn-table__sr_no" >Sr. No</span>
                <span className="d__obj_head tkn-table__name" >Name</span>
                <span className="d__key_head tkn-table__key" >Configuration Key</span>
                <span className="d__inp_head tkn-table__project" >Project</span>
                <span className="d__out_head tkn-table__project" >Release</span>
                {/* <span className="remark_col d__rem_head" ></span> */}
                <span className="details_col d__det_head tkn-table__button" >Action</span>
            </div>
        </div>
        <div id="activeUsersToken" className="wrap active-users-token">
            <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
            <table className = "table table-hover sessionTable" id="configList">
                <tbody>
                    {
                        searchEnable && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                            <td className="tkn-table__sr_no"> {index+1} </td>
                            <td className="tkn-table__name"> {item.name} </td>
                            <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.key }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(0) }} ></i></td>
                            <td className="tkn-table__project"> {item.project} </td>
                            <td className="tkn-table__project"> {item.release} </td>
                            <td className="tkn-table__button"> <button className="btn" style={{ marginRight: '10%' }}> Edit </button> &nbsp; <button className="btn" onClick={() => deleteDevOpsConfig()} > Delete </button></td>
                        </tr>)
                    }
                    {
                        !searchEnable && configList.length > 0 && configList.map((item, index) => <tr key={item.key} className='tkn-table__row'>
                            <td className="tkn-table__sr_no"> {index+1} </td>
                            <td className="tkn-table__name"> {item.name} </td>
                            <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.key }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(0) }} ></i></td>
                            <td className="tkn-table__project"> {item.project} </td>
                            <td className="tkn-table__project"> {item.release} </td>
                            <td className="tkn-table__button"> <button className="btn" style={{ marginRight: '10%' }}> Edit </button> &nbsp; <button className="btn" onClick={() => deleteDevOpsConfig()} > Delete </button></td>
                        </tr>)
                    }
                </tbody>
            </table>
            </ScrollBar>
        </div>
    </>);
}

const validate = (request, api, integration) => {
    let check = {
        error: false,
        toDate: false,
        fromDate: false,
        LOB: false,
        executionId: false,
        scenarioIds: false,
        source: false,
        exectionMode: false,
        executionEnv: false,
        browserType: false,
        integration: {
            url: false,
            username: false,
            password: false,
            qteststeps: false
        },
        gitInfo: {
            gitConfiguration: false,
            gitbranch: false,
            folderPath: false,
            gitVersion: false
        },
        batchInfo: {
            testsuiteName: false,
            testsuiteId: false,
            versionNumber: false,
            appType: false,
            domainName: false,
            projectName: false,
            projectId: false,
            releaseId: false,
            cycleName: false,
            cycleId: false
        }
    };
    if (api === "Report") {
        if (request["execution_data"].executionId.trim().length === 0) {
            check.executionId = true;
            check.error = true;
        }
        if (request["execution_data"].scenarioIds === undefined || request["execution_data"].scenarioIds.length === 0) {
            check.scenarioIds = true;
            check.error = true;
        }
    }
    else if (api === "Execution Metrics") {
        if (request["metrics_data"].fromDate === undefined || request["metrics_data"].fromDate.length === 0) {
            check.fromDate = true;
            check.error = true;
        }
        if (request["metrics_data"].toDate === undefined || request["metrics_data"].toDate.length === 0) {
            check.toDate = true;
            check.error = true;
        }
        if (request["metrics_data"].LOB === undefined || request["metrics_data"].LOB.length === 0) {
            check.LOB = true;
            check.error = true;
        }
    } else {
        if (request["executionData"].source !== "api") {
            check.source = true;
            check.error = true;
        }
        if (request["executionData"].exectionMode !== "serial" && request["executionData"].exectionMode !== "parallel") {
            check.exectionMode = true;
            check.error = true;
        }
        if (request["executionData"].executionEnv !== "default" && request["executionData"].executionEnv !== "saucelabs") {
            check.executionEnv = true;
            check.error = true;
        }
        if (parseInt(request["executionData"].browserType) < 1 || parseInt(request["executionData"].browserType) > 9) {
            check.browserType = true;
            check.error = true;
        }

        if (integration !== -1 && integration !== "-1") {
            const subrequest = request["executionData"].integration[integration];
            const regex = /^https:\/\//g;
            const regexUrl = /^http:\/\//g;
            if (!(regex.test(subrequest['url']) || regexUrl.test(subrequest['url']))) {
                check.integration.url = true;
                check.error = true;
            }
            if (subrequest.username.length === 0) {
                check.integration.username = true;
                check.error = true;
            }
            if (subrequest.password.length === 0) {
                check.integration.password = true;
                check.error = true;
            }
        }
        if (request["executionData"].gitInfo !== undefined) {
            if (request["executionData"].gitInfo.gitConfiguration.length === 0) {
                check.error = true;
                check.gitInfo.gitConfiguration = true;
            }
            if (request["executionData"].gitInfo.gitbranch.length === 0) {
                check.error = true;
                check.gitInfo.gitbranch = true;
            }
            if (request["executionData"].gitInfo.folderPath.length === 0) {
                check.error = true;
                check.gitInfo.folderPath = true;
            }
            if (request["executionData"].gitInfo.gitVersion.length === 0) {
                check.error = true;
                check.gitInfo.gitVersion = true;
            }
        } else {
            if (!request["executionData"].batchInfo) {
                check.error = true;
                check.batchInfo = true;
            }
        }
    }
    return check;
}

export default DevOpsList;
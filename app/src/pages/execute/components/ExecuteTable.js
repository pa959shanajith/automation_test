import React, {useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PopupMsg, ModalContainer ,ScrollBar, Report, Messages as MSG, setMsg} from '../../global' 
import {readTestSuite_ICE, loadLocationDetails, readTestCase_ICE} from '../api';
import Handlebars from "handlebars"
import "../styles/ExecuteTable.scss";
import MultiSelectDropDown from './MultiSelectDropDown';

//use : Renders Execution Table

const ExecuteTable = ({scenarioTaskType,accessibilityParameters,current_task,readTestSuite,setAccessibilityParameters,selectAllBatch,eachData,setEachData,updateScreen,update,setLoading,updateAfterSave}) => {

    const userInfo = useSelector(state=>state.login.userinfo);
    const [scenarioDetails,setScenarioDetails] = useState({})
    const [showModal,setshowModal] = useState(false)
    const [initialTableList,setInitialTableList] = useState([])
    const [arr,setArr] = useState([])
    
    useEffect(()=>{
        if(readTestSuite !== "")  readTestSuiteFunct();
        // eslint-disable-next-line
    }, [readTestSuite, updateAfterSave]);
    
    useEffect(()=>{
        setArr(eachData)
        // eslint-disable-next-line
    },[eachData])

    useEffect(()=>{
        updateSelectAllBatch();
        // eslint-disable-next-line
    }, [selectAllBatch]);

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
        return
    }

    const updateSelectAllBatch = () => {
        // eslint-disable-next-line
        eachData.map((rowData,m)=>{
            document.getElementById('parentExecute_"' + m).checked = selectAllBatch;
            changeSelectALL(m,'parentExecute_"' + m,eachData,setEachData,batchStatusCheckbox);
        })
        return
    }

    const updateScenarioStatus = (eachData1) => {
        // eslint-disable-next-line
        eachData1.map((rowData,m)=>{
            // eslint-disable-next-line
            rowData.scenarioids.map((sid,count)=>{
                changeExecutestatusInitial(eachData1,m,count);
            })
        })
        if(eachData1.length>1) batchStatusCheckbox(eachData, eachData1);
        else return
    }

    //make a seperate component after resolving ref bar issue
    const readTestSuiteFunct = async () => {
		setLoading("Loading in Progress. Please Wait");
        try{
            const data = await readTestSuite_ICE(readTestSuite, "execute")
            if(data.error){displayError(data.error);return;}
            setLoading(false);
            if (data !== "") {
				// cfpLoadingBar.complete();
                var keys = Object.keys(data);
				var dataLen = keys.length;
                var eachData2 = [];
                keys.map(itm => eachData2.push({...data[itm]}));
                var eachData1 = [];
                var initialTableData = [];
                var m, rowData;
                //state management for single scenario
                if (current_task.scenarioFlag === 'True') {
                    for ( m = 0; m < dataLen; m++) {
                        rowData = eachData2[m];
                        for (var k = 0; k < eachData2[m].scenarioids.length; k++) {
                            if (eachData2[m].scenarioids[k] === current_task.assignedTestScenarioIds || eachData2[m].scenarioids[k] === current_task.assignedTestScenarioIds[0]) {
                                eachData1.push({
                                    "condition": [rowData.condition[k]],
                                    "dataparam": [(rowData.dataparam[k]).trim()],
                                    "executestatus": [rowData.executestatus[k]],
                                    "scenarioids": [rowData.scenarioids[k]],
                                    "scenarionames": [rowData.scenarionames[k]],
                                    "projectnames": [rowData.projectnames[k]],
                                    "testsuiteid": rowData.testsuiteid,
                                    "testsuitename":rowData.testsuitename,
                                    "apptypes": [rowData.apptypes[k]],
                                });
                                initialTableData.push({
                                    "executestatus": [rowData.executestatus[k]]
                                })
                                break;
                            } 
                        }
                    }
                } else {
                    eachData2.forEach(itm =>{
                        initialTableData.push({...itm});
                        eachData1.push({...itm})
                    })
                    for ( m = 0; m < dataLen; m++) {
                        let exeStatus = [];
                        for(var i =0;i<eachData2[m].scenarioids.length;i++) exeStatus.push(eachData2[m].executestatus[i]);
                        initialTableData[m].executestatus=exeStatus;
                    }
                }
                setInitialTableList(initialTableData);
                setEachData(eachData1);
                updateScreen(!update);
                updateScenarioStatus(eachData1);
            }
        }catch(error){
            console.log(error);
            displayError(MSG.EXECUTE.ERR_FETCH_TESTSUITE)
        }
    }
    const changeParamPath = (m,count,value) => {
        let data = [...eachData];
        data[m].dataparam[count]=value;
        setEachData(data);
    }

    const closeModal = () => {
        setshowModal(false);
    }

    const loadLocationDetailsScenario = async (scenarioName, scenarioId) => {
		let data = await loadLocationDetails(scenarioName, scenarioId);
        if(data.error){displayError(data.error);return;}
        data["modalHeader"] = scenarioName;
        setScenarioDetails(data);
    } 

    const conditionUpdate = (m,count,value) => {
        let data = [...eachData];
        data[m].condition[count]=JSON.parse(value);
        setEachData(data);
    }

    return (
        <>
            <div id="middle-content-section">
                <div className="e__abs-div">
                    <div className="e__min-h">
                        <div className='e__container-wrap'>
                            <ScrollBar thumbColor="#321e4f">
                                <div className="e__batchSuites">
                                <ScrollBar  thumbColor="rgb(51,51,51)" trackColor="rgb(211, 211, 211)" >
                                    {arr.map((rowData,m)=>(
                                        <div key={m} className={arr.length>1?" executionTableDnd":" executionTableDnd-single"} id={"batch_'"+m} >
                                            <div className='suiteNameTxt' id={"page-taskName_'" + m}><span title={rowData.testsuitename}  className='taskname'> {rowData.testsuitename} </span></div>
                                            <div id={'exeData_"' + m} className='exeDataTable testSuiteBatch'>
                                                <div id={'executionDataTable_"' + m} className='executionDataTable' cellSpacing='0' cellPadding='0'>
                                                    <div className="e__table-head">
                                                        <div className="e__table-head-row">
                                                            <div className='e__contextmenu' id='contextmenu'></div>
                                                            <div className='e__selectAll' ><i title='Do Not Execute' aria-hidden='true' className='e__selectAll-exe'></i>
                                                                <input onChange={(event)=>{changeSelectALL(m,'parentExecute_"' + m,eachData,setEachData,batchStatusCheckbox)}} id={'parentExecute_"' + m} className='e-execute' type='checkbox' /></div>	
                                                            <div className='e__scenario'>Scenario Name</div>
                                                            <div className='e__param'>Data Parameterization</div>
                                                            <div className='e__condition'>Condition</div>
                                                            <div className='e__projectName'>Project Name</div>
                                                            <div className='e__apptype' >App Type</div>
                                                            {(!(!scenarioTaskType || scenarioTaskType == "" || scenarioTaskType == "disable"))?<div className='e__accessibilityTesting' >Accessibility Testing</div>:null}
                                                        </div>
                                                    </div>
                                                    <div className={eachData.length>1?'e__testScenarioScroll e__table-bodyContainer':" e__table-bodyContainer"}>
                                                        <ScrollBar thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" >
                                                        {rowData.scenarioids.map((sid,count)=>(
                                                            <div id={count} key={count} className={(initialTableList[m]!==undefined && initialTableList[m].executestatus[count]=== 0) ? "e__table_row_status e__table_row" : " e__table_row"}>
                                                                <div title={count} className='e__table-col tabeleCellPadding e__contextmenu' id={count}>{count+1}</div>
                                                                <div  className='e__table-col tabeleCellPadding exe-ExecuteStatus'>
                                                                    <input id={"executestatus_"+m+"_"+count} checked={rowData.executestatus[count]!== undefined && rowData.executestatus[count]!== 0 ? true:false} onChange={()=>{changeExecutestatus(m,count,eachData,batchStatusCheckbox,setEachData)}} type='checkbox' title='Select to execute this scenario' className='doNotExecuteScenario e-execute'/>
                                                                </div>
                                                                <div title={rowData.scenarionames[count]} className="tabeleCellPadding exe-scenarioIds e__table_scenaio-name" onClick={()=>{loadLocationDetailsScenario(rowData.scenarionames[count],rowData.scenarioids[count]);setshowModal(true);}}>{rowData.scenarionames[count]}</div>
                                                                <div className="e__table-col tabeleCellPadding exe-dataParam"><input className="e__getParamPath" type="text" onChange={(event)=>{changeParamPath(m,count,event.target.value)}} value={rowData.dataparam[count].trim()}/></div>
                                                                <div className="e__table-col tabeleCellPadding exe-conditionCheck"><select onChange={(event)=>{conditionUpdate(m,count,event.target.value)}} value={JSON.parse(rowData.condition[count])} className={"conditionCheck form-control"+(((rowData.condition[count]===0 || rowData.condition[count]=== "0"))?" alertRed":" alertGreen")}><option value={1}>True</option><option value={0}>False</option></select> </div>
                                                                <div title={rowData.projectnames[count]}  className='e__table-col tabeleCellPadding projectName'>{rowData.projectnames[count]}</div>
                                                                <div title={details[rowData.apptypes[count].toLowerCase()]['data']}  className='e__table-col tabeleCellPadding exe-apptype'>
                                                                    <img src={"static/imgs/"+details[rowData.apptypes[count].toLowerCase()]['img']+".png"} alt="apptype" className="e__table_webImg"/>
                                                                </div>
                                                                {(!(!scenarioTaskType || scenarioTaskType == "" || scenarioTaskType == "disable"))?
                                                                <div className="exe__table-multiDropDown"><MultiSelectDropDown accessibilityParameters={accessibilityParameters} setAccessibilityParameters={setAccessibilityParameters} /></div>:null}
                                                            </div>    
                                                        ))}
                                                        </ScrollBar>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ScrollBar>
                                </div>
                            </ScrollBar>
                        </div>    
                    </div>
                </div> 
            </div>
            {showModal?
                <ModalContainer title={scenarioDetails.modalHeader} footer={submitModalButtons(setshowModal)} close={closeModal} content={scenarioDetailsContent(scenarioDetails, userInfo, displayError)} />
            :null} 
        </>
    );
}


const submitModalButtons = (setshowModal) => {
    return(
        <button type="button" onClick={()=>{setshowModal(false);}} >Ok</button>
    )
}

const changeExecutestatus = (m,count,eachData,batchStatusCheckbox,setEachData) => {
    let data = [...eachData];
    var temp = 0;
    if(eachData[m].executestatus[count] === 0) temp = 1;
    data[m].executestatus[count]=temp;

    let zeroExist = data[m].executestatus.includes(0);
    let oneExist = data[m].executestatus.includes(1);

    if(zeroExist ===true && oneExist === true) document.getElementById('parentExecute_"' + m).indeterminate = true;
    else if (zeroExist ===false && oneExist === true) {
        document.getElementById('parentExecute_"' + m).indeterminate = false;
        document.getElementById('parentExecute_"' + m).checked = true;
    }
    else if (zeroExist ===true && oneExist === false) {
        document.getElementById('parentExecute_"' + m).indeterminate = false;
        document.getElementById('parentExecute_"' + m).checked = false;
    }
    if(data.length>1) batchStatusCheckbox(eachData, data);
    setEachData(data);
}

const changeSelectALL = (m,id,eachData,setEachData,batchStatusCheckbox) => {
    let data = [...eachData];
    var checkBox = document.getElementById(id);
    let temp = 1; if(checkBox.checked!==true) temp = 0;
    let newExecutestatus = [];
    for(var i =0;i<data[m].scenarioids.length;i++) newExecutestatus.push(temp);
    data[m].executestatus=newExecutestatus;
    setEachData(data);
    document.getElementById('parentExecute_"' + m).indeterminate = false;
    if(eachData.length>1) batchStatusCheckbox(eachData);
    else return;
}

const batchStatusCheckbox = (eachData, eachData1) => {
    if(eachData1===undefined) eachData1 = eachData;
    let batchStatus = 0;
    // eslint-disable-next-line
    eachData1.map((rowData,m)=>{
        if(document.getElementById('parentExecute_"' + m).checked === true && document.getElementById('parentExecute_"' + m).indeterminate === false ) batchStatus = batchStatus + 1;
    })
    if(batchStatus === 0){
        document.getElementById('selectAllBatch').indeterminate = false;
        document.getElementById('selectAllBatch').checked = false;
    } 
    else if (batchStatus !==0 && batchStatus!== eachData1.length) {
        document.getElementById('selectAllBatch').indeterminate = true;
    }
    else if (batchStatus !==0 && batchStatus=== eachData1.length) {
        document.getElementById('selectAllBatch').checked = true;
        document.getElementById('selectAllBatch').indeterminate = false;
    }
}

const changeExecutestatusInitial = (eachData1,m) => {
    let zeroExist = eachData1[m].executestatus.includes(0);
    let oneExist = eachData1[m].executestatus.includes(1);

    if(zeroExist ===true && oneExist === true) document.getElementById('parentExecute_"' + m).indeterminate = true;
    else if (zeroExist ===false && oneExist === true) {
        document.getElementById('parentExecute_"' + m).indeterminate = false;
        document.getElementById('parentExecute_"' + m).checked = true;
    }
    else if (zeroExist ===true && oneExist === false) {
        document.getElementById('parentExecute_"' + m).indeterminate = false;
        document.getElementById('parentExecute_"' + m).checked = false;
    }
}

const scenarioDetailsContent = (scenarioDetails, userInfo, displayError) => {
    return(
        <>
            <div className="scenarioDetails scenarioDetailsHeading">
                <div className="sDInnerContents">Test Case Name</div>
                <div className="sDInnerContents">Screen Name</div>
                <div className="sDInnerContents">Project Name</div>
            </div>
            <div id="scenarioDetailsContent" className="scenarioDetails scenarioDetailsContent scrollbar-inner">
                <ScrollBar thumbColor="#321e4f" >
                {scenarioDetails.screennames!==undefined?
                <>
                    {scenarioDetails.screennames.map((data,i)=>(
                        <div key={i} className="sDInnerContentsWrap">
                            <div className="sDInnerContents viewReadOnlyTC" onClick={()=>{testCaseDetails(scenarioDetails.testcasenames[i], scenarioDetails.testcaseids[i], userInfo, displayError)}} title={scenarioDetails.testcasenames[i]}>{scenarioDetails.testcasenames[i]}</div>
                            <div className="sDInnerContents" title={scenarioDetails.screennames[i]}>{scenarioDetails.screennames[i]}</div>
                            <div className="sDInnerContents" title={scenarioDetails.projectnames[i]}>{scenarioDetails.projectnames[i]}</div>
                        </div>
                    ))}
                </>
                :null}
                </ScrollBar>
            </div>
        </>
    )
}

const testCaseDetails = async (testCaseName, testCaseId, userInfo, displayError) => {
    try{
        const response = await readTestCase_ICE(userInfo,testCaseId, testCaseName, 0);
        if(response.error){displayError(response.error);return;}
        var template = Handlebars.compile(Report);
        var dat = template({
                name: [{
                        testcasename: response.testcasename
                    }
                ],
                rows: response.testcase
            });
        var newWindow = window.open();
        newWindow.document.write(dat);
    }catch(error) {
        console.log(error);
    }
}

const details = {
    "web":{"data":"Web","title":"Web","img":"web"},
    "webservice":{"data":"Webservice","title":"Web Service","img":"webservice"},
    "desktop":{"data":"Desktop","title":"Desktop Apps","img":"desktop"},
    "oebs":{"data":"OEBS","title":"Oracle Apps","img":"oracleApps"},
    "mobileapp":{"data":"MobileApp","title":"Mobile Apps","img":"mobileApps"},
    "mobileweb":{"data":"MobileWeb","title":"Mobile Web","img":"mobileWeb"},
    "sap":{"data":"SAP","title":"SAP Apps","img":"sapApps"},
    "system":{"data":"System","title":"System Apps","img":"desktop"},
    "mainframe":{"data":"Mainframe","title":"Mainframe","img":"mainframe"}
};

export default ExecuteTable;
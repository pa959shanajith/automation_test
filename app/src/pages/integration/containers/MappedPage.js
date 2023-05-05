import React, { useState, useEffect, Fragment } from 'react';
import {ScrollBar, Messages as MSG, setMsg} from '../../global';
import MappedLabel from '../components/MappedLabel';
import { saveUnsyncDetails } from '../api';
import '../styles/MappedPage.scss';
import { useDispatch } from 'react-redux';
import * as actionTypes from '../state/action';

/* 
    screenType - ALM/qTest/Zephyr
    leftBoxTitle - Title of Left Section
    rightBoxTitle - Title of Right Section
    mappedfilesRes - Array of Objects of mapped Files
*/

const MappedPage = props =>{
    const dispatch = useDispatch();
    const [selectedSc, setSelectedSc] = useState([]);
    const [selectedTc, setSelectedTc] = useState([]);
    const [unSynced, setUnSynced] = useState(false);
    const [unSyncMaps, setUnSyncMaps] = useState({
        type: '',
        maps: {}
    });
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    })

    useEffect(()=>{
        if (props.mappedfilesRes.length){
            let tempRow = [];
            if (props.screenType === "ALM") {
                let totalCounts = 0;
                let mappedScenarios = 0;
                let mappedTests = 0;

                props.mappedfilesRes.forEach(object => {
                    totalCounts = totalCounts + 1;
                    mappedScenarios = mappedScenarios + object.testscenarioname.length;
                    mappedTests = mappedTests + object.qctestcase.length;
                    tempRow.push({
                        'scenarioNames': object.testscenarioname,
                        'testCaseNames': object.qctestcase,
                        'mapId': object._id,
                        'scenarioId': object.testscenarioid,
                        'folderPath': object.qcfolderpath,
                        'testCaseSet': object.qctestset,
                    });
                });

                setCounts({
                    totalCounts: totalCounts,
                    mappedScenarios: mappedScenarios,
                    mappedTests: mappedTests
                });
            } 
            else if (props.screenType === "qTest") {
                props.mappedfilesRes.forEach(object => {
                    tempRow.push({
                        "testCaseNames": object.qtestsuite, 
                        "scenarioNames": object.testscenarioname
                    });
                })
            }
            else if (props.screenType === "Zephyr") {
                let totalCounts = 0;
                let mappedScenarios = 0;
                let mappedTests = 0;
                props.mappedfilesRes.forEach(object => {
                    totalCounts = totalCounts + 1;
                    mappedScenarios = mappedScenarios + object.testscenarioname.length;
                    mappedTests = mappedTests + object.testname.length;
                    tempRow.push({
                        'testCaseNames': object.testname, 
                        'scenarioNames': object.testscenarioname,
                        'mapId': object._id,
                        'scenarioId': object.testscenarioid,
                        'testid':object.testid,
                        "reqDetails": object.reqdetails
                    });
                });
                setCounts({
                    totalCounts: totalCounts,
                    mappedScenarios: mappedScenarios,
                    mappedTests: mappedTests
                });
            setRows(tempRow);
            setUnSyncMaps({
                type: '',
                maps: {}
            });
        }  else if (props.screenType === "Jira") {
                let totalCounts = 0;
                let mappedScenarios = 0;
                let mappedTests = 0;
                props.mappedfilesRes.forEach(object => {
                    totalCounts = totalCounts + 1;
                    mappedScenarios = mappedScenarios + object.testscenarioname.length;
                    mappedTests = mappedTests + 1;
                    tempRow.push({
                        'testCaseNames': object.itemCode, 
                        'scenarioNames': object.testscenarioname,
                        'mapId': object._id,
                        'scenarioId': object.testscenarioid,
                        'testid':object.itemId,
                        'itemSummary':object.itemSummary
                    });
                });
                setCounts({
                    totalCounts: totalCounts,
                    mappedScenarios: mappedScenarios,
                    mappedTests: mappedTests
                });
            setRows(tempRow);
            setUnSyncMaps({
                type: '',
                maps: {}
            });
        }
        else if (props.screenType === "Azure") {
            let totalCounts = 0;
            let mappedScenarios = 0;
            let mappedTests = 0;
            props.mappedfilesRes.forEach(object => {
                totalCounts = totalCounts + 1;
                mappedScenarios = mappedScenarios + object.testscenarioname.length;
                mappedTests = mappedTests + 1;
                tempRow.push({
                    'testCaseNames': object.itemType === "UserStory" ? object.userStoryId : object.TestSuiteId, 
                    'scenarioNames': object.testscenarioname,
                    'mapId': object._id,
                    'scenarioId': object.testscenarioid,
                    'testid':object.itemId,
                    'itemSummary': object.itemType === "UserStory" ? object.userStorySummary : object.testSuiteSummary
                });
            });
            setCounts({
                totalCounts: totalCounts,
                mappedScenarios: mappedScenarios,
                mappedTests: mappedTests
            });
        setRows(tempRow);
        setUnSyncMaps({
            type: '',
            maps: {}
        });
    }
          else {
                setSelectedSc([]);
                setSelectedTc([]);
                setUnSynced(false);
                setUnSyncMaps({
                    type: '',
                    maps: {}
                });
                setRows([]);
                setCounts({
                    totalCounts: 0,
                    mappedScenarios: 0,
                    mappedTests: 0
                })
            }
}
    }, [props.mappedfilesRes, props.screenType])

    const handleClick = (e, type, mapIdx) => {
        let newSelectedList = [];

        if (type==="scenario") newSelectedList = [...selectedSc];
        if (type==="testcase") newSelectedList = [...selectedTc];

        let itemIdx = newSelectedList.indexOf(mapIdx);
        if (itemIdx > -1) newSelectedList.splice(itemIdx, 1);
        else if (!e.ctrlKey) newSelectedList = [mapIdx];
        else if (e.ctrlKey) newSelectedList = [...newSelectedList, mapIdx];

        if (type==="scenario") {
            setSelectedSc(newSelectedList);
            setSelectedTc([]);
        }
        if (type==="testcase") {
            setSelectedTc(newSelectedList);
            setSelectedSc([]);
        }
        if (unSynced) setUnSynced(false);
    }

    const onUnSync = type => {
        let tempUnSyncMaps = unSyncMaps.type === type ? { ...unSyncMaps } : {type: type, maps: {}} ;

        let selectedMaps = [...selectedSc, ...selectedTc]; // One Array will always be empty
        if (props.screenType === "ALM"){
            for (let itemAddress of selectedMaps) {
                let [rowIdx, labelIdx] = itemAddress.split("-");
    
                if (type === "scenario") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testscenarioid.push(rows[rowIdx].scenarioId[labelIdx]);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testscenarioid': [rows[rowIdx].scenarioId[labelIdx]]
                        }
                    }
                }
                else if (type === "testcase") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].qctestcase.push(rows[rowIdx].testCaseNames[labelIdx]);
                        tempUnSyncMaps.maps[rowIdx].qcfolderpath.push(rows[rowIdx].folderPath[labelIdx]);
                        tempUnSyncMaps.maps[rowIdx].qctestset.push(rows[rowIdx].testCaseSet[labelIdx]);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'qctestcase': [rows[rowIdx].testCaseNames[labelIdx]],
                            'qcfolderpath': [rows[rowIdx].folderPath[labelIdx]],
                            'qctestset': [rows[rowIdx].testCaseSet[labelIdx]]
                        }
                    }
                }
            }
        } else if (props.screenType === "Zephyr"){
            for (let itemAddress of selectedMaps) {
                let [rowIdx, labelIdx] = itemAddress.split("-");

                if (type === "scenario") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testscenarioid.push(rows[rowIdx].scenarioId[labelIdx]);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testscenarioid': [rows[rowIdx].scenarioId[labelIdx]]
                        }
                    }
                }
                else if (type === "testcase") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testCaseNames.push(rows[rowIdx].testCaseNames[labelIdx]);
                        tempUnSyncMaps.maps[rowIdx].testid.push(rows[rowIdx].testid[labelIdx]);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testCaseNames': [rows[rowIdx].testCaseNames[labelIdx]],
                            'testid': [rows[rowIdx].testid[labelIdx]]
                        }
                    }
                }
            }
        } else if (props.screenType === "Jira"){
            for (let itemAddress of selectedMaps) {
                let [rowIdx, labelIdx] = itemAddress.split("-");

                if (type === "scenario") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testscenarioid.push(rows[rowIdx].scenarioId);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testscenarioid': [rows[rowIdx].scenarioId]
                        }
                    }
                }
                else if (type === "testcase") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testCaseNames.push(rows[rowIdx].testCaseNames);
                        tempUnSyncMaps.maps[rowIdx].testid.push(rows[rowIdx].testid);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testCaseNames': [rows[rowIdx].testCaseNames],
                            'testid': [rows[rowIdx].testid],
                            'testSummary':[rows[rowIdx].testSummary]
                        }
                    }
                }
            }
        }
        else if (props.screenType === "Azure"){
            for (let itemAddress of selectedMaps) {
                let [rowIdx, labelIdx] = itemAddress.split("-");

                if (type === "scenario") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testscenarioid.push(rows[rowIdx].scenarioId);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testscenarioid': [rows[rowIdx].scenarioId]
                        }
                    }
                }
                else if (type === "testcase") {
                    if (tempUnSyncMaps.maps[rowIdx]) {
                        tempUnSyncMaps.maps[rowIdx].testCaseNames.push(rows[rowIdx].testCaseNames);
                        tempUnSyncMaps.maps[rowIdx].testid.push(rows[rowIdx].testid);
                    }
                    else {
                        tempUnSyncMaps.maps[rowIdx] = {
                            'mapid': rows[rowIdx].mapId,
                            'testCaseNames': [rows[rowIdx].testCaseNames],
                            'testid': [rows[rowIdx].testid],
                            'testSummary':[rows[rowIdx].testSummary]
                        }
                    }
                }
            }
        }
        setUnSynced(true);
        setUnSyncMaps(tempUnSyncMaps);
    }

    const onSave = () => {
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading...'});
        if(Object.values(unSyncMaps.maps).length > 0){
            let args = Object.values(unSyncMaps.maps);
            args['screenType']=props.screenType;
			saveUnsyncDetails(args)
			.then(data => {
                if (data.error) 
                    setMsg(data.error);
				else if(data === "unavailableLocalServer")
                    setMsg(MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
				else if(data === "scheduleModeOn")
                    setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
				else if(data === "fail")
                    setMsg(MSG.INTEGRATION.ERR_SAVE);
				else if(data == "success")
                    props.fetchMappedFiles(true);        
			})
			.catch (error => setMsg(MSG.INTEGRATION.ERR_SAVE))
		}
		else setMsg(MSG.INTEGRATION.WARN_UNMAP_TC)
        dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
    }
    const displayError = (error) =>{
        setMsg(error)
    }
    return(
        <Fragment>
            <div  className="integration_middleContent">
                <div className="viewMap__task_title" >
                    <span className="viewMap__task_name">
                        Mapped files
                    </span>
                    {(props.screenType === "ALM" || props.screenType === "Zephyr" || props.screenType === "Jira" || props.screenType === "Azure") && 
                    <> 
                        <div className="viewMap__counterContainer">
                            <div className="viewMap__totalCount">
                                <div>Total Mappings</div>
                                <div>{counts.totalCounts}</div>
                            </div>
                            <div className="viewMap__scenarioCount">
                                <div>Mapped Scenarios</div>
                                <div>{counts.mappedScenarios}</div>
                            </div>
                            <div className="viewMap__testCount">
                                <div>Mapped {props.screenType} items</div>
                                <div>{counts.mappedTests}</div>
                            </div>
                        </div>
                        <button onClick={onSave} title="Save">Save</button> 
                    </> }
                </div>
                <div className="viewMap__mappingsContainer">
                    <div className="viewMap__tileRow">
                        <span className="viewMap_actionRow"><label>{props.leftBoxTitle}</label></span>
                        <span className="viewMap_actionRow"><label>{props.rightBoxTitle}</label></span>
                    </div>
                    <div className="viewMap__labelContainer">
                    <div className="viewMap__canvas">
                        <div className="viewMap__inner">
                            <div className="viewMap__contents" id="viewMapScrollId">
                            <ScrollBar scrollId="viewMapScrollId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                { rows.map(({scenarioNames, testCaseNames, reqDetails,itemSummary}, index) => <div key={index} className="viewMap__labelRow">
                                  
                                    <MappedLabel 
                                        list={testCaseNames}
                                        summary={itemSummary}
                                        type="testcase" 
                                        mapIdx={index} 
                                        screenType = {props.screenType}
                                        reqDetails = {reqDetails}
                                        handleClick={(props.screenType === "ALM" || props.screenType === "Zephyr"  || props.screenType === "Jira" || props.screenType === "Azure" ) ? handleClick : null} 
                                        selected={selectedTc} 
                                        unSynced={unSynced}
                                        handleUnSync={(props.screenType === "ALM" || props.screenType === "Zephyr"  || props.screenType === "Jira" || props.screenType === "Azure") ? onUnSync : null}
                                        displayError={displayError}
                                    />
                                    { (props.screenType!=="ALM" && props.screenType!== "Zephyr") && 
                                        <div className="viewMap__ropeContainer">
                                            <div className="viewMap__rope"></div>
                                        </div>
                                    }
                                    <MappedLabel 
                                        list={scenarioNames} 
                                        type="scenario" 
                                        mapIdx={index} 
                                        handleClick={(props.screenType === "ALM" || props.screenType === "Zephyr"  || props.screenType === "Jira" || props.screenType === "Azure") ? handleClick : null} 
                                        selected={selectedSc} 
                                        unSynced={unSynced}
                                        displayError={displayError}
                                        handleUnSync={(props.screenType === "ALM" || props.screenType === "Zephyr"  || props.screenType === "Jira" || props.screenType === "Azure") ? onUnSync : null}
                                    />
                                </div>) }
                            </ScrollBar>
                            </div>   
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </Fragment>
    );
}
export default MappedPage;
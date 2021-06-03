import React, { useState, useCallback } from 'react';
import { qcFolderDetails_ICE } from '../api.js';
import { updateScrollBar } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from '../state/action';

/* 
    props:
        folders - array of subfolders
        projectName - selected Project
        releaseName - selected Domain
*/
const FolderNode = props => {

    const dispatch = useDispatch();
    const [collapse, setCollapse] = useState(true);
    const [subFolders, setSubFolders] = useState([]);
    const [subTestSets, setSubTestSets] = useState([]);
    const [testCases, setTestCases] = useState([]);

    const handleClick = useCallback(async()=>{
        if (collapse) {
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: 'Loading Testcases...'});
            
            const path = props.type === "folder" ? props.folderObject.folderpath : props.testSetObject.testsetpath;
            const testCaseName = props.type === "folder" ? null : props.testSetObject.testset;
            const folderId = props.type === "folder" ? props.folderObject.folderid : props.testSetObject.folderid;

            const data = await qcFolderDetails_ICE(props.projectName, path, props.releaseName, props.type, testCaseName, folderId);
            if (data.error){
                dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: data.error}});
            } else if (typeof(data) !== "object") {
                dispatch({type: actionTypes.SHOW_POPUP, payload: {title: "Error", content: "Error in getting list."}});
            } else if (props.type === "folder") {
                setSubFolders(data[0].testfolder);
                setSubTestSets(data[0].TestSet);
                setCollapse(false);
            } else if (props.type === "testcase") {
                setTestCases(data[0].testcase);
                setCollapse(false);
            }
            dispatch({type: actionTypes.SHOW_OVERLAY, payload: ''});
        } 
        else setCollapse(true);
        updateScrollBar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collapse, setCollapse])

    return <div className="int__folderNode" style={{paddingLeft: 17}}>
        { <div className="test_tree_branches">
            <img alt="ce-ic"
                className="test_tree_toggle" 
                src={ props.type === "folder" 
                        ? `static/imgs/ic-qc${collapse ? "Expand" : "Collapse"}.png` 
                        : `static/imgs/ic-taskType-blue-${collapse ? "plus" : "minus"}.png` }
                onClick={handleClick}
            />
            <label>{ props.type === "folder" ? props.folderObject.foldername : props.testSetObject.testset}</label>
        </div> }
        { !collapse && subFolders.length > 0 
            ? <div> {
                subFolders
                    .map((folder, idx) => <FolderNode 
                                            key={`folder-${idx}`}
                                            folderObject={folder}
                                            type="folder"
                                            projectName={props.projectName}
                                            releaseName={props.releaseName}
                                        />)
            } </div>
            : !collapse && subTestSets.length > 0 
            ? <div> {
                subTestSets
                    .map((testSet, idx) => <FolderNode 
                                            key={`testSet-${idx}`}
                                            testSetObject={testSet}
                                            type="testcase"
                                            projectName={props.projectName}
                                            releaseName={props.releaseName}
                                        />)
            } </div>
            : !collapse && testCases.length > 0 
            ? <div> {
                testCases
                    .map((testCase, idx) => <TestCaseNode 
                                            key={`testCase-${idx}`}
                                            testCaseName={testCase.slice(0, testCase.indexOf("/"))}
                                            testCaseId={testCase.substring(testCase.indexOf("/")+1)}
                                            testSetObject={props.testSetObject}
                                            projectName={props.projectName}
                                            releaseName={props.releaseName}
                                        />)
            } </div>
            : null
        }
    </div>;
}



const TestCaseNode = props => {

    const dispatch = useDispatch();
    const selectedTCDetails = useSelector(state=>state.integration.selectedTCDetails);
    const syncedTestCases = useSelector(state=>state.integration.syncedTestCases);
    const selectedTC = useSelector(state=>state.integration.selectedTestCase);
    const selectedScIds = useSelector(state=>state.integration.selectedScenarioIds);

    let uniqueTCpath = `${props.testSetObject.testsetpath}\\${props.testSetObject.testset}\\${props.testCaseName}`;

    const handleClick = e => {
        let newSelectedTCDetails = { ...selectedTCDetails };
        let newSelectedTC = [...selectedTC];

        if (!e.ctrlKey) {
            newSelectedTCDetails.selectedTCNames = [props.testCaseName];
            newSelectedTCDetails.selectedTSNames = [props.testSetObject.testset];
            newSelectedTCDetails.selectedFolderPath = [props.testSetObject.testsetpath];
            newSelectedTCDetails.selectedFolderId = [props.testSetObject.folderid];
            newSelectedTC = [uniqueTCpath];
		} else if (e.ctrlKey) { 
            const index = newSelectedTC.indexOf(uniqueTCpath);
            if (index !== -1) {
                newSelectedTCDetails.selectedTCNames.splice(index, 1);
                newSelectedTCDetails.selectedTSNames.splice(index, 1);
                newSelectedTCDetails.selectedFolderPath.splice(index, 1);
                newSelectedTCDetails.selectedFolderId.splice(index, 1);
                newSelectedTC.splice(index, 1);
            } else {
                newSelectedTCDetails.selectedTCNames.push(props.testCaseName);
                newSelectedTCDetails.selectedTSNames.push(props.testSetObject.testset);
                newSelectedTCDetails.selectedFolderPath.push(props.testSetObject.testsetpath);
                newSelectedTCDetails.selectedFolderId.push(props.testSetObject.folderid);
                newSelectedTC.push(uniqueTCpath)
            } 
        }
        dispatch({type: actionTypes.SEL_TC_DETAILS, payload: newSelectedTCDetails});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: newSelectedTC});
    };

    const handleSync = () => {
        let popupMsg = false;
        if(selectedScIds.length===0){
            popupMsg = {
                title:'Save Mapped Testcase ',
                content:"Please Select a Scenario"
            };
        }
        else if(selectedTCDetails.selectedTCNames.length===0){
            popupMsg = {
                title:'Save Mapped Testcase ',
                content:"Please select Testcase"
            };
        }
        else if(selectedTCDetails.selectedTCNames.length>1 && selectedScIds.length>1) {
			popupMsg = {
                title:'Save Mapped Testcase ',
                content:"Cannot map multiple test cases with multiple scenarios"
            };
        }

        if (popupMsg) dispatch({type: actionTypes.SHOW_POPUP, payload: popupMsg});
        else{
            const mappedPair=[
                {
                    domain: props.projectName,
                    folderpath: selectedTCDetails.selectedFolderPath,
                    folderid: selectedTCDetails.selectedFolderId,
                    project: props.releaseName,
                    scenarioId: selectedScIds,
                    testcase: selectedTCDetails.selectedTCNames,
                    testset:  selectedTCDetails.selectedTSNames
                }
            ]
            dispatch({type: actionTypes.MAPPED_PAIR, payload: mappedPair});
            dispatch({type: actionTypes.SYNCED_TC, payload: selectedTCDetails.selectedTCNames});
        }
    }

    const handleUnSync = () => {
        dispatch({type: actionTypes.MAPPED_PAIR, payload: []});
        dispatch({type: actionTypes.SYNCED_TC, payload: []});
        dispatch({type: actionTypes.SEL_TC, payload: []});
        dispatch({type: actionTypes.SEL_SCN_IDS, payload: []});
    }

    return <div className={"test_tree_leaves"+ ( selectedTC.includes(uniqueTCpath) ? " test__selectedTC" : "") + (selectedTC.includes(uniqueTCpath) && syncedTestCases.includes(props.testCaseName) ? " test__syncedTC" : "")}>
                <label className="test__leaf" title={props.testCaseName} onClick={handleClick}>
                    <span className="leafId">{props.testCaseId}</span>
                    <span className="test__tcName">{props.testCaseName}</span>
                </label>
                { selectedTC.includes(uniqueTCpath)
                        && <><div className="test__syncBtns"> 
                        { !syncedTestCases.includes(props.testCaseName) && <img className="test__syncBtn" alt="s-ic" onClick={handleSync} src="static/imgs/ic-qcSyncronise.png" />}
                        <img className="test__syncBtn" alt="s-ic" onClick={handleUnSync} src="static/imgs/ic-qcUndoSyncronise.png" />
                        </div></> 
                    }
            </div>
}

export default FolderNode;
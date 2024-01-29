import React, { useState, useRef, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getModules, getScreens, updateTestSuiteInUseBy } from '../api';
import { readTestSuite_ICE, exportMindmap, exportToExcel, exportToGit } from '../api';
import '../styles/ToolbarMenu.scss';
import * as d3 from 'd3';
import { Messages as MSG, ModalContainer, setMsg } from '../../global';
import PropTypes from 'prop-types';
import Legends from './Legends';
import { InputSwitch } from 'primereact/inputswitch';
import { Divider } from 'primereact/divider';
import { screenData, moduleList, selectedModuleReducer, selectedProj, selectedModulelist, selectBoxState, selectNodes, copyNodes, dontShowFirstModule, TypeOfViewMap } from '../designSlice'
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from 'primereact/dropdown';




/*Component ToolbarMenu
  use: renders tool bar menus of create new page
*/

const Toolbarmenu = ({ setBlockui, displayError, isAssign }) => {
    const dispatch = useDispatch()
    const SearchInp = useRef()
    const fnameRef = useRef()
    const ftypeRef = useRef()
    const gitconfigRef = useRef()
    const gitBranchRef = useRef()
    const gitVerRef = useRef()
    const gitPathRef = useRef()
    const moduleSelect = useSelector(state => state.design.selectedModule)
    const selectBox = useSelector(state => state.design.selectBoxState)
    const selectNode = useSelector(state => state.design.selectNodes)
    const copyNode = useSelector(state => state.design.copyNodes)
    const prjList = useSelector(state => state.design.projectList)
    const initProj = useSelector(state => state.design.selectedProj)
    // const setselectedProjectNameForDropdown = useSelector(state=>state.design.selectedProj)
    const moduleListed = useSelector(state => state.design.moduleList)
    const selectedModuled = useSelector(state => state.design.selectedModule)
    const selectedModulelisted = useSelector(state => state.design.selectedModulelist)
    const handleTypeOfViewMap = useSelector(state => state.design.typeOfViewMap)
    const [modlist, setModList] = useState(moduleListed)
    const [exportBox, setExportBox] = useState(false);
    const initEnEProj = useSelector(state => state.design.initEnEProj)
    const [isCreateE2E, setIsCreateE2E] = useState(false)
    const isEnELoad = useSelector(state => state.design.isEnELoad);
    const [selectedView, setSelectedView] = useState({ code: 'mindMapView', name: <div><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div> });
    // const [radioButClicked, setRadioButClicked] = useState('journeyView');
    const [selectedGitOpp, setSelectedGitOpp] = useState(null);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;
    // let selectProject = reduxDefaultselectedProject;

    const localStorageDefaultProject = localStorage.getItem('DefaultProject');
    if (localStorageDefaultProject) {
        dispatch(selectedProj(JSON.parse(localStorageDefaultProject).projectId));
    }
    useEffect(() => {
        setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate ? true : false);

    }, [initEnEProj]);

    const selectProj = async (proj) => {
        setBlockui({ show: true, content: 'Loading Modules ...' })
        dispatch(dontShowFirstModule(false))
        dispatch(selectedProj(proj))
        // setselectedProjectNameForDropdown(proj);
        // if(!isEnELoad){
        //     // dispatch({type: actionTypesPlugin.SET_PN, payload:proj})
        //     // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        // }
        const defaultProjectData = {
            ...(JSON.parse(localStorageDefaultProject)), // Parse existing data from localStorage
            projectId: proj,
            projectName: prjList[proj]?.name,
            appType: prjList[proj]?.apptypeName,
            projectLevelRole: prjList[proj]?.projectLevelRole
        };

        localStorage.setItem("DefaultProject", JSON.stringify(defaultProjectData));
        dispatch(moduleList([]))
        dispatch(selectedModuleReducer({}))
        var moduledata = await getModules({ "tab": "endToend", "projectid": proj, "moduleid": null })
        if (moduledata.error) { displayError(moduledata.error); return; }
        var screendata = await getScreens(proj)
        if (screendata.error) { displayError(screendata.error); return; }
        setModList(moduledata)
        dispatch(moduleList(moduledata))
        dispatch(selectedModulelist([]))
        dispatch(screenData(screendata));
        if (screendata) dispatch(screenData(screendata))
        // if(SearchInp){
        //     SearchInp.current.value = ""
        // }

        setBlockui({ show: false })

    }

    const searchModule = (val) => {
        var filter = modlist.filter((e) => e.name.toUpperCase().indexOf(val.toUpperCase()) !== -1)
        dispatch(moduleList(filter))
    }
    const CreateNew = () => {
        dispatch(selectedModuleReducer({ createnew: true }))
    }
    const clickExport = () => {
        // if(!selectedModule._id || selectedModulelist.length==0)return;
        var err = validate([fnameRef, ftypeRef, gitconfigRef, gitBranchRef, gitVerRef])
        if (err) return
        let selectedModuleVar = selectedModulelist.length > 0 ? selectedModulelist : selectedModuled;
        setExportBox(false)
        setBlockui({ show: true, content: 'Exporting Mindmap ...' })
        var ftype = ftypeRef.current.value
        if (ftype === 'json') {
            toJSON(selectedModuleVar, fnameRef.current.value, displayError, setBlockui);
        }

        if (ftype === 'excel') toExcel(selectedProj, selectedModulelisted.length > 0 ? selectedModulelisted[0] : selectedModuled, fnameRef.current.value, displayError, setBlockui);
        if (ftype === 'git') toGit({ selectedProj, projectList, displayError, setBlockui, gitconfigRef, gitVerRef, gitPathRef, gitBranchRef, selectedModuled: selectedModulelisted.length > 0 ? selectedModulelisted[0] : selectedModuled });
    }
    const validate = (arr) => {
        var err = false;
        arr.forEach((e) => {
            if (e.current) {
                e.current.style.borderColor = 'black'
                if (!e.current.value || e.current.value === 'def-option') {
                    e.current.style.borderColor = 'red'
                    err = true
                }
            }
        })
        return err
    }
    const clickSelectBox = () => {
        d3.select('#pasteImg').classed('active-map', false)
        d3.select('#copyImg').classed('active-map', false)
        d3.selectAll('.ct-node').classed('node-selected', false)
        dispatch(copyNodes({ nodes: [], links: [] }))
        dispatch(selectNodes({ nodes: [], links: [] }))
        dispatch(selectBoxState(!selectBox))
    }
    const clickCopyNodes = () => {
        if (d3.select('#pasteImg').classed('active-map')) {
            setMsg(MSG.MINDMAP.ERR_PASTEMAP_ACTIVE_COPY)
            return;
        }
        var val = copy({ ...selectNode }, copyNode)
        if (val) {
            d3.select('#copyImg').classed('active-map', true)
            dispatch(copyNodes(selectNode))
            dispatch(selectBoxState(false))
            dispatch(selectNodes({ nodes: [], links: [] }))
        }
    }

    const clickPasteNodes = () => {
        if (d3.select('#pasteImg').classed('active-map')) {
            //close paste
            dispatch(copyNodes({ nodes: [], links: [] }))
            d3.select('#pasteImg').classed('active-map', false)
            d3.selectAll('.ct-node').classed('node-selected', false)
            return;
        }
        if (!d3.select('#copyImg').classed('active-map')) {
            setMsg(MSG.MINDMAP.WARN_COPY_STEP_FIRST)
            return;
        }
        d3.select('#copyImg').classed('active-map', false)
        paste({ ...copyNode })
    }
    var projectList = Object.entries(prjList)
    const handleProjectSelecte = async (proj) => {
        // Code to check whether to reset the old test suite while changing project or not .
        var reqForOldModule = {
            tab: "createTab",
            projectid: initProj
            ,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: localStorage.getItem('OldModuleForReset')
        }


        var moduledataold = await getModules(reqForOldModule)
        if (userInfo?.username === moduledataold.currentlyInUse) {
            await updateTestSuiteInUseBy("Web", localStorage.getItem('OldModuleForReset'), localStorage.getItem('OldModuleForReset'), userInfo?.username, false, true)
        }
        var reqForNewModule = {
            tab: "createTab",
            projectid: proj,
            version: 0,
            cycId: null,
            modName: "",
            moduleid: null
        }


        var firstModld = await getModules(reqForNewModule)
        if (firstModld.length > 0) {
            var reqForFirstModule = {
                tab: "createTab",
                projectid: proj,
                version: 0,
                cycId: null,
                modName: "",
                moduleid: firstModld[0]?._id
            }
            var firstModDetails = await getModules(reqForFirstModule)


            if (!firstModDetails.currentlyInUse.length > 0)
                await updateTestSuiteInUseBy("Web", firstModld[0]._id, "123", userInfo?.username, true, false)



        }
        selectProj(proj)
    }
    const views = [
        { name: <div style={{ alignItems: 'center', display: 'flex',height:"7px" }}><img src="static/imgs/journeyViewIcon.svg" alt="modules" /><h5>Journey View</h5></div>, code: 'journeyView' },
        { name: <div style={{ alignItems: 'center', display: 'flex', paddingLeft: '4px',height:"7px" }}><img style={{ width: '25px', height: '38px' }} src="static/imgs/folderViewIcon.svg" alt="modules" /><h5 style={{ paddingLeft: '3px' }}>Folder View</h5></div>, code: 'folderView' },
        { name: <div style={{ alignItems: 'center', display: 'flex',height:"7px" }}><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div>, code: 'mindMapView' },
        { name: <div style={{ alignItems: 'center', display: 'flex', paddingLeft: '4px',height:"7px" }}><img style={{ width: '25px', height: '38px' }} src="static/imgs/tableViewIcon.svg" alt="modules" /><h5 style={{ paddingLeft: '3px' }}>Table View</h5></div>, code: 'tableView' },
    ];
    const GitOpp = [
        { name: <div style={{ alignItems: 'center', display: 'flex',height:"7px"  }}><img src="static/imgs/cloneIcon.svg" alt="modules" /><h5 style={{marginLeft:'0.9rem' }}>clone History</h5></div>, code: 'mindMapView' },
        { name: <div style={{ alignItems: 'center', display: 'flex',height:"7px"  }}><img src="static/imgs/commitIcon.svg" alt="modules" /><h5 style={{marginLeft:'0.9rem' }}>commit</h5></div>, code: 'journeyView' },
        { name: <div style={{ alignItems: 'center', display: 'flex',height:"7px"  }}><img src="static/imgs/versionHistoryIcon.svg" alt="modules" /><h5 style={{marginLeft:'0.9rem' }}>version History</h5></div>, code: 'folderView' },

    ];
    const handleViewsDropDown = (view) => {
        switch (view.value.code) {
            case 'journeyView':
                dispatch(TypeOfViewMap("journeyView"));
                break;
            case 'folderView':
                dispatch(TypeOfViewMap("folderView"));
                break;
            case 'tableView':
                dispatch(TypeOfViewMap("tableView"));
                break;
            case 'mindMapView':
                dispatch(TypeOfViewMap("mindMapView"));
                break;
            default:
                dispatch(TypeOfViewMap("mindMapView"));
                break;

        }

    }
    return (
        <Fragment>
            {exportBox ? <ModalContainer
                title='Export Modules'
                close={() => setExportBox(false)}
                footer={<Footer clickExport={clickExport} />}
                content={<Container isEndtoEnd={"endtoend"} gitconfigRef={gitconfigRef} gitBranchRef={gitBranchRef} gitVerRef={gitVerRef} gitPathRef={gitPathRef} fnameRef={fnameRef} ftypeRef={ftypeRef} modName isAssign={isAssign} />}
            /> : null}
            <div style={{ display: 'flex' }}>
                <div style={{ background: "white", width: '17rem' }}>
                    <label data-test="projectLabel" className='projectLabel'>Project:</label>
                    <select data-test="projectSelect" className='projectSelect' value={initProj} onChange={(e) => { handleProjectSelecte(e.target.value) }}>
                        {projectList.map((e, i) => <option value={e[1].id} key={i}>{e[1].name}</option>)}
                    </select>
                </div>
                <div className='toolbar__header'>
                    {/* <span data-test="headerMenu" className='toolbar__header-menus'>
                    <i className={"fa fa-crop fa-lg active-map"} title="Select" onClick={clickSelectBox}></i>
                    <i className="fa fa-files-o fa-lg" title="Copy selected map" id='copyImg' onClick={clickCopyNodes}></i>
                    <i className="fa fa-clipboard fa-lg" title="Paste map" id="pasteImg" onClick={clickPasteNodes}></i>
                </span> */}
                    <div data-test="headerMenu" className='toolbar__header-menus'>
                        <img className='am' src='static/imgs/minus-icon.svg' alt='minus' />
                        <div >40%</div>
                        <img className='am' src='static/imgs/add.svg' alt='add' />
                        {/* <img className='line' src='static/imgs/line.svg' alt='line'/> */}
                        {/* <div className="flex justify-content-center gap-2 text-500">
                        <label style={{position:'relative', top:'0.3rem',fontSize:'12px',cursor:'not-allowed'}} htmlFor='input-metakey'>Map View</label>
                        <InputSwitch style={{cursor:'not-allowed'}} disabled inputId="input-metakey" checked={checked} onChange={(e) => setChecked(e.value)} />
                        <label htmlFor="input-metakey" style={{position:'relative', top:'0.3rem',fontSize:'12px',marginRight:'0.8rem',cursor:'not-allowed'}}>Table View</label>
                    </div> */}
                        <img className='line' src='static/imgs/line.svg' alt='line' />
                    </div>
                    {/* Radio buttons for map views */}
                    <div className="card flex justify-content-center">
                        <Dropdown value={selectedView} onChange={(e) => { setSelectedView(e.value); handleViewsDropDown(e) }} options={views} optionLabel="name"
                            className="w-full md:w-12rem TypesOfViewsDrop" placeholder={<div style={{ alignItems: 'center', display: 'flex' }}><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div>}
                        />
                    </div>
                    <div className="card flex justify-content-center">
                        <Dropdown value={selectedGitOpp} onChange={(e) => { setSelectedGitOpp(e.value) }} options={GitOpp} optionLabel="name"
                            className="w-full md:w-13rem TypesOfViewsDrop" placeholder={<div style={{ alignItems: 'center', display: 'flex' }}><img src="static/imgs/folderViewIcon.svg" alt="modules" /><h5>select Git operation</h5></div>}
                        />
                    </div>
                    {/* <img  className='line' src='static/imgs/line.svg' alt='line'/> */}
                    {!isEnELoad ? <Fragment><Legends /></Fragment> : <Fragment><Legends isEnE={true} /> </Fragment>}
                </div>
            </div>
        </Fragment>
    )
}
const Container = ({ fnameRef, isEndtoEnd, ftypeRef, modName, isAssign, gitconfigRef, gitBranchRef, gitVerRef, gitPathRef }) => {
    const [expType, setExpType] = useState(undefined)
    const changeExport = (e) => {
        setExpType(e.target.value)
    }
    return (
        <div>
            <div className='export-row'>
                <label>Export As: </label>
                <select defaultValue={'def-option'} ref={ftypeRef} onChange={changeExport}>
                    <option value={'def-option'} disabled>Select Export Format</option>
                    {isAssign && <option value={'custom'}>Custom (.json)</option>}
                    {!isEndtoEnd &&
                        <>
                            <option value={'excel'}>Excel Workbook (.xlx,.xlsx)</option>
                            <option value={'git'}>Git (.mm)</option>
                            <option value={'json'}>MindMap (.mm)</option>
                        </>}
                </select>
            </div>
            {(expType === 'git') ?
                <Fragment>
                    <div className='export-row'>
                        <label>Git Configuration: </label>
                        <input onChange={(e) => e.target.value = e.target.value.replaceAll(" ", "")} placeholder={'Git configuration name'} ref={gitconfigRef} />
                    </div>
                    <div className='export-row'>
                        <label>Git Branch: </label>
                        <input onChange={(e) => e.target.value = e.target.value.replaceAll(" ", "")} placeholder={'Branch name'} ref={gitBranchRef} />
                    </div>
                    <div className='export-row'>
                        <label>Version: </label>
                        <input onChange={(e) => e.target.value = e.target.value.replaceAll(" ", "")} placeholder={'Version'} ref={gitVerRef} />
                    </div>
                    <div className='export-row'>
                        <label>Folder Path: </label>
                        <input placeholder={'Projectname/Modulename (optional)'} ref={gitPathRef} />
                    </div>
                </Fragment> : null
            }
            {(expType && expType !== 'git') ?
                <div className='export-row'>
                    <label>File Name: </label>
                    <input ref={fnameRef} defaultValue={modName} placeholder={'Enter file name'}></input>
                </div> : null
            }
        </div>
    )
}
const Footer = ({ clickExport }) => <div><button onClick={clickExport}>Export</button></div>
/*
    function : toJSON()
    Purpose : Exporting Module in json file
    param :
*/
const toJSON = async (module, fname, displayError, setBlockui) => {
    try {
        var result = await exportMindmap(Array.isArray(module) ? module : module._id)
        if (result.error) { displayError(result.error); return; }
        jsonDownload(fname + '.mm', JSON.stringify(result));
        setBlockui({ show: false, content: '' })
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    } catch (err) {
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}

const toExcel = async (projId, module, fname, displayError, setBlockui) => {
    try {
        var data = {
            "projectid": projId,
            "moduleid": module
        }
        var result = await exportToExcel(data)
        if (result.error) { displayError(result.error); return; }
        var file = new Blob([result], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var fileURL = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = fileURL;
        a.download = fname + '.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        setBlockui({ show: false, content: '' })
        setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
    } catch (err) {
        console.error(err)
        displayError(MSG.MINDMAP.ERR_EXPORT_MINDMAP)
    }
}
const toGit = async ({ projectList, displayError, setBlockui, gitconfigRef, gitVerRef, gitPathRef, gitBranchRef, selectedModuled, selectedProj }) => {
    var gitpath = gitPathRef.current.value;
    if (!gitpath) {
        gitpath = 'avoassuretest_artifacts/' + projectList[selectedProj].name + '/' + selectedModuled.name;
    }
    var res = await exportToGit({
        gitconfig: gitconfigRef.current.value,
        gitVersion: gitVerRef.current.value,
        gitFolderPath: gitpath,
        gitBranch: gitBranchRef.current.value,
        mindmapId: selectedModuled
    })
    if (res.error) { displayError(res.error); return; }
    setBlockui({ show: false })
    setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
}
const toCustom = async (selectedProj, selectedModuled, projectList, releaseRef, cycleRef, fname, displayError, setBlockui) => {
    try {
        var suiteDetailsTemplate = { "condition": 0, "dataparam": [""], "scenarioId": "", "scenarioName": "" };
        var moduleData = { "testsuiteName": "", "testsuiteId": "", "versionNumber": "", "appType": "", "domainName": "", "projectName": "", "projectId": "", "releaseId": "", "cycleName": "", "cycleId": "", "suiteDetails": [suiteDetailsTemplate] };
        var executionData = { "executionData": { "source": "api", "exectionMode": "serial", "executionEnv": "default", "browserType": ["1"], "integration": { "alm": { "url": "", "username": "", "password": "" }, "qtest": { "url": "", "username": "", "password": "", "qteststeps": "" }, "zephyr": { "url": "", "username": "", "password": "", "apitoken": "", "authtype": "" } }, "gitInfo": { "gitConfiguration": "", "gitbranch": "", "folderPath": "", "gitVersion": "" }, "batchInfo": [JSON.parse(JSON.stringify(moduleData))] } };
        var moduleInfo = { "batchInfo": [] };
        moduleData.appType = projectList[selectedProj].apptypeName;
        moduleData.domainName = projectList[selectedProj].domains;
        moduleData.projectName = projectList[selectedProj].name;
        moduleData.projectId = projectList[selectedProj].id;
        moduleData.releaseId = releaseRef.current.selectedOptions[0].innerText;
        moduleData.cycleName = cycleRef.current.selectedOptions[0].innerText;
        moduleData.cycleId = cycleRef.current.value;
        const reqObject = [{
            "releaseid": moduleData.releaseId,
            "cycleid": moduleData.cycleId,
            "testsuiteid": selectedModuled._id,
            "testsuitename": selectedModuled.name,
            "projectidts": moduleData.projectId
            // "versionnumber": parseFloat(version_num)
        }];
        var moduleObj = await readTestSuite_ICE(reqObject)
        if (moduleObj.error) { displayError(moduleObj.error); return; }
        moduleObj = moduleObj[selectedModuled._id];
        if (moduleObj && moduleObj.testsuiteid != null) {
            moduleData.testsuiteId = moduleObj.testsuiteid;
            moduleData.testsuiteName = moduleObj.testsuitename;
            moduleData.versionNumber = moduleObj.versionnumber;
            moduleData.suiteDetails = [];
            for (var j = 0; j < moduleObj.scenarioids.length; j++) {
                var s_data = JSON.parse(JSON.stringify(suiteDetailsTemplate));
                s_data.condition = moduleObj.condition[j];
                s_data.dataparam = [moduleObj.dataparam[j]];
                s_data.scenarioName = moduleObj.scenarionames[j];
                s_data.scenarioId = moduleObj.scenarioids[j];
                moduleData.suiteDetails.push(s_data);
            }
            moduleInfo.batchInfo.push(moduleData);
            jsonDownload(fname + '_moduleinfo.json', JSON.stringify(moduleInfo));
            jsonDownload(fname + '_executiondata.json', JSON.stringify(executionData));
            setBlockui({ show: false, content: '' })
            setMsg(MSG.MINDMAP.SUCC_DATA_EXPORTED)
        } else {
            displayError(MSG.MINDMAP.ERR_EXPORT_DATA);
        }
    } catch (err) {
        displayError(MSG.MINDMAP.ERR_EXPORT_DATA);
        console.error(err);
    }
}

/*
function : jsonDownload()
Purpose : download json file
*/

function jsonDownload(filename, responseData) {
    var blob = new Blob([responseData], { type: 'text/json' });
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
}

//check for paste errors and paste action
const paste = (copyNode) => {
    var dNodes_c = copyNode.nodes
    var module_check_flag = false
    if (dNodes_c.length === 0) {
        setMsg(MSG.MINDMAP.ERR_NOTHING_PASTE)
        return false;
    }
    d3.select('#pasteImg').classed('active-map', true)
    d3.selectAll('.ct-node').classed('node-selected', false)
    module_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (module_check_flag) {
        //highlight module
        d3.selectAll('[data-nodetype=modules]').classed('node-selected', true);
    } else {
        //highlight scenarios
        d3.selectAll('[data-nodetype=scenarios]').classed('node-selected', true);
    }
}

//check for dangling errors and and copy action
const copy = (selectNode, copyNode) => {
    var dNodes_c = selectNode.nodes
    var dLinks_c = selectNode.links
    var dangling_screen_check_flag = false
    var dangling_screen;
    var dangling_screen_flag = false
    var ds_list = [];
    if (dNodes_c.length === 0) {
        if (copyNode.nodes.length > 0) {
            setMsg(MSG.MINDMAP.WARN_CLICK_PASTEMAP)
            return false
        }
        setMsg(MSG.MINDMAP.ERR_NOTHING_COPY)
        return false;
    }
    dangling_screen_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (dangling_screen_check_flag) {
        dNodes_c.forEach((e) => {
            if (e.type === 'screens') {
                dangling_screen = true;
                dLinks_c.forEach((f) => {
                    if (parseFloat(e.id) === parseFloat(f.target.id))
                        dangling_screen = false;
                })
                if (dangling_screen) {
                    dangling_screen_flag = true;
                    ds_list.push(e);
                }
            }
        })
    }
    if (dangling_screen_flag) {
        setMsg(MSG.MINDMAP.ERR_DANGLING_SCREEN)
        ds_list.forEach((e) => {
            d3.select('#node_' + e.id).classed('node-error', true);
        });
        return false;
    }
    setMsg(MSG.MINDMAP.SUCC_DATA_COPIED)
    return true;
}
Toolbarmenu.propTypes = {
    setBlockui: PropTypes.func,
    displayError: PropTypes.func
}
export default Toolbarmenu;



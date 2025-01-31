import React, { Fragment, useEffect, useRef, useState } from 'react';
import { getProjectList, getModules, getScreens } from '../api';
import { gitSaveConfig } from '../../admin/api';
import { useDispatch, useSelector } from 'react-redux';
import SaveMapButton from '../components/SaveMapButton';
import Toolbarmenu from '../components/ToolbarMenu';
import ModuleListSidePanel from '../components/ModuleListSidePanel';
import CanvasNew from './CanvasNew';
import FolderView from './FolderView';
import ExportMapButton from '../components/ExportMapButton';
import { ClickFullScreen, ClickSwitchLayout, parseProjList } from './MindmapUtils';
import { ScreenOverlay, setMsg } from '../../global';
import '../styles/CreateNew.scss';
import DeleteScenarioPopUp from '../components/DeleteScenarioPopup';
import CanvasEnE from './CanvasEnE';
import { Navigate } from 'react-router-dom';
import { projectList, selectedProj, screenData, moduleList, AnalyzeScenario, TypeOfViewMap, SetCurrentId,dontShowFirstModule, selectedModuleReducer} from '../designSlice';
import ModuleListDrop from '../components/ModuleListDrop';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import Legends from '../components/Legends';
import GitDropdown from '../components/GitDropdown';
/*Component CreateNew
use: renders create New Mindmap page
*/
const CreateNew = ({ importRedirect }) => {
    const [redirectTo, setRedirectTo] = useState("");
    const dispatch = useDispatch();
    const toast = useRef();
    const [blockui, setBlockui] = useState({ show: false })
    const [fullScreen, setFullScreen] = useState(false)
    const [verticalLayout, setVerticalLayout] = useState(true)
    const [loading, setLoading] = useState(true)
    const [info, setInfo] = useState(undefined)
    const moduleSelect = useSelector(state => state.design.selectedModule)
    const selectProj = useSelector(state => state.design.selectedProj);
    const analyzeScenario = useSelector(state => state.design.analyzeScenario);
    const tagtestcase = useSelector(state => state.design.tagtestcase);
    const prjList = useSelector(state => state.design.projectList)
    const initEnEProj = useSelector(state => state.design.initEnEProj)
    const moduleNewNode = useSelector(state=>state.design.moduleNewNodeAdd)
    const [delSnrWarnPop, setDelSnrWarnPop] = useState(false)
    const [isCreateE2E, setIsCreateE2E] = useState(initEnEProj && initEnEProj.isE2ECreate ? true : false)
    const isEnELoad = useSelector(state => state.design.isEnELoad);
    // const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    // let Proj = reduxDefaultselectedProject;
    const Proj = JSON.parse(localStorage.getItem('DefaultProject'));
    // if (localStorageDefaultProject) {
    //     Proj = JSON.parse(localStorageDefaultProject);
    // }
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    const handleTypeOfViewMap = useSelector(state=>state.design.typeOfViewMap)

    const [configurationName, setConfigurationName] = useState('');

    const [selectedView, setSelectedView] = useState({ code: 'mindMapView', name: <div><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div> });
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
                dispatch(dontShowFirstModule(true))
                dispatch(SetCurrentId(moduleSelect._id))
                break;
            default:
                dispatch(TypeOfViewMap("mindMapView"));
                dispatch(dontShowFirstModule(true))
                dispatch(SetCurrentId(moduleSelect._id))
                break;
        }

    }
    useEffect( ()=>{
        if(Object.keys(moduleSelect).length > 0){
        (async()=>{
            var req={
                tab:"createdTab",
                projectid:Proj.projectId,
                version:0,
                cycId: null,
                modName:"",
                moduleid:moduleSelect._id?moduleSelect._id:moduleSelect[0]._id
            }
            const data = await getModules(req) 
            if(data.error)return;
            else dispatch(selectedModuleReducer(data))
        })()}
    },[handleTypeOfViewMap])

    useEffect(() => {
            try{
                (async() => {
                    const apiPayloadData = {
                        param : "verify",
                        action : '',
                        userId : userInfo.user_id,
                        projectId : Proj.projectId
                    }
                    const data = await gitSaveConfig(apiPayloadData);
            
                    if (data?.error) { toastError(data.error); return; }
                    if (data === "bit") setConfigurationName(data)
                    else if (data === "git") setConfigurationName(data)
                    else setConfigurationName(data)
                    })()
            } catch(error){
                toastError("Something went wrong")
            }
    },[Proj.projectId])

    const views = [
        { name: <div style={{ alignItems: 'center', display: 'flex', height: "15px" }}><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div>, code: 'mindMapView' },
        { name: <div style={{ alignItems: 'center', display: 'flex', height: "15px" }}><img src="static/imgs/journeyViewIcon.svg" alt="modules" /><h5>Journey View</h5></div>, code: 'journeyView' },
        { name: <div style={{ alignItems: 'center', display: 'flex', paddingLeft: '4px', height: "15px" }}><img style={{ width: '25px', height: '38px' }} src="static/imgs/folderViewIcon.svg" alt="modules" /><h5 style={{ paddingLeft: '3px' }}>Folder View</h5></div>, code: 'folderView', disabled: true },
        { name: <div style={{ alignItems: 'center', display: 'flex', paddingLeft: '4px', height: "15px" }}><img style={{ width: '25px', height: '38px' }} src="static/imgs/tableViewIcon.svg" alt="modules" /><h5 style={{ paddingLeft: '3px' }}>Table View</h5></div>, code: 'tableView', disabled: true },
    ];

    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;
    
    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: JSON.stringify(erroMessage), life: 5000 });
    }
    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: JSON.stringify(successMessage), life: 5000 });
    }
    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'warn', summary: 'Warning', detail: JSON.stringify(warnMessage), life: 5000 });
    }
    // useEffect(()=>{
    //   if(selectProj && prjList[selectProj]){
    //       var dict= {
    //           "AppType": prjList[selectProj].apptypeName,
    //           "Domain": prjList[selectProj].domains,
    //           "Project":prjList[selectProj].name
    //       }
    //       setInfo(dict);
    //       // dispatch({type:actionTypes.APP_TYPE_FOR_PROJECT,payload:prjList[selectProj].apptypeName})
    //   }
    // },[selectProj,prjList])
    // useEffect(() => {
    //   setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
    // },[initEnEProj]);
    useEffect(() => {
        (async () => {
            setBlockui({ show: true, content: 'Loading modules ...' })
            var res = await getProjectList()
            if (res.error) { displayError(res.error); return; }
            var data = parseProjList(res)
            dispatch(projectList(data))
            if (!importRedirect) {
                dispatch(selectedProj(selectProj ? selectProj : res.projectId[0]))
                var req = {
                    tab: "endToend" || "tabCreate",
                    projectid: Proj ? Proj.projectId : res.projectId[0],
                    version: 0,
                    cycId: null,
                    modName: "",
                    moduleid: null
                }
                var moduledata = await getModules(req);
                if (moduledata.error) { displayError(moduledata.error); return; }
                var screendata = await getScreens(res.projectId[0])
                if (screendata.error) { displayError(screendata.error); return; }
                dispatch(screenData(screendata))
                dispatch(moduleList(moduledata))
            }
            setBlockui({ show: false, content: '' })
            setLoading(false)
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    useEffect(() => {
        if (!analyzeScenario) {
            (async () => {
                setBlockui({ show: true, content: 'Loading modules ...' })
                var res = await getProjectList()
                if (res.error) { displayError(res.error); return; }
                var data = parseProjList(res)
                dispatch(projectList(data))
                if (!importRedirect) {
                    dispatch(selectedProj(selectProj ? selectProj : res.projectId[0]))
                    var req = {
                        tab: "endToend" || "tabCreate",
                        projectid: Proj ? Proj.projectId : res.projectId[0],
                        version: 0,
                        cycId: null,
                        modName: "",
                        moduleid: null
                    }
                    var moduledata = await getModules(req);
                    if (moduledata.error) { displayError(moduledata.error); return; }
                    var screendata = await getScreens(Proj ? Proj.projectId : res.projectId[0])
                    if (screendata.error) { displayError(screendata.error); return; }
                    dispatch(screenData(screendata))
                    dispatch(moduleList(moduledata))
                }
                setBlockui({ show: false, content: '' })
                setLoading(false)
            })()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analyzeScenario])
    useEffect(() => {
        if (!tagtestcase) {
            (async () => {
                setBlockui({ show: true, content: 'Loading modules ...' })
                var res = await getProjectList()
                if (res.error) { displayError(res.error); return; }
                var data = parseProjList(res)
                dispatch(projectList(data))
                if (!importRedirect) {
                    dispatch(selectedProj(selectProj ? selectProj : res.projectId[0]))
                    var req = {
                        tab: "endToend" || "tabCreate",
                        projectid: Proj ? Proj.projectId : res.projectId[0],
                        version: 0,
                        cycId: null,
                        modName: "",
                        moduleid: null
                    }
                    var moduledata = await getModules(req);
                    if (moduledata.error) { displayError(moduledata.error); return; }
                    var screendata = await getScreens(Proj ? Proj.projectId : res.projectId[0])
                    if (screendata.error) { displayError(screendata.error); return; }
                    dispatch(screenData(screendata))
                    dispatch(moduleList(moduledata))
                }
                setBlockui({ show: false, content: '' })
                setLoading(false)
            })()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tagtestcase])
    const displayError = (error) => {
        setBlockui({ show: false })
        setLoading(false)
        toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 2000 })
    }
    const handleViews = (data) =>{
        if(moduleNewNode !== false){
            toast.current.show({severity:'warn', summary:'Warn', detail:"Save the flow to change the view or remove newly added nodes."})
        }
        else{
            setSelectedView(data.value)
            handleViewsDropDown(data)
        }
    }
    const TopDropdowns = () => {
        return (
            <div className={`${handleTypeOfViewMap ==='folderView' ? "canvas_topbar_in_folderview": "canvas_topbar"}`}>
                            <div className='mp__toolbar__container '>
                                <div className="mr-3 ml-5">
                                    <label style={{position:'relative', bottom:"1.3vh"}} htmlFor='views'>View: </label>
                                    <Dropdown 
                                        id="views"
                                        className={'w-full md:w-12rem p-inputtext-sm'} 
                                        value={selectedView}
                                        onChange={(e) => handleViews(e) }
                                        options={views} 
                                        optionLabel="name"
                                        style={{height:'2rem'}}
                                        placeholder={<div style={{display:"flex", alignItems:"center", height:"1rem", position:'relative', bottom:'0.2rem'}}><img src="static/imgs/treeViewIcon.svg" alt="modules" /><h5>Tree View</h5></div>}
                                    />                                    
                                </div>
                                <div className='git_configuration_dropdown'>
                                    <GitDropdown
                                            toastError={toastError}
                                            toastSuccess={toastSuccess}
                                            toastWarn={toastWarn}
                                            appType={Proj.appType}
                                            projectName={Proj.projectName}
                                            projectId={Proj.projectId}
                                            userId={userInfo.user_id}
                                            toast={toast}
                                            configurationName={configurationName}
                                    />
                                </div>
                                {!isEnELoad ? <Fragment><Legends /></Fragment> : <Fragment><Legends isEnE={true} /> </Fragment>}
                            </div>
                        </div>
        )
    }
    return (
        <>
            {/* { redirectTo && <Navigate data-test="redirectTo" to={redirectTo} />} */}
            <Fragment>
                <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
                {(blockui.show) ? <ScreenOverlay content={blockui.content} /> : null}
                {(delSnrWarnPop) ? <DeleteScenarioPopUp setBlockui={setBlockui} setDelSnrWarnPop={setDelSnrWarnPop} displayError={displayError} /> : null}
                {(!loading) ?
                    <div className='mp__canvas_container'>
                        {(handleTypeOfViewMap ==='folderView') && <div className='folderViewMain'>
                            <div className='flex flex-row'>
                                <Toolbarmenu setBlockui={setBlockui} displayError={displayError}/> 
                                <TopDropdowns handleTypeOfViewMap = {handleTypeOfViewMap}/> 
                            </div>
                            <FolderView setBlockui={setBlockui}/></div>}
                        {(handleTypeOfViewMap ==='tableView') && <h1>hello i am Table view</h1>}
                        
                        {(handleTypeOfViewMap === "mindMapView" || handleTypeOfViewMap ==='journeyView') && <>
                        <div style={{ display: 'flex', height: '89vh', width: 'auto' }}>
                            <ModuleListDrop setBlockui={setBlockui} appType={Proj.appType} module={moduleSelect} />  
                        </div>
                            <TopDropdowns handleTypeOfViewMap = {handleTypeOfViewMap}/>
                            <div id='mp__canvas' className='mp__canvas'>
                                {!isEnELoad ? ((Object.keys(moduleSelect).length > 0) ?
                                    <CanvasNew setBlockui={setBlockui} module={moduleSelect} verticalLayout={handleTypeOfViewMap ==='journeyView'?false:verticalLayout} setDelSnrWarnPop={setDelSnrWarnPop} displayError={displayError} toast={toast} appType={Proj.appType} />
                                    : <Fragment>
                                        <ExportMapButton />
                                        <SaveMapButton disabled={true} />
                                    </Fragment>
                                )
                                    : ((Object.keys(moduleSelect).length > 0) ?
                                        <CanvasEnE setBlockui={setBlockui} module={moduleSelect} verticalLayout={verticalLayout} displayError={displayError} />
                                        : <Fragment>
                                            <SaveMapButton disabled={true} />
                                        </Fragment>)}
                            </div>
                        </>}
            </div> : null
                }
            </Fragment>
        </>
    );
}
export default CreateNew;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {saveMindmap,getModules,getScreens,updateTestSuiteInUseBy} from '../api';
import * as d3 from 'd3';
import { saveMindMap, toDeleteScenarios, moduleList, selectedModuleReducer,dontShowFirstModule, SetCurrentId } from '../designSlice';
import '../styles/SaveMapButton.scss'
import {restructureData} from '../containers/MindmapUtilsForOthersView';
import { VARIANT, Messages as MSG, setMsg } from '../../global';

/*Component SaveMapButton
  use: renders save button below canvas on click trigers save node
  for assingn send isAssign={true}
  for end send isEnE={true}
  props.createnew is to auto save imported mindmap
*/

const SaveMapButton = (props) => {
    const dispatch = useDispatch()
    const deletedNoded = useSelector(state=>state.design.deletedNodes)
    const unassignTask = useSelector(state=>state.design.unassignTask)
    const projId = useSelector(state=>state.design.selectedProj)
    const initEnEProj = useSelector(state=>state.design.initEnEProj)
    const projectList = useSelector(state=>state.design.projectList)
    const moduledata = useSelector(state=>state.design.moduleList)
    const verticalLayout= props.verticalLayout
    const savedList = useSelector(state=>state.design.savedList)
    const typeOfView = useSelector(state=>state.design.typeOfViewMap)
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if(!userInfo) userInfo = userInfoFromRedux; 
    else userInfo = userInfo ;
    useEffect(()=>{
        if(props.createnew==='save'||props.createnew==='autosave')clickSave()      
          // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.createnew])
    const clickSave = ()=>{
        saveNode(props.setBlockui,props.dNodes,projId,props.cycId,deletedNoded,unassignTask,dispatch,props.isEnE,props.isAssign,projectList,initEnEProj? initEnEProj.proj:initEnEProj,moduledata,verticalLayout,props.setDelSnrWarnPop,props.createnew,savedList,props.toast,userInfo,typeOfView,props.dNodesFolder)
    }
    return(
        <svg data-test="saveSVG" className={"ct-actionBox"+(props.disabled?" disableButton":"")} id="ct-save" onClick={clickSave}>
            <g id="ct-saveAction" className="ct-actionButton">
                <rect x="0" y="0" rx="12" ry="12" width="80px" height="25px"></rect>
                <text x="23" y="18">Save</text>
            </g>
        </svg>
    )
}

     
//mindmap save funtion
const saveNode = async(setBlockui,dNodes,projId,cycId,deletedNoded,unassignTask,dispatch,isEnE,isAssign,projectList,initEnEProj,moduledata,verticalLayout,setDelSnrWarnPop,createnew,savedList,toast,userInfo,typeOfView,dNodesFolder)=>{
    var tab = "endToend"
    var selectedProject;
    var error = !1
    var mapData = []
    var flag = 10 
    var temp_data = [];
    var counter = {};
    var displayError = (error) => {
        setBlockui({show:false});
        if(error){
            toast.current.show({severity:(error.VARIANT || VARIANT.ERROR), summary: (error.VARIANT || VARIANT.ERROR), detail:(error.CONTENT || error),life:1000})
        }else{
            toast.current.show({severity:(error.VARIANT || VARIANT.ERROR), summary: (error.VARIANT || VARIANT.ERROR), detail:MSG.MINDMAP.ERR_SAVE.CONTENT,life:1000})
        }
        // setMsg(MSG.CUSTOM(((error)?( error.CONTENT || error ):MSG.MINDMAP.ERR_SAVE.CONTENT),error.VARIANT || VARIANT.ERROR))
        return;
    }
    d3.select('#pasteImg').classed('active-map',false)
    d3.select('#copyImg').classed('active-map',false)
    d3.selectAll('.ct-node').classed('node-selected',false)   
    if (d3.select('#ct-save').classed('disableButton')) return;
    if (typeOfView !== "folderView"){
    var namelist = dNodes.map((e)=>{
        if(e._id && e.type === 'screens' && e.state !== "deleted")return e.name;
        return undefined;
    })
    var duplicateNode = dNodes.every((e,i)=>{
        if(e._id && e.type === 'screens' && e.state!== "deleted"){
            return namelist.indexOf(e.name) === i || dNodes[namelist.indexOf(e.name)]._id === e._id
        } return true;
    })
    if(!duplicateNode){
        toast.current.show({severity:'warn', summary:'Warning', detail:MSG.MINDMAP.WARN_DUPLICATE_SCREEN_NAME.CONTENT, life:1000})
        return;
    }}
    setBlockui({show:true,content:'Saving flow! Please wait...'})
    var data1;
    if( typeOfView === 'journeyView' && typeOfView !== "folderView"){
        data1 = restructureData(dNodes[0])
    }
    // else if(typeOfView === "folderView"){
    //     dNodes[0]= dNodesFolder;
    // }
    
    else if (typeOfView === "mindMapView") {dNodes.forEach((e, i)=>{
        if (i === 0) return;
        temp_data[i] = {
            idx: i,
            x: e.x,
            y: e.y,
            type: e.type
        };
    });
    if (verticalLayout) {
        temp_data.sort((a, b)=>a.x - b.x);
    } else {
        temp_data.sort((a, b)=>a.y - b.y);
    }
    temp_data.forEach((e)=>{
        // var key_1=undefined;
        if(dNodes[e.idx].parent === null) return;
        var key_1= dNodes[e.idx].parent.id;
        var key=e.type+'_'+key_1;
        if(counter[key] === undefined)  counter[key]=1;
        if (dNodes[e.idx].childIndex !== counter[key]) {
            dNodes[e.idx].childIndex = counter[key];
            dNodes[e.idx].cidxch = 'true'; // child index updated
        }
        if(dNodes[e.idx].type === 'scenarios' && dNodes[e.idx].state !== "created"){
            for(let s = 0;s<dNodes[0].children.length;s++){
                if(dNodes[0].children[s].id === dNodes[e.idx].id){
                    dNodes[0].children[s].childIndex = counter[key];
                    dNodes[0].children[s].cidxch = 'true';
                }
            }
        }
        else if(dNodes[e.idx].type === 'screens'){
            for(let i = 0;i<dNodes[0].children.length;i++){
                if(dNodes[0].children[i].id === dNodes[e.idx].parent.id){
                    for(let j = 0; j<dNodes[0].children[i].children.length;j++){
                        if(dNodes[0].children[i].children[j].id === dNodes[e.idx].id){
                            dNodes[0].children[i].children[j].childIndex = counter[key];
                            dNodes[0].children[i].children[j].cidxch = 'true';
                        }
                    }
                }
            }
        }else if (dNodes[e.idx].type === 'testcases'){
            for(let k = 0;k<dNodes[0].children.length;k++){
                for(let m = 0; m<dNodes[0].children[k].children.length;m++){
                    if(dNodes[0].children[k].children[m].id === dNodes[e.idx].parent.id){
                        for(let n = 0; n<dNodes[0].children[k].children[m].children.length;n++){
                            if(dNodes[0].children[k].children[m].children[n].id === dNodes[e.idx].id){
                                dNodes[0].children[k].children[m].children[n].childIndex = counter[key];
                                dNodes[0].children[k].children[m].children[n].cidxch = 'true';
                            }
                        }
                    }
                }
            }
        }
        counter[key] = counter[key] + 1;
    })}

    // typeOfView !== "mindMapView"?treeIterator(mapData, props.dNodesFolder,error):treeIterator(mapData, dNodes[0], error);
    switch (typeOfView) {
        case "journeyView":
            treeIterator(mapData, data1, error)
            break;
        case "folderView":
            treeIterator(mapData, dNodesFolder, error)
            break;
        default:
            treeIterator(mapData, dNodes[0], error)
    }
    // console.log("mapdata",mapData)
    var data = {
        write: flag,
        map: mapData,
        deletednode: deletedNoded,
        unassignTask: [],
        prjId: projId,
        cycId:cycId,
        createdthrough: "Web"
    }
    if(isEnE){
        tab = "endToend"
        data.action = '/saveEndtoEndData'
        mapData.some((d)=>{
            if (d.type === 'endtoend') {
                selectedProject = d.projectID;
                return true;
            }
            return false;
        });
        if (selectedProject && selectedProject !== projId) {
            displayError({VARIANT:VARIANT.WARNING, CONTENT:"Module belongs to project: " +projectList[selectedProject].name+". Please go back to the same project and Save"});
            return;
        }
        if(!selectedProject && initEnEProj !== projId){
            displayError({VARIANT:VARIANT.WARNING, CONTENT:"Module belongs to project: " +projectList[initEnEProj].name+". Please go back to the same project and Save"});
            return;
        }
    }
    if(isAssign){
        tab = "tabAssign"
        // if (dNodes[0].type == 'endtoend') {
        //     cur_module = 'end_to_end';
        //     error = false;
        // } else {
        //     //Part of Issue 1685
        //     cur_module = "tabAssign"
        // }
        data = {
            ...data,
            tab : "tabAssign",
            cycId:cycId,
            write : 30,
            unassignTask:unassignTask,
            sendNotify: {} //{Execute Batch: "priyanka.r", Execute Scenario: "priyanka.r"}
        }
    }
    var result = await saveMindmap(data)
    if(result.error){displayError(result.error);return}
    var modId
    if(result.scenarioInfo)
        modId=result.currentmoduleid
    else
        modId = result
    var moduleselected = await getModules({modName:null,cycId:cycId?cycId:null,"tab":tab,"projectid":projId,"moduleid":modId})
    dispatch(SetCurrentId(modId))
    await updateTestSuiteInUseBy("Web",modId,modId,userInfo?.username,true,false)

    if(moduleselected.error){displayError(moduleselected.error);return}
    var screendata = await getScreens(projId)
    if(screendata.error){displayError(screendata.error);return}
    dispatch(saveMindMap({screendata,moduledata,moduleselected}))
    // if(!savedList){ dispatch({type:actionTypes.SELECT_MODULE,payload:moduleselected})}
    setBlockui({show:false});
    // if(createnew!=='autosave'){isAssign?toast.current.show({severity:'success', summary:"Success", detail:MSG.MINDMAP.SUCC_TASK_SAVE.CONTENT, life:2000}):toast.current.show({severity:'success', summary:"Success", detail:MSG.MINDMAP.SUCC_DATA_SAVE.CONTENT,life:2000})}
    if(result.scenarioInfo){
        dispatch(toDeleteScenarios(result.scenarioInfo))
        setDelSnrWarnPop(true);
    }
    var req={
        tab:"endToend" && "createTab",
        projectid:projId?projId:"",
        version:0,
        cycId: null,
        modName:"",
        moduleid:null
    }
    var moduledata = await getModules(req);
    // dispatch(moduleList(moduledata))
    if(savedList){
        dispatch(dontShowFirstModule(true))
        dispatch(moduleList(moduledata))
        dispatch(selectedModuleReducer(moduleselected))
    }
    return;

}

const treeIterator = (c, d, e) =>{
    if (c !== undefined) {
        const obj = {
            projectID: d.projectID,
            id: d.id,
            childIndex: d.childIndex,
            _id: (d._id) ? d._id : null,
            oid: (d.oid) ? d.oid : null,
            name: d.name,
            type: d.type,
            pid: (d.parent) ? d.parent.id : null,
            pid_c: (d.parent) ? d.parent.id_c : null,
            task: (d.task) ? d.task : null,
            renamed: (d.rnm) ? d.rnm : !1,
            orig_name: (d.original_name) ? d.original_name : null,
            taskexists: (d.taskexists) ? d.taskexists : null,
            state: (d.state) ? d.state : "created",
            cidxch: (d.cidxch) ? d.cidxch : null // childindex changed
        };
        if (d.type === "scenarios") obj.tag = d.tag;
        if (d.type === 'testcases') obj.screenname = d?.parent?.name; // **Impact check**
        c.push(obj);
    }
    if (d.children && d.children.length > 0) d.children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d._children && d._children.length > 0) d._children.forEach(function(t) {
        e = treeIterator(c, t, e);
    });
    else if (d.type !== 'testcases') return !0;
    return e;
};

export default SaveMapButton
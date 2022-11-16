// import React ,  { Fragment, useEffect, useState } from 'react';
// import { getProjectList, getModules } from '../api';
// import { useDispatch, useSelector} from 'react-redux';
// import { ScreenOverlay, setMsg, ReferenceBar} from '../../global';
// import { ClickFullScreen , parseProjList, ClickSwitchLayout} from './MindmapUtils';
// import  ToolbarMenuEnE from '../components/ToolbarMenuEnE';
// import CanvasEnE from './CanvasEnE';
// import SaveMapButton from '../components/SaveMapButton';
// import Legends from '../components/Legends';
// import * as actionTypes from '../state/action';
// import '../styles/CreateEnE.scss';


// /*Component CreateEnE
//   use: renders create end to end Mindmap page
// */
// const CreateEnE = () =>{
//     const dispatch = useDispatch()
//     const [blockui,setBlockui] = useState({show:false})
//     const [fullScreen,setFullScreen] = useState(false)
//     const [verticalLayout,setVerticalLayout] = useState(false)
//     const [info,setInfo] = useState(undefined)
//     const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
//     const selectProj = useSelector(state=>state.mindmap.selectedProj)
//     const prjList = useSelector(state=>state.mindmap.projectList)
  
//     useEffect(()=>{
//       if(selectProj && prjList[selectProj]){
//           var dict= {
//               "AppType": prjList[selectProj].apptypeName,
//               "Domain": prjList[selectProj].domains,
//               "Project":prjList[selectProj].name
//           }
//           setInfo(dict)
//       }
//     },[selectProj,prjList])

//     useEffect(()=>{(async()=>{
//         setBlockui({show:true,content:'Loading modules ...'})
//         var res = await getProjectList()
//         if(res.error){displayError(res.error);return;}
//         var data = parseProjList(res)
//         dispatch({type:actionTypes.UPDATE_PROJECTLIST,payload:data})
//         dispatch({type:actionTypes.SELECT_PROJECT,payload:res.projectId[0]}) 
//         var moduledata = await getModules({"tab":"endToend","projectid":res.projectId[0],"moduleid":null})
//         if(moduledata.error){displayError(moduledata.error);return;}
//         dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
//         dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
//         setBlockui({show:false})
//         })()
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     },[])
//     const displayError = (error) =>{
//         setBlockui({show:false})
//         setMsg(error)
//     }
//     return(
//     <Fragment>
//         {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
//         <div id='ene' className='mp__canvas_container'>
//             <ToolbarMenuEnE setBlockui={setBlockui} />
//             <div id='mp__canvas' className='mp__canvas'>
//                 {(Object.keys(moduleSelect).length>0)?<CanvasEnE setBlockui={setBlockui} module={moduleSelect} verticalLayout={verticalLayout}/>
//                 :<Fragment>
//                     <SaveMapButton disabled={true}/>
//                     <Legends isEnE={true}/>
//                 </Fragment>}
//             </div>
//         </div>
//         <ReferenceBar taskTop={true} taskInfo={info} collapsible={true} collapse={true}>
//             <div className="ic_box" title="SwitchLayout" >
//                 <img alt={"Switch Layout"} onClick={()=>ClickSwitchLayout(verticalLayout,setVerticalLayout,moduleSelect,setBlockui,dispatch)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " + (verticalLayout?"active_rb_thumb ":"")} src="static/imgs/switch.png"/>
//                 <span className="rb_box_title">Switch</span><span className="rb_box_title">Layout</span>
//             </div>
//             <div className="ic_box" title="Full Screen" >
//                 <img alt={"Full Screen"} onClick={()=>ClickFullScreen(setFullScreen)} style={{height: '55px'}} className={"rb__ic-task thumb__ic " +(fullScreen?"active_rb_thumb":"")} src="static/imgs/fscr.png"/>
//                 <span className="rb_box_title">Full Screen</span>
//             </div>
//         </ReferenceBar>  
//     </Fragment>
//     )
// }

// export default CreateEnE;
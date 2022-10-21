import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules}  from '../api'
import {ScrollBar,ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import '../styles/ModuleListDrop.scss'
import {IconDropdown} from '@avo/designcomponents';


// import CreateOptions from '../components/CreateOptions.js';
// import ImportMindmap from './ImportMindmap'
// import MindmapHome from '../containers/MindmapHome'
/*Component ModuleListDrop
  use: renders 
  props: 
    setoptions from mindmapHome.js 
*/
// this code is used for drop down of modules...
const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const moduleSelectlist = useSelector(state=>state.mindmap.selectedModulelist)
    const [moddrop,setModdrop]=useState(true)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const [selectedModuleList,setSelectedModuleList] = useState([]);
    const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [modlist,setModList] = useState(moduleList)
    const SearchInp = useRef()
    const SearchMdInp = useRef()
    const [modE2Elist, setModE2EList] = useState(moduleList)
    
    // useEffect(() => {
    //     (async () => {
    //         console.log('abc');
    //         var req={
    //             tab:"endToend",
    //             projectid:proj,
    //             version:0,
    //             cycId: null,
    //             modName:"",
    //             moduleid:null
    //         }
    //         var res = await getModules(req)
    //         if(res.error){displayError(res.error);return}
    //         if(isAssign && res.completeFlow === false){
    //             displayError(MSG.MINDMAP.WARN_SELECT_COMPLETE_FLOW)
    //             return;
    //         }
    //         dispatch({type:actionTypes.SELECT_MODULE,payload:res})
    //     })()
        
    // }, []);

    const selectModule = (e) => {
        var modID = e.target.getAttribute("value")
        var type = e.target.getAttribute("type")
        var name = e.target.getAttribute("name")
        if(e.target.type=='checkbox'){
            let selectedModList = [];
            if(moduleSelectlist.length>0){
                selectedModList=moduleSelectlist;                
            }
            if(e.target.checked){
                if(selectedModList.indexOf(modID)==-1){
                    selectedModList.push(modID);
                }
            }else{
                selectedModList = selectedModList.filter(item => item !== modID)
            }
            //loadModule(selectedModList);
           /*  var req={
                tab:"tabCreate",
                projectid:proj,
                version:0,
                cycId: null,
                // modName:"",
                moduleid:selectedModList
            }     
            var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        if(isAssign && res.completeFlow === false){
            displayError(MSG.MINDMAP.WARN_SELECT_COMPLETE_FLOW)
            return;
        }   */    
            dispatch({type:actionTypes.SELECT_MODULELIST,payload:selectedModList})
            // d3.select('#pasteImg').classed('active-map',false)
            // d3.select('#copyImg').classed('active-map',false)
            // d3.selectAll('.ct-node').classed('node-selected',false)
            return;
        }
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
            return;
        }else{
            setWarning(modID)
        }
    }
    const selectModuleChkBox = (e) => {

    }
    const loadModule = async(modID) =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        setModdrop(false)
        setWarning(false)
        setLoading(true)
        // var req={
        //     tab:"tabCreate",
        //     projectid:proj,
        //     version:0,
        //     cycId: null,
        //     // modName:"",
        //     moduleid:[modID]
        // }
        // if(isAssign){
        //     req.tab = "tabAssign"
        //     req.cycId = props.cycleRef.current?props.cycleRef.current.value: ""
        // }
        console.log('abc');
        var req={
            tab:"endToend",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        if(isAssign && res.completeFlow === false){
            displayError(MSG.MINDMAP.WARN_SELECT_COMPLETE_FLOW)
            return;
        }
        dispatch({type:actionTypes.SELECT_MODULE,payload:res})
        setLoading(false)
    }
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>(e.type === 'basic' && (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1) || e.type === 'endtoend'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    // E2E search button
    const searchModule_E2E = (val) =>{
        var initmodule = modE2Elist
        if(!initmodule){
            initmodule = moduleList
            setModE2EList(moduleList)
        }
        var filter = initmodule.filter((e)=>(e.type==='endtoend'&&(e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)||e.type==='basic'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    const setOptions1 = (data) =>{
        setOptions(data)
      }
      
    return(
        <Fragment>
            {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
            {warning?<ModalContainer 
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning} loadModule={loadModule} setWarning={setWarning} />}
                content={<Content/>} 
                modalClass='modal-sm'
            />:null}
            {/* focus for module list API */}
            {<>
                
                <div data-test="moduleList" id='toolbar_module-list' className='toolbar__module-container'>
                
                <div className='module_title'><h6 ><b>Modules
                </b></h6></div>
                <div className= 'plusSymbol' >
                <IconDropdown 
                            items={[ 
  {
    key: 'csv',
    text: 'Create New Module..',
    
    onClick: () => {CreateNew()
    }
  },
  {
    key: 'image',
    text: 'Import Module..',
    // iconProps: { iconName: 'image' }
  }
]}style={{width:'1.67rem',height:'1.67rem', marginLeft:'1rem',marginTop:'0.8rem', border: 'white'}}
    placeholderIconName = 'plusIcon'
                        />   
                </div>
                <span data-test="searchBox" className='searchBox' >
                <input  placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)}></input>
                <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
                    
                    <div style={{overflowY:'scroll',scrollBehavior: 'smooth', marginLeft:'0.5rem',marginTop:'-1.2rem',height:'55%'}} >
                   
                    {/* <button onClick={()=><CreateOptions setOptions/>}>create New</button>  */}
                    {/* <CreateOptions setOptions={setOptions1}/> */}
                        <div style={{height:'1.875rem'}} >
                        {moduleList.map((e,i)=>{
                            if(e.type==="basic")
                            return(<div key={i} >
                                    <div data-test="modules" onClick={(e)=>selectModule(e)} value={e._id}  className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} style={moduleSelect._id===e._id?{backgroundColor:'#EFE6FF'}:{}} title={e.name} type={e.type}>                                    
                                    <div  className='modClick' value={e._id} >{!isAssign && <input type="checkbox" value={e._id}  onChange={(e)=>selectModuleChkBox(e)}  />}</div>
                                        <img value={e._id} src={'static/imgs/'+(e.type==="endtoend"?"node-endtoend.png":"node-modules.png")} alt='module'></img>
                                        <span className='modNme' value={e._id} >{e.name}</span>
                                    </div>
                                    </div>
                                    
                                )
                        })}
                
                    
                      
     
                        </div>
                     
                        
                        
                    </div>
                    <div className='section-dividers'></div>
                    <div><IconDropdown style={{width:'1.67rem',height:'1.67rem', marginLeft:'9.8rem',marginTop:'0.3rem', border: 'white'}}  onClick={()=>CreateNew} placeholderIconName = 'plusIcon'/> </div>     
                    <div className='toolbar__ENE__module-container' >
                    <h6 style={{ alignContent: 'center',width:'8rem', marginLeft:'.1rem',marginTop:'6.1rem',fontFamily: '$avoFont'}}><b>End To End Flows</b></h6>
                    <span data-test="search" style={{width:'12rem',borderRadius: '0.9rem',marginTop:'0.05rem'}} className='ene_toolbar__header-searchbox'>
                        <input data-test="searchInput" placeholder="Search Modules" ref={SearchMdInp} onChange={(e)=>searchModule_E2E(e.target.value)}></input>
                        <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
               
                    <div  style={{overflowY:'scroll',scrollBehavior: 'smooth', 
                    display:'flex',flexDirection:'column', alignItems:'center',textAlign:'center', height:'5.2rem', marginLeft:'-0.87rem', }} scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
            {moduleList.map((e,i)=>{
                if(e.type==="endtoend")
                return(
                    <div style={{display:'flex', alignContent:'center',width: '11.25rem',
    height:'1.7rem',alignItems: 'center',marginLeft:'1rem', marginTop:'-0.6rem' }} data-test="individualModules" name={e.name} type={e.type} onClick={(e)=>selectModule(e)} key={i} className={'ene_toolbar__module-box'+((moduleSelect._id === e._id)?" selected":"")} title={e.name}>
    <input type="checkbox" value={e._id}  onChange={(e)=>selectModuleChkBox(e)}  />
                        <img style={{display:'inlineBlock',height: '1.54rem',width: '1.54rem',cursor: 'pointer',marginLeft: '0.9rem'}} src={(e.type==="endtoend")?"static/imgs/node-endtoend.png":"static/imgs/node-modules.png"} alt='module'></img>
                        <span >{e.name}</span>
                    </div>
                )
            })}      
                    </div></div>
                    </div>
                    <div className='divider'></div>
                    
                    
               
                </>
                
            }
            <div data-test="dropDown" onClick={()=>{
                {
                    dispatch({type:actionTypes.SELECT_MODULELIST,payload:[]})
                }
                }}>
                
            </div>
        </Fragment>
    )
}

//content for moduleclick warning popup
const Content = () => (
    <p>Unsaved work will be lost if you continue. Do you want to continue?</p>
)

//footer for moduleclick warning popup
const Footer = (props) => (
    <div className='toolbar__module-warning-footer'>
        <button className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</button>
        <button onClick={()=>{props.setWarning(false)}}>No</button>
    </div>
)

export default ModuleListDrop;
import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules, populateScenarios}  from '../api'
import {ScrollBar,ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import '../styles/ModuleListDrop.scss'
import {IconDropdown} from '@avo/designcomponents';
import ImportMindmap from'../components/ImportMindmap.js';
import CreateOptions from '../components/CreateOptions.js'; 


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
   console.log("modName",props.setModName)
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
    const [importPop,setImportPop] = useState(false)
    const [blockui,setBlockui] = useState({show:false})
    const [scenarioList,setScenarioList] = useState([])
    const [initScList,setInitScList] = useState([]) 
    const filterSc = props.filterSc
    const [selectedSc,setSelctedSc] = useState([])
    const [isE2EOpen, setIsE2EOpen] = useState(false);
    const [collapse, setCollapse] = useState(false);
    
  

    useEffect(()=> {
        if(moduleList.length > 0) {
            // const e = {
            //     target: <span className='modNme' value={moduleList[0]._id} >{moduleList[0].name}</span>
            // }
            selectModule(moduleList[0]._id, moduleList[0].name, moduleList[0].type, false); 
        }
        console.log(moduleList[0]);
     },[])
    
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
    }
    const clickCreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:proj})
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>(e.type === 'basic' && (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1) || e.type === 'endtoend'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
     const loadModule = async(modID) =>{
        // setModdrop(false)
        setWarning(false)
        setBlockui({show:true,content:"Loading Module ..."})        
        if(moduleSelect._id === modID){
            dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        }
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
        dispatch({type:actionTypes.SELECT_MODULE,payload:res})
        setBlockui({show:false})
    }
            const selectModule = async (id,name,type,checked) => {
                var modID = id
                var type = name
                var name = type
                // below code about scenarios fetching
                console.log("isE2EOpen",isE2EOpen)
        if (isE2EOpen){
            // if (type!=='endtoend')
        setBlockui({content:'loading scenarios',show:true})
        //loading screen
        var res = await populateScenarios(modID)
        if(res.error){displayError(res.error);return}
        // props.setModName(name)
        setScenarioList(res)
        setInitScList(res)
        setBlockui({show:false})
        return;}
                if(type=='checkbox'){
                    let selectedModList = [];
                    if(moduleSelectlist.length>0){
                        selectedModList=moduleSelectlist;                
                    }
                    if(checked){
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
            setWarning({modID, type: name})
        }
        
    }
    const selectModuleChkBox = (e) => {
// console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",e)

    }
    // const loadModule = async(modID) =>{
    //     dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
    //     setModdrop(false)
    //     setWarning(false)
    //     setLoading(true)
    //     // var req={
    //     //     tab:"tabCreate",
    //     //     projectid:proj,
    //     //     version:0,
    //     //     cycId: null,
    //     //     // modName:"",
    //     //     moduleid:[modID]
    //     // }
    //     // if(isAssign){
    //     //     req.tab = "tabAssign"
    //     //     req.cycId = props.cycleRef.current?props.cycleRef.current.value: ""
    //     // }
    //     console.log('abc');
    //     console.log('hello hanumant',actionTypes.SELECT_MODULE);
    //     var req={
    //         tab:"endToend",
    //         projectid:proj,
    //         version:0,
    //         cycId: null,
    //         modName:"",
    //         moduleid:modID
    //     }
    //     var res = await getModules(req)
    //     if(res.error){displayError(res.error);return}
    //     dispatch({type:actionTypes.SELECT_MODULE,payload:res})
    //     setBlockui({show:false})
    // }
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
      const createType = {
        'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))}
      
    return(
        <Fragment>
             {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
            {warning.modID?<ModalContainer 
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning.modID} loadModule={warning.type ==='endtoend' ? loadModuleE2E : loadModule} setWarning={setWarning} />}
                content={<Content/>} 
                modalClass='modal-sm'
            />:null}
            <div className='fullContainer pxBlack'>
                <div className='leftContainer pxBlack'>
                    <div className='modulesBox'>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <h6  style={{ marginTop:'0.5rem'}}>
                                <b>
                                    Modules
                                </b>
                            </h6>

                            <IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New Module..',
                                    onClick: () => {CreateNew()
                                    }
                                },
                                {
                                    key: 'image',
                                    text: 'Import Module..',
                                    onClick:()=>{setImportPop(true);}}
                                ]} style={{width:'1.67rem',height:'1.67rem', marginLeft:'1rem', border: 'white', marginTop:'0.2rem'}} placeholderIconName = 'plusIcon'
                            />  
                            {importPop?<ImportMindmap setBlockui={setBlockui} displayError={displayError} setImportPop={setImportPop} isMultiImport={true} />:null}
                        </div>
                        <div className='searchBox pxBlack' style={{display:'flex'}}>
                            <input placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                        </div>
                        <div className='moduleList'>
                            {moduleList.map((e,i)=>{
                                if(e.type==="basic")
                                return(
                                    <div key={i}>
                                            <div data-test="modules" onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} value={e._id}  className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} style={moduleSelect._id===e._id?{backgroundColor:'#EFE6FF'}:{}} title={e.name} type={e.type}>                                    
                                                <div className='modClick' value={e._id} >
                                                    {!isAssign && <input type="checkbox" className="checkBox" value={e._id} onChange={(e)=>selectModuleChkBox(e.target.checked)}  />}
                                                </div>
                                                <img style={{width:'1.7rem',height:'1.7rem'}} value={e._id} src={'static/imgs/'+(e.type==="endtoend"?"node-endtoend.png":"node-modules.png")} alt='module'></img>
                                                <span className='modNme' value={e._id} >{e.name}</span>
                                            </div>
                                    </div>
                                    )
                            })}
                        </div>
                    </div>
                    <div className='section-dividers'></div>
                    <div className='endToEnd'>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:'center', }}>
                            <h6>
                                <b>
                                    End to End Flows
                                </b>
                            </h6>
                            <IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New Module..',
                                    onClick: () => {clickCreateNew()
                                    }
                                },
                                {
                                    key: 'image',
                                    text: 'Import Module..',
                                }
                                ]} style={{width:'1.67rem',height:'1.67rem', marginLeft:'1rem', border: 'white', marginTop:'-0.7rem'}} placeholderIconName = 'plusIcon'
                            />  
                        </div>
                        <div className='searchBox pxBlack' style={{display:'flex'}}>
                            <input placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                        </div>
                        <div className='endToEndMap'>
                        {moduleList.map((e,i)=>{
                            if(e.type==="endtoend")
                            return(
                                    <div key={i} style={{ display:'flex',  width:'20%', justifyContent:'space-between', padding:'0.25rem' }} data-test="individualModules" name={e.name} type={e.type} onClick={(e)=>selectModule(e)} title={e.name}>
                                        <input type="checkbox" className="checkBox" value={e._id} onChange={(e)=>selectModuleChkBox(e)}  />
                                        <img style={{height: '1.7rem',width:'1.7rem'}} src={(e.type==="endtoend")?"static/imgs/E2Eicon.png":"static/imgs/node-modules.png"} alt='module'></img>
                                        <span className='modNme' >{e.name}</span>
                                    </div>
                            )
                        })}
                        </div>
                    </div>
                </div>
                <div className='scenarioList'>
                    
                {/* {scenarioList.map((e,i)=>{
                    return(
                        <div key={i+'scenario'} onClick={(e)=>addScenario(e)} className={'dropdown_scenarios'+(selectedSc[e._id]?' selected':'')} title={e.name} value={e._id} >{e.name}</div>
                    )
                })} */}
                
              
                {scenarioList.map((e,i)=>{ 
                    console.log('scenario',e)
                    return(
                            <div key={i+'scenario'}  title={e.name} value={e._id} >{e.name}</div>
                           
                    )
                })}
                            {/* {moduleList.map((e,i)=>{
                                if(e.type==="basic")
                                return(
                                    <div key={i}>
                                            <div data-test="modules" onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} value={e._id}  className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} style={moduleSelect._id===e._id?{backgroundColor:'#EFE6FF'}:{}} title={e.name} type={e.type}>                                    
                                                <div className='modClick' value={e._id} >
                                                    {!isAssign && <input type="checkbox" className="checkBox" value={e._id} onChange={(e)=>selectModuleChkBox(e)}  />}
                                                </div>
                                                <img style={{width:'1.7rem',height:'1.7rem'}} value={e._id} src={'static/imgs/'+(e.type==="endtoend"?"node-endtoend.png":"node-modules.png")} alt='module'></img>
                                                <span className='modNme' value={e._id} >{e.name}</span>
                                            </div>
                                    </div>
                                    )
                            })} */}
                        </div>
            </div>
            <div data-test="dropDown" onClick={()=>{
                    dispatch({type:actionTypes.SELECT_MODULELIST,payload:[]})
                }}>
                
            </div>
        </Fragment>
    );
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
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
import { Button } from "primereact/button";


const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const initProj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const moduleSelectlist = useSelector(state=>state.mindmap.selectedModulelist)
    const initEnEProj = useSelector(state=>state.mindmap.initEnEProj)
    const [moddrop,setModdrop]=useState(true)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [modlist,setModList] = useState(moduleList)
    const SearchInp = useRef()
    const SearchMdInp = useRef()
    const [modE2Elist, setModE2EList] = useState(moduleList)
    const [searchForNormal, setSearchForNormal] = useState(false)
    const [savedList, setSavedList] = useState(false)
    const [importPop,setImportPop] = useState(false)
    const [blockui,setBlockui] = useState({show:false})
    const [scenarioList,setScenarioList] = useState([])
    const [initScList,setInitScList] = useState([]) 
    const [selectedSc,setSelctedSc] = useState([])
    const [isE2EOpen, setIsE2EOpen] = useState(false);
    const [collapse, setCollapse] = useState(false);
    const SearchScInp = useRef()
    const [filterSc,setFilterSc] = useState('');
    const userRole = useSelector(state=>state.login.SR);
    const [firstRender, setFirstRender] = useState(true);
    const [showNote, setShowNote] = useState(false);
    const [allModSelected, setAllModSelected] = useState(false);
    const [isCreateE2E, setIsCreateE2E] = useState(initEnEProj && initEnEProj.isE2ECreate?true:false)
    useEffect(()=> {
        if(!searchForNormal && !isCreateE2E ) {
            if(moduleList.length > 0) {
                const showDefaultModuleIndex = moduleList.findIndex((module) => module.type==='basic');
                selectModule(moduleList[showDefaultModuleIndex]._id, moduleList[showDefaultModuleIndex].name, moduleList[showDefaultModuleIndex].type, false,true); 
        }}
        else{dispatch({type:actionTypes.SAVED_LIST,payload:true});setSavedList(true)}
       
        setWarning(false);
     }, [ moduleList || initProj])
     useEffect (()=>{
        setSavedList(true)
        {dispatch({type:actionTypes.SAVED_LIST,payload:true});}
     })

     useEffect(()=>{
         setSearchForNormal(false);
         if(!isE2EOpen){
        setIsCreateE2E(false);
        }
         
     },[initProj])
     useEffect(() => {
        setIsCreateE2E(initEnEProj && initEnEProj.isE2ECreate?true:false);
        
      },[initEnEProj]);

     useEffect(()=>{
        if(moduleSelect.type === 'endtoend') {
            // setIsE2EOpen(true)
            // setCollapse(true);
            
        }
        
        setWarning(false);
        setScenarioList([]);
     }, [proj])
    
     useEffect(()=>{
        var filter = [...initScList].filter((e)=>e.name.toUpperCase().indexOf(filterSc.toUpperCase())!==-1)
        setScenarioList(filter)
    },[filterSc,setScenarioList,initScList])
    // about select all check box
    useEffect(()=>{
        if(moduleSelectlist.length===moduleList.length && moduleSelectlist.length>0){
          setAllModSelected(true);
        }
        else{
          setAllModSelected(false);
        }
      },[moduleSelectlist, moduleList])
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const collapsed =()=> setCollapse(!collapse)
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:undefined})

    }
    const clickCreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:{proj, isE2ECreate: true}});

    }
    const searchModule = (val) =>{
        setSearchForNormal(true);
        var filter = modlist.filter((e)=>(e.type === 'basic' && (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1) || e.type === 'endtoend'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
        
    }
    const searchScenario = (val) =>{
        setFilterSc(val)
    }
     const loadModule = async(modID) =>{
        setWarning(false)
        setBlockui({show:true,content:"Loading Module ..."}) 
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:undefined})
        
    
        // if(moduleSelect._id === modID){
           
        // }
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        var req={
            tab:"createTab",
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
    const [isModuleSelectedForE2E, setIsModuleSelectedForE2E] = useState('');

    // normal module selection
            const selectModule = async (id,name,type,checked, firstRender) => {
                var modID = id
                var type = name
                var name = type
                // below code about scenarios fetching
        SearchScInp.current.value = ""
                setSelctedSc([])
                    if (isE2EOpen){
                        setBlockui({content:'loading scenarios',show:true})
                        //loading screen
                        var res = await populateScenarios(modID)
                        if(res.error){displayError(res.error);return}
                        // props.setModName(name)
                        setIsModuleSelectedForE2E(id);
                        setScenarioList(res)
                        setInitScList(res)
                        setBlockui({show:false})
                        setShowNote(true)
                        return;}
                        if(Object.keys(moduleSelect).length===0 || firstRender){
                            loadModule(modID)
                            return;
                        }else{
                            setWarning(modID)
                        }
        d3.selectAll('.ct-node').classed('node-selected',false)
        //     return;
        // }
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
    
        }else{
            setWarning({modID, type: name})
        }
        return;
    }
    
    //E2E properties
    const selectModules= async(e) => {
        var modID = e.currentTarget.getAttribute("value")
        var type = e.currentTarget.getAttribute("type")
        var name = e.currentTarget.getAttribute("name")
        if(Object.keys(moduleSelect).length===0 || firstRender){
            loadModuleE2E(modID)

        }else{
            setWarning({modID, type});
        }
        setFirstRender(false);

        return; 
    }    
    const loadModuleE2E = async(modID) =>{
        setWarning(false)
        setIsE2EOpen(true)
        setCollapse(true)
        setBlockui({show:true,content:"Loading Module ..."})   
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:{proj, isE2ECreate: true}});
        // if(moduleSelect._id === modID){
            
            
        // }
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
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
    const addScenario = (e) => {	
        var sceId = e.currentTarget.getAttribute("value")	
        var sceName = e.currentTarget.getAttribute("title")	
        var scArr = {...selectedSc}	
        if(scArr[sceId]){	
            delete scArr[sceId] 
        }else{	
            scArr[sceId] = sceName	
        }       
        setSelctedSc(scArr)	
    }	
    const clickAdd = () =>{	
        if(Object.keys(selectedSc).length<1)return;	
        dispatch({type:actionTypes.UPDATE_SCENARIOLIST,payload:selectedSc})	
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
    const createType = {
        'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
    }
    const selectedCheckbox=(e,arg="checkbox")=>{
        let modID = e.target.getAttribute("value")
        if(arg==='checkbox'){

            let selectedModList = [];
            if(moduleSelectlist.length>0){
                selectedModList=moduleSelectlist;              
            }
            if(selectedModList.indexOf(modID)===-1){
                selectedModList.push(modID);
            }else{
                selectedModList = selectedModList.filter(item => item !== modID)
            }              
            dispatch({type:actionTypes.SELECT_MODULELIST,payload:[...selectedModList]})         
            return;
        }
    }
      
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
            <div className='wholeContainer'>
            <div className='fullContainer pxBlack'>
                <div className='leftContainer pxBlack' style={{ display:"flex"}}>
                    
                    <div className='modulesBox' >
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <img src="static/imgs/node-modules.png" alt="modules" style={{display:"flex",position:'',width:'1.7rem',height:'1.7rem',margin: '5px -82px 3px -17px'}}/>
                            <h6 id='moduleStyle' style={{ marginTop:'0.5rem'}}>
                                    Modules
                            </h6>

                            {userRole!=="Test Engineer"?<IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New',
                                    onClick: () => {CreateNew();
                                        setSearchForNormal(true);
                                    }
                                },
                                {
                                    key: 'image',
                                    text: 'Import Module',
                                    onClick:()=>{setImportPop(true);
                                        setSearchForNormal(true);}}
                                ]} style={{width:'1.67rem',height:'1.67rem', marginLeft:'15rem', border: 'white', marginTop:'0.2rem'}} placeholderIconName = 'plusIcon'
                            />  :null}
                            {importPop? <ImportMindmap setBlockui={setBlockui} displayError={displayError} setOptions={setOptions} setImportPop={setImportPop} isMultiImport={true}   />:null}
                        </div>
                        <div className='searchBox pxBlack' style={{display:'flex'}}>
                        <input style={{width:'1rem',marginLeft:'0.57rem',marginTop:'0.28rem'}} title='Select All Modules' name='selectall' type={"checkbox"} id="selectall" checked={allModSelected} onChange={(e) => {
                  if (!allModSelected) {
                    dispatch({ type: actionTypes.SELECT_MODULELIST, payload: moduleList.map((modd) => modd._id) })
                  } else {
                    dispatch({ type: actionTypes.SELECT_MODULELIST, payload: [] })
                  }
                  setAllModSelected(!allModSelected)
                }} ></input>
                            <input className='pFont' placeholder="Search Modules" ref={SearchInp} onChange={(e)=>{searchModule(e.target.value);setSearchForNormal(true)}}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                        </div>
                        <div className='moduleList'>
                            {moduleList.map((e,i)=>{
                                if(e.type==="basic")
                                return(
                                    <div key={i}>
                                            <div data-test="modules" value={e._id}  className={'toolbar__module-box'+((moduleSelect._id===e._id  )?" selected":"")} style={(moduleSelect._id===e._id || e._id===isModuleSelectedForE2E && isE2EOpen)?   {backgroundColor:'#EFE6FF'}:{}  }  title={e.name} type={e.type}>                                    
                                                <div className='modClick' value={e._id} style={{display:'flex',flexDirection:'row'}} >
                                                {<input type="checkbox" className="checkBox" style={{marginTop:'3px'}} value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") } checked={moduleSelectlist.includes(e._id)}  />}  
                                                <span  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} className='modNme' value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',width:'7rem'}}>{e.name}</span>
                                                </div>
                                            </div>
                                    </div>
                                    )
                            })}
                        </div>
                    </div>
                    <div className='section-dividers'></div>
                    <div className='endToEnd'>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:'center', }}>
                        <img src="static/imgs/node-endtoend.png" alt="modules" style={{display:"flex",width:'1.7rem',height:'1.7rem',margin: '5px -82px 3px -17px'}}/>
                            <h6 id='Endto' style={{margin: '6px -230px 3px -13px'}}>
                                    End to End Flows
                            </h6>
                           {userRole!=="Test Engineer"? <IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New',
                                    onClick: () => {clickCreateNew();
                                        collapsed();
                                        setIsE2EOpen(true);
                                    }
                                },
                                ]}
                                 id='plusIconEndtoEnd' placeholderIconName = 'plusIconEndtoEnd'
                            />  :null}
                        </div>
                        <div className='searchBox pxBlack'>
                        <img style={{marginLeft:'0.55rem',width:'1rem', marginRight:'0.3rem'}} src="static/imgs/checkBoxIcon.png" alt="AddButton" />
                            <input className='pFont' placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule_E2E(e.target.value)}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'} />
                        </div>
                        <div className='moduleList'>
                        {moduleList.map((e,i)=>{
                            if(e.type==="endtoend")
                            return(<>
                                    
                                    <div key={i}  data-test="individualModules" name={e.name} value={e._id} type={e.type} className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} style={moduleSelect._id===e._id?  {backgroundColor:'#EFE6FF'}:{} }   onClick={(e)=>selectModules(e)} title={e.name} >
                                       <div style={{textOverflow:'ellipsis', width:'9rem',overflow:'hidden',textAlign:'left', height:'1.75rem', display:'flex',flexDirection:'row-reverse',marginLeft:'-6px'}}> <span style={{textOverflow:'ellipsis'}} className='modNmeE2E'>{e.name}</span> <div  ><img style={{marginLeft:'-24px'}} src="static/imgs/checkBoxIcon.png" alt="AddButton" /></div></div>
                                       
                                    </div>
                                    </>
                            )
                        })}
                        </div>
                    </div>
                </div>
                
                </div>
                <div className='scenarioListBox' style={{width:collapse? "10rem":"0.5rem", overflowX:'hidden',height:'95.5%'}}>
                    <div style={{display:"flex", flexDirection:"column", width:"100%",overflowX:'hidden'}}>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                            <img style={{width:'1.7rem',height:'1.7rem',marginTop:'5px',  display:!isE2EOpen || !collapse? 'none':'',}}  src='static/imgs/node-scenarios.png'/>
                    <div style={{paddingTop:'0.47rem',marginLeft: "4px",}}><h5 style={{fontSize:'17px',opacity:!isE2EOpen || !collapse? '0':''}}><b>Scenarios</b></h5></div>
                    <div style={{marginRight:'-0.4rem',marginTop:'0rem',cursor:'pointer'}} onClick={()=> {setIsE2EOpen(false);collapsed();  
                    }}><img src="static/imgs/X_button.png" alt="cross button" /></div></div>
                    {/* scenario Search */}
                     <span style={{display:'flex', flexDirection:'row-reverse',  marginTop:'2px',marginRight:!isE2EOpen || !collapse? '15rem':''}}>
                        <input  style={{width:'137px',height: '23px', borderRadius:'6px',fontSize:'15px',marginRight:'0.65rem',}} placeholder="Search Scenario" ref={SearchScInp} onChange={(e)=>searchScenario(e.target.value)}></input>
                        <img style={{width: '12px', height: '17px', marginRight:"-8.2rem", marginTop:'2px',zIndex:'1'}} src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                    </span>
                        <div className='scenarioList' style={{opacity:!isE2EOpen || !collapse? '0':''}}>
                        <div style={{display: !showNote? '':'none', textAlign:'center', marginTop:'3rem', marginRight:!isE2EOpen || !collapse? '15rem':'', overflowX:'hidden',opacity:''}}><h7 >Please select a module to display <br></br> it's scenarios</h7></div> 
                           <div style={{display:  (showNote && scenarioList.length==0 )? '':'none', textAlign:'center', marginTop:'3rem',  overflowX:'hidden',opacity:''}}><h7 >There are no Scenarios in this Module </h7></div> 
                              
                                {scenarioList.map((e, i) => {

                                    
                                    return (
                                        <div key={i} className='scenarios ' style={{marginRight:!isE2EOpen || !collapse? '15rem':''}}>

                                            <div  key={i + 'scenario'} onClick={(e) => addScenario(e)} className={'dropdown_scenarios'} title={e.name} value={e._id} >
                                                <div style={{display:'flex',marginTop:'3px',textOverflow:"ellipsis"}}><input type="checkbox"  value={e._id} onChange={(e)=>{} } checked={selectedSc[e._id]}  />
                                                <span style={{textOverflow:"ellipsis", height:'1rem'}}>
                                                {e.name}</span></div></div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='AddBut'>
                                <Button onClick={clickAdd} style={{  marginLeft:'.7rem',marginTop:'0.4rem',textAlign:'center',width:'66px',height:'31px', alignContent:'center',cursor:'pointer',alignItems:'center'}} disabled={ Object.keys(selectedSc).length<1? true : false} label="ADD"  />
                            </div>
                            </div>
                    <div className='collapseButtonDiv' style={{marginLeft: collapsed? "-4rem":''}} ><img className='collapseButton' style={{ cursor: !isE2EOpen ? 'no-drop' : 'pointer', transform: isE2EOpen && collapse ? 'rotate(180deg)' : 'rotate(0deg)',height:'30px',width:'8px', position:'relative'
    }} onClick={isE2EOpen ? collapsed : null} src='static/imgs/collapseButton.png' /> </div>
                 
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
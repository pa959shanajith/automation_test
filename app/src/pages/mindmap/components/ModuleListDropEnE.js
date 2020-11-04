import React, { Fragment , useState, useEffect} from 'react';
import {ScrollBar,ModalContainer} from '../../global';
import { useSelector, useDispatch, useStore, ReactReduxContext} from 'react-redux';
import {getModules,getScenarios}  from '../api'
import {ScreenOverlay} from '../../global'
import * as actionTypes from '../state/action';
import '../styles/ModuleListDropEnE.scss'

const ModuleListDropEnE = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const [initScList,setInitScList] = useState([]) 
    const [scenarioList,setScenarioList] = useState([])
    const [selectedSc,setSelctedSc] = useState([])
    const [dropdown,setDropdown] = useState(true)
    const [warning,setWarning] = useState(false)
    const [loading,setLoading] = useState(false)
    const setPopup = props.setPopup
    const setBlockui = props.setBlockui
    const filterSc = props.filterSc

    useEffect(()=>{
        var filter = [...initScList].filter((e)=>e.name.toUpperCase().indexOf(filterSc.toUpperCase())!==-1)
        setScenarioList(filter)
    },[filterSc,setScenarioList,initScList])
    useEffect(()=>{
        setInitScList([])
        setSelctedSc([])
    },[proj])
    const selectModule = async(e) => {
        setSelctedSc([])
        var modID = e.currentTarget.getAttribute("value")
        var type = e.currentTarget.getAttribute("type")
        var name = e.currentTarget.getAttribute("name")
        if(Object.keys(moduleSelect).length===0 && type!=='endtoend'){
            displayError('First, Please select an end to end module or create a new one!');
            return;
        }
        if(type!=='endtoend'){
            setBlockui({content:'loading scenarios',show:true})
            //loading screen
            var res = await getScenarios(modID)
            if(res.error){displayError(res.error);return}
            props.setModName(name)
            setScenarioList(res)
            setInitScList(res)
            setBlockui({show:false})
            return;
        }
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
            return;
        }else{
            setWarning(modID)
        }
    }
    const loadModule = async(modID) =>{
        // setModdrop(false)
        setWarning(false)
        setLoading(true)        
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
        setLoading(false)
    }
    const addScenario = (e) => {
        var sceId = e.currentTarget.getAttribute("value")
        var scArr = [...selectedSc] 
        var index = scArr.indexOf(sceId)
        if(index === -1){
            scArr.push(sceId)
        }else{
            scArr.splice(index,1)
        }
        setSelctedSc(scArr)
    }
    const displayError = (err) =>{
        setBlockui({show:false})
        // setLoading(false)
        props.setPopup({
          title:'ERROR',
          content:err,
          submitText:'Ok',
          show:true
        })
    }
    const clickAdd = () =>{
        if(selectedSc.length<1)return;
        var scArray =  [...scenarioList].filter(e=>selectedSc.indexOf(e._id)!==-1)
        dispatch({type:actionTypes.UPDATE_SCENARIOLIST,payload:scArray})
    }
    const clickCreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
    }
return(
    <Fragment>
    {warning?<ModalContainer 
    title='Confirmation'
    close={()=>setWarning(false)}
    footer={<Footer modID={warning} loadModule={loadModule} setWarning={setWarning} />}
    content={<Content/>} 
    modalClass='modal-sm'
    />:null}
    <div className='ene_toolbar__dropdown' style={{'height':(dropdown)?'90px':'250px'}}>
        <div className='ene_toolbar__dropdown_module'>
            <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
            {moduleList.map((e,i)=>{
                return(
                    <div name={e.name} value={e._id} type={e.type} onClick={(e)=>selectModule(e)} key={i} className={'ene_toolbar__module-box'+((moduleSelect._id === e._id)?" selected":"")}>
                        <img src={(e.type==="endtoend")?"static/imgs/node-endtoend.png":"static/imgs/node-modules.png"} alt='module'></img>
                        <span value={e._id} >{e.name}</span>
                    </div>
                )
            })}
            </ScrollBar>
        </div>      
        <div className='ene_toolbar__dropdown_scenario'>
            <div className='ene_toolbar__scrollwrap'>
                <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
                <div>
                {scenarioList.map((e,i)=>{
                    return(
                        <div key={i+'scenario'} onClick={(e)=>addScenario(e)} className={'dropdown_scenarios'+(selectedSc.indexOf(e._id)!==-1?' selected':'')} title={e.name} value={e._id} >{e.name}</div>
                    )
                })}
                </div>
                </ScrollBar>
            </div>
            <div className='ene_toolbar__buttons'>
                <button onClick={clickAdd} className={'btn'+(selectedSc.length<1?' disabled':'')}>Add</button>
                <button onClick={clickCreateNew}className='btn'>Create New</button>
            </div>
        </div>
        <div className={'ene_toolbar__module-footer'}>
            <div onClick={()=>setDropdown(!dropdown)}><i className={(dropdown)?"fa fa-caret-down":"fa fa-caret-up"} title="Drop down button"></i></div>
        </div>
    </div>
    </Fragment>
)}

const Content = () => (
    <p>Unsaved work will be lost if you continue. Do you want to continue?</p>
)

const Footer = (props) => (
    <div className='toolbar__module-warning-footer'>
        <button className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</button>
        <button onClick={()=>{props.setWarning(false)}}>No</button>
    </div>
)

export default ModuleListDropEnE;
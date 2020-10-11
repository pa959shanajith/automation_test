import React, { Fragment , useState} from 'react';
import {ScrollBar,ModalContainer} from '../../global';
import { useSelector, useDispatch} from 'react-redux';
import {getModules}  from '../api'
import {ScreenOverlay} from '../../global'
import * as actionTypes from '../state/action';
import '../styles/ModuleListDropEnE.scss'

const ModuleListDropEnE = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const [moddrop,setModdrop]=useState(false)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const selectModule = (e) => {
        var modID = e.currentTarget.getAttribute("value")
        var type = e.currentTarget.getAttribute("type")
        if(type!=='endtoend'){
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
        setModdrop(false)
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
    const displayError = (err) =>{
        setLoading(false)
        props.setPopup({
          title:'ERROR',
          content:err,
          submitText:'Ok',
          show:true
        })
    }
return(
    <Fragment>
    <div className='ene_toolbar__dropdown' style={{'height':(true)?'90px':'300px'}}>
        <div className='ene_toolbar__dropdown_module'>
            <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
            {moduleList.map((e,i)=>{
                return(
                    <div value={e._id} type={e.type} onClick={(e)=>selectModule(e)} key={i} className={'ene_toolbar__module-box'+((true)?" selected":"")}>
                        <img src={(e.type==="endtoend")?"static/imgs/node-endtoend.png":"static/imgs/node-modules.png"} alt='module'></img>
                        <span value={e._id} >{e.name}</span>
                    </div>
                )
            })}
            </ScrollBar>
        </div>      
        <div className='ene_toolbar__dropdown_scenario'>
            <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
            <div>
            {moduleList.map((e,i)=>{
                            return(
                                <div className='dropdown_scenarios' title={e.name} value={e._id} >{e.name}</div>
                            )
                        })}
                        </div>
            </ScrollBar>
        </div>
        <div className={'ene_toolbar__module-footer'}>
        <div><i className={(!moddrop)?"fa fa-caret-down":"fa fa-caret-up"} title="Drop down button"></i></div>
        </div>
    </div>
    </Fragment>
)}

export default ModuleListDropEnE;
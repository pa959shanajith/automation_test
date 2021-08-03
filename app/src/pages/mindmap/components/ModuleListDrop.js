import React, { useState, Fragment} from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules}  from '../api'
import {ScrollBar,ModalContainer,Messages as MSG} from '../../global';
import {ScreenOverlay} from '../../global'
import * as actionTypes from '../state/action';
import '../styles/ModuleListDrop.scss'

/*Component ModuleListDrop
  use: renders 
  props: 
    setoptions from mindmapHome.js 
*/

const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const [moddrop,setModdrop]=useState(false)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const isAssign = props.isAssign
    const selectModule = (e) => {
        var modID = e.target.getAttribute("value")
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
            return;
        }else{
            setWarning(modID)
        }
    }
    const loadModule = async(modID) =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        setModdrop(false)
        setWarning(false)
        setLoading(true)
        var req={
            tab:"tabCreate",
            projectid:proj,
            version:0,
            cycId: null,
            // modName:"",
            moduleid:modID
        }
        if(isAssign){
            req.tab = "tabAssign"
            req.cycId = props.cycleRef.current?props.cycleRef.current.value: ""
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
        props.setPopup({
          variant:error.VARIANT,
          content:error.CONTENT,
          submitText:'Ok',
          show:true
        })
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
            {(moddrop)?
                <div data-test="moduleList" id='toolbar_module-list' className='toolbar__module-container'>
                    <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}> 
                        {moduleList.map((e,i)=>{
                            return(
                                <div data-test="modules" onClick={(e)=>selectModule(e)} value={e._id} key={i} className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")}>
                                    <img value={e._id}  src={'static/imgs/'+(e.type==="endtoend"?"node-endtoend.png":"node-modules.png")} alt='module'></img>
                                    <span value={e._id} >{e.name}</span>
                                </div>
                            )
                        })}
                    </ScrollBar>
                </div>
                :null
            }
            <div data-test="dropDown" className={'toolbar__module-footer'+ (moddrop?' z-up':'')} onClick={()=>setModdrop(!moddrop)}>
                <div><i className={(!moddrop)?"fa fa-caret-down":"fa fa-caret-up"} title="Drop down button"></i></div>
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
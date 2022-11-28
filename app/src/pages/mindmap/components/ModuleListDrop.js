import React, { useState, Fragment} from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules}  from '../api'
import {ScrollBar,ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
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
    const moduleSelectlist = useSelector(state=>state.mindmap.selectedModulelist)
    const [moddrop,setModdrop]=useState(false)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const [selectedModuleList,setSelectedModuleList] = useState([]);
    const isAssign = props.isAssign
    const selectModule = (e) => {
        var modID = e.target.getAttribute("value")
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
        var req={
            tab:"tabCreate",
            projectid:proj,
            version:0,
            cycId: null,
            // modName:"",
            moduleid:[modID]
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
        setMsg(error)
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
                                    <div data-test="modules" onClick={(e)=>selectModule(e)} value={e._id} key={i} className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} title={e.name}>                                    
                                        <img value={e._id}  src={'static/imgs/'+(e.type==="endtoend"?"node-endtoend.png":"node-modules.png")} alt='module'></img>
                                        <span value={e._id} ><input type="checkbox" value={e._id}  onChange={(e)=>selectModuleChkBox(e)}  />{e.name}</span>
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
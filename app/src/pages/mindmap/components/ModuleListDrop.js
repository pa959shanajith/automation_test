import React, { useState, Fragment} from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules}  from '../api'
import {ScrollBar} from '../../global';
import {ScreenOverlay} from '../../global'
import * as actionTypes from '../state/action';
import '../styles/ModuleListDrop.scss'

/*Component ModuleListDrop
  use: renders 
  props: 
    setoptions from mindmapHome.js 
*/

const ModuleListDrop = () =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const [moddrop,setModdrop]=useState(false)
    const [loading,setLoading] = useState(false)
    const selectModule = async(props) => {
        setModdrop(false)
        setLoading(true)
        var modID = props.target.getAttribute("value") 
        if(moduleSelect._id === modID){
            dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        }
        var req={
            tab:"tabCreate",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        var res = await getModules(req)
        dispatch({type:actionTypes.SELECT_MODULE,payload:res})
        setLoading(false)
    }
    return(
        <Fragment>
            {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
            {(moddrop)?
                <div className='toolbar__module-container'>
                    <ScrollBar>
                        {moduleList.map((e,i)=>{
                            return(
                                <div onClick={(e)=>selectModule(e)} value={e._id} key={i} className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")}>
                                    <img value={e._id}  src={"static/imgs/node-modules.png"} alt='module'></img>
                                    <span value={e._id} >{e.name}</span>
                                </div>
                            )
                        })}
                    </ScrollBar>
                </div>
                :null
            }
            <div className='toolbar__module-footer' onClick={()=>setModdrop(!moddrop)}>
                <div><i className={(!moddrop)?"fa fa-caret-down":"fa fa-caret-up"} title="Drop down button"></i></div>
            </div>
        </Fragment>
    )
}

export default ModuleListDrop;
import React, { useState, Fragment} from 'react';
import { useSelector } from 'react-redux';
import '../styles/ModuleListDrop.scss'
import Scrollbar from '../../../globals/components/Scrollbar';


/*Component ModuleListDrop
  use: renders 
  props: 
    setoptions from mindmapHome.js 
*/

const ModuleListDrop = () =>{
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const [moddrop,setModdrop]=useState(false)
    return(
        <Fragment>
            {(moddrop)?
                <div className='toolbar__module-container'>
                    <Scrollbar>
                        {moduleList.map((e)=>{
                            return(
                                <div className='toolbar__module-box'>
                                    <img src={"static/imgs/node-modules.png"} alt='module'></img>
                                    <span>{e.name}</span>
                                </div>
                            )
                        })}
                    </Scrollbar>
                </div>
                :null
            }
            <div className='toolbar__module-footer' onClick={()=>setModdrop(!moddrop)}>
                <img src={"static/imgs/"+((moddrop)?"ic-collapseup.png":"ic-collapse.png")} alt='-'></img>
            </div>
        </Fragment>
    )
}

export default ModuleListDrop;
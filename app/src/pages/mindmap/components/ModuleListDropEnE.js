import React, { Fragment } from 'react';
import {ScrollBar,ModalContainer} from '../../global';
import '../styles/ModuleListDropEnE.scss'

const ModuleListDropEnE = () =>{
    const moduleList = [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5]
return(
    <div className='ene_toolbar__dropdown'>
        <div className='ene_toolbar__dropdown_module'>
            <ScrollBar scrollId='toolbar_module-list' trackColor={'transperent'} thumbColor={'grey'}>
            {moduleList.map((e,i)=>{
                            return(
                                <div key={i} className={'toolbar__module-box'+((true)?" selected":"")}>
                                    <img value={e._id}  src={"static/imgs/node-modules.png"} alt='module'></img>
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
                                <span className='dropdown_scenarios' value={e._id} >{e}</span>
                            )
                        })}
                        </div>
            </ScrollBar>
        </div>
    </div>
)}

export default ModuleListDropEnE;
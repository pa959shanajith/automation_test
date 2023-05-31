import React, { useRef, Fragment, useState, useEffect } from 'react';
import {deleteScenario} from '../api';
import {ModalContainer, Messages as MSG, setMsg } from '../../global'
import { useDispatch,useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import '../styles/SaveMapButton.scss'

const DeleteScenarioPopUp = ({setDelSnrWarnPop,setBlockui,displayError}) => {
    const [submit,setSubmit] = useState(false)

    return(
        <ModalContainer 
        modalClass = 'modal-md'
        title='Do you want to delete the Scenarios?'
        close={()=>setDelSnrWarnPop(false)}
        footer={<Footer setSubmit={setSubmit} setDelSnrWarnPop={setDelSnrWarnPop}/>}
        content={<Container submit={submit} setSubmit={setSubmit} displayError={displayError} setDelSnrWarnPop={setDelSnrWarnPop} setBlockui={setBlockui}/>} 
      />
    )
}

const Container = ({submit,setSubmit,displayError,setDelSnrWarnPop,setBlockui}) => {
    const toDeleteScenarios = useSelector(state=>state.design.toDeleteScenarios)
    useEffect(()=>{
        if(submit){
            setSubmit(false)
            var scenarioIds=[]
            for(let i = 0 ;i<toDeleteScenarios.length; i++)
                scenarioIds.push(toDeleteScenarios[i].nodeid);
            (async()=>{
                setBlockui({show:true,content:'Loading ...'})
                var res = await deleteScenario({scenarioIds:scenarioIds})
                if(res.error){displayError(res.error);return;}
                setBlockui({show:false})
                setDelSnrWarnPop(false)
                setMsg(MSG.MINDMAP.SUCC_DELETE_SCENARIO)
            })()

        }
    },[submit])

    return(
        <div className="error_lists">
        <div className="um_listContent" id="umUpdateId">
        {/* <ScrollBar scrollId="umUpdateId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'> */}
        <>
        { toDeleteScenarios.map((scenario, i) => 
            <div className="scenario_parent_list">
                <span id='update_status' className="black_bullets"></span>
                <span key={i}>{scenario.scenarioName} from  
                {scenario.parents.map((parent,i)=>(i!==0 && i!=scenario.parents.length-1?', '+parent: i==0?" "+parent:' and '+parent))}
                </span>
            </div>) 
        }
        </>
        {/* </ScrollBar> */}
         </div>
         </div>
    )
};

const Footer = ({setSubmit,setDelSnrWarnPop}) =>{
    return(
      <Fragment>
            <div className='mnode__buttons'>
                <button onClick={()=>setSubmit(true)}>Yes</button>
                <button onClick={()=>setDelSnrWarnPop(false)}>No</button>
            </div>
      </Fragment>
    )
}

DeleteScenarioPopUp.propTypes={
    setBlockui :  PropTypes.func.isRequired,
    setDelSnrWarnPop : PropTypes.func.isRequired,
}

export default DeleteScenarioPopUp;
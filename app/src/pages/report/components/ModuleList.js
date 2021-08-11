
import React, { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import { ScrollBar } from '../../global';
import { getSuiteDetailsInExecution_ICE , getAccessibilityData} from '../api';
import * as actionTypes from '../state/action';
import { CLEAR_REPORTDATA } from '../../plugin/state/action';
import '../styles/ModuleList.scss'

/*Component ModuleList
  use: renders list of module in the dropdown in report landing page
*/

const ModuleList = ({FnReport,displayError,setBlockui,setModDrop,modDrop}) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.report.moduleList)
    const suiteSelected = useSelector(state=>state.report.suiteSelected)
    const reportData = useSelector(state=>state.plugin.RD);
    const moduleClick = async(e)=> {
        var suiteID = e.currentTarget.getAttribute('value')
        var suiteName = e.currentTarget.getAttribute('name')
        var arg,res;
        setBlockui({show:true,content:'Loading...'})
        if(!FnReport){
            arg = {"type":"reportdata_names_only","screendata":suiteName}
            res = await getAccessibilityData(arg)
        }else{
            arg = {"param":"getSuiteDetailsInExecution_ICE","testsuiteid":suiteID}
            res = await getSuiteDetailsInExecution_ICE(arg)            
        }
        if(res.error){displayError(res.error);return;}
        dispatch({type:actionTypes.UPDATE_SUITEDETAILS,payload:{suiteDetails:res,suiteID:{_id:suiteID,name:suiteName}}})
        setModDrop('semi')
        setBlockui({show:false})
    }
    useEffect(()=>{
        if(reportData && reportData.projectid && moduleList.length >0){
            (async()=>{
                var suiteID = reportData.testsuiteid
                var suiteName = reportData.testsuitename
                setBlockui({show:true,content:'Loading...'})
                var arg = {"param":"getSuiteDetailsInExecution_ICE","testsuiteid":suiteID}
                var res = await getSuiteDetailsInExecution_ICE(arg)
                if(res.error){displayError(res.error);return;}
                dispatch({type:actionTypes.UPDATE_SUITEDETAILS,payload:{suiteDetails:res,suiteID:{_id:suiteID,name:suiteName}}})
                setBlockui({show:false})
                dispatch({type:CLEAR_REPORTDATA,payload:{}})
                setModDrop('semi')
            })()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[reportData,moduleList])
    const modImage = {
        endtoend : "static/imgs/node-endtoend.png",
        screens : "static/imgs/node-screens.png",
        basic :  "static/imgs/node-modules.png"
    }
    return(
        <div id='rp_module-list' style={{height:modDrop}} className='rp_moduleList'>
            <ScrollBar scrollId='rp_module-list' trackColor={'transperent'} thumbColor={'grey'}>
                {moduleList.map((e,i)=>{
                    return(
                        <div  name={e.name} onClick={moduleClick} value={e._id} key={i} className={'toolbar__module-box'} title={e.name}>
                            <img style={{opacity:suiteSelected._id===e._id?0.5:1}} src={modImage[e.type?e.type:'basic']} alt='module'></img>
                            <span value={e._id} >{e.name}</span>
                        </div>
                    )
                })}
            </ScrollBar>
        </div>
    )
}

export default ModuleList;
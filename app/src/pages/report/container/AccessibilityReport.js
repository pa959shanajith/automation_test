import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import AccExecPanel from '../components/AccExecPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import AccDetailPanel from '../components/AccDetailPanel';
import * as actionTypes from '../state/action';
import '../styles/AccessibilityReport.scss';
import AccStatusPanel from '../components/AccStatusPanel';

/*Component AccessibilityReport
  use: renders AccessibilityReport is a container for report layout
*/

const AccessibilityReport = ({setBlockui,displayError}) =>{
	const dispatch = useDispatch()
    const [scDetails,setScDetails] = useState([])
    const [selectedScDetails,setSelectedDetails] = useState({_id:undefined,name:""})
    const [scStatus,setScStatus] = useState({})
    useEffect(()=>{
        return ()=>{
            dispatch({type:actionTypes.RESET_DETAILS})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    useEffect(()=>{
        if(selectedScDetails._id){
            var arr = {
                total : 0,
                inapplicable : 0,
                passes : 0,
                violations : 0
            }
            scDetails[0]["access-rules"].forEach(data => {
                if(data["selected"]) {
                    var statusData = scDetails[0].rulemap[data['tag'].replace(".","_")];
                    if(statusData.inapplicable!==undefined) arr.inapplicable +=  statusData.inapplicable.length;
                    if(statusData.passes!==undefined) arr.passes +=  statusData.passes.length;
                    if(statusData.violations!==undefined) arr.violations +=  statusData.violations.length;
                }
            })
            arr.total = arr.inapplicable + arr.passes + arr.violations;
            setScStatus(arr)   
        }else{
            setScStatus({})
        }
    },[scDetails])
    return(
        <Fragment>
            <div className='ar__body'>
                <div className='rp__content'>
                    <div className='left-content'>
                        <AccExecPanel selectedScDetails={selectedScDetails} setSelectedDetails={setSelectedDetails} setScDetails={setScDetails} setBlockui={setBlockui} displayError={displayError}/>
                    </div>
                    <div className='right-content'>
                        <AccStatusPanel selectedScDetails={selectedScDetails} scDetails={scDetails} arr={scStatus} setBlockui={setBlockui} displayError={displayError}/>
                    </div>
                </div>
                <div>
                    <AccDetailPanel selectedScDetails={selectedScDetails} scDetails={scDetails} setBlockui={setBlockui} displayError={displayError}/>
				</div>
            </div>
		</Fragment>
    )
}

export default AccessibilityReport;
import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import ExecPanel from '../components/ExecPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import ScDetailPanel from '../components/ScDetailPanel';
import * as actionTypes from '../state/action';
import '../styles/TestingReport.scss';

/*Component TestingReport
  use: renders TestingReport is a container for report layout
*/

const TestingReport = ({setBlockui,displayError}) =>{
    const dispatch = useDispatch()
    const [scDetails,setScDetails] = useState([])
    const [selectedScDetails,setSelectedDetails] = useState({_id:undefined,name:""})
    const [scStatus,setScStatus] = useState({})
    useEffect(()=>{
        return ()=>{
            // dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
            dispatch({type:actionTypes.RESET_DETAILS})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    useEffect(()=>{
        if(selectedScDetails._id){
            var arr = {
                total : scDetails.length,
                pass : 0,
                fail : 0,
                terminate : 0,
                incomplete : 0,
                skipped : 0
            }
            scDetails.forEach((e,i)=>{
                var status = e.status.toLowerCase()
                if(status in arr){
                    arr[status]=++arr[status]
                }
            })
            setScStatus(arr)   
        }else{
            setScStatus({})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[scDetails])
    return(
        <Fragment>
            <div className='tr__body rp__content'>
                <div className='left-content'>
                    <ExecPanel selectedScDetails={selectedScDetails} setSelectedDetails={setSelectedDetails} setScDetails={setScDetails} setBlockui={setBlockui} displayError={displayError}/>
                </div>
                <div className='right-content'>
                    <ScStatusPanel selectedScDetails={selectedScDetails} arr={scStatus} setBlockui={setBlockui} displayError={displayError}/>
                </div>
            </div>
            <div className=' tr__body bottom-content'>
                <ScDetailPanel selectedScDetails={selectedScDetails} scDetails={scDetails} setBlockui={setBlockui} displayError={displayError}/>
            </div>
        </Fragment>
    )
}

export default TestingReport;
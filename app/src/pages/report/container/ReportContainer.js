import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import ExecutionPanel from '../components/ExecutionPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import ScDetailPanel from '../components/ScDetailPanel';
import * as actionTypes from '../state/action';
import '../styles/ReportContainer.scss';

/*Component ReportContainer
  use: renders ReportContainer is a container for report layout
*/

const ReportContainer = () =>{
    const dispatch = useDispatch()
    const [modDrop,setModDrop] = useState(true)
    const [popup,setPopup] = useState({show:false})
    const [blockui,setBlockui] = useState({show:false})
    const [scDetails,setScDetails] = useState([])
    const [selectedScDetails,setSelectedDetails] = useState({_id:undefined,name:""})
    const [scStatus,setScStatus] = useState({})
    const displayError = (error) =>{
        setBlockui(false)
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
    useEffect(()=>{
        return ()=>{
            dispatch({type:actionTypes.UPDATE_MODULELIST,payload:[]})
        }
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
    },[scDetails])
    return(
        <Fragment>
            {(blockui.show)?<ScreenOverlay content={blockui.content}/>:null}
            {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            <div className='rp__main_container'>
                <ScrollBar>
                <div className='container-padding'>
                    <div className='rp__title'>
                        <span>Reports</span>
                    </div>
                    <div className='rp__body'>
                        <div className='rp__header-select' style={{height:(modDrop?'60px':'250px')}}>
                            <ToolbarMenu setModDrop={setModDrop} setBlockui={setBlockui} displayError={displayError}/>
                            <ModuleList setModDrop={setModDrop} setBlockui={setBlockui} displayError={displayError} modDrop={modDrop}/>
                            <div className='rp__footer'>
                                <span onClick={()=>setModDrop(!modDrop)}>
                                    <i className={(modDrop)?"fa fa-caret-down":"fa fa-caret-up"} title="Drop down button"></i>
                                </span>
                            </div>
                        </div>
                        <div className='rp__content'>
                            <div className='left-content'>
                                <ExecutionPanel selectedScDetails={selectedScDetails} setSelectedDetails={setSelectedDetails} setScDetails={setScDetails} setBlockui={setBlockui} displayError={displayError}/>
                            </div>
                            <div className='right-content'>
                                <ScStatusPanel selectedScDetails={selectedScDetails} arr={scStatus} setBlockui={setBlockui} displayError={displayError}/>
                            </div>
                        </div>
                        <div className='bottom-content'>
                            <ScDetailPanel selectedScDetails={selectedScDetails} scDetails={scDetails} setBlockui={setBlockui} displayError={displayError}/>
                        </div>
                    </div>
                </div>
                </ScrollBar>
            </div>
        </Fragment>
    )
}

export default ReportContainer;
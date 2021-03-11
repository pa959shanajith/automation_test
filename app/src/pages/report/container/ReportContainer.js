import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import ExecutionPanel from '../components/ExecutionPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import ScDetailPanel from '../components/ScDetailPanel';
import TestingReport from './TestingReport';
import AccessibilityReport from './AccessibilityReport';
import * as actionTypes from '../state/action';
import '../styles/ReportContainer.scss';

/*Component ReportContainer
  use: renders ReportContainer is a container for report layout
*/

const ReportContainer = () =>{
    const [modDrop,setModDrop] = useState(true)
    const [popup,setPopup] = useState({show:false})
    const [blockui,setBlockui] = useState({show:false})
    const [FnReport,setFnReport] =  useState({show:true})
    const displayError = (error) =>{
        setBlockui(false)
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }
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
                    <div className='rp__title-btn'>
                        <span className={FnReport ? 'active-btn' : ''} onClick={()=>setFnReport(true)}>Functional Testing</span>
                        <span className={!FnReport ? 'active-btn' : ''} onClick={()=>setFnReport(false)}>Accessibility Testing</span>
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
                        {FnReport ? 
                            <TestingReport setBlockui={setBlockui} displayError={displayError}/>:
                            <AccessibilityReport setBlockui={setBlockui} displayError={displayError}/>
                        }
                    </div>
                </div>
                </ScrollBar>
            </div>
        </Fragment>
    )
}

export default ReportContainer;
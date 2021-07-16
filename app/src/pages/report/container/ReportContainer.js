import React, { useState, Fragment, useEffect } from 'react';
import ModuleList from '../components/ModuleList';
import ToolbarMenu from '../components/ToolbarMenu';
import { ScreenOverlay ,PopupMsg, ScrollBar, updateScrollBar} from '../../global';
import { useDispatch } from 'react-redux';
import ExecutionPanel from '../components/ExecPanel';
import ScStatusPanel from '../components/ScStatusPanel';
import ScDetailPanel from '../components/ScDetailPanel';
import TestingReport from './TestingReport';
import AccessibilityReport from './AccessibilityReport';
import * as actionTypes from '../state/action';
import '../styles/ReportContainer.scss';

/*Component ReportContainer
  use: renders ReportContainer is a container for report layout
*/

const dropSize = {
    close : 55,
    semi: 150,
    full: 230
}
const ReportContainer = () =>{
    const [modDrop,setModDrop] = useState('close')
    const [popup,setPopup] = useState({show:false})
    const [blockui,setBlockui] = useState({show:false})
    const [FnReport,setFnReport] =  useState(true)
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
            <div id='rp-body-scroll' className='rp__main_container'>
                <ScrollBar scrollId={'rp-body-scroll'}>
                <div className='container-padding'>
                    <div className='rp__title'>
                        <span>Reports</span>
                    </div>
                    <div className='rp__title-btn'>
                        <span className={FnReport ? 'active-btn' : ''} onClick={()=>setFnReport(true)}>Functional Testing</span>
                        <span className={!FnReport ? 'active-btn' : ''} onClick={()=>setFnReport(false)}>Accessibility Testing</span>
                    </div>
                    <div className='rp__body'>
                        <div className='rp__header-select' style={{height:dropSize[modDrop]+'px'}}>
                            <ToolbarMenu FnReport={FnReport} setModDrop={setModDrop} setBlockui={setBlockui} displayError={displayError}/>
                            <ModuleList modDrop={dropSize[modDrop]-50+'px'} FnReport={FnReport} setModDrop={setModDrop} setBlockui={setBlockui} displayError={displayError}/>
                            <div className='rp__footer'>
                                <span onClick={()=>{
                                    if(modDrop==='semi')setModDrop('full');
                                    else if(modDrop==='close')return;
                                    else setModDrop('semi');
                                    setTimeout(()=>{updateScrollBar()}, 2501);
                                    }}>
                                    <i className={(modDrop === 'full')?"fa fa-caret-up":"fa fa-caret-down"} title="Drop down button"></i>
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
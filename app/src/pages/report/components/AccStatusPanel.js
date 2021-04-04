import React, { useState ,useEffect } from 'react';
import { Fragment } from 'react';
import '../styles/AccStatusPanel.scss';


/*Component AccStatusPanel
  use: renders AccStatusPanel in report landing page
*/

const AccStatusPanel = ({arr,selectedScDetails,scDetails}) =>{
    const [data,setData] = useState({P:0,F:0,T:0,I:0})
    useEffect(()=>{
        if(Object.keys(arr).length>0 && arr.total !== 0){
            var P = parseFloat((arr.pass / arr.total) * 100).toFixed();
            var F = parseFloat((arr.fail / arr.total) * 100).toFixed();
            var T = parseFloat((arr.terminate / arr.total) * 100).toFixed();
            var I = parseFloat((arr.incomplete / arr.total) * 100).toFixed();
            setData({P,F,T,I})
        }else{
            setData({P:0,F:0,T:0,I:0})
        }
    },[arr])
    if(Object.keys(arr).length<1 || scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div className ='ar__status_panel'>
                <div  className='panel top-tile'>
                    <div className='ac__panel-head'>Report Data</div>
                    <div className='ac__panel-body'>
                        <div className='left-float'>
                            <div><span className='title'>Crawl Name</span><span>{scDetails[0].screenname}</span></div>
                            <div><span className='title'>URL</span><span>{scDetails[0].url}</span></div>
                        </div>
                        <div className='right-float'>
                            <div><span className='title'>Agent</span>{scDetails[0].agent}<span></span></div>
                            <div><span className='title'>Level</span>{scDetails[0].level}<span></span></div>
                        </div>
                    </div>
                </div>
                <div className='panel'>
                    <div className='ac__panel-head'>Executions</div>
                    <div className='status-panel'>
                        <div className='status-row' style={{color:'#28a745'}}>
                            <span className='label'>Pass</span>
                            <span className='perc'>{data.P+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.P+'%',background:'#28a745'}}></div>
                            </div>
                        </div>
                        <div className='status-row' style={{color:'#28a745'}}>
                            <span className='label'>Pass</span>
                            <span className='perc'>{data.P+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.P+'%',background:'#dc3545'}}></div>
                            </div>
                        </div>
                        <div className='status-row' style={{color:'#28a745'}}>
                            <span className='label'>Pass</span>
                            <span className='perc'>{data.P+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.P+'%',background:'#ffc107'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default AccStatusPanel
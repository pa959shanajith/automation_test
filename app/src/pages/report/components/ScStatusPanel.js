import React, { useState, useEffect } from 'react';
import '../styles/ScStatusPanel.scss';

/*Component ScStatusPanel
  use: renders status panel on the right of the report layout.
*/

const ScStatusPanel = ({arr,selectedScDetails}) =>{
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
    if(Object.keys(arr).length<1){
        return null;
    }
    return(
        <div id='rp__execution-panel' className='panel rp__executions'>
            <div className='rp__panel-head'>E<sub>{selectedScDetails.name}</sub> - Scenario Status</div>
            <div className='rp__execution-table status-panel'>
                <div className='status-row' style={{color:'#28a745'}}>
                    <span className='label'>Pass</span>
                    <span className='perc'>{data.P+'%'}</span>
                    <div className='progress'>
                        <div className='progress-bar' style={{width:data.P+'%',background:'#28a745'}}></div>
                    </div>
                </div>
                <div className='status-row' style={{color:'#dc3545'}}>
                    <span className='label'>Fail</span>
                    <span className='perc'>{data.F+'%'}</span>
                    <div className='progress'>
                        <div className='progress-bar' style={{width:data.F+'%',background:'#dc3545'}}></div>
                    </div>
                </div>
                <div className='status-row' style={{color:'#ffc107'}}>
                    <span className='label'>Terminate</span>
                    <span className='perc'>{data.T+'%'}</span>
                    <div className='progress'>
                        <div className='progress-bar' style={{width:data.T+'%',background:'#ffc107'}}></div>
                    </div>
                </div>
                <div className='status-row' style={{color:'#343a40'}}>
                    <span className='label'>Incomplete</span>
                    <span className='perc'>{data.I+'%'}</span>
                    <div className='progress'>
                        <div className='progress-bar' style={{width:data.I+'%',background:'#343a40'}}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScStatusPanel;
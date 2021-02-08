import React, { useState , useEffect } from 'react';
import { useSelector } from 'react-redux'
import { ScrollBar } from '../../global';
import '../styles/ExecutionPanel.scss';
import { reportStatusScenarios_ICE } from '../api';


/*Component ExecutionPanel
  use: renders ExecutionPanel in report landing page
*/

const ExecutionPanel = ({displayError,setBlockui,setScDetails,setSelectedDetails,selectedScDetails}) =>{
    const suDetails = useSelector(state=>state.report.suiteDetails)
    const suiteSelected = useSelector(state=>state.report.suiteSelected)
    const [suiteDetails,setSuiteDetails] =  useState([])
    const [sortUp,setSortUp] = useState(true)
    useEffect(()=>{
        if(suDetails.length>0){
            var arr = dateASC([...suDetails])
            setSuiteDetails(arr)           
        }
    },[suDetails])
    useEffect(()=>{
        setSelectedDetails({_id:undefined,name:''})
        setScDetails([])
    },[suiteSelected._id,suDetails])
    const onClickRow = async(e) =>{
        const val = e.currentTarget.getAttribute('value')
        const name = e.currentTarget.getAttribute('name')
        var arg = {
            "param":"reportStatusScenarios_ICE",
            "executionId":val,
            "testsuiteId":suiteSelected._id
        }
        setBlockui({show:true,content:'Loading Scenarios...'})
        var res = await reportStatusScenarios_ICE(arg)
        if(res.error){displayError(res.error);return;}
        setSelectedDetails({_id:val,name:name})
        setScDetails(res)
        setBlockui({show:false})
    }
    const sortTable = () =>{
        var arr = [...suiteDetails].reverse()
        setSuiteDetails(arr)
        setSortUp(!sortUp)
    }
    if(!suiteSelected._id){
        return null;
    }
    return(
        <div id='rp__execution-panel' className='panel rp__executions'>
            <div className='rp__panel-head'>{suiteSelected.name} - Executions</div>
                <div className='rp__execution-table'>
                    <div className='rp__row'>
                        <div className='rp__col'>Execution No</div>
                        <div className='rp__col'>
                            <span>Start Date & Time</span>                                   
                            <i onClick={sortTable} className={(sortUp)?"fa fa-caret-up":"fa fa-caret-down"} title="Drop down button"></i>
                        </div>
                        <div className='rp__col'>
                            <span>End Date & Time</span> 
                            <i onClick={sortTable} className={(!sortUp)?"fa fa-caret-up":"fa fa-caret-down"} title="Drop down button"></i>
                        </div>
                    </div>
                    <div id='rp__row_content'>
                        <ScrollBar scrollId='rp__row_content' trackColor='transparent'>
                        {suiteDetails.map((e,i)=>
                        <div key={e.execution_id} onClick={onClickRow} name={(sortUp)?i+1:suiteDetails.length-i} value={e.execution_id} className={'rp__row'+(selectedScDetails._id===e.execution_id?" selected-row":"")}>
                            <div className='rp__col'>E<sub>{(sortUp)?i+1:suiteDetails.length-i}</sub></div>
                            <div className='rp__col'>{e.start_time}</div>
                            <div className='rp__col'>{e.end_time}</div>
                        </div>
                        )}
                        </ScrollBar>
                    </div>
                </div>
        </div>
    )
}

const dateASC = (dateArray)=> {
    dateArray.sort((a, b)=> {
        var aA, timeA, bB, timeB;
        var dateTimeA = a.start_time.split(" ");
        aA = dateTimeA[0];
        timeA = dateTimeA[1];
        var dateTimeB = b.start_time.split(" ");
        bB = dateTimeB[0];
        timeB = dateTimeB[1];
        var fDate = aA.split("-");
        var lDate = bB.split("-");
        var gDate = fDate[2] + "-" + fDate[1] + "-" + fDate[0];
        var mDate = lDate[2] + "-" + lDate[1] + "-" + lDate[0];
        if (new Date(gDate + " " + timeA) >= new Date(mDate + " " + timeB)) return 1;
        if (new Date(gDate + " " + timeA) <= new Date(mDate + " " + timeB)) return -1;
    })
    return dateArray
}

export default ExecutionPanel;
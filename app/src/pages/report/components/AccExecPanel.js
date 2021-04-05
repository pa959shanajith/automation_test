import React, { useState , useEffect } from 'react';
import { useSelector } from 'react-redux'
import { ScrollBar } from '../../global';
import '../styles/AccExecPanel.scss';
import {  getAccessibilityData} from '../api';
import { Fragment } from 'react';


/*Component AccExecPanel
  use: renders ExecutionPanel in report landing page
*/

const AccExecPanel = ({displayError,setBlockui,setScDetails,setSelectedDetails,selectedScDetails}) =>{
    const suDetails = useSelector(state=>state.report.suiteDetails)
    const suiteSelected = useSelector(state=>state.report.suiteSelected)
    const [suiteDetails,setSuiteDetails] =  useState([])
    const [sortUp,setSortUp] = useState(false)
    const sortTable = () =>{
        var arr = [...suiteDetails].reverse()
        setSuiteDetails(arr)
        setSortUp(!sortUp)
    }
    const onClickRow = async(e)=> {
        const val = e.currentTarget.getAttribute('value')
        const name = e.currentTarget.getAttribute('name')
        var arg = {
            "type":"reportdata",
            "executionid":val
        }
        setBlockui({show:true,content:'Loading Scenarios...'})
        var res = await getAccessibilityData(arg)
        if(res.error){displayError(res.error);return;}
        setSelectedDetails({_id:val,name:name})
        setScDetails(res)
        setBlockui({show:false})
    }
    useEffect(()=>{
        if(suDetails.length>0){
            // var arr = dateASC([...suDetails]).reverse()
            var arr=[...suDetails]
            setSuiteDetails(arr)           
        }else{
            setSuiteDetails([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[suDetails])
    useEffect(()=>{
        setSelectedDetails({_id:undefined,name:''})
        setScDetails([])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[suiteSelected._id,suDetails])
    return(
        <Fragment>
        { suiteSelected.name &&
        <div id='ac__execution-panel' className='panel ac__executions'>
            <div className='ac__panel-head'>{suiteSelected.name} - Executions</div>
            <div className='ac__execution-table'>
                <div className='ac__row'>
                    <div className='ac__col'>Execution No</div>
                    <div className='ac__col'>Title</div>
                    <div className='ac__col'>
                        <span>Executed Time</span>                                   
                        <i onClick={sortTable} className={(sortUp)?"fa fa-caret-up":"fa fa-caret-down"} title="Drop down button"></i>
                    </div>
                </div>
                <div id='ac__row_content'>
                    <ScrollBar scrollId='ac__row_content' trackColor='transparent'>
                    {(suiteDetails.length>0)?
                        suiteDetails.map((e,i)=>
                        <div key={e.execution_id} onClick={onClickRow} name={(sortUp)?i+1:suiteDetails.length-i} value={e._id} className={'ac__row'+(false?" selected-row":"")}>
                            <div className='ac__col'>E<sub>{(sortUp)?i+1:suiteDetails.length-i}</sub></div>
                            <div className='ac__col'>{e.title}</div>
                            <div className='ac__col'>{e.executedtime}</div>
                        </div>):
                        <div style={{textAlign:'center',padding:'30px',height:'100%'}} className='ac__row'>
                            No record(s) found
                        </div>
                    }
                    </ScrollBar>
                </div>
            </div>
        </div>
        }
        </Fragment>
    )
}

export default AccExecPanel;
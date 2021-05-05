import React, { useState , useEffect } from 'react';
import { useSelector } from 'react-redux'
import { ScrollBar } from '../../global';
import '../styles/AccExecPanel.scss';
import {  getAccessibilityData} from '../api';
import { Fragment } from 'react';


/*Component AccExecPanel
  use: renders ExecutionPanel in report landing page
*/

const AccExecPanel = ({displayError,setBlockui,setScDetails,setSelectedDetails}) =>{
    const dateFormat = useSelector(state=>state.login.dateformat);
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
        if(suDetails!==undefined && suDetails.length>0){
            var arr=[...suDetails].reverse()
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

    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour
        if (minute.length < 2)
            minute = '0' + minute 

        let map = {"MM":month,"YYYY": year, "DD": day};
        let def = [day,month,year];
        let format = dateFormat.split("-");
        let arr = []
        let used = {}
        for (let index in format){
            if (!(format[index] in map) || format[index] in used){
                return def.join('-') + " " + [hour,minute].join(':');
            }
            arr.push(map[format[index]]) 
            used[format[index]] = 1
        }

        return arr.join('-') + " " + [hour,minute].join(':');
    }
    return(
        <Fragment>
        { suiteSelected.name &&
        <div id='ac__execution-panel' className='panel ac__executions'>
            <div className='ac__panel-head'>{suiteSelected.name} - Executions</div>
            <div className='ac__execution-table'>
                <div data-test="ac_head" className='ac__row'>
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
                        <div key={`ac-${i}`} onClick={onClickRow} name={(sortUp)?i+1:suiteDetails.length-i} value={e._id} className={'ac__row'+(false?" selected-row":"")}>
                            <div className='ac__col'>E<sub>{(sortUp)?i+1:suiteDetails.length-i}</sub></div>
                            <div data-test="ac_title" className='ac__col'>{e.title}</div>
                            <div data-test="ac_executedtime" className='ac__col'>{formatDate(e.executedtime)}</div>
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
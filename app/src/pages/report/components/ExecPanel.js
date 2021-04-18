import React, { useState , useEffect } from 'react';
import { useSelector } from 'react-redux'
import { ScrollBar } from '../../global';
import '../styles/ExecPanel.scss';
import { reportStatusScenarios_ICE } from '../api';


/*Component ExecutionPanel
  use: renders ExecutionPanel in report landing page
*/

const ExecPanel = ({displayError,setBlockui,setScDetails,setSelectedDetails,selectedScDetails}) =>{
    const suDetails = useSelector(state=>state.report.suiteDetails)
    const dateFormat = useSelector(state=>state.login.dateformat);
    const suiteSelected = useSelector(state=>state.report.suiteSelected)
    const [suiteDetails,setSuiteDetails] =  useState([])
    const [sortUp,setSortUp] = useState(false)
    useEffect(()=>{
        if(suDetails.length>0){
            var arr = dateASC([...suDetails]).reverse()
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

    const formatDate = (date) => {
        let dateTime = date.replace(" ", "-").split("-");
        let time = dateTime[dateTime.length - 1].split(":");
        let day = dateTime[0]
        let month = dateTime[1]
        let year = dateTime[2]
        let hour = time[0]
        let minute = time[1]
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
                        {(suiteDetails.length>0)?
                            suiteDetails.map((e,i)=>
                            <div key={e.execution_id} onClick={onClickRow} name={(sortUp)?i+1:suiteDetails.length-i} value={e.execution_id} className={'rp__row'+(selectedScDetails._id===e.execution_id?" selected-row":"")}>
                                <div className='rp__col'>E<sub>{(sortUp)?i+1:suiteDetails.length-i}</sub></div>
                                <div data-test="start_date" className='rp__col'>{formatDate(e.start_time)}</div>
                                <div data-test="end_date" className='rp__col'>{formatDate(e.end_time)}</div>
                            </div>):
                            <div style={{textAlign:'center',padding:'30px',height:'100%'}} className='rp__row'>
                                No record(s) found
                            </div>
                        }
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
        return -1;
    })
    var a = [...dateArray]
    a.forEach((e,i)=>{
        var eD , eT;
        var startDat = (e.start_time.split(' ')[0]).split("-")
        var startTym = (e.start_time.split(' ')[1]).split(":")
        var sD = ("0" + startDat[0]).slice(-2) + "-" + ("0" + startDat[1]).slice(-2) + "-" + startDat[2];
        var sT = ("0" + startTym[0]).slice(-2) + ":" + ("0" + startTym[1]).slice(-2);
        if (e.end_time === '-') {
            eD = '-';
            eT = '';
        } else {
            var endDat = (e.end_time.split(' ')[0]).split("-")
            var endTym = (e.end_time.split(' ')[1]).split(":")
            eD = ("0" + endDat[0]).slice(-2) + "-" + ("0" + endDat[1]).slice(-2) + "-" + endDat[2];
            eT = ("0" + endTym[0]).slice(-2) + ":" + ("0" + endTym[1]).slice(-2);
        }
        dateArray[i].start_time =  sD + " " + sT 
        dateArray[i].end_time =  eD + " " + eT 
    })
    return dateArray
}

export default ExecPanel;
import React, { useState, useEffect } from 'react';
import { ScrollBar } from '../../global';
import { useSelector } from 'react-redux';
import { viewReport } from '../api'
import '../styles/ScDetailPanel.scss';

/*Component ModuleList
  use: renders list of scenarios in the bottom panel of the report landing page
*/

const ScDetailPanel = ({scDetails,setBlockui,displayError,selectedScDetails}) =>{
    const [sortUp,setSortUp] = useState(true);
    const dateFormat = useSelector(state=>state.login.dateformat);
    const [arr,setArr] = useState([])
    useEffect(()=>{
        var data = dateASC([...scDetails])
        setArr(data)
    },[scDetails])
    const getReport = (e) => {
        Report(e,setBlockui,displayError)
    }
    const sortTable = () => {
        var data = [...arr].reverse()
        setArr(data)
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

    if(!selectedScDetails._id){
        return null;
    }
    
    return(
        <div id='rp__detail-panel' className='panel rp__detail'>
            <div className='rp__panel-head'>E<sub>{selectedScDetails.name}</sub> -   Scenario Details</div>
            <div className='rp__detail-table'>
                    <div className='rp__row'>
                        <div className='rp__col'>Scenario Name</div>
                        <div className='rp__col browser'>Browser</div>
                        <div className='rp__col'>
                            <span>End Date & Time</span>                                   
                            <i onClick={sortTable} className={(sortUp)?"fa fa-caret-up":"fa fa-caret-down"} title="Drop down button"></i>
                        </div>
                        <div className='rp__col status'>Status</div>
                        <div className='rp__col export'>View Report</div>
                    </div>
                <div id='pr_detail-scroll-box'>
                    <ScrollBar scrollId='pr_detail-scroll-box'>
                    {(arr.length>0)?
                        arr.map((e,i)=>   
                        <div key={e.reportid} className='rp__row cont-body'>
                            <div className='rp__col'>{e.testscenarioname}</div>
                            <div className='rp__col browser'>
                                {e.browser.toLowerCase() in imgs?
                                <img src={"static/imgs/"+imgs[e.browser.toLowerCase()]} alt={e.browser}/>:
                                "-"
                                }
                            </div>
                            <div className='rp__col'>{formatDate(e.executedtime)}</div>
                            <div className={'rp__col status '+e.status.toLowerCase()}>{e.status}</div>
                            <div className='rp__col export' scname={e.testscenarioname}>
                                <img type={'pdf'} value={e.reportid} onClick={getReport} src={"static/imgs/ic-pdf.png"} alt={e.browser}/>
                                <img type={'html'} value={e.reportid} onClick={getReport} src={"static/imgs/ic-web.png"} alt={e.browser}/>
                                <img type={'json'} value={e.reportid} onClick={getReport} src={"static/imgs/ic-export-to-json.png"} alt={e.browser}/>
                            </div>
                        </div>
                        )
                        :
                        <div style={{textAlign:'center',padding:'30px'}} className='rp__row'>
                            No record(s) found
                        </div>
                    }
                    </ScrollBar>
                </div>
            </div>
        </div>
    )
}
const imgs = {
    chrome : "ic-reports-chrome.png",
    firefox : "ic-reports-firefox.png",
    "internet explorer" : "ic-reports-ie.png",
    safari : "ic-reports-safari.png"
} 

const Report = async(e,setBlockui,displayError)=>{
    setBlockui({show:true,content:'Loading Report...'})
    var reportType = e.currentTarget.getAttribute('type')
    var reportID = e.currentTarget.getAttribute('value')
    var scName = e.currentTarget.parentElement.getAttribute('scname')
    if(reportType==='html'){
        const reportURL = window.location.origin + "/viewReport/" + reportID;
        setBlockui({show:false})
        return window.open(reportURL, '_blank');
    }
    var data =  await viewReport(reportID, reportType)
    if(data.error){displayError(data.error);return;}
    if (reportType === "json") data = JSON.stringify(data, undefined, 2);
    var filedata = new Blob([data], {
        type: "application/"+reportType+";charset=utf-8"
    });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(filedata, scName);
    } else {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(filedata);
        a.download = scName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(a.href);
        document.body.removeChild(a);
    }
    setBlockui({show:false})
}

const dateASC = (dateArray)=> {
    dateArray.sort((a, b)=> {
        var aA, timeA, bB, timeB;
        var dateTimeA = a.executedtime.split(" ");
        aA = dateTimeA[0];
        timeA = dateTimeA[1];
        var dateTimeB = b.executedtime.split(" ");
        bB = dateTimeB[0];
        timeB = dateTimeB[1];
        var fDate = aA.split("-");
        var lDate = bB.split("-");
        var gDate = fDate[2] + "-" + fDate[1] + "-" + fDate[0];
        var mDate = lDate[2] + "-" + lDate[1] + "-" + lDate[0];
        if (new Date(gDate + " " + timeA) >= new Date(mDate + " " + timeB)) return 1;
        else return -1;
    })
    return dateArray
}

export default ScDetailPanel;
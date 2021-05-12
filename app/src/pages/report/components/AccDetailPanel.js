import React, { useState , useEffect } from 'react';
import { Fragment } from 'react';
import AccStandardDesc from './AccStandardDesc';
import '../styles/AccDetailPanel.scss';

const AccDetailPanel = ({scDetails}) => {

    const [showStandardDescTable,setShowStandardDescTable] = useState(false);
    const [tableData,setTableData] = useState([]);
    
    useEffect(()=>{
        var details = [];
        setShowStandardDescTable(false);
        if (scDetails.length < 1)return ;
        for(var i=0;i<scDetails[0]["access-rules"].length;i++){
            if(scDetails[0]["access-rules"][i]["selected"]) details.push(scDetails[0]["access-rules"][i]);
        }
        setTableData(details);
    },[scDetails])

    if (scDetails.length < 1){
        return null;
    }
    
    return(
        <Fragment>
            <div id='ar__detail-panel' className='panel rp__detail'>
                <div className="ac__panel-head">Accessibility Reports by Standards</div>
                <div className='ar__standard-table'>
                    <div data-test="ar_detail-head" className="ar__standard-head">
                        <div className="ar__sn" >S.No.</div>
                        <div className="ar__standard" >Standard </div>
                        <div className="ar__status" >Status</div>
                        <div className="ar__report" >View Standard Report</div>
                    </div>
                    {tableData.map((data,i)=>(
                        <div key={`a-${i}`} className="ar__standard-row">
                            <div data-test="ar_detail-sn" className="ar__sn" >{i+1}</div>
                            <div data-test="ar_detail-stname" className="ar__standard" >{data["name"]} </div>
                            <div data-test="ar_detail-status" className={"ar__status "+(data["pass"]?"pass":"fail")} >{data["pass"]?"Pass":"Fail"}</div>
                            <div data-test="ar_detail-report" className="ar__report" ><label className="ar__report-generate" onClick={()=>{setShowStandardDescTable({rowData:Object.entries(scDetails[0].rulemap[data['tag'].replace(".","_")]),name:data["name"]});}}>Report</label></div>
                        </div>
                    ))}
                </div>
            </div>
            {showStandardDescTable!==false? <AccStandardDesc scDetails={scDetails} standardTypeDetails={showStandardDescTable} />:null}
        </Fragment>
    )
}

export default AccDetailPanel;
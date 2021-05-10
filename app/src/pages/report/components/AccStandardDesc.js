import React, { useState, useEffect } from 'react';
import { Fragment } from 'react';
import '../styles/AccStandardDesc.scss';

const AccStandardDesc = ({scDetails, standardTypeDetails}) => {
    const [descData,setDescData] = useState(standardTypeDetails.rowData)
    useEffect(()=>{
        var sNo = 0;
        var data =[...standardTypeDetails.rowData]
        for(var i=0 ; i< data.length;i++){    
            data[i].push(sNo);
            sNo+=data[i][1].length;
        }
        setDescData(data);
    },[standardTypeDetails.rowData])
    if (scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div id='ar__StDesc-panel'>
                <div className="ar__Desc-head">Selected Standard: {standardTypeDetails.name}</div>
                <div className='ar__stDesc-table panel'>
                    <div data-test="ar_desc-head" className="ar__stDesc-head">
                        <div className="ar__stDesc-sn" >S.No.</div>
                        <div className="ar__stDesc-status" >Status</div>
                        <div className="ar__stDesc-desc" >Description </div>
                        <div className="ar__stDesc-help" >Help</div>
                        <div className="ar__stDesc-impact" >Impact</div>
                    </div>
                    {descData.map((status,i)=>(
                        status[2]!==undefined ?
                        status[1].map((data,index)=>(
                            <div key={`as-${index}`} className="ar__stDesc-row">
                                <div data-test="ar_sn" className="ar__stDesc-sn" >{status[2]+index+1}</div>
                                <div data-test="ar_status" className="ar__stDesc-status" >{status[0] || "N/A"}</div>
                                <div data-test="ar_desc" className="ar__stDesc-desc" >{data.description || "N/A"} </div>
                                <div data-test="ar_help" className="ar__stDesc-help" >{data.help || "N/A"}</div>
                                <div data-test="ar_impact" className="ar__stDesc-impact" >{data.impact || "N/A"}</div>
                            </div>
                        )):<Fragment key={`as-${i}`}></Fragment>
                    ))} 
                </div>
            </div>
        </Fragment>
    )
}

export default AccStandardDesc;
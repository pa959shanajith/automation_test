import React from 'react';
import { Fragment } from 'react';
import '../styles/AccStandardDesc.scss';

const AccStandardDesc = ({scDetails, standardTypeDetails}) => {
    if (scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div id='ar__StDesc-panel'>
                <div className="ar__Desc-head">Selected Standard: {standardTypeDetails.name}</div>
                <div className='ar__stDesc-table'>
                    <div className="ar__stDesc-head">
                        <div className="ar__stDesc-sn" >S.No.</div>
                        <div className="ar__stDesc-status" >Status</div>
                        <div className="ar__stDesc-desc" >Description </div>
                        <div className="ar__stDesc-help" >Help</div>
                        <div className="ar__stDesc-impact" >Impact</div>
                    </div>
                    {Object.entries(standardTypeDetails.rowData).map((status)=>(
                        status[1].map((data,index)=>(
                            <div key={index} className="ar__stDesc-row">
                                <div className="ar__stDesc-sn" >1</div>
                                <div className="ar__stDesc-status" >{status[0] || "N/A"}</div>
                                <div className="ar__stDesc-desc" >{data.description || "N/A"} </div>
                                <div className="ar__stDesc-help" >{data.help || "N/A"}</div>
                                <div className="ar__stDesc-impact" >{data.impact || "N/A"}</div>
                            </div>
                        ))
                    ))} 
                </div>
            </div>
        </Fragment>
    )
}

export default AccStandardDesc;
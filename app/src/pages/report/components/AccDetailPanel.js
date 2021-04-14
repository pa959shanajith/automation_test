import React, { useState , useEffect } from 'react';
import { Fragment } from 'react';
import AccStandardDesc from './AccStandardDesc';
import '../styles/AccDetailPanel.scss';

const AccDetailPanel = ({scDetails}) => {

    const [showStandardDescTable,setShowStandardDescTable] = useState(false);


    if (scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div id='ar__detail-panel' className='panel rp__detail'>
                <div className="ac__panel-head">Accessibility Reports by Standards</div>
                <div className='ar__standard-table'>
                    <div className="ar__standard-head">
                        <div className="ar__sn" >S.No.</div>
                        <div className="ar__standard" >Standard </div>
                        <div className="ar__status" >Status</div>
                        <div className="ar__report" >View Standard Report</div>
                    </div>
                    {scDetails[0]["access-rules"].map((data,i)=>(
                        data["selected"]?
                        <div key={i} className="ar__standard-row">
                            <div className="ar__sn" >{i}</div>
                            <div className="ar__standard" >{data["name"]} </div>
                            <div className={"ar__status "+(data["pass"]?"pass":"fail")} >{data["pass"]?"Pass":"Fail"}</div>
                            <div className="ar__report" ><label className="ar__report-generate" onClick={()=>{setShowStandardDescTable({rowData:scDetails[0].rulemap[data['tag'].replace(".","_")],name:data["name"]});}}>Report</label></div>
                        </div>
                        :null
                    ))}
                </div>
            </div>
            {showStandardDescTable!==false? <AccStandardDesc scDetails={scDetails} standardTypeDetails={showStandardDescTable} />:null}
        </Fragment>
    )
}

export default AccDetailPanel;
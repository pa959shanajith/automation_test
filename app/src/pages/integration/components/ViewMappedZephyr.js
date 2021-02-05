import React, { Fragment } from 'react';

const ViewMappedZephyr=(props)=>{
    return(
    <div  className="integration_middleContent">
                <div className="middle_holder">
                    <div className="page-taskName" >
                        <span className="taskname">
                            Mapped files
                        </span>
                    </div>
                    <div className="qcActionBtn">
                        <label>Avo Assure Scenarios</label>
                        <label id="scenarioLabel">ALM Testcases</label>
                    </div>
                    { props.mappedfilesRes.length?
                    <Fragment>
                        <div className="leftQcStructure" style={{border:"none"}}>
                            {props.mappedfilesRes.map((e,i)=>(
                            e.testscenarioname.map((element,idx)=>(<li className="mappedLis">{element}</li>))))}
                        </div>
                        <div className="rightQcStructure" style={{border:"none"}}>{props.mappedfilesRes.map((e,i)=>(<li className="mappedLis">{
                            
                                e.qctestcase
                            
                        }</li>))}</div>
                        </Fragment>: null }
                </div>   
            </div>)
}
export default ViewMappedZephyr;
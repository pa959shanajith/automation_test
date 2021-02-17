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
                        <label>Zephyr Tests</label>
                        <label id="scenarioLabel">Avo Assure Scenarios</label>
                    </div>
                    { props.mappedfilesRes.length?
                    <Fragment>
                        <div className="linkedTestset-box">
                        <div className="leftQcStructuremap" style={{border:"none"}}>
                            {props.mappedfilesRes.map((e,i)=>(
                            <li className="mappedLis">
                                {e.testname}
                            </li>))}
                        </div>
                        <div className="rightQcStructuremap" style={{border:"none"}}>{props.mappedfilesRes.map((e,i)=>(
                        <li className="mappedLis">{
                            
                                e.testscenarioname
                            
                        }</li>))}</div>
                        </div>
                        </Fragment>: null }
                </div>   
            </div>)
}
export default ViewMappedZephyr;
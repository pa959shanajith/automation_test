import React, { Fragment } from 'react';

const ViewMappedFiles=(props)=>{
    return(
    <div  className="integration_middleContent">
                <div className="middle_holder">
                    <div className="page-taskName" >
                        <span className="taskname">
                            Mapped files
                        </span>
                    </div>
                    <div className="qcActionBtn">
                        <label>qTest Tests</label>
                        <label id="scenarioLabel">Avo Assure Scenarios</label>
                    </div>
                    {props.mappedFilesICERes.length?
                    props.mappedFilesICERes.map((e,i)=>(
                    <Fragment><div className="leftQcStructure" style={{border:"none"}}><li className="mappedLis">{e.qtestsuite}</li></div>
                    <div className="rightQcStructure" style={{border:"none"}}><li className="mappedLis">{e.testscenarioname}</li></div></Fragment>
                    )) : null}
                    
                    {/* <div className="hrBetween"></div> */}
                    

                </div>   
            </div>)
}
export default ViewMappedFiles;
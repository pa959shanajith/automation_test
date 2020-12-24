import React from 'react';

const ViewMappedFiles=(props)=>{
    return(
    <div  className="middleContent">
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
                    <div className="leftQcStructure" style={{border:"none"}}><li className="mappedLis">{ props.mappedDetails.length? props.mappedDetails[0].testsuite: null}</li></div>
                    {/* <div className="hrBetween"></div> */}
                    <div className="rightQcStructure" style={{border:"none"}}><li className="mappedLis">{props.selectedScenarioName}</li></div>

                </div>   
            </div>)
}
export default ViewMappedFiles;
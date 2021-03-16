import React, { useState, useEffect } from 'react';
import {ScrollBar} from '../../global';
import MappedLabel from '../components/MappedLabel';
import '../styles/MappedPage.scss';

/* 
    screenType - ALM/qTest/Zephyr
    leftBoxTitle - Title of Left Section
    rightBoxTitle - Title of Right Section
    mappedfilesRes - Array of Objects of mapped Files
*/

const MappedPage = props =>{
    
    const [rows, setRows] = useState([]);
    const [counts, setCounts] = useState({
        totalCounts: 0,
        mappedScenarios: 0,
        mappedTests: 0
    })

    useEffect(()=>{
        if (props.mappedfilesRes.length){
            let tempRow = [];
            if (props.screenType === "ALM") {
                let totalCounts = 0;
                let mappedScenarios = 0;
                let mappedTests = 0;

                props.mappedfilesRes.forEach(object => {
                    totalCounts = totalCounts + 1;
                    mappedScenarios = mappedScenarios + object.testscenarioname.length;
                    mappedTests = mappedTests + object.qctestcase.length;
                    tempRow.push([object.testscenarioname, object.qctestcase]);
                });

                setCounts({
                    totalCounts: totalCounts,
                    mappedScenarios: mappedScenarios,
                    mappedTests: mappedTests
                });
            } 
            else if (props.screenType === "qTest") {
                props.mappedfilesRes.forEach(object => {
                    tempRow.push([object.qtestsuite, object.testscenarioname]);
                })
            }
            else if (props.screenType === "Zephyr") {
                props.mappedfilesRes.forEach(object => {
                    tempRow.push([object.testname, object.testscenarioname])
                })
            }
            setRows(tempRow);
        }
    }, [props.mappedfilesRes, props.screenType])


    return(
        <div  className="integration_middleContent">
            <div className="viewMap__task_title" >
                <span className="viewMap__task_name">
                    Mapped files
                </span>
                { props.screenType === "ALM" && 
                <> 
                    <div className="viewMap__counterContainer">
                        <div className="viewMap__totalCount">
                            <div>Total Mappings</div>
                            <div>{counts.totalCounts}</div>
                        </div>
                        <div className="viewMap__scenarioCount">
                            <div>Mapped Scenarios</div>
                            <div>{counts.mappedScenarios}</div>
                        </div>
                        <div className="viewMap__testCount">
                            <div>Mapped ALM Tests</div>
                            <div>{counts.mappedTests}</div>
                        </div>
                    </div>
                    <button>Save</button> 
                </> }
            </div>
            <div className="viewMap__mappingsContainer">
                <div className="viewMap__tileRow">
                    <span className="viewMap_actionRow"><label>{props.leftBoxTitle}</label></span>
                    <span className="viewMap_actionRow"><label>{props.rightBoxTitle}</label></span>
                </div>
                <div className="viewMap__labelContainer">
                <div className="viewMap__canvas">
                    <div className="viewMap__inner">
                        <div className="viewMap__contents" id="viewMapScrollId">
                        <ScrollBar scrollId="viewMapScrollId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                            { rows.map(([scenario, testCase], index) => <div key={index} className="viewMap__labelRow">
                                <MappedLabel list={scenario} type="scenario" />
                                { props.screenType!=="ALM" && 
                                    <div className="viewMap__ropeContainer">
                                        <div className="viewMap__rope"></div>
                                    </div>
                                }
                                <MappedLabel list={testCase} type="testcase"/>
                            </div>) }
                        </ScrollBar>
                        </div>   
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
export default MappedPage;
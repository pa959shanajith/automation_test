import React, { useState, useEffect } from 'react';
import { updateScrollBar } from '../../global';
import "../styles/ScenarioRow.scss";
import "../../global/styles/Shimmer.scss";

/*
browser: "Webservice"
executedtime: "06-08-2021 22:55:04"
reportid: "610d2318221ac2c0d86d3ad8"
status: "Terminate"
testscenarioid: "610d19d3221ac2c0d86d3abe"
testscenarioname: "Scenario_WS1"
 */
const ScenarioRow = ({ item, isFunctionalScreen, utils }) => {

    const [show, setShow] = useState(false);
    let moreWidth;
    let collapsible = moreWidth = isFunctionalScreen;

    const onToggleShow = () => {
        setShow(state => !state);
        updateScrollBar();
    }

    useEffect(()=>{
        setShow(false);
    }, [item])

    return (
        <div className="report__scenarioRowContainer" >
            <div className="report__scenarioRowHeader" >
                <div className={`report__scenarioRowHeaderContent report__${moreWidth?"funcRow":"accRow"}`}  >
                    <span className="report__scenarioRowTitle" title={item.testscenarioname} >{item.testscenarioname}</span> 
                    <span className={`report__scenarioRowStatus report_Status${item.status}`} >
                        {String(item.status)[0]}
                    </span> 
                </div>
                <div className="report__scenarioRowUtilsOps">
                    { (utils.length > 0) && <>
                        {
                            utils.map(util => <img key={util.img} className="report__hoverUtils" onClick={util.onClick(item, util)} src={util.img} title={util.title} />)
                        }
                    </> }
                    { collapsible && <i onClick={onToggleShow} className={"report__scenarioShowBtn fa fa-chevron-" + `${show ? "up" : 'down'}`}></i>}
                </div>
            </div>
            { show && <div className="report__scenarioRowSubContent">
                <div className="report__exeDate" >
                    {getMessage(item.executedtime, 'Ended')}
                </div>
                <div className="report__scenarioAgent" >
                    {`Browser Used: ${item.browser}`}
                </div>
            </div>}
        </div>
    );
}

const ScenarioRowShimmer = () => (
    <div className="report__scenarioRowContainer_Shimmer shimmer" />
);


function getMessage(dateTime, event) {
    let result = `${event} on ${dateTime}`;
    if (typeof dateTime === 'string' && dateTime !== '-') {
        let [date, time] = dateTime.split(' ');
        result = `${event} on ${date} at ${time}`;
    }
    return result;
}

export default ScenarioRow;
export { ScenarioRowShimmer };
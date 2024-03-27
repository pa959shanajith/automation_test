import React, { useState, useEffect } from 'react';
import '../styles/SummaryData.scss';
import '../styles/CollapsibleCard.scss'
import { Chart } from 'primereact/chart';

/*Component CollapsibleCard
  use: Generic Collapsiblecard
  props: 
  todo: 
    
*/

const ExecutionSummaryLabels = {
    scenarioName: "Test case Name : ",
    StartTime: "StartDate Time : ",
    projectName: "Project : ",
    EndTime: "EndDate Time : ",
    overallstatus: "Overall Status : ",
    EllapsedTime: "TimeElapsed : ",
    _order_: ['scenarioName', 'StartTime', 'projectName', 'EndTime', 'overallstatus', 'EllapsedTime'],
};

const TestCaseSummaryLabels = {
    EllapsedTime: "Time Elapsed : ",
    actualResult_pass_AR: "Actual Result : ",
    actualResult_pass_ER: "Expected Result : ",
    comments: "Comments : ",
    JiraID: "Jira ID : ",
    _order_: ['actualResult_pass_AR', 'actualResult_pass_ER', "JiraID", 'EllapsedTime', 'comments']
}

const AccessibiltySummaryLabels = {
    standardName: "Standard Name : ",
    numOfRulesTested: "No. of Rules Tested : ",
    screeName: "Screen Name : ",
    numOfElementsTested: "No. of Elements Tested : ",
    url: "URL : ",
    browserUsed: "Browser used for Testing : ",
    _order_: ['standardName', 'numOfRulesTested', 'screeName', 'numOfElementsTested', 'url', 'browserUsed'],
}


const CollapsibleCard = (props) => {
    const [open, setOpen] = useState(false);
    
    const heading = props.heading;
    const subHeading = props.subHeading || "";

    const collapsible = props.collapsible;

    let summaryLabels = props.type === "Execution" 
                        ? ExecutionSummaryLabels 
                        : props.type === "Accessibility" 
                            ? AccessibiltySummaryLabels 
                            : TestCaseSummaryLabels
                                
    
    let summaryValues = props.summaryValues || "";

    return (
        <>
            <div className={`collapsible-card ${props.className}`} style={{ width: props.width ? props.width : null, padding: props.padding ? props.padding : null }}>
                <div className='collapsible-card-header'>
                    <div className='collapsible-card-heading'>{heading}</div>
                    {subHeading && <div className='collapsible-card-subheading'>{`: ${subHeading}`}</div>}
                    {collapsible !== false && <button
                        onClick={() => setOpen(!open)}
                    >
                        <i className={"fa fa-chevron-down " + `${open === true ? "chevron chevron-up" : 'chevron'}`}></i>
                    </button>}
                </div>
                {
                    (open || collapsible === false) && 
                    <div className="report__collapse-div" >
                        <div className="summary-data-container" style={props.numOfCol === 2 ? {gridTemplateColumns: "auto auto"} : {}}>
                            {
                                typeof summaryValues === "object" && Array.isArray(summaryValues) 
                                ? summaryLabels._order_.map((key, index) => (
                                    <div key={key} className="rp__card_item">
                                    <DataHeading>{summaryLabels[key]}</DataHeading>
                                    <DataValue isStdName={index===0 && props.type==="Accessibility"}>
                                        {getContent(summaryValues[index])}
                                    </DataValue>
                                    { summaryValues[index]?.secondaryContent?.() }
                                    </div>
                                ))
                                : typeof summaryValues === "object" 
                                ? summaryLabels._order_.map((key, index) => (
                                    <div key={key} className="rp__card_item">
                                    <DataHeading>{summaryLabels[key]}</DataHeading>
                                    <DataValue isStdName={index===0 && props.type==="Accessibility"}>
                                        {getContent(summaryValues[key])}    
                                    </DataValue>
                                    </div>
                                ))
                                : <div></div>
                            }
                        </div>
                        { (summaryValues.pass || summaryValues.fail) && <SummaryBar summaryValues={summaryValues} type={props.type} />}
                    </div>
                }
            </div>
        </>
    );
}
export default CollapsibleCard;

const SummaryBar = ({ summaryValues , type }) => {
    const newPass = summaryValues.pass;
    const [{pass, fail, terminate, onHoverPass, onHoverFail}, setProgress] = useState({pass: '100', fail: '0', terminate: '0', onHoverPass: undefined, onHoverFail: undefined});
    const [passHovered, setPassHovered] = useState(false);
    const [failHovered, setFailHovered] = useState(false);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const data = {
            labels: ['Pass', 'Fail', 'Terminated'],
            datasets: [
                {
                    data: [summaryValues.pass, summaryValues.fail, summaryValues.terminate],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--red-600'),
                        documentStyle.getPropertyValue('--red-800')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--green-500'),
                        documentStyle.getPropertyValue('--red-600'),
                        documentStyle.getPropertyValue('--red-800')
                    ]
                }
            ]
        };
        const options = {
            cutout: '60%'
        };

        setChartData(data);
        setChartOptions(options);
    }, []);
    useEffect(() => {
        if (typeof summaryValues.pass === 'string') {
            if (summaryValues.pass !== undefined && summaryValues.fail !== undefined && summaryValues.terminate !== undefined){
                setProgress({ 
                    pass: stripDecimal(Math.round(summaryValues.pass).toString()), 
                    fail: stripDecimal(Math.round(summaryValues.fail).toString()),
                    terminate: stripDecimal(Math.round(summaryValues.terminate).toString())
                });
            }
            else {
                let tempPass = newPass.split('.')[0];
                let tempFail = '100' - tempPass;
                setProgress({ pass: tempPass, fail: tempFail });
            }
        }
        else if (typeof newPass === 'number') {
            setProgress({ pass: summaryValues.pass, fail: summaryValues.fail, onHoverPass: summaryValues.onHoverPass, onHoverFail: summaryValues.onHoverFail });
        }
    }, [summaryValues, type])

    const onMousePassEnter = () => {
        if (onHoverPass) setPassHovered(true)
    }

    const onMousePassLeave = () => {
        if (onHoverPass) setPassHovered(false);
    }

    const onMouseFailEnter = () => {
        if (onHoverFail) setFailHovered(true)
    }

    const onMouseFailLeave = () => {
        if (onHoverFail) setFailHovered(false);
    }

    return (
        <>
            <div className="summary-bar-container">
                <div className="data-bar">
                    <DataHeading>{type === "Execution" ? "Test case Status" : "Result Status of Elements"}</DataHeading>
                    <div className="chart-bar">
                        <div className="report-chart-bar">
                            <div className="chart-bar__inner">
                                { pass > 0  ? <div className={"chart-bar__fill chart-bar-pass-bar"+(passHovered?"":" report_progress_passFill")} style={{ width: pass + '%' }} onMouseEnter={onMousePassEnter} onMouseLeave={onMousePassLeave}  >
                                    {
                                        passHovered 
                                        ? <>
                                            {Object.keys(onHoverPass).map(key=>(
                                                onHoverPass[key] > 0 
                                                ? <Bar key={key} impact={key} width={`${onHoverPass[key]}%`} type="pass" />
                                                : <></> 
                                            ))}
                                        </>
                                        : pass + '%' 
                                    }
                                </div>: <></>}
                                { fail>0 ? <div className={"chart-bar__fill chart-bar-fail-bar"+(failHovered?"":" report_progress_failFill")} style={{ width: fail+'%' }} onMouseEnter={onMouseFailEnter} onMouseLeave={onMouseFailLeave} >
                                    {
                                        failHovered
                                        ? <>
                                            {Object.keys(onHoverFail).map(key=>(
                                                onHoverFail[key]
                                                ? <Bar key={key} impact={key} width={`${onHoverFail[key]}%`} type="fail" /> 
                                                : <></>
                                            ))}
                                        </>
                                        : fail + '%'
                                    }
                                </div>:<></>}
                                { terminate>0 ? <div className={"chart-bar__fill chart-bar-fail-bar report_progress_terminateFill"} style={{ width: terminate+'%' }} >
                                    {terminate + '%'}
                                </div>:<></>}
                            </div>
                        </div>
                    </div>
                    <div className="color-schema">
                        <span className="green-dot" /> <span className="color-type-text">Pass</span>
                        <span className="red-dot" /> <span className="color-type-text">Fail</span>
                        { type === "Execution" && 
                            <><span className="terminate-dot" /> <span className="color-type-text">Terminated</span></>
                        }
                    </div>
                </div>
            </div>
             {/* <div className="card flex justify-content-center">
                <Chart type="doughnut" data={chartData} options={chartOptions} className="w-full md:w-15rem" />
            </div> */}
        </>
    );
}


export const DataHeading = (props) =>  (
    <div className={"data-heading"+( props.noLimit?" data-heading-nolimit":"")}>
        {props.children}
    </div>
);


export const DataValue = (props) => (
    <div className={`${"data-value"} ${(props.isStdName ? 'acc_rep_standard-value':"")} ${( props.noLimit?"data-heading-nolimit":"")}`} title={getTitle(props.children)}  >
        {props.children}
    </div>
);

const Bar = ({impact, width, type}) => {

    const [hover, setHover] = useState(false);

    return (
        <div 
            key={impact} 
            className={"chart-bar__fill"+` report_progress_${type}_${impact}Fill`} 
            style={{width: width}} 
            data-for={impact}
            onMouseEnter={()=>setHover(true)}
            onMouseLeave={()=>setHover(false)}
        >
            {/* { hover && <ReactTooltip id={impact} effect="solid" backgroundColor="black" getContent={[() => { return impact },0]} />} */}
            {hover && <span className="chart-bar_tooltip" > <span>{impact}</span> <span>{width}</span> </span>}
        </div>
    );
}

function getContent(summaryValue) {
    let result = '';
    if (typeof summaryValue === 'string' || typeof summaryValue === 'number' ) {
        result = summaryValue || "-";
    }
    else if (typeof summaryValue === 'object') {
        result = summaryValue.primaryContent;
    }
    return result;
}

function stripDecimal(string) {
    return string.split(".")[0];
}

const getTitle = element => typeof element === "object" ? element[0] : element;
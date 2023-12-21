import React from 'react';
import { WrappedScrollBar } from '../../global';
import ExecutionCard from '../components/ExecutionCard';
import BarChart, { BarChartShimmer } from '../components/BarChart';
import ScenarioRow, { ScenarioRowShimmer } from '../components/ScenarioRow';
import "../styles/ExecutionsContainer.scss";
import "../../global/styles/Shimmer.scss";

const ExecutionsContainer = ({ arflag, leftList, rightList, onExecutionClick, selectedLeftItem, hoverUtils, BarChartProps, isLoading }) => {
    {localStorage['executionReportNo'] = selectedLeftItem.name}
    return (
        <div className="report__exeContainer" >
            { /* Left List */ }
            <div className="report__exeList">
                <WrappedScrollBar outerContainerStyle={{margin: "20px 5px 20px 20px"}} middleContainerStyle={{flexGrow: "1"}} scrollId="scrapeObjCon" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    <div className="report__listItems" >
                    {
                        leftList.map((item, index) => (
                            <ExecutionCard key={item._id} item={item} onExecutionClick={onExecutionClick} selected={JSON.stringify(selectedLeftItem.id)===JSON.stringify(item._id)} />
                        ))
                    }
                    </div>
                </WrappedScrollBar>
            </div>

            { isLoading && <ShimmerPlaceholder /> }
            { (selectedLeftItem.id && !isLoading) && 
                <div className="report__rightContainer" >
                    {
                        rightList.length > 0 
                        ? <>
                        <div className="report__executionHeader" >
                            {selectedLeftItem.name}
                        </div>
                        
                        <BarChart 
                            legends={BarChartProps.legends}
                            values={BarChartProps.values}
                        />

                        { /* Right List */ }
                        <div className="report__scenarioList">
                            <WrappedScrollBar scrollId="scrapeObjCon" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' middleContainerStyle={{flexGrow: "1"}}>
                                <div className="report__listItems" >
                                {
                                    rightList.map((item, index) => (
                                        <ScenarioRow key={index} item={item} cardIndex={index} utils={hoverUtils} isFunctionalScreen={!arflag} />
                                    ))
                                }
                                </div>
                            </WrappedScrollBar>
                        </div>
                        </>
                        : <div className='report_no_reportsWrapper'>
                            <img className='reports_no_reports' src="static/imgs/no-reports.png" />
                        </div>
                    }
                </div>
            }
        </div>
    );
}


const ShimmerPlaceholder = () => (
    <div className="report__rightContainer" >
    <div className="report__executionHeader report__executionHeader_Shimmer shimmer" />
    
    <BarChartShimmer />

    <div className="report__scenarioList">
        <ScenarioRowShimmer />
        <ScenarioRowShimmer />
        <ScenarioRowShimmer />
        <ScenarioRowShimmer />
    </div>
    </div>
)

export default ExecutionsContainer;
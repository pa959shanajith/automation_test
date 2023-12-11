import React, { Fragment } from 'react';
import "../styles/BarChart.scss";
import "../../global/styles/Shimmer.scss";

// legend: [{ text: "", color: "" }], values: { legendText: { value: "" } }

const BarChart = ({ legends, values }) => {

    return (
        <div className="barChart__container">
            <div className="barChart__linearChart">
                {
                    legends.map(legend => (
                        (values[legend.text] && values[legend.text].value) 
                        ? <div 
                            key={legend.text}
                            className={`barChart__bar barChart__legend_${legend.badgeText}`}
                            style={{width: `${values[legend.text].value}%`, backgroundColor: legend.color }}
                        >
                            {`${values[legend.text].value}%`}
                        </div>
                        : <></>
                    ))
                }
            </div>
            <div className="barChart__legends" >
                {
                    legends.map(legend => (
                        <Fragment key={legend.text}>
                            <span className={`barChart__legendDot barChart__legend_${legend.badgeText}`}>{legend.badgeText}</span> 
                            <span className="barChart__legendText">{legend.text}</span>
                        </Fragment>
                    ))
                }
            </div>
        </div>
    );
}


const BarChartShimmer = () => {

    return (
        <div className="barChart__container">
            <div className="barChart__linearChart_Shimmer shimmer " />
            <div className="barChart__legends" >
                <span className="barChart__legendDot_Shimmer shimmer" /> 
                <span className="barChart__legendText_Shimmer shimmer" />
                <span className="barChart__legendDot_Shimmer shimmer" /> 
                <span className="barChart__legendText_Shimmer shimmer" />
                <span className="barChart__legendDot_Shimmer shimmer" /> 
                <span className="barChart__legendText_Shimmer shimmer" />
            </div>
        </div>
    );
}

export default BarChart;
export { BarChartShimmer };
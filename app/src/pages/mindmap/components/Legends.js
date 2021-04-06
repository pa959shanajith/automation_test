import React, { Fragment } from 'react';
import '../styles/Legends.scss'

/*Component Legends
  use: returns static legends at the bottom of the screen
  for ene send isEnE={true}
*/

const Legends = ({isEnE}) => {
    return(
        <svg className="ct-legendBox">
            <g  transform="translate(10,10)">
                <g data-test="modules">
                    <circle className="ct-modules" cx="0" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="15" y="3">Modules</text>
                </g>
                <g data-test="scenarios">
                    <circle className="ct-scenarios" cx="90" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="105" y="3">Scenarios</text>
                </g>
                {!isEnE?
                <Fragment>
                    <g data-test="screens">
                        <circle className="ct-screens" cx="180" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="195" y="3">Screens</text>
                    </g>
                    <g data-test="testcases">
                        <circle className="ct-testcases" cx="270" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="285" y="3">Test Cases</text>
                    </g>
                </Fragment>
                :null}
            </g>
        </svg>
    )
}

export default Legends;
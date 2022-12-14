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
                {!isEnE?
                <Fragment>
                    <g data-test="modules">
                        <circle className="ct-modules" cx="0" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="15" y="3">Module</text>
                    </g>
                    <g data-test="scenarios">
                    <circle className="ct-scenarios" cx="80" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="95" y="3">Scenario</text>
                </g>
                    <g data-test="screens">
                        <circle className="ct-screens" cx="175" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="190" y="3">Screen</text>
                    </g>
                    <g data-test="testcases">
                        <circle className="ct-testcases" cx="255" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="270" y="3">Testcase</text>
                    </g>
                </Fragment>
                :(<>
                    <g data-test="endtoend">
                        <circle className="ct-endtoend" cx="0" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="15" y="3">End to End Flow</text>
                    </g>
                    <g data-test="scenarios">
                        <circle className="ct-scenarios" cx="125" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="140" y="3">Scenario</text>
                    </g>
                </> )}
            </g>
        </svg>
    )
}

export default Legends;
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
                        <circle className="ct-modules" cx="667" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="681" y="3">Module</text>
                    </g>
                    <g data-test="scenarios">
                    <circle className="ct-scenarios" cx="739" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="759" y="3">Scenario</text>
                </g>
                    <g data-test="screens">
                        <circle className="ct-screens" cx="823" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="839" y="3">Screen</text>
                    </g>
                    <g data-test="testcases">
                        <circle className="ct-testcases" cx="893" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="909" y="3">Testcase</text>
                    </g>
                </Fragment>
                :(<>
                    <g data-test="endtoend">
                        <circle className="ct-endtoend" cx="667" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="681" y="3">End to End Flow</text>
                    </g>
                    <g data-test="scenarios">
                        <circle className="ct-scenarios" cx="789" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="804" y="3">Scenario</text>
                    </g>
                </> )}
            </g>
        </svg>
    )
}

export default Legends;
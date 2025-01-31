import React, { Fragment } from 'react';
import '../styles/Legends.scss'
import { useSelector } from 'react-redux';

/*Component Legends
  use: returns static legends at the bottom of the screen
  for ene send isEnE={true}
*/

const Legends = ({isEnE}) => {
    const selecteProject = JSON.parse(localStorage.getItem("DefaultProject"))
    const typeOfView = useSelector(state=>state.design.typeOfViewMap)
    return(
        <svg className="ct-legendBox legendBoxAlignment">
            <g  transform="translate(-634,15)">
                {!isEnE?typeOfView === 'mindMapView'?
                <Fragment>
                    <g data-test="modules">
                        <circle className="ct-modules" cx="667" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="681" y="3">{selecteProject.appType !== "Webservice" ? "Test Suite" : 'Collection'}</text>
                    </g>
                    <g data-test="scenarios">
                    <circle className="ct-scenarios" cx="746" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="759" y="3">{selecteProject.appType !== "Webservice" ?'TestCase': 'API'}</text>
                </g>
                    <g data-test="screens">
                        <circle className="ct-screens" cx="823" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="839" y="3">{selecteProject.appType !== "Webservice" ? 'Screen' : 'Request'}</text>
                    </g>
                    <g data-test="testcases">
                        <circle className="ct-testcases" cx="893" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="909" y="3">Test Steps</text>
                    </g>
                </Fragment>:<Fragment>
                <g data-test="modules">
                        <circle className="ct-modules" cx="667" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="681" y="3">{selecteProject.appType !== "Webservice" ? "Test Suite" : 'Collection'}</text>
                    </g>
                    <g data-test="scenarios">
                    <circle className="ct-scenarios" cx="746" cy="0" r="10"></circle>
                    <text className="ct-nodeLabel" x="759" y="3">{selecteProject.appType !== "Webservice" ?'TestCase': 'API'}</text>
                </g>
                    <g data-test="screens">
                        <circle className="ct-screens" cx="823" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="839" y="3">Test Steps Groups</text>
                    </g>
                </Fragment>
                :(<>
                    <g data-test="endtoend">
                        <circle className="ct-endtoend" cx="667" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="681" y="3">End to End Flow</text>
                    </g>
                    <g data-test="scenarios">
                        <circle className="ct-scenarios" cx="789" cy="0" r="10"></circle>
                        <text className="ct-nodeLabel" x="804" y="3">Test Case</text>
                    </g>
                </> )}
            </g>
        </svg>
    )
}

export default Legends;
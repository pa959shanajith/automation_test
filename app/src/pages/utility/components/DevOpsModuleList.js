import React from 'react';
import { ScrollBar, Messages as MSG, setMsg, ModalContainer } from '../../global';
// import classes from "../styles/DevOps.module.scss"
import "../styles/DevOps.scss"
const DevOpsModuleList = props => {
    return (
        <>
            <div id="moduleScenarioList" className="devOps_module_list" >
                <ScrollBar scrollId='moduleScenarioList' thumbColor="#929397" >
                    <div>
                        <p>Module Name 1</p>
                        <div className="devOps__scenario_list">
                            <p>Scenario 1</p>
                            <p>Scenario 2</p>
                            <p>Scenario 3</p>
                            <p>Scenario 4</p>
                            <p>Scenario 5</p>
                        </div>
                    </div>
                    <div>
                        <p>Module Name 2</p>
                        <div className="devOps__scenario_list">
                            <p>Scenario 1</p>
                            <p>Scenario 2</p>
                            <p>Scenario 3</p>
                            <p>Scenario 4</p>
                            <p>Scenario 5</p>
                        </div>
                    </div>
                    <div>
                        <p>Module Name 3</p>
                        <div className="devOps__scenario_list">
                            <p>Scenario 1</p>
                            <p>Scenario 2</p>
                            <p>Scenario 3</p>
                            <p>Scenario 4</p>
                            <p>Scenario 5</p>
                        </div>
                    </div>
                </ScrollBar>
            </div>
        </>
    );
};
export default DevOpsModuleList;
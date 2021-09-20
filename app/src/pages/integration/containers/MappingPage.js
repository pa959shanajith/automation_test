import React  from 'react';
import { ScrollBar } from '../../global';
import "../styles/MappingPage.scss";


/*
    pageTitle - Top-Left Title Label (ex. ALM Integration)
    onSave - Operation to perform when pressed "Save" Button
    onViewMap - Operation to Perform when pressed "View Mapped Files" Button
    onExit - Operation to perform when pressed "Exit" Button
    leftBoxTitle - Title of the Left Positioned Container
    rightBoxTItle - Title of the Right Positioned Container
    selectTestDomain - Dropdown to Select Domain
    selectTestRelease - Dropdown to Select Release
    selectTestProject - Dropdown to Select Project of Left Box
    selectScenarioProject - Dropdown to Select Project of Right Box
    testList - List Contents of Left Box
    scenarioList - List of Contents of Right Box
*/

const MappingPage = props =>{
    var updateFlag = (props.pageTitle==="Update Mapping");
    return(
        <>
        <div className="page-taskName" >
            <span data-test="intg_main_title_name" className="taskname">
                {props.pageTitle}
            </span>
        </div>
        <div className="mappingPage__action_row">
            <>
            {updateFlag ? 
            <button onClick={props.onUpdate} title="Update">Update</button> :
            <>
            <button onClick={props.onSave} title="Save">Save</button> 
            <button onClick={props.onViewMap} title="View Mapped Files">View Mapped Files</button> 
            <>
            { props.pageTitle==="Zephyr Integration" && <button onClick={props.onUpdateMap} title="Update Mapping">Update Mapping</button>}
            </>
            <button onClick={props.onExit} title="Exit">Exit</button> </>}
            </>
        </div>
        <div className="mappingPage__tree_containers">
            <div className="mappingPage__tree_container">
                <span className="mappingPage__title_row"><label>{props.leftBoxTitle}</label></span>
                <div className="mappingPage__left_tree_container">
                    <div className="mappingPage_tree_selection_box">
                        <>
                        {!updateFlag ?
                        <>
                        {props.selectTestDomain}
                        {props.selectTestProject}
                        {props.selectTestRelease} 
                        </> : 
                        <>
                        {props.selectTestProject}
                        {props.selectTestRelease} 
                        </>
                        }
                        </>
                    </div>
                    <div className="mappingPage__left_tree" >
                        <div className="mappingPage_tree_canvas">
                            <div className="mappingPage_tree_inner">
                                <div className="mappingPage_tree_contents" id="mappingPage_left_tree">
                                <ScrollBar scrollId="mappingPage_left_tree" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                    <>
                                    {!updateFlag ?
                                    <>
                                    {props.testList}
                                    </>
                                     : 
                                     <>
                                     {props.testList}
                                     </>}
                                    </>
                                </ScrollBar>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
            <div className="mappingPage__tree_container">
                <span className="mappingPage__title_row"><label>{props.rightBoxTitle}</label></span>
                <div className="mappingPage__right_tree_container">
                    <div className="mappingPage_tree_selection_box">
                        <>
                        { !updateFlag ?
                        <>
                        {props.selectScenarioProject}
                        {props.searchScenario} { /* Can be implemented here itself */ } </> : 
                        <>
                        {props.selectRightProejct}
                        {props.selectRightRelease} 
                        </>
                        }
                        </>
                    </div>
                
                    <div className="mappingPage__right_tree">
                    <div className="mappingPage_tree_canvas">
                        <div className="mappingPage_tree_inner">
                            <div data-test="intg_scenarios_list_div" className="mappingPage_tree_contents" id="mappingPage_right_tree">
                            <ScrollBar scrollId="mappingPage_right_tree" hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                <>
                                {!updateFlag ? 
                                <>{props.scenarioList} </>: 
                                <>
                                {props.mappedTestList}
                                </> }
                                </>
                            </ScrollBar>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}
    
export default MappingPage;
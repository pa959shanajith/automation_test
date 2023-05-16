import React, { Fragment, useState} from 'react';
import { ActionBar, Header, Thumbnail } from '../../global';
import  "../styles/Leftbar.scss";
import { useDispatch ,useSelector } from 'react-redux';
import * as actionTypes from '../state/action.js';


const Leftbar = (props) => {
    const dispatch = useDispatch();
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const screenType = useSelector(state=>state.integration.screenType);

    const callIconClick = iconType => {
        let clickedScreen = null;

        if(["qTest","ALM","Zephyr","Jira","Azure"].includes(iconType)) clickedScreen = iconType;
        else if(iconType === "Import") 
        {   clickedScreen = "Zephyr";
            props.setImportPop(true)
        }

        window.localStorage['integrationScreenType'] = clickedScreen;
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: clickedScreen });
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
    }

    const barRender=()=>{
        let icon = viewMappedFiles || screenType;
        switch(icon){
            case "qTest": 
            return(
                <Fragment>
                    <h4>Integration</h4>
                <span onClick={()=>callIconClick("qTest")} title="qTest">
                    <img alt="qTestIcon" 
                        id={(screenType === "qTest")? "selectedIcon" : null}  
                        src='static/imgs/qtest.png'
                    /> 
                    <div>qTest</div>
                </span>
                </Fragment>
                )
            case "ALM":
                return(
                <Fragment>
                    <h4>Integration</h4>
                    <span onClick={()=>callIconClick("ALM")} title="ALM">
                        <img alt="ALMIcon" 
                            src='static/imgs/ALM.svg'
                        />
                        <div>ALM</div>
                    </span>
                </Fragment>)
            case "Zephyr":
            case "ZephyrUpdate":
                return(
                <Fragment>
                    <h4>Integration</h4>
                   <span onClick={()=>callIconClick("Zephyr")} title="Zephyr">
                        <img alt="ZephyrIcon"  
                            id={(screenType === "Zephyr")? "selectedIcon" : null} 
                            src='static/imgs/zephyr.png'
                        />
                        <div>Zephyr</div>
                    </span> 
                </Fragment> ) 
            case "Jira":
            case "JiraUpdate":
                return(
                <Fragment>
                    <h4>Integration</h4>
                   <span onClick={()=>callIconClick("Jira")} title="Jira">
                        <img alt="JiraIcon"  
                            id={(screenType === "Jira")? "selectedIcon" : null} 
                            src='static/imgs/jira.png'
                        />
                        <div>Jira</div>
                    </span> 
                </Fragment> )  

            case "Azure":
                case "AzureUpdate":
                    return(
                    <Fragment>
                        <h4>Integration</h4>
                       <span onClick={()=>callIconClick("Azure")} title="Azure DevOps">
                            <img alt="AzureIcon"  
                                id={(screenType === "Azure")? "selectedIcon" : null} 
                                src='static/imgs/Azure.png'
                            />
                            <div>Azure DevOps</div>
                        </span> 
                    </Fragment> )    
            default :
            return(
            <Fragment>
                <h4>Integration</h4>
                    <span onClick={()=>callIconClick("qTest")} title="qTest">
                        <img alt="qTestIcon"  
                             id={(screenType === "qTest")? "selectedIcon" : null}  
                             src='static/imgs/qTest.png'
                             data-test="intg_leftbar_qTestIcon"
                        /> 
                        <div>qTest</div>
                    </span>
                    <span onClick={()=>callIconClick("ALM")} title="ALM">
                        <img alt="AlmIcon" 
                            src='static/imgs/ALM.svg'
                        />
                        <div>ALM</div>
                    </span>
                    <span onClick={()=>callIconClick("Zephyr")} title="Zephyr">
                        <img alt="ZephyrIcon" 
                            id={(screenType === "Zephyr")? "selectedIcon" : null} 
                            src='static/imgs/zephyr.png'
                        />
                        <div>Zephyr</div>
                    </span>
                    <span onClick={()=>callIconClick("Jira")} title="Jira">
                        <img alt="JiraIcon" 
                            id={(screenType === "Jira")? "selectedIcon" : null} 
                            src='static/imgs/jira.png'
                        />
                        <div>Jira</div>
                    </span>
                    <span onClick={()=>callIconClick("Azure")} title="Azure">
                        <img alt="AzureIcon" 
                            id={(screenType === "Azure")? "selectedIcon" : null} 
                            src='static/imgs/Azure.png'
                        />
                        <div>Azure DevOps</div>
                    </span>
            </Fragment>    )
        }
    }
    const upperContent=()=>{
        return(
            <div className="letfnavi">
                {screenType === "ALM" ? 
                <Fragment>
                    <h4>ALM Integration</h4>
                    <span onClick={()=>callIconClick("ALM")}>
                        <img alt="tstPlanIcon" 
                            id="selectedIcon" 
                            src='static/imgs/testplan.png'
                        />
                        <div>Test Lab</div>
                    </span>
                    <span 
                        onClick={()=>callIconClick("ALM")}
                        style={{opacity:"0.5"}}
                    >
                        <img alt="testlabIcon"
                            src='static/imgs/testlab.png'
                        /> 
                        <div>Test Plan</div>    
                    </span>
                </Fragment>
                : 
                barRender()}
            </div>
        )
    }

    const bottomContent=() => {
        return(
            <div className="ss__thumbnail">
                {screenType === "Zephyr" ? 
                <Fragment>
                    <Thumbnail data-test="bottomContent" key="import_mappings" title="Import Mappings" tooltip="Import Mappings" img="static/imgs/ic-import-script.png" action={()=>callIconClick("Import")} disable={false}/>
                </Fragment>
                :null}
            </div>

        )
    }

    return (
        <ActionBar 
            upperContent={upperContent()}
            bottomContent={screenType === "Zephyr" && viewMappedFiles === null?bottomContent():null}
        />
    )
}

export default Leftbar

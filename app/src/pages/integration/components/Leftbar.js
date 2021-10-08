import React, { Fragment} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";
import { useDispatch ,useSelector } from 'react-redux';
import * as actionTypes from '../state/action.js';

const Leftbar = () => {
    const dispatch = useDispatch();
    const viewMappedFiles = useSelector(state=>state.integration.mappedScreenType);
    const screenType = useSelector(state=>state.integration.screenType);

    const callIconClick = iconType => {
        let clickedScreen = null;

        if(iconType === "qTest" ) clickedScreen = "qTest";
        else if (iconType === "ALM") clickedScreen = "ALM";
        else if(iconType === "Zephyr") clickedScreen = "Zephyr";

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
                        src='static/imgs/qTest.png'
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
                            src='static/imgs/ALM.png'
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
                            src='static/imgs/Zephyr.png'
                        />
                        <div>Zephyr</div>
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
                            src='static/imgs/ALM.png'
                        />
                        <div>ALM</div>
                    </span>
                    <span onClick={()=>callIconClick("Zephyr")} title="Zephyr">
                        <img alt="ZephyrIcon" 
                            id={(screenType === "Zephyr")? "selectedIcon" : null} 
                            src='static/imgs/Zephyr.png'
                        />
                        <div>Zephyr</div>
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

    return <ActionBar upperContent={upperContent()} />;
}

export default Leftbar

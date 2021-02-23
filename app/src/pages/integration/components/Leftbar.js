import React ,{useState, Fragment} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";
import { useDispatch ,useSelector } from 'react-redux';
import * as actionTypes from '../state/action.js';

const Leftbar=(props)=>{
    //const [focus,setFocus] = useState(null);
    const dispatch = useDispatch();
    const viewMappedFlies = useSelector(state=>state.integration.mapped_scren_type);
    const screenType = useSelector(state=>state.integration.ALM_LOGIN);

    const callIconClick = (iconType)=>{
        if(iconType == "qTest" ){
        props.setFocus(iconType);
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: "qTest" });
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
        
    }
    else if (iconType == "ALM"){
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: "ALM" });
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
    }
    else if(iconType == "Zephyr"){
        props.setFocus(iconType);
        dispatch({ type: actionTypes.INTEGRATION_SCREEN_TYPE, payload: "Zephyr" });
        dispatch({ type: actionTypes.VIEW_MAPPED_SCREEN_TYPE, payload: null });
    }
    }
    const barRender=()=>{
        switch (viewMappedFlies){
            case "qTest": 
            return(
                <Fragment>
                    <h4>Integration</h4>
                <span onClick={()=>callIconClick("qTest") }>
                    <img  id={(props.focus === "qTest")? "selectedIcon" : null}  src='static/imgs/qTest.png'/> 
                    <div>qTest</div>
                </span>
                </Fragment>
                )
            case "ALM":
                return(
                <Fragment>
                    <h4>Integration</h4>
                    <span onClick={()=>callIconClick("ALM")}>
                        <img src='static/imgs/ALM.png'/>
                        <div>ALM</div>
                    </span>
                </Fragment>)
            case "Zephyr":
                return(
                <Fragment>
                    <h4>Integration</h4>
                   <span onClick={()=>callIconClick("Zephyr")}>
                        <img  id={(props.focus === "Zephyr")? "selectedIcon" : null} src='static/imgs/Zephyr.png'/>
                        <div>Zephyr</div>
                    </span> 
                </Fragment> ) 
            default :
            return(
            <Fragment>
                <h4>Integration</h4>
                    <span onClick={()=>callIconClick("qTest") }>
                        <img  id={(props.focus === "qTest")? "selectedIcon" : null}  src='static/imgs/qTest.png'/> 
                        <div>qTest</div>
                    </span>
                    <span onClick={()=>callIconClick("ALM")}>
                        <img src='static/imgs/ALM.png'/>
                        <div>ALM</div>
                    </span>
                    <span onClick={()=>callIconClick("Zephyr")}>
                        <img  id={(props.focus === "Zephyr")? "selectedIcon" : null} src='static/imgs/Zephyr.png'/>
                        <div>Zephyr</div>
                    </span>
            </Fragment>    )
        }
    }
    const upperContent=()=>{
        return(
            <div className="letfnavi">
                {screenType =="ALM" ? 
                <Fragment>
                    <h4>ALM Integration</h4>
                    <span onClick={()=>callIconClick("ALM")}>
                        <img id="selectedIcon" src='static/imgs/testplan.png'/>
                        <div>Test Lab</div>
                    </span>
                    <span   onClick={()=>callIconClick("ALM")}
                            style={{opacity:"0.5"}}
                    >
                        <img src='static/imgs/testlab.png'/> 
                        <div>Test Plan</div>    
                    </span>
                </Fragment>
                : 
                barRender()}
            </div>
        )
    }
    const bottomContent=()=>{
        return null;
    }
    return (
            <ActionBar 
            upperContent={upperContent()} 
            bottomContent={bottomContent()}
            />
    )
}

export default Leftbar

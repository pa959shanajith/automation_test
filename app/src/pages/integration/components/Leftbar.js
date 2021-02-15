import React ,{useState, Fragment} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";

const Leftbar=(props)=>{
    //const [focus,setFocus] = useState(null);

    const callIconClick = (iconType)=>{
        if(iconType == "qTest" ){
        props.setFocus(iconType);
        props.setqTestClicked(true);
        props.setPopUpEnable(true);
        props.setViewMappedFiles(false);
        props.setAlmClicked(false);
        props.setZephyrClicked(false);
    }
    else if (iconType == "ALM"){
        props.setAlmClicked(true);
        props.setloginAlm(true);
        props.setViewMappedFiles(false);
    }
    else if(iconType == "Zephyr"){
        props.setZephyrClicked(true);
        props.setViewMappedFiles(false);
        props.setFocus(iconType);
        props.setloginZephyr(true);
    }
    }
    
    const upperContent=()=>{
        return(
            <div className="letfnavi">
                {props.almClicked ? 
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
                </Fragment>:
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
                </Fragment>}
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

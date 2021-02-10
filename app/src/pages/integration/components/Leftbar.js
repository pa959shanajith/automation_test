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
    }
    else if (iconType == "ALM"){
        props.setAlmClicked(true);
        props.setloginAlm(true)
        props.setViewMappedFiles(false);
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

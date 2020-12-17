import React ,{useState} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss";

const Leftbar=(props)=>{
    //const [focus,setFocus] = useState(null);

    const callIconClick = (iconType)=>{
        props.setFocus(iconType);
        props.setqTestClicked(true);
        props.setPopUpEnable(true);
        props.setViewMappedFiles(false);
    }
    
    const upperContent=()=>{
        return(
            <div className="letfnavi">
                <h4>Integration</h4>
                <span onClick={()=>callIconClick("qTest") }>
                    <img  id={(props.focus === "qTest")? "selectedIcon" : null} src='static/imgs/qTest.png'/>
                    <div>qTest</div>
                </span>
                <span onClick={()=>props.setFocus("ALM")}>
                    <img src='static/imgs/ALM.png'/>
                    <div>ALM</div>
                </span>
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

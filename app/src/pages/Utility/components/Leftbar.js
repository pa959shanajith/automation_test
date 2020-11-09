import React ,{useState} from 'react';
import { ActionBar } from '../../global';
import  "../styles/Leftbar.scss"

const Leftbar=(props)=>{
    const [focus,setFocus] = useState("encryption")
    const upperContent=()=>{
        return(
            <div className="letfnav">
                <h4>Utilities</h4>
                <span onClick={()=>{props.setScreenType("encryption") ; setFocus("encryption")}}>
                    <img src='static/imgs/ic-encryption-utility.png' id={(focus==="encryption")? "selected":null}/>
                    <div>Encryption</div>
                </span>
                <span onClick={()=>{props.setScreenType("optimization");  setFocus("optimization") ; props.setPairwiseClicked(false)}}>
                    <img src='static/imgs/ic-optimization.png' id={(focus==="optimization")? "selected":null}/>
                    <div>Optimization</div>
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

import React, { useState, useEffect } from 'react';
import {ScrollBar} from '../../global';
import "../styles/ActionBar.scss";

// props - 
const ActionBar = (props) => {

    const [collapse, setCollapse] = useState(false);

    // const nums = [1,2,3,4,5,6,7,8,9,11,22,33];
    // const nums = [44,55,66,77,88,99,11,222,333,444,555,666,777,888,999];
    // const nums = [1,2,3,4,5,6,7,8,9,11,22,33,44,55,66,77,88,99,11,222,333,444,555,666,777,888,999];

    useEffect(()=>{
        
    }, []);

    return (
        <div className="action__bar">
            { props.collapsible && <div className={"caret__action_bar " + (collapse && " caret_action_collapsed") } onClick={()=>setCollapse(!collapse)}>
                {collapse ? ">" : "<"}
            </div>}
            { !collapse && 
            <div className="action__content">
                <div className="scrollable_action_container">
                <ScrollBar thumbColor="rgb(255, 255, 255, 0.27)" trackColor="transparent">    
                    <div className="action__contents">
                        <div className={props.bottomContent ? "ab__upper_contents" : "ab__contents"}>
                            {props.children ? props.children : props.upperContent}
                        </div>
                        { props.bottomContent &&
                            <div className="ab__bottom_contents">
                                {props.bottomContent}
                            </div>
                        }
                    </div>
                </ScrollBar>    
                </div>  
            </div>}
        </div>
    );

}

export default ActionBar;
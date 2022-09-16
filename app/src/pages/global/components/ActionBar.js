import React, { useState, useEffect } from 'react';
import {ScrollBar} from '../../global';
import "../styles/ActionBar.scss";

/* 
    Component : ActionBar (Left Bar) Wrapper Component
    Use : Renders Action Bar on the page
    Props : 
        collapsible : if true ActionBar can be collapsed or expand. Default is false.
        children : if one section then main content of the ActionBar. ex- <ActionBar> <YourContents/> </ActionBar>
        upperContent : if two sections then content on the upper half. 
        bottomContent :  contents of the bottom half. ex- <ActionBar upperContent={} bottomContent={} / 
        collapseEvent : collapse Event return collapse state
        collapse : set true to collpase Action bar
    */

    
const ActionBar = (props) => {

    const [collapse, setCollapse] = useState(false);
    useEffect(()=>{
        setCollapse(props.collapse)
    },[props.collapse])

    return (
        <div className={"action__wrapper " + (!collapse && "action__wrapper__expand")}>
        <div className="action__bar">
            { props.collapsible && <div className={"caret__action_bar " + (collapse ? "fa fa-caret-right caret_action_collapsed" : "fa fa-caret-left") } onClick={()=>setCollapse(!collapse)}></div>}
            { !collapse && 
            <div className="action__content">
                <div id="action_bar_scroll" className="scrollable_action_container">
                <ScrollBar scrollId="action_bar_scroll"  thumbColor="transparent" trackColor="transparent" hoverColor="#5F338F">    
                    <div className="action__contents">
                        <div className={"ab__contents " + (props.bottomContent ? "ab__upper_contents" : "")}>
                            {props.children || props.upperContent}
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
        </div>
    );

}

export default ActionBar;
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar } from '../../global';
import "../styles/RefBarItems.scss";

const ReferenceContent = ({mirror}) => {

    const { appType } = useSelector(state=>state.plugin.CT);
    const [showScreenPop, setShowScreenPop] = useState(false);
    const [screenshotY, setScreenshotY] = useState(null);

    const closeAllPopups = () => setShowScreenPop(false);

    const ScreenPopup = () => (
        <>
        {
            showScreenPop && 
            <ClickAwayListener onClickAway={closeAllPopups}>
            <div className="ref_pop screenshot_pop" style={{marginTop: `calc(${screenshotY}px - 15vh)`}}>
                <h4 className="pop__header" onClick={()=>setShowScreenPop(false)}><span className="pop__title">Screenshot</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
                <div className="screenshot_pop__content">
                    { mirror ? <img className="screenshot_img" src={`data:image/PNG;base64,${mirror}`} /> : "No Screenshot Available"}
                </div>
            </div>
            </ClickAwayListener>
        }
        </>
    );

    const togglePop = event => {
        closeAllPopups();
        setScreenshotY(event.clientY)
        setShowScreenPop(!showScreenPop)
    }

    return (
    <>
    <ReferenceBar popups={<ScreenPopup/>} closeAllPopups={closeAllPopups}>
    { appType!=="Webservice" && appType!=="Mainframe" && <div className="ic_box" onClick={togglePop}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Screenshot</span></div>}
    </ReferenceBar>
    </>
    );
};



export { ReferenceContent };
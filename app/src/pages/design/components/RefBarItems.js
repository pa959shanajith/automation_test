import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar, ScrollBar } from '../../global';

/*
    Component: ReferenceBar Content
    Uses: Provides content to populate on reference bar, includes Popups
    Props: 
        mirror -> base64 screenshot
*/

const ReferenceContent = ({mirror,collapse,appType,openScrapeScreenCap}) => {
    // const { appType } = useSelector(state=>state.plugin.CT);
    const [showScreenPop, setShowScreenPop] = useState(false);
    const [screenshotY, setScreenshotY] = useState(null);
	const [mirrorHeight, setMirrorHeight] = useState("0px");

    useEffect(()=>{
		let mirrorImg = new Image();

		mirrorImg.onload = function(){
			let aspect_ratio = mirrorImg.height / mirrorImg.width;
			let ds_width = 500;
			let ds_height = ds_width * aspect_ratio;
			if (ds_height > 300) ds_height = 300;
			ds_height += 45; // popup header size included
			setMirrorHeight(ds_height);
		}

		mirrorImg.src = `data:image/PNG;base64,${mirror}`;
	}, [mirror])

    const closeAllPopups = () =>  setShowScreenPop(false);
    

    const ScreenPopup = () => (
        <>
        {
            showScreenPop && 
            // <ClickAwayListener onClickAway={()=>{debugger; closeAllPopups();}}>
            <div className="ref_pop screenshot_pop" style={{marginTop: `calc(${screenshotY}px - 15vh)`, height: `${mirrorHeight}px`}}>
                <h4 className="pop__header" onClick={()=>{setShowScreenPop(false)}}><span className="pop__title">Screenshot</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
                <div className="screenshot_pop__content" >
				<div className="scrsht_outerContainer" id="ss_ssId">
				<ScrollBar scrollId="ss_ssId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' hideXbar={true}>
					<div className="ss_scrsht_insideScroll">
					{ mirror ? <img id="ss_screenshot" className="screenshot_img" alt="screenshot" src={`data:image/PNG;base64,${mirror}`} /> : "No Screenshot Available"}
					</div>
				</ScrollBar>
				</div>
				</div>
            </div>
            // </ClickAwayListener>
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
    <ReferenceBar hideInfo={true} popups={<ScreenPopup/>} collapsible={true} collapse={collapse} closeAllPopups={closeAllPopups}>
    { appType!=="Webservice" && appType!=="Mainframe" && <div className="ic_box" onClick={togglePop}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" title="Screenshot" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Screenshot</span></div>}
    {/* <div className="ic_box" onClick={()=>openScrapeScreenCap('displayBasic') }><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" title="Screenshot" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Capture Elements</span></div> */}
    </ReferenceBar>

    </>
    );
};



export { ReferenceContent };
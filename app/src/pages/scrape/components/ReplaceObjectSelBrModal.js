import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import "../styles/ReplaceObjectSelBrModal.scss";
import PropTypes from 'prop-types';
const ReplaceObjectSelBrModal = props => {

    const [isMac, setIsMac] = useState(false);
    
    useEffect(() => {
        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
        //eslint-disable-next-line
    }, []);

    const webIcons = [
        {'src': 'static/imgs/ic-reports-ie.png', 'title': 'Launch Internet Explorer', 'action': ()=>props.startScrape('ie','','replace')},
        {'src': 'static/imgs/ic-reports-chrome.png', 'title': 'Launch Google Chrome', 'action': ()=>props.startScrape('chrome','','replace')},
        {'src': 'static/imgs/ic-reports-safari.png', 'title': 'Launch Safari', 'hide': !isMac, 'action': ()=>props.startScrape('safari','','replace')},
        {'src': 'static/imgs/ic-reports-firefox.png', 'title': 'Launch Mozilla Firefox', 'action': ()=>props.startScrape('mozilla','','replace')},
        {'src': 'static/imgs/ic-reports-edge.svg', 'title': 'Launch Microsoft Edge', 'action': ()=>props.startScrape('edge','','replace')},
        {'src': 'static/imgs/ic-reports-edge-chromium.svg', 'title': 'Launch Edge Chromium', 'action': ()=>props.startScrape('chromium','','replace')}
    ];

    return (
        <div className="sb__SelBrObj">
            <ModalContainer 
                title="Replace Object"
                content={<div data-test="sbReplaceObjectContent" className="sb__SelBrObj_content">
                    <span>Select one of the browsers below to scrape new objects to replace old objects</span>
                    <div data-test="sbReplaceObjectButtons" className="sb__replaceObj_btns">
                        { webIcons.map((icon, i) => !icon.hide && <button data-test="sbReplaceObjectButton" key={i} className="sb__replaceObj_btn" title={icon.title} onClick={icon.action}>
                                <img data-test="webIcons" className="sb__web_icons" src={icon.src} alt={icon.title}/>
                            </button>
                        ) }
                    </div>
                </div>}
                footer={<button data-test="cancelButton" onClick={()=>props.setShow(false)}>Cancel</button>}
                close={()=>props.setShow(false)}
            />
        </div>
    )
}
ReplaceObjectSelBrModal.propTypes={
    startScrape:PropTypes.func,
    setShow:PropTypes.func
}
export default ReplaceObjectSelBrModal;
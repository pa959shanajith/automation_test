import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import "../styles/CompareObjectModal.scss";
import PropTypes from 'prop-types'
const CompareObjectModal = props => {

    const [isMac, setIsMac] = useState(false);
    
    useEffect(() => {
        const macOS = navigator.appVersion.indexOf("Mac") !== -1;
        setIsMac(macOS);
        //eslint-disable-next-line
    }, []);

    const webIcons = [
        {'src': 'static/imgs/ic-reports-ie.png', 'title': 'Launch Internet Explorer', 'action': ()=>props.startScrape('ie', 'compare')},
        {'src': 'static/imgs/ic-reports-chrome.png', 'title': 'Launch Google Chrome', 'action': ()=>props.startScrape('chrome', 'compare')},
        {'src': 'static/imgs/ic-reports-safari.png', 'title': 'Launch Safari', 'hide': !isMac, 'action': ()=>props.startScrape('safari', 'compare')},
        {'src': 'static/imgs/ic-reports-firefox.png', 'title': 'Launch Mozilla Firefox', 'action': ()=>props.startScrape('mozilla', 'compare')},
        {'src': 'static/imgs/ic-reports-edge.svg', 'title': 'Launch Microsoft Edge', 'action': ()=>props.startScrape('edge', 'compare')},
        {'src': 'static/imgs/ic-reports-edge-chromium.svg', 'title': 'Launch Edge Chromium', 'action': ()=>props.startScrape('chromium', 'compare')}
    ];

    return (
        <div className="ss__compareObj">
            <ModalContainer 
                title="Compare Object"
                content={<div data-test="ssCompareObjectContent" className="ss__compareObj_content">
                    <span>Select one of the browsers below to compare objects</span>
                    <div data-test="compareObjectButtons" className="compareObj_btns">
                        { webIcons.map((icon, i) => !icon.hide && <button data-test="compareObjectButton" key={i} className="compareObj_btn" title={icon.title} onClick={icon.action}>
                                <img data-test="webIcons" className="ss__web_icons" src={icon.src} alt={icon.title}/>
                            </button>
                        ) }
                    </div>
                </div>}
                footer={<button  data-test="cancelButton" onClick={()=>props.setShow(false)}>Cancel</button>}
                close={()=>props.setShow(false)}
            />
        </div>
    )
}
CompareObjectModal.propTypes={
    startScrape:PropTypes.func,
    setShow:PropTypes.func
}
export default CompareObjectModal;
import React from 'react';

const ReferenceContent = ({appType}) => (
    <>
    { appType!=="Webservice" && appType!=="Mainframe" && <div className="ic_box"><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Screenshot</span></div>}
    </>
);

export { ReferenceContent };
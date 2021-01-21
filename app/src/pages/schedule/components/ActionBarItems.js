import React, { Fragment } from 'react';
import ThumbnailSchedule from './ThumbnailSchedule';
import "../styles/ActionBarItems.scss"

// todo: after pull add bottomcontent two icons smart scheduling 

const UpperContent = ({appType, isMac, UpdateBrowserTypeExe, browserTypeExe}) => {
    let renderComp = [ <div key={1} className='s__debugOn'>Schedule On</div> ];

    if (appType === "Web") {renderComp.splice(1, 0, <Fragment key={2}>
                                {WebList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} svg={icon.svg} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}
                                { isMac && <ThumbnailSchedule title="Safari" img="static/imgs/ic-safari.png" id="6" UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />}</Fragment>)}
    else if (appType === "OEBS") renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "Desktop") renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "System") renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "SAP") renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Webservice") renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileApp") renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileWeb") renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Mainframe") renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    
    return renderComp;
};

const BottomContent = ({appType, updateExecAction, execAction, updateExecEnv, execEnv}) => {
    return (
        <>
            {appType === "Web"?
                <>
                    <div className="s__parallel_icon" onClick={()=>{updateExecAction()}}>
                        <img className={"s__parallel_icon__img"+ (execAction==="parallel" ? " s__selectedBrowser" : "" )}   src='static/imgs/ic-parallel.png' alt="Parallel Execution"/>
                        <span className="thumbnail__title">Parallel Execution</span>
                    </div>
                    <div className="s__parallel_icon" onClick={()=>{updateExecEnv()}}>
                        <img className={"s__parallel_icon__img"+ (execEnv!=="default" ? " s__selectedBrowser" : "" )}   src='static/imgs/saucelabs.png' alt="Parallel Execution"/>
                        <span className="thumbnail__title">SauceLabs Execution</span>
                    </div>
                </>
            :null}
        </>
    );
};

const WebList = [
    {'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png",'id':"3"}, 
    {'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png",'id':"1"},
    {'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png",'id':"2"},
    {'title': "Microsoft Edge", 'svg': "static/imgs/ic-edge.svg",'id':"7"},
    {'title': "Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg",'id':"8"}
    ]

const oebsList = [{'title': "OEBS Apps" , 'img': 'static/imgs/ic-desktop.png','id':"1"}]

const desktopList = [{'title': "Desktop Apps" , 'img': 'static/imgs/ic-desktop.png','id':"1"}]

const systemList = [{'title': "System Apps" , 'img': 'static/imgs/ic-desktop.png','id':"1"}]

const sapList = [{'title': "SAP Apps" , 'img': 'static/imgs/ic-desktop.png','id':"1"}]

const webserviceList = [{'title': "Web Services" , 'img': 'static/imgs/ic-webservice.png','id':"1"}]

const mobileAppList = [{'title': "Mobile Apps" , 'img': 'static/imgs/ic-mobility.png','id':"1"},
                        {'title': "" , 'img': 'static/imgs/aws.png','id':"2"}]

const mobileWebList = [{'title': "Mobile Web" , 'img': 'static/imgs/ic-mobility.png','id':"1"}]

const mainframeList = [{'title': "Mainframe", 'img': "static/imgs/ic-mainframe-o.png",'id':"1"}]


export { UpperContent, BottomContent };
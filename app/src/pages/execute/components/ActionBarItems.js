import React, { Fragment } from 'react';
import ThumbnailExecute from './ThumbnailExecute';
import { useHistory } from 'react-router-dom';
import "../styles/ActionBarItems.scss"

const UpperContent = ({appType, isMac, UpdateBrowserTypeExe, browserTypeExe}) => {
    let renderComp = [ <div key={1} className='e__debugOn'>Execute On</div> ];

    if (appType === "Web") {renderComp.splice(1, 0, <Fragment key={2}>
                                {WebList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={icon.tooltip} img={icon.img} svg={icon.svg} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}
                                { isMac && <ThumbnailExecute title="Safari" tooltip={"Execute on Safari"} img="static/imgs/ic-safari.png"  id="6" UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />}</Fragment>)}
    else if (appType === "OEBS") renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "Desktop") renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "System") renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "SAP") renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Webservice") renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileApp") renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileWeb") renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Mainframe") renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <ThumbnailExecute key={i} title={icon.title} tooltip={"Execute on "+icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    
    return renderComp;
};

const BottomContent = ({appType, updateExecAction, execAction, updateExecEnv, execEnv}) => {
    const history = useHistory();
    const scheduleRedirect = () => {
        window.localStorage['navigateScreen'] = "scheduling";
        history.replace('/scheduling');
    }
    
    return (
        <>
            {appType === "Web"?
                <>
                <div className="e__parallel_icon" title="Parallel Execution" onClick={()=>{updateExecAction()}}>
                    <img className={"e__parallel_icon__img"+ (execAction==="parallel" ? " e__selectedBrowser" : "" )}   src='static/imgs/ic-parallel.png' alt="Parallel Execution"/>
                    <span className="thumbnail__title">Parallel Execution</span>
                </div>
                <div className="e__parallel_icon" title="SauceLabs Execution" onClick={()=>{updateExecEnv()}}>
                    <img className={"e__parallel_icon__img"+ (execEnv!=="default" ? " e__selectedBrowser" : "" )}   src='static/imgs/saucelabs.png' alt="SauceLabs Execution" title="SauceLabs Execution"/>
                    <span className="thumbnail__title">SauceLabs Execution</span>
                </div>
                </>
            :null}
            {appType === "MobileWeb" && 
                <div className="e__parallel_icon" title="SauceLabs Execution" onClick={()=>{updateExecEnv()}}>
                    <img className={"e__parallel_icon__img"+ (execEnv!=="default" ? " e__selectedBrowser" : "" )}   src='static/imgs/saucelabs.png' alt="SauceLabs Execution" title="SauceLabs Execution"/>
                    <span className="thumbnail__title">SauceLabs Execution</span>
                </div>
            }
            <div className="e__parallel_icon"  title="Scheduling" onClick={()=>{scheduleRedirect()}}>
                <img className="e__parallel_icon__img"   src='static/imgs/ic-scheduling.png' alt="Scheduling"/>
                <span className="thumbnail__title">Schedule</span>
            </div>    
        </>
    );
};

const WebList = [
    {'title': "Internet Explorer", 'tooltip':"Execute on IE", 'img': "static/imgs/ic-ie.png",'id':"3"}, 
    {'title': "Google Chrome", 'tooltip':"Execute on Chrome", 'img': "static/imgs/ic-chrome.png",'id':"1"},
    {'title': "Mozilla Firefox", 'tooltip':"Execute on Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png",'id':"2"},
    {'title': "Microsoft Edge", 'tooltip':"Execute on Microsoft Edge", 'svg': "static/imgs/ic-edge.svg",'id':"7"},
    {'title': "Edge Chromium", 'tooltip':"Execute on Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg",'id':"8"}
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
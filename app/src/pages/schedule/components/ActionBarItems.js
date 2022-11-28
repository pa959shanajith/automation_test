import React, { Fragment, useState } from 'react';
import ThumbnailSchedule from './ThumbnailSchedule';
import { ModalContainer} from '../../global';
import {CheckBox} from "@avo/designcomponents";
import "../styles/ActionBarItems.scss"

// todo: after pull add bottomcontent two icons smart scheduling 

const UpperContent = ({appType, isMac, UpdateBrowserTypeExe, browserTypeExe}) => {
    let renderComp = [ <div key={1} className='s__debugOn'>Schedule On</div> ];

    if (appType === "Web") {renderComp.splice(1, 0, <Fragment key={2}>
                                {WebList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.tooltip} img={icon.img} svg={icon.svg} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}
                                { isMac && <ThumbnailSchedule title="Safari" tooltip={"Schedule on Safari"} img="static/imgs/ic-safari.png" id="6" UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />}</Fragment>)}
    else if (appType === "OEBS") renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "Desktop") renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe} />)}</Fragment>)
    else if (appType === "System") renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "SAP") renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Webservice") renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id} UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileApp") renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "MobileWeb") renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    else if (appType === "Mainframe") renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <ThumbnailSchedule key={i} title={icon.title} tooltip={icon.title} img={icon.img} id={icon.id}  UpdateBrowserTypeExe={UpdateBrowserTypeExe} browserTypeExe={browserTypeExe}/>)}</Fragment>)
    
    return renderComp;
};

const BottomContent = ({appType, updateExecAction, execAction, updateExecEnv, execEnv,smartMode,setSmartMode}) => {
  
    const [popupState,setPopupState] = useState({show:false,title:"",content:""});
    const [smartScenario,setSmartScenario] = useState(false);

    const updateSmartMode = (mode) => {
        if(mode==="smartModule"){
            if(smartMode==="smartModule") setSmartMode("normal");
            else {
                setPopupState({
                    title:'Smart Scheduling',
                    content:"All the modules will be executed as batch.\nAll available ICE should be in similar configurations for optimal results.",
                    show:true
                })
            }
        } else if(mode==="smartScenario"){
            if(smartMode==="smartScenario") setSmartMode("normal");
            else {
                setSmartMode("normal");
                setSmartScenario(true);
            }
        }
    }
    
    return (
        <>
            {popupState.show?
                <ModalContainer 
                    content={popupState.content} 
                    title={popupState.title} 
                    footer={
                        <>
                            <button onClick={()=>{setPopupState({show:false}); setSmartMode("smartModule");}}>Ok</button>
                        </>
                    }
                    close={()=>setPopupState({show:false})}
                />
            :null}
            {smartScenario?
                <div className="smartScenario-popup" >
                    <ModalContainer
                        title="Smart Scheduling"
                        content={"Smart scheduling requires independent scenarios. Are you sure you want to enable smart scheduling the task?\n\nAll available ICE should be in similar configurations for optimal results."}
                        close={()=>setSmartScenario(false)}
                        footer={
                            <>
                                <button onClick={()=>{setSmartScenario(false); setSmartMode("smartScenario");}}>Yes</button>
                                <button onClick={()=>{setSmartScenario(false);}}>No</button>
                            </>
                        }
                    />
                </div>
            :null}
            {appType === "Web"?
                <>
                    <div className={"s__parallel_icon" + (execAction==="parallel" ? " s__selectedBrowser" : "" )} title="Parallel Execution" onClick={()=>{updateExecAction()}}>
                        {execAction==="parallel" ?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
                        <img className={"s__parallel_icon__img"} src='static/imgs/ic-parallel.png' alt="Parallel Execution"/>
                        <span className="s__thumbnail__title">Parallel Execution</span>
                    </div>
                    <div className={"s__parallel_icon" + (execEnv!=="default" ? " s__selectedBrowser" : "" )} title="SauceLabs Execution" onClick={()=>{updateExecEnv()}}>
                        {execEnv!=="default" ?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
                        <img className={"s__parallel_icon__img"} src='static/imgs/saucelabs.png' alt="SauceLabs Execution"/>
                        <span className="s__thumbnail__title">SauceLabs Execution</span>
                    </div>
                    <div className={"s__parallel_icon" + (smartMode==="smartModule" ? " s__selectedBrowser" : "" )} title="Module Smart Scheduling" onClick={()=>{updateSmartMode("smartModule")}}>
                        {smartMode==="smartModule" ?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
                        <img className={"s__parallel_icon__img"} src='static/imgs/ic-module-smart.png' alt="Module Smart Scheduling"/>
                        <span className="s__thumbnail__title">Module Smart Scheduling</span>
                    </div>
                    <div className={"s__parallel_icon" + (smartMode==="smartScenario" ? " s__selectedBrowser" : "" )} title="Scenario Smart Scheduling" onClick={()=>{updateSmartMode("smartScenario")}}>
                        {smartMode==="smartScenario" ?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
                        <img className={"s__parallel_icon__img"} src='static/imgs/ic-scenario-smart.png' alt="Scenario Smart Scheduling"/>
                        <span className="s__thumbnail__title">Scenario Smart Scheduling</span>
                    </div>
                </>
            :null}
            {appType === "MobileWeb" && 
                <div className={"s__parallel_icon"  + (execEnv!=="default" ? " s__selectedBrowser" : "" )} title="SauceLabs Execution" onClick={()=>{updateExecEnv()}}>
                    {execEnv!=="default" ?<div id="browser-checkbox"><CheckBox label="" checked={true} onChange={() => {}} variant="circle"/></div>:null}
                    <img className={"s__parallel_icon__img"}   src='static/imgs/saucelabs.png' alt="SauceLabs Execution"/>
                    <span className="s__thumbnail__title">SauceLabs Execution</span>
                </div>
            }
        </>
    );
};

const WebList = [
    {'title': "Internet Explorer", 'tooltip':"Schedule on IE", 'img': "static/imgs/internet_explorer_logo_new.svg",'id':"3"}, 
    {'title': "Google Chrome", 'tooltip':"Schedule on Chrome", 'img': "static/imgs/chrome_logo_new.svg",'id':"1"},
    {'title': "Mozilla Firefox", 'tooltip':"Schedule on Firefox", 'img': "static/imgs/firefox_logo_new.svg",'id':"2"},
    {'title': "Microsoft Edge", 'tooltip':"Schedule on Microsoft Edge", 'svg': "static/imgs/edge_logo_new.svg",'id':"7"},
    {'title': "Edge Chromium", 'tooltip':"Schedule on Edge Chromium", 'svg': "static/imgs/edge_logo_new.svg",'id':"8"}
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
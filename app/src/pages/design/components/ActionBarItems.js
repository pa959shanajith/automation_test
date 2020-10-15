import React, { Fragment } from 'react';
import { Thumbnail } from '../../global';
import "../styles/ActionBarItems.scss"

const UpperContent = ({appType, isMac, disable}) => {
    let renderComp = [
                    <div key={1} className='d__debugOn'>Debug On</div>, 
                    <div key={3} className="d__thumbnail">
                        <input id="add_depend" type="checkbox" />
                        <span className="d__thumbnail_title">Add Dependent Test Cases</span>
                    </div>
                    ];

    if (appType === "Web") {renderComp.splice(1, 0, <Fragment key={2}>
                                {WebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} svg={icon.svg} />)}
                                { isMac && <Thumbnail title="Safari" img="static/imgs/ic-safari.png" />}</Fragment>)}
    else if (appType === "OEBS") renderComp.splice(1, 0, <Fragment key={2}>{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "Desktop") renderComp.splice(1, 0, <Fragment key={2}>{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "System") renderComp.splice(1, 0, <Fragment key={2}>{systemList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "SAP") renderComp.splice(1, 0, <Fragment key={2}>{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "Webservice") renderComp.splice(1, 0, <Fragment key={2}>{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "MobileApp") renderComp.splice(1, 0, <Fragment key={2}>{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "MobileWeb") renderComp.splice(1, 0, <Fragment key={2}>{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    else if (appType === "Mainframe") renderComp.splice(1, 0, <Fragment key={2}>{mainframeList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</Fragment>)
    
    return renderComp;
};

const BottomContent = () => {
    const lowerList = [
                        {'title': 'Import Test Case', 'img': 'static/imgs/ic-import-script.png'},
                        {'title': 'Export Test Case', 'img': 'static/imgs/ic-export-script.png'}
                    ]
                    // <input style="visibility: hidden;" type="file" id="importTestCaseFile" accept=".json"></li>
                    // <li style="visibility: hidden; display: none;"><a href='#' ng-click="importTestCase1($event)"></a><input style="visibility: hidden;" type="file" id="overWriteJson" accept=".json"></li>
    return (
        <>
            {lowerList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}
        </>
    );
};

const WebList = [
    {'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png"}, 
    {'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png"},
    {'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png"},
    {'title': "Microsoft Edge", 'svg': "static/imgs/ic-edge.svg"},
    {'title': "Edge Chromium", 'svg': "static/imgs/ic-edge-chromium.svg"}
    ]

const oebsList = [{'title': "OEBS Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const desktopList = [{'title': "Desktop Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const systemList = [{'title': "System Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const sapList = [{'title': "SAP Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const webserviceList = [{'title': "Web Services" , 'img': 'static/imgs/ic-webservice.png'}]

const mobileAppList = [{'title': "Mobile Apps" , 'img': 'static/imgs/ic-mobility.png'}]

const mobileWebList = [{'title': "Mobile Web" , 'img': 'static/imgs/ic-mobility.png'}]

const mainframeList = [{'title': "Mainframe", 'img': "static/imgs/ic-mainframe-o.png"}]


export { UpperContent, BottomContent };
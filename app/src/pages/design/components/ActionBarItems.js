import React from 'react';
import { Thumbnail } from '../../global';
import "../styles/ActionBarItems.scss"

const UpperContent = ({appType, isMac}) => {
    let renderComp = [
                    <div className='d__debugOn'>Debug On</div>, 
                    <div className="d__thumbnail">
                        <input id="add_depend" type="checkbox" />
                        <span className="d__thumbnail_title">Add Dependent Test Cases</span>
                    </div>
                    ];

    if (appType === "Web") {renderComp.splice(1, 0, <>
                                {WebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} svg={icon.svg} />)}
                                { isMac && <Thumbnail title="Safari" img="static/imgs/ic-safari.png" />}</>)}
    else if (appType === "OEBS") renderComp.splice(1, 0, <>{oebsList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "Desktop") renderComp.splice(1, 0, <>{desktopList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "System") renderComp.splice(1, 0, <>{systemList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "SAP") renderComp.splice(1, 0, <>{sapList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "Webservice") renderComp.splice(1, 0, <>{webserviceList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "MobileApp") renderComp.splice(1, 0, <>{mobileAppList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "MobileWeb") renderComp.splice(1, 0, <>{mobileWebList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    else if (appType === "Mainframe") renderComp.splice(1, 0, <>{mainframeList.map((icon, i) => <Thumbnail key={i} title={icon.title} img={icon.img} />)}</>)
    
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
    {'title': "Microsoft Edge", 'svg': 
        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 265" style={{padding: "4px"}} height="48px" width="56px">
            <defs>
                <style type="text/css">{`.cls-1{fill: #eee9ff;}`}</style>
            </defs>
            <title>Launch Microsoft Edge</title>
            <path class="cls-1" d="M310.83,169.32a119.87,119.87,0,0,0-239.66-4.2c15.13-19.57,28.31-32.52,48-45.77,20-13.51,45.93-20.77,71.88-20.06,24.5.67,44.33,20.1,44.33,44.61v12.83H146.57c-1-13.39,7.69-30.14,15.45-40.47,0,0-25.47,12.78-40.4,31.57a82.25,82.25,0,0,0-17.18,32A86.1,86.1,0,0,0,100.67,204h0c-1.91,39,15.77,75,49,94.58C210.71,334.47,288,294.64,288,294.64v-54.4c-38.4,18.49-95.6,26.69-124,3.56C150.76,233,147.2,219.11,146,204h164.8Zm0,0" transform="translate(-71.17 -49.44)"/>
        </svg>
    },
    {'title': "Edge Chromium", 'svg': 
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 566.4 566.4" style={{fill:"#eee9ff", padding:"2px"}} xmlSpace="preserve" height="47px" width="56px">
        <path d="M286.1,43c-99.4,0-196.9,60.3-232.7,172.4c-37,115.6,25.3,231.1,114,280.8c25.9,14.5,69.6,29.9,119.8,29.9
        c62.7,0,135.6-24,196.9-103.6c5.1-7.2,8.8-13.7,3.6-19.2c-1.3-1.4-2.8-2-4.6-2c-5.5,0-14.6,5.6-34.4,13.7
        c-14.4,5.9-35.6,9.1-57.4,9.1c-18.2,0-36.7-2.2-51.8-6.8c-33.4-10.1-82.4-27.3-109-94c-6-15.2-12.8-49.4,3.9-72.6
        c0.7-0.8,1.2-1.6,1.9-2.4c11.4-14.3,28.8-24.9,48.2-24.9c10.8,0,22.2,3.3,33.5,11c32.2,22.1,31.4,57,20.9,75.7
        c-7.4,13-10.7,16.2-12,18c-1.3,1.8-8.9,10,4.4,18.3s27.6,16.7,56.7,18.2c4.6,0.2,9.4,0.4,14.5,0.4c27.5,0,62-5.2,90.2-33.5
        c40-40.2,31.8-95.4,21.2-125.8c-10.6-30.4-56.2-134.2-181.7-158.3C317,44.5,301.5,43,286.1,43z M286.1,80.3
        c13.1,0,26.3,1.2,39.2,3.7c106.2,20.4,144.4,107.7,153.6,134c5.8,16.6,16.2,58.4-12.5,87.3c-15.5,15.6-35.2,22.5-63.8,22.5
        c-4.4,0-8.7-0.2-12.6-0.4c-6.8-0.4-12.2-1.1-16.8-2.3c16.6-32.7,13.3-80-22.6-112.3c-26.5-30.5-73.9-62.6-127.7-72.9h0
        c-14.1-2.7-29.4-3.5-44.9-2.1c-14.9,1.3-29.9,4.9-44.5,10.4C171.6,105.5,225.8,80.3,286.1,80.3z M199.5,174.5
        c5.7,0.2,11.2,0.9,16.4,1.9c14.1,2.7,28.1,7.9,41.4,14.1c-17.1,5.3-32.9,15.3-45.5,29.2l-0.1-0.1c-1.4,1.6-2.4,3.1-3.7,4.7
        c-0.8,1-1.8,2-2.6,3.1c-0.2,0.3-0.3,0.6-0.5,0.8c-55.1,66.9-69,133.7-55.3,187.4c3,11.6,7.4,22.4,12.7,32.5
        C104.1,403,62.4,319.7,87.4,232.5h0C111.7,190.1,159.8,172.8,199.5,174.5z M191.4,322.9c1.3,5,2.8,9.8,4.6,14.2
        c34.2,86.1,100.8,106.2,132.8,115.9c21.2,6.4,43.1,8.1,58.9,8.3c-30.5,18.4-64,27.6-100.5,27.6c-7.8,0-15.2-0.5-22.4-1.3
        c-35.4-8.5-68.3-38.6-79.2-81.3C179.5,382.4,180.3,354.1,191.4,322.9z"/>
        </svg>
    }
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
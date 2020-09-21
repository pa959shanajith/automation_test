import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Header, FooterTwo as Footer, ActionBar, ReferenceBar, Thumbnail } from '../../global';
import "../styles/DesignHome.scss";

const DesignHome = () => {
    
    const current_task = useSelector(state=>state.plugin.CT)

    const [appType, setAppType] = useState(null);

    useEffect(()=>{
        let getTaskName = current_task.taskName;
        setAppType(current_task.appType);
    }, []);

    const upperContent = (appType) => {
        let renderComp = [
                        <div className='d__scrapeOn'>Debug On</div>, 
                        <div className="d__thumbnail">
                            <input id="add_depend" type="checkbox" />
                            <span className="d__thumbnail_title">Add Dependent Test Cases</span>
                        </div>
                        ];

        if (appType === "Web") renderComp.splice(1, 0, <>{WebList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "OEBS") renderComp.splice(1, 0, <>{oebsList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "Desktop") renderComp.splice(1, 0, <>{desktopList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "System") renderComp.splice(1, 0, <>{systemList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "SAP") renderComp.splice(1, 0, <>{sapList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "Webservice") renderComp.splice(1, 0, <>{webserviceList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "MobileApp") renderComp.splice(1, 0, <>{mobileAppList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "MobileWeb") renderComp.splice(1, 0, <>{mobileWebList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        else if (appType === "Mainframe") renderComp.splice(1, 0, <>{mainframeList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}</>)
        return renderComp;
    };

    const bottomContent = () => {
        const lowerList = [
                            {'title': 'Import Test Case', 'img': 'static/imgs/ic-import-script.png'},
                            {'title': 'Export Test Case', 'img': 'static/imgs/ic-export-script.png'}
                        ]
                        // <input style="visibility: hidden;" type="file" id="importTestCaseFile" accept=".json"></li>
                        // <li style="visibility: hidden; display: none;"><a href='#' ng-click="importTestCase1($event)"></a><input style="visibility: hidden;" type="file" id="overWriteJson" accept=".json"></li>
        return (
            <>
                {lowerList.map(icon => <Thumbnail title={icon.title} img={icon.img} />)}
            </>
        );
    };

    return (
        <div className="d__body">
            <Header />
                <div className="d__mid_section">
                    <div className="d__leftbar"><ActionBar upperContent={upperContent(appType)} bottomContent={bottomContent()}/></div>
                    <div className="d__content">Content</div>
                    <div className="d__rightbar"><ReferenceBar /></div>
                </div>
                <div className='d__footer'><Footer/></div>
        </div>
    );
}

const WebList = [
                {'title': "Internet Explorer", 'img': "static/imgs/ic-ie.png"}, 
                {'title': "Google Chrome", 'img': "static/imgs/ic-chrome.png"},
                {'title': "Mozilla Firefox", 'img': "static/imgs/ic-mozilla.png"}
                ]

const oebsList = [{'title': "OEBS Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const desktopList = [{'title': "Desktop Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const systemList = [{'title': "System Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const sapList = [{'title': "SAP Apps" , 'img': 'static/imgs/ic-desktop.png'}]

const webserviceList = [{'title': "Web Services" , 'img': 'static/imgs/ic-webservice.png'}]

const mobileAppList = [{'title': "Mobile Apps" , 'img': 'static/imgs/ic-mobility.png'}]

const mobileWebList = [{'title': "Mobile Web" , 'img': 'static/imgs/ic-mobility.png'}]

const mainframeList = [{'title': "Mainframe", 'img': "static/imgs/ic-mainframe.png"}]

export default DesignHome;
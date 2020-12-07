import React ,{useState ,useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux"
// import ScrapeCenter from '../components/CenterScr.js';
import ScrapeContent from './ScrapeContent';
import RefBarItems from '../components/RefBarItems.js';
import { useHistory } from 'react-router-dom';
import ActionBarItems from '../components/ActionBarItems';
import LaunchApplication from '../components/LaunchApplication';
import { Header, FooterTwo as Footer, ScreenOverlay, RedirectPage, PopupMsg, ModalContainer } from '../../global';
import * as scrapeApi from '../api';
import '../styles/Scrapescreen.scss';
import * as actionTypes from '../state/action';
import * as pluginActions from "../../plugin/state/action";

const ScrapeScreen = ()=>{
    const dispatch = useDispatch();
    const current_task = useSelector(state=>state.plugin.CT);
    const userInfo = useSelector(state=>state.login.userinfo);
    const history = useHistory();
    
    const [overlay, setOverlay] = useState(null);
    const [showPop, setShowPop] = useState("");
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [scrapeItems, setScrapeItems] = useState([]);
    const [mainScrapedData, setMainScrapedData] = useState({});
    const [saved, setSaved] = useState(true);
    const [showAppPop, setShowAppPop] = useState(false);
    const [scrapedURL, setScrapedURL] = useState("");
    const [hideSubmit, setHideSubmit] = useState(true);
    const [newScrapedData, setNewScrapedData] = useState([]);

    useEffect(() => {
        if(Object.keys(current_task).length != 0) {
            fetchScrapeData()
            .then(data=> console.log("fetched data"))
            .catch(error=> console.log(error));
        }
    }, [current_task])

    const fetchScrapeData = () => {
		return new Promise((resolve, reject) => {
            setOverlay("Loading...");
            
            let viewString = scrapeItems;
            let haveItems = viewString.length !== 0;

            scrapeApi.getScrapeDataScreenLevel_ICE(current_task.appType, current_task.screenId, current_task.projectId, current_task.testCaseId)
            .then(data => {
                if (current_task.subTask === "Scrape") setScrapedURL(data.scrapedurl);
                
                if (data === "Invalid Session") RedirectPage(history);

                if (data !== null && data !== "getScrapeData Fail." && data !== "" && data !== " ") {

                    viewString = data;

                    if(viewString.reuse){
                        let task = { ...current_task }
                        task.reuse = "True";
                        dispatch({type: pluginActions.SET_CT, payload: task});
                    }

                    // update Mirror

                    haveItems = viewString.view.length !== 0;
                    
                    if (haveItems) {
                        let localScrapeList = []
                        let custObjLength = 0;

                        for (let i = 0; i < viewString.view.length; i++) {
                            let ob = viewString.view[i];
                            let addcusOb = '';
                            ob.tempId = i;
                            
                            if (viewString.view[i].xpath === "") addcusOb = 'addCustObj';
                            
                            if (ob.cord) {
                                addcusOb = "";
                                ob.hiddentag = "No";
                                ob.tag = `iris;${ob.objectType}`;
                                ob.url = "";
                                ob.xpath = `iris;${ob.custname};${ob.left};${ob.top};${(ob.width + ob.left)};${(ob.height + ob.top)};${ob.tag}`;
                            }

                            let scrapeItem = {  objId: ob._id, 
                                                // xpath: ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' '),
                                                // left: ob.left,
                                                // top: ob.top,
                                                // width: ob.width,
                                                // height:  ob.height,
                                                // url: ob.url,
                                                // hiddentag: ob.hiddentag,
                                                objIdx: i,       
                                                val: ob.tempId,
                                                tag: ob.tag,
                                                hide: false,
                                                title: ob.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/[<>]/g, '').trim()
                                            }
                                            
                            if(ob.hasOwnProperty('editable')){
                                scrapeItem.disabled = true;
                                scrapeItem.decryptFlag = true;
                            } else {
                                scrapeItem.addCusOb = addcusOb
                                custObjLength++;
                            };
                            
                            localScrapeList.push(scrapeItem)
                        }

                        setMainScrapedData(viewString);
                        setScrapeItems(localScrapeList);
                        setHideSubmit(false);
                        setSaved(false);
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        // screenshot
                        // flip selectAll chkbox
                        // if web -> flip gen and compare objects -> check custObjLength as well
                        // flip save visibility save 
                        
                        setOverlay("");
                    }
                    else {
                        setScrapeItems([]);
                        setMainScrapedData({});
                        setNewScrapedData([]);
                        setSaved(false);
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        // screenshot
                        // flip selectAll chkbox
                        // if web -> flip gen and compare objects
                        // flip save visibility save 

                        setOverlay("");
                    }
                }
                else{
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    // screenshot
                    // flip selectAll chkbox
                    // if web -> flip gen and compare objects
                    // flip save visibility save 

                }
            resolve("success");
            })
            .catch(error => {
                dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                console.log("error", error);
                setOverlay("");
                reject("fail")
            })
        });
    }

    const PopupDialog = () => (
        <PopupMsg 
            title={showPop.title}
            close={()=>setShowPop("")}
            content={showPop.content}
            submitText="OK"
            submit={showPop.onClick ? showPop.onClick : ()=>setShowPop("")}
        />
    );

    const ConfirmPopup = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>
                    {showConfirmPop.continueText ? showConfirmPop.continueText : "Yes"}
                </button>
                <button onClick={()=>setShowConfirmPop(false)}>
                    {showConfirmPop.rejectText ? showConfirmPop.rejectText : "No"}
                </button>
                </>
            }
        />
    )

    const updateScrapeItems = newList => {
        setScrapeItems([...scrapeItems, ...newList])
    }

    return (
        <>
        { overlay && <ScreenOverlay content={overlay} />}
        { showPop && <PopupDialog />}
        { showConfirmPop && <ConfirmPopup /> }
        { showAppPop && <LaunchApplication setShow={setShowAppPop} appPop={showAppPop} />}
        <div  className="ss__body">
            
            <Header/>
            <div className="ss__mid_section">

                <ActionBarItems setShowAppPop={setShowAppPop} setSaved={setSaved} setNewScrapedData={setNewScrapedData} scrapeItems={scrapeItems} setOverlay={setOverlay} setShowPop={setShowPop} updateScrapeItems={updateScrapeItems}/>
                
                <ScrapeContent saved={saved} setSaved={setSaved} newScrapedData={newScrapedData} setShowPop={setShowPop}  setShowConfirmPop={setShowConfirmPop} mainScrapedData={mainScrapedData} current_task={current_task} scrapeItems={scrapeItems} hideSubmit={hideSubmit} setScrapeItems={setScrapeItems} />
                
                <RefBarItems scrapeItems={scrapeItems} setScrapeItems={setScrapeItems} />
            </div>
            
            <div className='ss__footer'><Footer/></div>
        </div>
        </>
    );
}

export default ScrapeScreen;
import React ,{useState ,useEffect} from 'react';
import {useSelector, useDispatch} from "react-redux"
import { useHistory } from 'react-router-dom';
import ScrapeContent from './ScrapeContent';
import RefBarItems from '../components/RefBarItems.js';
import AddObjectModal from '../components/AddObjectModal';
import CompareObjectModal from '../components/CompareObjectModal';
import CreateObjectModal from '../components/CreateObjectModal';
import ActionBarItems from '../components/ActionBarItems';
import LaunchApplication from '../components/LaunchApplication';
import { ScrapeContext } from '../components/ScrapeContext';
import { Header, FooterTwo as Footer, ScreenOverlay, RedirectPage, PopupMsg, ModalContainer } from '../../global';
import * as scrapeApi from '../api';
import * as actionTypes from '../state/action';
import * as pluginActions from "../../plugin/state/action";
import '../styles/ScrapeScreen.scss';

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
    const [showObjModal, setShowObjModal] = useState(false);
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
                        let localScrapeList = [];

                        for (let i = 0; i < viewString.view.length; i++) {
                            let scrapeObject = viewString.view[i];
                            
                            if (scrapeObject.cord) {
                                scrapeObject.hiddentag = "No";
                                scrapeObject.tag = `iris;${scrapeObject.objectType}`;
                                scrapeObject.url = "";
                                scrapeObject.xpath = `iris;${scrapeObject.custname};${scrapeObject.left};${scrapeObject.top};${(scrapeObject.width + scrapeObject.left)};${(scrapeObject.height + scrapeObject.top)};${scrapeObject.tag}`;
                            }

                            let scrapeItem = {  objId: scrapeObject._id, 
                                                objIdx: i,       
                                                val: i,
                                                tag: scrapeObject.tag,
                                                hide: false,
                                                title: scrapeObject.custname.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/[<>]/g, '').trim()
                                            }
                                            
                            if(scrapeObject.hasOwnProperty('editable')){
                                // clearance needed
                                scrapeItem.disabled = true;
                                scrapeItem.decryptFlag = true;
                            } else {
                                let isCustom = scrapeObject.xpath === "";
                                scrapeItem.isCustom = isCustom;
                            };
                            
                            localScrapeList.push(scrapeItem)
                        }

                        setMainScrapedData(viewString);
                        setScrapeItems(localScrapeList);
                        setHideSubmit(false);
                        setSaved(true);
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        // screenshot
                        
                        setOverlay("");
                    }
                    else {
                        setScrapeItems([]);
                        setMainScrapedData({});
                        setNewScrapedData([]);
                        setSaved(true);
                        dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                        dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                        // screenshot

                        setOverlay("");
                    }
                }
                else{
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: haveItems});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: !haveItems});
                    // screenshot
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
        { showObjModal === "addObject" && <AddObjectModal setShow={setShowObjModal} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems}/> }
        { showObjModal === "compareObject" && <CompareObjectModal setShow={setShowObjModal} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems}/> }
        { showObjModal === "createObject" && <CreateObjectModal setShow={setShowObjModal} scrapeItems={scrapeItems} setScrapeItems={setScrapeItems} setShowPop={setShowPop}/>}
        { showAppPop && <LaunchApplication setShow={setShowAppPop} appPop={showAppPop} />}
        <div  className="ss__body">
            <Header/>
            <div className="ss__mid_section">
                <ScrapeContext.Provider value={{setShowObjModal, saved, setShowAppPop, setSaved, newScrapedData, setNewScrapedData, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems, hideSubmit, setOverlay, setShowPop, updateScrapeItems }}>
                    <ActionBarItems />
                    <ScrapeContent />
                    <RefBarItems />
                </ScrapeContext.Provider>
            </div>
            <div className='ss__footer'><Footer/></div>
        </div>
        </>
    );
}

export default ScrapeScreen;
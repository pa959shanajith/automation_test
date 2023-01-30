import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar, ScrollBar, RedirectPage, Messages , setMsg} from '../../global';
import  * as ScrapeFilter  from './FilterScrapeObjects';
import * as list from './ListVariables';
import { ScrapeContext } from './ScrapeContext';
import * as actions from '../state/action';
import { highlightScrapElement_ICE } from '../api';
import { PopupMsg } from '../../global';
import "../styles/RefBarItems.scss";

const RefBarItems = props => {

	const dispatch = useDispatch();
	const highlightRef = useRef();
	const history = useHistory();
	const {uid } = useSelector(state=>state.plugin.CT);
	const compareFlag = useSelector(state=>state.scrape.compareFlag);
	const objValue = useSelector(state=>state.scrape.objValue);
    const [toFilter, setToFilter] = useState([]);
	const [tagList, setTagList] = useState([]);
	const [showFilterPop, setShowFilterPop] = useState(false);
	const [filterY, setFilterY] = useState(null);
	const [showScreenPop, setShowScreenPop] = useState(false);
	const [screenshotY, setScreenshotY] = useState(null);
	const [highlight, setHighlight] = useState(false);
	const [mirrorHeight, setMirrorHeight] = useState("0px");
	const [currMobileType, setCurrMobileType]  = useState('Android');
	const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [dsRatio, setDsRatio] = useState(1); //downScale Ratio
	const [imageHeight,setImageHeight]=useState(0)
	const { scrapeItems, setScrapeItems, scrapedURL, mainScrapedData, newScrapedData, orderList } = useContext(ScrapeContext);
	const appType= props.appType;

	useEffect(()=>{
		return ()=>{
			dispatch({type: actions.SET_OBJVAL, payload: {val: null}});
			dispatch({type: actions.SET_ISFILTER, payload: false});
		}
	}, [dispatch])

	useEffect(()=>{
		dispatch({type: actions.SET_OBJVAL, payload: {val: null}});
		setHighlight(false);
		dispatch({type: actions.SET_ISFILTER, payload: false});
		setToFilter([]);
		setShowScreenPop(false);
		//eslint-disable-next-line
	}, [uid, newScrapedData])

	useEffect(()=>{
		if (appType === "MobileApp") setTagList(list.mobileFilters);
		else setTagList(list.nonMobileFilters);
	}, [appType]);

	useEffect(()=>{
		if (props.mirror.scrape || (props.mirror.compare && compareFlag)){
			let mirrorImg = new Image();

			mirrorImg.onload = function(){
				let aspect_ratio = mirrorImg.height / mirrorImg.width;
				let ds_width = 500;
				let ds_height = ds_width * aspect_ratio;
				let ds_ratio = 490 / mirrorImg.width;
				if (ds_height > 300) ds_height = 300;
				ds_height += 45; // popup header size included
				setMirrorHeight(ds_height);
				setImageHeight(mirrorImg.height)
				setDsRatio(ds_ratio);
			}

			mirrorImg.src = `data:image/PNG;base64,${compareFlag ? props.mirror.compare : props.mirror.scrape}`;
		} else {
			setMirrorHeight("0px");
			setDsRatio(1);
		}
		dispatch({type: actions.SET_OBJVAL, payload: {val: null }});
		setHighlight(false);
		filter([]);
		setToFilter([]);
		//eslint-disable-next-line
	}, [props.mirror])

	useEffect(()=>{
		if (objValue.val !== null){
			let ScrapedObject = objValue;

			let top=0; let left=0; let height=0; let width=0;
			let displayHighlight = true;
			if (appType === 'OEBS' && ScrapedObject.hiddentag === 'True'){
				setHighlight(false)
				setPopupState({show:true,title:"Element Highlight",content:"Element: " + ScrapedObject.custname + " is Hidden."});
			} else if (ScrapedObject.height && ScrapedObject.width) {
				if (ScrapedObject.viewTop != undefined) {
					if (ScrapedObject.viewTop < imageHeight) {
						// perform highlight
						top = ScrapedObject.viewTop * dsRatio
					}
					else {
						// popup error message
						displayHighlight=false
					}
				}
				else {
					if (ScrapedObject.top < imageHeight) {
						// perform highlight
						top = ScrapedObject.top * dsRatio;
					}
					else {
						// popup error message
						displayHighlight=false
					}
				}
				// ScrapedObject.viewTop != undefined ? top = ScrapedObject.viewTop * dsRatio : top = ScrapedObject.top * dsRatio;
				left = ScrapedObject.left * dsRatio;
				height = ScrapedObject.height * dsRatio;
				width = ScrapedObject.width * dsRatio;

				if (appType === "MobileWeb" && navigator.appVersion.indexOf("Mac") !== -1){
					top = top + 112;
					left = left + 15;	
				} 
				else if (appType === "SAP" && mainScrapedData.createdthrough !== 'PD'){
					top = top + 2;
					left = left + 3;
				}
				else if (appType === "OEBS" && mainScrapedData.createdthrough === 'PD'){
					top = top + 35;
					left = left-36;
				}
				// if (highlight){setHighlight} else{setHighlight(false)}
				if(displayHighlight){
					setHighlight({
						top: `${Math.round(top)}px`, 
						left: `${Math.round(left)}px`, 
						height: `${Math.round(height)}px`, 
						width: `${Math.round(width)}px`, 
						backgroundColor: "yellow", 
						border: "1px solid red", 
						opacity: "0.7"
					});
				}
				else {
					setHighlight(false);
					setMsg(Messages.SCRAPE.ERR_HIGHLIGHT_OUT_OF_RANGE);
				}
				// highlightRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'})
			} else setHighlight(false);
			if(!ScrapedObject.xpath.startsWith('iris')){
				highlightScrapElement_ICE(ScrapedObject.xpath, ScrapedObject.url, appType)
					.then(data => {
						if (data === "Invalid Session") return RedirectPage(history);
						if (data === "fail") setMsg(Messages.SCRAPE.ERR_HIGHLIGHT)
					})
					.catch(error => console.error("Error while highlighting. ERROR::::", error));
			}
		}
		else setHighlight(false);
		//eslint-disable-next-line
	}, [objValue])

    const closeAllPopups = () => {
		setShowScreenPop(false);
		setShowFilterPop(false);
	}

	const toggleScreenshotPop = event => {
		closeAllPopups();
        setScreenshotY(event.clientY)
        setShowScreenPop(!showScreenPop)
    }

    const toggleFilterPop = event =>{
		closeAllPopups();
        setFilterY(event.clientY)
        setShowFilterPop(!showFilterPop)
    }
    const filterMain=(dataTag)=>{
		let tempToFilterArr = [...toFilter];
		if (dataTag === "*selectAll*") {
			if (tagList.length === tempToFilterArr.length) {
				tempToFilterArr = []
			}
			else {
				for (let tag of tagList) {
					if (!tempToFilterArr.includes(tag.tag)) tempToFilterArr.push(tag.tag);
				}
			}
		}
        else if (tempToFilterArr.includes(dataTag)) tempToFilterArr.splice(tempToFilterArr.indexOf(dataTag), 1)
		else tempToFilterArr.push(dataTag);
		
		const order = checkOrdering(tempToFilterArr, toFilter);
		filter(tempToFilterArr, order);
		setToFilter(tempToFilterArr)
		dispatch({type: actions.SET_ISFILTER, payload: tempToFilterArr.length>0});
    }

    const filter = (toFilter, order) => {
		let scrapedItems = [...scrapeItems];
		
		if (toFilter.length > 0) 
			scrapedItems = ScrapeFilter.getFilteredScrapeObjects(scrapedItems, toFilter, order, orderList)
		else 
			scrapedItems = ScrapeFilter.resetList(scrapedItems, order, orderList);
        setScrapeItems(scrapedItems)
	}

	const toggleMobileType = event => {

		const selectedType = event.target.value;
		let newTagList = [];
		
		if (selectedType === "iOS") 
			newTagList = list.mobileMacFilters;
		else if (selectedType === "Android") 
			newTagList = list.mobileFilters;
		
		setCurrMobileType(selectedType);
		setTagList(newTagList);
		setToFilter([]);
		filter([]);
	}
	const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
	}

	const Popups = () => (
        <>
		{popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
        {
            showScreenPop && 
            // <ClickAwayListener onClickAway={closeAllPopups}>
            <div data-test="popupSS" className="ref_pop screenshot_pop" style={{marginTop: `calc(${screenshotY}px - 15vh)`, height: `${mirrorHeight}px`}}>
                <h4 className="pop__header" onClick={()=>setShowScreenPop(false)}><span className="pop__title">Screenshot</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
				<div className="screenshot_pop__content" >
				<div className="scrsht_outerContainer" id="ss_ssId">
				<ScrollBar scrollId="ss_ssId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' hideXbar={true}>
					<div data-test="ssScroll" className="ss_scrsht_insideScroll">
					{ highlight && <div ref={highlightRef} style={{display: "flex", position: "absolute", ...highlight}}></div>}
					{ (props.mirror.scrape || (props.mirror.compare && compareFlag)) ? <img id="ss_screenshot" className="screenshot_img" alt="screenshot" src={`data:image/PNG;base64,${compareFlag ? props.mirror.compare : props.mirror.scrape}`} /> : "No Screenshot Available"}
					</div>
				</ScrollBar>
				</div>
				</div>
            </div>
            // </ClickAwayListener>
		}
		{
            showFilterPop && 
            <ClickAwayListener onClickAway={closeAllPopups}>
            <div  data-test="popupFilter" className="ref_pop filter_pop" style={{marginTop: `calc(${filterY}px - 15vh)`}}>
                <h4 className="pop__header" onClick={()=>setShowFilterPop(false)}><span className="pop__title">Filter</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
                <div data-test="popupFilterContent" className="filter_pop__content">
					<div className="scrape__filterActionBtns">
					<div className="d__filter-selall" onClick={()=>filterMain("*selectAll*")}><input type="checkbox" checked={tagList.length === toFilter.length} readOnly/><span>Select All</span></div>
					{ appType === "MobileApp" && 
						<select className="scrape__mobileType" onChange={toggleMobileType} value={currMobileType}>
							<option value="Android" >Android</option>
							<option value="iOS" >iOS</option>
						</select>
					}
					</div>
					<div className="scrape__filterTagBtns">
					{ tagList.map((tag, index)=>(
						<button key={index} data-test="filterButton" className={"d__filter-btn" + (toFilter.includes(tag.tag) ? " active-filter" : "")} onClick={()=>filterMain(tag.tag)}>{tag.label}</button>
					))}
					</div>
                </div>
            </div>
            </ClickAwayListener>
        }
        </>
    );

    
    return (
    
        <ReferenceBar popups={Popups()} closeAllPopups={closeAllPopups} hideInfo={props.hideInfo} collapse={props.collapse} collapsible={true} scrapeScreenURL={scrapedURL} >
			{ appType!=="Webservice" && appType!=="Mainframe" && <div data-test="screenshot" className="ic_box" onClick={toggleScreenshotPop}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" title="Screenshot" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title" title="Screenshot">Screenshot</span></div>}
            { appType!=="Webservice" && <span data-test="filter" onClick={toggleFilterPop} className={"ic_box"+(compareFlag?" ss__filterDisable":"")}  ><span><img className={"rb__ic-info thumb__ic " + (showFilterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter" title="Filter"/></span><span className="rb_box_title" title="Filter">Filter</span></span>}
			<div data-test="screenshot" className="ic_box"  onClick={props.openPopup}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" title="Design Test Step" src="static/imgs/Design_Test_Step.png"/><span className="rb_box_title" title="Design Test Step">Design<span className="rb_box_title" title="Design Test Step">Test Steps</span></span></div>
        </ReferenceBar>
        
    
    )
}

export default RefBarItems;

function checkOrdering (toFilter, fromFilter) {
	let reorder = "";
	const hadAlphabetOrder = fromFilter.includes("alphabetOrder");
	const needAlphabetOrder = toFilter.includes("alphabetOrder");
	
	if (hadAlphabetOrder && needAlphabetOrder) reorder = "";
	else if (hadAlphabetOrder && !needAlphabetOrder) reorder = "val";
	else if (!hadAlphabetOrder && needAlphabetOrder) reorder = "alphabet";

	return reorder;
}
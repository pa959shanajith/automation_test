import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar, ScrollBar, RedirectPage } from '../../global';
import  * as ScrapeFilter  from './FilterScrapeObjects';
import * as list from './ListVariables';
import { ScrapeContext } from './ScrapeContext';
import * as actions from '../state/action';
import { highlightScrapElement_ICE } from '../api';
import "../styles/RefBarItems.scss";

const RefBarItems = props => {

	const dispatch = useDispatch();
	const highlightRef = useRef();
	const history = useHistory();
	const { appType, uid } = useSelector(state=>state.plugin.CT);
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
	const [dsRatio, setDsRatio] = useState(1); //downScale Ratio
	const { scrapeItems, setScrapeItems, scrapedURL, mainScrapedData, newScrapedData, setShowPop } = useContext(ScrapeContext);

	useEffect(()=>{
		return ()=>{
			dispatch({type: actions.SET_OBJVAL, payload: {val: null}});
		}
	}, [dispatch])

	useEffect(()=>{
		dispatch({type: actions.SET_OBJVAL, payload: {val: null}});
		setHighlight(false);
		setToFilter([]);
		//eslint-disable-next-line
	}, [uid, newScrapedData])

	useEffect(()=>{
		if (appType === "MobileApp") navigator.appVersion.indexOf("Mac") !== -1 ? setTagList(list.mobileMacFilters) : setTagList(list.mobileFilters);
		else setTagList(list.nonMobileFilters);
	}, [appType]);

	useEffect(()=>{
		if (props.mirror){
			let mirrorImg = new Image();

			mirrorImg.onload = function(){
				let aspect_ratio = mirrorImg.height / mirrorImg.width;
				let ds_width = 500;
				let ds_height = ds_width * aspect_ratio;
				let ds_ratio = 490 / mirrorImg.width;
				if (ds_height > 300) ds_height = 300;
				ds_height += 45; // popup header size included
				setMirrorHeight(ds_height);
				setDsRatio(ds_ratio);
			}

			mirrorImg.src = `data:image/PNG;base64,${props.mirror}`;
		}
		dispatch({type: actions.SET_OBJVAL, payload: {val: null }});
		setHighlight(false);
		filter([]);
		setToFilter([]);
		//eslint-disable-next-line
	}, [props.mirror])

	useEffect(()=>{
		// !== null because objValue can be 0
		if (objValue.val !== null){
			let clickedObj = null;

			for (let scrapeObj of scrapeItems) {
				if (scrapeObj.val === objValue.val) {
					clickedObj = scrapeObj;
					break;
				}
			}
			
			if (clickedObj) {
				let ScrapedObject = {};
				if (clickedObj.objId) ScrapedObject = mainScrapedData.view[clickedObj.objIdx];
				else ScrapedObject = newScrapedData.view[clickedObj.objIdx];
	
				let top=0; let left=0; let height=0; let width=0;
	
				if (ScrapedObject.top){
					top = ScrapedObject.top * dsRatio;
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
					
					setHighlight({
						top: `${Math.round(top)}px`, 
						left: `${Math.round(left)}px`, 
						height: `${Math.round(height)}px`, 
						width: `${Math.round(width)}px`, 
						backgroundColor: "yellow", 
						border: "1px solid red", 
						opacity: "0.7"
					}, ()=>highlightRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'}));
	
					if(!ScrapedObject.xpath.startsWith('iris')){
						highlightScrapElement_ICE(ScrapedObject.xpath, ScrapedObject.url, appType)
							.then(data => {
								if (data === "Invalid Session") return RedirectPage(history);
								if (data === "fail") setShowPop({title: "Fail", content: "Failed to highlight"})
							})
							.catch(error => console.error("Error while highlighting. ERROR::::", error));
					}
	
				} else setHighlight(false);
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
		filter(tempToFilterArr);
        setToFilter(tempToFilterArr)
    }

    const filter = toFilter => {
		let scrapedItems = [...scrapeItems];
		scrapedItems.forEach(item => {
			item.hide = true;
			item.duplicate = false;
		})
		if (toFilter.length > 0) {
			for (let tag of toFilter) {
				if (tag === "others") {
					scrapedItems.forEach(item => {
                        if (ScrapeFilter.otherObjects(item.tag)) {
								item.hide = false;
						}
					});
				}
				else if (tag === "othersAndroid"){
					scrapedItems.forEach(item => {
						if (ScrapeFilter.otherAndroidObjects(item.tag)){
								item.hide = false;
							}
					});
				}
				/*** Filtering Duplicate Objects ***/
				else if (tag === "duplicateCustnames") {
					scrapedItems = ScrapeFilter.duplicateObjects(scrapedItems);
				}
				else if(tag === "userobj"){
					scrapedItems.forEach(item => {
						if (item.isCustom) {
							item.hide = false
						}
					});
				}
				else {
					scrapedItems.forEach(item => {
						if (ScrapeFilter.isSelectedElement(tag, item.tag)) {
							item.hide = false;
						}
					});
				}
			}
		} else {
			scrapedItems.forEach(item => item.hide = false)
		}
        setScrapeItems(scrapedItems)
	}

	const Popups = () => (
        <>
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
					{ props.mirror ? <img id="ss_screenshot" className="screenshot_img" alt="screenshot" src={`data:image/PNG;base64,${props.mirror}`} /> : "No Screenshot Available"}
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
					<div className="d__filter-selall" onClick={()=>filterMain("*selectAll*")}><input type="checkbox" checked={tagList.length === toFilter.length}/><span>Select All</span></div>
					{ tagList.map((tag, index)=>(<div key={index} className="d__filter-btnbox">
						<button data-test="filterButton" className={"d__filter-btn" + (toFilter.includes(tag.tag) ? " active-filter" : "")} key={index} onClick={()=>filterMain(tag.tag)}>{tag.label}</button>
					</div>))}
                </div>
            </div>
            </ClickAwayListener>
        }
        </>
    );

    
    return (
    
        <ReferenceBar popups={Popups()} closeAllPopups={closeAllPopups} scrapeScreenURL={scrapedURL} >
			{ appType!=="Webservice" && appType!=="Mainframe" && <div data-test="screenshot" className="ic_box" onClick={toggleScreenshotPop}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Screenshot</span></div>}
            { appType!=="Webservice" && <span data-test="filter" onClick={toggleFilterPop} className={"ic_box"+(compareFlag?" ss__filterDisable":"")}  ><span><img className={"rb__ic-info thumb__ic " + (showFilterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter"/></span><span className="rb_box_title">Filter</span></span>}
        </ReferenceBar>
        
    
    )
}

export default RefBarItems;
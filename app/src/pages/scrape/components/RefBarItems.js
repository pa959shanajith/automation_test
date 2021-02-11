import React, { useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar, ScrollBar, RedirectPage } from '../../global';
import * as list from './ListVariables';
import { ScrapeContext } from './ScrapeContext';
import * as actions from '../state/action';
import { highlightScrapElement_ICE } from '../api';
import "../styles/RefBarItems.scss";

const RefBarItems = props => {

	const dispatch = useDispatch();
	const highlightRef = useRef();
	const history = useHistory();
	const { appType, subTaskId, createdthrough } = useSelector(state=>state.plugin.CT);
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
		dispatch({type: actions.SET_OBJVAL, payload: null});
		setHighlight(false);
		setToFilter([]);
	}, [subTaskId, newScrapedData])

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
		dispatch({type: actions.SET_OBJVAL, payload: null});
		setHighlight(false);
		filter([]);
		setToFilter([]);
	}, [props.mirror])

	useEffect(()=>{
		// !== null because objValue can be 0
		if (objValue !== null){
			let objIndex = scrapeItems[objValue].objIdx;
			let ScrapedObject = null;
			
			if (scrapeItems[objValue].objId) ScrapedObject = mainScrapedData.view[objIndex];
			else ScrapedObject = newScrapedData.view[objIndex];

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
				else if (appType == "SAP" && createdthrough !== 'PD'){
					top = top + 2;
					left = left + 3;
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
		else setHighlight(false);
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
                        if (!["button", "checkbox", "select", "img", "a", "radiobutton", "input", "list",
                             "link", "scroll bar", "internal frame", "table"].includes(item.tag) &&
							item.tag.toLowerCase().indexOf("button") == -1 &&
							item.tag.toLowerCase().indexOf("edit") == -1 &&
							item.tag.toLowerCase().indexOf("edit box") == -1 &&
							item.tag.toLowerCase().indexOf("text") == -1 &&
							item.tag.toLowerCase().indexOf("edittext") == -1 &&
							item.tag.toLowerCase().indexOf("combo box") == -1 &&
							item.tag.toLowerCase().indexOf("hyperlink") == -1 &&
							item.tag.toLowerCase().indexOf("check box") == -1 &&
							item.tag.toLowerCase().indexOf("checkbox") == -1 &&
							item.tag.toLowerCase().indexOf("image") == -1 &&
							(item.tag.toLowerCase().indexOf("table") == -1 || item.tag.toLowerCase() == "tablecell") &&
							item.tag.toLowerCase().indexOf("radio button") == -1) {
								item.hide = false;
						}
					});
				}
				else if (tag === "othersAndroid"){
					scrapedItems.forEach(item => {
						if (!["android.widget.Button", "android.widget.CheckBox", "android.widget.NumberPicker",
							  "android.widget.TimePicker", "android.widget.DatePicker", "android.widget.RadioButton",
							 "android.widget.EditText", "android.widget.ListView", "android.widget.Spinner", "android.widget.Switch",
							 "android.widget.ImageButton", "android.widget.SeekBar"].includes(item.tag) &&
							item.tag.toLowerCase().indexOf("android.widget.button") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.checkbox") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.numberpicker") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.timepicker") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.datepicker") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.radiobutton") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.edittext") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.listview") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.spinner") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.switch") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.imagebutton") == -1 &&
							item.tag.toLowerCase().indexOf("android.widget.seekbar") == -1){
								item.hide = false;
							}
					});
				}
				/*** Filtering Duplicate Objects ***/
				else if (tag === "duplicateCustnames") {
					let reversedScrapeItems = scrapedItems.reverse();
					let uniqueBucket = []

					reversedScrapeItems.forEach(item => {
						let custname = item.title.trim().replace(/[<>]/g, '');
						if (!uniqueBucket.includes(custname)) {
							uniqueBucket.push(custname);
						}
						else {
							item.hide = false;
							item.duplicate = true;
						}
					})

					scrapedItems = reversedScrapeItems.reverse();
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
						if (tag == item.tag || (item.tag.toLowerCase().indexOf(tag.toLowerCase()) >= 0 && tag != "a" && item.tag.toLowerCase() != "radio button" && item.tag.toLowerCase() != "radiobutton" && item.tag.toLowerCase().indexOf("listview") < 0 && item.tag.toLowerCase().indexOf("tablecell") < 0) ||
							(tag == "input" && (item.tag.indexOf("edit") >= 0 || item.tag.indexOf("Edit Box") >= 0 || item.tag.indexOf("text") >= 0 || item.tag.indexOf("EditText") >= 0 || item.tag.indexOf("TextField") >= 0)) ||
							(tag == "select" && item.tag.indexOf("combo box") >= 0) ||
							(tag == "a" && (item.tag.indexOf("hyperlink") >= 0)) ||
							(tag == "checkbox" && item.tag.indexOf("check box") >= 0) ||
							(tag == "radiobutton" && item.tag.indexOf("radio button") >= 0)
						) {
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
            <div className="ref_pop screenshot_pop" style={{marginTop: `calc(${screenshotY}px - 15vh)`, height: `${mirrorHeight}px`}}>
                <h4 className="pop__header" onClick={()=>setShowScreenPop(false)}><span className="pop__title">Screenshot</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
				<div className="screenshot_pop__content" >
				<div className="scrsht_outerContainer" id="ss_ssId">
				<ScrollBar scrollId="ss_ssId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' hideXbar={true}>
					<div className="ss_scrsht_insideScroll">
					{ highlight && <div ref={highlightRef} style={{display: "flex", position: "absolute", ...highlight}}></div>}
					{ props.mirror ? <img id="ss_screenshot" className="screenshot_img" src={`data:image/PNG;base64,${props.mirror}`} /> : "No Screenshot Available"}
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
            <div className="ref_pop filter_pop" style={{marginTop: `calc(${filterY}px - 15vh)`}}>
                <h4 className="pop__header" onClick={()=>setShowFilterPop(false)}><span className="pop__title">Filter</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
                <div className="filter_pop__content">
					<div className="d__filter-selall" onClick={()=>filterMain("*selectAll*")}><input type="checkbox" checked={tagList.length === toFilter.length}/><span>Select All</span></div>
					{ tagList.map((tag, index)=>(<div className="d__filter-btnbox">
						<button className={"d__filter-btn" + (toFilter.includes(tag.tag) ? " active-filter" : "")} key={index} onClick={()=>filterMain(tag.tag)}>{tag.label}</button>
					</div>))}
                </div>
            </div>
            </ClickAwayListener>
        }
        </>
    );

    
    return (
    
        <ReferenceBar popups={Popups()} closeAllPopups={closeAllPopups} scrapeScreenURL={scrapedURL} >
			{ appType!=="Webservice" && appType!=="Mainframe" && <div className="ic_box" onClick={toggleScreenshotPop}><img className={"rb__ic-task thumb__ic "} alt="screenshot-ic" src="static/imgs/ic-screenshot.png"/><span className="rb_box_title">Screenshot</span></div>}
            { appType!=="Webservice" && <span onClick={toggleFilterPop} className={"ic_box"+(compareFlag?" ss__filterDisable":"")}  ><span><img className={"rb__ic-info thumb__ic " + (showFilterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter"/></span><span className="rb_box_title">Filter</span></span>}
        </ReferenceBar>
        
    
    )
}

export default RefBarItems;
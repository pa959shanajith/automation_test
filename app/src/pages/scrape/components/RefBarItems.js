import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import ClickAwayListener from 'react-click-away-listener';
import { ReferenceBar, ScrollBar } from '../../global';
import * as list from './ListVariables';
import { ScrapeContext } from './ScrapeContext';
import "../styles/RefBarItems.scss";

const RefBarItems = props => {

	const { appType } = useSelector(state=>state.plugin.CT);
	const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const [toFilter, setToFilter] = useState([]);
	const [tagList, setTagList] = useState([]);
	const [showFilterPop, setShowFilterPop] = useState(false);
	const [filterY, setFilterY] = useState(null);
	const [showScreenPop, setShowScreenPop] = useState(false);
	const [screenshotY, setScreenshotY] = useState(null);
	const { scrapeItems, setScrapeItems, scrapedURL } = useContext(ScrapeContext);

	useEffect(()=>{
		if (appType === "MobileApp") navigator.appVersion.indexOf("Mac") !== -1 ? setTagList(list.mobileMacFilters) : setTagList(list.mobileFilters);
		else setTagList(list.nonMobileFilters);
	}, [appType]);

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
		// $("html").css({
		// 	'cursor': 'auto'
		// });
		// cfpLoadingBar.complete()
        setScrapeItems(scrapedItems)
	}

	const Popups = () => (
        <>
        {
            showScreenPop && 
            <ClickAwayListener onClickAway={closeAllPopups}>
            <div className="ref_pop screenshot_pop" style={{marginTop: `calc(${screenshotY}px - 15vh)`}}>
                <h4 className="pop__header" onClick={()=>setShowScreenPop(false)}><span className="pop__title">Screenshot</span><img className="task_close_arrow" alt="task_close" src="static/imgs/ic-arrow.png"/></h4>
				<div className="screenshot_pop__content" id="ss_ssId">
				<ScrollBar scrollId="ss_ssId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                    { props.mirror ? <img className="screenshot_img" src={`data:image/PNG;base64,${props.mirror}`} /> : "No Screenshot Available"}
				</ScrollBar>
				</div>
            </div>
            </ClickAwayListener>
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
            <span onClick={toggleFilterPop} className={"ic_box"+(compareFlag?" ss__filterDisable":"")}  ><span><img className={"rb__ic-info thumb__ic " + (showFilterPop && "active_rb_thumb")} src="static/imgs/ic-filter.png" alt="fliter"/></span><span className="rb_box_title">Filter</span></span>
        </ReferenceBar>
        
    
    )
}

export default RefBarItems;
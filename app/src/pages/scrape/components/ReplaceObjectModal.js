import React, { useState, useEffect, Fragment } from 'react';
import { ModalContainer, ScrollBar, RedirectPage, Messages as MSG, setMsg } from '../../global';
import { tagList } from  './ListVariables';
import { updateScreen_ICE } from '../api';
import "../styles/ReplaceObjectModal.scss";
import PropTypes from 'prop-types'

const ReplaceObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({});
    const [allScraped, setAllScraped] = useState([]);
    const [newScrapedList, setNewScrapedList]  = useState({});
    const [selectedTag, setSelectedTag] = useState("");
    const [replace, setReplace] = useState({});
    const [showName, setShowName] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(()=>{
        let tempScrapeList = {};
        let tempNewScrapedList = {};
        let tempAllScraped = [];
        if (props.scrapeItems.length) {
            props.scrapeItems.forEach(object => {
                let elementType = object.tag;
                elementType = tagList.includes(elementType) ? elementType : 'Element';
                if (object.objId) {
                    if(!(object.xpath && object.xpath.split(";")[0]==="iris")) {
                        tempAllScraped.push(object);
                        if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                        else tempScrapeList[elementType] = [object]
                    }
                }
            });
            setAllScraped(tempAllScraped);
        } 
        if(props.newScrapedData.length) {
            props.newScrapedData.forEach(newObj => {
                let elementType = newObj.tag;
                elementType = tagList.includes(elementType) ? elementType : 'Element';
                if(tempNewScrapedList[elementType]) tempNewScrapedList[elementType] = [...tempNewScrapedList[elementType], newObj];
                else tempNewScrapedList[elementType] = [newObj];
                if(!tempScrapeList[elementType]) tempScrapeList[elementType] = [];
            });
            setNewScrapedList(tempNewScrapedList);
        }
        setScrapedList(tempScrapeList);
    }, [])

    const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const onDragOver = event => event.preventDefault();

    const onDrop = (event, currObject) => {
        if (replace[currObject.val]) setErrorMsg("Object already merged");
        else {
            let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
            let replacing = { 
                ...replace, 
                [currObject.val]: [draggedObject, currObject],
                [draggedObject.val]: null            
            }
            setReplace(replacing);
            setErrorMsg("");
        }
    }

    const onUnlink = () => {
        let replacing = { ...replace };
        for (let customObjVal of selectedItems) {
            let scrapeObjVal = replacing[customObjVal][0].val
            delete replacing[customObjVal];
            delete replacing[scrapeObjVal];
        }
        setReplace(replacing);
        setSelectedItems([]);
        setShowName("");
    }

    const onShowAllObjects = () => setSelectedTag("");

    const submitReplace = () => {

        if (!Object.keys(replace).length) {
            setErrorMsg("Please select atleast one object to Replace");
            return;
        }

        let { screenId, screenName, projectId, appType, versionnumber } = props.current_task;
        
        let arg = {
            projectId: projectId,
            screenId: screenId,
            screenName: screenName,
            param: "replaceScrapeData",
            appType: appType,
            objList: [],
            versionnumber: versionnumber
        };

        let replacing = {...replace};
        for (let val in replacing) {
            if (replacing[val]) {
                arg.objList.push([replacing[val][0].objId, replacing[val][1]]);
            }
        }

        updateScreen_ICE(arg)
        .then(response => {
            if (response === "Invalid Session") return RedirectPage(props.history);
            else props.fetchScrapeData()
                    .then(resp => {
                        if (resp === "success") {
                            props.setShow(false);
                            setMsg(MSG.SCRAPE.SUCC_REPLACE_SCRAPED)
                        }
                        else setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
                    })
                    .catch(err => {
                        setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
                    });
        })
        .catch(error => {
            setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
            console.err(error);
        })
    }

    const onCustomClick = (showName, id) => {
        let updatedSelectedItems = [...selectedItems]
        let indexOfItem = selectedItems.indexOf(id);
        
        if (indexOfItem>-1) updatedSelectedItems.splice(indexOfItem, 1);
        else updatedSelectedItems.push(id);
        
        setShowName(showName);
        setSelectedItems(updatedSelectedItems);
    }

    return (
        <div data-test="replaceObject" className="ss__replaceObj">
            <ModalContainer 
                title="Replace Object"
                content={
                    <div className="ss__replaceObjBody">
                        <div   data-test="replaceObjectHeading" className="ss__ro_lbl ro__headerMargin">Please select the object type and then drag and drop the necessary objects to be replaced with the new objects</div>
                        <div className="ss__ro_lists">
                            <div data-test="replaceObjectScrapeObjectList" className="ss__ro_scrapeObjectList">
                                <div  data-test="replaceObjectLabel" className="ss__ro_lbl ro__lblMargin">Scraped Objects</div>
                                <div className="ro_scrapeListContainer">
                                    <div className="ro_listCanvas">
                                        <div className="ro_listMinHeight">
                                            <div data-test="replaceObjectListContent" className="ro_listContent" id="roListId">
                                            <ScrollBar scrollId="roListId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { (()=> selectedTag ? scrapedList[selectedTag] : allScraped)()
                                            .map((object, i) => {
                                                let replaced = object.val in replace;
                                                return (<div data-test="replaceObjectListItem" key={i} title={object.title} className={"ss__ro_listItem"+(replaced ? " ro_replaced" : "")} draggable={ replaced ? "false" : "true"} onDragStart={(e)=>onDragStart(e, object)}>
                                                    {object.title}
                                                </div>)
                                            }) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div  data-test="replaceObjectCustomObjectList" className="ss__ro_customObjectList">
                                <div  data-test="replaceObjectCustomHeading" className="ss__ro_lbl ro__lblMargin">New Scraped Objects</div>
                                <div className="ss__ro_customOutContainer">
                                <div className="ro_listCanvas">
                                <div className="ro_listMinHeight">
                                <div className="ro_listContent" id="roListId">
                                <ScrollBar scrollId="roListId">
                                <div data-test="replaceObjectCustomContainer" className="ss__ro_customInContainer">
                                { Object.keys(newScrapedList).map((elementType, i) => (
                                    <Fragment key={i}>
                                    <div data-test="replaceObjectTagHead" className="ro_tagHead" onClick={()=>setSelectedTag(elementType === selectedTag ? "" : elementType )}>{elementType}</div>
                                    { selectedTag === elementType && <div className="ro_tagItemList"> 
                                        {newScrapedList[selectedTag].map((object, j) => <div data-test="replaceObjectCustomListItem" key={j} title={object.title} className={"ro_tagItems"+(selectedItems.includes(object.val) ? " ro_selectedTag" : "")} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, object)}>
                                            { object.val in replace ?
                                            <>
                                            <span data-test="replaceObjectReplacedName" className="ro_replacedName" onClick={()=>onCustomClick("", object.val)}>
                                                { showName === object.val ? object.title : replace[object.val][0].title }
                                            </span>
                                            <span data-test="replaceObjectFlipName" className="ro_nameFlip" onClick={()=>onCustomClick(object.val, object.val)}></span>
                                            </> : 
                                            <span data-test="h3">{object.title}</span> }
                                            
                                        </div>)} 
                                    </div> }
                                    </Fragment>
                                ))}
                                </div>
                                </ScrollBar>
                                </div>
                                </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <div className="ro_errorMsgContainer">
                        { errorMsg && <span  data-test="errorMessage" className="ro_errorMsg">{errorMsg}</span>}
                    </div>
                    <button data-test="showAll" onClick={onShowAllObjects}>Show All Objects</button>
                    <button data-test="unLink" onClick={onUnlink} disabled={!selectedItems.length}>Un-Map</button>
                    <button data-test="submit" onClick={submitReplace}>Replace Objects</button>
                </>}
            />
        </div>
    );
}
ReplaceObjectModal.propTypes={
    scrapeItems: PropTypes.arrayOf(PropTypes.object),
    current_task:PropTypes.object,
    fetchScrapeData:PropTypes.func,
    setShow:PropTypes.func,
    newScrapedData:PropTypes.arrayOf(PropTypes.object)
}
export default ReplaceObjectModal;


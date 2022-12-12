import React, { useState, useEffect, Fragment } from 'react';
import { ModalContainer, ScrollBar, RedirectPage, Messages as MSG, setMsg } from '../../global';
import { tagList } from  './ListVariables';
import { updateScreen_ICE } from '../api';
import "../styles/MapObjectModal.scss";
import PropTypes from 'prop-types'

const MapObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({});
    const [nonCustomList, setNonCustomList] = useState([]);
    const [customList, setCustomList]  = useState({});
    const [selectedTag, setSelectedTag] = useState("");
    const [map, setMap] = useState({});
    const [showName, setShowName] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [orderList, setOrderList] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(()=>{
        let tempScrapeList = {};
        let tempCustomList = {};
        let tempNonCustom = [];
        let tempOrderList = [];
        if (props.scrapeItems.length) {
            props.scrapeItems.forEach(object => {
                let elementType = object.tag;
                elementType = tagList.includes(elementType) ? elementType : 'Element';
                if (object.objId) {
                    if (object.isCustom) {
                        if (tempCustomList[elementType]) tempCustomList[elementType] = [...tempCustomList[elementType], object];
                        else tempCustomList[elementType] = [object]
                        if (!tempScrapeList[elementType]) tempScrapeList[elementType] = []
                    }
                    else {
                        tempNonCustom.push(object);
                        if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                        else tempScrapeList[elementType] = [object]
                    }
                    tempOrderList.push(object.objId);
                }
            });
            setScrapedList(tempScrapeList);
            setCustomList(tempCustomList);
            setNonCustomList(tempNonCustom);
            setOrderList(tempOrderList);
        }
        //eslint-disable-next-line
    }, [])

    const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const onDragOver = event => event.preventDefault();

    const onDrop = (event, currObject) => {
        if (map[currObject.val]) setErrorMsg("Object already merged");
        else {
            let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
            let mapping = { 
                ...map, 
                [currObject.val]: [draggedObject, currObject],
                [draggedObject.val]: null            
            }
            setMap(mapping);
            setErrorMsg("");
        }
    }

    const onUnlink = () => {
        let mapping = { ...map };
        for (let customObjVal of selectedItems) {
            let scrapeObjVal = mapping[customObjVal][0].val
            delete mapping[customObjVal];
            delete mapping[scrapeObjVal];
        }
        setMap(mapping);
        setSelectedItems([]);
        setShowName("");
    }

    const onShowAllObjects = () => setSelectedTag("");

    const submitMap = () => {

        if (!Object.keys(map).length) {
            setErrorMsg("Please select atleast one object to Map");
            return;
        }

        // let { screenId, screenName, projectId, appType, versionnumber } = props.current_task;
        let appType = props.appType;
        const screenId = props.fetchingDetails["_id"];
        const projectId = props.fetchingDetails.projectID;
        const screenName = props.fetchingDetails["name"];
        const versionNumber = 0
        
        let arg = {
            projectId: projectId,
            screenId: screenId,
            screenName: screenName,
            param: "mapScrapeData",
            appType: appType,
            objList: [],
            orderList: orderList,
            versionnumber: 0,
        };

        let mapping = {...map};
        for (let val in mapping) {
            if (mapping[val]) {
                arg.objList.push([mapping[val][0].objId, mapping[val][1].objId, mapping[val][1].custname]);
                arg.orderList.splice(arg.orderList.indexOf(mapping[val][0].objId), 1)
            }
        }

        updateScreen_ICE(arg)
        .then(response => {
            if (response === "Invalid Session") return RedirectPage(props.history);
            else props.fetchScrapeData()
                    .then(resp => {
                        if (resp === "success") {
                            props.setShow(false);
                            setMsg(MSG.SCRAPE.SUCC_MAPPED_SCRAPED)
                        }
                        else setMsg(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
                    })
                    .catch(err => {
                        setMsg(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
                        // console.error(err);
                    });
        })
        .catch(error => {
            setMsg(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
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
        <div  data-test="mapObject" className="ss__mapObj">
            <ModalContainer 
                title="Map Object"
                content={
                    <div className="ss__mapObjBody">
                        <div   data-test="mapObjectHeading" className="ss__mo_lbl headerMargin">Please select the objects to drag and drop</div>
                        <div className="ss__mo_lists">
                            <div data-test="mapObjectScrapeObjectList" className="ss__mo_scrapeObjectList">
                                <div  data-test="mapObjectLabel" className="ss__mo_lbl lblMargin">Scraped Objects</div>
                                <div className="mo_scrapeListContainer">
                                    <div className="mo_listCanvas">
                                        <div className="mo_listMinHeight">
                                            <div data-test="mapObjectListContent" className="mo_listContent" id="moListId">
                                            <ScrollBar scrollId="moListId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { (()=> selectedTag ? scrapedList[selectedTag] : nonCustomList)()
                                            .map((object, i) => {
                                                let mapped = object.val in map;
                                                return (<div data-test="mapObjectListItem" key={i} title={object.title} className={"ss__mo_listItem"+(mapped ? " mo_mapped" : "")} draggable={ mapped ? "false" : "true"} onDragStart={(e)=>onDragStart(e, object)}>
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
                            
                            <div  data-test="mapObjectCustomObjectList" className="ss__mo_customObjectList">
                                <div  data-test="mapObjectCustomHeading" className="ss__mo_lbl lblMargin">Custom Objects</div>
                                <div className="ss__mo_customOutContainer">
                                <div className="mo_listCanvas">
                                <div className="mo_listMinHeight">
                                <div className="mo_listContent" id="moListId">
                                <ScrollBar scrollId="moListId">
                                <div data-test="mapObjectCustomContainer" className="ss__mo_customInContainer">
                                { Object.keys(customList).map((elementType, i) => (
                                    <Fragment key={i}>
                                    <div data-test="mapObjectTagHead" className="mo_tagHead" onClick={()=>setSelectedTag(elementType === selectedTag ? "" : elementType )}>{elementType}</div>
                                    { selectedTag === elementType && <div className="mo_tagItemList"> 
                                        {customList[selectedTag].map((object, j) => <div data-test="mapObjectCustomListItem" key={j} title={object.title} className={"mo_tagItems"+(selectedItems.includes(object.val) ? " mo_selectedTag" : "")} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, object)}>
                                            { object.val in map ?
                                            <>
                                            <span data-test="mapObjectMappedName" className="mo_mappedName" onClick={()=>onCustomClick("", object.val)}>
                                                { showName === object.val ? object.title : map[object.val][0].title }
                                            </span>
                                            <span data-test="mapObjectFlipName" className="mo_nameFlip" onClick={()=>onCustomClick(object.val, object.val)}></span>
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
                    { errorMsg && <span  data-test="errorMessage" className="mo_errorMsg">{errorMsg}</span>}
                    <button data-test="showAll" onClick={onShowAllObjects}>Show All Objects</button>
                    <button data-test="unLink" onClick={onUnlink} disabled={!selectedItems.length}>Un-Link</button>
                    <button data-test="submit" onClick={submitMap}>Submit</button>
                </>}
            />
        </div>
    );
}
MapObjectModal.propTypes={
    scrapeItems: PropTypes.arrayOf(PropTypes.object),
    current_task:PropTypes.object,
    fetchScrapeData:PropTypes.func,
    setShow:PropTypes.func
}
export default MapObjectModal;


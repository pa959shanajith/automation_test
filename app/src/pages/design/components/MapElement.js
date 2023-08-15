import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { updateScreen_ICE } from '../api';
import RedirectPage from '../../global/components/RedirectPage';
import { Messages as MSG, VARIANT } from '../../global/components/Messages';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import { tagList } from './ListVariables';
import { CompareObj, CompareData, ImpactAnalysisScreenLevel, CompareFlag } from '../designSlice';
import '../styles/MapElement.scss';

const MapElement = (props) => {

    const [activeIndex, setActiveIndex] = useState("");
    const [mapScrapedList, setMapScrapedList] = useState({});
    const [mapCustomList, setMapCustomList] = useState({});
    const [mapNonCustomList, setMapNonCustomList] = useState([]);
    const [mapSelectedTag, setMapSelectedTag] = useState("");
    const [mapSelectedItems, setMapSelectedItems] = useState([]);
    const [mapShowName, setMapShowName] = useState("");
    const [mapOrderLists, setMapOrderLists] = useState([]);
    const [map, setMap] = useState({});
    const [leftSideList, setLeftSideList] = useState([]);
    const [fullScrapeFilteredList, setFullScrapeFilteredList] = useState([]);
    const userInfo = useSelector((state) => state.landing.userinfo);
    const compareData = useSelector(state => state.design.compareData);
    const impactAnalysisScreenLevel = useSelector(state => state.design.impactAnalysisScreenLevel);
    const { changedObj, notChangedObj, notFoundObj, fullScrapeData } = useSelector(state => state.design.compareObj);
    const [dialogVisible, setDialogVisible] = useState(impactAnalysisScreenLevel);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        let tempScrapeList = {};
        let tempCustomList = {};
        let tempNonCustom = [];
        let tempOrderList = [];
        let tempNotFound = [];
        let tempFilteredList = [];

        if (impactAnalysisScreenLevel) {
            // setDialogVisible(true);
            if (notFoundObj && notFoundObj.length) {
                notFoundObj.forEach(object => {
                    let elementType = object.tag;
                    if (object.ObjId) {
                        tempNotFound.push(object);
                        if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                        else tempScrapeList[elementType] = [object]
                        tempOrderList.push(object.objId);
                    }
                });
                setMapScrapedList(tempScrapeList); // left side filtered Data
                setLeftSideList(tempNotFound);
            }
            if (fullScrapeData && fullScrapeData.length) {
                fullScrapeData.forEach(object => {
                    let elementType = object.tag;
                    if (tempFilteredList[elementType]) tempFilteredList[elementType] = [...tempFilteredList[elementType], object];
                    else tempFilteredList[elementType] = [object]
                    if (!tempScrapeList[elementType]) tempScrapeList[elementType] = []
                })

                setFullScrapeFilteredList(tempFilteredList);
            }
        }
        else {
            if (props.captureList && props.captureList.length) {
                props.captureList.forEach(object => {
                    let elementType = object.tag;
                    elementType = props.elementTypeProp(elementType);
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
                setMapScrapedList(tempScrapeList);
                setMapCustomList(tempCustomList);
                setLeftSideList(tempNonCustom);
                setMapOrderLists(tempOrderList);
            }
        }
    }, []);


    const mapOnDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const mapOnDragOver = event => event.preventDefault();

    const mapOnDrop = (event, currObject) => {
        if (impactAnalysisScreenLevel) {
            if (map[currObject.xpath]) props.toastError("Element already merged");
            else {
                let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
                let mapping = {
                    ...map,
                    [currObject.xpath]: [draggedObject, currObject],
                    [draggedObject.xpath]: null
                }
                setMap(mapping);
            }
        }
        else {
            if (map[currObject.val]) props.toastError("Element already merged");
            else {
                let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
                let mapping = {
                    ...map,
                    [currObject.val]: [draggedObject, currObject],
                    [draggedObject.val]: null
                }
                setMap(mapping);
            }
        }
    }

    const mapOnUnlink = () => {
        let mapping = { ...map };
        for (let customObjVal of mapSelectedItems) {
            let scrapeObjVal = impactAnalysisScreenLevel ? mapping[customObjVal][0].xpath : mapping[customObjVal][0].val
            delete mapping[customObjVal];
            delete mapping[scrapeObjVal];
        }
        setMap(mapping);
        setMapSelectedItems([]);
        setMapShowName("");
    }

    const mapOnShowAllObjects = () => setMapSelectedTag("");

    const submitMap = () => {

        if (!Object.keys(map).length) {
            props.toastError(`"Please select atleast one object to " ${impactAnalysisScreenLevel ? "Replace" : "Object"}`);
            return;
        }

        // let { screenId, screenName, projectId, appType, versionnumber } = props.current_task;
        let appType = props.appType ? props.appType : "web"; //props.appType;
        const screenId = props.fetchingDetails["_id"];
        const projectId = props.fetchingDetails.projectID;
        const screenName = props.fetchingDetails["name"];
        const versionNumber = 0;

        let mapping = { ...map };

        if (impactAnalysisScreenLevel) {
            let updatedObjects = [];

            for (let val in mapping) {
                if (mapping[val]) {
                    updatedObjects.push({ ...mapping[val][1], _id: mapping[val][0].ObjId, custname: mapping[val][0].custname, title: mapping[val][0].title });
                }
            }

            let impctAnlysScrnLvlarg = {
                'modifiedObj': updatedObjects,
                'screenId': props.fetchingDetails["_id"],
                'userId': userInfo.user_id,
                'roleId': userInfo.role,
                'param': 'saveScrapeData',
                'orderList': props.orderList
            };

            updateScreen_ICE(impctAnlysScrnLvlarg)
                .then(data => {
                    if (data.toLowerCase() === "invalid session") return RedirectPage(navigate);
                    if (data.toLowerCase() === 'success') {
                        props.fetchScrapeData()
                            .then(resp => {
                                if (resp === "success") {
                                    props.toastSuccess(MSG.CUSTOM("Not Found Elements has been Successfully Replaced", VARIANT.SUCCESS));
                                    let notfoundlist = [...notFoundObj]
                                    var notfoundupdated = notfoundlist.filter(function (notfoundobj) {
                                        return !updatedObjects.find(function (elementtoberemoved) {
                                            return notfoundobj.ObjId === elementtoberemoved._id
                                        })
                                    })
                                    let changedObjNew = changedObj ? [...changedObj].map(element => element) : []
                                    let notChangedNew = notChangedObj ? [...notChangedObj].map(element => element) : []
                                    let replacedObj = updatedObjects.map(element => element)
                                    notChangedNew = [...notChangedNew, ...replacedObj];
                                    let newComparedData = { ...compareData, view: [{ changedobject: compareData.view[0].changedobject }, { notchangedobject: notChangedNew }, { notfoundobject: notfoundupdated }] }
                                    let newCompareObj = { changedObj: changedObjNew, notChangedObj: notChangedNew, notFoundObj: [...notfoundupdated], fullScrapeData: [...fullScrapeData] }
                                    // dispatch(CompareFlag(false));
                                    dispatch(CompareObj(newCompareObj));
                                    dispatch(CompareData(newComparedData));
                                    dispatch(ImpactAnalysisScreenLevel(false));
                                    props.setShow(false)
                                    // props.setReplaceVisible(false);
                                }
                                else props.toastError(MSG.CUSTOM("Error while updating Not-Found Elements", VARIANT.ERROR));

                            })
                            .catch(err => {
                                props.toastError(MSG.CUSTOM("Error while updating Not-Found Elements", VARIANT.ERROR));
                                console.error(err);
                            });
                    } else {
                        props.toastError(MSG.SCRAPE.ERR_UPDATE_OBJ);
                        props.setShow(false)
                        // props.setReplaceVisible(false);
                    }
                })
                .catch(error => console.error(error));
        } else {
            let mapArg = {
                projectId: projectId,
                screenId: screenId,
                screenName: screenName,
                param: "mapScrapeData",
                appType: appType,
                objList: [],
                orderList: mapOrderLists,
                versionnumber: 0,
            };

            for (let val in mapping) {
                if (mapping[val]) {
                    mapArg.objList.push([mapping[val][0].objId, mapping[val][1].objId, mapping[val][1].custname]);
                    mapArg.orderList.splice(mapArg.orderList.indexOf(mapping[val][0].objId), 1)
                }
            }

            updateScreen_ICE(mapArg)
                .then(response => {
                    if (response === "Invalid Session") return RedirectPage(navigate);
                    else props.fetchScrapeData()
                        .then(resp => {
                            if (resp === "success") {
                                props.toastSuccess(MSG.SCRAPE.SUCC_MAPPED_SCRAPED);
                                props.setShow(false);
                            }
                            else props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
                        })
                        .catch(err => {
                            props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
                            // console.error(err);
                        });
                })
                .catch(error => {
                    props.toastError(MSG.SCRAPE.ERR_MAPPED_SCRAPE)
                    props.toastError(error);
                })

        }
    }

    const mapOnCustomClick = (mapShowName, id) => {
        let updatedSelectedItems = [...mapSelectedItems]
        let indexOfItem = mapSelectedItems.indexOf(id);

        if (indexOfItem > -1) updatedSelectedItems.splice(indexOfItem, 1);
        else updatedSelectedItems.push(id);

        setMapShowName(mapShowName);
        setMapSelectedItems(updatedSelectedItems);
    }



    const onTabChanging = (e) => {
        setMapSelectedTag(e.originalEvent.currentTarget.innerText);
    }

    const mapElementFooter = () => (<>
        <Button data-test="showAll" size="small" onClick={mapOnShowAllObjects}>Show All Elements</Button>
        <Button data-test="unLink" size="small" onClick={mapOnUnlink} disabled={!mapSelectedItems.length}>Un-Link</Button>
        <Button data-test="submit" size="small" onClick={submitMap}>Submit</Button>
    </>
    )

    const resetHandler = () => {
        dispatch(ImpactAnalysisScreenLevel(false));
        if (props.OnClose)  props.OnClose();
        else setDialogVisible(false);
    }
    return (
        <>
            <Dialog
                className='map__object__header'
                header={() => impactAnalysisScreenLevel ? "Replace Element" : "Map Element"}
                style={{ height: "35.06rem", width: "50.06rem", marginRight: "15rem" }}
                position='right'
                visible={props.isOpen === 'mapObject' || dialogVisible}
                onHide={resetHandler}
                footer={mapElementFooter}
                draggable={false}
            >

                <p> Please select the Element type from the drop down alongside the objects to be mapped to the necessary object types captured in the screen.</p>
                <div className="map_element_content ">
                    <div className="captured_elements">
                        <span className="header">{impactAnalysisScreenLevel ? "Not Found Elements" : "Captured Elements"}</span>
                        <div className="list">
                            {(mapSelectedTag ? mapScrapedList[mapSelectedTag] : leftSideList).map((object, i) => {
                                let mapped = (impactAnalysisScreenLevel ? object.xpath : object.val) in map;

                                return (<>
                                    {/* <Tooltip target={`custnames${i}`} content={object.title}></Tooltip> */}
                                    <div data-test="mapObjectListItem" key={i} className={"ss__mo_listItem" + (mapped ? " mo_mapped" : "")} draggable={mapped ? "false" : "true"} onDragStart={(e) => mapOnDragStart(e, object)}>
                                        {object.custname}
                                    </div>
                                </>)
                            })
                            }
                        </div>
                    </div>

                    <div className="custom_element">
                        <span className="header">{impactAnalysisScreenLevel ? "Full Scrape Elements" : "Custom Elements"}</span>
                        <div className="container">
                            {(impactAnalysisScreenLevel ? Object.keys(fullScrapeFilteredList) : Object.keys(mapCustomList)).map((elementType, i) => (
                                <div className='acoordian_container'>
                                    <Accordion activeIndex={activeIndex} onTabOpen={(e) => { setActiveIndex(e.index); onTabChanging(e) }} onTabClose={() => { setActiveIndex(""); setMapSelectedTag("") }}>
                                        <AccordionTab header={elementType} >
                                            {<div className="mo_tagItemList">

                                                {impactAnalysisScreenLevel ? fullScrapeFilteredList[elementType].map((object, j) => (

                                                    <div data-test="mapObjectCustomListItem" key={j}
                                                        // title={object.custname}
                                                        className={"mo_tagItems" + (mapSelectedItems.includes(object.xpath) ? " mo_selectedTag" : "")}
                                                        onDragOver={mapOnDragOver}
                                                        onDrop={(e) => mapOnDrop(e, object)}>

                                                        {object.xpath in map ?
                                                            <>
                                                                <span data-test="mapObjectMappedName" className="mo_mappedName" onClick={() => mapOnCustomClick("", object.xpath)}
                                                                    title={mapShowName === object.xpath ? object.custname : map[object.xpath][0].title}>
                                                                    {mapShowName === object.xpath ? object.custname : map[object.xpath][0].title}
                                                                </span>
                                                                <span data-test="mapObjectFlipName" className="mo_nameFlip" onClick={() => mapOnCustomClick(object.xpath, object.xpath)}></span>
                                                            </> :
                                                            <span data-test="h3" className='pl-2' title={object.custname} >{object.custname}</span>
                                                        }

                                                    </div>))

                                                    : mapCustomList[elementType].map((object, j) => (

                                                        <div data-test="mapObjectCustomListItem"
                                                            key={j}
                                                            className={"mo_tagItems" + (mapSelectedItems.includes(object.val) ? " mo_selectedTag" : "")}
                                                            onDragOver={mapOnDragOver}
                                                            onDrop={(e) => mapOnDrop(e, object)}>

                                                            {object.val in map ?
                                                                <>
                                                                    <span data-test="mapObjectMappedName" className="mo_mappedName" onClick={() => mapOnCustomClick("", object.val)}>
                                                                        {mapShowName === object.val ? object.title : map[object.val][0].title}
                                                                    </span>
                                                                    <span data-test="mapObjectFlipName" className="mo_nameFlip" onClick={() => mapOnCustomClick(object.val, object.val)}></span>
                                                                </> :
                                                                <span data-test="h3" className='pl-2' title={object.custname}>{object.custname}</span>
                                                            }

                                                        </div>))}
                                            </div>}
                                        </AccordionTab>
                                    </Accordion>
                                </div>))}
                        </div>
                    </div>
                </div>
            </Dialog >

        </>
    )
}
export default MapElement
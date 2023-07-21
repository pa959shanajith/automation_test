import React, { useState, useContext, useEffect, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ModalContainer, ScrollBar, RedirectPage, Messages as MSG, setMsg, VARIANT} from '../../global';
import { useHistory } from 'react-router-dom';
import CompareBox from './CompareBox';
import ScreenWrapper from './ScreenWrapper';
import { ScrapeContext } from '../components/ScrapeContext';
import * as actions from '../state/action';
import { updateScreen_ICE } from '../api';
import "../styles/CompareObjectList.scss";
import * as actionTypes from '../state/action';
import "../styles/MapObjectModal.scss";

const CompareObjectList = (props) => {

    const { changedObj, notChangedObj, notFoundObj, fullScrapeData } = useSelector(state => state.scrape.compareObj);
    // const { screenId } = props.fetchingDetails["_id"];
    const { user_id, role } = useSelector(state => state.login.userinfo);
    const compareData = useSelector(state => state.scrape.compareData);
    const { setShowPop, fetchScrapeData, mainScrapedData, newScrapedData, orderList, oldScrapedObjsMap } = useContext(ScrapeContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const [checkedList, setCheckedList] = useState([]);
    const [viewString, setViewString] = useState({});
    const [replaceVisible, setReplaceVisible] = useState(false);

    useEffect(() => {
        let newViewString = { ...viewString };
        newViewString = Object.keys(newScrapedData).length ? { ...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view] } : { ...mainScrapedData };
        newViewString = { ...newViewString, view: newViewString.view.filter(object => object.xpath.substring(0, 4) !== "iris") }
        setViewString(newViewString);

        return () => {
            dispatch({ type: actions.RESET_COMPARE, payload: null })
            dispatch({ type: actions.SET_OBJVAL, payload: { val: null } });
        }
        //eslint-disable-next-line
    }, [])
  
    const closeCompare = () => {
        dispatch({ type: actions.RESET_COMPARE, payload: null })
        dispatch({ type: actions.SET_OBJVAL, payload: { val: null } });
    }

    const updateObjects = () => {

        let updatedObjects = [];
        let updatedCompareData = { ...compareData };
        for (let index of checkedList) {
            updatedCompareData.view[0].changedobject[index]._id = viewString.view[updatedCompareData.changedobjectskeys[index]]._id
            updatedObjects.push(updatedCompareData.view[0].changedobject[index]);
        };

        let arg = {
            'modifiedObj': updatedObjects,
            'screenId': props.fetchingDetails["_id"],
            'userId': user_id,
            'roleId': role,
            'param': 'saveScrapeData',
            'orderList': orderList
        };

        updateScreen_ICE(arg)
            .then(data => {
                if (data.toLowerCase() === "invalid session") return RedirectPage(history);
                if (data.toLowerCase() === 'success') {
                    setShowPop({
                        title: "Compared Objects",
                        type: "modal",
                        content: "Updated Compared Objects Successfully!",
                        'footer': <button onClick={() => {
                            fetchScrapeData().then(resp => {
                                if (resp === "success") {
                                    closeCompare();
                                    setShowPop(false);
                                }
                                else console.error(resp)
                            })
                                .catch(err => console.error(err));
                        }}>OK</button>
                    });
                } else {
                    setMsg(MSG.SCRAPE.ERR_UPDATE_OBJ);
                    closeCompare();
                }
            })
            .catch(error => console.error(error));
    }

    return (
        <ScreenWrapper
            fullHeight={true}
            compareContent={
                <div className="ss__compareContents">
                    <div className="ss__comparebtngroup">
                        {(changedObj && changedObj.length) ? <button className="ss__compareAction" onClick={updateObjects}>Update</button> : null}
                        <button className="ss__compareAction" onClick={closeCompare}>Cancel</button>
                    </div>
                    <div className="ss__compareboxes">
                        <div className="ss__cmprListAbsolute">
                            <div className="ss__cmprListMin">
                                <div className="ss__cmprListCon" id="cmprObjListId">
                                    <ScrollBar scrollId="cmprObjListId" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" verticalbarWidth='8px'>
                                        {(changedObj && changedObj.length) ? <CompareBox checkedList={checkedList} setCheckedList={setCheckedList} header="Changed Objects" objList={changedObj} /> :null}
                                        {(notChangedObj && notChangedObj.length) ? <CompareBox header="Unchanged Objects" objList={notChangedObj} hideCheckbox={true} />:null}
                                        {(notFoundObj && notFoundObj.length) ? <CompareBox
                                            replaceVisible={replaceVisible}
                                            setReplaceVisible={setReplaceVisible}
                                            fullScrapeData={fullScrapeData}
                                            oldScrapedObjsMap={oldScrapedObjsMap}
                                            header="Not Found Objects"
                                            objList={notFoundObj}
                                            hideCheckbox={true}
                                            showMapBtn={true}
                                        /> :null}
                                        {replaceVisible && <MapObjectModal
                                            setShowPop={setShowPop}
                                            closeCompare={closeCompare}
                                            fetchScrapeData={fetchScrapeData}
                                            fetchingDetails={props.fetchingDetails}
                                            nonFoundList={notFoundObj}
                                            changedObj={changedObj}
                                            notchangedobject={notChangedObj}
                                            // filteredFullScrapeData={fullScrapeData} 
                                            setReplaceVisible={setReplaceVisible} ></MapObjectModal>}
                                    </ScrollBar>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
export default CompareObjectList;


const MapObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({}); // for left side filter data
    const [notFoundList, setNotFoundList] = useState([]);
    const [FilteredList, setFilteredList] = useState({});
    const [selectedTag, setSelectedTag] = useState("");
    const [map, setMap] = useState({});
    const [showName, setShowName] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const { user_id, role } = useSelector(state => state.login.userinfo);
    const compareData = useSelector(state => state.scrape.compareData);
    const { changedObj, notChangedObj, notFoundObj, fullScrapeData } = useSelector(state => state.scrape.compareObj);
    const dispatch = useDispatch();
    const history = useHistory();
    const { fetchScrapeData, orderList } = useContext(ScrapeContext);

    useEffect(() => {
        let tempScrapeList = {};
        let tempFilteredList = {};
        let tempNotFound = [];
        let tempOrderList = [];
        if (props.nonFoundList.length) {
            props.nonFoundList.forEach(object => {
                let elementType = object.tag;
                if (object.ObjId) {
                    tempNotFound.push(object);
                    if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                    else tempScrapeList[elementType] = [object]
                    tempOrderList.push(object.objId);
                }
            });
            setScrapedList(tempScrapeList); // left side filtered Data
            setNotFoundList(tempNotFound);
        }
        if (fullScrapeData && fullScrapeData.length) {
            fullScrapeData.forEach(object => {
                let elementType = object.tag;
                if (tempFilteredList[elementType]) tempFilteredList[elementType] = [...tempFilteredList[elementType], object];
                else tempFilteredList[elementType] = [object]
                if (!tempScrapeList[elementType]) tempScrapeList[elementType] = []
            })

            setFilteredList(tempFilteredList);
        }
    }, [])

    const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const onDragOver = event => event.preventDefault();

    const onDrop = (event, currObject) => {
        if (map[currObject.xpath]) setErrorMsg("Object already merged");
        else {
            let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
            let mapping = {
                ...map,
                [currObject.xpath]: [draggedObject, currObject],
                [draggedObject.xpath]: null
            }
            setMap(mapping);
            setErrorMsg("");
        }
    }

    const onUnlink = () => {
        let mapping = { ...map };
        for (let customObjVal of selectedItems) {
            let scrapeObjVal = mapping[customObjVal][0].xpath
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
            setErrorMsg("Please select atleast one object to Replace");
            return;
        }

        let mapping = { ...map };
        let updatedObjects = [];
        for (let val in mapping) {
            if (mapping[val]) {
                updatedObjects.push({ ...mapping[val][1], _id: mapping[val][0].ObjId, custname: mapping[val][0].custname, title: mapping[val][0].title });
            }
        }

        let arg = {
            'modifiedObj': updatedObjects,
            'screenId': props.fetchingDetails["_id"],
            'userId': user_id,
            'roleId': role,
            'param': 'saveScrapeData',
            'orderList': orderList
        };

        updateScreen_ICE(arg)
            .then(data => {
                if (data.toLowerCase() === "invalid session") return RedirectPage(history);
                if (data.toLowerCase() === 'success') {
                    fetchScrapeData()
                        .then(resp => {
                            if (resp === "success") {
                                setMsg(MSG.CUSTOM("Not Found Elements has been Successfully Replaced",VARIANT.SUCCESS));
                                let notfoundlist = [...props.nonFoundList]
                                var notfoundupdated = notfoundlist.filter(function (notfoundobj) {
                                    return !updatedObjects.find(function (elementtoberemoved) {
                                        return notfoundobj.ObjId === elementtoberemoved._id
                                    })
                                })
                                let changedObjNew = props.changedObj ? [...props.changedObj].map(element => element) : []
                                let notChangedNew = props.notchangedobject ? [...props.notchangedobject].map(element => element) : []
                                let replacedObj =  updatedObjects.map(element=>element)
                                notChangedNew = [...notChangedNew, ...replacedObj ];
                                let newComparedData = { ...compareData, view: [{ changedobject: compareData.view[0].changedobject }, { notchangedobject: notChangedNew }, { notfoundobject: notfoundupdated }] }
                                let newCompareObj = { changedObj: changedObjNew, notChangedObj: notChangedNew, notFoundObj: [...notfoundupdated], fullScrapeData: [...fullScrapeData] }
                                dispatch({ type: actionTypes.SET_COMPAREFLAG, payload: false })
                                dispatch({ type: actionTypes.SET_COMPAREOBJ, payload: newCompareObj });
                                dispatch({ type: actionTypes.SET_COMPAREDATA, payload: newComparedData });

                                dispatch({ type: actionTypes.SET_IMPACT_ANALYSIS_SCREENLEVEL, payload: true });
                                props.setReplaceVisible(false);
                            }
                            else  setMsg(MSG.CUSTOM("Error while updating Not-Found Elements",VARIANT.ERROR));

                        })
                        .catch(err => {
                            setMsg(MSG.CUSTOM("Error while updating Not-Found Elements",VARIANT.ERROR));
                            console.error(err);
                        });
                } else {
                    setMsg(MSG.SCRAPE.ERR_UPDATE_OBJ);
                    props.setReplaceVisible(false);
                }
            })
            .catch(error => console.error(error));
    }

    const onCustomClick = (showName, id) => {
        let updatedSelectedItems = [...selectedItems]
        let indexOfItem = selectedItems.indexOf(id);

        if (indexOfItem > -1) updatedSelectedItems.splice(indexOfItem, 1);
        else updatedSelectedItems.push(id);

        setShowName(showName);
        setSelectedItems(updatedSelectedItems);
    }

    return (
        <div data-test="mapObject" className="ss__mapObj">
            <ModalContainer
                title="Replace Element"
                content={
                    <div className="ss__mapObjBody">
                        <div data-test="mapObjectHeading" className="ss__mo_lbl headerMargin">Please select the elements to drag and drop</div>
                        <div className="ss__mo_lists">
                            <div data-test="mapObjectScrapeObjectList" className="ss__mo_scrapeObjectList">
                                <div data-test="mapObjectLabel" className="ss__mo_lbl lblMargin">Not Found Elements</div>
                                <div className="mo_scrapeListContainer">
                                    <div className="mo_listCanvas">
                                        <div className="mo_listMinHeight">
                                            <div data-test="mapObjectListContent" className="mo_listContent" id="moListId">
                                                <ScrollBar scrollId="moListId" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" verticalbarWidth='8px'>
                                                    <>
                                                        {(() => selectedTag ? scrapedList[selectedTag] : notFoundList)()
                                                            .map((object, i) => {
                                                                let mapped = object.xpath in map;
                                                                return (<div data-test="mapObjectListItem" key={i} title={object.title} className={"ss__mo_listItem" + (mapped ? " mo_mapped" : "")} draggable={mapped ? "false" : "true"} onDragStart={(e) => onDragStart(e, object)}>
                                                                    {object.title}
                                                                </div>)
                                                            })}
                                                    </>
                                                </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div data-test="mapObjectCustomObjectList" className="ss__mo_customObjectList">
                                <div data-test="mapObjectCustomHeading" className="ss__mo_lbl lblMargin">Newly Captured Elements</div>
                                <div className="ss__mo_customOutContainer">
                                    <div className="mo_listCanvas">
                                        <div className="mo_listMinHeight">
                                            <div className="mo_listContent" id="moListId">
                                                <ScrollBar scrollId="moListId">
                                                    <div data-test="mapObjectCustomContainer" className="ss__mo_customInContainer">
                                                        {Object.keys(FilteredList).length > 0 ? Object.keys(FilteredList).map((elementType, i) => (
                                                            <Fragment key={i}>
                                                                <div data-test="mapObjectTagHead" className="mo_tagHead" onClick={() => setSelectedTag(elementType === selectedTag ? "" : elementType)}>{elementType}</div>
                                                                {selectedTag === elementType && <div className="mo_tagItemList">
                                                                    {FilteredList[selectedTag].map((object, j) =>
                                                                        <div data-test="mapObjectCustomListItem" key={j}
                                                                            title={object.custname}
                                                                            className={"mo_tagItems" + (selectedItems.includes(object.xpath) ? " mo_selectedTag" : "")}
                                                                            onDragOver={onDragOver} onDrop={(e) => onDrop(e, object)}>
                                                                            {object.xpath in map ?
                                                                                <>
                                                                                    <span data-test="mapObjectMappedName" className="mo_mappedName" onClick={() => onCustomClick("", object.xpath)}>
                                                                                        {showName === object.xpath ? object.custname : map[object.xpath][0].title}
                                                                                    </span>
                                                                                    <span data-test="mapObjectFlipName" className="mo_nameFlip" onClick={() => onCustomClick(object.xpath, object.xpath)}></span>
                                                                                </> :
                                                                                <span data-test="h3">{object.custname}</span>}

                                                                        </div>)}
                                                                </div>}
                                                            </Fragment>
                                                        )) : 
                                                        <span style={{color:'red'}}>{`No elements found that can be replaced with "Not found element"`}</span>
                                                        }
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
                close={() => props.setReplaceVisible(false)}
                footer={<>
                    {errorMsg && <span data-test="errorMessage" className="mo_errorMsg">{errorMsg}</span>}
                    <button data-test="showAll" onClick={onShowAllObjects}>Show All Elements</button>
                    <button data-test="unLink" onClick={onUnlink} disabled={!selectedItems.length}>Un-Link</button>
                    <button data-test="submit" onClick={submitMap}>Save</button>
                </>}
            />
        </div>
    );
}

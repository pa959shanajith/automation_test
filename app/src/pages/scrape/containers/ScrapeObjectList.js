import React, { useState, useEffect, useContext, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import { useHistory } from 'react-router-dom';
import ScrapeObject from '../components/ScrapeObject';
import { ScrollBar, RedirectPage, VARIANT, Messages, setMsg } from "../../global"
import { ScrapeContext } from '../components/ScrapeContext';
import * as actionTypes from '../state/action';
import * as scrapeApi from '../api';
import "../styles/ScrapeObjectList.scss";
import ScreenWrapper from './ScreenWrapper';
import SubmitTask from '../components/SubmitTask';

const ScrapeObjectList = () => {
    const dispatch = useDispatch();
    const current_task = useSelector(state=>state.plugin.CT);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const isFiltered = useSelector(state=>state.scrape.isFiltered);
    const history = useHistory();

    // const [activeEye, setActiveEye] = useState(null);
    const [disableBtns, setDisableBtns] = useState({save: true, delete: true, edit: true, search: false, selAll: false, dnd: false});
    const [showSearch, setShowSearch] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [selAllCheck, setSelAllCheck] = useState(false);
    const [deleted, setDeleted] = useState([]);
    const [modified, setModified] = useState({});
    const [editableObj, setEditableObj] = useState({});
    const [dnd, setDnd] = useState(false);
    const { setShowObjModal, fetchScrapeData, saved, setSaved, newScrapedData, setNewScrapedData, setShowPop, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems, setOrderList } = useContext(ScrapeContext);

    useEffect(()=> {
        // setActiveEye(null);
        setShowSearch(false);
        setSearchVal("");
        setSelAllCheck(false);
        setDeleted([]);
        setModified({});
        setEditableObj({});
        setSaved({ flag: true });
        setDnd(false);
        //eslint-disable-next-line
    }, [current_task])

    useEffect(()=>{
        let disable = {};
        let disableSelect = false;
        let disableDelete = true;
        let checkAll = false;
        let hidden = 0;
        let selected = 0;
        let total = 0;
        let visible = 0;
        let selectedObj = null;
        scrapeItems.forEach(item=>{
            if (item.hide) hidden++;
            else visible++;
            if (!item.hide && item.checked) {
                selected++;
                selectedObj = item;
            }
            total++;
        })

        if (total === hidden) disableSelect = true;
        else if (visible === selected) checkAll = true;
        
        if (visible > 0 && selected > 0) disableDelete = false;

        if (disableSelect) disable = { ...disable, selAll: true, dnd: true };
        else disable = { ...disable, selAll: false, dnd: false }

        if (!disableDelete) disable = {...disable, delete: false};
        else disable = {...disable, delete: true};

        if (selected === 1 && selectedObj.editable) {
            disable = { ...disable, edit: false};
            setEditableObj(selectedObj);
        } else {
            disable = { ...disable, edit: true};
            setEditableObj({});
        }

        if (dnd) disable = { ...disable, selAll: true};
        if (isFiltered || total === 1) disable = { ...disable, dnd: true};

        setDisableBtns({...disableBtns, ...disable})
        setSelAllCheck(checkAll);
        //eslint-disable-next-line
    }, [scrapeItems])

    useEffect(()=>{
        if (!saved.flag) setDisableBtns({...disableBtns, save: false});
        else {
            setDisableBtns({...disableBtns, save: true});
            setDeleted([]);
            setDnd(false); 
            setModified({});
            setShowSearch(false);
            setSearchVal("");
            setSelAllCheck(false);
            setEditableObj({});
        }
        //eslint-disable-next-line
    }, [saved])

    const updateChecklist = (value, event) => {

        let localItems = [...scrapeItems];
        
        if (value === "all") {
            if (event.target.checked) {
                localItems.forEach(item => { if (!item.hide) {
                    item.checked = true;
                }})
            }
            else localItems.forEach(item => { if (!item.hide) {
                item.checked = false;
            }})
        }
        else {
            localItems.forEach(item => { 
                if (!item.hide && item.val === value) item.checked = !item.checked;
            })
        }

        setScrapeItems(localItems)
    }
    
    const modifyScrapeItem = (value, newProperties, customFlag) => {
        let localScrapeItems = [...scrapeItems];
        let updNewScrapedData = {...newScrapedData};
        let objId = "";
        let isCustom = false;
        let obj = null;
        for (let scrapeItem of localScrapeItems){
            if (scrapeItem.val === value) {
                scrapeItem.title = newProperties.custname;
                if (customFlag) {
                    scrapeItem.tag = newProperties.tag;
                    scrapeItem.url = newProperties.url;
                    scrapeItem.xpath = newProperties.xpath;
                    scrapeItem.editable = true;
                }
                objId = scrapeItem.objId;
                isCustom = scrapeItem.isCustom; 
                if (objId) obj = {...mainScrapedData.view[scrapeItem.objIdx], ...newProperties};
                else if (!isCustom) updNewScrapedData.view[scrapeItem.objIdx] = {...newScrapedData.view[scrapeItem.objIdx], ...newProperties}
                // else only if customFlag is true
            };
        }
        
        if (objId) {
            let modifiedDict = {...modified}
            modifiedDict[objId] = obj;
            setModified(modifiedDict);
        }
        else if (!isCustom) setNewScrapedData(updNewScrapedData);
        if(!(newProperties.tag && newProperties.tag.substring(0, 4) === "iris")) setSaved({ flag: false });
        setScrapeItems(localScrapeItems);
    }

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch === false) {
            let scrapeItemsL = [...scrapeItems]
            scrapeItemsL.forEach(item => item.hide = false);
            setScrapeItems(scrapeItemsL)
        }
        setSearchVal("");
    }

    const onEdit = () => {
        let modalObject = {};
        if (editableObj.tag.substring(0, 4) === "iris") {
            modalObject = {
                operation: "editIrisObject",
                object: editableObj,
                modifyScrapeItem: (value, newProperties, customFlag) => modifyScrapeItem(value, newProperties, customFlag),
                cord: (editableObj.objId ? mainScrapedData.view : newScrapedData.view)[editableObj.objIdx].cord
            };
        } else {
            modalObject = {
                operation: "editObject",
                modifyScrapeItem: (value, newProperties, customFlag) => modifyScrapeItem(value, newProperties, customFlag),
                object: editableObj
            }
        }
        setShowObjModal(modalObject);
    }

    const onSearch = event => {
        let scrapeItemsL = [...scrapeItems]
        let value = event.target.value;
        scrapeItemsL.forEach(item => {
                        if (item.title.toLowerCase().indexOf(value.toLowerCase()) < 0){
                            item.hide = true;
                        } else {
                            item.hide = false
                        };
                    });
        setSearchVal(value);
        setScrapeItems(scrapeItemsL)
    }

    const onDelete = (e, confirmed) => {
        if (mainScrapedData.reuse && !confirmed) {
            setShowConfirmPop({'title': "Delete Scraped data", 'content': 'Screen has been reused. Are you sure you want to delete scrape objects?', 'onClick': ()=>{setShowConfirmPop(false); onDelete(null, true);}})
            return;
        }
        let deletedArr = [...deleted];
        let scrapeItemsL = [...scrapeItems];
        let modifiedDict = {...modified}
        let newScrapeList = [];
        let newOrderList = [];
        newScrapeList = scrapeItemsL.filter( item => {
            if (item.checked){
                if (item.objId) {
                    deletedArr.push(item.objId);
                    if (item.objId in modifiedDict)
                        delete modifiedDict[item.objId]
                }
                return false;
            } else {
                newOrderList.push(item.objId || item.tempOrderId)
                return true;
            }
        });
        setScrapeItems(newScrapeList)
        setDeleted(deletedArr);
        setOrderList(newOrderList);
        setModified(modifiedDict);
        setDisableBtns({...disableBtns, delete: true})
        setSaved({flag: false});
    }

    const onSave = (e, confirmed) => {
        let continueSave = true;
        
        if (mainScrapedData.reuse && !confirmed) {
            setShowConfirmPop({'title': "Save Scraped data", 'content': 'Screen has been reused. Are you sure you want to save scrape objects?', 'onClick': ()=>{setShowConfirmPop(false); onSave(null, true);}})
            return;
        }

        let dXpath = false;
        let dCustname = false;
        let uniqueCusts = [];
        let uniqueXPaths = [];
        let dCusts = [];
        let dCusts2 = [];
        let scrapeItemsL = [...scrapeItems];

        if (scrapeItemsL.length > 0) {
            for (let scrapeItem of scrapeItemsL) {
                if (uniqueCusts.includes(scrapeItem.title)) {
                    dCustname = true;
                    scrapeItem.duplicate = true;
                    dCusts.push(scrapeItem.title);
                }
                else {
                    scrapeItem.duplicate = false;
                    uniqueCusts.push(scrapeItem.title);
                }
            }
            if (!dCustname) {
                for (let scrapeItem of scrapeItemsL) {
                    if (scrapeItem.xpath === "" || scrapeItem.xpath === undefined) continue;
                    let xpath = scrapeItem.xpath;
    
                    if (current_task.appType === 'MobileWeb') xpath = xpath.split(";")[2];
    
                    if (uniqueXPaths.includes(xpath)) {
                        dXpath = true;
                        scrapeItem.duplicate = true;
                        dCusts2.push(scrapeItem.title);
                    }
                    else {
                        scrapeItem.duplicate = false;
                        uniqueXPaths.push(xpath);
                    }
                }
            }

            if (dCustname) {
                continueSave = false;
                setShowPop({
                    'type': 'modal',
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Please rename/delete duplicate scraped objects
                        <br/><br/>
                        Object characterstics are same for:
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)">
                            <div className="ss__dup_scroll">
                            { dCusts.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
                            </div>
                        </ScrollBar>
                    </div>,
                    'footer': <button onClick={()=>setShowPop("")}>OK</button>
                })
            } else if (dXpath) {
                continueSave = false;
                setShowConfirmPop({
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Object characteristics are same for the below list of objects:
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)">
                            <div className="ss__dup_scroll">
                            { dCusts2.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
                            </div>
                        </ScrollBar>
                        <br/>
                        Do you still want to continue?
                    </div>,
                    'onClick': ()=>{setShowConfirmPop(false); saveScrapedObjects();},
                    'continueText': "Continue",
                    'rejectText': "Cancel"
                })
            }
        }

        if (continueSave) saveScrapedObjects();
    }

    const saveScrapedObjects = () => {
        let scrapeItemsL = [...scrapeItems];
        let added = Object.keys(newScrapedData).length ? { ...newScrapedData } : { ...mainScrapedData };
        let views = [];
        let orderList = [];
        let modifiedObjects = Object.values(modified);

        for (let scrapeItem of scrapeItemsL) {
            if (!scrapeItem.objId) {
                if (scrapeItem.isCustom) views.push({custname: scrapeItem.title, xpath: scrapeItem.xpath, tag: scrapeItem.tag, tempOrderId: scrapeItem.tempOrderId});
                else views.push({...newScrapedData.view[scrapeItem.objIdx], custname: scrapeItem.title, tempOrderId: scrapeItem.tempOrderId});
                orderList.push(scrapeItem.tempOrderId);
            }
            else orderList.push(scrapeItem.objId);
        }
        
        let params = {
            'deletedObj': deleted,
            'modifiedObj': modifiedObjects,
            'addedObj': {...added, view: views},
            'screenId': current_task.screenId,
            'userId': user_id,
            'roleId': role,
            'param': 'saveScrapeData',
            'orderList': orderList
        }

        scrapeApi.updateScreen_ICE(params)
        .then(response => {
            if (response === "Invalid Session") return RedirectPage(history);
            else fetchScrapeData().then(resp=>{
                if (resp === 'success' || typeof(resp) === "object"){
                    setMsg(Messages.CUSTOM(
                        typeof(resp)==="object" && resp.length>0 ? <div className="ss__dup_labels">
                            Scraped data saved successfully.
                            <br/><br/>
                            <strong>Warning: Please scrape an IRIS reference object.</strong>
                            <br/><br/>
                            Matching objects found for:
                            { resp.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
                        </div> : 'Scraped data saved successfully.',VARIANT.SUCCESS))
                    let numOfObj = scrapeItemsL.length;
                    setDisableBtns({save: true, delete: true, edit: true, search: false, selAll: numOfObj===0, dnd: numOfObj===0||numOfObj===1 });
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: numOfObj !== 0});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: numOfObj === 0});
                    setSaved({ flag: true });
                } else console.error(resp);
            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error))
    }

    const onDrop = () => {
        setSaved({ flag: false });
    }

    const onRearrange = (e, status) => {
        if (!status) setDnd(true);
        else setDnd(false);
        e.stopPropagation();
    }

    return (
        <ScreenWrapper 
            buttonGroup={
                <div className="ss__btngroup">
                    <div className="ss__left-btns">
                        <label data-test="selectalllabel" className="ss__select-all">
                            <input className="ss__select-all-chkbox" type="checkbox" checked={selAllCheck} disabled={disableBtns.selAll} onChange={(e)=>updateChecklist("all", e)}/>
                            <span className="ss__select-all-lbl">
                                Select all
                            </span>
                        </label>
                        <button data-test="save" className="ss__taskBtn ss__btn" disabled={disableBtns.save} onClick={onSave}>Save</button>
                        <button data-test="delete"className="ss__taskBtn ss__btn" disabled={disableBtns.delete} onClick={onDelete}>Delete</button>
                        <button data-test="edit"className="ss__taskBtn ss__btn" disabled={disableBtns.edit} onClick={onEdit}>Edit</button>
                        <button data-test="dnd"className="ss__taskBtn ss__btn" disabled={disableBtns.dnd} onClick={(e)=>onRearrange(e, dnd)}>{dnd?"Stop":"Rearrange"}</button>
                        <button data-test="search"className="ss__search-btn" onClick={toggleSearch}>
                            <img className="ss__search-icon" alt="search-ic" src="static/imgs/ic-search-icon.png"/>
                        </button>
                        { showSearch && <input data-test="searchbox" className="ss__search_field" value={searchVal} onChange={onSearch}/>}
                    </div>

                    <SubmitTask />

                </div>
            }
            scrapeObjectList={
                <div className="scraped_obj_list">
                <div className="sc__ab">
                    <div className="sc__min">
                    <div className="sc__con" id="scrapeObjCon">
                    <ScrollBar scrollId="scrapeObjCon" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    <ReactSortable data-test="scrapeObjectContainer" className="scrape_object_container" list={scrapeItems} setList={setScrapeItems} onEnd={onDrop} key={dnd.toString()} disabled={!dnd}>
                    {
                        scrapeItems.map((object, index) =><Fragment key={`${object.val}`}> 
                                                        { !object.hide && 
                                                            <ScrapeObject idx={index} object={object} updateChecklist={updateChecklist}
                                                                modifyScrapeItem={modifyScrapeItem} hide={object.hide} dnd={dnd} />}
                                                        </Fragment>)
                    }
                    </ReactSortable>
                    </ScrollBar>
                    </div>
                    </div>
                </div>
                </div>
            }
        />
    );
}

export default ScrapeObjectList;
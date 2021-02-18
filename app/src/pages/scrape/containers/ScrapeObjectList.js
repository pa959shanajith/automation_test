import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ScrapeObject from '../components/ScrapeObject';
import { ScrollBar, RedirectPage } from "../../global"
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
    const history = useHistory();

    const [activeEye, setActiveEye] = useState(null);
    const [disableBtns, setDisableBtns] = useState({save: true, delete: true, edit: true, search: false, selAll: false});
    const [showSearch, setShowSearch] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [selAllCheck, setSelAllCheck] = useState(false);
    const [deleted, setDeleted] = useState([]);
    const [modified, setModified] = useState({});
    const [editableObj, setEditableObj] = useState({});
    const { setShowObjModal, fetchScrapeData, saved, setSaved, newScrapedData, setNewScrapedData, setShowPop, setShowConfirmPop, mainScrapedData, scrapeItems, setScrapeItems } = useContext(ScrapeContext);

    useEffect(()=> {
        setActiveEye(null);
        setShowSearch(false);
        setSearchVal("");
        setSelAllCheck(false);
        setDeleted([]);
        setModified({});
        setEditableObj({});
        setSaved(true);
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

        if (disableSelect) disable = { ...disable, selAll: true };
        else disable = { ...disable, selAll: false }

        if (!disableDelete) disable = {...disable, delete: false};
        else disable = {...disable, delete: true};

        if (selected === 1 && selectedObj.editable) {
            disable = { ...disable, edit: false};
            setEditableObj(selectedObj);
        } else {
            disable = { ...disable, edit: true};
            setEditableObj({});
        }

        setDisableBtns({...disableBtns, ...disable})
        setSelAllCheck(checkAll);
    }, [scrapeItems])

    useEffect(()=>{
        if (!saved) setDisableBtns({...disableBtns, save: false});
        else {
            setDisableBtns({...disableBtns, save: true});
            setDeleted([]);
            setModified({});
            setActiveEye(null);
            setShowSearch(false);
            setSearchVal("");
            setSelAllCheck(false);
            setEditableObj({});
        }
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
                if (objId) obj = {...mainScrapedData.view[scrapeItem.objIdx], ...newProperties};
                else updNewScrapedData.view[scrapeItem.objIdx] = {...newScrapedData.view[scrapeItem.objIdx], ...newProperties}
                // else only if customFlag is true
            };
        }
        
        if (objId) {
            let modifiedDict = {...modified}
            modifiedDict[objId] = obj;
            setModified(modifiedDict);
        }
        else setNewScrapedData(updNewScrapedData);
        if(!(newProperties.tag && newProperties.tag.substring(0, 4) === "iris")) setSaved(false);
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

    const onDelete = () => {
        // setShowConfirmPop({
            // title: "Delete Scraped Data",
            // content: current_task.reuse === 'True' ? "Screen is been reused. Are you sure you want to delete objects?" : "Are you sure you want to delete objects?",
            // onClick: ()=>{
                let deletedArr = [];
                let scrapeItemsL = [...scrapeItems];
                let modifiedDict = {...modified}
                let newScrapeList = [];
                newScrapeList = scrapeItemsL.filter( item => {
                    if (item.checked){
                        if (item.objId) {
                            deletedArr.push(item.objId);
                            if (item.objId in modifiedDict)
                                delete modifiedDict[item.objId]
                        }
                        return false;
                    } else return true;
                });
                setScrapeItems(newScrapeList)
                setDeleted(deletedArr);
                setModified(modifiedDict);
                setDisableBtns({...disableBtns, delete: true, save: false})
        //         onSave(null, {deletedArr: deletedArr, newScrapeList: newScrapeList, modifiedDict: modifiedDict});
        //     }
        // });
    }

    const onSave = () => {
        let continueSave = true;
        
        if (current_task.reuse === 'True') {
            setShowConfirmPop({'title': "Save Scraped data", 'content': 'Screen is been reused. Are you sure you want to save objects?', 'onClick': ()=>{setShowConfirmPop(false); saveScrapedObjects();}})
            continueSave = false;
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
                else uniqueCusts.push(scrapeItem.title);
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
                    else uniqueXPaths.push(xpath);
                }
            }

            if (dCustname) {
                continueSave = false;
                setShowPop({
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Please rename/delete duplicate scraped objects
                        <br/><br/>
                        Object characterstics are same for:
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)">
                            <div className="ss__dup_scroll">
                            { dCusts.map(custname => <span className="ss__dup_li">{custname}</span>) }
                            </div>
                        </ScrollBar>
                    </div>
                })
            } else if (dXpath) {
                continueSave = false;
                setShowConfirmPop({
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Object characteristics are same for the below list of objects:
                        <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)">
                            <div className="ss__dup_scroll">
                            { dCusts2.map(custname => <span className="ss__dup_li">{custname}</span>) }
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
        let views = []
        for (let scrapeItem of scrapeItemsL) {
            if (!scrapeItem.objId) {
                if (scrapeItem.isCustom) views.push({custname: scrapeItem.title, xpath: scrapeItem.xpath, tag: scrapeItem.tag});
                else views.push({...newScrapedData.view[scrapeItem.objIdx], custname: scrapeItem.title});
            }
        }
        
        let params = {
            'deletedObj': deleted,
            'modifiedObj': Object.values(modified),
            'addedObj': {...added, view: views},
            'screenId': current_task.screenId,
            'userId': user_id,
            'roleId': role,
            'param': 'saveScrapeData'
        }

        scrapeApi.updateScreen_ICE(params)
        .then(response => {
            if (response === "Invalid Session") return RedirectPage(history);
            else fetchScrapeData().then(resp=>{
                if (resp === 'success' || typeof(resp) === "object"){
                    setShowPop({
                        'title': 'Save Scrape data',
                        'content': typeof(resp)==="object" && resp.length>0 ? <div className="ss__dup_labels">
                            Scraped data saved successfully.
                            <br/><br/>
                            <strong>Warning: Please scrape an IRIS reference object.</strong>
                            <br/><br/>
                            Matching objects found for:
                            { resp.map(custname => <span className="ss__dup_li">{custname}</span>) }
                        </div> : 'Scraped data saved successfully.'
                    })
                    setDisableBtns({save: true, delete: true, edit: true, search: false, selAll: false});
                    dispatch({type: actionTypes.SET_DISABLEACTION, payload: scrapeItemsL.length !== 0});
                    dispatch({type: actionTypes.SET_DISABLEAPPEND, payload: scrapeItemsL.length === 0});
                    setSaved(true);
                } else console.error(resp);
            })
            .catch(error => console.error(error));
        })
        .catch(error => console.error(error))
    }

    return (
        <ScreenWrapper 
            buttonGroup={
                <div className="ss__btngroup">
                    <div className="ss__left-btns">
                        <label className="ss__select-all">
                            <input className="ss__select-all-chkbox" type="checkbox" checked={selAllCheck} disabled={disableBtns.selAll} onChange={(e)=>updateChecklist("all", e)}/>
                            <span className="ss__select-all-lbl">
                                Select all
                            </span>
                        </label>
                        <button className="ss__taskBtn ss__btn" disabled={disableBtns.save} onClick={onSave}>Save</button>
                        <button className="ss__taskBtn ss__btn" disabled={disableBtns.delete} onClick={onDelete}>Delete</button>
                        <button className="ss__taskBtn ss__btn" disabled={disableBtns.edit} onClick={onEdit}>Edit</button>
                        <button className="ss__search-btn" onClick={toggleSearch}>
                            <img className="ss__search-icon" src="static/imgs/ic-search-icon.png"/>
                        </button>
                        { showSearch && <input className="ss__search_field" value={searchVal} onChange={onSearch}/>}
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
                    <div className="scrape_object_container">
                    {
                        scrapeItems.map((object, index) => !object.hide && <ScrapeObject key={object.val} 
                                                                            idx={index}
                                                                            object={object} 
                                                                            activeEye={activeEye}
                                                                            setActiveEye={setActiveEye}
                                                                            updateChecklist={updateChecklist}
                                                                            modifyScrapeItem={modifyScrapeItem}
                                                                        />)
                    }
                    </div>
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
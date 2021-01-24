import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ScrapeObject from '../components/ScrapeObject';
import { ScrollBar, RedirectPage } from "../../global"
import { ScrapeContext } from '../components/ScrapeContext';
import * as actionTypes from '../state/action';
import * as scrapeApi from '../api';
import { reviewTask } from '../../global/api';
import "../styles/ScrapeContent.scss"
import CompareObjects from './CompareObjects';

const ScrapeContent = props => {

    const dispatch = useDispatch();
    const current_task = useSelector(state=>state.plugin.CT);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareFlag = useSelector(state=>state.scrape.compareFlag);
    const history = useHistory();

    const [activeEye, setActiveEye] = useState(null);
    const [disableBtns, setDisableBtns] = useState({save: true, delete: true, edit: true, search: false, selAll: false});
    const [showSearch, setShowSearch] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [selAllCheck, setSelAllCheck] = useState(false);
    const [deleted, setDeleted] = useState([]);
    const [modified, setModified] = useState({});
    const [editableObj, setEditableObj] = useState({});
    const { setShowObjModal, isUnderReview, fetchScrapeData, saved, setSaved, newScrapedData, setNewScrapedData, setShowPop, setShowConfirmPop, mainScrapedData, scrapeItems, hideSubmit, setScrapeItems } = useContext(ScrapeContext);

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
            setDeleted([]);
            setModified({});
            setActiveEye(null);
            setShowSearch(false);
            setSearchVal("");
            setSelAllCheck(false);
            setEditableObj({});
        }
    }, [saved])

    const redirectToPlugin = () => {
        window.localStorage['navigateScreen'] = "plugin";
        history.replace('/plugin');
    }

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
        setSaved(false);
        setScrapeItems(localScrapeItems);
        // setDisableBtns({...disableBtns, save: false})
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
        setShowObjModal({
            operation: "editObject",
            modifyScrapeItem: (value, newProperties, customFlag) => modifyScrapeItem(value, newProperties, customFlag),
            object: editableObj
        })
    }

    const onSearch = event => {
        let scrapeItemsL = [...scrapeItems]
        let value = event.target.value;
        // let totalCount = 0;
        // let selectedCount = 0;
        // let selAll = false;
        scrapeItemsL.forEach(item => {
                        if (item.title.toLowerCase().indexOf(value.toLowerCase()) < 0){
                            item.hide = true;
                        } else {
                            item.hide = false
                            // if (item.checked) selectedCount++;
                            // totalCount++;
                        };
                    });
        // if (totalCount === selectedCount && totalCount > 0) selAll = true;
        // if (totalCount === 0) setDisableBtns({ ...disableBtns, 'selAll': true})
        // setSelAllCheck(selAll);
        setSearchVal(value);
        setScrapeItems(scrapeItemsL)
    }

    const onDelete = () => {
        let deletedArr = [];
        let scrapeItemsL = [...scrapeItems];
        let modifiedDict = {...modified}
        let newScrapeList = [];
        newScrapeList = scrapeItemsL.filter((item, idx) => {
            if (item.checked){
                if (item.objId) {
                    deletedArr.push(item.objId);
                    if (item.objId in modifiedDict)
                        delete modifiedDict[item.objId]
                }
                return false;
            } else return true;
        })
        setScrapeItems(newScrapeList)
        setDeleted(deletedArr);
        setModified(modifiedDict);
        setDisableBtns({...disableBtns, delete: true, save: false})
        console.log(deletedArr)
    }

    const onSave = () => {
        let continueSave = true;

        if (current_task.reuse === 'True') {
            setShowConfirmPop({'title': "Save Scraped data", 'content': 'Screen is been reused. Are you sure you want to save objects?', 'onClick': ()=>console.log("proceed to save")})
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
                if (!dXpath) {
                    if (uniqueCusts.includes(scrapeItem.title)) {
                        dCustname = true;
                        scrapeItem.duplicate = true;
                        dCusts.push(scrapeItem.title);
                    }
                    else uniqueCusts.push(scrapeItem.title);
                }
                if (!dCustname) {
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
            
            dCusts = dCusts2;

            if (dCustname) {
                continueSave = false;
                setShowPop({
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Please rename/delete duplicate scraped objects
                        <br/><br/>
                        Object characterstics are same for:
                        { dCusts.map(custname => <span className="ss__dup_li">{custname}</span>) }
                    </div>
                })
            } else if (dXpath) {
                continueSave = false;
                setShowConfirmPop({
                    'title': 'Save Scrape data',
                    'content': <div className="ss__dup_labels">
                        Object characteristics are same for the below list of objects:
                        { dCusts.map(custname => <span className="ss__dup_li">{custname}</span>) }
                        <br/>
                        Do you still want to continue?
                    </div>,
                    'onClick': ()=>console.log("Save"),
                    'continueText': "Continue",
                    'rejectText': "Cancel"
                })
            }
        }

        if (continueSave) {
            let scrapeItemsL = [...scrapeItems]
            let added = Object.keys(newScrapedData).length ? { ...newScrapedData } : { ...mainScrapedData };
            let views = []
            for (let scrapeItem of scrapeItemsL) {
                if (!scrapeItem.objId) {
                    if (scrapeItem.isCustom) views.push({custname: scrapeItem.title, xpath: scrapeItem.xpath, tag: scrapeItem.tag});
                    else views.push({...newScrapedData.view[scrapeItem.objIdx], custname: scrapeItem.title});
                }
            }
            
            let arg = {
                'deletedObj': deleted,
                'modifiedObj': Object.values(modified),
                'addedObj': {...added, view: views},
                'screenId': current_task.screenId,
                'userId': user_id,
                'roleId': role,
                'param': 'saveScrapeData'
            }

            scrapeApi.updateScreen_ICE(arg)
            .then(response => {
                if (response === "Invalid Session") return RedirectPage(history);
                else fetchScrapeData().then(resp=>{
                    if (resp === 'success'){
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
    }

    const onAction = operation => {
        switch(operation){
            case "submit": setShowConfirmPop({'title':'Submit Task', 'content': 'Are you sure you want to submit the task ?', 'onClick': ()=>submitTask(operation)});
                           break;
            case "reassign": setShowConfirmPop({'title':'Reassign Task', 'content': 'Are you sure you want to reassign the task ?', 'onClick': ()=>submitTask(operation)});
                             break;
            case "approve": setShowConfirmPop({'title':'Approve Task', 'content': 'Are you sure you want to approve the task ?', 'onClick': ()=>submitTask(operation)});
                            break;
            default: break;
        }                       
    }

    const submitTask = submitOperation => {
		let taskid = current_task.subTaskId;
		let taskstatus = current_task.status;
		let version = current_task.versionnumber;
		let batchTaskIDs = current_task.batchTaskIDs;
        let projectId = current_task.projectId;
        
		if (submitOperation === 'reassign') {
			taskstatus = 'reassign';
        }

        reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs)
        .then(result => {
            if (result === "fail") setShowPop({'title': 'Task Submission Error', 'content': 'Reviewer is not assigned !'});
            else if (taskstatus === 'reassign') setShowPop({'title': "Task Reassignment Success", 'content': "Task Reassigned successfully!", onClick: ()=>redirectToPlugin()});
            else if (taskstatus === 'underReview') setShowPop({'title': "Task Completion Success", 'content': "Task Approved successfully!", onClick: ()=>redirectToPlugin()});
            else setShowPop({'title': "Task Submission Success", 'content': "Task Submitted successfully!", onClick: ()=>redirectToPlugin()});
        })
        .catch(error => {
			console.error(error);
        })
        
        setShowConfirmPop(false);
    }

    return (
        <div className="ss__content">
            <div className="ss__content_wrap" style={ compareFlag ? {height: "100%"} : {}}>
                { /* Task Name */ }
                <div className="ss__task_title">
                    <div className="ss__task_name">{current_task.taskName}</div>
                </div>

                {
                    compareFlag ? 
                    <CompareObjects viewString={ Object.keys(newScrapedData).length ? {...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view]} : { ...mainScrapedData }}
                                    setShowPop={setShowPop}
                                    fetchScrapeData={fetchScrapeData}
                    /> : <>
                { /* Button Group */ }
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

                    <div className="ss__right-btns">
                        { isUnderReview && 
                            <>
                            <button className="ss__reassignBtn ss__btn" onClick={()=>onAction("reassign")}>
                                Reassign
                            </button>
                            <button className="ss__approveBtn ss__btn" onClick={()=>onAction("approve")}>
                                Approve
                            </button>
                            </>
                        }
                        { !hideSubmit && !isUnderReview &&
                            <button className="ss__submitBtn ss__btn" onClick={()=>onAction("submit")}>
                                Submit
                            </button>
                        }
                    </div>

                </div></>
                }
            </div>
            
            {
                !compareFlag &&
                <div className="scraped_obj_list">
                <div className="ab">
                    <div className="min">
                    <div className="con" id="scrapeObjCon">
                    <ScrollBar scrollId="scrapeObjCon" hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
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
        </div>
    )
}

export default ScrapeContent;
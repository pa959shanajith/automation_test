import React, { useState, useEffect } from 'react';
import ScrapeObject from '../components/ScrapeObject';
import "../styles/ScrapeContent.scss"

const ScrapeContent = props => {

    const [activeEye, setActiveEye] = useState(null);
    const [disableBtns, setDisableBtns] = useState({save: true, delete: true, edit: true, search: false, selAll: false});
    const [showSearch, setShowSearch] = useState(false);
    const [searchVal, setSearchVal] = useState("");
    const [selAllCheck, setSelAllCheck] = useState(false);
    const [deleted, setDeleted] = useState([]);
    const [modified, setModified] = useState({});

    useEffect(()=>{
        let disable = {};
        let disableSelect = false;
        let disableDelete = true;
        let checkAll = false;
        let hidden = 0;
        let selected = 0;
        let total = 0;
        let visible = 0;
        props.scrapeItems.forEach(item=>{
            if (item.hide) hidden++;
            else visible++;
            if (!item.hide && item.checked) selected++;
            total++;
        })

        if (total === hidden) disableSelect = true;
        else if (visible === selected) checkAll = true;
        else if (visible > 0 && selected > 0) disableDelete = false;

        if (disableSelect) disable = { ...disable, selAll: true };
        else disable = { ...disable, selAll: false }

        if (!disableDelete) disable = {...disable, delete: false};
        else disable = {...disable, delete: true};
        
        setDisableBtns({...disableBtns, ...disable})
        setSelAllCheck(checkAll);
    }, [props.scrapeItems])

    useEffect(()=>{
        if (!props.saved) setDisableBtns({...disableBtns, save: false});
    }, [props.saved])

    const updateChecklist = (index, event) => {

        let localItems = [...props.scrapeItems];
        
        if (index === "all") {
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
            if (localItems[index].checked) {
                localItems[index].checked = false;
            }
            else {
                localItems[index].checked = true;
            }
        }

        // let selectedCounts = 0;
        // let totalVisible = 0;

        // localItems.map(object => {
        //     if (!object.hide) {
        //         if (object.checked) selectedCounts++;
        //         totalVisible++;
        //     }
        // })

        // let disables = {}
        // if (totalVisible === selectedCounts && totalVisible > 0) selAll = true;
        // if (totalVisible === 0) disables = {...disables, selAll: true}
        // if (selectedCounts > 0) disables = {...disables, delete: false}
        // else disables = {...disables, delete: true}

        // setDisableBtns({...disableBtns, ...disables})
        // setSelAllCheck(selAll);
        props.setScrapeItems(localItems)
    }
    
    const renameScrapeItem = (value, newTitle) => {
        let localScrapeItems = [...props.scrapeItems]
        let newName = "";
        let objId = "";
        for (let scrapeItem of localScrapeItems){
            if (scrapeItem.val === value && scrapeItem.objId) {
                scrapeItem.title = newTitle;
                newName = newTitle;
                objId = scrapeItem.objId;
            };
        }
        props.setScrapeItems(localScrapeItems);
        setModified({...modified, objId: newName});
        props.setSaved(false);
        setDisableBtns({...disableBtns, save: false})
    }

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        setSearchVal("");
    }

    const onSearch = event => {
        let scrapeItems = [...props.scrapeItems]
        let value = event.target.value;
        let totalCount = 0;
        let selectedCount = 0;
        let selAll = false;
        scrapeItems.forEach(item => {
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
        props.setScrapeItems(scrapeItems)
    }

    const onDelete = () => {
        let deletedArr = [];
        let scrapeItems = [...props.scrapeItems];
        props.scrapeItems.forEach((item, idx) => {
            if (item.checked){
                deletedArr.push(item.objId);
                delete scrapeItems[idx];
            }
        })
        props.setScrapeItems(scrapeItems)
        setDeleted(deletedArr);
        setDisableBtns({...disableBtns, delete: true})
        console.log(deletedArr)
    }

    const onSave = () => {

    }

    return (
        <div className="ss__content">
            <div className="ss__content_wrap">
            { /* Task Name */ }
            <div className="ss__task_title">
                <div className="ss__task_name">{props.current_task.taskName}</div>
            </div>

            { /* Button Group */ }
            <div className="ss__btngroup">
                <div className="ss__left-btns">
                    <label className="ss__select-all">
                        <input className="ss__select-all-chkbox" type="checkbox" checked={selAllCheck} disabled={disableBtns.selAll} onChange={(e)=>updateChecklist("all", e)}/>
                        <span className="ss__select-all-lbl">
                            Select all
                        </span>
                    </label>
                    <button className="ss__taskBtn ss__btn" disabled={disableBtns.save}>Save</button>
                    <button className="ss__taskBtn ss__btn" disabled={disableBtns.delete} onClick={onDelete}>Delete</button>
                    <button className="ss__taskBtn ss__btn" disabled={disableBtns.edit}>Edit</button>
                    <button className="ss__search-btn" onClick={toggleSearch}>
                        <img className="ss__search-icon" src="static/imgs/ic-search-icon.png"/>
                    </button>
                    { showSearch && <input className="ss__search_field" value={searchVal} onChange={onSearch}/>}
                </div>

                <div className="ss__right-btns">
                    {/* { isUnderReview && 
                        <>
                        <button className="ss__reassignBtn ss__btn">
                            Reassign
                        </button>
                        <button className="ss__approveBtn ss__btn">
                            Approve
                        </button>
                        </>
                    } */}
                    { !props.hideSubmit && //!isUnderReview &&
                        <button className="ss__submitBtn ss__btn">
                            Submit
                        </button>
                    }
                </div>

            </div>
            </div>

            <div className="scraped_obj_list">
                {
                    props.scrapeItems.map((object, index) => !object.hide && <ScrapeObject key={index} 
                                                                        idx={index}
                                                                        object={object} 
                                                                        activeEye={activeEye}
                                                                        setActiveEye={setActiveEye}
                                                                        updateChecklist={updateChecklist}
                                                                        renameScrapeItem={renameScrapeItem}
                                                                    />)
                }
            </div>
        </div>
    )
}

export default ScrapeContent;
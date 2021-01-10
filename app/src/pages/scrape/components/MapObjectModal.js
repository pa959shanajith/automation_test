import React, { useState, useEffect } from 'react';
import { ModalContainer, ScrollBar } from '../../global';
import "../styles/MapObjectModal.scss";

const MapObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({});
    const [nonCustomList, setNonCustomList] = useState([]);
    const [customList, setCustomList]  = useState({});
    const [selectedTag, setSelectedTag] = useState("");

    useEffect(()=>{
        let tempScrapeList = {};
        let tempCustomList = {};
        let tempNonCustom = [];
        if (props.scrapeItems.length) {
            props.scrapeItems.forEach(object => {
                if (object.isCustom) {
                    if (tempCustomList[object.tag]) tempCustomList[object.tag] = [...tempCustomList[object.tag], object];
                    else tempCustomList[object.tag] = [object]
                }
                else {
                    tempNonCustom.push(object);
                    if (tempScrapeList[object.tag]) tempScrapeList[object.tag] = [...tempScrapeList[object.tag], object];
                    else tempScrapeList[object.tag] = [object]
                }
            });
            setScrapedList(tempScrapeList);
            setCustomList(tempCustomList);
            setNonCustomList(tempNonCustom);
        }
    }, [])

    return (
        <div className="ss__mapObj">
            <ModalContainer 
                title="Map Object"
                content={
                    <div className="ss__mapObjBody">
                        <div className="ss__mo_lbl headerMargin">Please select the objects to drag and drop</div>
                        <div className="ss__mo_lists">
                            <div className="ss__mo_scrapeObjectList">
                                <div className="ss__mo_lbl lblMargin">Scraped Objects</div>
                                <div className="mo_scrapeListContainer">
                                    <div className="mo_listCanvas">
                                        <div className="mo_listMinHeight">
                                            <div className="mo_listContent">
                                            <ScrollBar thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px' minThumbSize='20px'>
                                            <>{selectedTag ? 
                                                scrapedList[selectedTag].map(object => {
                                                    return (<div className="ss__mo_listItem">
                                                        {object.title}
                                                    </div>)
                                                })
                                            : nonCustomList.map(object => {
                                                    return (<div className="ss__mo_listItem">
                                                        {object.title}
                                                    </div>)
                                                })}</>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ss__mo_customObjectList">
                                <div className="ss__mo_lbl lblMargin">Custom Objects</div>
                                <div className="ss__mo_customOutContainer">
                                <ScrollBar>
                                <div className="ss__mo_customInContainer">
                                { Object.keys(customList).map(tag => (
                                    <>
                                    <div className="mo_tagHead" onClick={()=>setSelectedTag(tag)}>{tag}</div>
                                    { selectedTag && <div className="mo_tagItemList"> 
                                        {customList[selectedTag].map(object => <div className="mo_tagItems">
                                            {object.title}
                                        </div>)} 
                                    </div> }
                                    </>
                                ))}
                                </div>
                                </ScrollBar>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                close={()=>props.setShow(false)}
                footer={<>
                    <button>Show All Objects</button>
                    <button>Un-Link</button>
                    <button>Submit</button>
                </>}
            />
        </div>
    );
}

export default MapObjectModal;


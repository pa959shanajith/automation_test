import React, { useState, useEffect } from 'react';
import { ScrollBar } from '../../global';
import ScrapeObject from '../components/ScrapeObject';
import "../styles/CompareBox.scss";

const CompareBox = props => {

    const [checkAll, setCheckAll] = useState(false);
    const [objectList, setObjectList] = useState([]);
    

    useEffect(()=>{
        setObjectList(props.objList);
        //eslint-disable-next-line
    }, [])

    const updateChecklist = (value, event) => {

        let localItems = [...objectList];
        let localChecks = [...props.checkedList];
        
        if (value === "all") {
            if (event.target.checked) 
                localItems.forEach((item, index) => {
                    item.checked = true;
                    let loc = localChecks.indexOf(index);
                    if (loc < 0) localChecks.push(index);
                })
            else localItems.forEach((item, index) => {
                item.checked = false;
                let loc = localChecks.indexOf(index);
                if (loc > -1) localChecks.splice(loc, 1);
            })
        }
        else {
            localItems.forEach((item, index) => { 
                if (item.val === value) {
                    item.checked = !item.checked;
                    let loc = localChecks.indexOf(index);
                    if (loc < 0 ) localChecks.push(index);
                    else localChecks.splice(loc, 1);
                };
            })
        }
        
        setObjectList(localItems)
        props.setCheckedList(localChecks);
        setCheckAll(localChecks.length===localItems.length);
    }

    const onMapForReplace = () => {
            props.setReplaceVisible(true);
        };

    return (
        <div className="ss__cmprbox">
            <div data-test="header"className={props.showMapBtn ? "ss__cmprHeader__replace" : "ss__cmprHeader" }>
                {!props.hideCheckbox && <input className="ss__cmprBoxChk" type="checkbox" onChange={(e)=>updateChecklist('all', e)} checked={checkAll} />}
                {props.header}
                {props.showMapBtn && <button className='ss__replaceActionbtn' onClick={onMapForReplace}> Replace </button>}
            </div>
            <div data-test="compareList"className="ss__cmprList" id="cmprObjId">
                <ScrollBar scrollId="cmprObjId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                    {objectList.length && objectList.map( (object, index) => <ScrapeObject key={index} updateChecklist={updateChecklist} hideCheckbox={props.hideCheckbox} notEditable={true} idx={index} object={object} comparedObject={true} />)}
                </ScrollBar>
            </div>
        </div>
    );
}

export default CompareBox;
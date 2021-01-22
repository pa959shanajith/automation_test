import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollBar, RedirectPage } from '../../global'; 
import { useHistory } from 'react-router-dom';
import CompareBox from './CompareBox';
import * as actions from '../state/action';
import { updateScreen_ICE } from '../api';
import "../styles/CompareObjects.scss";

const CompareObjects = props => {

    const { changedObj, notChangedObj, notFoundObj } = useSelector(state=>state.scrape.compareObj);
    const { screenId } = useSelector(state=>state.plugin.CT);
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareData = useSelector(state=>state.scrape.compareData);
    const dispatch = useDispatch();
    const history = useHistory();
    const [checkedList, setCheckedList] = useState([]);

    const closeCompare = () => {
        dispatch({type: actions.SET_COMPAREOBJ, payload: {changedObj: [], notChangedObj: [], notFoundObj: []}})
        dispatch({type: actions.SET_COMPAREFLAG, payload: false});
        dispatch({type: actions.SET_COMPAREDATA, payload: {}});
    }

    const updateObjects = () => {
		
        let updatedObjects = [];
        let updatedCompareData = {...compareData};
		for (let index of checkedList) {
			updatedCompareData.view[0].changedobject[index]._id = props.viewString.view[updatedCompareData.changedobjectskeys[index]]._id
			updatedObjects.push(updatedCompareData.view[0].changedobject[index]);
		};
		
		let arg = {
            // 'deletedObj': deleted,
            'modifiedObj': updatedObjects,
            // 'addedObj': {...added, view: views},
            'screenId': screenId,
            'userId': user_id,
            'roleId': role,
            'param': 'saveScrapeData'
        };
        
		updateScreen_ICE(arg)
        .then(data => {
            if (data.toLowerCase() === "invalid session") return RedirectPage(history);
            if (data.toLowerCase() === 'success') {
                props.setShowPop({
                    title: "Compared Objects", 
                    content: "Updated Compared Objects Successfully!",
                    onClick: ()=>{
                        props.fetchScrapeData().then(resp=>{
                            if(resp==="success") {
                                closeCompare();
                                props.setShowPop(false);
                            }
                            else console.error(resp)
                        })
                        .catch(err => console.error(err));
                    }
                });
            } else {
                props.setShowPop({title: "Compared Objects", content: "Failed to update objects"});
                closeCompare();
            }
        })
        .catch(error => console.error(error) );
    }

    return (
        <div className="ss__compareContents">
            <div className="ss__comparebtngroup">
                <button className="ss__compareAction" onClick={updateObjects}>Update</button>
                <button className="ss__compareAction" onClick={closeCompare}>Cancel</button>
            </div>
            <div className="ss__compareboxes">
            <div className="ss__cmprBoxAbsolute">
            <div className="ss__cmprBoxMin">
            <div className="ss__cmprBoxCon">
                <ScrollBar>
                    { changedObj && changedObj.length && <CompareBox checkedList={checkedList} setCheckedList={setCheckedList} header="Changed Objects" objList={changedObj} /> }
                    { notChangedObj && notChangedObj.length && <CompareBox header="Unchanged Objects" objList={notChangedObj} hideCheckbox={true}/> }
                    { notFoundObj && notFoundObj.length && <CompareBox header="Not Found Objects" objList={notFoundObj} hideCheckbox={true}/>}
                </ScrollBar>
            </div>
            </div>
            </div>    
            </div>
        </div>
    );
}

export default CompareObjects;
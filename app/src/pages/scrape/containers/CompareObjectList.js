import React, { useState, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ScrollBar, RedirectPage, Messages as MSG, setMsg } from '../../global'; 
import { useHistory } from 'react-router-dom';
import CompareBox from './CompareBox';
import ScreenWrapper from './ScreenWrapper';
import { ScrapeContext } from '../components/ScrapeContext';
import * as actions from '../state/action';
import { updateScreen_ICE } from '../api';
import "../styles/CompareObjectList.scss";

const CompareObjectList = (props) => {

    const { changedObj, notChangedObj, notFoundObj } = useSelector(state=>state.scrape.compareObj);
    // const { screenId } = props.fetchingDetails["_id"];
    const { user_id, role } = useSelector(state=>state.login.userinfo);
    const compareData = useSelector(state=>state.scrape.compareData);
    const { setShowPop, fetchScrapeData, mainScrapedData, newScrapedData, orderList } = useContext(ScrapeContext);  
    const dispatch = useDispatch();
    const history = useHistory();
    const [checkedList, setCheckedList] = useState([]);
    const [viewString, setViewString] = useState({});

    useEffect(()=>{
        let newViewString = {...viewString};
        newViewString = Object.keys(newScrapedData).length ? {...newScrapedData, view: [...mainScrapedData.view, ...newScrapedData.view]} : { ...mainScrapedData };
        newViewString = {...newViewString, view: newViewString.view.filter(object => object.xpath.substring(0, 4)!=="iris")}
        setViewString(newViewString);

        return ()=>{
            dispatch({type: actions.RESET_COMPARE, payload: null})
            dispatch({type: actions.SET_OBJVAL, payload: {val: null }});
        }
        //eslint-disable-next-line
    }, [])

    const closeCompare = () => {
        dispatch({type: actions.RESET_COMPARE, payload: null})
        dispatch({type: actions.SET_OBJVAL, payload: {val: null }});
    }

    const updateObjects = () => {
		
        let updatedObjects = [];
        let updatedCompareData = {...compareData};
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
                    'footer': <button onClick={()=>{
                        fetchScrapeData().then(resp=>{
                            if(resp==="success") {
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
        .catch(error => console.error(error) );
    }

    return (
        <ScreenWrapper 
            fullHeight = {true}
            compareContent = {
                <div className="ss__compareContents">
                    <div className="ss__comparebtngroup">
                        { changedObj && changedObj.length && <button className="ss__compareAction" onClick={updateObjects}>Update</button>}
                        <button className="ss__compareAction" onClick={closeCompare}>Cancel</button>
                    </div>
                    <div className="ss__compareboxes">
                    <div className="ss__cmprListAbsolute">
                    <div className="ss__cmprListMin">
                    <div className="ss__cmprListCon" id="cmprObjListId">
                        <ScrollBar scrollId="cmprObjListId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                            { changedObj && changedObj.length && <CompareBox checkedList={checkedList} setCheckedList={setCheckedList} header="Changed Objects" objList={changedObj} /> }
                            { notChangedObj && notChangedObj.length && <CompareBox header="Unchanged Objects" objList={notChangedObj} hideCheckbox={true}/> }
                            { notFoundObj && notFoundObj.length && <CompareBox header="Not Found Objects" objList={notFoundObj} hideCheckbox={true}/>}
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
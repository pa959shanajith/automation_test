import React from 'react';
import * as actionTypes from '../state/action';
import { useDispatch, useSelector } from 'react-redux';
import LoadingBar from 'react-top-loading-bar';
import { store } from '../../../reducer';

/*
    Component: Progress Bar
    Uses: Provides Progress bar on top of page by call SetProgressBar
    Props: Arguments for SetProgressBar: "start" to start the progress bar
                                         "stop" to complete/stop the progress bar

*/

const ProgressBar = () => {

    let dispatch = useDispatch();
    let progress = useSelector(state=>state.progressbar.progress);

    return <LoadingBar progress={progress} color="#643693" onLoaderFinished={()=>{
        dispatch({type: actionTypes.SET_PROGRESS, payload: 0});
    }}/>
  

}

const SetProgressBar=(op)=>{
    if (op==="start"){
        store.dispatch({type: actionTypes.SET_PROGRESS, payload: Math.floor(Math.random() * (80-30) + 30)});
    }
    else{
        store.dispatch({type: actionTypes.SET_PROGRESS, payload: 100});
    }
}

export {SetProgressBar};
export default ProgressBar;
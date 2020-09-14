import React, { useEffect, useState } from 'react';
import * as actionTypes from '../state/action';
import { useDispatch, useSelector } from 'react-redux';
import LoadingBar from 'react-top-loading-bar';
import { store } from '../../../reducer';

const ProgressBar = (props) => {

    const [progress, setProgress] = useState(0);
    let dispatch = useDispatch();
    let progress2 = useSelector(state=>state.progressbar.progress);

    useEffect(()=>{
        setProgress(progress2);
    }, [progress2]);

    return <LoadingBar progress={progress} color="#643693" onLoaderFinished={()=>{
        dispatch({type: actionTypes.SET_PROGRESS, payload: 0});
    }}/>
  

}

const SetProgressBar=(op)=>{
    if (op=="start"){
        store.dispatch({type: actionTypes.SET_PROGRESS, payload: Math.floor(Math.random() * (80-30) + 30)});
    }
    else{
        store.dispatch({type: actionTypes.SET_PROGRESS, payload: 100});
    }
}

export {SetProgressBar};
export default ProgressBar;






// import React, { useEffect, useState, useRef } from 'react';
// import * as actionTypes from '../state/action';
// import { connect, useDispatch, useSelector } from 'react-redux';
// import LoadingBar from 'react-top-loading-bar';

// const ProgressBar = (props) => {

//     let ref = useRef(null);
//     const [refState, setRefState] = useState(ref);
//     let dispatch = useDispatch();
//     let ref2 = useSelector(state=>state.progressbar.progress);

//     useEffect(()=>{
//         dispatch({type: actionTypes.SET_PROGRESS, payload: refState})
//         console.log(ref2)
//     }, [ref2]);
//     return <LoadingBar ref={refState} color="#000000"/>
// }

// export default ProgressBar;
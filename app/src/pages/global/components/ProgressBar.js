import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/*
    Component: Progress Bar
    Uses: Provides Progress bar on top of page by call SetProgressBar
    Props: Arguments for SetProgressBar: "start" to start the progress bar
                                         "stop" to complete/stop the progress bar

*/

const ProgressBar = () => {

    let dispatch = useDispatch();
    let progress = useSelector(state=>state.progressbar.progress);

   
  

}

export default ProgressBar;
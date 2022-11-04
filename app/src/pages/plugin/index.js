import React, { useEffect } from 'react';
import PluginHome from './containers/PluginHome';
import { useDispatch } from 'react-redux';
import {useHistory} from 'react-router-dom';
import * as actions from './state/action';
import { SetProgressBar, RedirectPage } from '../global';

const Plugin = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    
    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "plugin"){
            RedirectPage(history, { reason: "screenMismatch" });
        }
        dispatch({type: actions.SET_CT, payload: {}});
        SetProgressBar("stop", dispatch);
        //eslint-disable-next-line
    }, []);

    return (
        <>
            <PluginHome />
        </>
    );
}

export default Plugin;
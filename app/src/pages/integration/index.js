import React, { useEffect } from 'react';
import Integrations from './containers/IntegrationHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
export var history

const Integration = ()=>{
    history =  useHistory()
    const dispatch = useDispatch();
    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "integration"){
            RedirectPage(history, { reason: "screenMismatch" });
        }
    SetProgressBar("stop", dispatch);
    }, [dispatch]);
    return (
        <Integrations/>
    );
}

export default Integration;
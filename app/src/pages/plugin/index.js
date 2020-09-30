import React, { useEffect } from 'react';
import PluginHome from './containers/PluginHome';
import { useDispatch } from 'react-redux';
import {useHistory} from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';

const Plugin = () => {

    const history = useHistory();
    const dispatch = useDispatch();

    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "plugin"){
            RedirectPage(history);
        }
        SetProgressBar("stop", dispatch);
    }, []);

    return (
        <>  
            <PluginHome />
        </>
    );
}

export default Plugin;
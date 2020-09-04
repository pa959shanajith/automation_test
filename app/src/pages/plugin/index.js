import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PluginHome from './containers/PluginHome';
import { useDispatch } from 'react-redux';
import { SetProgressBar, RedirectPage } from '../global';

const Plugin = () => {

    let dispatch = useDispatch();
    const [redirectPage, callRedirectPage] = useState(false);
    const [redirectTo, setRedirectTo] = useState("");

    useEffect(()=>{
        SetProgressBar("stop", dispatch);
    }, []);

    return (
    <>  
        {/* {
            redirectPage ? RedirectPage() : 
            redirectTo ? <Redirect to={redirectTo} /> :
            <PluginHome  callRedirectPage={callRedirectPage} setRedirectTo={setRedirectTo}/>
        } */}
        <PluginHome />
    </>);
}

export default Plugin;
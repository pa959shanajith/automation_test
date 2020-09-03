import React, { useEffect } from 'react';
import PluginHome from './containers/PluginHome';
import { useDispatch } from 'react-redux';
import { SetProgressBar } from '../global';

const Plugin = () => {

    let dispatch = useDispatch();

    useEffect(()=>{
        SetProgressBar("stop", dispatch);
    }, []);

    return (
    <>
        <PluginHome/>
    </>);
}

export default Plugin;
import React, { useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import { RedirectPage } from '../global';
import DesignHome from './containers/DesignHome';
import ServiceBell from "@servicebell/widget";

const Design = () => {
    
    ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    const history = useHistory();

    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "TestCase"){
            RedirectPage(history, { reason: "screenMismatch" });
        }
        //eslint-disable-next-line
    }, []);

    return (
        <DesignHome />
    );
};

export default Design;
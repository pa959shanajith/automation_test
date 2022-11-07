import React, { useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import { RedirectPage } from '../global';
import DesignHome from './containers/DesignHome';

const Design = () => {
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
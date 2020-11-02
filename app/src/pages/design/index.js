import React, { useEffect } from 'react';
import {useHistory} from 'react-router-dom';
import { RedirectPage } from '../global';
import DesignHome from './containers/DesignHome';

const Design = () => {
    
    const history = useHistory();

    useEffect(()=>{
        // navigateTestCase is also being checked in 99, do we need that?
        // if(window.localStorage['navigateScreen'] !== "TestCase"){
        //     RedirectPage(history);
        // }
    }, []);

    return (
        <DesignHome />
    );
};

export default Design;
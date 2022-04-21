import React, { useEffect } from 'react';
import LoginFields from "../components/LoginFields.js";
import { SetProgressBar} from '../../global';
import { persistor } from '../../../reducer';
import StaticElements from '../components/StaticElements';

/*
    Component: LoginPage
    Props: None
    Uses: Renders the Login page.
    Todo: None
*/


const LoginPage = () => {
     
    useEffect(()=>{
        persistor.purge();
        SetProgressBar('complete');
    }, []);

    return (
        <StaticElements>
             <LoginFields SetProgressBar={SetProgressBar}/>
        </StaticElements>
    );
}

export default LoginPage;
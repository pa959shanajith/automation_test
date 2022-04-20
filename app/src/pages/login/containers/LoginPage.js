import React, { useEffect,useState } from 'react';
import LoginFields from "../components/LoginFields.js";
import { SetProgressBar} from '../../global';
import { persistor } from '../../../reducer';
import StaticElements from '../components/StaticElements';
import WelcomeWizard from '../components/WelcomeWizard.js';

/*
    Component: LoginPage
    Props: None
    Uses: Renders the Login page.
    Todo: None
*/


const LoginPage = () => {
    const [s,sS] = useState(true)
     
    useEffect(()=>{
        persistor.purge();
        SetProgressBar('complete');
    }, []);

    return (
        <>
        <StaticElements>
             <LoginFields SetProgressBar={SetProgressBar}/>
        </StaticElements>
        {s?<WelcomeWizard showWizard={sS}/>:null}
        </>
    );
}

export default LoginPage;
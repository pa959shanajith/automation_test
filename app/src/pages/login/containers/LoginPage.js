import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoginFields from "../components/LoginFields.js";
import { SetProgressBar} from '../../global';
import StaticElements from '../components/StaticElements';

/*
    Component: LoginPage
    Props: None
    Uses: Renders the Login page.
    Todo: None
*/


const LoginPage = () => {

    const dispatch = useDispatch();
     
    useEffect(()=>{
        SetProgressBar('complete', dispatch);
    }, []);

    return (
        <StaticElements>
             <LoginFields dispatch={dispatch} SetProgressBar={SetProgressBar}/>
        </StaticElements>
    );
}

export default LoginPage;
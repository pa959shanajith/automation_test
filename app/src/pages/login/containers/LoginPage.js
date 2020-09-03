import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoginFields from "../components/LoginFields.js";
import { SetProgressBar} from '../../global';
import StaticElements from '../components/StaticElements';
import "../styles/BasePage.scss";

/*
    Component: LoginPage
    Use: returns the base page component with login field component in it to render
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
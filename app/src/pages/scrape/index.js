import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage } from '../global';
import ScrapeScreen from './containers/ScrapeScreen';
export let history;


const Scrape = ()=>{
    history = useHistory();

    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "Scrape"){
            RedirectPage(history, { reason: "screenMismatch" });
        }
    }, []);

    return (
        <ScrapeScreen/>
    );
}

export default Scrape;
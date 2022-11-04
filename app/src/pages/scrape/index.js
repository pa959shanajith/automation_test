import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RedirectPage } from '../global';
import ScrapeScreen from './containers/ScrapeScreen';
import ServiceBell from "@servicebell/widget";
import { useSelector} from 'react-redux';
export let history;


const Scrape = ()=>{
    const userInfo = useSelector(state=>state.login.userinfo);
    if(userInfo.isTrial){
        ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    }
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
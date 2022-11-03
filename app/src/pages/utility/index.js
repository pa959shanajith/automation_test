import React ,{useEffect} from 'react';
import Utilities from './containers/UtilityHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
import ServiceBell from "@servicebell/widget";
export var history;



const Utility = ()=>{
    ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    history =  useHistory()
    const dispatch = useDispatch();
    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "utility"){
            RedirectPage(history, { reason: "screenMismatch" });
        }
        SetProgressBar("stop", dispatch);
    }, [dispatch]);
    return (
        <Utilities/>
    );
}

export default Utility;
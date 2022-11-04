import React ,{useEffect} from 'react';
import Utilities from './containers/UtilityHome';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SetProgressBar, RedirectPage } from '../global';
export var history;



const Utility = ()=>{
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
import React, { useEffect, useState } from 'react';
import PluginHome from './containers/PluginHome';
import { useDispatch, useSelector } from 'react-redux';
import {useHistory} from 'react-router-dom';
import * as actions from './state/action';
import { SWITCHED } from '../global/state/action';
import { SetProgressBar, RedirectPage, PopupMsg } from '../global';

const Plugin = () => {

    const history = useHistory();
    const dispatch = useDispatch();
    const selectedRole = useSelector(state=>state.login.SR);
    const roleSwitched = useSelector(state=>state.progressbar.roleSwitched);
    const [role, setRole] = useState(false);

    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "plugin"){
            RedirectPage(history);
        }
        dispatch({type: actions.SET_CT, payload: {}});
        SetProgressBar("stop", dispatch);
        //eslint-disable-next-line
    }, []);

    useEffect(()=>{
        if(roleSwitched){
            dispatch({type: SWITCHED, payload: false});
            setRole({'title': 'Switch Role', 'content': `Your role is changed to ${selectedRole}`});
        }
    }, [roleSwitched])

    return (
        <>  
            {   role &&
                <PopupMsg 
                    title={role.title}
                    content={role.content}
                    submitText="OK"
                    close={()=>setRole("")}
                    submit={()=>setRole("")}
                />
            }
            <PluginHome />
        </>
    );
}

export default Plugin;
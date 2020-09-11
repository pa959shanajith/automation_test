import React, { useEffect, useState } from 'react';
import { Header, FooterOne } from '../../global'
import PluginSection from '../components/PluginSection';
import TaskSection from '../components/TaskSection';
import { useSelector, useDispatch } from 'react-redux';
import "../styles/PluginHome.scss"

const PluginHome = () => {

    const dispatch = useDispatch();
    const userInfo = useSelector(state=>state.login.userinfo);
    const userRole = useSelector(state=>state.login.SR);

    const [name, setName] = useState("Demo User");

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            console.log(userInfo)
            let first_name = userInfo.firstname.charAt(0).toUpperCase() + userInfo.firstname.slice(1);
            let last_name = userInfo.lastname.charAt(0).toUpperCase() + userInfo.lastname.slice(1);
            setName(first_name + ' ' + last_name);
        }
        else{
            dispatch({type: "UPDATE", payload: "none"});
        }
    }, []);

    return(
        <div className="plugin-bg-container">
            <img className="plugin-bg-img" alt="bg-img" src="static/imgs/light-bg.png"/>
            <Header />
            <div className="plugin-elements">
                <div className="greeting-text">
                    Welcome {name}!
                </div>
                <div className="page-contents">
                    <PluginSection />
                    <div className="section-divider" />
                    <TaskSection userInfo={userInfo} userRoles={userRole} dispatch={dispatch}/>
                </div>
            </div>
            <FooterOne/>
        </div>
    );
}

export default PluginHome;
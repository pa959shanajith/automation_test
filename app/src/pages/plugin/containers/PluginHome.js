import React, { useEffect, useState } from 'react';
import { Header, FooterOne, RedirectPage } from '../../global'
import PluginSection from '../components/PluginSection';
import TaskSection from '../components/TaskSection';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import "../styles/PluginHome.scss"

const PluginHome = () => {

    const dispatch = useDispatch();
    const history = useHistory();
    const userInfo = useSelector(state=>state.login.userinfo);
    const userRole = useSelector(state=>state.login.SR);
    localStorage.setItem("navigateEnable", true);

    const [name, setName] = useState("Demo User");

    useEffect(()=>{
        if(window.localStorage['navigateScreen'] !== "plugin"){
            RedirectPage(history);
        }
        else
        if (Object.keys(userInfo).length!==0){
            let first_name = userInfo.firstname.charAt(0).toUpperCase() + userInfo.firstname.slice(1);
            let last_name = userInfo.lastname.charAt(0).toUpperCase() + userInfo.lastname.slice(1);
            setName(first_name + ' ' + last_name);
        }
        else{
            console.log("UserInfo Empty")
        }
    }, [userInfo, userRole]);

    return(
        <div className="plugin-bg-container">
            <img className="plugin-bg-img" alt="bg-img" src="static/imgs/light-bg.png"/>
            <Header />
            <div className="plugin-elements">
                <div className="greeting-text">
                    Welcome {name}!
                </div>
                <div className="page-contents">
                    <PluginSection userInfo={userInfo}/>
                    <div className="section-divider" />
                    <TaskSection userInfo={userInfo} userRole={userRole} dispatch={dispatch}/>
                </div>
            </div>
            <FooterOne/>
        </div>
    );
}

export default PluginHome;
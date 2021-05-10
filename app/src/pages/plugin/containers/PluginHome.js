import React, { useEffect, useState } from 'react';
import { Header, FooterOne, ScrollBar } from '../../global'
import PluginSection from '../components/PluginSection';
import TaskSection from '../components/TaskSection';
import { useSelector, useDispatch } from 'react-redux';
import "../styles/PluginHome.scss"

const PluginHome = () => {

    const dispatch = useDispatch();
    
    const userInfo = useSelector(state=>state.login.userinfo);
    const userRole = useSelector(state=>state.login.SR);
    // localStorage.setItem("navigateEnable", true);

    const [name, setName] = useState("Demo User");

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            setName(userInfo.firstname + ' ' + userInfo.lastname);
        }
    }, [userInfo, userRole]);

    return(
        <div className="plugin-bg-container">
            <img className="plugin-bg-img" alt="bg-img" src="static/imgs/light-bg.png"/>
            <Header />
            <div className="plugin-elements" id="plugin__mainScreen">
                <ScrollBar scrollId="plugin__mainScreen" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                <div className="greeting-text">
                    Welcome {name}!
                </div>
                <div className="page-contents">
                    <PluginSection userInfo={userInfo}/>
                    <div className='min_gap'>
                    <div className="section-divider" />
                    </div>
                    <TaskSection userInfo={userInfo} userRole={userRole} dispatch={dispatch}/>
                </div>
                </ScrollBar>
            </div>
            <FooterOne/>
        </div>
    );
}

export default PluginHome;
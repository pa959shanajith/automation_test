import React from 'react';
import { Header, FooterOne } from '../../global'
import PluginSection from '../components/PluginSection';
import TaskSection from '../components/TaskSection';
import "../styles/PluginHome.scss"

const PluginHome = () => {
    return(
        <div className="plugin-bg-container">
            <img className="plugin-bg-img" src="static/imgs/light-bg.png"/>
            <Header/>
            <div className="plugin-elements">
                <div className="greeting-text">
                    Welcome Demo User!
                </div>
                <div className="page-contents">
                    <PluginSection />
                    <div className="section-divider" />
                    <TaskSection />
                </div>
            </div>
            <FooterOne/>
        </div>
    );
}

export default PluginHome;
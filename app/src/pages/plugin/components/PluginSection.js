import React from 'react';

const PluginSection = () => {
    return(
        <div className="plugin-section">
            <div className="avail-plugin-title">Available Plugins</div>
            <div className="plugin-blocks">
                <div className="plugin-block">
                    <img className="plugin-ic" src="static/imgs/Mindmaps.png" />
                    <span className="plugin-text">Mindmaps</span>
                </div>
                <div className="plugin-block">
                    <img className="plugin-ic" src="static/imgs/Reports.png" />
                    <span className="plugin-text">Reports</span>
                </div>
                <div className="plugin-block">
                    <img className="plugin-ic" src="static/imgs/Utilities.png" />
                    <span className="plugin-text">Utilities</span>
                </div>
                <div className="plugin-block">
                    <img className="plugin-ic" src="static/imgs/Integrations.png" />
                    <span className="plugin-text">Integrations</span>
                </div>
            </div>
        </div>
    );
}

export default PluginSection;
import React, { useEffect, useState } from 'react';
import PluginBox from './PluginBox';
import "../styles/PluginSection.scss"

const PluginSection = ({userInfo}) => {

    const [pluginList, setPluginList] = useState([]);

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            let tempList = [];
            let availablePlugins = userInfo.pluginsInfo;
            let pluginsLength = availablePlugins.length;
            let nameMap = {"Integration": "Integrations", "Mindmap": "Mindmaps", "Reports": "Reports", "Utility": "Utilities"}
            for(let i=0 ; i < pluginsLength ; i++){
                if(availablePlugins[i].pluginValue !== false){
                    let pluginName = availablePlugins[i].pluginName;
                    tempList.push({'pluginName': nameMap[pluginName] || pluginName, image: pluginName });
                }
            }
            setPluginList(tempList);
        }
    }, [userInfo]);

    return(
        <div data-test="plugins-section" className="plugin-section">
            <div data-test="available-plugins-title" className="avail-plugin-title">Available Plugins</div>
            <div data-test="plugins-blocks" className="plugin-blocks">
                {
                    pluginList.length !==0 && pluginList.map((plugin, i)=>
                        <PluginBox key={i} plugin={plugin}/>
                    )
                }
            </div>
        </div>
    );
}

export default PluginSection;
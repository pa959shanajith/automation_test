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
            for(let i=0 ; i < pluginsLength ; i++){
                if(availablePlugins[i].pluginValue !== false){
                    let pluginName = availablePlugins[i].pluginName;
                    tempList.push({'pluginName': pluginName});
                }
            }
            setPluginList(tempList);
        }
    }, [userInfo]);

    return(
        <div className="plugin-section">
            <div className="avail-plugin-title">Available Plugins</div>
            <div className="plugin-blocks">
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
import React, { useEffect, useState } from 'react';
import { Encrypt } from '../../global';
import PluginBox from './PluginBox';
import { Link } from 'react-router-dom';
import "../styles/PluginSection.scss"

const PluginSection = ({userInfo, userRole, dispatch}) => {

    const [pluginList, setPluginList] = useState([]);

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            let tempList = [];
            let plugins = [];
            let availablePlugins = userInfo.pluginsInfo;
            let pluginsLength = availablePlugins.length;
            for(let i=0 ; i < pluginsLength ; i++){
                if(availablePlugins[i].pluginValue !== false){
                    let pluginName = availablePlugins[i].pluginName;
                    let pluginTxt = pluginName.replace(/\s/g,'');
                    let dataName = Encrypt.encode("p_"+pluginTxt);
                    plugins.push("p_"+pluginName);
                    tempList.push({'pluginName': pluginName, 'pluginTxt': pluginTxt, 'dataName': dataName});
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
                    pluginList.length !==0 && pluginList.map(plugin=>
                        <PluginBox plugin={plugin}/>
                    )
                }
            </div>
        </div>
    );
}

export default PluginSection;
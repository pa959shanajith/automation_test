import React, { useEffect, useState, Fragment } from 'react';
import PluginBox from './PluginBox';
import "../styles/PluginSection.scss"
import PropTypes from 'prop-types';

const PluginSection = ({userInfo}) => {

    const [pluginList, setPluginList] = useState({
        "Integration": { title: "Integrations", show: false },
        "Utility" : { title: "Utilities", show: false},
        "Mindmap": { title: "Mindmaps", show: false },
        "Neuron Graphs": {title:"Neuron Graphs", show: false},
        "Reports": { title: "Reports", show: false},
        "Dashboard": {title:"Dashboard", show: false},
        "Selenium To Avo": {title:"Selenium To Avo", show: false},
        "showList" : false,
    });

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            let tempList = { ...pluginList };
            let availablePlugins = userInfo.pluginsInfo;
            let pluginsLength = availablePlugins.length;
    
            for(let i=0 ; i < pluginsLength ; i++){
                if(availablePlugins[i].pluginValue !== false){
                    let pluginName = availablePlugins[i].pluginName;
                    
                    if (tempList[pluginName]) tempList[pluginName].show = true;
                    else tempList[pluginName] = { title: pluginName, show: true};
                }
            }

            tempList.showList = true;
            setPluginList(tempList);
        }
    }, [userInfo]);

    return(
        <div data-test="plugins-section" className="plugin-section">
            <div data-test="available-plugins-title" className="avail-plugin-title">Available Plugins</div>
            <div data-test="plugins-blocks" className="plugin-blocks">
                {
                    pluginList.showList && Object.keys(pluginList).map(pluginName =>
                        <Fragment key={pluginName} >
                        {
                            pluginList[pluginName].show && 
                            <PluginBox 
                                pluginName={pluginName} 
                                pluginTitle={pluginList[pluginName].title}
                            />
                        }
                        </Fragment>
                    )
                }
            </div>
        </div>
    );
}
PluginSection.propTypes={
    plugin:PropTypes.object
}
export default PluginSection;
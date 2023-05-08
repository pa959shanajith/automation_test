import React, { useEffect, useState, Fragment } from 'react';
import PluginBox from './PluginBox';
import "../styles/PluginSection.scss"
import PropTypes from 'prop-types';

const PluginSection = ({userInfo}) => {

    const [pluginList, setPluginList] = useState({
        "AGS":{ title: "Avo Genius", show: false },
        "TV":{title:"Training Videos", show:false},
        "MR": { title: "Reports", show: false},
        "DE" : { title: "Utilities", show: false},
        "ALMDMT": { title: "Integrations", show: false },
        "iTDM": {title:"iTDM", show: false},
        "MD": {title:"Dashboard", show: false},
        "STAVO":{ title: "Selenium To Avo", show: false },
        "showList" : false,
    });

    useEffect(()=>{
        if (Object.keys(userInfo).length!==0){
            let tempList = { ...pluginList };
            let availablePlugins = userInfo.pluginsInfo;
            let pluginsLength = availablePlugins.length;
            tempList["AGS"].show = true;
            tempList["DE"].show = true;
            tempList["MR"].show = true;
            tempList["TV"].show = true;
            for(let i=0 ; i < pluginsLength ; i++){
                // if(availablePlugins[i].pluginValue !== false){
                    let pluginName = availablePlugins[i].pluginName;
                    
                    if (tempList[pluginName]) tempList[pluginName].show = availablePlugins[i].pluginValue;
                    // else tempList[pluginName] = { title: pluginName, show: true};
                // }
            }
            // tempList["Avo Discover"].show = false;
            // tempList["Mindmap"].show = false;
            // tempList["Selenium To Avo"].show = false;
            tempList.showList = true;
            setPluginList(tempList);
        }
    }, [userInfo]);

    return(
        <div data-test="plugins-section" className="plugin-section">
                <div data-test="plugins-blocks" className="plugin-blocks">

                {
                    pluginList.showList && Object.keys(pluginList).map(pluginName =>
                        <Fragment key={pluginName} >
                        {
                            pluginName !== 'showList' && 
                            <PluginBox 
                                pluginName={pluginName} 
                                pluginTitle={pluginList[pluginName].title}
                                pluginShow={pluginList[pluginName].show}
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
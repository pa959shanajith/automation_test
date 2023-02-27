import React, { useState} from 'react';
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';
import { getMappedDiscoverUser } from '../api';
import { setMsg } from '../../global' ;
import { useDispatch, useSelector } from "react-redux";
import uiConfig from "../../../assets/ui_config.json";
import * as actionTypesGlobal from "../../global/state/action"

const displayError = (error) =>{
	setMsg(error)
}

const openDiscover = async() =>{
	var res = await getMappedDiscoverUser();
	if(res.error){ displayError(res.error);return;}
	window.open(res.url+'?jwt='+res.token , '_blank');
}

const PluginBox = ({pluginName, pluginTitle}) => {

	const [redirectTo, setRedirectTo] = useState("");
  const userInfo = useSelector(state=>state.login.userinfo);
  const pluginData = uiConfig.pluginData;
  const disabled = userInfo.isTrial && !pluginData[pluginName.split(' ').join('').toLowerCase()]["availableForTrial"]
  const dispatch = useDispatch()

	const pluginRedirect = async() => {
    if (disabled) {
      return
    }
		pluginName = pluginName.split(' ').join('').toLowerCase();
			if (pluginName === "mr") {
				window.localStorage['Reduxbackup'] = window.localStorage['persist:login']
				window.localStorage['integrationScreenType'] = null
				window.localStorage['navigateScreen'] = 'reports';
				setRedirectTo('/reports') 
			}
			else if (pluginName === "md") {
				window.localStorage['Reduxbackup'] = window.localStorage['persist:login']
				window.localStorage['integrationScreenType'] = null
				window.localStorage['navigateScreen'] = 'dashboard';
				setRedirectTo('/dashboard') 
			}
			else if (pluginName === "almdmt") {
				window.localStorage['integrationScreenType'] = null
				window.localStorage['navigateScreen'] = 'integration';
				setRedirectTo('/integration') 
			}
			else if (pluginName === "stavo") {
				window.localStorage['Reduxbackup'] = window.localStorage['persist:login']
				window.localStorage['integrationScreenType'] = null
				window.localStorage['navigateScreen'] = 'seleniumtoavo';
				setRedirectTo('/seleniumtoavo') 
			}
			else if (pluginName === "de") {
				window.localStorage['integrationScreenType'] = null
				window.localStorage['navigateScreen'] = 'utility';
				setRedirectTo('/utility') 
			}
			else if (pluginName === "ags") {
					dispatch({type:actionTypesGlobal.OPEN_GENIUS,payload:{showGenuisWindow:true,geniusWindowProps:{}
					}}
					) 
      return
		}
		else {
			//redirects to the external plugin's URL in a new tab
			const res =  await fetch(`/External_Plugin_URL?pluginName=${pluginName}`); 
			const pluginURL = await res.text();
			window.open(pluginURL, '_blank');
		}
	}

    return (
		<>
			{ redirectTo && <Redirect data-test="redirectTo" to={redirectTo} />}
            <div data-test="plugin-blocks" className={"plugin-block " +(disabled?"disabled-plugin":"")} title={pluginData[pluginName.split(' ').join('').toLowerCase()]["tooltip"]["generic"]} onClick={pluginRedirect}>
                <img data-test="plugin-image" className="plugin-ic" alt="plugin-ic" src={`static/imgs/${pluginName.split(' ').join('')}${disabled?"_disabled":""}${pluginName==="AGS"?userInfo.isTrial?"_cloud":"":""}.svg`} />
                <span data-test="plugin-name" className="plugin-text">{pluginTitle}</span>
                {disabled?
                  <div className='disabled-info'><i class="fa fa-lock fa-fw" style={{color:"#ffcc62",paddingLeft:1,fontSize:9, marginRight:4}} aria-hidden="true"></i>Premium</div>
                :null}
        	  </div>
		</>
    );
}
PluginBox.propTypes={
    plugin:PropTypes.object
}
export default PluginBox;
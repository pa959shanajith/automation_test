import React, { useState} from 'react';
import { Redirect } from 'react-router-dom';

const PluginBox = ({plugin}) => {

	const [redirectTo, setRedirectTo] = useState("");

	const pluginRedirect = event => {
		window.localStorage['navigateScreen'] = plugin.pluginName;
		if (['p_Reports', 'performancetesting', 'dashboard'].indexOf(plugin.pluginName) > -1) window.location.href = "/"+ plugin.pluginName;
		else setRedirectTo(`/${plugin.pluginName.toLowerCase()}`)
	}

    return (
		<>
			{ redirectTo && <Redirect to={redirectTo} />}
            <div className="plugin-block" onClick={pluginRedirect}>
                <img className="plugin-ic" alt="plugin-ic" src={`static/imgs/${plugin.pluginName}.png`} />
                <span className="plugin-text">{plugin.pluginName}</span>
        	</div>
		</>
    );
}

export default PluginBox;
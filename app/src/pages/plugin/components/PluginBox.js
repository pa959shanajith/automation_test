import React, { useState} from 'react';
import { Redirect } from 'react-router-dom';

const PluginBox = ({plugin}) => {

	const [redirectTo, setRedirectTo] = useState("");

	const pluginRedirect = event => {
		let pluginName = plugin.image.toLowerCase();
		window.localStorage['navigateScreen'] = pluginName;
		if (['report', 'performancetesting', 'dashboard'].indexOf(pluginName) > -1) window.location.href = "/"+ pluginName;
		else {
			if (pluginName === "integration") window.localStorage['integrationScreenType'] = null
			setRedirectTo(`/${pluginName}`)
		}
	}

    return (
		<>
			{ redirectTo && <Redirect to={redirectTo} />}
            <div className="plugin-block" onClick={pluginRedirect}>
                <img className="plugin-ic" alt="plugin-ic" src={`static/imgs/${plugin.pluginName}.svg`} />
                <span className="plugin-text">{plugin.pluginName}</span>
        	</div>
		</>
    );
}

export default PluginBox;
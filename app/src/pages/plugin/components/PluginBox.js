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
			{ redirectTo && <Redirect data-test="redirectTo" to={redirectTo} />}
            <div data-test="plugin-blocks" className="plugin-block" onClick={pluginRedirect}>
                <img data-test="plugin-image" className="plugin-ic" alt="plugin-ic" src={`static/imgs/${plugin.image}.png`} />
                <span data-test="plugin-name" className="plugin-text">{plugin.pluginName}</span>
        	</div>
		</>
    );
}

export default PluginBox;
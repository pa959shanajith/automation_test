import React, { useState} from 'react';
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

const PluginBox = ({pluginName, pluginTitle}) => {

	const [redirectTo, setRedirectTo] = useState("");

	const pluginRedirect = () => {
		pluginName = pluginName.split(' ').join('').toLowerCase();
		window.localStorage['navigateScreen'] = pluginName;
		if(['dashboard', 'neurongraphs', 'seleniumtoavo', "reports"].includes(pluginName)){
			window.localStorage['Reduxbackup'] = window.localStorage['persist:login']
			window.location.href = "/"+ pluginName;
		}
		else if (['report', 'performancetesting'].indexOf(pluginName) > -1) window.location.href = "/"+ pluginName;
		else {
			if (pluginName === "integration") window.localStorage['integrationScreenType'] = null
			setRedirectTo(`/${pluginName}`)
		}
	}

    return (
		<>
			{ redirectTo && <Redirect data-test="redirectTo" to={redirectTo} />}
            <div data-test="plugin-blocks" className="plugin-block" title={pluginTitle} onClick={pluginRedirect}>
                <img data-test="plugin-image" className="plugin-ic" alt="plugin-ic" src={`static/imgs/${pluginName.split(' ').join('')}.svg`} />
                <span data-test="plugin-name" className="plugin-text">{pluginTitle}</span>
        	</div>
		</>
    );
}
PluginBox.propTypes={
    plugin:PropTypes.object
}
export default PluginBox;
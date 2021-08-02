import React, { useState } from "react";
import "../../styles/WebserviceScrape.scss";
import { useSelector, useDispatch } from "react-redux";
import * as settingConstants from "../../../../constants/ScrapeSettingsConstants";
import * as actionTypes from "../../state/action";

const ScrapeSettings = () => {
  const config = useSelector((state) => state.scrape.config);
  const dispatch = useDispatch();

  const handleFieldChange = (event, key) => {
      const newConfig = {...config};
      newConfig[key] = event.target.checked;
      dispatch({type: actionTypes.SET_CONFIGURATION, payload: {...newConfig}});
  };

  return (
    <div>
      <div className="ws__settings-wrapper">
        <div className="ws__settings-item">
          <div className="ws__settings-label">
            <div>Disable Cookie Jar</div>
            <div>
              Prevent adding cookies for this request to and from cookie jar
            </div>
          </div>
          <div className="ws__settings-action">
            <input
              data-test="appendInput"
              id="enable_append"
              type="checkbox"
              onChange={(event) => handleFieldChange(event, settingConstants.DISABLE_COOKIE_JAR)}
              checked={config[settingConstants.DISABLE_COOKIE_JAR]}
            />
          </div>
        </div>
        <div className="ws__settings-item">
          <div className="ws__settings-label">
            <div>Disable Auto Content Type Header</div>
            <div>
              Prevent adding automatic header based on request body
            </div>
          </div>
          <div className="ws__settings-action">
            <input
              data-test="appendInput"
              id="enable_append"
              type="checkbox"
              onChange={(event) => handleFieldChange(event, settingConstants.DISABLE_AUTO_CONTENT_TYPE_HEADER)}
              checked={config[settingConstants.DISABLE_AUTO_CONTENT_TYPE_HEADER]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapeSettings;

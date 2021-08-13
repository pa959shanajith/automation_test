import React from "react";
import "../styles/WebserviceScrape.scss";
import { useSelector, useDispatch } from "react-redux";
import * as settingConstants from "./ScrapeSettingsConstants";
import * as actions from "../state/action";
import RequestEditor from "./RequestEditor";
import Editor from "@monaco-editor/react";


export const ScrapeSettings = () => {
  const config = useSelector((state) => state.scrape.config);
  const dispatch = useDispatch();

  const handleFieldChange = (event, key) => {
      const newConfig = {...config};
      newConfig[key] = event.target.checked;
      dispatch({type: actions.SET_CONFIGURATION, payload: {...newConfig}});
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

export const RespTab = ({displayTag,respHeader,saveResponse,respBody}) => (
  <>
    <div style={{marginBottom: '10px' }}>
    <div className="ws__heading_grey">
          STATUS : {" "}
        </div>
    {displayTag(respHeader)}
    <button className={"ws__action_btn"} 
                onClick={saveResponse}>
            Save Response
    </button>
    </div>
    <div className="ws__heading_grey">
          RESPONSE HEADERS: 
    </div>
    <Editor
        height="200px"
        value={respHeader}
        options={{
            contextmenu: false,
            readOnly: true,
            lineNumbers: 'off'
        }}
    />
    <br/><br/>
    <div className="ws__heading_grey">
          RESPONSE BODY: 
    </div>
    <Editor
        height="200px"
        value={respBody}
        language={respHeader.includes("xml") ? "xml" : respHeader.includes("json") ? "json" : "text"}
        options={{
            contextmenu: false,
            readOnly: true,
            lineNumbers: 'off'
        }}
    />
  </> 
)

export const ReqTab = ({reqAuthHeaders, reqHeader, onChange, activeView, disableAction }) => {
	const dispatch = useDispatch();

	return (
		<>
		<div className="ws__action_options">
			<span style={{ fontWeight: "bold", color: "#868686" }}>
				AUTO GENERATED HEADERS :-{" "}
			</span>
			<button className={"ws__action_btn"} onClick={()=>{dispatch({type: actions.SET_REQ_AUTH_HEADER, payload: []});}}>
				Clear
			</button>
			<br/>
			<h6 style={{ color: "#633693" }}>{reqAuthHeaders.length ? reqAuthHeaders.join("\n") : "None"}</h6>
		</div>
		<ReqParamTab value={reqHeader} onChange={onChange} activeView={activeView} disableAction={disableAction} />
		</>
	)
}

export const ReqParamTab = ({value, onChange, activeView, disableAction }) => (
	<RequestEditor
		value={value}
		onChangeHandler={(value) => onChange(value)} 
		activeView={activeView}
		disabled={disableAction}
		placeholder="key:value"
	/> 
)

export const CookieTab = ({cookies,activeView,endPointURL,onCookieChange,reqCookies,disableAction}) => {
	const {wsCookieJar} = useSelector(state => state.scrape.cookies);
	const dispatch = useDispatch();
	return (
		<>
			<div className="ws__action_options" style={{ maxHeight: "200px" }}>
				<span style={{ fontWeight: "bold", color: "#868686" }}>
					RESPONSE COOKIES :-{" "}
				</span>
				<button className={"ws__action_btn"} 
				onClick={()=>  {
					wsCookieJar.clear(endPointURL);
					dispatch({type: actions.SET_COOKIES, payload: {resCookies: []}});
				}}>
					Clear
				</button>
				<br />
				{
					cookies.map(cookie => {
						return <h6 style={{ color: "#633693" }}>
						{cookie.cookieString()}
					</h6>
					})
				}
			</div>
			<RequestEditor
				value={reqCookies}
				onChangeHandler={(value) => onCookieChange(value)}
				activeView={activeView}
				disabled={disableAction}
				placeholder="key:value"
			/>
		</>
	)
}
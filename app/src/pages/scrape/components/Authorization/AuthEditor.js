import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../styles/WebserviceScrape.scss";
import FormInput from "../UI/FormInput";
import * as actions from "../../state/action";
import { executeRequest } from "../../api";
import MD5 from "crypto-js/md5";
import * as scrapeUtils from "../../../../utils/scrape";
import OAuth2Callback from "./OAuth2Callback";
import { Route } from "react-router-dom";
import { ScreenOverlay } from "../../../global";

const authTypes = [
  { value: "none", label: "No Auth" },
  { value: "apiKey", label: "API Key" },
  { value: "bearerToken", label: "Bearer Token" },
  { value: "basicAuth", label: "Basic Auth" },
  { value: "digestAuth", label: "Digest Auth" },
  { value: "oAuth1", label: "OAuth 1.0" },
  { value: "oAuth2", label: "OAuth 2.0" },
];

const grantTypes = [
  { value: "authorizationCode", label: "Authorization Code" },
  { value: "implicit", label: "Implicit" },
  { value: "clientCredentials", label: "Client Credentials" },
  { value: "passwordCredentials", label: "Password Credentials" },
];

const auths = {
  apikey: {},
  bearertoken: {},
  basicauth: {},
  digestauth: {},
  oauth1: {},
  oauth2: { "grant type": "Authorization Code" },
};

const AuthEditor = () => {
  const dispatch = useDispatch();

  const [editorState, setEditorState] = useState({});
  const [authType, setAuthType] = useState("none");
  const [authValues, setAuthValues] = useState(auths);
  const [overlay, setOverlay] = useState(null);

  const reqAuthHeaders = useSelector((state) => state.scrape.reqAuthHeaders);
  const { endPointURL, method, reqHeader } = useSelector(
    (state) => state.scrape.WsData
  );

  // in case we use sse

  // useEffect(() => {
  //   const sse = new EventSource("https://"+window.location.hostname+":8443");
  //   sse.onmessage = (e) => console.log(e.data);
  //   sse.onerror = (err) => console.error(err);
  //   return () => sse.close();
  // })

  const addHeaderHandler = async () => {
    const newAuthHeaders = [...reqAuthHeaders];
    const header = [];
    const values = authValues[authType.toLowerCase()];
    let payload = {};
    switch (authType) {
      case "apiKey":
        header.push(values?.key);
        header.push(values?.value);
        break;
      case "bearerToken":
        header.push("Authorization");
        header.push(`Bearer ${values?.token}`);
        break;
      case "basicAuth":
        header.push("Authorization");
        header.push(
          `Basic ${Buffer.from(
            `${values?.username}:${values?.password}`
          ).toString("base64")}`
        );
        break;
      case "digestAuth":
        payload = {
          username: values.username,
          password: values.password,
          method,
        };
        setOverlay("Fetching Parameters");
        let res;
        try {
          res = await executeRequest(endPointURL);
        } catch (e) {
          break;
        }
        setOverlay(null);
        // populate payload based on received challenge
        let challenge = res["www-authenticate"];
        if (challenge.startsWith("Digest")) {
          challenge = challenge.substring(7);
        } else {
          throw new Error("Not a valid Challenge");
        }
        challenge.split(",").forEach((param) => {
          const paramSep = param.split("=");
          payload[paramSep[0].trim()] = paramSep[1].trim().slice(1, -1);
        });

        // generate header based on payload
        const url_path = new URL(endPointURL).pathname;
        payload.domain = payload.domain || url_path;
        const HA1 = MD5(
          payload.username + ":" + payload.realm + ":" + payload.password
        ).toString();
        const HA2 = MD5(payload.method + ":" + payload.domain).toString();
        const cnonce = Buffer.from(
          new Date().getUTCMilliseconds().toString()
        ).toString("base64");
        const nc = "00000001";
        const authHash = MD5(
          HA1 +
            ":" +
            payload.nonce +
            ":" +
            nc +
            ":" +
            cnonce +
            ":" +
            "auth" +
            ":" +
            HA2
        ).toString();
        const challengeReply =
          `Digest username="${payload.username}", realm="${payload.realm}", nonce="${payload.nonce}", uri="${payload.domain}", ` +
          `algorithm="MD5", response="${authHash}", qop=auth, nc=${nc}, cnonce="${cnonce}"`;
        header.push("Authorization");
        header.push(challengeReply);
        break;
      case "oAuth1":
        payload = {
          signature: values["signature method"],
          consumerKey: values["consumer key"],
          consumerSecret: values["consumer secret"],
          accessToken: values["access token"],
          tokenSecret: values["token secret"],
          method,
          url: endPointURL,
        };
        const oAuthHeader = scrapeUtils.getOAuthHeaders(payload);
        header.push("Authorization");
        header.push(oAuthHeader["Authorization"]);
        break;
      case "oAuth2":
        const token = `${values["header prefix"] || "Bearer"} ${
          values["access token"]
        }`;
        header.push("Authorization");
        header.push(token);
        break;
      case "none":
        header.push("none");
    }

    const headerStr = header[0] !== "none" ? header.join(": ") : "";
    dispatch({
      type: actions.SET_REQ_AUTH_HEADER,
      payload: [headerStr],
    });
  };

  const authTypeChangeHandler = (event) => {
    setAuthType(event.target.value);
  };

  const authChangeListener = (event) => {
    const newAuthValues = { ...authValues };
    newAuthValues[authType.toLowerCase()][event.target.name.toLowerCase()] =
      event.target.value;
    setAuthValues(newAuthValues);
  };

  const authCodeTokenHandler = (err, token) => {
    if (err) console.error(err);
    else {
      const newAuthValues = { ...authValues };
      newAuthValues["oauth2"]["access token"] = token.data.access_token;
      newAuthValues["oauth2"]["header prefix"] = token.data.token_type;
      setAuthValues(newAuthValues);
    }
  };

  const newTokenHandler = () => {
    scrapeUtils.handleoAuth2Authorization(
      authValues.oauth2,
      authCodeTokenHandler
    );
  };

  return (
    <div className="ws__editor_wrapper">
      {overlay && <ScreenOverlay content={overlay} />}
      <Route path="/callback">
        <OAuth2Callback />
      </Route>
      <div className="ws__action_options">
        <span style={{ fontWeight: "bold", color: "#868686" }}>
          AUTH TYPE :{" "}
        </span>
        <select
          className="ws__select"
          onChange={authTypeChangeHandler}
          value={authType}
        >
          <option disabled value="0">
            Select Method
          </option>
          {authTypes.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {authType === "none" && (
        <h6>This request does not use any authorization</h6>
      )}
      {authType === "apiKey" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            onChange={authChangeListener}
            label="Key"
            placeholder="Key"
          />
          <FormInput
            onChange={authChangeListener}
            label="Value"
            placeholder="Value"
          />
        </div>
      )}
      {authType === "bearerToken" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            onChange={authChangeListener}
            label="Token"
            placeholder="Token"
          />
        </div>
      )}
      {authType === "basicAuth" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            onChange={authChangeListener}
            label="Username"
            placeholder="Username"
          />
          <FormInput
            type="password"
            onChange={authChangeListener}
            label="Password"
            placeholder="Password"
          />
        </div>
      )}
      {authType === "digestAuth" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            onChange={authChangeListener}
            label="Username"
            placeholder="Username"
          />
          <FormInput
            type="password"
            onChange={authChangeListener}
            label="Password"
            placeholder="Password"
          />
        </div>
      )}
      {authType === "oAuth1" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            onChange={authChangeListener}
            label="Signature Method"
            placeholder="default: HMAC-SHA1"
          />
          <FormInput
            onChange={authChangeListener}
            label="Consumer Key"
            placeholder="Consumer Key"
          />
          <FormInput
            onChange={authChangeListener}
            label="Consumer Secret"
            placeholder="Consumer Secret"
          />
          <FormInput
            onChange={authChangeListener}
            label="Access Token"
            placeholder="Access Token"
          />
          <FormInput
            onChange={authChangeListener}
            label="Token Secret"
            placeholder="Token Secret"
          />
        </div>
      )}
      {authType === "oAuth2" && (
        <div className="ws__editor_formWrapper">
          <FormInput
            value={authValues?.oauth2?.["access token"]}
            onChange={authChangeListener}
            label="Access Token"
          />
          <FormInput
            value={authValues?.oauth2?.["header prefix"]}
            onChange={authChangeListener}
            label="Header Prefix"
            placeholder="default: Bearer"
          />
          <br />
          <br />
          <div style={{ height: "300px", overflowY: "scroll" }}>
            <span style={{ fontWeight: "bold", color: "#868686" }}>
              CONFIGURE NEW TOKEN :
            </span>
            <FormInput
              select
              label="Grant Type"
              selectOptions={grantTypes}
              onChange={authChangeListener}
            />
            {["Authorization Code", "Implicit"].includes(
              authValues["oauth2"]["grant type"]
            ) && (
              <>
                <FormInput disabled value={`https://${window.location.hostname}:8443/oauth2/callback`} onChange={authChangeListener} label="Callback URL" />
                <FormInput onChange={authChangeListener} label="Auth URL" />
              </>
            )}
            {authValues["oauth2"]["grant type"] !== "Implicit" && (
              <FormInput
                onChange={authChangeListener}
                label="Access Token URL"
              />
            )}
            <FormInput onChange={authChangeListener} label="Client ID" />
            {authValues["oauth2"]["grant type"] !== "Implicit" && (
              <FormInput onChange={authChangeListener} label="Client Secret" />
            )}
            {authValues["oauth2"]["grant type"] === "Password Credentials" && (
              <>
                <FormInput onChange={authChangeListener} label="Username" />
                <FormInput
                  type="password"
                  onChange={authChangeListener}
                  label="Password"
                />
              </>
            )}
            <FormInput onChange={authChangeListener} label="Scope" />
            <div style={{ width: "20%", margin: "10px" }}>
              <button
                onClick={newTokenHandler}
                className="ws__action_btn ws__bigBtn"
              >
                Get New Token
              </button>
            </div>
          </div>
        </div>
      )}
      {authType !== "none" && (
        <div style={{ width: "15%", margin: "10px" }}>
          <button
            onClick={addHeaderHandler}
            className="ws__action_btn ws__bigBtn"
          >
            Add Headers
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthEditor;

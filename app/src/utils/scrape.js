import OAuth from "oauth-1.0a";
import ClientOAuth2 from 'client-oauth2';
import * as crypto from "crypto";
import tough, { CookieJar } from 'tough-cookie';
const Cookie = tough.Cookie;

const hash_function_sha1 = (base_string, key) => {
    return crypto.createHmac('sha1', key)
    .update(base_string)
    .digest('base64');
}



let windowRef = null;
let previousUrl = null;


export const FORM_URL_ENCODE_REGEX = /Content-Type[ ]*:[ ]*application\/x-www-form-urlencoded/gi;         
export const COOKIE_HEADER_REGEX = /Cookie[ ]*:[ ]*.+[\n$]/gi;       
export const AUTH_HEADER_REGEX = /Authorization[ ]*:[ ]*.+[\n$]/gi; 

const receiveAuthCode = async (event, client, cb) => {
  // Do we trust the sender of this message? (might be
  // different from what we originally opened, for example).

  // TODO
  if (event.origin !== "https://"+window.location.hostname+":8443") {
    return;
  }
  const { data } = event;
  try {
    const token = await client.code.getToken(data);
    cb(null, token);
  } catch(err) {
    cb(err, null);
  }
 };


export const getOAuthHeaders = (payload) => {
  const oAuth = OAuth({
    consumer: { key: payload.consumerKey, secret: payload.consumerSecret },
    signature_method: payload.signature || 'HMAC-SHA1',
    hash_function: hash_function_sha1
  });
  const token = {
      key: payload.accessToken,
      secret: payload.tokenSecret
  };
  const requestData = {
      url: payload.url,
      method: payload.method,
      data: {...payload.data},
  }
  return oAuth.toHeader(oAuth.authorize(requestData, token.key && token.secret ? token : {}));
};

export const openAuthWindow = (url, name, client, cb) => {
  window.removeEventListener('message', receiveAuthCode);
  const winParams = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100';
  if(windowRef === null || windowRef.closed) {
    windowRef = window.open(url, name, winParams);
  } else if (previousUrl !== url) {
    windowRef = window.open(url, name, winParams);
    windowRef.focus();
  } else {
    windowRef.focus();
  }
  windowRef.onload = function () {
    var bodyList = document.querySelector("body"),
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function (mutation) {
        console.log(mutation);
      });
    });
    var config = {
      childList: true, subtree: true
    };
    observer.observe(bodyList, config);
  }
  window.addEventListener('message', e => receiveAuthCode(e, client, cb));
  previousUrl = url;
}

const getoAuth2Client = (payload) => {
    return new ClientOAuth2({
      clientId: payload['client id'] || "",
      clientSecret: payload['client secret'] || "",
      accessTokenUri: payload['access token url'] || "",
      authorizationUri: payload['auth url'] || "",
      redirectUri: payload['callback url'] || 'https://'+window.location.hostname+':8443/oauth2/callback',
      scopes: payload['scope'] ? [...payload['scope']?.split(',')] : []
    });
    
}

export const handleoAuth2Authorization = async (payload, cb) => {
  if(!cb || typeof cb !== 'function')
        throw new Error("callback is not a function");
  const client = getoAuth2Client(payload);
  let user;
  const grantType = payload['grant type'];
  switch(grantType) {
    case "Authorization Code":
      const authUri = client.code.getUri();
      openAuthWindow(authUri, "oAuth2", client, cb);
      break;
    case "Implicit":
      const implicitAuthUri = client.token.getUri();
      openAuthWindow(implicitAuthUri, "oAuth2", client, cb);
      break;
    case "Client Credentials":
      user = await client.credentials.getToken();
      cb(user);
      break;
    case "Password Credentials":
      user = await client.owner.getToken(payload['username'],
                            payload['password']);
      cb(user);
      break;
  }
}

export const convertToFormData = (formStr, encode) => {
  const formBodyArr = formStr.split('\n');
  let formData;
  if (encode) {
    formData = formBodyArr.reduce((acc, curr, i) => {
      if(curr)
      return acc+curr.replace(/:/, "=")+'&'
      return acc;
    }, '');
    return formData;
  }
  
  formData = formBodyArr.reduce((acc, curr, i) => {
    if(curr) {
      const kv = curr.split(/:/);
      return acc+'\r\nContent-Disposition: form-data; ' +
            'name="'+kv[0]+'"'+'\r\n\r\n'+kv[1]+'\r\n--BoUnDaRy';
    }
    return acc;
  }, '--BoUnDaRy');
  formData += '--';
  return formData;

}



export const validateEndpoint = (endPoint) => {
  let url;
  try {
    url = new URL(endPoint);
  } catch(_) {
      return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export const parseSetCookieHeader = (headers) => {
  return headers.map(Cookie.parse);
}

export const getValidatedCookies = (cjar, url) => {
  // get validated cookies from cookieJar
  let cookieJar = localStorage.getItem("cookieJar");
  cookieJar = cookieJar ? CookieJar.fromJSON(cookieJar) : false;
  const validated = cookieJar ? cookieJar.getCookiesSync(url) : [];
  if (cookieJar) localStorage.setItem("cookieJar", JSON.stringify(cookieJar.toJSON()));
  return validated;
}

// to use await with callbacks
export const getValidatedCookiesAsync = (cjar, url) => {
  return new Promise((resolve, reject) => {
    cjar.getCookies(url, (err, cookies) => {
      if(err) reject(err);
      else resolve(cookies);
    })
  });
}

export const createCookieJar = (cookies, url) => {
  
  let cookieJar = localStorage.getItem("cookieJar");
  cookieJar = cookieJar ? CookieJar.fromJSON(cookieJar) : new CookieJar();
  cookies.forEach(c => {
    if(c) cookieJar.setCookieSync(c, url);
  });
  localStorage.setItem("cookieJar", JSON.stringify(cookieJar.toJSON()));
  return cookieJar;
}


export const removeDisabled = (data) => {
  return data.split("\n").filter(curr => !curr.startsWith("//")).join("\n");
}


import * as actionTypes from './action';
import WSCookieJar from "../components/WebServiceUtils";

const initialState = {
    ScrapeData : [],
    disableAction: false,
    disableAppend: false,
    compareFlag: false,
    compareData: {},
    compareObj: {changedObj: [], notChangedObj: [], notFoundObj: []},
    objValue: { val: null },
    cert: {},
    WsData: {
        endPointURL: "",
        method: "0",
        opInput: "",
        reqHeader: "",
        reqBody: "",
        respHeader: "",
        respBody: "",
        paramHeader: "",
    },
    wsdlError: [],
    actionError: [],
    reqHeaderObj: {},
    reqBodyHeaders: [],
    reqAuthHeaders: [],
    resStatus: {},
    // making it string to support RequestEditor's value type to string
    // TODO - change reqHeader, param and cookies to array of objects
    cookies: {
        // inconsistency - both must be array
        reqCookies: "",
        // received
        resCookies: [],
        cookieJar: {},
        wsCookieJar: new WSCookieJar()
    },
    config: {
        disableCookieJar: false,
        disableAutoContentTypeHeader: false
    }
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_SCRAPEDATA:
            return {
                ...state, ScrapeData: action.payload
            }
        case actionTypes.SET_DISABLEACTION:
            return {
                ...state, disableAction: action.payload
            }
        case actionTypes.SET_DISABLEAPPEND:
                return {
                    ...state, disableAppend: action.payload
                }
        case actionTypes.SET_COMPAREFLAG:
                return {
                    ...state, compareFlag: action.payload
                }
        case actionTypes.SET_COMPAREDATA:
                return {
                    ...state, compareData: action.payload
                }
        case actionTypes.SET_COMPAREOBJ:
                return {
                    ...state, compareObj: action.payload
                }
        case actionTypes.SET_OBJVAL:
            return {
                ...state, objValue: action.payload
            }
        case actionTypes.SET_CERT:
            return {
                ...state, cert: action.payload
            }
        case actionTypes.SET_WSDATA:
            return {
                ...state, WsData: { ...state.WsData, ...action.payload}
            }
        case actionTypes.SET_WSDLERROR:
            return {
                ...state, wsdlError: action.payload
            }
        case actionTypes.SET_ACTIONERROR:
            return {
                ...state, actionError: action.payload
            }
        case actionTypes.RESET_COMPARE:
            return {
                ...state, 
                compareObj: {changedObj: [], notChangedObj: [], notFoundObj: []},
                compareFlag: false,
                compareData: {}
            }
        case actionTypes.SET_REQ_BODY_HEADER:
            return {
                ...state,
                reqBodyHeaders: action.payload
            }
        case actionTypes.SET_REQ_AUTH_HEADER:
            return {
                ...state,
                reqAuthHeaders: action.payload
            }
        case actionTypes.SET_RES_STATUS:
            return  {
                ...state,
                resStatus: action.payload
            }
        case actionTypes.SET_COOKIES:
            return {
                ...state,
                cookies: {
                    ...state.cookies,
                    ...action.payload
                }
            }  
        case actionTypes.SET_CONFIGURATION:
            return {
                ...state,
                config: { ...state.config, ...action.payload }
            }
        default:
            return state
    }
}

export default reducer;
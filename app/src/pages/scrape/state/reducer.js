import * as actionTypes from './action';

const initialState = {
    ScrapeData : [],
    disableAction: false,
    disableAppend: false,
    compareFlag: false,
    compareData: {},
    compareObj: {changedObj: [], notChangedObj: [], notFoundObj: [],fullScrapeData:[]},
    objValue: { val: null },
    enableIdentifier:false,
    listofcheckeditems:[],
    elementPropertiesUpdated:false,
    isFiltered: false,
    cert: {},
    sony:false,
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
    actionError: []
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
        case actionTypes.SET_ISFILTER:
            return {
                ...state,
                isFiltered: action.payload
            }
        case actionTypes.SET_ISENABLEIDENTIFIER:
                return {
                    ...state,
                    enableIdentifier: action.payload
            }
        case actionTypes.SET_LISTOFCHECKEDITEMS:
                return {
                    ...state,
                    listofcheckeditems: action.payload
            }
        case actionTypes.SET_ELEMENT_PROPERTIES:
                return {
                    ...state,
                    elementPropertiesUpdated : action.payload
            }                
        case actionTypes.SET_SONY:
                return {
                    ...state,
                    sony: action.payload
                
                }
        default:
            return state
    }
}

export default reducer;
import * as actionTypes from './action';

const initialState = {
    ScrapeData : [],
    disableAction: false,
    disableAppend: false,
    compareFlag: false,
    compareData: {},
    compareObj: {changedObj: [], notChangedObj: [], notFoundObj: []},
    objValue: null,
    cert: {},
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
        default:
            return state
    }
}

export default reducer;
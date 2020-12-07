import * as actionTypes from './action';

const initialState = {
    ScrapeData : [],
    disableAction: false,
    disableAppend: false,
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
        default:
            return state
    }
}

export default reducer;
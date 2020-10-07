import * as actionTypes from './action';

const initialState = {
    ScrapeData : [],
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_SCRAPEDATA:
            return {
                ...state, ScrapeData: action.payload
            }
        default:
            return state
    }
}

export default reducer;
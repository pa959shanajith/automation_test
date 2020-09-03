import * as actionTypes from './action';

const initialState = {
    userinfo: {}
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_USERINFO:
            return {
                ...state, userinfo: action.payload
            }
        default:
            return state
    }
}

export default reducer;
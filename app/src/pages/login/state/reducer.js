import * as actionTypes from './action';

const initialState = {
    userinfo:{},
    SR:{},
    socket:undefined
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_USERINFO:
            return {
                ...state, userinfo: action.payload
            }
        case actionTypes.SET_SR:
            return {
                ...state, SR: action.payload
            }
        case actionTypes.SET_SOCKET:
            return {
                ...state, socket: action.payload
            }
        default:
            return state
    }
}

export default reducer;
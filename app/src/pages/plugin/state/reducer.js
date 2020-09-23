import * as actionTypes from './action.js';

const initialState = {
    tasksJson: {},
    FD: {},
    CT: {}
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_TASKSJSON:
            return {
                ...state, tasksJson: action.payload
            }
        case actionTypes.SET_FD:
                return {
                    ...state, FD: action.payload
                }
        case actionTypes.SET_CT:
            return {
                ...state, CT: action.payload
            }
        default:
            return state
    }
}

export default reducer;
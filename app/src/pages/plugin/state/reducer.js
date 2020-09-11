import * as actionTypes from './action';

const initialState = {
    tasksJson: {},
    FD: {}
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_TASKJSON:
            return {
                ...state, tasksJson: action.payload
            }
        case actionTypes.SET_FD:
                return {
                    ...state, FD: action.payload
                }
        default:
            return state
    }
}

export default reducer;
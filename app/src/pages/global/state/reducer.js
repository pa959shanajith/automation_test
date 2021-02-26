import * as actionTypes from './action.js';

const initialState = {
    progress: null,
    postExecutionPopup : false
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_PROGRESS:
            return{
                ...state, progress: action.payload,
            }
        case actionTypes.SET_POST_EXECUTION_POPUP:
            return{
                ...state, postExecutionPopup: action.payload,
            }    
        default:
            return state;
    }
    return state
}

export default reducer;
import * as actionTypes from './action.js';

const initialState = {
    progress: null,
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_PROGRESS:
            return{
                ...state, progress: action.payload,
            }
        default:
            return state;
    }
    return state
}

export default reducer;
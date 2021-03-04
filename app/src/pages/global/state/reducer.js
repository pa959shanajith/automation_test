import * as actionTypes from './action.js';

const initialState = {
    progress: 0,
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
}

export default reducer;
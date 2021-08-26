import * as actionTypes from './action.js';

const initialState = {
    progress: 0,
    roleSwitched: false,
    popup: false
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_PROGRESS:
            return{
                ...state, progress: action.payload,
            }
        case actionTypes.SWITCHED:
            return{
                ...state, roleSwitched: action.payload,
            }
        case actionTypes.SET_POPUP:
            return{
                ...state, popup: action.payload,
            }    
        default:
            return state;
    }
}

export default reducer;
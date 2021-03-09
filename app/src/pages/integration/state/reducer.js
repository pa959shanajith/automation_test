import * as actionTypes from './action.js';

const initialState = {
    mappedScreenType : null,
    screenType: null
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.VIEW_MAPPED_SCREEN_TYPE:
            return{
                ...state,
                mappedScreenType: action.payload
            }
        case actionTypes.INTEGRATION_SCREEN_TYPE:
            return{
                ...state,
                screenType: action.payload
            }
        default: 
            return state
    }
}

export default reducer;
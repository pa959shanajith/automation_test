import * as actionTypes from './action.js';

const initialState = {
    mapped_scren_type : null,
    loginPopupType: null
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.VIEW_MAPPED_SCREEN_TYPE:
            return{
                ...state,
                mapped_scren_type:action.payload
            }
        case actionTypes.INTEGRATION_SCREEN_TYPE:
                return{
                    ...state,
                    loginPopupType:action.payload
                }
        default: 
            return state
    }
}

export default reducer;
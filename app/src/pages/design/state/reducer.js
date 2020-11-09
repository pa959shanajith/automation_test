import * as actionTypes from './action'

const initialState = {
    copiedTestCases: {},
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_COPYTESTCASES:
            return{
                ...state, copiedTestCases: action.payload,
            }
        default:
            return state;
    }
}

export default reducer;
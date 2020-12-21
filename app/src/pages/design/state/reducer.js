import * as actionTypes from './action'

const initialState = {
    copiedTestCases: {},
    testCases: [],
    modified: {},
    saveEnable: false,
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_COPYTESTCASES:
            return {
                ...state, copiedTestCases: action.payload,
            }
        case actionTypes.SET_TESTCASES:
            return {
                ...state, testCases: action.payload,
            }
        case actionTypes.SET_MODIFIED:
            return {
                ...state, modified: action.payload,
            }
        case actionTypes.SET_SAVEENABLE:
            return {
                ...state, saveEnable: action.payload,
            }
        default:
            return state;
    }
}

export default reducer;
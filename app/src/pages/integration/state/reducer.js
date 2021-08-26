import * as actionTypes from './action.js';

const initialState = {
    mappedScreenType : null,
    screenType: null,
    showOverlay: "",
    mappedFiles: [],
    selectedTCDetails: {
        selectedTCNames: [],
        selectedTSNames: [],
        selectedFolderPaths: []
    },
    selectedTestCase: [],
    selectedScenarioIds: [],
    syncedTestCases: [],
    mappedPair: [],
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
        case actionTypes.SHOW_OVERLAY:
            return{
                ...state,
                showOverlay: action.payload
            }
        case actionTypes.MAPPED_FILES:
            return{
                ...state,
                mappedFiles: action.payload
            }
        case actionTypes.SEL_TC_DETAILS:
            return{
                ...state,
                selectedTCDetails: action.payload
            }
        case actionTypes.SEL_SCN_IDS:
            return{
                ...state,
                selectedScenarioIds: action.payload
            }
        case actionTypes.SYNCED_TC:
            return{
                ...state,
                syncedTestCases: action.payload
            }
        case actionTypes.MAPPED_PAIR:
            return{
                ...state,
                mappedPair: action.payload
            }
        case actionTypes.SEL_TC:
            return{
                ...state,
                selectedTestCase: action.payload
            }
        default: 
            return state
    }
}

export default reducer;
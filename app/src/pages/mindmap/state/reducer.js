import * as actionTypes from './action.js';

const initialState = {
    projectList : {},
    moduleList: [],
    screenData: {testCaseList:[],screenList:[]},
    selectedProj: undefined,
    searchModule: undefined,
    selectedModule: {},
    selectBoxState: false,
    selectNodes: {nodes:[],links:[]},
    copyNodes: {nodes:[],links:[]},
    deletedNodes: []
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.UPDATE_SCREENDATA:
            return{
                ...state,
                screenData:action.payload
            }
        case actionTypes.UPDATE_PROJECTLIST:
            return{
                ...state,
                projectList: action.payload
            }
        case actionTypes.SELECT_PROJECT:
            return{
                ...state,
                selectedProj: action.payload
            }   
        case actionTypes.UPDATE_MODULELIST:
            return{
                ...state,
                moduleList: action.payload
            }
        case actionTypes.SEARCH_MODULELIST:
            return{
                ...state,
                searchModule: action.payload
            }
        case actionTypes.SELECT_MODULE:
            return{
                ...state,
                selectedModule: action.payload
            }
        case actionTypes.SELECT_SELECTBOX:
            return{
                ...state,
                selectBoxState: action.payload
            }
        case actionTypes.UPDATE_SELECTNODES:
            return{
                ...state,
                selectNodes: action.payload
            }
        case actionTypes.UPDATE_COPYNODES:
            return{
                ...state,
                copyNodes: action.payload
            }
        case actionTypes.UPDATE_DELETENODES:
            return{
                ...state,
                deletedNodes: action.payload
            }    
        default: 
            return state
    }
}

export default reducer;
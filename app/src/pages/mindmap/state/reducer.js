import * as actionTypes from './action.js';

const initialState = {
    projectList : {},
    moduleList: [],
    selectedProj: undefined,
    searchModule: undefined,
    selectedModule: {}
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
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
        default: 
            return state
    }
}

export default reducer;
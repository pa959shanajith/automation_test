import * as actionTypes from './action.js';

const initialState = {
    projectList : {},
    moduleList: [],
    screenData: {testCaseList:[],screenList:[]},
    selectedProj: undefined,
    searchModule: undefined,
    initEnEProj: undefined,
    selectedModule: {},
    selectedModulelist:[],
    selectBoxState: false,
    selectNodes: {nodes:[],links:[]},
    copyNodes: {nodes:[],links:[]},
    deletedNodes: [],
    scenarioList:[],
    importData:{createdby:undefined,data:undefined},
    unassignTask:[],
    toDeleteScenarios: []
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
        case actionTypes.INIT_ENEPROJECT:
            return{
                ...state,
                initEnEProj: action.payload
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
        case actionTypes.SELECT_MODULELIST:
            return{
                ...state,
                selectedModulelist: action.payload
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
        case actionTypes.UPDATE_SCENARIOLIST:
            return{
                ...state,
                scenarioList: action.payload
            }
        case actionTypes.SAVE_MINDMAP :
            return{
                ...state,
                screenData: action.payload.screendata,
                deletedNodes: [],
                moduleList: action.payload.moduledata,
                selectedModule: {},
                selectedModulelist: [],
                scenarioList:[],
                unassignTask:[]
            }
        case actionTypes.UPDATE_UNASSIGNTASK:
            return{
                ...state,
                unassignTask: action.payload
            }
        case actionTypes.IMPORT_MINDMAP:
            var res = action.payload
            return{
                ...state,
                selectedProj : res.selectProj,
                selectedModule : res.selectModule,
                screenData : res.screenData,
                moduleList : res.moduleList,
                importData : res.importData
            }
        case actionTypes.DELETE_SCENARIO:
            return{
                ...state,
                toDeleteScenarios: action.payload
            } 
        default: 
            return state
    }
}

export default reducer;
import * as actionTypes from './action.js';

const initialState = {
    moduleList : [],
    suiteDetails : [],
    suiteSelected : {_id:undefined,name:""}
}

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.UPDATE_MODULELIST:
            return{
                ...state,
                moduleList:action.payload,
                suiteSelected:{_id:undefined,name:""}
            }
        case actionTypes.UPDATE_SUITEDETAILS:
            return{
                ...state,
                suiteDetails:action.payload.suiteDetails,
                suiteSelected:action.payload.suiteID
            }
        case actionTypes.RESET_DETAILS:
            return{
                ...state,
                suiteDetails:[],
                moduleList:{},
                suiteSelected:{_id:undefined,name:""}
            }
        default: 
            return state
    }
}

export default reducer;
import * as actionTypes from './action.js';

const initialState = {
    tasksJson: {},
    FD: {},
    CT: {},
    PN: 0,
    RD: {
        'cycleid': undefined,
        'releaseid': undefined,
        'testsuiteid': undefined,
        'projectid': undefined,
        'testsuitename': undefined
    }
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_TASKSJSON:
            return {
                ...state, tasksJson: action.payload
            }
        case actionTypes.SET_FD:
                return {
                    ...state, FD: action.payload
                }
        case actionTypes.SET_CT:
            return {
                ...state, CT: action.payload
            }
        case actionTypes.SET_PN:
            return {
                ...state, PN: action.payload
            }
        case actionTypes.UPDATE_REPORTDATA:
            var data = action.payload.testSuiteDetails[0]
            return{
                ...state, 
                RD: {
                    'cycleid': data.cycleid,
                    'releaseid': data.releaseid,
                    'testsuiteid': data.testsuiteid,
                    'projectid': data.projectid,
                    'testsuitename': data.testsuitename
                }
            }
        case actionTypes.CLEAR_REPORTDATA:
            return{
                ...state,
                RD: initialState.RD
            }
        default:
            return state
    }
}

export default reducer;
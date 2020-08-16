import * as actionTypes from './action.js';

const initialState = {
    projectList : []
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.UPDATE_PROJECTLIST:
            return{
                ...state,
                projectList: action.payload
            }
    }
    return state
}

export default reducer;
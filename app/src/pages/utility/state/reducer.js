import * as actionTypes from './action';

const initialState = {
    copiedCells: {
        type: "",
        cells: [],
    }
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_COPY_CELLS:
            return {
                ...state, copiedCells: action.payload
            }
        default:
            return state
    }
}

export default reducer;
import * as actionTypes from './action.js';

const initialState = {
    progress: 0,
    roleSwitched: false,
    popup: false,
    showGenuisWindow: false,
    geniusWindowProps: {},
    showSmallPopup:false,
    showTrialVideo:false,
};

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionTypes.SET_PROGRESS:
            return{
                ...state, progress: action.payload,
            }
        case actionTypes.SWITCHED:
            return{
                ...state, roleSwitched: action.payload,
            }
        case actionTypes.SET_POPUP:
            return{
                ...state, popup: action.payload,
            }
        case actionTypes.OPEN_GENIUS:
        case actionTypes.CLOSE_GENIUS:
          return {
            ...state,
            showGenuisWindow: action.payload.showGenuisWindow,
            geniusWindowProps:action.payload.geniusWindowProps
          }
        case actionTypes.GENIUS_SMALL_POPUP:
          return{
            ...state,
            showSmallPopup:action.payload.showSmallPopup

            }
        case actionTypes.OPEN_TRIAL_VIDEO:
                return{
                  ...state,
                  showTrialVideo:action.payload.showTrialVideo
      
                  }
        default:
            return state;
    }
}

export default reducer;
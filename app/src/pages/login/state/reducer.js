import * as actionTypes from './action';

const initialState = {
    userinfo:{},
    SR:{},
    socket:undefined,
    notify:{data:[],unread:0}
}

const reducer = (state=initialState, action) => {
    switch(action.type){
        case actionTypes.SET_USERINFO:
            return {
                ...state, userinfo: action.payload
            }
        case actionTypes.SET_SR:
            return {
                ...state, SR: action.payload
            }
        case actionTypes.SET_SOCKET:
            return {
                ...state, socket: action.payload
            }
        case actionTypes.UPDATE_NOTIFY:
            var value = action.payload
            value.dateTime = new Date().toLocaleString();
            var arr = [...state.notify.data]
            var val = state.notify.unread
            var isDuplicateNotificationMsg = false;
            arr.forEach(e => {
                if (value.notifyMsg == e.notifyMsg) {
					isDuplicateNotificationMsg = true;
				}
            });
            if (isDuplicateNotificationMsg)return{...state}
            arr = [value,...arr]
            val = val + 1
            return {
                ...state, notify: {data:arr,unread:val}
            }
        case actionTypes.CLEAR_NOTIFY:
            if(action.payload === 'all'){
                return {
                    ...state, notify:{...initialState.notify}
                }
            }
        case actionTypes.UPDATE_NOTIFY_COUNT:
            return {
                ...state, notify:{...state.notify,unread:action.payload}
            }
        default:
            return state
    }
}

export default reducer;
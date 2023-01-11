import * as actionTypes from './action';

const initialState = {
    SR: "Test Lead",
    userinfo: {"user_id":"62e37f4f7f8c5bb0300feff8","username":"ritik_sharma","email_id":"ritik.sharma@avoautomation.com","additionalrole":[],"firstname":"Ritik","lastname":"Sharma","role":"5db0022cf87fdec084ae49aa","taskwflow":false,"token":"720","dateformat":"YYYY-MM-DD","dbuser":true,"ldapuser":false,"samluser":false,"openiduser":false,"welcomeStepNo":3,"firstTimeLogin":true,"rolename":"Test Lead","pluginsInfo":[{"pluginName":"Integration","pluginValue":true},{"pluginName":"APG","pluginValue":false},{"pluginName":"Dashboard","pluginValue":true},{"pluginName":"Mindmap","pluginValue":true},{"pluginName":"Neuron Graphs","pluginValue":false},{"pluginName":"Performance Testing","pluginValue":false},{"pluginName":"Reports","pluginValue":true},{"pluginName":"Utility","pluginValue":true},{"pluginName":"Webocular","pluginValue":false},{"pluginName":"Selenium To Avo","pluginValue":true},{"pluginName":"Avo Discover","pluginValue":false},{"pluginName":"iTDM","pluginValue":true}],"page":"plugin","tandc":false,"isTrial":false},
    socket:undefined,
    notify:{data:[],unread:0},
    dateformat:"DD-MM-YYYY"
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
                if (value.notifyMsg === e.notifyMsg) {
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
            } else return state
        case actionTypes.UPDATE_NOTIFY_COUNT:
            return {
                ...state, notify:{...state.notify,unread:action.payload}
            }
        case actionTypes.SET_DATEFORMAT:
            return{
                ...state, dateformat: action.payload
            }
        default:
            return state
    }
}

export default reducer;
import * as actionTypes from './action';

const initialState = {
    SR: "",
    // userinfo: {},
    userinfo: {
        "user_id": "5fd99d219580352a597aff81",
        "username": "priyanka.r",
        "email_id": "vivek.sharma@slkgroup.com",
        "additionalrole": ["5db0022cf87fdec084ae49ab", "5db0022cf87fdec084ae49ac"],
        "firstname": "Vivek",
        "lastname": "Sharma",
        "role": "5db0022cf87fdec084ae49aa",
        "taskwflow": false,
        "token": "720",
        "dbuser": true,
        "ldapuser": false,
        "samluser": false,
        "openiduser": false,
        "rolename": "Test Lead",
        "pluginsInfo": [
          {
            "pluginName": "Integration",
            "pluginValue": true
          },
          {
            "pluginName": "APG",
            "pluginValue": false
          },
          {
            "pluginName": "Dashboard",
            "pluginValue": false
          },
          {
            "pluginName": "Mindmap",
            "pluginValue": true
          },
          {
            "pluginName": "Neuron Graphs",
            "pluginValue": false
          },
          {
            "pluginName": "Performance Testing",
            "pluginValue": false
          },
          {
            "pluginName": "Reports",
            "pluginValue": true
          },
          {
            "pluginName": "Utility",
            "pluginValue": true
          },
          {
            "pluginName": "Webocular",
            "pluginValue": false
          },
          {
            "pluginName": "Placeholder",
            "pluginValue": false
          }
        ],
        "page": "plugin"
    },
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
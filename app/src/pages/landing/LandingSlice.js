import { createSlice } from '@reduxjs/toolkit'

export const loadUserInfo = createSlice({
    name: 'loadUserInfo',
    initialState: {
        userRole: "",
        userinfo: {},
        socket: undefined,
        notify: { data: [], unread: 0 },
        dateformat: "DD-MM-YYYY",
        showChangePasswordDialog: false,
        projectDetails:{},
        // apptype:'',
    },
    reducers: {
        setUserInfo: (state, action) => {
            state.userinfo = action.payload;
        },

        setRole: (state, action) => {
            state.userRole = action.payload;
        },

        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        showChangePasswordDialog:(state) => {
            state.showChangePasswordDialog = !state.showChangePasswordDialog;
        }, 
        setProjectDetails: (state, action) => {
            state.project = action.payload;
        },
        // setApptype: (state, action) => {
        //     state.apptype = action.payload;
        // },
        // case actionTypes.UPDATE_NOTIFY:
        // var value = action.payload
        //     value.dateTime = new Date().toLocaleString();
        // var arr = [...state.notify.data]
        //     var val = state.notify.unread
        //     var isDuplicateNotificationMsg = false;
        // arr.forEach(e => {
        //     if (value.notifyMsg === e.notifyMsg) {
        //         isDuplicateNotificationMsg = true;
        //     }
        // });
        // if(isDuplicateNotificationMsg)return{ ...state }
        //     arr =[value, ...arr]
        //     val = val + 1
        //     return {
        //     ...state, notify: { data: arr, unread: val }
        // }
        // case actionTypes.CLEAR_NOTIFY:
        // if(action.payload === 'all'){
        //     return {
        //         ...state, notify: { ...initialState.notify }
        //     }
        // } else return state
        // case actionTypes.UPDATE_NOTIFY_COUNT:
        // return {
        //     ...state, notify: { ...state.notify, unread: action.payload }
        // }
        setDateFormat: (state, payload) => {
            state.dateformat = payload
        }
    }
})
// export all the action creators
export const loadUserInfoActions = loadUserInfo.actions;
// export all the reducer 
export default loadUserInfo.reducer;
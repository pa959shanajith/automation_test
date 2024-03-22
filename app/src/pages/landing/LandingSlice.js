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
        projectDetails: {},
        projectModifiedDetails: {},
        selectedProject: null,
        savedNewProject: false,
        defaultSelectProject: {},
        reportData: {
            'cycleid': undefined,
            'releaseid': undefined,
            'testsuiteid': undefined,
            'projectid': undefined,
            'testsuitename': undefined
        },
        updatedProject: false,
        openCaptureScreen: false,
        updateElementRepository: false,
        sapGeniusScrapeData: {},
        collapseSideBar:false,
        setElementRepositoryIndex:0
    },
    reducers: {
        setUserInfo: (state, action) => {
            state.userinfo = action.payload;
        },
        savedNewProject: (state, action) => {
            state.savedNewProject = action.payload;
        },
        setRole: (state, action) => {
            state.userRole = action.payload;
        },

        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        showChangePasswordDialog: (state) => {
            state.showChangePasswordDialog = !state.showChangePasswordDialog;
        },
        setProjectDetails: (state, action) => {
            state.projectDetails = action.payload;
        },
        setProjectModifiedDetails: (state, action) => {
            state.projectModifiedDetails = action.payload;
        },
        setSelectedProject: (state, action) => {
            state.selectedProject = action.payload;
        },
        setDefaultProject: (state, action) => {
            state.defaultSelectProject = action.payload;
        },
        setDateFormat: (state, action) => {
            state.dateformat = action.payload
        },
        updateReport: (state, action) => {
            let data = action.payload.testSuiteDetails[0];
            state.reportData = {
                'cycleid': data.cycleid,
                'releaseid': data.releaseid,
                'testsuiteid': data.testsuiteid,
                'projectid': data.projectid,
                'testsuitename': data.testsuitename
            }
        },
        setSocket: (state, action) => {
            state.socket = action.payload
        },
        setSAPGeniusScrapeData: (state, action) => {
            state.sapGeniusScrapeData = action.payload;
        },
        updateNotify: (state, action) => {
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
            if (isDuplicateNotificationMsg) return { ...state }
            arr = [value, ...arr]
            val = val + 1
            return {
                ...state, notify: { data: arr, unread: val }
            }
        },
        updatedProject: (state, action) => {
            state.updatedProject = action.payload;
        },
        openCaptureScreen: (state, action) => {
            state.openCaptureScreen = action.payload;
        },
        updateElementRepository: (state, action) => {
            state.updateElementRepository = action.payload;
        },
        collapseSideBar:(state,action)=>{
            state.collapseSideBar = action.payload;
        },
        setElementRepositoryIndex:(state,action)=>{
            state.setElementRepositoryIndex = action.payload;
        }
        // need it in future
        // ----------------------------------
        // CLEAR_NOTIFY: (state, action) => {
        //     if (action.payload === 'all') {
        //         return {
        //             ...state, notify: { ...initialState.notify }
        //         }
        //     }
        // },

        // UPDATE_NOTIFY_COUNT: (state, action) => {
        //     return {
        //         ...state, notify: { ...state.notify, unread: action.payload }
        //     }
        // },
        // SET_DATEFORMAT: (state, action) => {
        //     return {
        //         ...state, dateformat: action.payload
        //     }
        // },
        // HIGHLIGHT_AGS: (state, action) => {
        //     return {
        //         ...state,
        //         highlightAGS: action.payload

        //     }
        // }
        // -----------------------------------
        // need it in future
    }
})
// export all the action creators
export const loadUserInfoActions = loadUserInfo.actions;
// export all the reducer 
export default loadUserInfo.reducer;
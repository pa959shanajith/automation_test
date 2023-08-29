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
        setDateFormat: (state, payload) => {
            state.dateformat = payload
        },
        updateReport: (state, payload) => {
            let data = payload.testSuiteDetails[0];
            state.reportData = {
                'cycleid': data.cycleid,
                'releaseid': data.releaseid,
                'testsuiteid': data.testsuiteid,
                'projectid': data.projectid,
                'testsuitename': data.testsuitename
            }
        }
    }
})
// export all the action creators
export const loadUserInfoActions = loadUserInfo.actions;
// export all the reducer 
export default loadUserInfo.reducer;
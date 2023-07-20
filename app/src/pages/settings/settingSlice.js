import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    screenType: '',
    intergrationLogin:{
        username:'priyanka.r@slkgroup.com',
        password:'B8RUqqKt8B28MSz9zq1Q14AD',
        url:'https://mnb.atlassian.net'
    },
    selectedProject:'',
    selectedIssue:'',
    selectedZTCDetails: {
        selectedTCPhaseId: [],
        selectedTcId: [],
        selectedTCNames: [],
        selectedTCReqDetails:[]
    },
    selectedTestCase: [],
    syncedTestCases: [],
    selectedScenarioIds: [],
    mappedPair: [],
}

export const settingSlice=createSlice({
    name:'setting',
    initialState,
    reducers:{
        screenType:(state,action)=>{
            state.screenType = action.payload;
        },
        IntergrationLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.intergrationLogin[fieldName] = value;
        },
        resetIntergrationLogin: (state) => {
            state.intergrationLogin = initialState.intergrationLogin;
          },
        resetScreen:(state) => {
            state.screenType = initialState.screenType;
          },
        selectedProject:(state,action) => {
            state.selectedProject =  action.payload
        },
        selectedIssue:(state,action) => {
            state.selectedIssue =  action.payload
        },
        selectedTCReqDetails:(state,action) => {
            state.selectedTCReqDetails =  action.payload
        },
        selectedTestCase:(state,action) => {
            state.selectedTestCase =  action.payload
        },
        syncedTestCases:(state,action) => {
            state.syncedTestCases =  action.payload
        },
        selectedScenarioIds:(state,action) => {
            state.syncedTestCases =  action.payload
        },
        mappedPair:(state,action) => {
            state.mappedPair =  action.payload
        },

    }
})
// export all the action creators
export const { 
    screenType,
    IntergrationLogin,
    resetIntergrationLogin,
    resetScreen,
    selectedProject,
    selectedIssue,
    selectedTCReqDetails,
    selectedTestCase,
    syncedTestCases,
    selectedScenarioIds,
    mappedPair
     } = settingSlice.actions;
// export all the reducer 
export default settingSlice.reducer;
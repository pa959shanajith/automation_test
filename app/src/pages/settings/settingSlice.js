import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    screenType: { name: 'Jira', code: 'NY' },
    intergrationLogin:{
        username:'',
        password:'',
        url:''
    },
    zephyrLogin:{
        url:'',
        username:'',
        password:'',
        token:''
    },
    AzureLogin:{
        username:'',
        password:'',
        url:''
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
    selectedAvoproject:'',
    mappedTree:[],
    showOverlay:""
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
            state.selectedScenarioIds =  action.payload
        },
        mappedPair:(state,action) => {
            state.mappedPair =  action.payload
        },
        selectedAvoproject:(state,action) => {
            state.selectedAvoproject =  action.payload
        },
        mappedTree:(state,action) => {
            state.mappedTree =  action.payload
        },
        showOverlay:(state,action) =>{
            state.showOverlay =  action.payload
        },
        zephyrLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.zephyrLogin[fieldName] = value;
        },
        resetZephyrLogin: (state) => {
            state.zephyrLogin = initialState.zephyrLogin;
          },
        AzureLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.AzureLogin[fieldName] = value;
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
    mappedPair,
    selectedAvoproject,
    mappedTree,
    showOverlay,
    zephyrLogin,
    resetZephyrLogin,
    AzureLogin
     } = settingSlice.actions;
// export all the reducer 
export default settingSlice.reducer;
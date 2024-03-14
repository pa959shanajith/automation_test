import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    screenType: { name: 'Jira', code: 'JA' },
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
    testRailLogin: {
        username:'',
        apiKey:'',
        url:''
    },
    AzureLogin:{
        username:'',
        password:'',
        url:''
    },
    saucelabsInitialState:{
            username: '',
            url: '',
            accesskey: '',
    },
    browserstackInitialState:{
        username: '',
        accesskey: ''
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
    showOverlay:"",
    checkedTCPhaseIds: [],
    checkedTcIds: [],
    checkedTCNames: [],
    checkedTCReqDetails:[],
    checkedTreeIds:[],
    checkedParentIds:[],
    checkedProjectIds:[],
    checkedReleaseIds:[],
    reference:'',
    enableSaveButton:false,
    updateTestrailMapping: true,
    template_id:''
}

// const saucelabsInitialState = {
//     username: '',
//     url: '',
//     accesskey: '',
//   };

//   export const saucelabsSlice = createSlice({
//     name: 'saucelabs',
//     initialState: saucelabsInitialState,
//     reducers: {
//       setUsername: (state, action) => {
//         state.username = action.payload;
//       },
//       setURL: (state, action) => {
//         state.url = action.payload;
//       },
//       setAccesskey: (state, action) => {
//         state.accesskey = action.payload;
//       },
//     },
//   });

//   const browserstackInitialState = {
//     username: '',
//     accesskey:''
//   };

//   export const browserstackSlice = createSlice({
//     name: 'browserstack',
//     initialState: browserstackInitialState,
//     reducers: {
//       setUsername: (state, action) => {
//         state.username = action.payload;
//       },
     
//       setAccesskey: (state, action) => {
//         state.accesskey = action.payload;
//       },
//     },
//   });

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
        saucelabsInitialState:(state,action) => {
            const { fieldName, value } = action.payload;
            state.saucelabsInitialState[fieldName] = value;
        },
        browserstackInitialState:(state,action) => {
            const { fieldName, value } = action.payload;
            state.browserstackInitialState[fieldName] = value;
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
        testRailLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.testRailLogin[fieldName] = value;
        },
        resetTestRailLogin:(state,action) => {
            state.testRailLogin = initialState.testRailLogin;
        },
        resetZephyrLogin: (state) => {
            state.zephyrLogin = initialState.zephyrLogin;
          },
        AzureLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.AzureLogin[fieldName] = value;
        },
        checkedTCPhaseIds: (state,action) => {
            state.checkedTCPhaseIds =  action.payload
        },
        checkedTcIds: (state,action) => {
            state.checkedTcIds =  action.payload
        },
        checkedTCNames: (state,action) => {
            state.checkedTCNames =  action.payload
        },
        checkedTCReqDetails: (state,action) => {
            state.checkedTCReqDetails =  action.payload
        },
        checkedTreeIds: (state,action) => {
            state.checkedTreeIds =  action.payload
        },
        checkedParentIds: (state,action) => {
            state.checkedParentIds =  action.payload
        },
        checkedProjectIds: (state,action) => {
            state.checkedProjectIds =  action.payload
        },
        checkedReleaseIds: (state,action) => {
            state.checkedReleaseIds =  action.payload
        },
        enableSaveButton :(state, action) => {
            state.enableSaveButton =  action.payload
        },
        resetAzureLogin : (state, action) =>{
            state.AzureLogin = initialState.AzureLogin;
        },
        updateTestrailMapping : (state, action) => {
            state.updateTestrailMapping = action.payload
        },
        updateTemplateId : (state, action) => {
            state.template_id = action.payload
        }
    }
})

// export const {
//     setUsername: setUsernameSaucelabs,
//     setURL: setURLSaucelabs,
//     setAccesskey: setAccesskeySaucelabs,
//   } = saucelabsSlice.actions;
  
//   export const {
//     setUsername: setUsernameBrowserstack,
//     setAccesskey: setAccesskeyBrowserstack,
//   } = browserstackSlice.actions;

//   export const saucelabsReducer = saucelabsSlice.reducer;
//   export const browserstackReducer = browserstackSlice.reducer;
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
    testRailLogin,
    resetTestRailLogin,
    resetZephyrLogin,
    AzureLogin,
    saucelabsInitialState,
    browserstackInitialState,
    checkedTCPhaseIds,
    checkedTcIds,
    checkedTCNames,
    checkedTCReqDetails,
    checkedTreeIds,
    checkedParentIds,
    checkedProjectIds,
    checkedReleaseIds,
    enableSaveButton,
    resetAzureLogin,
    updateTestrailMapping,
    updateTemplateId
     } = settingSlice.actions;
// export all the reducer 
export default settingSlice.reducer;
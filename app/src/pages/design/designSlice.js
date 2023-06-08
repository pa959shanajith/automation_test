import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    projectList : {},
    moduleList: [],
    screenData: {testCaseList:[],screenList:[]},
    selectedProj: undefined,
    searchModule: undefined,
    initEnEProj: undefined,
    isEnELoad: false,
    selectedModule: {},
    selectedModulelist:[],
    selectBoxState: false,
    selectNodes: {nodes:[],links:[]},
    copyNodes: {nodes:[],links:[]},
    deletedNodes: [],
    scenarioList:[],
    importData:{createdby:undefined,data:undefined},
    unassignTask:[],
    toDeleteScenarios: [],
    appType:undefined,
    savedList:false,
  ScrapeData : [],
    disableAction: false,
    disableAppend: false,
    compareFlag: false,
    compareData: {},
    compareObj: {changedObj: [], notChangedObj: [], notFoundObj: []},
    objValue: { val: null },
    isFiltered: false,
    cert: {},
    WsData: {
        endPointURL: "",
        method: "0",
        opInput: "",
        reqHeader: "",
        reqBody: "",
        respHeader: "",
        respBody: "",
        paramHeader: "",
    },
    wsdlError: [],
    actionError: [],
    copiedTestCases: {},
    TestCases: [],
    modified: {},
    saveEnable: false,
}

export const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    projectList:(state, action) =>{
       state.projectList = action.payload
    },
    moduleList: (state, action) => {
      state.moduleList = action.payload
    },
    screenData: (state, action)=>{
       state.screenData = action.payload
    },
    selectedProj: (state, action)=>{
      state.selectedProj = action.payload
    },
    searchModule: (state, action)=>{
      state.searchModule = action.payload
    },
    initEnEProj: (state, action)=>{
      state.initEnEProj = action.payload
    },
    isEnELoad: (state, action)=>{
      state.isEnELoad = action.payload
    },
    selectedModule: (state, action)=>{
      state.selectedModule = action.payload
    },
    selectedModulelist:(state, action)=>{
      state.selectedModulelist = action.payload
    },
    selectBoxState: (state, action)=>{
      state.selectBoxState = action.payload
    },
    selectNodes: (state, action)=>{
      state.selectNodes = action.payload
    },
    copyNodes: (state, action)=>{
      state.copyNodes = action.payload
    },
    deletedNodes: (state, action)=>{
      state.deletedNodes = action.payload
    },
    scenarioList:(state, action)=>{
      state.scenarioList = action.payload
    },
    importData:(state, action)=>{
      state.importData = action.payload
    },
    unassignTask:(state, action)=>{
      state.unassignTask = action.payload
    },
    toDeleteScenarios: (state, action)=>{
      state.toDeleteScenarios = action.payload
    },
    appType:(state, action)=>{
      state.appType = action.payload
    },
    savedList:(state, action)=>{
      state.savedList = action.payload
    },
    saveMindMap: (state, action) => {
      state.screenData = action.payload.screenData;
      state.deletedNodes = [];
      state.moduleList = action.payload.moduleData;
      state.selectedModule = {};
      state.selectedModuleList = [];
      state.scenarioList = [];
      state.unassignTask = [];
    },
    ScrapeData:(state, action) =>{
      state.ScrapeData = action.payload;
    },
    disableAction:(state, action)=>{
      state.disableAction = action.payload;
    },
    copiedTestCases: (state, action)=>{
      state.copiedTestCases = action.payload;
    },
    TestCases:(state, action)=>{
      state.TestCases = action.payload;
    },
    Modified:(state, action)=>{
      state.Modified = action.payload;
    },
    SaveEnable:(state, action)=>{
      state.SaveEnable = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { projectList, moduleList,screenData,
selectedProj,
searchModule,
initEnEProj,
isEnELoad,
selectedModule,
selectedModulelist,
selectBoxState,
selectNodes,
copyNodes,
deletedNodes,
scenarioList,
importData,
unassignTask,
toDeleteScenarios,
appType,
savedList,saveMindMap ,ScrapeData, disableAction,copiedTestCases,
TestCases,
Modified,
SaveEnable} = designSlice.actions

export default designSlice.reducer
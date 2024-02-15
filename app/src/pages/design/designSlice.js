import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  projectList: {},
  moduleList: [],
  screenData: { testCaseList: [], screenList: [] },
  selectedProj: undefined,
  searchModule: undefined,
  initEnEProj: undefined,
  isEnELoad: false,
  selectedModule: {},
  selectedModulelist: [],
  selectBoxState: false,
  selectNodes: { nodes: [], links: [] },
  copyNodes: { nodes: [], links: [] },
  deletedNodes: [],
  scenarioList: [],
  importData: { createdby: undefined, data: undefined },
  unassignTask: [],
  toDeleteScenarios: [],
  appType: undefined,
  savedList: false,
  dontShowFirstModule: false,
  ScrapeData: [],
  disableAction: false,
  disableAppend: false,
  compareFlag: false,
  compareData: {},
  compareObj: { changedObj: [], notChangedObj: [], notFoundObj: [], fullScrapeData: [] },
  scenarioLevelImpact: [],
  analyzeScenario: false,
  impactAnalysisScreenLevel: false,
  objValue: { val: null },
  isFiltered: false,
  compareSuccessful: false,
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
  Modified: {},
  SaveEnable: false,
  enableExport: false,
  exportProjname: "",
  enableExportMindmapButton: true,
  typeOfViewMap: 'mindMapView',
  typeOfOprationInFolder: { onExpand: null, onCollapse: null, onSelect: null, onUnselect: null, screenDataForCapture: null,addNewTestCase:false, addNewTestStepGroup: null,createNewTestSuit:null,reNamingOfTS:null,reNamingOfTestCase:null},
  selectedScreenOfStepSlice: [],
  oldModuleForReset: "",
  currentModuleId: "",
  currentid: "",
  isCreateProjectVisible: false,
  updateScreenModuleId:""
}

export const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    isCreateProjectVisible: (state, action) => {
      state.isCreateProjectVisible = action.payload
    },
    projectList: (state, action) => {
      state.projectList = action.payload
    },
    moduleList: (state, action) => {
      state.moduleList = action.payload
    },
    screenData: (state, action) => {
      state.screenData = action.payload
    },
    selectedProj: (state, action) => {
      state.selectedProj = action.payload
    },
    searchModule: (state, action) => {
      state.searchModule = action.payload
    },
    initEnEProj: (state, action) => {
      state.initEnEProj = action.payload
    },
    isEnELoad: (state, action) => {
      state.isEnELoad = action.payload
    },
    selectedModuleReducer: (state, action) => {
      state.selectedModule = action.payload
    },
    selectedModulelist: (state, action) => {
      state.selectedModulelist = action.payload
    },
    selectBoxState: (state, action) => {
      state.selectBoxState = action.payload
    },
    selectNodes: (state, action) => {
      state.selectNodes = action.payload
    },
    copyNodes: (state, action) => {
      state.copyNodes = action.payload
    },
    deletedNodes: (state, action) => {
      state.deletedNodes = action.payload
    },
    scenarioList: (state, action) => {
      state.scenarioList = action.payload
    },
    setImportData: (state, action) => {
      var res = action.payload
      return {
        ...state,
        selectedProj: res.selectProj,
        selectedModule: res.selectModule,
        screenData: res.screenData,
        moduleList: res.moduleList,
        importData: res.selectModule.importData
      }
    },
    unassignTask: (state, action) => {
      state.unassignTask = action.payload
    },
    toDeleteScenarios: (state, action) => {
      state.toDeleteScenarios = action.payload
    },
    AppType: (state, action) => {
      state.appType = action.payload
    },
    savedList: (state, action) => {
      state.savedList = action.payload
    },
    dontShowFirstModule: (state, action) => {
      state.dontShowFirstModule = action.payload
    },
    saveMindMap: (state, action) => {
      return {
        ...state,
        screenData: action.payload.screendata,
        deletedNodes: [],
        moduleList: action.payload.moduledata,
        selectedModule: action.payload.moduleselected,
        selectedModulelist: [],
        scenarioList: [],
        unassignTask: []
      }
    },
    ScrapeData: (state, action) => {
      state.ScrapeData = action.payload;
    },
    Cert: (state, action) => {
      state.cert = action.payload;
    },
    disableAction: (state, action) => {
      state.disableAction = action.payload;
    },
    disableAppend: (state, action) => {
      state.disableAppend = action.payload;
    },
    actionError: (state, action) => {
      state.actionError = action.payload;
    },
    WsData: (state, action) => {
      state.WsData = { ...state.WsData, ...action.payload };
    },
    wsdlError: (state, action) => {
      state.wsdlError = action.payload;
    },
    copiedTestCases: (state, action) => {
      state.copiedTestCases = action.payload;
    },
    TestCases: (state, action) => {
      state.TestCases = action.payload;
    },
    Modified: (state, action) => {
      state.Modified = action.payload;
    },
    SaveEnable: (state, action) => {
      state.SaveEnable = action.payload;
    },
    objValue: (state, action) => {
      state.objValue = action.payload
    },
    EnableExport: (state, action) => {
      state.enableExport = action.payload
    },
    ExportProjname: (state, action) => {
      state.exportProjname = action.payload
    },
    EnableExportMindmapButton: (state, action) => {
      state.enableExportMindmapButton = action.payload
    },
    ImpactAnalysisScreenLevel: (state, action) => {
      state.impactAnalysisScreenLevel = action.payload
    },
    CompareFlag: (state, action) => {
      state.compareFlag = action.payload
    },
    CompareObj: (state, action) => {
      state.compareObj = action.payload
    },
    CompareData: (state, action) => {
      state.compareData = action.payload
    },
    CompareElementSuccessful: (state, action) => {
      state.compareSuccessful = action.payload
    },
    AnalyzeScenario: (state, action) => {
      state.analyzeScenario = action.payload
    },
    ScenarioLevelImpact: (state, action) => {
      state.scenarioLevelImpact = action.payload
    },
    TypeOfViewMap: (state, action) => {
      state.typeOfViewMap = action.payload
    },
    SetOldModuleForReset: (state, action) => {
      state.oldModuleForReset = action.payload
    },
    SetCurrentModuleId: (state, action) => {
      state.currentModuleId = action.payload
    },
    SetCurrentId: (state, action) => {
      state.currentid = action.payload
    },
    typeOfOprationInFolder: (state, action) => {
      state.typeOfOprationInFolder = {
        ...state.typeOfOprationInFolder,
        ...action.payload
      }
    },
    selectedScreenOfStepSlice: (state, action) => {
      state.selectedScreenOfStepSlice = action.payload
    },
     setUpdateScreenModuleId:(state, action) =>{
      state.updateScreenModuleId = action.payload
    }

  }
})

// Action creators are generated for each case reducer function
export const { isCreateProjectVisible,projectList, moduleList, screenData,
  selectedProj,
  SetCurrentModuleId,
  SetCurrentId,
  searchModule,
  initEnEProj,
  isEnELoad,
  selectedModuleReducer,
  selectedModulelist,
  selectBoxState,
  selectNodes,
  copyNodes,
  deletedNodes,
  scenarioList,
  setImportData,
  unassignTask,
  toDeleteScenarios,
  appType,
  savedList, saveMindMap, ScrapeData, disableAction, copiedTestCases, disableAppend, actionError, WsData, wsdlError,
  Cert,
  TestCases,
  ImpactAnalysisScreenLevel,
  CompareData,
  CompareFlag,
  CompareObj,
  CompareElementSuccessful,
  Modified,
  SaveEnable,
  objValue,
  EnableExport,
  ExportProjname,
  EnableExportMindmapButton,
  dontShowFirstModule,
  AnalyzeScenario,
  ScenarioLevelImpact,
  TypeOfViewMap,
  SetOldModuleForReset,
  typeOfOprationInFolder,
  selectedScreenOfStepSlice,
  setUpdateScreenModuleId } = designSlice.actions

export default designSlice.reducer
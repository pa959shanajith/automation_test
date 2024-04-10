import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    progress: 0,
    roleSwitched: false,
    popup: false,
    showGenuisWindow: false,
    showSapGeniusWindow: false,
    geniusWindowProps: {},
    geniusSapWindowProps:{},
    showSmallPopup:false,
    showTrialVideo:false,
   geniusMigrate: false,
   migrateProject: "",
   allProjectsList:[]
}

export const globleSlice = createSlice({
    name: 'progressbar',
    initialState,
    reducers: {
        progress:(state, action) =>{
            state.progress = action.payload
         },
         roleSwitched:(state, action) =>{
            state.roleSwitched = action.payload
         },
         popup:(state, action) =>{
            state.popup = action.payload
         },
         showGenuis:(state, action) =>{
            state.showGenuisWindow = action.payload.showGenuisWindow 
            state.geniusWindowProps = action.payload.geniusWindowProps
         },
         showSapGenius:(state, action) =>{
            state.showSapGeniusWindow = action.payload.showSapGeniusWindow
            state.geniusSapWindowProps = action.payload.geniusSapWindowProps
         },
         showGenuisWindow:(state, action) =>{
            state.showGenuisWindow = action.payload
         },
         geniusWindowProps:(state, action) =>{
            state.geniusWindowProps = action.payload
         },
         showSapGeniusWindow:(state, action) =>{
            state.showSapGeniusWindow = action.payload
         },
         geniusSapWindowProps:(state, action) =>{
            state.geniusSapWindowProps = action.payload
         },
         geniusMigrate:(state,action)=>{
            state.geniusMigrate = action.payload
         },
         showSmallPopup:(state, action) =>{
            state.showSmallPopup = action.payload
         },
         showTrialVideo:(state, action) =>{
            state.showTrialVideo = action.payload
         },
       migrateProject: (state, action) => {
          state.migrateProject = action.payload;
       },
       allProjectsList: (state, action) => {
          state.allProjectsList = action.payload;
       }
    }})


    export const {progress,roleSwitched,popup,showGenuis,showGenuisWindow,showSapGenius,showSapGeniusWindow,geniusWindowProps,geniusSapWindowProps,showSmallPopup,showTrialVideo, geniusMigrate, migrateProject, allProjectsList} = globleSlice.actions

export default globleSlice.reducer
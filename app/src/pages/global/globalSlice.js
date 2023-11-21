import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    progress: 0,
    roleSwitched: false,
    popup: false,
    showGenuisWindow: false,
    geniusWindowProps: {},
    showSmallPopup:false,
    showTrialVideo:false,
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
         showGenuisWindow:(state, action) =>{
            state.showGenuisWindow = action.payload
         },
         geniusWindowProps:(state, action) =>{
            state.geniusWindowProps = action.payload
         },
         showSmallPopup:(state, action) =>{
            state.showSmallPopup = action.payload
         },
         showTrialVideo:(state, action) =>{
            state.showTrialVideo = action.payload
         },
    }})


    export const {progress,roleSwitched,popup,showGenuis,showGenuisWindow,geniusWindowProps,showSmallPopup,showTrialVideo} = globleSlice.actions

export default globleSlice.reducer
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reportData: { hasData: false },
    blockUi: "",
    showOverlay: false,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        updateReportData: (state, action) => {
            state.reportData = action.payload;
            state.screenShotPath = "";
            state.stepCase = {};
        },
        resetDetails: (state) => {
            state.reportData = { hasData: false };
            state.blockUi = "";
        },
        showOverlay: (state) => {
            state.showOverlay = true;
        },
        hideOverlay: (state) => {
            state.showOverlay = false;
        },
    },
});

export const { updateReportData, resetDetails, showOverlay,hideOverlay} = appSlice.actions;

export default appSlice.reducer;

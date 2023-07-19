import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    screenType: '',
    intergrationLogin:{
        username:'priyanka.r@slkgroup.com',
        password:'B8RUqqKt8B28MSz9zq1Q14AD',
        url:'https://mnb.atlassian.net'
    },
    selectedProject:'',
    selectedIssue:''
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
        } 
    }
})
// export all the action creators
export const { 
    screenType,
    IntergrationLogin,
    resetIntergrationLogin,
    resetScreen,
    selectedProject,
    selectedIssue } = settingSlice.actions;
// export all the reducer 
export default settingSlice.reducer;
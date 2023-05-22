import {createSlice} from '@reduxjs/toolkit'

export const loginSlice=createSlice({
    name:'login',
    initialState:{
        isLoggedIn: false,
    },
    reducers:{
        login:(state)=>{
            state.isLoggedIn = true;
        },
        logout:(state)=>{
            state.isLoggedIn = false;
        }
    }
})
// export all the action creators
export const loginSliceActions = loginSlice.actions;
// export all the reducer 
export default loginSlice.reducer;
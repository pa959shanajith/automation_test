import {createSlice} from '@reduxjs/toolkit'
export const loginSlice=createSlice({
    name:'login',
    initialState:{

    },
    reducers:{
login:()=>{

}
    }
})
// export all the action creators
export const {login} = loginSlice.actions;
// export all the reducer 
export default loginSlice.reducer;
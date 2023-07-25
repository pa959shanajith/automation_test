import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    header: '',
    screen: '',

}

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        Header: (state, action) => {
            state.header = action.payload
        },
        SetScreen: (state, action) => {
            state.screen = action.payload
        }

    }
})


export const AdminActions = adminSlice.actions

export default adminSlice.reducer
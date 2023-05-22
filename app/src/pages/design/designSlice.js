import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: "",
}

export const counterSlice = createSlice({
  name: 'mindmap',
  initialState,
  reducers: {
    mindmapLableNames: (state, action) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { mindmapLableNames } = counterSlice.actions

export default counterSlice.reducer
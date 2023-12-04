import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  copiedCells: {
    type: '',
    cells: [],
  },
};

const utilSlice = createSlice({
  name: 'utilitySlice', 
  initialState,
  reducers: {
    setCopyCells: (state, action) => {
      state.copiedCells = action.payload;
    },
  },
});

export const { setCopyCells } = utilSlice.actions;
export default utilSlice.reducer;

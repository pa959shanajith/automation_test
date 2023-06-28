// slice for verticleComponent component to update steps
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 value: 0,
 id:''

}

export const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    updateSteps: (state, action) => {
      state.value=action.payload
    },
    getStep: (state, action) => {
      state.id=action.payload
    },
  },

});

export const { updateSteps,getStep } = stepsSlice.actions;

export default stepsSlice.reducer;

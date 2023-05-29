// slice for verticleComponent component to update steps
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 value: 0

}

export const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    updateSteps: (state, action) => {
      state.value=action.payload
    },
  },
});

export const { updateSteps } = stepsSlice.actions;

export default stepsSlice.reducer;

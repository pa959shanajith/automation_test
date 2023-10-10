import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../App";

const initialState = {
  loading: false,
  poolData: [],
  ICEdata:[],
  error: "",
};

const getPoolsexe = createAsyncThunk("config/getPoolsexe", async (args) => {
  return await axios(`${url}/getPools`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      poolid: "",
      projectids: [""],
    },
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});
const getICE = createAsyncThunk("config/getICE", async (args) => {
    return await axios(`${url}/getICE_list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        poolid: "",
        projectids: [""],
      },
      credentials: "include",
    })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  });

export { getPoolsexe ,getICE};

const configurePageSlice = createSlice({
  name: "configureSetup",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getPoolsexe.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPoolsexe.fulfilled, (state, action) => {
      state.loading = false;
      state.poolData = action.payload;
      state.error = "";
    });
    builder.addCase(getPoolsexe.rejected, (state, action) => {
      state.loading = false;
      state.poolData = [];
      state.error = action.error.message;
    });
  },
  extraReducers: (builder) => {
    builder.addCase(getICE.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getICE.fulfilled, (state, action) => {
      state.loading = false;
      state.ICEdata = action.payload;
      state.error = "";
    });
    builder.addCase(getICE.rejected, (state, action) => {
      state.loading = false;
      state.ICEdata = [];
      state.error = action.error.message;
    });
  },
});

export default configurePageSlice.reducer;

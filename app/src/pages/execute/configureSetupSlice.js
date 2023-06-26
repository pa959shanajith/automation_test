import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { url } from "../../App";

const initialState = {
  loading: false,
  projects: [],
  configureData: {},
  requiredFeilds: {},
  testsuiteData: {},
  testsuiteId: "",
  avoAgentAndGrid: {
    avoagents: [
      {
        Hostname: "WSLKCMP6F-541",
        _id: "6412bcdd3b886ffbc86bf061",
        createdon: "3/16/2023, 6:53:17 AM",
        currentIceCount: "0",
        host: "sony.avoautomation.com",
        icecount: 4,
        recentCall: "5/16/2023, 5:57:15 AM",
        status: "inactive",
      },
      {
        Hostname: "SIB-LT105551B",
        _id: "643651c1f27e024480c1d3eb",
        createdon: "4/12/2023, 6:37:53 AM",
        currentIceCount: "0",
        host: "test1.avoautomation.com",
        icecount: 2,
        recentCall: "5/10/2023, 2:06:09 AM",
        status: "active",
      },
      {
        Hostname: "SIBLT112189",
        _id: "645c5316168533cb8bafd266",
        createdon: "5/11/2023, 2:29:42 AM",
        currentIceCount: "0",
        host: "test1.avoautomation.com",
        icecount: 5,
        recentCall: "5/17/2023, 6:01:14 AM",
        status: "active",
      },
    ],
    avogrids: [
      {
        _id: "64228ac0dda41c51fb256095",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "wAD",
      },
      {
        _id: "64228ac7dda41c51fb256096",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "SDVCSD",
      },
      {
        _id: "64228acedda41c51fb256097",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "SDFVC",
      },
      {
        _id: "64228ad7dda41c51fb256098",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "ASDFCAWS",
      },
      {
        _id: "64228adddda41c51fb256099",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "ASDCA",
      },
      {
        _id: "64228ae2dda41c51fb25609a",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "ASDC",
      },
      {
        _id: "64228aeadda41c51fb25609b",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "BVWSR",
      },
      {
        _id: "64228aefdda41c51fb25609c",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "WSEF",
      },
      {
        _id: "64228af6dda41c51fb25609d",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 1,
          },
        ],
        name: "EDFC",
      },
      {
        _id: "642bce1b774fd4ef325eb5a7",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 4,
          },
        ],
        name: "shiva",
      },
      {
        _id: "6437e51e4127a7b20d209d11",
        agents: [
          {
            Hostname: "WSLKCMP6F-541",
            _id: "6412bcdd3b886ffbc86bf061",
            icecount: 3,
          },
          {
            Hostname: "SIB-LT105551B",
            _id: "643651c1f27e024480c1d3eb",
            icecount: 2,
          },
        ],
        name: "ERp",
      },
    ],
  },
  error: "",
};

const getProjects = createAsyncThunk("config/fetchProjects", async () => {
  return await axios(`${url}/fetchProjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: { readme: "projects" },
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

const getModules = createAsyncThunk("config/fetchModules", async (args) => {
  return await axios(`${url}/fetchModules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      tab: "tabAssign",
      projectid: !!args?.length ? args[0]?._id : "",
      cycleid: !!args?.length ? args[0]?.releases[0]?.cycles[0]?._id : "",
    },
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

const getAvoAgentAndAvoGrid = createAsyncThunk(
  "config/avoAgentAndAvoGrid",
  async () => {
    return await axios(`${url}/getAvoAgentAndAvoGridList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { query: "all" },
    })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  }
);

const readTestSuite = createAsyncThunk("config/readTestSuite", async (args) => {
  return await axios(`${url}/readTestSuite_ICE`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      param: "readTestSuite_ICE",
      readTestSuite: args.dataParams,
      fromFlag: "mindmaps",
    },
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

const storeConfigureKey = createAsyncThunk(
  "config/storeConfigureKey",
  async (args) => {
    return await axios(`${url}/storeConfigureKey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        executionData: args
      },
      credentials: "include",
    })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  }
);

const updateTestSuite = createAsyncThunk("config/updateTestSuite", async (args) => {
  return await axios(`${url}/updateTestSuite_ICE`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: args,
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

const testSuitesScheduler_ICE = createAsyncThunk("config/testSuitesScheduler_ICE", async (args) => {
  return await axios(`${url}/testSuitesScheduler_ICE`, {
    method: 'POST',
    headers: {
    'Content-type': 'application/json',
    },
    data: args,
    credentials: 'include'
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

export {
  getProjects,
  getModules,
  getAvoAgentAndAvoGrid,
  readTestSuite,
  updateTestSuite,
  storeConfigureKey,
  testSuitesScheduler_ICE
};

const configureSetupSlice = createSlice({
  name: "configureSetup",
  initialState,
  reducers: {
    checkRequired: (state, action) => {
      state.requiredFeilds = { ...state.requiredFeilds, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProjects.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
      state.error = "";
    });
    builder.addCase(getProjects.rejected, (state, action) => {
      state.loading = false;
      state.avoAgentAndGrid = {};
      state.error = action.error.message;
    });
    builder.addCase(getModules.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getModules.fulfilled, (state, action) => {
      state.loading = false;
      state.configureData = action.payload;
      state.error = "";
    });
    builder.addCase(getModules.rejected, (state, action) => {
      state.loading = false;
      state.avoAgentAndGrid = {};
      state.error = action.error.message;
    });
    builder.addCase(getAvoAgentAndAvoGrid.fulfilled, (state, action) => {
      // action.payload.avoagents.unshift({
      //   name: "Any Agent",
      //   _id: "1111",
      // });
      state.loading = false;
      state?.avoAgentAndGrid?.avoagents.unshift({
        name: "Any Agent",
        _id: "1111",
      });
      // state.avoAgentAndGrid = action.payload;
      state.avoAgentAndGrid = state.avoAgentAndGrid;
      state.error = "";
    });
    builder.addCase(getAvoAgentAndAvoGrid.rejected, (state, action) => {
      state.avoAgentAndGrid = {};
      state.error = action.error.message;
    });
    builder.addCase(readTestSuite.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(readTestSuite.fulfilled, (state, action) => {
      state.loading = false;
      state.testsuiteData = action.payload;
      state.testsuiteId = action?.meta?.arg?.dataId;
      state.error = "";
    });
    builder.addCase(readTestSuite.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(updateTestSuite.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateTestSuite.fulfilled, (state, action) => {
      state.loading = false;
      // state.testsuiteData = action.payload;
      // state.testsuiteId = action?.meta?.arg?.dataId;
      state.error = "";
    });
    builder.addCase(updateTestSuite.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(storeConfigureKey.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(storeConfigureKey.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
    });
    builder.addCase(storeConfigureKey.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(testSuitesScheduler_ICE.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(testSuitesScheduler_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
    });
    builder.addCase(testSuitesScheduler_ICE.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default configureSetupSlice.reducer;
export const { checkRequired } = configureSetupSlice.actions;

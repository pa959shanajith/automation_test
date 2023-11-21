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
    avoagents: [],
    avogrids: [],
  },
  error: "",
  scheduledList: [],
  scheduledStatusList: [],
  scheduledStatus: false,
  setupExists: ""
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

const testSuitesSchedulerRecurring_ICE = createAsyncThunk("config/testSuitesSchedulerRecurring_ICE", async (args) => {
  return await axios(`${url}/testSuitesSchedulerRecurring_ICE`, {
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

const cancelScheduledJob_ICE = createAsyncThunk("config/cancelScheduledJob_ICE", async (args) => {
  return await axios(`${url}/cancelScheduledJob_ICE`, {
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

const getScheduledDetails_ICE = createAsyncThunk("config/getScheduledDetails_ICE", async (args) => {
  return await axios(`${url}/getScheduledDetails_ICE`, {
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

const getScheduledDetailsOnDate_ICE = createAsyncThunk(
  "config/getScheduledDetailsOnDate_ICE",
  async (args) => {
    return await axios(`${url}/getScheduledDetailsOnDate_ICE`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      data: args,
      credentials: "include",
    })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  }
);

export {
  getProjects,
  getModules,
  getAvoAgentAndAvoGrid,
  readTestSuite,
  updateTestSuite,
  storeConfigureKey,
  testSuitesScheduler_ICE,
  testSuitesSchedulerRecurring_ICE,
  cancelScheduledJob_ICE,
  getScheduledDetails_ICE,
  getScheduledDetailsOnDate_ICE
};

const configureSetupSlice = createSlice({
  name: "configureSetup",
  initialState,
  reducers: {
    checkRequired: (state, action) => {
      state.requiredFeilds = { ...state.requiredFeilds, ...action.payload };
    },
    setScheduleStatus: (state) => {
      state.scheduledStatus = false;
    },
    clearErrorMSg: (state) => {
      state.error = "";
      state.setupExists = "";
    }
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
      state.projects = [];
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
      state.configureData = {};
      state.error = action.error.message;
    });
    builder.addCase(getAvoAgentAndAvoGrid.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAvoAgentAndAvoGrid.fulfilled, (state, action) => {
      action.payload.avoagents.unshift({
        name: "Any Agent",
        _id: "1111",
      });
      state.loading = false;
      state.avoAgentAndGrid = action.payload;
      state.error = "";
    });
    builder.addCase(getAvoAgentAndAvoGrid.rejected, (state, action) => {
      state.avoAgentAndGrid = {
        avoagents: [],
        avogrids: [],
      };
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
      state.setupExists = "";
    });
    builder.addCase(storeConfigureKey.fulfilled, (state, action) => {
      state.setupExists = action?.payload;
      state.loading = false;
      state.error = "";
    });
    builder.addCase(storeConfigureKey.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.setupExists = "";
    });
    builder.addCase(testSuitesScheduler_ICE.pending, (state) => {
      state.loading = true;
      state.scheduledStatus = false;
    });
    builder.addCase(testSuitesScheduler_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.scheduledStatus = action?.payload;
      state.error = "";
    });
    builder.addCase(testSuitesScheduler_ICE.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(testSuitesSchedulerRecurring_ICE.pending, (state) => {
      state.scheduledStatus = false;
      state.loading = true;
    });
    builder.addCase(testSuitesSchedulerRecurring_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.scheduledStatus = action?.payload;
      state.error = "";
    });
    builder.addCase(testSuitesSchedulerRecurring_ICE.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(cancelScheduledJob_ICE.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(cancelScheduledJob_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
    });
    builder.addCase(cancelScheduledJob_ICE.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(getScheduledDetails_ICE.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getScheduledDetails_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.scheduledList = action.payload;
      state.error = "";
    });
    builder.addCase(getScheduledDetails_ICE.rejected, (state, action) => {
      state.loading = false;
      state.scheduledList = [];
      state.error = action.error.message;
    });
    builder.addCase(getScheduledDetailsOnDate_ICE.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getScheduledDetailsOnDate_ICE.fulfilled, (state, action) => {
      state.loading = false;
      state.scheduledStatusList = action.payload;
      state.error = "";
    });
    builder.addCase(getScheduledDetailsOnDate_ICE.rejected, (state, action) => {
      state.loading = false;
      state.scheduledStatusList = [];
      state.error = action.error.message;
    });
  },
});

export default configureSetupSlice.reducer;
export const { checkRequired } = configureSetupSlice.actions;
export const { setScheduleStatus } = configureSetupSlice.actions;
export const { clearErrorMSg } = configureSetupSlice.actions;

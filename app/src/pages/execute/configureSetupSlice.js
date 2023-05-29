import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  loading: false,
  projects: [],
  configureData: {},
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

const getProjects = createAsyncThunk("config/fetchProjects", async (args) => {
  return await axios("https://localhost:8443/fetchProjects", {
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
  return await axios("https://localhost:8443/fetchModules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      tab: "tabAssign",
      projectid: args[0]?._id,
      cycleid: args[0]?.releases[0]?.cycles[0]?._id,
    },
    credentials: "include",
  })
    .then((response) => response.data)
    .catch((err) => console.log(err));
});

const getAvoAgentAndAvoGrid = createAsyncThunk(
  "config/avoAgentAndAvoGrid",
  async () => {
    return await axios("https://localhost:8443/getAvoAgentAndAvoGridList", {
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

const storeConfigureKey = createAsyncThunk(
  "config/storeConfigureKey",
  async () => {
    return await axios("https://localhost:8443/storeConfigureKey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        executionData: {
          type: "",
          poolid: "",
          targetUser: "",
          source: "task",
          exectionMode: "serial",
          executionEnv: "default",
          browserType: ["2", "8"],
          configurename: "Module_4",
          executiontype: "asynchronous",
          selectedModuleType: "normalExecution",
          configurekey: "fc0f3cd1-0ebb-4620-8f74-5cdb0e44d8f6",
          isHeadless: true,
          avogridId: "",
          avoagents: [],
          integration: {
            alm: { url: "", username: "", password: "" },
            qtest: { url: "", username: "", password: "", qteststeps: "" },
            zephyr: { url: "", username: "", password: "" },
          },
          batchInfo: [
            {
              scenarioTaskType: "disable",
              testsuiteName: "Module_2",
              testsuiteId: "646c554f5218324709350cfe",
              batchname: "",
              versionNumber: 0,
              appType: "Web",
              domainName: "Banking",
              projectName: "Banking_Project",
              projectId: "646b3f8495cef4ee0ababfdf",
              releaseId: "release1",
              cycleName: "cycle1",
              cycleId: "646b3f8495cef4ee0ababfde",
              scenarionIndex: [1],
              suiteDetails: [
                {
                  condition: 0,
                  dataparam: [""],
                  scenarioName: "Scenario_check",
                  scenarioId: "646efee42d7bb349c1ab2f19",
                  accessibilityParameters: [],
                },
              ],
            },
          ],
          donotexe: { current: { "646c554f5218324709350cfe": [1] } },
          scenarioFlag: false,
          isExecuteNow: false,
        },
      },
      credentials: "include",
    })
      .then((response) => response.data)
      .catch((err) => console.log(err));
  }
);

export { getProjects, getModules, getAvoAgentAndAvoGrid, storeConfigureKey };

const configureSetupSlice = createSlice({
  name: "configureSetup",
  initialState,
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
    builder.addCase(storeConfigureKey.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(storeConfigureKey.fulfilled, (state, action) => {
      state.loading = false;
      // state.configureData = action.payload;
      state.error = "";
    });
    builder.addCase(storeConfigureKey.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export default configureSetupSlice.reducer;

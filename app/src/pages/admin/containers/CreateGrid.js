import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import {
  ScrollBar,
  Messages as MSG,
  setMsg,
  VARIANT,
  IntegrationDropDown,
  ScreenOverlay,
} from "../../global";
import { saveAvoGrid, fetchAvoAgentAndAvoGridList } from "../api";
import { useSelector } from "react-redux";
import {
  SearchDropdown,
  TextField,
  Toggle,
  MultiSelectDropdown,
  CheckBox,
  DetailsList,
  SpinInput,
  Label,
  SearchBox,
} from "@avo/designcomponents";
import "../styles/Agents.scss";
import { Selection } from "@fluentui/react";

const CreateGrid = ({
  currentGrid,
  setCurrentGrid,
  showMessageBar,
  setLoading,
}) => {
  const [gridName, setGridName] = useState(currentGrid.name);
  const [searchText, setSearchText] = useState("");
  const [dataUpdated, setDataUpdated] = useState(false);
  const [agentData, setAgentData] = useState([]);
  const [filteredList, setFilteredList] = useState(agentData);
  let selectedAgents = undefined;
  let newselectedAgentsNumbers = 0;

  let firstRenderCheck = true;
  const [selection] = useState(
    new Selection({
      onSelectionChanged: () => {
        if (
          firstRenderCheck &&
          selection.getSelectedCount() === 0 &&
          currentGrid.agents.length > 0
        ) {
          for (let i = 0; i < newselectedAgentsNumbers; i++) {
            selection.setIndexSelected(i, true);
          }
          firstRenderCheck = false;
        }
        selectedAgents = selection.getSelection();
      }
    })
  );
  const onClientIceCountChange = (operation, name, newVal = "") => {
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);

    if (operation === "add" || (operation === "sub" && parseInt(agentData[index].icecount) > 1))
    {
        updatedData[index] = {
          ...agentData[index],
          icecount:
            operation === "add"
              ? parseInt(agentData[index].icecount) + 1
              : parseInt(agentData[index].icecount) - 1,
        };
        setAgentData([...updatedData]);
        let filteredItems = updatedData.filter(
          (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        );
        setFilteredList(filteredItems);
    } else if (operation === "update" && newVal > 0) {
      updatedData[index] = { ...agentData[index], icecount: parseInt(newVal) };
      setAgentData([...updatedData]);
      let filteredItems = updatedData.filter(
        (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      );
      setFilteredList(filteredItems);
    }
  };

  const handleSearchChange = (value) => {
    let filteredItems = agentData.filter(
      (item) => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    setFilteredList(filteredItems);
    setSearchText(value);
  };
  const agentListHeader = [
    {
      fieldName: "checkbox",
      key: "0",
      minWidth: 30,
      maxWidth: 50,
      name: "",
    },
    {
      fieldName: "agent",
      isResizable: true,
      key: "1",
      minWidth: 200,
      maxWidth: 750,
      name: "Agents",
    },
    {
      fieldName: "clientCount",
      key: "2",
      minWidth: 200,
      maxWidth: 500,
      name: "Avo Client Count",
    },
    {
      fieldName: "status",
      key: "3",
      minWidth: 200,
      maxWidth: 500,
      name: "Status",
    },
  ];
  useEffect(() => {
    currentGrid.name === gridName ? setDataUpdated(false) : setDataUpdated(true);
    if(gridName.trim().length > 0) setGridName(gridName);
    else setGridName('');
  }, [gridName]);

  useEffect(() => {
    (async () => {
      setLoading("Loading...");
      const agentList = await fetchAvoAgentAndAvoGridList({
        query: "avoAgentList",
      });

      if (agentList.error) {
        if (agentList.error.CONTENT) {
          setMsg(MSG.CUSTOM(agentList.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(MSG.CUSTOM("Error While Fetching Agent List", VARIANT.ERROR));
        }
      } else {
        if (currentGrid.agents.length > 0) {
          let selectedAgentsList = [];
          let unSelectedAgentsList = [];

          const selectedAgentnameList = currentGrid.agents.map(
            (agent) => agent.Hostname
          );

          agentList.avoagents.forEach((agent) => {
            if (selectedAgentnameList.includes(agent.Hostname)) {
              selectedAgentsList.push(agent);
            } else {
              unSelectedAgentsList.push(agent);
            }
          });

          let Agents = currentGrid.agents;
          const getIceCount = (hostname) => {
            for (let index = 0; index < Agents.length; index++) {
              if (Agents[index].Hostname === hostname) {
                return Agents[index].icecount;
              }
            }
          };

          setAgentData([
            ...selectedAgentsList.map((agent) => ({
              ...agent,
              isSelected: true,
              name: agent.Hostname,
              icecount: getIceCount(agent.Hostname),
              state: "idle",
            })),

            ...unSelectedAgentsList.map((agent) => ({
              ...agent,
              isSelected: false,
              name: agent.Hostname,
              state: "idle",
            })),
          ]);
        } else {
          setAgentData(
            agentList.avoagents.map((agent) => ({
              ...agent,
              isSelected: false,
              name: agent.Hostname,
              state: "idle",
            }))
          );
        }
      }
      setLoading(false);
    })();
  }, []);

  const showLegend = (state, name) => {
    return (
      <div className="agent_state">
        <div className={`agent_state__div agent_state__${state}`}></div>
        <p>{name}</p>
      </div>
    );
  };

 

  const handleConfigSave = async () => {
    (async () => {
      setLoading("Loading...");
      let requestData = {};

      if (currentGrid._id !== "" && currentGrid.name !== "") {
          let updateAgentData = {
            action: "update",
            value: {
              name: gridName.trim(),
              _id: currentGrid._id,
              agents: agentData
                .filter((agent) => agent.isSelected)
                .map((agent) => ({
                  Hostname: agent.Hostname,
                  icecount: agent.icecount,
                  _id: agent._id,
                })),
            },
          };
          requestData = updateAgentData;
      } else {
          let createAgentData = {
            action: "create",
            value: {
              name: gridName.trim(),
              agents: agentData
                .filter((agent) => agent.isSelected)
                .map((agent) => ({
                  Hostname: agent.name,
                  icecount: agent.icecount,
                  _id: agent._id,
                })),
            },
          };
          requestData = createAgentData;
        }
    if(requestData.value.agents.length < 1) {
      setMsg(MSG.CUSTOM("Please select atleast one Agent",VARIANT.ERROR));
    }
    else{
      const storeConfig = await saveAvoGrid(requestData);
      if (storeConfig !== "success") {
        if (storeConfig.error && storeConfig.error.CONTENT) {
          setMsg(MSG.CUSTOM(storeConfig.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(MSG.CUSTOM("Something Went Wrong", VARIANT.ERROR));
        }
      } else {
        showMessageBar("Grid Created Successfully", "SUCCESS");
        setCurrentGrid(false);
      }
    }
    setLoading(false);
    })();
  };
  const onAgentSelection = (name) => {
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);
    updatedData[index] = {
      ...agentData[index],
      isSelected: !agentData[index].isSelected,
    };
    setAgentData([...updatedData]);

    let filteredItems = updatedData.filter(
      (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    );
    setFilteredList(filteredItems);
  };

  return (
    <>
      <div className="page-taskName">
        <span data-test="page-title-test" className="taskname">
          {/* { props.currentIntegration.name === '' ? 'Create New' : 'Update'} Grid */}
          Create New Grid
        </span>
      </div>
      <div className="api-ut__btnGroup">
        {/* <button data-test="submit-button-test" onClick={() => console.log()} >{props.currentIntegration.name == '' ? 'Save' : 'Update'}</button> */}
        <button data-test="submit-button-test" disabled={!gridName} onClick={handleConfigSave}>
          Save
        </button>
        <button
          data-test="submit-button-test"
          onClick={() => setCurrentGrid(false)}
        >
          {dataUpdated ? "Cancel" : "Back"}
        </button>
        {agentData.length > 0 && (
          <>
            <div className="searchBoxInput">
              <SearchBox
                placeholder="Search"
                width="20rem"
                value={searchText}
                onClear={() => handleSearchChange("")}
                onChange={(event) =>
                  event &&
                  event.target &&
                  handleSearchChange(event.target.value)
                }
              />
            </div>
          </>
        )}
        <div className="devOps_config_name">
          <span className="api-ut__inputLabel_text" >Avo Grid Name :</span>
          <span className="api-ut__inputLabel">
            <TextField
              value={gridName}
              width="150%"
              label=""
              standard={true}
              onChange={(event) => { setGridName(event.target.value) } }
              autoComplete="off"
              placeholder="Enter Grid Name"
            />
          </span>
        </div>
      </div>
      <div>
        <div className="agent_state__legends_grid">
          {showLegend("inactive", "Inactive")}
          {showLegend("idle", "Active - Idle")}
          {showLegend("in-progress", "Active - In Progress")}
          {showLegend("busy", "Active - Busy")}
          {showLegend("offline", "Offline")}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          width: "98%",
          height: "-webkit-fill-available",
          marginTop: "1.5%",
        }}
      >    
        <DetailsList
          columns={agentListHeader}
          items={(searchText.length > 0 ? filteredList : agentData).map(
            (agent) => ({
              checkbox: (
                <CheckBox
                  checked={agent.isSelected}
                  onChange={() => onAgentSelection(agent.name)}
                />
              ),
              agent: (
                <div className="agent_state">
                  <ReactTooltip
                    id={agent.name}
                    effect="solid"
                    backgroundColor="black"
                  />
                  <div
                    data-for={agent.name}
                    data-tip={agent.state}
                    className={`agent_state__div agent_state__${agent.state}`}
                  ></div>
                  <p>{agent.name}</p>
                </div>
              ),
              clientCount: (
                <SpinInput
                  disabled={agent.status !== "active"}
                  value={agent.icecount}
                  onChange={(ev) =>
                    onClientIceCountChange(
                      "update",
                      agent.name,
                      ev.target.value
                    )
                  }
                  onDecrement={() => onClientIceCountChange("sub", agent.name)}
                  onIncrement={() => onClientIceCountChange("add", agent.name)}
                  width="5%"
                />
              ),
              status: (
                <div className="detailslist_status">
                  <p>{agent.status}</p>
                </div>
              ),
            })
          )}
          selection={selection}
          layoutMode={1}
          selectionMode={0}
          variant="variant-two"
        />
      </div>
    </>
  );
};

export default CreateGrid;

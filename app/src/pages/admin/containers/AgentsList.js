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
import { fetchAvoAgentAndAvoGridList, saveAvoAgent } from "../api";
import { useSelector } from "react-redux";
import {
  SearchDropdown,
  TextField,
  Toggle,
  MultiSelectDropdown,
  CheckBox,
  DetailsList,
  SpinInput,
  SearchBox,
  SmallCard,
} from "@avo/designcomponents";

// import classes from "../styles/DevOps.scss";
import "../styles/Agents.scss";
import { Selection } from "@fluentui/react";
// import "../styles/DevOps.scss";
const AgentsList = ({ setLoading, setShowConfirmPop, showMessageBar }) => {
  const [searchText, setSearchText] = useState("");
  const [isDataUpdated, setIsDataUpdated] = useState(false);

  const [agentData, setAgentData] = useState([]);
  const [originalAgentData, setOriginalAgentData] = useState([]);

  const onClientIceCountChange = (operation, name, newVal = "") => {
    setIsDataUpdated(true);
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);
    if (
      operation === "add" ||
      (operation === "sub" && agentData[index].icecount > 1)
    ) {
      updatedData[index] = {
        ...agentData[index],
        icecount:
          operation === "add"
            ? agentData[index].icecount + 1
            : agentData[index].icecount - 1,
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
  const onAgentToggle = (name) => {
    setIsDataUpdated(true);
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);
    updatedData[index] = {
      ...agentData[index],
      status: agentData[index].status === "active" ? "inactive" : "active",
    };
    setAgentData([...updatedData]);
    
    let filteredItems = updatedData.filter(
      (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    );
    setFilteredList(filteredItems);
  };
  const onConfirmDeleteAgent = (name) => {
    setIsDataUpdated(true);
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);
    updatedData.splice(index, 1);
    setAgentData([...updatedData]);

    let filteredItems = updatedData.filter(
      (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
    );
    setFilteredList(filteredItems);

    setShowConfirmPop(false);
    showMessageBar(
      `${name} Agent Deleted. Please Save to reflect the changes`,
      "SUCCESS"
    );
  };
  const deleteAgent = (name) => {
    setIsDataUpdated(true);
    setShowConfirmPop({
      title: "Delete Avo Agent",
      content: (
        <p>
          Are you sure, you want to delete <b>{name}</b> Agent?
        </p>
      ),
      onClick: () => {
        onConfirmDeleteAgent(name);
      },
    });
  };
  const agentListHeader = [
    {
      data: {
        isSort: true,
      },
      fieldName: "agent",
      isResizable: true,
      isSortedDescending: true,
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
    {
      fieldName: "deleteIcon",
      key: "3",
      minWidth: 30,
      maxWidth: 30,
      name: "",
    },
  ];
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
        console.log(agentList);
        setOriginalAgentData(
          agentList.avoagents.map((agent) => ({
            ...agent,
            name: agent.Hostname,
            state: "idle",
          }))
        );
        setAgentData(
          agentList.avoagents.map((agent) => ({
            ...agent,
            name: agent.Hostname,
            state: "idle",
          }))
        );
      }
      setLoading(false);
    })();
  }, []);
  const handleAgentsSave = () => {
    (async () => {
      setLoading("Loading...");
      let requestData = [];
      for (
        let originalAgentIndex = 0;
        originalAgentIndex < originalAgentData.length;
        originalAgentIndex++
      ) {
        if (
          agentData.some(
            (agent) => agent.name === originalAgentData[originalAgentIndex].name
          )
        ) {
          for (
            let agentIndex = 0;
            agentIndex < agentData.length;
            agentIndex++
          ) {
            if (
              agentData[agentIndex].name ===
                originalAgentData[originalAgentIndex].name &&
              (agentData[agentIndex].icecount !==
                originalAgentData[originalAgentIndex].icecount ||
                agentData[agentIndex].status !==
                  originalAgentData[originalAgentIndex].status)
            ) {
              let updatedAgentValue = {
                action: "update",
                value: {
                  _id: agentData[agentIndex]._id,
                  icecount: agentData[agentIndex].icecount,
                  status: agentData[agentIndex].status,
                },
              };
              requestData.push(updatedAgentValue);
            }
          }
        } else {
          requestData.push({
            action: "delete",
            value: {
              _id: originalAgentData[originalAgentIndex]._id,
            },
          });
        }
      }
      if (requestData.length > 0) {
        setIsDataUpdated(true);
        const storeConfig = await saveAvoAgent(requestData);
        if (storeConfig !== "success") {
          if (storeConfig.error && storeConfig.error.CONTENT) {
            setMsg(MSG.CUSTOM(storeConfig.error.CONTENT, VARIANT.ERROR));
          } else {
            setMsg(MSG.CUSTOM("Something Went Wrong", VARIANT.ERROR));
          }
        } else {
          showMessageBar("Agents List updated successfully", "SUCCESS");
          setIsDataUpdated(false);
        }
      } else {
        setIsDataUpdated(false);
      }
      setLoading(false);
    })();
  };

  const [filteredList, setFilteredList] = useState(agentData);
  const handleSearchChange = (value) => {
    let filteredItems = agentData.filter(
      (item) => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
    );
    setFilteredList(filteredItems);
    setSearchText(value);
  };
  const showLegend = (state, name) => {
    return (
      <div className="agent_state">
        <div className={`agent_state__div agent_state__${state}`}></div>
        <p>{name}</p>
      </div>
    );
  };

  return (
    <>
      <div className="page-taskName">
        <span data-test="page-title-test" className="taskname">
          Manage Agents
        </span>
      </div>
      <div
        className="api-ut__btnGroup__agent">
        <div className="agent_state__legends">
          {showLegend("inactive", "Inactive")}
          {showLegend("idle", "Active - Idle")}
          {showLegend("in-progress", "Active - In Progress")}
          {showLegend("busy", "Active - Busy")}
          {showLegend("offline", "Offline")}
        </div>
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
        <button
          data-test="submit-button-test"
          onClick={handleAgentsSave}
          disabled={!isDataUpdated}
        >
          Save
        </button>
      </div>
      <div style={{ position: "absolute", width: "100%", height: "68%" }}>
        <DetailsList
          columns={agentListHeader}
          items={(searchText.length > 0 ? filteredList : agentData).map(
            (agent, index) => ({
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
                  onChange={(ev, newVal) =>
                    onClientIceCountChange("update", agent.name, newVal)
                  }
                  onDecrement={() => onClientIceCountChange("sub", agent.name)}
                  onIncrement={() => onClientIceCountChange("add", agent.name)}
                  width="5%"
                />
              ),
              status: (
                <div className="detailslist_status">
                  <p>Inactive</p>{" "}
                  <Toggle
                    onChange={() => onAgentToggle(agent.name)}
                    checked={agent.status === "active"}
                    inlineLabel
                    label="Active"
                  />
                </div>
              ),
              deleteIcon: (
                <img
                  onClick={() => deleteAgent(agent.name)}
                  src="static/imgs/DeleteIcon.svg"
                  className="agents__action_icons"
                  alt="Delete Icon"
                />
              ),
            })
          )}
          layoutMode={1}
          selectionMode={0}
          variant="variant-two"
        />
      </div>
    </>
  );
};

export default AgentsList;

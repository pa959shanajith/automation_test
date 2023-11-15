import React, { useEffect, useState, useRef } from "react";
import { saveAvoGrid, fetchAvoAgentAndAvoGridList, } from "../api";
import "../styles/Grid.scss";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Checkbox } from "primereact/checkbox";
import { Tooltip } from "primereact/tooltip";
import { Column } from "primereact/column";
import { Toast } from 'primereact/toast';
import { InputText } from "primereact/inputtext";
import { Messages as MSG, VARIANT } from "../../global";


const CreateGrid = ({ currentGrid, setCurrentGrid, setLoading, toastError, toastSuccess }) => {
  const toastWrapperRef = useRef(null);
  const [gridName, setGridName] = useState(currentGrid.name);
  const [searchText, setSearchText] = useState("");
  const [dataUpdated, setDataUpdated] = useState(false);
  const [agentData, setAgentData] = useState([]);
  const [filteredList, setFilteredList] = useState(agentData);
  let selectedAgents = undefined;
  let newselectedAgentsNumbers = 0;
  let firstRenderCheck = true;

  const [selection] = useState([]);

  const onClientIceCountChange = (operation, name, newVal = "") => {
    console.log(`onClientIceCountChange called with operation: ${operation}, name: ${name}, newVal: ${newVal}`);
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);

    if (operation === "add" || (operation === "sub" && parseInt(agentData[index].icecount) > 1)) {
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
      console.log(`onClientIceCountChange called with operation: ${operation}, name: ${name}, newVal: ${newVal}`);
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
      field: "checkbox",
      header: "",
    },
    {
      field: "agent",
      header: "Agents",
    },
    {
      field: "clientCount",
      header: "Avo Client Count",
    },
    {
      field: "status",
      header: "Status",
    },
  ];
  useEffect(() => {
    currentGrid.name === gridName ? setDataUpdated(false) : setDataUpdated(true);
    if (gridName.trim().length > 0) setGridName(gridName);
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
          toastError(MSG.CUSTOM(agentList.error.CONTENT, VARIANT.ERROR));
        } else {
          toastError(MSG.CUSTOM("Error While Fetching Agent List", VARIANT.ERROR));
        }
      } else {
        if (currentGrid && currentGrid.agents && currentGrid.agents.length > 0) {
          let selectedAgentsList = [];
          let unSelectedAgentsList = [];

          const selectedAgentnameList = currentGrid.agents.map(
            (agent) => agent.Hostname
          );

          if (agentList && agentList.avoagents) {
            agentList.avoagents.forEach((agent) => {
              if (selectedAgentnameList.includes(agent.Hostname)) {
                selectedAgentsList.push(agent);
              } else {
                unSelectedAgentsList.push(agent);
              }
            });
          }

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
      if (requestData.value.agents.length < 1) {
        toastError(MSG.CUSTOM("Please select atleast one Agent", VARIANT.ERROR));
      }
      else {
        const storeConfig = await saveAvoGrid(requestData);
        if (storeConfig !== "success") {
          if (storeConfig.error && storeConfig.error.CONTENT) {
            toastError(MSG.CUSTOM(storeConfig.error.CONTENT, VARIANT.ERROR));
          } else {
            toastError(MSG.CUSTOM("Something Went Wrong", VARIANT.ERROR));
          }
        } else {
          toastSuccess("Grid Created Successfully", "SUCCESS");
          setCurrentGrid(false);
        }
      }
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


  const handleIncrement = (agentName) => {
    onClientIceCountChange("add", agentName);
  };

  const handleDecrement = (agentName) => {
    onClientIceCountChange("sub", agentName);
  };

  return (
    <>
      <Toast ref={toastWrapperRef} position="bottom-center" />
      <div className="create_new_grid surface-100 gap-2">
        <label className="page-taskName_grid">Create New Grid</label>
        <div className="config_name">
          <label className="api-ut__inputLabel_text">Avo Grid Name :</label>
            <InputText
              value={gridName}
              style={{ width: "25rem" }}
              label="Avo Grid Name"
              onChange={(e) => setGridName(e.target.value)}
              autoComplete="off"
              placeholder="Enter Grid Name"
            />
             <div className="grid_button">
          <Button
          className="save_grid_btn"
          data-test="submit-button-test"
          size="small"
          label="Save"
          disabled={!gridName}
          onClick={handleConfigSave}
        />
        <Button
          className="cancel_grid_btn"
          data-test="submit-button-test"
          size="small"
          onClick={() => setCurrentGrid(false)}
          label={dataUpdated ? "Cancel" : "Back"}
        />
        </div>
        </div>
        <div className="agent_state__legends_grids">
          {showLegend("inactive", "Inactive")}
          {showLegend("idle", "Active - Idle")}
          {showLegend("in-progress", "Active - In Progress")}
          {showLegend("busy", "Active - Busy")}
          {showLegend("offline", "Offline")}
          <InputText
            placeholder="Search"
            style={{ width: "20rem" }}
            value={searchText}
            onClear={() => handleSearchChange("")}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <DataTable
          value={(searchText.length > 0 ? filteredList : agentData).map(
            (agent) => ({
              checkbox: (
                <Checkbox
                  checked={agent.isSelected}
                  onChange={() => onAgentSelection(agent.name)}
                />
              ),
              agent: (
                <div className="agent_state">
                  <Tooltip target={agent.name} content={agent.state} position="top" />
                  <div
                    data-html={true}
                    data-for={agent.name}
                    data-tip={agent.state}
                    className={`agent_state__div agent_state__${agent.state}`}
                  ></div>
                  <p>{agent.name}</p>
                </div>
              ),
              clientCount: (
                <InputNumber
                  disabled={agent.status !== "active"}
                  value={agent.icecount}
                  onChange={(e) => {
                    const { value } = e.target || {};
                    if (value !== undefined) {
                      onClientIceCountChange("update", agent.name, value);
                    }
                  }}
                  showButtons
                  buttonLayout="horizontal"
                  incrementButtonClassName="p-button-secondary"
                  decrementButtonClassName="p-button-secondary"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  className="grid_inputnumber"
                  min={0}
                  onIncrement={() => handleIncrement("sub", agent.name)}
                  onDecrement={() => handleDecrement("add", agent.name)}
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
          selectionMode="single"
          className="Grid_table"
          scrollable
          scrollHeight="23rem"
        >
          {agentListHeader.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
            />
          ))}
        </DataTable>
      </div>
    </>
  );
};

export default CreateGrid;

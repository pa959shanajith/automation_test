import React, { useEffect, useState, useRef } from "react";
import { Messages as MSG, VARIANT } from "../../global";
import { fetchAvoAgentAndAvoGridList, saveAvoAgent } from "../api";
import { useSelector } from "react-redux";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import "../styles/ManageAgent.scss";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { Toast } from 'primereact/toast';


const AgentsList = ({ setLoading, setShowConfirmPop, toastError, toastSuccess }) => {

  const [searchText, setSearchText] = useState("");
  const [isDataUpdated, setIsDataUpdated] = useState(false);
  const toastWrapperRef = useRef(null);
  const [agentData, setAgentData] = useState([]);
  const [originalAgentData, setOriginalAgentData] = useState([]);

  const onClientIceCountChange = (operation, name, newVal = "") => {
    setIsDataUpdated(true);
    const updatedData = [...agentData];
    const index = updatedData.findIndex((agent) => agent.name === name);
    if (
      operation === "add" || (operation === "sub" && parseInt(agentData[index].icecount) > 1)) {
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
    toastSuccess(
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
        setOriginalAgentData(
          agentList.avoagents.map((agent) => ({
            ...agent,
            name: agent.Hostname,
            state: "idle",
            createdOn: agent.createdon,
          }))
        );
        setAgentData(
          agentList.avoagents.map((agent) => ({
            ...agent,
            name: agent.Hostname,
            state: "idle",
            createdOn: agent.createdon,
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
            toastError(MSG.CUSTOM(storeConfig.error.CONTENT, VARIANT.ERROR));
          } else {
            toastError(MSG.CUSTOM("Something Went Wrong", VARIANT.ERROR));
          }
        } else {
          toastSuccess("Agents List updated successfully", "SUCCESS");
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

  const onDownloadAgentClick = () => {
    window.location.href = "https://downloads.avoassure.ai/driver/avoagent.exe";
  }
  function formatDate(dateString) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const parts = dateString.split(/[\/, :]/);
    const day = parseInt(parts[1], 10);
    const monthIndex = parseInt(parts[0], 10) - 1;
    const year = parseInt(parts[2], 10);

    return `${day} ${months[monthIndex]} ${year}`;
  }

  return (
    <>
      <Toast ref={toastWrapperRef} position="bottom-center" />
      <span className="page-agent-taskName">Download Agent</span>
      <pre>
        <code className="downld_cls">
          Click <u><a onClick={onDownloadAgentClick} style={{ color: "purple", cursor: 'pointer', textDecoration: 'underline' }}>Here</a></u> to Download the Agent
        </code>
      </pre>
      <div className="page-agent-taskName">
        <span data-test="page-title-test">
          Manage Agent
        </span>
      </div>
      <div
        className="api-ut__btnGroup__agents">
          {showLegend("inactive", "Inactive")}
          {showLegend("idle", "Active - Idle")}
          {showLegend("in-progress", "Active - In Progress")}
          {showLegend("busy", "Active - Busy")}
          {showLegend("offline", "Offline")}
        <div className="p-input-icon-left search_agent">
          <i className="pi pi-search" />
          <InputText 
            placeholder="Search"
            value={searchText}
            onChange={(event) =>
              event &&
              event.target &&
              handleSearchChange(event.target.value)}
            title=" Search all projects."
          />
        <div className="savebtn_div">
        <Button className="save__agent" label="Save" onClick={handleAgentsSave} />
        </div>
        </div>
      </div>
      <div style={{ position: "absolute", width: "70%", height: "-webkit-fill-available",top : '19rem'}}>
        <DataTable showGridlines value={searchText.length > 0 ? filteredList : agentData} scrollable scrollHeight="23.5rem">
          <Column header="Agent Name" body={(agent) => (
            <div className="agent_state">
              <Tooltip target={`agent-name-${agent.name}`} content={agent.state} position="top" />
              <div
                id={`agent-name-${agent.name}`}
                className={`agent_state__div agent_state__${agent.state}`}
              />
              <p>{agent.name}</p>
            </div>
          )} />
          <Column header="Avo Client Count" body={(agent) => (
            <InputNumber
              disabled={agent.status !== "active"}
              value={agent.icecount}
              onValueChange={(e) => onClientIceCountChange("update", agent.name, e.target.value)}
              onMinus={() => onClientIceCountChange("sub", agent.name)}
              onPlus={() => onClientIceCountChange("add", agent.name)}
              step={1}
              showButtons
              buttonLayout="horizontal"
              incrementButtonClassName="p-button-secondary"
              decrementButtonClassName="p-button-secondary"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              className="agent_inputnumber"
              min={0}
            />
          )} />
          <Column header="Status" body={(agent) => (
            <div className="detailslist_status">
              <label className="pr-2">Inactive</label>
              <InputSwitch
                onChange={() => onAgentToggle(agent.name)}
                checked={agent.status === "active"}
              />
              <label className="pl-2">Active</label>
            </div>
          )} />
          <Column header="Created on" body={(agent) => (
            <>{formatDate((agent.createdOn).slice(0, 9))}</>
          )} />
          <Column className="agents__action_icons" header="Action" body={(agent) => (
            <img
              onClick={() => deleteAgent(agent.name)}
              src="static/imgs/DeleteIcon.svg"
              className="agents__action_icons"
              alt="Delete Icon"
            />
          )} />
        </DataTable>
      </div>
    </>
  );
};

export default AgentsList;

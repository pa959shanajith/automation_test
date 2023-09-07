import React, { useEffect, useState } from "react";
import { Tooltip } from 'primereact/tooltip';
import { Messages as MSG, setMsg, VARIANT } from "../../global";
import { saveAvoGrid, fetchAvoAgentAndAvoGridList } from "../api";
// import { useSelector } from "react-redux";
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import "../styles/Agents.scss";


const CreateGrid = (props) => {
  const [gridName, setGridName] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [dataUpdated, setDataUpdated] = useState(false);
  const [agentData, setAgentData] = useState([]);
  const [filteredList, setFilteredList] = useState(agentData);
  // const [gridListDialog, setGridListDialog] = useState(props.gridDialog)
  // const [dialogVisible, setDialogVisible] = useState(false);
  let selectedAgents = undefined;
  // let newselectedAgentsNumbers = 0;

  const [msgs, setMsgs] = useState([]);
  let firstRenderCheck = true;

  // const onClientIceCountChange = (operation, name, newVal = "") => {
  //   const updatedData = [...agentData];
  //   const index = updatedData.findIndex((agent) => agent.name === name);

  //   if (operation === "add" || (operation === "sub" && parseInt(agentData[index].icecount) > 1)) {
  //     updatedData[index] = {
  //       ...agentData[index],
  //       icecount:
  //         operation === "add"
  //           ? parseInt(agentData[index].icecount) + 1
  //           : parseInt(agentData[index].icecount) - 1,
  //     };
  //     setAgentData([...updatedData]);
  //     let filteredItems = updatedData.filter(
  //       (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
  //     );
  //     setFilteredList(filteredItems);
  //   } else if (operation === "update" && newVal > 0) {
  //     updatedData[index] = { ...agentData[index], icecount: parseInt(newVal) };
  //     setAgentData([...updatedData]);
  //     let filteredItems = updatedData.filter(
  //       (item) => item.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
  //     );
  //     setFilteredList(filteredItems);
  //   }
  // };

  // const handleSearchChange = (value) => {
  //   let filteredItems = agentData.filter(
  //     (item) => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1
  //   );
  //   setFilteredList(filteredItems);
  //   setSearchText(value);
  // };

  // const handleAgentSelection = (e) => {
  //   setSelectedAgents(e.value);
  // };

  const agentListHeader = [
    { field: "checkbox", header: "", sortable: false },
    { field: "agent", header: "Agents", sortable: true },
    { field: "clientCount", header: "Avo Client Count", sortable: true },
    { field: "status", header: "Status", sortable: true },
  ];

  // useEffect(() => {
  //   currentGrid.name === gridName ? setDataUpdated(false) : setDataUpdated(true);
  //   if (gridName.trim().length > 0) setGridName(gridName);
  //   else setGridName('');
  // }, [gridName]);


  useEffect(() => {
    (async () => {
      // setLoading("Loading...");
      const agentList = await fetchAvoAgentAndAvoGridList({
        query: "avoAgentList",
      });

      console.log(agentList);
      if (agentList.error) {
        if (agentList.error.CONTENT) {
          setMsg(MSG.CUSTOM(agentList.error.CONTENT, VARIANT.ERROR));
        } else {
          setMsg(MSG.CUSTOM("Error While Fetching Agent List", VARIANT.ERROR));
        }
      } else {
        setAgentData(agentList.avoagents);
        // agentList.avoagents.forEach((agent) => {
        //   if (selectedAgentnameList.includes(agent.Hostname)) {
        //     selectedAgentsList.push(agent);
        //   } else {
        //     unSelectedAgentsList.push(agent);
        //   }
        // });

        // if (currentGrid.length > 0) {
        //   let selectedAgentsList = [];
        //   let unSelectedAgentsList = [];

        //   const selectedAgentnameList = currentGrid.agents.map(
        //     (agent) => agent.Hostname
        //   );


        //   let Agents = currentGrid.agents;
        //   const getIceCount = (hostname) => {
        //     for (let index = 0; index < Agents.length; index++) {
        //       if (Agents[index].Hostname === hostname) {
        //         return Agents[index].icecount;
        //       }
        //     }
        //   };

        //   setAgentData([
        //     ...selectedAgentsList.map((agent) => ({
        //       ...agent,
        //       isSelected: true,
        //       name: agent.Hostname,
        //       icecount: getIceCount(agent.Hostname),
        //       state: "idle",
        //     })),

        //     ...unSelectedAgentsList.map((agent) => ({
        //       ...agent,
        //       isSelected: false,
        //       name: agent.Hostname,
        //       state: "idle",
        //     })),
        //   ]);
        // } else {
        //   setAgentData(
        //     agentList.avoagents.map((agent) => ({
        //       ...agent,
        //       isSelected: false,
        //       name: agent.Hostname,
        //       state: "idle",
        //     }))
        //   );
        // }
      }
      // setLoading(false);
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

  // const handleConfigSave = async () => {
  //   (async () => {
  //     // setLoading("Loading...");
  //     let requestData = {};
  //     if (currentGrid._id !== "" && currentGrid.name !== "") {
  //       let updateAgentData = {
  //         action: "update",
  //         value: {
  //           name: gridName.trim(),
  //           _id: currentGrid._id,
  //           agents: agentData
  //             .filter((agent) => agent.isSelected)
  //             .map((agent) => ({
  //               Hostname: agent.Hostname,
  //               icecount: agent.icecount,
  //               _id: agent._id,
  //             })),
  //         },
  //       };
  //       requestData = updateAgentData;
  //     } else {
  //       let createAgentData = {
  //         action: "create",
  //         value: {
  //           name: gridName.trim(),
  //           agents: agentData
  //             .filter((agent) => agent.isSelected)
  //             .map((agent) => ({
  //               Hostname: agent.name,
  //               icecount: agent.icecount,
  //               _id: agent._id,
  //             })),
  //         },
  //       };
  //       requestData = createAgentData;
  //     }
  //     if (requestData.value.agents.length < 1) {
  //       setMsg(MSG.CUSTOM("Please select atleast one Agent", VARIANT.ERROR));
  //     }
  //     else {
  //       const storeConfig = await saveAvoGrid(requestData);
  //       if (storeConfig !== "success") {
  //         if (storeConfig.error && storeConfig.error.CONTENT) {
  //           setMsg(MSG.CUSTOM(storeConfig.error.CONTENT, VARIANT.ERROR));
  //         } else {
  //           setMsg(MSG.CUSTOM("Something Went Wrong", VARIANT.ERROR));
  //         }
  //       } else {
  //         showMessageBar("Grid Created Successfully", "SUCCESS");
  //         setCurrentGrid(false);
  //       }
  //     }
  //     // setLoading(false);
  //   })();
  // };


  const createGridFooter = () => {
    <>
      <Button
        data-test="submit-button-test"
        // disabled={!gridName || selectedAgents.length === 0}
        // onClick={handleConfigSave}
        label="Create"
      />
      <Button
        data-test="submit-button-test"
        // onClick={() => props.setCurrentGrid(false)}
        label={dataUpdated ? "Cancel" : "Back"}
      />
    </>
  }


  return (
    <>
      <Dialog
        header="Create New Grid"
        visible={props.createDialog}
        onHide={() => props.setCreateDialog(false)}
        footer={createGridFooter}
        style={{ width: "61.06rem", height: '36rem' }}
      >
        <div className="flex flex-column">
          <label htmlFor="gridname" className="pb-2 font-medium">Name <span style={{ color: "#d50000" }}>*</span></label>
          <InputText
            data-test="gridname"
            value={gridName}
            className='w-full md:w-20rem p-inputtext-sm'
            onChange={(event) => setGridName(event.target.value.trim())}
            type="gridname"
            autoComplete="new-gridname"
            name="gridname"
            id="gridname"
            maxLength="16"
            placeholder='Enter grid name'
          />
        </div>

        <div className="agent_state__legends_grid">
          {showLegend("inactive", "Inactive")}
          {showLegend("idle", "Active - Idle")}
          {showLegend("in-progress", "Active - In Progress")}
          {showLegend("busy", "Active - Busy")}
          {showLegend("offline", "Offline")}
        </div>

        <div className="flex flex-row pt-4">
          <Card className="Grid__box">
            <div className="p-input-icon-left search__grid">
              <i className="pi pi-search" />
              <InputText className="p-inputtext-sm Search_name"
                placeholder="Search"
                width="20rem"
                value={searchText}
              //   onChange={(event) =>
              //     event &&
              //     event.target &&
              //     handleSearchChange(event.target.value)}
              // 
              />
            </div>
            <div style={{ position: "relative", width: "98%" }}>
              <DataTable
                value={agentData}
                style={{ position: "relative", width: "98%" }}
                // selection={selectedAgents}
                // onSelectionChange={handleAgentSelection}
                selectionMode="multiple"
              >
                <Column field="selectall" headerStyle={{ justifyContent: "center" }}
                // editor={(options) => cellEditor(options)}
                // onCellEditComplete={onCellEditComplete}
                // bodyStyle={{ cursor: 'url(static/imgs/Pencil24.png) 15 15,auto' }}
                // bodyClassName={"ellipsis-column"}
                // body={renderElement}
                />
                <Column field="Hostname" header="Agent Name" headerStyle={{ justifyContent: "center" }} bodyClassName={"ellipsis-column"}></Column>
                <Column field="icecount" header="Avo Client Count" headerStyle={{ justifyContent: "center" }}></Column>
                <Column field="status" header="Screenshot" headerStyle={{ justifyContent: "center" }}></Column>
              </DataTable>
            </div>


          </Card>
          <div className="grid_arrows">
            <Button className="gtbtn" label='>'  >  </Button>
            <Button className="gtbtn" label='<'   >   </Button>
          </div>

          <Card className="Grid__box">
            <div className="p-input-icon-left search__grid">
              <i className="pi pi-search" />
              <InputText className="Search_name"
                placeholder="Search"
                width="20rem"
                value={searchText}
              // onChange={(event) =>
              //   event &&
              //   event.target &&
              //   handleSearchChange(event.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* <div className="savebtn_grid">
          <Button className="save__grid" label="Save" disabled={!gridName} onClick={handleConfigSave}></Button>
          <Button
            className="backGrid_btn"
            data-test="submit-button-test"
            // onClick={() => setCurrentGrid(false)}
            label={dataUpdated ? "Cancel" : "Back"}
          ></Button>

          {agentData.length > 0 && (
            <>
              <div className="p-input-icon-left search__grid">
                <i className="pi pi-search" />
                <InputText className="Search_name"
                  placeholder="Search"
                  width="20rem"
                  value={searchText}
                  onChange={(event) =>
                    event &&
                    event.target &&
                    handleSearchChange(event.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex flex-column Grid_name">
            <label htmlFor="username" className="pb-2 font-medium">Avo Grid Name</label>
            <InputText
              value={gridName}
              style={{ width: '18%' }}
              onChange={(event) => setGridName(event.target.value)}
              autoComplete="off"
              placeholder="Enter Grid Name"
            />
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
            width: "66%",
            height: "-webkit-fill-available",
            marginTop: "1.5%",
          }}
        >
          <DataTable
            showGridlines
            value={(searchText.length > 0 ? filteredList : agentData).map((agent) => ({
              multiple: (
                <Checkbox
                  checked={agent.isSelected}
                  onChange={() => onAgentSelection(agent.name)}
                />
              ),
              agent: (
                <div className="agent_state">
                  <Tooltip target={agent.name} content={agent.state} position="top" />
                  <div
                    data-for={agent.name}
                    className={`agent_state__div agent_state__${agent.state}`}
                  ></div>
                  <p>{agent.name}</p>
                </div>
              ),
              clientCount: (
                <InputNumber
                  disabled={agent.status !== 'active'}
                  value={agent.icecount}
                  onValueChange={(ev) =>
                    onClientIceCountChange('update', agent.name, ev.value)
                  }
                  decrementButtonClassName="p-button-secondary"
                  incrementButtonClassName="p-button-secondary"
                />
              ),
              status: (
                <div className="detailslist_status">
                  <p>{agent.status}</p>
                </div>
              ),
            }))}
            selection={selectedAgents}
            onSelectionChange={handleSelectionChange}
          >
            <Column selectionMode="multiple" style={{ width: '3em' }} />
            <Column field="agent" header="Agent" />
            <Column field="clientCount" header="Client Count" />
            <Column field="status" header="Status" />
          </DataTable>
        </div> */}
      </Dialog >
    </>
    //   <>
    //   <div className="page-taskName">
    //     <span data-test="page-title-test" className="taskname">
    //       Create New Grid
    //     </span>
    //   </div>
    //   <div className="api-ut__btnGroup">
    //     <Button
    //       data-test="submit-button-test"
    //       disabled={!gridName || selectedAgents.length === 0}
    //       onClick={handleConfigSave}
    //       label="Save"
    //     />
    //     <Button
    //       data-test="submit-button-test"
    //       onClick={() => props.setCurrentGrid(false)}
    //       label={dataUpdated ? "Cancel" : "Back"}
    //     />
    //     {agentData.length > 0 && (
    //       <div className="searchBoxInput">
    //         <InputText
    //           placeholder="Search"
    //           value={searchText}
    //           onChange={(e) => setSearchText(e.target.value)}
    //         />
    //       </div>
    //     )}
    //     <div className="devOps_config_name">
    //       <span className="api-ut__inputLabel_text">Avo Grid Name :</span>
    //       <span className="api-ut__inputLabel">
    //         <InputText
    //           value={gridName}
    //           onChange={(e) => setGridName(e.target.value)}
    //           autoComplete="off"
    //           placeholder="Enter Grid Name"
    //         />
    //       </span>
    //     </div>
    //   </div>
    //   <div>
    //     <div className="agent_state__legends_grid">
    //       {showLegend("inactive", "Inactive")}
    //       {showLegend("idle", "Active - Idle")}
    //       {showLegend("in-progress", "Active - In Progress")}
    //       {showLegend("busy", "Active - Busy")}
    //       {showLegend("offline", "Offline")}
    //     </div>
    //   </div>
    //   <div style={{ position: "absolute", width: "98%", height: "calc(100% - 150px)", marginTop: "1.5%" }}>
    //     <DataTable
    //       value={agentData}
    //       selection={selectedAgents}
    //       onSelectionChange={onAgentSelectionChange}
    //       resizableColumns
    //       scrollable
    //       scrollHeight="calc(100% - 100px)"
    //     >
    //       {agentListHeader.map((col) => (
    //         <Column
    //           key={col.field}
    //           field={col.field}
    //           header={col.header}
    //           sortable
    //           filter
    //           filterPlaceholder="Search"
    //         />
    //       ))}
    //     </DataTable>
    //   </div>
    // </>
  );
};

export default CreateGrid;

import React, { useState, useEffect, Fragment,useRef } from "react";
import { TabMenu } from "primereact/tabmenu";
import { Card } from "primereact/card";
import "../styles/ConfigurePage.scss";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Breadcrumbs, Checkbox } from "@mui/material";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Dropdown } from "primereact/dropdown";
import { Tree } from "primereact/tree";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import { SelectButton } from "primereact/selectbutton";
import { InputSwitch } from "primereact/inputswitch";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from 'primereact/toast';
import {fetchConfigureList} from '../api';
// import { Messages as MSG,VARIANT} from '../../global';
import AvoModal from '../../../globalComponents/AvoModal';
import ConfigureSetup from './ConfigureSetup';
import { getAvoAgentAndAvoGrid, getModules, getProjects, storeConfigureKey } from '../configureSetupSlice';
import { useDispatch, useSelector } from 'react-redux';

const ConfigurePage = ({setLoading}) => {
  const [visible, setVisible] = useState(false);
  const [visible_schedule, setVisible_schedule] = useState(false);
  const [visible_CICD, setVisible_CICD] = useState(false);
  const [ingredient, setIngredient] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const [showIcePopup, setShowIcePopup] = useState(false);
  // const [selectedRadio, setSelectedRadio] = useState('');
  const [radioButton_grid, setRadioButton_grid] = useState(
    "Execute with Avo Assure Agent/ Grid"
  );
  const [radioButton_Weekly, setRadioButton_Weekly] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState(
    "Execute with Avo Assure Client"
  );
  const [selectedNodeKey, setSelectedNodeKey] = useState(null);
  const [selectRecurrenceKey, setSelectRecurrenceKey] = useState(null);
  const [time, setTime] = useState(null);
  const [days, setDays] = useState(null);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [time_limit, setTime_limit] = useState(null);
  const [counter, setCounter] = useState(0);
  const [value_input, setValue_input] = useState(null);
  const [checked, setChecked] = useState(false);
  const toast = useRef(null);
  const [getProjectLists,setProjectList]=useState([]);
  const [projectData1, setProjectData1] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [projectId, setPojectId] = useState('');
  const [projectName, setProjectName] = useState('');
  // const current_task = useSelector(state=>state.plugin.PN);
  const [cycleName, setCycleName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [configList, setConfigList] = useState([]);
  // const dispatch = useDispatch();

  const items = [ { label: "Configurations" }, { label: "Scheduled Executions" }];
  
  
  const getConfigData = useSelector((store) => store.configsetup);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getAvoAgentAndAvoGrid());
  }, []);

  useEffect(() => {
    if (!!getConfigData?.projects.length)
      dispatch(getModules(getConfigData?.projects));
  }, [getConfigData?.projects]);

  const onModalBtnClick = (getBtnType) => {
    if(getBtnType === "Next"){
      dispatch(storeConfigureKey());
    }
    else setVisible(false);
  };

  const [recurrenceType, setRecurrenceType] = useState("");
  const [monthlyRecurrenceWeekValue, setMonthlyRecurrenceWeekValue] = useState('')
  

  const weekDays = [{ name: "Sunday" }, { name: "Monday" }, { name: "Tuesday" }, { name: "Wednesday" }, { name: "Thursday" }, { name: "Friday" }, { name: "Saturday" }];

  const [selectedWeek, setSelectedWeek] = useState([]
   
);

const showSuccess_execute = () => {
  toast.current.show({severity:'success', summary: 'Success', detail:'Execution has started', life: 1000});
}
const showSuccess_Schedule = () => {
  toast.current.show({severity:'success', summary: 'Success', detail:'Execution has been scheduled', life: 1000});
}

  const handleWeekInputChange = (event) => {
    setMonthlyRecurrenceWeekValue(event.target.value);
  }
  // const toggleDropdown = () => {
  //   setIsOpen(!isOpen);
  // };
  const getRecurrenceType = (event) => {
    setRecurrenceType(event.target.value);
  };
  useEffect(() => {
    if (recurrenceType === "Weekly") {
      setSelectedWeek([]);
    }
  }, [recurrenceType]);
  const handleCounterChange = (e) => {
    setCounter(e.target.value);
  };
  
  const tree_CICD = [
    {
      key: "0",
      label: "Elastic Execution Grid Information",
      data: "Documents Folder",
      icon: "pi pi-fw pi-calendar",
      children: [
        {
          key: "1",

          label: (
            <div className="input_CICD .p-tree .p-tree-container .p-treenode .p-treenode-content.p-treenode-selectable:not(.p-highlight):hover">
              <InputText className="inputtext_CICD" />
              <Button icon="pi pi-copy" className="copy_CICD" />
              <div className="lable_sync">
                <lable className="Async_lable"> Asynchronous</lable>
                <InputSwitch className="inputSwitch_CICD"
                  checked={checked}
                  onChange={(e) => setChecked(e.value)}
                />
                <label  className="sync_label" id="sync" htmlFor="synch" value="synchronous">
                  Synchronous{" "}
                </label>
              </div>
              <div>
                <lable className="devops_label">Devops Request Body</lable>
              </div>
              <div>
                <div className="inputtext_devops">
                  <InputTextarea rows={4} cols={30} />
                  <Button icon="pi pi-copy" className="copy_devops" />
                </div>
              </div>
            </div>
          ),
        },
      ],
    },
  ];
  

  const treeData = [
    {
      key: "1",
      label: "Schedule Options",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",
   
      children: [
        {
          key: "1-0",
          label: (
            <div className="flex-auto">
              <label
                htmlFor="calendar-timeonly"
                className="font-bold block mb-2"
              >
                Start Time
              </label>
              <Calendar
                id="calendar-timeonly"
                value={time}
                onChange={(e) => setTime(e.value)}
                timeOnly
                placeholder="Enter Start Time"
              />
            </div>
          ),
        },
      ],
    },

    {
      key: "1",
      label: " Recurrence Pattern",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",
     
      children: [
        {
          key: "1-0",
          label: (
            <div className="recurrence-container">
              <div className="recurrence-list">
                

                <lable>
                  <RadioButton
                    
                    value="Daily"
                    checked={recurrenceType === "Daily"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Daily_lable"> Daily</span>
                </lable>

                <lable>
                  <RadioButton
                   
                    value="Weekly"
                    checked={recurrenceType === "Weekly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Weekly_lable"> Weekly</span>
                </lable>

                <lable>
                  <RadioButton
                    type="radio"
                    value="Monthly"
                    checked={recurrenceType === "Monthly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="Monthly_lable"> Monthly</span>
                </lable>
                <lable>
                  <RadioButton
                    type="radio"
                    value="Yearly"
                    checked={recurrenceType === "Yearly"}
                    onChange={getRecurrenceType}
                  />
                  <span className="yearly_lable">Yearly</span>
                </lable>
              </div>
              {/* <div className="recurrence-content"> */}
              {recurrenceType === "Weekly" && (
                <div className="weekly-recurrence-list">
                  <div className=' schedule_input_counter'>
                   <label>Recur every</label>
                   <InputText className="input_count" type="number" value={counter} onChange={handleCounterChange} />
                    <label>week(s) on:</label>
                   </div>
                  <div className="weeks">
                    {weekDays.map(({ name }, index) => {
                      return (
                        <div className="weeks-child">
                          <lable>
                            <input
                              type="checkbox"
                              value={name}
                              checked={selectedWeek.includes(name)}
                              onChange={handleWeekInputChange}
                            />
                            <span> {name}</span>
                          </lable>
                        </div>
                      );
                    })
                    }
                    </div>
   
                </div>
              )}
              {/* </div> */}
            </div>
          ),

          
        },
      ],
    },
    {
      key: "1",
      label: "Range of Recurrence",
      data: "Events Folder",
      icon: "pi pi-fw pi-calendar",
  
      children: [
        {
          key: "1-0",
          label: (
            <div className="schedule_date  ">
              <div>
                <RadioButton
                  value="End Date "
                  checked={time_limit === "End Date "}
                />
                <label className="ml-2">End Date </label>
              </div>
              <div>
                <RadioButton
                  value="End After "
                  checked={time_limit === "End After"}
                />
                <label className="ml-2">End After </label>
              </div>
              <div>
                <RadioButton
                  value="No end date "
                  checked={time_limit === "No end date"}
                />
                <label className="ml-2">No end date</label>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  useEffect(()=>{
    (async() => {
            const configurationList = await fetchConfigureList({
                'projectid': "642d4a250934a8c996e598a0"
            });
            setConfigList(configurationList.map((item, idx)=>{
               return{
              sno: idx+1,
              profileName: (
                <div>
                  <Checkbox  className="checkbox_header"/>
                  <span>{item.configurename}</span>
                </div>
              ),
              executionOptions: (
                <div className="Buttons_config">
                  <Button 
                    style={{
                      width: "8.5rem",
                      fontFamily: "Open Sans",
                      fontStyle: "normal",
                      marginLeft:'9.5rem',
                      height:"2.5rem"
                    }}
                    onClick={() => {setVisible(true);
                      console.log("visible state:", visible);
                    }}
                    
                    size="small"
                  >
                    {" "}
                    Execute Now
                  </Button>
                  <Dialog
                    className="dialog_execute "
                    header="Execute : Regression"
                    visible={visible}
                    style={{ width: "50vw" }}
                    onHide={() => setVisible(false)}
                    footer={footerContent_config}
                  >
                    
                    <Card className="execute_card p-card p-card-body ">
                      <p className="m-0 ">
                        <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
                        <div>Select Browsers : Google Chrome</div>
                        <div>Execution Mode : Headless</div>
                      </p>
                    </Card>
        
                    <div  className="radioButtonContainer">
                      <RadioButton 
                        value="Execute with Avo Assure Agent/ Grid"
                        onChange={(e) => handleRadioButtonChange(e.value)}
                        checked={
                          radioButton_grid === "Execute with Avo Assure Agent/ Grid"
                        }
                      />
                      <label className="executeRadio_label_grid ml-2">
                        Execute with Avo Assure Agent/ Grid
                      </label>
                      <div className="radioButtonContainer1">
                      <RadioButton
                        value="Execute with Avo Assure Client"
                        onChange={(e) => handleRadioButtonChange(e.value)}
                        checked={ingredient === "Execute with Avo Assure Client"}
                      />
                      </div>
                      <label className=" executeRadio_label_clint ml-2">Execute with Avo Assure Client</label>
                    </div>
                    {/* <div className='adminControl-ice popup-content popup-content-status'> */}
                    {/* <div> */}
                    {selectedRadio === "Execute with Avo Assure Client" && (
                      <div>
                        <div className="legends-container">
                          <span className="legend_Status" title="Token Name">
                            Status:
                          </span>
                          <div className="legend">
                            <span id="status" className="status-available"></span>
                            <span className="legend-text">Available</span>
                          </div>
                          <div className="legend">
                            <span id="status" className="status-unavailable"></span>
                            <span className="legend-text">Unavailable</span>
                          </div>
                          <div className="legend">
                            <span id="status" className="status-dnd"></span>
                            <span className="legend-text">Do Not Disturb</span>
                          </div>
                        </div>
                        <div>
                          <span
                            className="execute_dropdown .p-dropdown-label "
                            title="Token Name"
                          >
                            Execute on
                          </span>
                          <Dropdown
                            className="dropdown_execute .p-inputtext"
                            placeholder="Search"
                          ></Dropdown>
                        </div>
                      </div>
                    )}
                    {/* </div> */}
                    {/* </div> */}
                  </Dialog>
        
                  <Button 
                    style={{
                      width: "6rem",
                      fontFamily: "Open Sans",
                      fontStyle: "normal",
                      height:'2.5rem'
                    }}
                    onClick={() => setVisible_schedule(true)}
                    size="small"
                  >
                    {" "}
                    Schedule
                  </Button>
                  <Dialog
                    className="dialog_Schedule"
                    header="Schedule : Regression"
                    visible={visible_schedule}
                    style={{ width: "60vw" }}
                    onHide={() => setVisible_schedule(false)}
                    footer={footerContent_Schedule}
                  >
                    <Card className="Schedule_card  .p-card .p-card-content ">
                      <p className="m-0 ">
                        <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
                        <div>Select Browsers : Google Chrome</div>
                        <div>Execution Mode : Headless</div>
                      </p>
                    </Card>
        
                    <Tree
                      className="schedule_tree"
                      value={treeData}
                      selectionMode="single"
                      selectionKeys={selectedNodeKey}
                      onSelectionChange={onNodeSelect}
                      // onToggle={onToggleNode}
                    />
                  </Dialog>
                  <Button 
                  style={{
                    width: "4.5rem",
                    fontFamily: "Open Sans",
                    fontStyle: "normal",
                    height:"2.5rem"
                    
                  }}
                  size="small"
                    onClick={() => setVisible_CICD(true)}
                  >
                    CI/CD
                  </Button>
                  
                  <Dialog
                    className="dialog_CICD"
                    header="Execute : Regression"
                    visible={visible_CICD}
                    style={{ width: "50vw" }}
                    onHide={() => setVisible_CICD(false)}
                    footer={footerContent_CICD}
                  >
                    <Card className="Schedule_card  .p-card .p-card-content ">
                      <p className="m-0 ">
                        <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
                        <div>Select Browsers : Google Chrome</div>
                        <div>Execution Mode : Headless</div>
                      </p>
                    </Card>
        
                    <Tree
                      className="CICD_tree"
                      value={tree_CICD}
                      selectionMode="single"
                      selectionKeys={selectedNodeKey}
                      onSelectionChange={onNodeSelect}
                      
                    />
                  </Dialog>
                </div>
              ),
              actions: (
                <div>
                  <Button icon="pi pi-pencil" className=" pencil_button p-button-edit"></Button>
                  <Button icon="pi pi-trash" className="p-button-edit"></Button>
                </div>
              ),
              };
          })   );
    }
  )();
  },[visible,visible_schedule,visible_CICD]);
  
  
 
  const onNodeSelect = (e) => {
    if (e && e.node && e.node.key) {
      setSelectedNodeKey(e.node.key);
    }
  };
  const onNodeSelect1 = (e) => {
    if (e && e.node && e.node.key) {
      setSelectRecurrenceKey(e.node.key);
    }
    
  };
  const Breadcrumbs = () => {
    // const [isOpen, setIsOpen] = useState(false);
    // const toggleDropdown = () => {
    //   setIsOpen(!isOpen);
    // };
    return (
      <nav>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginLeft: "1rem",
          }}
        >
          <li>
            <Link to="/landing"> Home </Link>
            <span> / </span>
            <span>Configure & Execute</span>
          </li>
        </ul>
      </nav>
    );
  };
  const footerContent_config = (
    <div className="btn-11">
      <Button label="Cancel" className="Cancle_button" />
      <Button className="execute_button" label="Execute" onClick={showSuccess_execute}></Button>
    </div>
  );
  const footerContent_CICD = (
    <div className="btn-11">
      <Button label="Cancel" className="Cancle_button" />
      <Button className="confirm_button" label="Confirm"></Button>
    </div>
  );
  const footerContent_Schedule = (
    <div className="btn-11">
      <Button label="Cancel" className="Cancle_button" />
      <Button className="Schedule_button" label="Schedule" onClick={showSuccess_Schedule}></Button>
    </div>
  );

  
  const handleRadioButtonChange = (value) => {
    setRadioButton_grid(value);
    setSelectedRadio(value);
  };
  
 
  
  // const staticData = [];
  // const staticData = [
  //   {
  //     sno: 1,
  //     profileName: (
  //       <div>
  //         <Checkbox  className="checkbox_header"/>
  //         <span>Regression</span>
  //       </div>
  //     ),
  //     executionOptions: (
  //       <div className="Buttons_config">
  //         <Button 
  //           style={{
  //             width: "8.5rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             marginLeft:'9.5rem',
  //             height:"2.5rem"
  //           }}
  //           onClick={() => setVisible(true)}
  //           size="small"
  //         >
  //           {" "}
  //           Execute Now
  //         </Button>
  //         <Dialog
  //           className="dialog_execute "
  //           header="Execute : Regression"
  //           visible={visible}
  //           style={{ width: "50vw" }}
  //           onHide={() => setVisible(false)}
  //           footer={footerContent_config}
  //         >
            
  //           <Card className="execute_card p-card p-card-body ">
  //             <p className="m-0 ">
  //               <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
  //               <div>Select Browsers : Google Chrome</div>
  //               <div>Execution Mode : Headless</div>
  //             </p>
  //           </Card>

  //           <div  className="radioButtonContainer">
  //             <RadioButton 
  //               value="Execute with Avo Assure Agent/ Grid"
  //               onChange={(e) => handleRadioButtonChange(e.value)}
  //               checked={
  //                 radioButton_grid === "Execute with Avo Assure Agent/ Grid"
  //               }
  //             />
  //             <label className="executeRadio_label_grid ml-2">
  //               Execute with Avo Assure Agent/ Grid
  //             </label>
  //             <div className="radioButtonContainer1">
  //             <RadioButton
  //               value="Execute with Avo Assure Client"
  //               onChange={(e) => handleRadioButtonChange(e.value)}
  //               checked={ingredient === "Execute with Avo Assure Client"}
  //             />
  //             </div>
  //             <label className=" executeRadio_label_clint ml-2">Execute with Avo Assure Client</label>
  //           </div>
  //           {/* <div className='adminControl-ice popup-content popup-content-status'> */}
  //           {/* <div> */}
  //           {selectedRadio === "Execute with Avo Assure Client" && (
  //             <div>
  //               <div className="legends-container">
  //                 <span className="legend_Status" title="Token Name">
  //                   Status:
  //                 </span>
  //                 <div className="legend">
  //                   <span id="status" className="status-available"></span>
  //                   <span className="legend-text">Available</span>
  //                 </div>
  //                 <div className="legend">
  //                   <span id="status" className="status-unavailable"></span>
  //                   <span className="legend-text">Unavailable</span>
  //                 </div>
  //                 <div className="legend">
  //                   <span id="status" className="status-dnd"></span>
  //                   <span className="legend-text">Do Not Disturb</span>
  //                 </div>
  //               </div>
  //               <div>
  //                 <span
  //                   className="execute_dropdown .p-dropdown-label "
  //                   title="Token Name"
  //                 >
  //                   Execute on
  //                 </span>
  //                 <Dropdown
  //                   className="dropdown_execute .p-inputtext"
  //                   placeholder="Search"
  //                 ></Dropdown>
  //               </div>
  //             </div>
  //           )}
  //           {/* </div> */}
  //           {/* </div> */}
  //         </Dialog>

  //         <Button 
  //           style={{
  //             width: "6rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             height:'2.5rem'
  //           }}
  //           onClick={() => setVisible_schedule(true)}
  //           size="small"
  //         >
  //           {" "}
  //           Schedule
  //         </Button>
  //         <Dialog
  //           className="dialog_Schedule"
  //           header="Schedule : Regression"
  //           visible={visible_schedule}
  //           style={{ width: "60vw" }}
  //           onHide={() => setVisible_schedule(false)}
  //           footer={footerContent_Schedule}
  //         >
  //           <Card className="Schedule_card  .p-card .p-card-content ">
  //             <p className="m-0 ">
  //               <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
  //               <div>Select Browsers : Google Chrome</div>
  //               <div>Execution Mode : Headless</div>
  //             </p>
  //           </Card>

  //           <Tree
  //             className="schedule_tree"
  //             value={treeData}
  //             selectionMode="single"
  //             selectionKeys={selectedNodeKey}
  //             onSelectionChange={onNodeSelect}
  //             // onToggle={onToggleNode}
  //           />
  //         </Dialog>
  //         <Button 
  //         style={{
  //           width: "4.5rem",
  //           fontFamily: "Open Sans",
  //           fontStyle: "normal",
  //           height:"2.5rem"
            
  //         }}
  //         size="small"
  //           onClick={() => setVisible_CICD(true)}
  //         >
  //           CI/CD
  //         </Button>
          
  //         <Dialog
  //           className="dialog_CICD"
  //           header="Execute : Regression"
  //           visible={visible_CICD}
  //           style={{ width: "50vw" }}
  //           onHide={() => setVisible_CICD(false)}
  //           footer={footerContent_CICD}
  //         >
  //           <Card className="Schedule_card  .p-card .p-card-content ">
  //             <p className="m-0 ">
  //               <div>Avo Agent:SBLTQAFFF Execution Mode : Headless</div>
  //               <div>Select Browsers : Google Chrome</div>
  //               <div>Execution Mode : Headless</div>
  //             </p>
  //           </Card>

  //           <Tree
  //             className="CICD_tree"
  //             value={tree_CICD}
  //             selectionMode="single"
  //             selectionKeys={selectedNodeKey}
  //             onSelectionChange={onNodeSelect}
              
  //           />
  //         </Dialog>
  //       </div>
  //     ),
  //     actions: (
  //       <div>
  //         <Button icon="pi pi-pencil" className=" pencil_button p-button-edit"></Button>
  //         <Button icon="pi pi-trash" className="p-button-edit"></Button>
  //       </div>
  //     ),
  //   },

  //   {
  //     sno: 2,
  //     profileName: (
  //       <div>
  //         <Checkbox  className="checkbox_header"/>
  //         <span>Performance</span>
  //       </div>
  //     ),
  //     executionOptions: (
  //       <div className="Buttons_config">
  //         <Button
  //           style={{
  //             width: "8.5rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             marginLeft:'9.5rem',
  //             height:'2.5rem'
  //           }}
  //           onClick={() => setVisible(true)}
  //           size="small"
  //         >
  //           {" "}
  //           Execute Now
  //         </Button>

  //         <Button
  //           style={{
  //             width: "6rem",
  //             height: "17px",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             height:"2.5rem"
  //           }}
  //           onClick={() => setVisible_schedule(true)}
  //           size="small"
  //         >
  //           Schedule
  //         </Button>
  //         <Button
  //           style={{
  //             width: "4.5rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             height:'2.5rem'
  //           }}
  //           onClick={() => setVisible_CICD(true)}
  //           size="small"
            
  //         >
  //           CI/CD
  //         </Button>
  //       </div>
  //     ),
  //     actions: (
  //       <div>
  //         <Button icon="pi pi-pencil" className=" pencil_button p-button-edit"></Button>
  //         <Button icon="pi pi-trash" className="p-button-edit"></Button>
  //       </div>
       
  //     ),
  //   },
  //   {
  //     sno: 3,
  //     profileName: (
  //       <div>
  //         <Checkbox className="checkbox_header" />
  //         <span>Regression</span>
  //       </div>
  //     ),
  //     executionOptions: (
  //       <div className="Buttons_config">
  //         <Button
  //           style={{
  //             width: "8.5rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             marginLeft:'9.5rem',
  //             height:"2.5rem"
  //           }}
  //           onClick={() => setVisible(true)}
  //           size="small"
  //         >
  //           {" "}
  //           Execute Now
  //         </Button>

  //         <Button
  //           style={{
  //             width: "6rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             height:'2.5rem'
  //           }}
  //           onClick={() => setVisible_schedule(true)}
  //           size="small"
  //         >
  //           Schedule
  //         </Button>
  //         <Button
  //           style={{
  //             width: "4.5rem",
  //             fontFamily: "Open Sans",
  //             fontStyle: "normal",
  //             height:"2.5rem"
  //           }}
  //           onClick={() => setVisible_CICD(true)}
  //           size="small"
  //         >
  //           CI/CD
  //         </Button>
  //       </div>
  //     ),
  //     actions: ( 
  //       <div>
  //         <Button icon="pi pi-pencil" className=" pencil_button p-button-edit"></Button>
  //         <Button icon="pi pi-trash" className="p-button-edit"></Button>
  //       </div>
       
  //     ),
  //   },
  // ];
  const tabMenuItems = configList.length > 0
  ? [...items, { label: <Button className="delete_button" size="small"> Delete</Button> }, { label:<Button className="addConfi_button" size="small"> Add Configuration</Button> }]
  : items;
  const checkboxHeaderTemplate = () => {
    return (
      <>
        <Checkbox classname=" checkbox_header" />
        <span>Configuration Profile Name</span>
      </>
    );
  };

  const renderTable = () => {
    if (configList.length > 0) {
      return (
        <>
     
          <DataTable
            className="  datatable_list p-datatable p-datatable-thead > tr > th "
            value={configList}
            style={{
              width: "100%",
              height: "calc(100vh - 250px)",
              marginRight: "-1rem",
            }}
          >
            <Column
              style={{ fontWeight: "normal", fontFamily: "open Sans" }}
              field="sno"
              header="S.No."
            />
            <Column
              style={{
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginLeft: "11rem",
              }}
              field="profileName"
              header={checkboxHeaderTemplate}
            />
            <Column
              style={{
                fontWeight: "normal",
                fontFamily: "open Sans",
                marginRight: "23rem",
              }}
              field="executionOptions"
              header={<span className="executionOption-header">Execution Options</span>}
            />
            <Column
              style={{ fontWeight: "normal", fontFamily: "open Sans",marginleft:'7rem',textAlign: "left" }}
              field="actions"
              header={<span className="actions-header">Actions</span>}
            />
          </DataTable>
        </>
      );
    } else {
      return (
        <Panel
          className="config_header config_content"
          header={
            <div>
              <span
                style={{
                  marginRight: "13rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                S.No.
              </span>
              <span
                style={{
                  marginRight: "13rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                {" "}
                <Checkbox /> Configuration Profile Name
              </span>
              <span
                style={{
                  marginRight: "18rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                Execution Options
              </span>
              <span
                style={{
                  marginRight: "1rem",
                  fontWeight: "normal",
                  fontFamily: "open Sans",
                }}
              >
                Actions
              </span>
            </div>
          }
        >
          <div className="no_card_content1">
            <div className="image-container1">
              <img
                className="img1"
                
                alt="Card"
                src="static/imgs/execution_report.png"
              />
              <span className="text1 ">No Configuration's yet</span>
            </div>
          </div>
          <Button className='configure_button' onClick={() => setVisible(true)}> configure </Button>
        </Panel>
      );
    }
  };
  return (
    <>
      <div>
        <Breadcrumbs />
        
        <div>
      {configList.length > 0 ? (
        <div>
          <TabMenu className=" tabs tab-menu" model={tabMenuItems} />
          
            
         
        </div>
      ) : (
        <div>
            <TabMenu className="tab-menu" model={items} />
         
        </div>
      )}
    </div>
        <div className="ConfigurePage_container  m-2">{renderTable()}</div>
        <AvoModal
        visible={visible}
        setVisible={setVisible}
        onModalBtnClick={onModalBtnClick}
        content={<ConfigureSetup configData={getConfigData} />}
        headerTxt="Execution Configuration set up"
        footerType="CancelNext"
        modalSytle={{ width: "85vw", height: "94vh", background: "#FFFFFF" }}
      />
      </div>
      <Toast ref={toast} position="bottom-center" />
    </>
  )}

export default ConfigurePage;

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/CreateProject.scss';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { getUserDetails, userCreateProject_ICE } from '../api';
import { useSelector, useDispatch } from 'react-redux';

import { loadUserInfoActions } from '../LandingSlice';





const CreateProject = ({ visible, onHide }) => {
  const [value, setValue] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const toast = useRef(null);
  const [selectedRole, setSelectedRole] = useState({ Admin: '' });
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [displayUser, setDisplayUser] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedAssignedCheckboxes, setSelectedAssignedCheckboxes] = useState([]);
  const [selectallAssaigned, setSelectallAssaigned] = useState(false);
  const [queryDisplayUser, setQueryDisplayUser] = useState('');
  const [items, setItems] = useState([])
  const [projectData, setProjectData] = useState([]);
  const dispatch = useDispatch();
  const [refreshData, setRefreshData] = useState(false);
  const toastSuccess = useRef(null);
  const toastError = useRef(null);
  const toastContainerRef = useRef(null);



  const userDetails = async () => {
    try {
      const userData = await getUserDetails("user");
      console.log(userData);
      const formattedData = userData.map((user) => {
        const [name, id, , primaryRole, firstname, lastname, email] = user;
        return { id, name, primaryRole, firstname, lastname, email };
      });

      setItems(formattedData
        .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
        .filter(item => item.primaryRole !== "Admin")
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(item => ({
          ...item, selectedRole: '',
          initials: getInitials(item.firstname, item.lastname)
        })));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    userDetails()
  }, [])

  function getInitials(firstname, lastname) {
    const initials = firstname.charAt(0).toUpperCase() + lastname.charAt(0).toUpperCase();
    return initials;
  }






  const apps = [
    { name: 'Web', code: 'NY', image: 'static/imgs/web.png' },
    { name: 'Sap', code: 'RM', image: 'static/imgs/SAP.png' },
    { name: 'Oebs', code: 'LDN', image: 'static/imgs/OEBS.png' },
    { name: 'DeskTop', code: 'IST', image: 'static/imgs/desktop.png' },
    { name: 'Webservices', code: 'PRS', image: 'static/imgs/webService.png' },
    { name: 'Mainframe', code: 'PRS', image: '/static/imgs/mainframe.png' },
    { name: 'Mobile Web', code: 'PRS', image: 'static/imgs/mobileWeb.png' },
    { name: 'Mobile Apps', code: 'PRS', image: '/static/imgs/mobileApps.png' },
  ];

  const roles = [
    { name: 'Test Manager' },
    { name: 'Test Lead' },
    { name: 'QA' },
  ];

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const assignedUser = [];

    if (value === "all") {
      if (checked) {
        for (var i = 0; i < items.length; i++) {
          assignedUser.push({ id: items[i].id, name: items[i].name, primaryRole: items[i].primaryRole });
        }
        setSelectedCheckboxes(assignedUser);
      } else {
        setSelectedCheckboxes([]);
      }
      setSelectAll(checked);
    } else {
      setSelectedCheckboxes((prevSelectedCheckboxes) => {
        if (checked) {
          return [
            ...prevSelectedCheckboxes,
            { id: value, name: items.find((item) => item.id === value)?.name || "" }
          ];
        } else {
          return prevSelectedCheckboxes.filter(
            (checkbox) => checkbox.id !== value
          );
        }
      });
      setSelectAll(false);
    }
  };

  function handleSearch(event) {
    setQuery(event.target.value);
  }
  function handleSearchDisplayUser(event) {
    setQueryDisplayUser(event.target.value);
  }

  function getFilteredItems() {
    return items
      .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
      .filter(item => item.primaryRole !== "Admin")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => ({ ...item, selectedRole: '' }));
  }


  function getFilteredDisplayUser() {
    return displayUser
      .filter(item => item.name.toLowerCase().includes(queryDisplayUser.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleClose = () => {
    onHide();
    setRefreshData(!refreshData);
  };


  const handleButtonClick = () => {
    const filteredItems = items.filter(
      (item) => !selectedCheckboxes.some((checkbox) => checkbox.id === item.id)
    );
    setItems(filteredItems);

    const assignedUsers = items.filter(
      (item) => selectedCheckboxes.some((checkbox) => checkbox.id === item.id)
    );

    setDisplayUser((prevAssignedUsers) => [
      ...prevAssignedUsers,
      ...assignedUsers

    ]);
    console.log(assignedUsers)
    setSelectedCheckboxes([]);
    setSelectAll(false);
  };


  //unassigning users

  const handleAssignedCheckboxChange = (event) => {
    const { value, checked } = event.target;
    const unassignedUsers = [];

    if (value === "all") {
      if (checked) {
        for (var i = 0; i < displayUser.length; i++) {
          unassignedUsers.push({ id: displayUser[i].id, name: displayUser[i].name, primaryRole: displayUser[i].primaryRole });
        }
        setSelectedAssignedCheckboxes(unassignedUsers);
      }
      else {
        setSelectedAssignedCheckboxes([]);
      }
      setSelectallAssaigned(checked);
    }
    else {
      setSelectedAssignedCheckboxes((prevSelectedAssignedCheckboxes) => {
        if (checked) {
          return [
            ...prevSelectedAssignedCheckboxes,
            { id: value, name: displayUser.find((item) => item.id === value)?.name || "" }
          ];
        } else {
          return prevSelectedAssignedCheckboxes.filter(
            (checkboxId) => checkboxId.id !== value
          );
        }
      });
      setSelectallAssaigned(false);
    }
  };

  const handleMoveBack = () => {
    const filteredAssignedItems = displayUser.filter(
      (item) => !selectedAssignedCheckboxes.some((checkbox) => checkbox.id === item.id)
    );
    const unassignedUsers = displayUser.filter(
      (item) => selectedAssignedCheckboxes.some((checkbox) => checkbox.id === item.id)
    );
    setItems((prevItems) => [...prevItems, ...unassignedUsers]);
    setDisplayUser(filteredAssignedItems);
    setSelectedAssignedCheckboxes([]);
    setSelectallAssaigned(false);

  };


  const handleRoleChange = (e, id) => {
    const newItems = [...items];
    for (let thisItem of newItems) {
      if (thisItem.id === id) {
        thisItem.selectedRole = e.value
      }
    }
    setItems(newItems);
    // setSelectedRole({
    //   ...selectedRole,
    //   Admin: e.value
    // });
    console.log(id)
  };

  useEffect(() => {
    setSelectedApp('');
    setValue('');
    setDisplayUser([])
    userDetails()
  }, [refreshData])

  const handleCreate = async () => {
    if (value !== "" && selectedApp !== "" && displayUser.length !== 0) {
      const filteredUserDetails = displayUser.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.selectedRole ? user.selectedRole.name : user.primaryRole,
      }));

      var projData = {
        projectName: value,
        type: selectedApp.name,
        assignedUsers: filteredUserDetails,
        domain: "banking",
        releases: [{ name: "R1", cycles: [{ name: "C1" }] }],
      };

      const project = await userCreateProject_ICE(projData);

      if (project === "invalid_name_spl") {
        toastError.current.show({
          severity: "error",
          summary: "Invalid Project Name",
          detail: "Special characters are not allowed in the project name",
          life: 3000,
        });
      }
      else {
        toastSuccess.current.show({
          severity: "success",
          summary: "Project Created Successfully",
          detail: "Project Created Successfully",
          life: 1000,
        });
        dispatch(loadUserInfoActions.savedNewProject(true))
        onHide();
        setRefreshData(!refreshData);
      }
    }
  };




  const handleCloseToast = () => {
    setShowToast(false);
  };

  const footerContent = (
    <div className='btn-11'>
      <Button label="Cancel" severity="secondary" text className='btn1' onClick={handleClose} />
      <Button className="btn2" label='Create' disabled={value === "" || selectedApp === "" || displayUser.length === 0} onClick={handleCreate}></Button>
    </div>
  );
  const optionTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <img src={option.image} alt={option.label} width="20" height="20" style={{ marginRight: '8px' }} ></img>
        <div>{option.label}{option.name}</div>
      </div>
    );
  };


  return (
    <>
      <div ref={toastContainerRef} className="toast-container" />
      <Toast
        ref={toastError}
        position="top-right"
      // className="custom-toast"
      />
      <Dialog className='Project-Dialog' header="Create Project" visible={visible} style={{ width: "74.875rem" }} onHide={handleClose} footer={footerContent}>
        <Card className='project-name-1'>
          <div className='pro-name1'>
            < h5 className='proj__name'> Project Name <span className="imp-cls"> * </span> </h5>
            <InputText className="proj-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter Project Name" />
            <div className='dropdown-1'>
              <h5 className='application__name'>Application Type <span className="imp-cls"> * </span></h5>
              <Dropdown value={selectedApp} onChange={(e) => setSelectedApp(e.value)} options={apps} optionLabel="name"
                placeholder="Select a appType" itemTemplate={optionTemplate} className="w-full md:w-28rem app-dropdown vertical-align-middle text-400 " />
            </div>
          </div>

        </Card>
        <Card className='card11' style={{ height: '25rem' }}>
          <div className="card-input1">
            <h5 className='select-users'>Select Users <span className="imp-cls"> * </span></h5>
            <div className='selectallbtn'>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText placeholder="Search users by name or email address" className='usersearch md:w-31rem ' onChange={handleSearch} value={query} />
              </span>
            </div>
          </div>

          <div className='user-select-checkbox '>
            <div className='check1'>
              <Checkbox checked={selectAll} onChange={handleCheckboxChange} value="all" ></Checkbox>
              <h5 className='label1'> Select All</h5>
            </div>
            <div className='dropdown_role'>
              <h5>Project level role(optional)</h5>
            </div>
            <div className="check2">
              {items.map(item => (

                <div key={item.id} className="users-list">
                  <Checkbox className=" checkbox1" inputId={`checkbox-${item.id}`} name="item" value={item.id} checked={selectedCheckboxes.some((cb) => cb.id === item.id)} onChange={handleCheckboxChange} />
                  <h5 htmlFor={`checkbox-${item.id}`} className="label-2 ml-2 mr-2 mt-2 mb-2" title={item.email} >

                    <span className='user-avatar'> <Avatar className='user-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff', width: '27px', height: '26px' }} >{item.initials}</Avatar></span>

                    <span className='user-name'> {item.name}</span>
                    <span className='user-role'>{item.primaryRole}</span>

                    <span className='tooltip'></span>

                  </h5>
                  <Dropdown value={(item.selectedRole) ? item.selectedRole : ''} onChange={(e) => handleRoleChange(e, item.id)} options={roles} optionLabel="name"
                    // valueTemplate={(option) => {
                    //   return (
                    //     <>
                    //       {option && (
                    //         <div className="selected-role">
                    //           <span>{option.name}</span>
                    //           <button
                    //             className="cancel-selection"
                    //             onClick={handleCancelSelection}
                    //           >
                    //             &#10005;
                    //           </button>
                    //         </div>
                    //       )}
                    //     </>
                    //   );
                    // }}
                    placeholder="Select a Role" className="role-dropdown" />

                </div>


              ))}
            </div>
          </div>


        </Card>

        <Button className="gtbtn" label='>' onClick={handleButtonClick} >  </Button>
        <Button className="ltbtn" label='<' onClick={handleMoveBack}  >   </Button>


        <Card className='card22' style={{ height: '25rem' }}>
          <div className='card-input2'>
            <h5 className='selected-users'>Selected Users <span className="imp-cls"> * </span></h5>
            <div className='selectallbtn'>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText placeholder="Search users by name or email address" className='selecteduser' onChange={handleSearchDisplayUser} value={queryDisplayUser} />
              </span>
            </div>

          </div>
          <div className='checkbox-2'>
            <Checkbox value='all' checked={selectallAssaigned} onChange={handleAssignedCheckboxChange}></Checkbox>
            <h5 className='label1'> Select All</h5>
          </div>

          <div className='check-bx3'>
            <ul>
              {displayUser.map((checkboxId) => (
                <>
                  <Checkbox key={checkboxId.id} className="assigned-checkbox" inputId={checkboxId.id} value={checkboxId.id} checked={selectedAssignedCheckboxes.some((ab) => ab.id === checkboxId.id)}
                    onChange={handleAssignedCheckboxChange}
                  >{checkboxId} </Checkbox>
                  <h5 htmlFor={checkboxId.id} className="label-3 ml-2 mr-2 mt-2 ">
                    <span className='asgnd-avatar'> <Avatar className='asgnd-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff', width: '27px', height: '26px' }} >{checkboxId.initials}</Avatar></span>
                    <span className='asgnd-name'> {checkboxId.name} </span>
                    <span className='asgnd-role'>{!checkboxId.selectedRole.name ? checkboxId.primaryRole : checkboxId.selectedRole.name}</span>

                  </h5>
                </>

              ))}
            </ul>

          </div>


        </Card>
      </Dialog>
      <Toast ref={toastSuccess} position="bottom-right" />
      <Toast
        ref={toastError}
        position="bottom-center"

      />

    </>
  )
}


export default CreateProject;

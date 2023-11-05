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
import { getUserDetails, userCreateProject_ICE ,getUsers_ICE , userUpdateProject_ICE} from '../api';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserInfoActions } from '../LandingSlice';

const CreateProject = (props) => {
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
  let userInfo = useSelector((state) => state.landing.userinfo);
  const [isInvalidProject, setIsInvalidProject] = useState(false);
  const [createProjectCheck,setCreateProjectCheck]=useState(true);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [projectAssignedUsers, setProjectAssignedUsers] = useState([]);
  const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
  const [unFilteredData, setUnFilteredData] = useState([]);
  const [unFilteredAssaignedData, setUnFiltereAssaignedData] = useState([]);


  const isBase64 = (str) => {
    if (typeof str !== 'string') {
    return false;
    }
    const len = str.length;
    if (len === 0 || len % 4 !== 0 || /[^A-Z0-9+/=]/i.test(str)) {
    return false;
    }
    const firstPaddingChar = str.indexOf('=');
    return firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && str[len - 1] === '=');
    };


  const userDetails = async () => {
    userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if(userInfo){
    try {
      let userData = [];
      if(props.handleManageProject) {
        const users_obj = await getUsers_ICE(reduxDefaultselectedProject.projectId);
        userData = users_obj["unassignedUsers"];
        let formattedData = [];
        for(let user of userData) {
          const {name, _id, defaultrole, firstname, lastname, email,profileimage} = user;
          formattedData.push({ id: _id, name, primaryRole: defaultrole.name, firstname, lastname, email,profileimage });
        }
        // const formattedData = userData.map((user) => {
        //   const {name, _id, defaultrole, firstname, lastname, email} = user;
        //   return { id: _id, name, primaryRole: defaultrole, firstname, lastname, email };
        // });
        let newFormattedData = [];
        for (let item of formattedData) {
          if (item.profileimage && isBase64(item.profileimage)) {
            item.profileimage = `data:image/jpeg;base64,${item.profileimage}`;
            }
          if ((item.name.toLowerCase().includes(query.toLowerCase())) && (item.primaryRole !== "Admin")) {
            newFormattedData.push({
              ...item, selectedRole: '',
              initials: getInitials(item.firstname, item.lastname)
            });
          }
        }
        setItems(newFormattedData.sort((a, b) => a.name.localeCompare(b.name)));
        setUnFilteredData(newFormattedData.sort((a, b) => a.name.localeCompare(b.name)));
        setDisplayUser(users_obj["assignedUsers"].map((user)=> ({
          email: user.email,
          firstname: user.firstname,
          id: user._id,
          initials: getInitials(user.firstname, user.lastname),
          lastname: user.lastname,
          name: user.name,
          profileimage: user.profileimage,
          primaryRole: user.assignedrole.name,
          selectedRole: user.assignedrole.name
        })));
        setUnFiltereAssaignedData(users_obj["assignedUsers"].map((user)=> ({
          email: user.email,
          firstname: user.firstname,
          id: user._id,
          initials: getInitials(user.firstname, user.lastname),
          lastname: user.lastname,
          name: user.name,
          profileimage: user.profileimage,
          primaryRole: user.assignedrole.name,
          selectedRole: user.assignedrole.name
        })));
        const selectedProjectAppType = appTypes.find(appType => appType.code === reduxDefaultselectedProject.appType);
        setSelectedApp({code:selectedProjectAppType.code, image:selectedProjectAppType?.image, name:selectedProjectAppType?.name});
        setValue(reduxDefaultselectedProject.projectName);
      }
      else {
        userData = await getUserDetails("user"); 
        const formattedData = userData.map((user) => {
          const [name, id, ,primaryRole, firstname, lastname, email,profileimage] = user;
          return { id, name, primaryRole, firstname, lastname, email,profileimage};
        });    
        let loggedInUser = null;
        let newFormattedData = [];
        for (let item of formattedData) {
          if (item.profileimage && isBase64(item.profileimage)) {
            item.profileimage = `data:image/jpeg;base64,${item.profileimage}`;
            }
          if ((item.name.toLowerCase().includes(query.toLowerCase())) && (item.primaryRole !== "Admin")) {
            if(item.id ===  userInfo.user_id) {
              loggedInUser = {
                ...item, selectedRole: "",
                initials: getInitials(item.firstname, item.lastname)
              };
            } else {
              newFormattedData.push(
                {
                  ...item, selectedRole: '',
                  initials: getInitials(item.firstname, item.lastname)
                }
              )
            }
          }
        }
        setItems(newFormattedData.sort((a, b) => a.name.localeCompare(b.name)));
        setUnFilteredData(newFormattedData.sort((a, b) => a.name.localeCompare(b.name)));
        setDisplayUser(loggedInUser !== null ? [loggedInUser] : []);
        setUnFiltereAssaignedData(loggedInUser !== null ? [loggedInUser] : []);
      }
    } catch (error) {
      console.error(error);
    }
  }
  };


  function getInitials(firstname, lastname) {
    const initials = firstname.charAt(0).toUpperCase() + lastname.charAt(0).toUpperCase();
    return initials;
  }

  const applicationLicenseCheck = {
    notALicenseWeb :{
      value: userInfo?.licensedetails?.WEBT === false,
      msg: 'You do not have access to create WEB project'
    },
    notALicenseSAP : {
      value: userInfo?.licensedetails?.ETSAP === false,
      msg: 'You do not have access to create SAP project'
    },
    notALicenseOEBS : {
      value: userInfo?.licensedetails?.ETOAP === false,
      msg: 'You do not have access to create OEBS project'
    },
    notALicenseDesktop : {
      value: userInfo?.licensedetails?.DAPP === false,
      msg: 'You do not have access to create Desktop project'
    },
    notALicenseWebservice :{
      value: userInfo?.licensedetails?.APIT === false,
      msg: 'You do not have access to create Webservice project'
    },
    notALicenseMainframe : {
      value: userInfo?.licensedetails?.MF === false,
      msg: 'You do not have access to create Mainframe project'
    },
    notALicenseMobileweb : {
      value: userInfo?.licensedetails?.MOBWT === false,
      msg: 'You do not have access to create MobileWeb project'
    },
    notALicenseMobileApp  : {
      value: userInfo?.licensedetails?.MOBT === false,
      msg: 'You do not have access to create MobileApplication project'
    }
  }

  const apps = [
    { name: 'Web', code: 'Web', image: 'static/imgs/Web.svg', disabled: applicationLicenseCheck.notALicenseWeb.value ,title: applicationLicenseCheck.notALicenseWeb.msg },
    { name: 'SAP', code: 'SAP', image: 'static/imgs/SAP.svg', disabled: applicationLicenseCheck.notALicenseSAP.value ,title:applicationLicenseCheck.notALicenseSAP.msg},
    { name: 'Oracle Applications', code: 'OEBS', image: 'static/imgs/OEBS.svg', disabled: applicationLicenseCheck.notALicenseOEBS.value ,title:applicationLicenseCheck.notALicenseOEBS.msg},
    { name: 'Desktop', code: 'Desktop', image: 'static/imgs/desktop.png', disabled: applicationLicenseCheck.notALicenseDesktop.value,title:applicationLicenseCheck.notALicenseDesktop.msg},
    { name: 'Web Services', code: 'Webservice', image: 'static/imgs/WebService.png', disabled: applicationLicenseCheck.notALicenseWebservice.value, title:applicationLicenseCheck.notALicenseWebservice.msg},
    { name: 'Mainframe', code: 'Mainframe',image: '/static/imgs/mainframe.png', disabled: applicationLicenseCheck.notALicenseMainframe.value,title:applicationLicenseCheck.notALicenseMainframe.msg},
    { name: 'Mobile Web', code: 'MobileWeb', image: 'static/imgs/mobileWeb.png', disabled: applicationLicenseCheck.notALicenseMobileweb.value , title:applicationLicenseCheck.notALicenseMobileweb.msg},
    { name: 'Mobile Application', code: 'MobileApp', image: '/static/imgs/mobileApps.png', disabled: applicationLicenseCheck.notALicenseMobileApp.value, title:applicationLicenseCheck.notALicenseMobileApp.msg},
    { name: 'System Application', code: 'System',value:'5db0022cf87fdec084ae49b5', image: 'static/imgs/System_application.svg' },
  ];
  const appTypes = [
    { name: 'Web', code: 'Web',value:'5db0022cf87fdec084ae49b6', image: 'static/imgs/Web.svg' },
    { name: 'SAP', code: 'SAP', value:'5db0022cf87fdec084ae49b4', image: 'static/imgs/SAP.svg' },
    { name: 'Oracle Applications', code: 'OEBS', value:'5db0022cf87fdec084ae49b3', image: 'static/imgs/OEBS.svg' },
    { name: 'Desktop', code: 'Desktop', value:'5db0022cf87fdec084ae49af', image: 'static/imgs/desktop.png' },
    { name: 'Web Services', code: 'Webservice',value:'5db0022cf87fdec084ae49b7', image: 'static/imgs/WebService.png' },
    { name: 'Mainframe', code: 'Mainframe', value:'5db0022cf87fdec084ae49b0',image: '/static/imgs/mainframe.png' },
    { name: 'Mobile Web', code: 'MobileWeb',value:"5db0022cf87fdec084ae49b2", image: 'static/imgs/mobileWeb.png' },
    { name: 'Mobile Application', code: 'MobileApp',value:'5db0022cf87fdec084ae49b1', image: '/static/imgs/mobileApps.png' },
    { name: 'System Application', code: 'System',value:'5db0022cf87fdec084ae49b5', image: 'static/imgs/System_application.svg' },
  ];

  const roles = [
    { name: 'Quality Manager' },
    { name: 'Quality Lead' },
    { name: 'Quality Engineer' },
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
    const inputValue= event.target.value.toLowerCase();
    setQuery(inputValue);
    if (inputValue !== "") {
      const filterData = items.filter((item) =>
        item.name.toLowerCase().includes(inputValue)
      );
      setItems(filterData);
    } else {
      setItems(unFilteredData);
    }
  }


  function handleSearchDisplayUser(event) {
    const inputValue = event.target.value.toLowerCase();
    setQueryDisplayUser(inputValue);
  
    if (inputValue !== "") {
      const filterDataDisplayUser = displayUser.filter((item) =>
        item.name.toLowerCase().includes(inputValue)
      );
      setDisplayUser(filterDataDisplayUser);
    } else {
      setDisplayUser(unFilteredAssaignedData);
    }
  }

  // function handleSearchDisplayUser(event) {
  //   setQueryDisplayUser(event.target.value);
  //   if(event.target.value !== ""){
  //   const filterDataDisplayUser = displayUser.filter(item => item.name.toLowerCase().includes(queryDisplayUser.toLowerCase()))
  //   setDisplayUser(filterDataDisplayUser)
  //   }
  //   else{
  //     setDisplayUser(unFilteredAssaignedData)
  //   }
  // }


  const handleClose = () => {
    setQuery("");
    setQueryDisplayUser(""); 
    props.onHide();
    setRefreshData(!refreshData);
    props.setHandleManageProject(false);
   
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
    setUnFiltereAssaignedData((prevAssignedUsers) => [
      ...prevAssignedUsers,
      ...assignedUsers
    ]);
    setUnFilteredData(unFilteredData.filter(
      (item) => !selectedCheckboxes.some((checkbox) => checkbox.id === item.id)
    ));
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
    setUnFilteredData([...unFilteredData, ...unassignedUsers]);
    setDisplayUser(filteredAssignedItems);
    setUnFiltereAssaignedData((prevAssignedUsers) => prevAssignedUsers.filter(
      (item) => !selectedAssignedCheckboxes.some((checkbox) => checkbox.id === item.id)
    ));
    setSelectedAssignedCheckboxes([]);
    setSelectallAssaigned(false);

  };

  const handleAppTypeChange = (e)=>{
    if (e && e.value) {
      setSelectedApp(e.value);
      console.log(e.value);
    }
  }


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
  };

  useEffect(() => {
    setSelectedApp('');
    setValue('');
    setDisplayUser([])
    userDetails()
  }, [refreshData])

  const handleValueChange = (event) => {
    setValue(event.target.value);
    setIsInvalidProject(event.target.value === "invalid_name_spl");
  };

/////////////// CREATE PROJECT///////////////////////////////////////////
   const handleCreate = async () => {
    let projectList=props?.projectsDetails?.map(project=>project.name.trim())
    if (value !== "" && selectedApp !== "" && displayUser.length !== 0) {
      const filteredUserDetails = displayUser.map((user) => ({
        id: user.id,
        name: user.name,
        role: user.selectedRole ? user.selectedRole.name : user.primaryRole,
      }));
      if (projectList?.length>0 && projectList.includes(value.trim())) {
        props.toastError('The project name already exists.');
        return; // Do not proceed further
      }

      var projData = {
        projectName: value,
        type: selectedApp.code,
        assignedUsers: filteredUserDetails,
        domain: "banking",
        releases: [{ name: "R1", cycles: [{ name: "C1" }] }],
      };

     try {
      const projectRes = await userCreateProject_ICE(projData);

      if (projectRes && projectRes.error) {
        props.toastError(projectRes.error);
        return;
      } else if(projectRes === "fail") {
        props.toastError("Failed to create Project");
        return;
      }

      if (projectRes === "invalid_name_spl") {
        setIsInvalidProject(true);
        return;
      }
      setIsInvalidProject(false)
      props.toastSuccess("Project Created Successfully");
      dispatch(loadUserInfoActions.savedNewProject(true));
      props.onHide();
      setRefreshData(!refreshData);
    } catch (error){
      console.error("API request failed:", error);

      props.toastError("Failed to create Project");
      }
    }
  };

  /////////////////////////////////////// MANAGE PROJECT////////////////////////////////////////////////////////////////
 const handleUpdateProject = async () => {

    const filteredUserDetails = displayUser.map((user) => ({
      id: user.id,
      name: user.name,
      role: !user.selectedRole.name ? user.primaryRole : user.selectedRole.name
    }));

    var upadtedProjData = {
      projectName: value,
      type: selectedApp.code,
      assignedUsers: filteredUserDetails,
      domain: "banking",
      project_id : reduxDefaultselectedProject.projectId,
      releases: [{ name: "R1", cycles: [{ name: "C1" }] }],
    };

    const manageProject= await userUpdateProject_ICE(upadtedProjData)

    props.toastSuccess("Project Modified Successfully");
     props.onHide();

  }

  const dialogHeader = props.handleManageProject ? 'Manage Project' : 'Create Project';

  const isDisabledProjectName = props.handleManageProject;
  const isDisabledAppType = props.handleManageProject;


  const footerContent = (
    <div className='btn-11'>
      <Button label="Cancel" severity="secondary" text className='btn1' onClick={handleClose} />
      <Button className="btn2" label={props.handleManageProject ? 'Update': 'Create'} disabled={value === "" || selectedApp === "" || displayUser.length === 0} onClick={props.handleManageProject ? handleUpdateProject : handleCreate}></Button>
    </div>
  );
  const optionTemplate = (option) => {
    if (option.disabled) {
      return (
        <span className="disabled_icon_tootlip" title={option.disabled ? option.title : null}>
          <img src={option.image} alt={option.label} width="20" height="20" style={{ marginRight: '8px' }}></img>
          <div>{option.label}{option.name}</div>
        </span>
      );
    } else {
      return (
        <div className="flex align-items-center">
          <img src={option.image} alt={option.label} width="20" height="20" style={{ marginRight: '8px' }} ></img>
          <div>{option.label}{option.name}</div>
        </div>
      );
    }
  }


  return (
    <>
      <Toast ref={toast} position="bottom-center" baseZindex={10000}/>
      <Dialog className='Project-Dialog' header={dialogHeader} visible={props.visible} style={{ width: "74.875rem" }} onHide={handleClose} footer={footerContent}>
        <Card className='project-name-1'>
          <div className='pro-name1'>
            < h5 className='proj__name' disabled={isDisabledProjectName} style={{opacity:!isDisabledAppType ? 1 : 0.5, appearance:'none'}} > Project Name <span className="imp-cls"> * </span> </h5>
            <InputText  className={`proj-input ${isInvalidProject ? 'p-invalid' : ''}`} value={value}  onChange={handleValueChange}  disabled={isDisabledProjectName} style={{opacity:!isDisabledAppType ? 1 : 0.6,background: !isDisabledAppType ? '' :'lightgray',color:'black' , cursor:isDisabledProjectName ? 'not-allowed ' : 'pointer'}} placeholder="Enter Project Name" />
            {isInvalidProject && (
          <small className="p-error error-message">Special characters are not allowed in the project name</small> )}
            <div className='dropdown-1'>
              <h5 className='application__name' disabled={isDisabledAppType}  style={{opacity:!isDisabledAppType ? 1 : 0.5,  cursor:isDisabledAppType ? 'not-allowed ' : 'pointer'}}>Application Type <span className="imp-cls"> * </span></h5>
              <Dropdown value={selectedApp} onChange={(e) =>handleAppTypeChange(e)} options={apps} disabled={isDisabledAppType}  style={{opacity:!isDisabledAppType ? 1 : 0.6, background:!isDisabledAppType ? '' :'lightgray',color:'black' , cursor:!isDisabledAppType ?'pointer' : 'not-allowed' ,}} optionLabel="name"
                placeholder="Select an Application Type" itemTemplate={optionTemplate} className="w-full md:w-28rem app-dropdown vertical-align-middle text-400 " optionDisabled={(option) => option.disabled} />
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
            <div className=''>
              <div className='check1'>
                <Checkbox checked={selectAll} onChange={handleCheckboxChange} value="all" ></Checkbox>
                <h5 className='label1'> Select All</h5>
              </div>
              <div className='dropdown_role'>
                <h5>Project level role(optional)</h5>
              </div>
            </div>
            <div className="check2">
              {items.map(item => (

             <div key={item.id} className="users-list" title={item.email}>
                  <Checkbox className=" checkbox1" inputId={`checkbox-${item.id}`} name="item" value={item.id} checked={selectedCheckboxes.some((cb) => cb.id === item.id)} onChange={handleCheckboxChange} />
                  <div htmlFor={`checkbox-${item.id}`} className="label-2 ml-2 mr-2 mt-2 mb-2" >
                    <div  className='user-info' >
                      <span className='user-avatar'> 
                      <Avatar className='user-av bg-blue-300 text-900' shape="circle" style={{ width: '27px', height: '26px' }} 
                              image= {item.profileimage ? item.profileimage : ''} 
                               label={item.initials} 
                               />
                               </span>
                      <div className='name_And_Role'>
                        <span className='user-name'> {item.name}</span>
                        <span className='user-role'>{item.primaryRole}</span>
                        <span className='tooltip'></span>
                      </div>
                    </div>

                  </div>
                  <div className='role__dd'>
                    <Dropdown value={(item.selectedRole) ? item.selectedRole : ''} onChange={(e) => handleRoleChange(e, item.id)} options={roles} optionLabel="name"
                      placeholder="Select a Role" className="role-dropdown" />
                  </div>

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
          <div className='user-list-container' style={{ height: '18rem', overflowY: 'auto' }}>
          <div className='checkbox-2'>
            <Checkbox value='all' checked={selectallAssaigned} onChange={handleAssignedCheckboxChange}></Checkbox>
            <h5 className='label1'> Select All</h5>
          </div>
          <div className='check-bx3'>
            <ul>
            {displayUser.length>0?displayUser.map((checkboxId) => (
                <div className="selected_users__list">
                  <Checkbox key={checkboxId.id} className="assigned-checkbox" inputId={checkboxId.id} value={checkboxId.id} checked={selectedAssignedCheckboxes.some((ab) => ab.id === checkboxId.id)}
                    onChange={handleAssignedCheckboxChange}
                  >{checkboxId} </Checkbox>
                  <h5 htmlFor={checkboxId.id} className="label-3 ml-2 mr-2 mt-2 " title={checkboxId.email}>
                    <div className="nameRole_user">
                      <span className='asgnd-avatar'> <Avatar className='asgnd-av bg-blue-300 text-900' shape="circle"
                      style={checkboxId.profileimage ? { width: '26px', height: '23px', fontSize: "13px",position:'relative', top:'0.4rem'} : { width: '26px', height: '23px', fontSize: "13px"} }
                      image={checkboxId.profileimage ? checkboxId.profileimage  : ''}
                      label={checkboxId.initials}
                      /></span>
                      <span className='asgnd-name'> {checkboxId.name} </span>
                      <span className='asgnd-role'>{!checkboxId.selectedRole.name ? checkboxId.primaryRole : checkboxId.selectedRole.name}</span>
                    </div>
                  </h5>
                </div>
                )):null}
            </ul>
          </div>
          </div>
        </Card>
      </Dialog>
    
    </>
  )
}


export default CreateProject;

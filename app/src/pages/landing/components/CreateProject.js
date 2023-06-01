import React, { useState, useRef, useEffect} from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/CreateProject.scss';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import { Avatar } from 'primereact/avatar';
import { getUserDetails, userCreateProject_ICE } from '../api';




const  CreateProject=({ visible, onHide  }) =>{
    const [value, setValue] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const toast = useRef(null);
    const [ selectedRole, setSelectedRole]=useState({ Admin: '' });
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [displayUser, setDisplayUser]=useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedAssignedCheckboxes, setSelectedAssignedCheckboxes] = useState([]);
    const[selectallAssaigned,setSelectallAssaigned]= useState(false);
    const [queryDisplayUser, setQueryDisplayUser] = useState('');
    const [items , setItems]= useState([])
    const [projectData , setProjectData] = useState([]);

 
    const userDetails = async () => {
      try {
        const userData = await getUserDetails("user");
        const formattedData = userData.map((user) => {
          const [name, id, , primaryRole, , , email] = user;
          return { id, name, primaryRole, email };
        });

        setItems(formattedData
          .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
          .filter(item => item.primaryRole !== "Admin")
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(item => ({...item, selectedRole: ''})));
      } catch (error) {
        console.error(error);
      }
    };  

    useEffect (()=>{
      userDetails()
    },[])
  


 


    const apps = [
        { name: 'Web', code: 'NY', image:'static/imgs/web.png'},
        { name: 'Sap', code: 'RM' , image:'static/imgs/SAP.png'},
        { name: 'Oebs', code: 'LDN',image:'static/imgs/OEBS.png'  },
        { name: 'DeskTop', code: 'IST',image:'static/imgs/desktop.png'  },
        { name: 'Webservices', code: 'PRS', image:'static/imgs/webService.png' },
        { name: 'Mainframe', code: 'PRS', image:'/static/imgs/mainframe.png' },
        { name: 'Mobile Web', code: 'PRS', image:'static/imgs/mobileWeb.png' },
        { name: 'Mobile Apps', code: 'PRS', image:'/static/imgs/mobileApps.png' }, 
    ];
    // const [items , setItems]= useState ([
    //     { id: 1,name: 'Virat Kohli', primaryRole:'Team Lead', email:'virat@gmail.com' },
    //     { id: 2, name: 'Glenn Maxwell', primaryRole:'QA Engineer' ,  email:'glenn@gmail.com' },
    //     { id: 3, name: 'Fafdu Plesisi',primaryRole:'Test Manager',  email:'faf@gmail.com'  },
    //     { id: 4, name: 'Rajat Patidar',primaryRole:'Test Manager',  email:'rajat@gmail.com'  },
    //     { id: 5, name: 'Mohammed  Siraj', primaryRole:'Test Manager',  email:'siraj@gmail.com'  },
 
    //   ]);

    const roles=[
        {name:'Team Lead'},
        {name:'Test Manager'},
        {name:'QA'},
    ];

    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        const assignedUser = [];
      
        if (value === "all") {
          if (checked) {
            for (var i = 0; i < items.length; i++) {
              assignedUser.push({ id: items[i].id, name: items[i].name ,primaryRole:items[i].primaryRole});
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
          .map(item => ({...item, selectedRole: ''}));
      }

      
    function getFilteredDisplayUser() {
    return displayUser
    .filter(item => item.name.toLowerCase().includes(queryDisplayUser.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
    }

    function getInitials(name) {
      const names = name.split(' ');
      const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
      return initials;
    }

            

      const handleClose = () => {
        onHide(); 
      };


      const handleButtonClick = () => {
        const filteredItems = items.filter(
          (item) => !selectedCheckboxes.some((checkbox) => checkbox.id === item.id)
        );
        setItems(filteredItems);

        const assignedUsers = items.filter(
          (item) => selectedCheckboxes.some((checkbox)=> checkbox.id === item.id)
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
          unassignedUsers.push({ id: displayUser[i].id, name: displayUser[i].name ,primaryRole:displayUser[i].primaryRole});
        }  
        setSelectedAssignedCheckboxes(unassignedUsers) ;
      }
      else {
        setSelectedAssignedCheckboxes([]);
      }
      setSelectallAssaigned(checked);
    } 
    else 
    {
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
  for(let thisItem of newItems){
    if(thisItem.id === id) {
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



   const handleCreate = async() => {

    const filteredUserDetails = displayUser.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.selectedRole ? user.selectedRole.name : user.primaryRole,
    }));
    console.log(filteredUserDetails)

    var projData = {
      projectName : value,
      projectApptype : selectedApp.name,
      userDetails : filteredUserDetails,

    }
    console.log(projData)
    const project = await userCreateProject_ICE(projData)
    if(project.error){

    }
   else{
    toast.current.show({
      severity: "success",
      summary: "Project Created Successfully..",
      detail: "Project Created Successfully....!",
      life: 1000 ,
    });
    onHide(); 
  }

  };
    


  const handleCloseToast = () => {
    setShowToast(false); 
  };

    const footerContent = (
        <div className='btn-11'>
        <Button label="Cancel" severity="secondary" text className='btn1' />
        <Button  className="btn2" label='Create' onClick={handleCreate}></Button>
        </div>  
    );
    const optionTemplate = (option) => {
      return (
        <div className="flex align-items-center">
          <img src ={option.image} alt={option.label} width="20" height="20" style={{ marginRight: '8px'}} ></img>
          <div>{option.label}{option.name}</div>
        </div>
      );
    };
  

   
    return (
        <>
        <Dialog className='Project-Dialog' header="Create Project" visible={visible} style={{ width: "74.875rem" }} onHide={handleClose} footer={footerContent}>  
        <Card className='project-name-1'>
        <div className='pro-name1'>
        < h5 className='proj__name'>Project Name</h5>
            <InputText className="proj-input"value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter Project Name" />
            <div className='dropdown-1'>
                <h5 className='application__name'>Application Type</h5>
            <Dropdown  value={selectedApp} onChange={(e) => setSelectedApp(e.value)} options={apps} optionLabel="name" 
                placeholder="Select a appType" itemTemplate={optionTemplate} className="w-full md:w-28rem app-dropdown vertical-align-middle text-400 " />
                </div>
        </div>
        
        </Card>
        <Card className='card11' style={{height:'25rem'}}>
            <div className="card-input1">
            <h5 className='select-users'>Select Users</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search users by name or email address" className='usersearch md:w-31rem ' onChange={handleSearch} value={query}   />    
</span>
</div>
</div>

<div className='user-select-checkbox '>
<div className='check1'>
<Checkbox checked={selectAll}  onChange={handleCheckboxChange} value="all" ></Checkbox>
<h5 className='label1'> Select All</h5>
</div>
<div className='dropdown_role'>
    <h5>Project level role(optional)</h5>
</div>
<div className="check2">
{items.map(item => (
                    
<div key={item.id} className="users-list">
                            <Checkbox  className=" checkbox1" inputId={`checkbox-${item.id}`} name="item" value={item.id}  title={item.email} checked={selectedCheckboxes.some((cb) => cb.id === item.id)}  onChange={handleCheckboxChange}/>
                            <h5 htmlFor={`checkbox-${item.id}`} className="label-2 ml-2 mr-2 mt-2 mb-2">
                              
                              <span className='user-avatar'> <Avatar className='user-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff',width:'27px', height:'26px' }} >{getInitials(item.name)}</Avatar></span>
            
                              <span className='user-name'> {item.name}</span>
                                <span className='user-role'>{item.primaryRole}</span>
                               
                                <span className='tooltip'></span>
                    
                                </h5>
                                <Dropdown value={(item.selectedRole) ? item.selectedRole : ''} onChange={(e)=>handleRoleChange(e, item.id)} options={roles} optionLabel="name" 
                                placeholder="Select a Role" className="role-dropdown"  />
                                
                        </div>
                       
                       
                    ))}
                     </div>
                     </div>
                

        </Card>

        <Button  className="gtbtn" label='>' onClick={handleButtonClick}>  </Button>
        <Button className="ltbtn" label='<' onClick={handleMoveBack} >   </Button>


        <Card className='card22' style={{height:'25rem'}}>
            <div className='card-input2'>
            <h5 className='selected-users'>Selected Users</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search users by name or email address"  className='selecteduser'  onChange={handleSearchDisplayUser} value={queryDisplayUser} />
</span>
</div>

</div>
<div className='checkbox-2'>
<Checkbox value='all' checked={ selectallAssaigned}  onChange={handleAssignedCheckboxChange}></Checkbox>
<h5 className='label1'> Select All</h5>
</div>
  
<div className='check-bx3'>
    <ul>  
{displayUser.map((checkboxId) => (
    <>
         <Checkbox key={checkboxId.id} className="assigned-checkbox" inputId={checkboxId.id}  value={checkboxId.id} checked={selectedAssignedCheckboxes.some((ab)=> ab.id === checkboxId.id)}
            onChange={handleAssignedCheckboxChange}
>{checkboxId} </Checkbox>
         <h5 htmlFor={checkboxId.id} className="label-3 ml-2 mr-2 mt-2 ">
         <span className='asgnd-avatar'> <Avatar className='asgnd-av' shape="circle" style={{ backgroundColor: '#9c27b0', color: '#ffffff', width:'27px', height:'26px' }} >{getInitials(checkboxId.name)}</Avatar></span>
                               <span className='asgnd-name'> {checkboxId.name} </span>
                               <span className='asgnd-role'>{!checkboxId.selectedRole.name ? checkboxId.primaryRole:checkboxId.selectedRole.name}</span>
                               
                                </h5>
                                </>
       
        ))}
        </ul>
     
    </div>


 </Card> 
</Dialog>
<Toast ref={toast} position="bottom-right" />

        </>
    )
}


export default CreateProject;
   
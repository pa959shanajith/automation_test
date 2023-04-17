import React, { useState, useRef} from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import '../styles/CreateProject.scss';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';



const  CreateProject=({ visible, onHide  }) =>{
    const [value, setValue] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const toast = useRef(null);
    const [ selectedRole, setSelectedRole]=useState(null);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [displayUser, setDisplayUser]=useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showToast, setShowToast] = useState(false); 


    const apps = [
        { name: 'Web', code: 'NY' },
        { name: 'Sap', code: 'RM' },
        { name: 'Oebs', code: 'LDN' },
        { name: 'DeskTop', code: 'IST' },
        { name: 'Webservices', code: 'PRS' },
        { name: 'Mainframe', code: 'PRS' },
       
    ];
    const [items, setItems] = useState([
        { id: 1, name: 'Gabrial ' ,checked: false },
        { id: 2, name: 'Alexa ', checked: false   },
        { id: 3, name: 'Siri ', checked: false   },
      ]);

    const roles=[
        {name:'Team Lead',code:'T'},
        {name:'Test Manager',code:'M'},
        {name:'QA Engineer',code:'Q'},
    ];


      const handleCheckboxChange = (event) => {
    
        const { value, checked } = event.target;
        const assignedUser = [];
    
        if (value === "all") {
            setSelectedCheckboxes(checked ? items.map((item) =>item.id) : []);
            for(var i=0; i<items.length; i++){
                assignedUser.push({id:items[i].id,name:items[i].name})
            }
            setSelectedCheckboxes(assignedUser)
        //   setSelectedCheckboxes(checked ? items.map((item) =>item.id) : []);
          setSelectAll(checked);
        } else {
          setSelectedCheckboxes((prevSelectedCheckboxes) => {
            if (checked) {
              return [...prevSelectedCheckboxes, 
                {id:value,name:items.map((item) => (value === item.id)?item.name:"")},
            ];
          
            
            } 
            else {
              return prevSelectedCheckboxes.filter(
                (checkboxId) => checkboxId !== value
               
              );
            }
          });
          setSelectAll(false);
        }
       
      };

      const handleClose = () => {
        onHide(); // Close the dialog
      };


      const handleButtonClick = () => {
        setDisplayUser(selectedCheckboxes)
   };

   const handleCreate = () => {
    toast.current.show({
      severity: "success",
      summary: "Project Created Successfully..",
      detail: "Project Created Successfully....!",
      life: 3000 // Set the duration for which the toast message will be displayed in milliseconds
    });
    onHide(); // Close the dialog
  };
    


  const handleCloseToast = () => {
    setShowToast(false); // Set the state to hide the toast message
  };

    const footerContent = (
        <div className='btn-11'>
        <Button label="Cancel" severity="secondary" text className='btn1' />
        <Button  className="btn2" label='Create' onClick={handleCreate}></Button>
        </div>  
    );

  

   
    return (
        <>
        <Dialog className='Project-Dialog' header="Create Project" visible={visible} style={{ width: "74.875rem" }} onHide={handleClose} footer={footerContent}>  
        <Card className='project-name-1'>
        <div className='pro-name1'>
        < h5>Project Name</h5>
            <InputText className="proj-input md:w-28rem text-400"value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter Project Name" />
            <div className='dropdown-1'>
                <h5>Application Type</h5>
            <Dropdown  value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={apps} optionLabel="name" 
                placeholder="Select a appType" className="w-full md:w-26rem app-dropdown vertical-align-middle text-400 " />
                </div>
        </div>
        
        </Card>
        <Card className='card11' style={{height:'17rem'}}>
            <div className="card-input1">
            <h5>Select Users</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search users by name or email address" className='usersearch md:w-24rem ' />    
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
{items.map((item) => {
                    return (
<div key={item.key} className="flex align-items-center">
                            <Checkbox  className=" checkbox1" inputId={item.key} name="item" value={item.id}   checked={selectedCheckboxes.includes(item.id)}  onChange={handleCheckboxChange}/>
                            <h5 htmlFor={item.key} className="label-2 ml-2 mr-2 mt-2 mb-2">
                                {item.name}
                                </h5>

                                <MultiSelect value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={roles} optionLabel="name"  display="chip" 
                 filter placeholder="Select a Role" maxSelectedLabels={3} className="role-dropdown" />
                            
              
                        </div>
                       
                       );
                    })}
                     </div>
                     </div>
                

        </Card>

        <Button  className="gtbtn" label='>' onClick={handleButtonClick}>  </Button>
        <Button className="ltbtn" label='<'>   </Button>


        <Card className='card22' style={{height:'17rem'}}>
            <div className='card-input2'>
            <h5>Selected Users</h5>
            <div className='selectallbtn'>
        <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText placeholder="Search users by name or email address"  className='selecteduser md:w-24rem'/>
</span>
</div>

</div>
<div className='checkbox-2'>
<Checkbox ></Checkbox>
<h5 className='label1'> Select All</h5>
</div>
  
<div className='check-bx3'>
    <ul>  
{displayUser.map((checkboxId) => (
    <>
         <Checkbox key={checkboxId} className="assigned-checkbox">{checkboxId}</Checkbox>
         <h5 htmlFor={checkboxId.key} className="label-2 ml-2 mr-2 mt-2 mb-2">
                                {checkboxId.name}
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
   
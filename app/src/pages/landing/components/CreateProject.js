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



const  CreateProject=({ setVisible }) =>{
    // const [visible, setVisible] = useState(true);
    const [value, setValue] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const toastBR = useRef(null);
    const [ selectedRole, setSelectedRole]=useState(null);
    const [ selectedUser, setSelecteduser]= useState([]);

    const apps = [
        { name: 'Web', code: 'NY' },
        { name: 'Sap', code: 'RM' },
        { name: 'Oebs', code: 'LDN' },
        { name: 'DeskTop', code: 'IST' },
        { name: 'Webservices', code: 'PRS' },
        { name: 'Mainframe', code: 'PRS' },
       
    ];
    const Names = [
        { name: 'Gabrial', key: 'A' },
        { name: 'Alexa', key: 'M' },
        { name: 'Siri', key: 'P' },
        { name: 'Emily', key: 'E' },
    ];
    const roles=[
        {name:'Team Lead',code:'T'},
        {name:'Test Manager',code:'M'},
        {name:'QA Engineer',code:'Q'},
    ];

    const onHide = () => {
        setVisible(false);
        toastBR.current.show({
          severity: 'success',
          summary: 'Project Created Succesfully.',
          detail: 'You have created the project succesfully.',
          life: 3000,
        });
      };

    const [selectedCategories, setSelectedCategories] = useState([Names[1]]);
    const onCategoryChange = (e) => {
        let _selectedCategories = [...selectedCategories];

        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category.key !== e.value.key);

        setSelectedCategories(_selectedCategories);
    };
    

    const footerContent = (
        <div className='btn-11'>
        <Button label="Cancel" severity="secondary" text className='btn1' />
        <Button  className="btn2" label='Create' onClick={onHide}></Button>
        </div>  
    );

   
    return (
        <>
        <Dialog className='Project-Dialog' header="Create Project" visible={true} style={{ width: "74.875rem" }} onHide={onHide} footer={footerContent}>  
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
        <Card className='card11'>
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
<Checkbox onChange={e => setSelectedCategories(e.selectedCategories)} selectedCategories={selectedCategories}></Checkbox>
<h5 className='label1'> Select All</h5>
</div>
<div className='dropdown_role'>
    <h5>Project level role(optional)</h5>
</div>
<div className="check2">
{Names.map((category) => {
                    return (
<div key={category.key} className="flex align-items-center">
                            <Checkbox  className=" checkbox1" inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} />
                            <h5 htmlFor={category.key} className="label-2 ml-2 mr-2 mt-2 mb-2">
                                {category.name}
                                </h5>

                                <MultiSelect value={selectedRole} onChange={(e) => setSelectedRole(e.value)} options={roles} optionLabel="name"  display="chip" 
                 filter placeholder="Select a Role" maxSelectedLabels={3} className="role-dropdown" />
                            
              
                        </div>
                       
                       );
                    })}
                     </div>
                     </div>
                

        </Card>

        <Button  className="gtbtn" label='>'>  </Button>
        <Button className="ltbtn" label='<'>   </Button>


        <Card className='card22'>
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
<Checkbox onChange={e => setSelectedCategories(e.selectedCategories)} selectedCategories={selectedCategories}></Checkbox>
<h5 className='label1'> Select All</h5>
</div>
 </Card>

   
</Dialog>
<Toast ref={toastBR} position="bottom-right" />

        </>
    )
}


export default CreateProject;
   
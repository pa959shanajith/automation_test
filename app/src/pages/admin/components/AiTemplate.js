import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import "../styles/AiTemplate.scss";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { InputSwitch } from 'primereact/inputswitch';
import {createTemp, readModel , readTemp , deleteTemp , editTemp} from "../api";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import AvoConfirmDialog from '../../../globalComponents/AvoConfirmDialog';



const AiTemplate = () => {
    const [displayTemplate, setDisplayTemplate] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [domain, setDomain] = useState('');
    const [llmModel, setLlmModel] = useState(null);
    const [testType, setTestType] = useState(null);
    const [accuracy, setAccuracy] = useState(0);
    const [activeCheck, setActiveCheck] = useState(false);
    const [defaultChcek, setDefaultCheck] = useState(false);
    const [modelData , setModelData] = useState([]);
    const isTemplateDataPresent =useSelector(state => state.admin.isTemplateDataPresent);
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [gridList, setGridList] = useState([]);
    const [tempData , setTempData] = useState([]);
    const [refreshTable, setRefreshTable] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [tempId, setTempId] = useState([]);
    const [currentId,setCurrentId] = useState('');
    const [deleteRow, setDeleteRow] = useState(false);
    const [isEdit,setIsEdit] = useState(false);

    const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');




    const toast = useRef(null);
    let serialNumber = 0;
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    const LLMModel = [
        {name: 'Positive'},
        {name: 'Negative'},
        {name: 'Edge Case'},
     
    ];


    const onTestTypeChange = (e) => {
        setTestType(e.value);
    }


    const showTemplate= () => {
       llmData();
        setDisplayTemplate(true);
        resetForm();
      };
    
      const createAndEditTemplate = () => {
        if (isEdit){
          onEditTemplate();
        }
        else{
        onCreateTemplate();
        }
        setDisplayTemplate(false);
        resetForm();
      };

      const hideTemplate = ()=>{
        setDisplayTemplate(false);
        resetForm();
      }

      const resetForm = () => {
        setDomain('');
        setLlmModel('');
        setAccuracy('');
        setActiveCheck(false);
        setDefaultCheck(false);
        setName('');
        setTestType('');
        setDescription('');
      };

  const generateTemplatePayload = (domain,model_id, test_type, temperature, active , defaultCheck, name, description) => {
    return {
      "domain": domain,
      "model_id": model_id,
      "test_type": test_type,
      "temperature": temperature,
      "active": active,
      "default": defaultChcek,
      "name": name,
      "description": description
    }
  }


      const onCreateTemplate = async () => {
        const scaledAccuracy = accuracy / 100;
        try {
          const templateData = await createTemp(generateTemplatePayload(domain, llmModel.code, testType.name, scaledAccuracy, activeCheck, defaultChcek, name, description));
            setRefreshTable(true);

            console.log(templateData);
            if (templateData.status) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Template created successfully', life: 3000 });
                resetForm();
                // templateDataforTable();
              } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail:"Error while creating template", life: 3000 });
              }

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to craete template', life: 3000 });
         }
      };

      const onEditTemplate = async () => {
        const scaledAccuracy = accuracy / 100;
        try {
          const result = await editTemp(currentId, generateTemplatePayload(domain, llmModel.code, testType.name, scaledAccuracy, activeCheck, defaultChcek, name, description));
    
          if (result.error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: result.error || 'Unknown error', life: 3000 });
              console.error(result.error);
          } else {
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Template updated successfully', life: 3000 });
              const newResult = await readTemp({
                "userid": userInfo.user_id
              });
              if (newResult.data.data) {
                setTempData((prev) => newResult.data.data);
              } else {
              console.error(newResult.error);
              }
          }
      } catch (error) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
          // toastError('Unexpected error');
      }
       
      }

      const llmData = async () => {
        try {
            const modalData = await readModel({
              "userid": userInfo.user_id,
            
            });
            const data = modalData.data.data || [];
            const modalOptions = data.map(item => ({
              name: item.name,
              code: item._id
            }));
            setModelData(modalOptions);

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         }
      };

      

   



      const onModelChange = (e) => {
        setLlmModel(e.value); 
    }

      
  const customFooter = (
    <div>
      <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideTemplate}/>
      <Button label="Save" icon="pi pi-check" className="p-button-text" onClick = {createAndEditTemplate}/>
    </div>
  );

  const templateDataforTable = async () => {
    try {
        const readData = await readTemp({
          "userid": userInfo.user_id,
        
        });

        if (readData && readData.data.data && readData.data.data.length > 0) {
          const firstItem = readData.data.data[0]; 
          const templateId = firstItem._id; 
          setTempId(templateId); 
        }
        console.log(tempId);

        const data = readData.data.data || [];
        setTempData(data);

        setRefreshTable(false);
    } catch (error) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
     }
  };

//  const templateId = tempData[0]._id;
//  setTempId(templateId);

  

  useEffect(() => {
    templateDataforTable();
  }, [refreshTable == true]);

  const renderInputSwitch = (rowData, property) => {
    return (
      <InputSwitch
        checked={rowData[property]}
        onChange={(e) => handleSwitchChange(e, rowData, property)}
      />
    );
  };
  
  const handleSwitchChange = (e, rowData, property) => {
    // Handle switch change
    // You can access the rowData, the selected value (e.value), and the property name (property)
    // Update the corresponding property in rowData based on the property
  }
  const renderActions = (rowData) => {
    return (
      <div>
        <span className='pi pi-pencil' onClick={()=>handleEdit(rowData)} > </span>
        <span className='pi pi-trash' onClick={()=> {setDeleteRow(true);setCurrentId(rowData?._id)} }   style={{marginLeft:'1rem'}} > </span>
      </div>
    );
  };

  const handleEdit = async (rowData) => {
    showTemplate(true);
    setIsEdit(true);
    setCurrentId(rowData?._id);
    setDomain(rowData?.domain);
    setLlmModel({name: rowData?.model_details?.name, code: rowData?.model_details?._id});
    setAccuracy(rowData?.temperature);
    setActiveCheck(rowData?.active);
    setDefaultCheck(rowData?.default);
    setName(rowData?.name);
    setTestType({name: rowData?.test_type});
    setDescription(rowData?.description);
  
  };


  const handleTemplateDelete = async () => {
    try {
        const result = await deleteTemp(currentId);

        if (result.error) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: result.error || 'Unknown error', life: 3000 });
            console.error(result.error);
        } else {
          toast.current.show({ severity: 'success', summary: 'Success', detail: 'Template Deleted successfully', life: 3000 });
            // toastSuccess('Model deleted successfully');
            const newResult = await readTemp({
              "userid": userInfo.user_id
            });
            if (newResult.data.data) {
              setTempData((prev) => newResult.data.data);
            } else {
            console.error(newResult.error);
            }
        }
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
        // toastError('Unexpected error');
    }
};


console.log("tempData", tempData);

    return(
        <>
         <Toast ref={toast} />

        <Dialog header="Add Template" visible={displayTemplate} style={{ width: '33vw', height: '40vw' }} onHide={hideTemplate} footer={customFooter}>
          <div className='flex flex-row justify-content-between pl-2 pb-2'>
            <div className="flex flex-column">
              <label className="pb-2 font-medium"> Name <span style={{ color: "#d50000" }}>*</span></label>
              <InputText value={name} onChange={(e) => setName(e.target.value)} style={{ width: '28rem' }} />

              <label className="pb-2 font-medium"> Description<span style={{ color: "#d50000" }}>*</span> </label>
              <InputText value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '28rem' }} />

              <label className="pb-2 font-medium"> Industry Domain <span style={{ color: "#d50000" }}>*</span></label>
              <InputText value={domain} onChange={(e) => setDomain(e.target.value)} style={{ width: '28rem' }} />

              <label className="pb-2 font-medium">LLM Model<span style={{ color: "#d50000" }}>*</span></label>
              <Dropdown value={llmModel} options={modelData} onChange={onModelChange} optionLabel="name" placeholder="Select a LLM Model" style={{ width: '28rem' }} />

              <label className="pb-2 font-medium">Test Type <span style={{ color: "#d50000" }}>*</span></label>
              <Dropdown value={testType} options={LLMModel} onChange={onTestTypeChange} optionLabel="name" placeholder="Select a Test Type" style={{ width: '28rem' }} />

              <div className='accuracy_div'>
                <label className="pb-4 font-medium">Accuracy </label>
                <div className="flex flex-row  temp-div">
                  <label className="pb-2 font-medium">Low</label>
                  <div className="accuracy_sub_div">
                    <InputText value={accuracy} onChange={(e) => setAccuracy(e.target.value)} style={{ width: '24rem' }} />
                    <Slider value={accuracy} onChange={(e) => setAccuracy(e.value)} style={{ width: '24rem' }} />
                  </div>
                  <label className="pb-2 font-medium">High</label>
                </div>
              </div>
              <div className="flex flex-row active-class">
                <label className="pb-2 font-medium"> Active</label>
                <InputSwitch checked={activeCheck} onChange={(e) => setActiveCheck(e.value)} />
              </div>
              <div className="flex flex-row default-class">
                <label className="pb-2 font-medium"> Default</label>
                <InputSwitch checked={defaultChcek} onChange={(e) => setDefaultCheck(e.value)} />
              </div>


            </div>
          </div>

        </Dialog>
        {tempData.length ? (<>
          <label className="pb-2 temp-list-label">List of Templates</label>
          <div className='search_newGrid'>
                        <InputText placeholder="Search" className='search_grid' value={globalFilterValue} onChange={(e)=>setGlobalFilterValue(e.target.value)}  />
                 
                    <Button className="grid_btn_list" label="Add new template" onClick={showTemplate}  ></Button>
                    </div>
         <div style={{ position: 'absolute', width: '74%', height: '-webkit-fill-available', top: '13rem' }}>
         <AvoConfirmDialog
                        visible={deleteRow}
                        onHide={() => setDeleteRow(false)}
                        showHeader={false}
                        message="Are you sure you want to delete ?"
                        icon="pi pi-exclamation-triangle"
                        accept={() => handleTemplateDelete(currentId)}
                    />
         <DataTable value={tempData} paginator rows={5} globalFilter={globalFilterValue} showGridlines
         paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 20]}>
         {/* <Column
    header="Sl No"
    body={() => ++serialNumber} */}
  {/* /> */}
        <Column field="name" header="Name" />
        <Column field="description" header="Description" />
        <Column field="createdAt" header="Created On" />
        <Column header="Default" body={(rowData) => renderInputSwitch(rowData, 'default')} />
        <Column header="Status" body={(rowData) => renderInputSwitch(rowData, 'active')} />
        <Column header="Actions" body={renderActions} />
      </DataTable>
                    </div>

        </>) :
          <div className='empty_template_div'>
            <img src="static/imgs/template.svg" alt="SVG Image" />
            <span>
              No AI templates yet
            </span>
            <Button label='Create' onClick={showTemplate} ></Button>

          </div>}
        
      
        </>
    )
}

export default AiTemplate;
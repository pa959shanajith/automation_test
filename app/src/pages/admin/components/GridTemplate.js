import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import {readTemp} from "../api";
import { Toast } from 'primereact/toast';
import { InputSwitch } from 'primereact/inputswitch';


const GridTemplate = () =>{
    const [currentGrid, setCurrentGrid] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [gridList, setGridList] = useState([]);
    const [tempData , setTempData] = useState([]);
    const toast = useRef(null);
    let serialNumber = 0;

    
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userInfoFromRedux = useSelector((state) => state.landing.userinfo)
    if (!userInfo) userInfo = userInfoFromRedux;
    else userInfo = userInfo;

    const templateDataforTable = async () => {
        try {
            const readData = await readTemp({
              "userid": userInfo.user_id,
            
            });
            const data = readData.data.data || [];
            setTempData(data);
            console.log("read data", data)

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Message Content', life: 3000 });
         }
      };

      useEffect(() => {
        templateDataforTable();
      }, []);

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
            <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning" onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDelete(rowData)} />
          </div>
        );
      };

      const handleEdit = (rowData) => {
        // Handle edit action
        // You can access the rowData for the selected record
      };
    
      const handleDelete = (rowData) => {
        // Handle delete action
        // You can access the rowData for the selected record
      };

    return(
        <>
            <Toast ref={toast} />
         <label className="pb-2 font-medium">List of Templates</label>
          <div className='search_newGrid'>
                        <InputText placeholder="Search" className='search_grid' value={searchText}  />
                 
                    <Button className="grid_btn_list" label="Add new template"  ></Button>
                    </div>
         <div style={{ position: 'absolute', width: '74%', height: '-webkit-fill-available', top: '13rem' }}>
         <DataTable value={tempData} paginator rows={5} paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 20]}>
         <Column
    header="Sl No"
    body={() => ++serialNumber}
  />
        <Column field="name" header="Name" />
        <Column field="description" header="Description" />
        <Column field="createdAt" header="Created On" />
        <Column header="Default" body={(rowData) => renderInputSwitch(rowData, 'default')} />
        <Column header="Status" body={(rowData) => renderInputSwitch(rowData, 'active')} />
        <Column header="Actions" body={renderActions} />
      </DataTable>
                    </div>
        </>
    )
}

export default GridTemplate;
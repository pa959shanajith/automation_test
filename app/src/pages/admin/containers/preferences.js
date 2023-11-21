import React, { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
// import preferences from './preferences.json';

const Privileges = () => {
    const[Privilege, setPrivilege] = useState([]);


    useEffect(() => {
        fetch('data/preferences.json')
          .then((response) => response.json())
          .then((data) => {
            setPrivilege(data);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }, []);


      const CustomCellRenderer = (rowData, column) => {
        const isTrue = (rowData[column.field] === 'true');
        
        return (
            <span>
              {isTrue ? (
                <i className="pi pi-check" style={{ color: 'green' }}></i>
              ) : (
                <i className="pi pi-times" style={{ color: 'red' }}></i>
              )}
            </span>
          );
      };


    return (
        <>
        <div>
            <DataTable value={Privilege} 
                        rowGroupMode="rowspan" 
                        groupRowsBy="area.name"
                        sortMode="single" 
                        sortField="area.name" 
                        sortOrder={1} 
                        tableStyle={{ width: '69rem', padding:'1rem' }}
                        showGridlines>
                <Column field="area.name" header="Area"></Column>
                <Column field="features" header="Features"></Column>
                <Column field="admin" header="Admin" body={CustomCellRenderer}></Column>
                <Column field="qualityManager" header="Quality Manager" body={CustomCellRenderer}></Column>
                <Column field="qalityLead" header="Quality Lead" body={CustomCellRenderer}></Column>
                <Column field="qualityEngineer" header="Quality Engineer" body={CustomCellRenderer}></Column>
           </DataTable>
        </div>
        </>
    )
}
export default Privileges;
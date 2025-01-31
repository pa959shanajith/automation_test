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
        const isTrue = (rowData[column.field]);
        
        return (
          <span>
          {isTrue=== 'true' ? (
            <i className="pi pi-check" style={{ color: 'green' }}></i>
          ) : isTrue === 'false' ? (
            <i className="pi pi-times" style={{ color: 'red' }}></i>
          ) : (
           null
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
                        tableStyle={{ width: '72vw', paddingLeft:'1rem' }}
                        showGridlines
                        scrollable
                        scrollHeight="77vh"
                        >
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
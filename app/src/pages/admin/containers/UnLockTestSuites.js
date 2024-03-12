import React, { useEffect, useRef, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { unlockTestSuites } from "../api";
import { Toast } from "primereact/toast";
import { InputText } from 'primereact/inputtext';
import '../styles/UnLockTestSuites.scss'





const UnlockTestSuites = () => {
    const [testSuite, setTestSuite] = useState([]);
    const [data, setData] = useState("");
    const toast = useRef();
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState([]);
    useEffect(()=>{
        (async()=>{
            const moduleData = await unlockTestSuites({qurey:"empty"});
            if(moduleData.error) return;
            else {
                setTestSuite(moduleData)
                setFilters(moduleData)
                setLoading(false)
            }
        })()
    },[data])
    const showUnLockIcon = (rowData) =>{
        return(
            <>
              <i className="pi pi-unlock searchInputUnlock" onClick={()=>un_lock(rowData)}/>
            </>
        )

    }
    const showUnLockName = (rowData) =>{
        return(
            <>
            <span title={rowData.name}>{rowData.name.length>30?rowData.name.trim().substring(0,30)+'...':rowData.name }</span>
            </>
        )

    }
    const un_lock = async(row) =>{
      let req = {
          qurey: "unlock",
          id: row['_id'],
          name: row['name']
      }
      setLoading(true)
      const newUnlock = await unlockTestSuites(req)
      if(newUnlock.error) return;
      else {
          setData(newUnlock)
          setLoading(false)
          toast.current.show({severity: 'success', summary: 'Success', detail: ` ${newUnlock} unlock successfully`, life: 5000 });
      }
    }
    const onGlobalFilterChange = (e) => {
        // Get the value entered in the input field
        const value = e.target.value;
        // Set the global filter value state
        setGlobalFilterValue(value);
        // Create a copy of the testSuite state using spread syntax
        const _filters = testSuite;
    
        // If the value is not empty, filter the testSuite based on name or currentlyinuse
        if (value !== "") {
            const fil = _filters.filter((item) => { 
                return item.name.includes(value) || item.currentlyinuse.includes(value);
            });
            setTestSuite(fil)
        } else {
            // If the value is empty, reset the testSuite to its original state
            setTestSuite(filters);
        }
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search searchInputUnlock" />
                    <InputText value={globalFilterValue} onChange={(e)=>onGlobalFilterChange(e)} className ="searchInputUnlock" style={{width:'20vw'}} placeholder="TestSuites/Assign Users Search" />
                </span>
            </div>
        );
    };
    const header = renderHeader();
    return(
        <> 
            <Toast position="bottom-center" baseZIndex={9999} ref={toast}/>       
            <DataTable value={testSuite} header={header} size='small' className="dataTableUnlock" style={{width:'70vw', paddingLeft:'1%'}} showGridlines scrollable scrollHeight="400px" loading={loading}>
            <Column field="name" header="Test Suites Name" style={{width:'40vw'}} body={showUnLockName}></Column>
            <Column field="currentlyinuse" style={{width:'10vw'}} header="Currently In Used"></Column>
            <Column field="UnLock Test Suites" style={{width:'10vw'}} header="Locked Test Suites" body={showUnLockIcon}/>
            </DataTable>
        </>
    )
}
export default UnlockTestSuites;
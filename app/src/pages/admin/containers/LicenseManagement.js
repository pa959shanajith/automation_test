import React, { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';   // theme
import 'primereact/resources/primereact.css';                       // core css
import 'primeicons/primeicons.css';                                 // icons
import 'primeflex/primeflex.css'; 
import '../styles/LicenseManagement.scss';
import { getAvailablePlugins } from "../api";
function LicenseManagement() {
    const [licenseData, setLicenseData] = useState({});
    const [headerData1, setHeaderData1] = useState([]);
    useEffect(()=>{
        (async()=>{
            const LicenseData = await getAvailablePlugins()
            setLicenseData(LicenseData)
            console.log(LicenseData)
        setHeaderData1(Object.entries(LicenseData).filter(entry=>{
            if(entry[1]==="true" || entry[1]==="false") {
return true;
            }
        }      
        ).map(finalData=>{
            return {
                License_Type: finalData[0],
                License_Status: finalData[1]==="true"?"Enabled":"Disabled"
            }
        }))
        })()
    },[])

    const headerData = [
        {
            Subscribed_Licenses: licenseData.USER,
            License_Type: licenseData.LicenseTypes,
            License_Status: licenseData.Status,
            Valid_To: licenseData.ExpiresOn
        }]
       
    return(
        <>
        <div className="card">
            <div className="Right">
                <div className="Platform">
                <h4>Avo Assure Platform License</h4>
                <div id="top" className="Box">
                    <DataTable value={headerData} tableStyle={{ minWidth: '50rem' }}>
                        <Column field="Subscribed_Licenses" header="Subscribed Licenses"></Column>
                        <Column field="License_Type" header="License Type"></Column>
                        <Column field="License_Status" header="License Status"></Column>
                        <Column field="Valid_To" header="Valid To"></Column>
                    </DataTable>
                </div>
                </div>
                <div id="bottom" className="Features">
                <h4>Avo Assure Features</h4>
                    <DataTable  value={headerData1} tableStyle={{ minWidth: '50rem' }} scrollable scrollHeight="44vh">
                        <Column field="License_Type" header="Feature "></Column>
                        <Column field="License_Status" header="Status"></Column>
                    </DataTable>
                </div>
            </div>
        </div>
        </>
    );
}
export default LicenseManagement;
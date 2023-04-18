import React, { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
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
            setHeaderData1(LicenseData.FeatureDetails.map(finalData=>{
                return{
                    License_Type:finalData.featurename,
                    License_Status:finalData.value==="true"?"Enabled":finalData.value==="false"?"Disabled":finalData.value
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
                        <Column field="Valid_To" header="Valid Upto"></Column>
                    </DataTable>
                    <div>*All licenses are concurrent license</div>
                </div>
                </div>
                <div id="bottom" className="Features">
                <h4>Avo Assure Features</h4>
                    <DataTable  value={headerData1} tableStyle={{ minWidth: '52rem' }} scrollable scrollHeight="45vh">
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
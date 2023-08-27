import React, { useEffect, useState } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
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
            setHeaderData1(Object.entries(LicenseData).map(([key, value])=>{
                return{
                    License_Type:key,
                    License_Status:value==="true"?"Enabled":value==="false"?"Disabled":value
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
        <div className="card-outer">
            <div className="license-table">
                <div className="Platform">
                <h4>Avo Assure Platform License</h4>
                <div id="table-data-top" className="Box">
                    <DataTable value={headerData} className="licenseData">
                        <Column field="Subscribed_Licenses" header="Subscribed Licenses"></Column>
                        <Column field="License_Type" header="License Type"></Column>
                        <Column field="License_Status" header="License Status"></Column>
                        <Column field="Valid_To" header="Valid Upto"></Column>
                    </DataTable>
                    <div>*All licenses are concurrent license</div>
                </div>
                </div>
                <div id="table-data-bottom" className="Features">
                <h4>Avo Assure Features</h4>
                    <DataTable  value={headerData1} className="licenseData1"  scrollable scrollHeight="40vh">
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
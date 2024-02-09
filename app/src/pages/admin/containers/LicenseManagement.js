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
    const [expandedRows, setExpandedRows] = useState(null);
    useEffect(()=>{
        (async()=>{
            const LicenseData = await getAvailablePlugins()
            setLicenseData(LicenseData)
            if(LicenseData.FeatureDetails !== undefined){
                setHeaderData1(LicenseData.FeatureDetails.map(finalData=>{
                    return{
                        License_Type:finalData.featurename,
                        License_Status:finalData.value==="true"?"Enabled":finalData.value==="false"?"Disabled":finalData.value
                    }
                }))
            }else{
                setHeaderData1(Object.entries(LicenseData).map(([key, value])=>{
                    return{
                        License_Type:key,
                        License_Status: typeof value === "object" ? "" : value==="true"?"Enabled":value==="false"?"Disabled":value,
                        // to form single addon array of objects
                        License_Extra: typeof value === "object" ? Object.entries(value).map(([key, value]) => ({ ...value, addOnName: key })) : []
                    }
                }))
            }
        })()
    },[])

    const headerData = [
        {
            Subscribed_Licenses: licenseData.USER,
            License_Type: licenseData.LicenseTypes,
            License_Status: licenseData.Status,
            Valid_To: licenseData.ExpiresOn
        }]

    const allowExpansion = (rowData) => {
        return rowData?.License_Extra && (rowData?.License_Extra?.length != 0);
    };
    // addon row expansion
    const rowExpansionTemplate = (data) => {
        return (
            <div className="p-3">
                {
                    <DataTable value={data?.License_Extra}>
                        <Column field="addOnName" header="Addons"></Column>
                        <Column field="StartDate" header="Start Date"></Column>
                        <Column field="EndDate" header="End Date"></Column>
                        <Column field="Value" header="Value"></Column>
                    </DataTable>
                }
            </div>
        );
    };
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
                    <DataTable  value={headerData1} className="licenseData1"  scrollable scrollHeight="40vh" rowExpansionTemplate={rowExpansionTemplate} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}>
                        {headerData1 && headerData1.filter(item=>item?.License_Type === "addons").length>0 &&<Column expander={allowExpansion}/>}
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
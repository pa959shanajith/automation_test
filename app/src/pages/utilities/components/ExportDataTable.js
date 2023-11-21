import React, { useState } from 'react';
import { validateData } from './DtUtils';
import { ModalContainer, Messages as MSG, setMsg } from '../../global';
import { exportDataTable } from '../api';
import "../styles/DataTablePopup.scss";
import { Button } from 'primereact/button';

const ExportDataTable = props => {

    const [filename, setFilename] = useState(props.tableName);
    const [filetype, setFiletype] = useState('xlsx');
    const [error, setError] = useState(false);

    const handleFilename = e => setFilename(e.target.value);
    const handleFileType = e => setFiletype(e.target.value);

    const exportTable = async() => {
        if (validateData(filename) === "tableName")
            setError(true);
        else{
            props.setOverlay("Exporting File...")
            setError(false);
            const resp = await exportDataTable({ tableName: props.tableName, filename: filename.trim(), exportFormat: filetype })
            props.setOverlay("");

            if(resp.error) setMsg(resp.error);
            else {
                let [extn, type] = getExtAndType(filetype);
                downloadFile(resp, filename.trim(), extn, type);
                setMsg(MSG.UTILITY.SUCC_EXPORT_FILE);
                props.setShowExportPopup(false);
            }
        }
    }

    return (
        <>
            <ModalContainer 
            show={props.showExportPopup}
                title="Export Data Table"
                content={
                    <div className="dt__exportPopup">
                        <span>Data Table Name:</span><span>{props.tableName}</span>
                        <span>File Name:</span><input className={`dt__efileName ${error?"dt__tableNameError":""} `} value={filename} onChange={handleFilename} />
                        <span>Export Format:</span>
                        <select value={filetype} onChange={handleFileType}>
                            <option value="xlsx">Excel (.xlsx)</option>
                            <option value="xls">Excel (.xls)</option>
                            <option value="csv">CSV</option>
                            <option value="xml">XML</option>
                        </select>
                    </div>
                }
                footer={
                    <>
                    <Button label='Export' onClick={exportTable}></Button>
                    <Button label='Cancel' onClick={()=>props.setShowExportPopup(false)} ></Button>
                    </>
                }
                close={()=>props.setShowExportPopup(false)}
            />
        </>
    );
}

function downloadFile (resp, filename, extn, type) {
    var file = new Blob([resp], { type: type });
    var fileURL = URL.createObjectURL(file);
    var a = document.createElement('a');
    a.href = fileURL;
    a.download = filename+extn;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(fileURL);
}

function getExtAndType (filetype) {
    let extn = ".csv";
    let type = "text/csv";
    switch(filetype.toLowerCase()) {
        case "csv": 
            type = "text/csv"; 
            extn = ".csv"
            break;
        case "xlsx": 
            type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; 
            extn = ".xlsx"
            break;
        case "xls": 
            type = "application/vnd.ms-excel"; 
            extn = ".xls"
            break;
        case "xml": 
            type = "text/xml"; 
            extn = ".xml"
            break;
        default: break;
    }
    return [extn, type];
}

export default ExportDataTable;
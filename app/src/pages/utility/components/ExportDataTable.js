import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import { exportDataTable } from '../api';
import "../styles/ExportDataTable.scss";

const ExportDataTable = props => {

    const [filename, setFilename] = useState(props.tableName);
    const [filetype, setFiletype] = useState('csv');

    const handleFilename = e => setFilename(e.target.value);
    const handleFileType = e => setFiletype(e.target.value);

    const exportTable = async() => {
        props.setOverlay("Exporting File...")
        const resp = await exportDataTable({ tableName: props.tableName, filename: filename, exportFormat: filetype })
        props.setOverlay("");

        if(resp.error) props.setShowPop({title: "Export File Error", content: resp.error, type: "message"});
        else {
            let [extn, type] = getExtAndType(filetype);
            downloadFile(resp, filename, extn, type);
            props.setShowPop({title:'Export File', content:'File Exported Successfully.', type: "message" })
        }
    }

    return (
        <>
            <ModalContainer 
                title="Export Data Table"
                content={
                    <div className="dt__exportPopup">
                        <span>Data Table Name:</span><span>{props.tableName}</span>
                        <span>File Name:</span><input className="dt__efileName" value={filename} onChange={handleFilename} />
                        <span>Export Format:</span>
                        <select value={filetype} onChange={handleFileType}>
                            <option value="csv">CSV</option>
                            <option value="excel">Excel</option>
                            <option value="xml">XML</option>
                        </select>
                    </div>
                }
                footer={
                    <>
                    <button onClick={exportTable}>Export</button>
                    <button onClick={()=>props.setShowExportPopup(false)} >Cancel</button>
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
        case "excel": 
            type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; 
            extn = ".xlsx"
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
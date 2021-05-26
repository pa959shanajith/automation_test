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
        const resp = await exportDataTable({ tableName: props.tableName, filename: filename, exportFormat: filetype })
        // if(resp.error){displayError(resp.error);return;}
        var extn = ".csv";
        var type = "text/csv"; 
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
        var file = new Blob([resp], { type: type });
        var fileURL = URL.createObjectURL(file);
        var a = document.createElement('a');
        a.href = fileURL;
        a.download = filename+extn;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileURL);
        // setBlockui({show:false,content:''})
        // setPopup({
        //     title:'Mindmap',
        //     content:'Data Exported Successfully.',
        //     submitText:'Ok',
        //     show:true
        // })
        console.log(resp);
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

export default ExportDataTable;
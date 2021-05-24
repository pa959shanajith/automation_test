import React, { useState, useEffect } from 'react';
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
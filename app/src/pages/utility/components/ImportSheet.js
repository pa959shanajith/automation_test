import React, { useState, useEffect } from 'react';
import { ModalContainer } from '../../global';
import { importDataTable } from '../api';
import "../styles/ExportDataTable.scss";

const ImportSheet = props => {

    // const [filename, setFilename] = useState(props.tableName);

    useEffect(()=>{
        if (props.sheetList.length) {
            setSheetList(props.sheetList)
            setSheet(props.sheetList[0])
        }
    }, [props])

    const [sheet, setSheet] = useState([]);
    const [sheetList, setSheetList] = useState([]);

    // const handleFilename = e => setFilename(e.target.value);
    const handleSheet = e => setSheet(e.target.value);

    const importTable = async() => {
        const resp = await importDataTable({ content: props.excelContent, flag: "data", sheetname: sheet, importFormat: "excel" });
        console.log(resp);
    }

    return (
        <>
            <ModalContainer 
                title="Export Data Table"
                content={
                    <div className="dt__exportPopup">
                        <span>Select Sheet:</span>
                        <select value={sheet} onChange={handleSheet}>
                            {
                                sheetList.map(sheet_ => {
                                    return <option value={sheet_}>{sheet_}</option>
                                })
                            }
                        </select>
                    </div>
                }
                footer={
                    <>
                    <button onClick={importTable}>Import</button>
                    <button onClick={()=>props.setSheetList([])} >Cancel</button>
                    </>
                }
                close={()=>props.setSheetList([])}
            />
        </>
    );
}

export default ImportSheet;
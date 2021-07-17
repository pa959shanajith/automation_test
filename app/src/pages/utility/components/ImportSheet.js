import React, { useState, useEffect } from 'react';
import { ModalContainer, VARIANT } from '../../global';
import { importDataTable } from '../api';
import { parseTableData } from './DtUtils';
import "../styles/ExportDataTable.scss";

const ImportSheet = props => {

    // const [filename, setFilename] = useState(props.tableName);

    useEffect(()=>{
        if (props.sheetList.length) {
            setSheetList(props.sheetList)
            setSheet(props.sheetList[0])
        }
    }, [props])

    const [sheet, setSheet] = useState("");
    const [sheetList, setSheetList] = useState([]);

    // const handleFilename = e => setFilename(e.target.value);
    const handleSheet = e => setSheet(e.target.value);

    const importTable = async() => {
        try{
            const resp = await importDataTable({ content: props.excelContent, flag: "data", sheetname: sheet, importFormat: "excel" });

            if(resp.error) 
                props.setShowPop({variant: VARIANT.ERROR, content: resp.error, type: "message"})
            else if (resp == "columnExceeds") {
                props.setSheetList([]);
                props.setShowPop({variant: VARIANT.ERROR, content: "Column should not exceed 50", type: "message"});
            }
            else if (resp == "rowExceeds") {
                props.setSheetList([]);
                props.setShowPop({variant: VARIANT.ERROR, content: "Row should not exceed 200", type: "message"});
            }
            else if (resp == "emptyExcelData") {
                props.setSheetList([]);
                props.setShowPop({variant: VARIANT.ERROR, content: "Empty Data in the sheet", type: "message"});
            }
            else if (typeof resp === "object"){
                const [, newData, newHeaders] = parseTableData(resp, "import")
                props.setData(newData);
                props.setHeaders(newHeaders);
                props.setSheetList([]);
            }
        }
        catch(error){
            console.error("ERROR::::", error);
            props.setShowPop({variant: VARIANT.ERROR, content: "Failed to Fetch File Data", type: "message"})
        }
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
                                    return <option key={sheet_} value={sheet_}>{sheet_}</option>
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
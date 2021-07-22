import React, { useState, useEffect } from 'react';
import { ModalContainer, VARIANT, Messages as MSG } from '../../global';
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
            props.setOverlay("Importing File...");
            const resp = await importDataTable({ content: props.excelContent, flag: "data", sheetname: sheet, importFormat: "excel" });
            if(resp.error) 
                props.setShowPop(resp.error)
            else if (resp == "columnExceeds") {
                props.setSheetList([]);
                props.setShowPop(MSG.UTILITY.ERR_COL_50);
            }
            else if (resp == "rowExceeds") {
                props.setSheetList([]);
                props.setShowPop(MSG.UTILITY.ERR_ROW_200);
            }
            else if (resp == "emptyExcelData") {
                props.setSheetList([]);
                props.setShowPop(MSG.UTILITY.ERR_EMPTY_SHEET);
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
            props.setShowPop(MSG.UTILITY.ERR_FETCH_FILE)
        }
        finally {
            props.setOverlay("");
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
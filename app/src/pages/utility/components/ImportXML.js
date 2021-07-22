import React, { useState, useEffect } from 'react';
import { validateData } from './DtUtils';
import { ModalContainer } from '../../global';
import { importDataTable } from '../api';
import { parseTableData } from './DtUtils';
import "../styles/ExportDataTable.scss";

const ImportXML = props => {

    useEffect(()=>{
        if (props.rowTag) {
            setColumnTagList([])
            setRowTag("")
        }
    }, [props])

    const [rowTag, setRowTag] = useState("");
    const [columnTagList, setColumnTagList] = useState([]);
    const [error, setError] = useState(false);

    const handleRowTag = e => setRowTag(e.target.value);
    const handleColumnTagList = e => setColumnTagList(e.target.value);

    const importTable = async() => {
        try{
            if (validateData(rowTag) === "tableName")
                setError(true);
            else {
                setError(false);
                props.setOverlay("Importing File...");
                const resp = await importDataTable({ content: props.xmlContent, row: rowTag, column:columnTagList, importFormat: "xml" });
                let errorMsg = { title: "File Read Error", type: "message" };
                switch(resp){
                    case "columnExceeds": props.setShowPop({ content: "Column should not exceed 50", ...errorMsg }); break;
                    case "rowExceeds": props.setShowPop({ content: "Row should not exceed 200", ...errorMsg}); break;
                    case "emptyData": props.setShowPop({ content: "Empty Data in the sheet", ...errorMsg}); break;
                    case "emptyRow": props.setShowPop({ content: "Empty rows for the given row tag name", ...errorMsg}); break;
                    case "nestedXML": props.setShowPop({ content: "Invalid XML file. Cannot convert the XML to data table", ...errorMsg}); break;
                    case "invalidcols": props.setShowPop({ content: "Invalid column tag names", ...errorMsg}); break;
                    default: {
                        if (resp.error) props.setShowPop({ content: resp.error, ...errorMsg});
                        else if (typeof resp === "object"){
                            const [, newData, newHeaders] = parseTableData(resp, "import")
                            props.setData(newData);
                            props.setHeaders(newHeaders);
                        }
                        break;
                    }
                }
                props.setRowTag("");
                props.setOverlay("");
            }
        }
        catch(error){
            props.setRowTag("");
            props.setOverlay("");
            console.error("ERROR::::", error);
            props.setShowPop({title: "File Read Error", content: "Failed to Fetch File Data", type: "message"})
        }
    }

    return (
        <>
            <ModalContainer 
                title="Enter XML Tags"
                content={
                    <div className="dt__exportPopup">
                        <span>Row Tag:</span><input className={`dt__efileName ${error?"dt__tableNameError":""}`} placeholder={'Row tag'} value={rowTag} onChange={handleRowTag} />
                        <span>Column Tags:</span><input className={`dt__efileName`} placeholder={'Column tags (Optional)'} value={columnTagList} onChange={handleColumnTagList} />
                    </div>
                }
                footer={
                    <>
                    <button onClick={importTable}>Import</button>
                    <button onClick={()=>props.setRowTag("")} >Cancel</button>
                    </>
                }
                close={()=>props.setRowTag("")}
            />
        </>
    );
}

export default ImportXML;
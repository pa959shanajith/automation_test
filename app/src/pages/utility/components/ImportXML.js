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

                const resp = await importDataTable({ content: props.xmlContent, row: rowTag, column:columnTagList, importFormat: "xml" });

                if(resp.error) 
                    props.setShowPop({title: "File Read Error", content: resp.error, type: "message"})
                else if (resp == "columnExceeds") {
                    props.setShowPop({title: "File Read Error", content: "Column should not exceed 15", type: "message"});
                }
                else if (resp == "rowExceeds") {
                    props.setShowPop({title: "File Read Error", content: "Row should not exceed 200", type: "message"});
                }
                else if (resp == "emptyData") {
                    props.setShowPop({title: "File Read Error", content: "Empty Data in the sheet", type: "message"});
                } 
                else if (resp == "emptyRow") {
                    props.setShowPop({title: "File Read Error", content: "Empty rows for the given row tag name", type: "message"});
                }
                else if (resp == "nestedXML") {
                    props.setShowPop({title: "File Read Error", content: "Invalid XML file. Cannot convert the XML to data table", type: "message"});
                } else if (resp === "invalidcols") {
                    props.setShowPop({title: "File Read Error", content: "Invalid column tag names", type: "message"});
                }
                else if (typeof resp === "object"){
                    const [, newData, newHeaders] = parseTableData(resp, "import")
                    props.setData(newData);
                    props.setHeaders(newHeaders);
                }
                props.setRowTag("");
            }
        }
        catch(error){
            props.setRowTag("");
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
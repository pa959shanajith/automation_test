import React, { useState, useEffect } from 'react';
import { validateData } from './DtUtils';
import { ModalContainer, Messages as MSG } from '../../global';
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
                    props.setShowPop(resp.error)
                else if (resp == "columnExceeds") {
                    props.setShowPop(MSG.UTILITY.ERR_COL_15);
                }
                else if (resp == "rowExceeds") {
                    props.setShowPop(MSG.UTILITY.ERR_ROW_200);
                }
                else if (resp == "emptyData") {
                    props.setShowPop(MSG.UTILITY.ERR_EMPTY_SHEET);
                } 
                else if (resp == "emptyRow") {
                    props.setShowPop(MSG.UTILITY.ERR_EMPTY_ROWS);
                }
                else if (resp == "nestedXML") {
                    props.setShowPop(MSG.UTILITY.ERR_INVALID_XML);
                } else if (resp === "invalidcols") {
                    props.setShowPop(MSG.UTILITY.ERR_COL_TAGNAME);
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
            props.setShowPop(MSG.UTILITY.ERR_FETCH_FILE)
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
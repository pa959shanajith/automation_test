import React, {useEffect} from 'react';
import TableRow from './TableRow';
import { ScrollBar } from '../../global'
import "../styles/TableContents.scss"

const TableContents = (props) => {
    let key =  0;
    return (
        <>
        {/* // <div className="ab">
        //     <div className="min">
        //         <div className="con">
        //             <ScrollBar> */}
                {
                    props.testCaseList.map((testCase, i) => <TableRow 
                                                                key={key++}
                                                                idx={i} 
                                                                objList={props.objList} 
                                                                testCase={testCase} 
                                                                edit={props.edit} 
                                                                getKeywords={props.getKeywords} 
                                                                getRowPlaceholders={props.getRowPlaceholders}
                                                                checkedRows={props.checkedRows}
                                                                updateChecklist={props.updateChecklist} 
                                                                focusedRow={props.focusedRow}
                                                                setFocusedRow={props.setFocusedRow}
                                                                setRowData={props.setRowData}
                                                                firstName={props.firstName}
                                                                lastName={props.lastName}
                                                                saveRemarks={props.saveRemarks}
                                                                saveDetails={props.saveDetails}
                                                                showRemarkDialog={props.showRemarkDialog}
                                                                rowChange={props.rowChange}
                                            />)
                }
        {/* //             </ScrollBar>
        //         </div>
        //     </div>
        // </div> */}
        </>
    );
}

export default TableContents;
import React, {useEffect} from 'react';
import TableRow from './TableRow';

/*
    will be removed soon
*/

const TableContents = (props) => {
    let key =  0;
    return (
        <>
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
                                                        showRemarkDialog={props.showRemarkDialog}
                                                        showDetailDialog={props.showDetailDialog}
                                                        rowChange={props.rowChange}
                                    />)
        }
        </>
    );
}

export default TableContents;
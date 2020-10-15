import React from 'react';
import TableRow from './TableRow';

const TableContents = (props) => {
    return (
        <>
        {
            props.testCaseList.map((testCase, i) => <TableRow 
                                                        idx={i} 
                                                        objList={props.objList} 
                                                        testCase={testCase} 
                                                        edit={props.edit} 
                                                        getKeywords={props.getKeywords} 
                                                        getRowPlaceholders={props.getRowPlaceholders}
                                                        setCheckedRows={props.setCheckedRows} 
                                                        focusedRow={props.focusedRow}
                                                        setFocusedRow={props.setFocusedRow}
                                    />)
        }
        </>
    );
}

export default TableContents;
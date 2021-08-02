import { v4 as uuid } from 'uuid';
import { ValidationExpression } from '../../global';

let undoStack = [];
let redoStack = [];

const parseTableData = (table, type) => {
    let name = table.name;
    let newData = [...table.datatable];
    let colHeaders = [...table.dtheaders];

    let [headerData, nameToIdObj] = getHeaders(type, colHeaders);    
    let rowData = getRowData(type, newData, nameToIdObj);
    
    return [name, rowData, headerData]
}

function getHeaders(type, colHeaders) {
    let nameToIdObj = {};
    let newHeaders = [];

    if (type === "import") {
        for(let i=0; i<colHeaders.length; i++)
            newHeaders.push({ __CELL_ID__:  colHeaders[i].id, name:  colHeaders[i].name });
    }
    else {
        for(let i=0; i<colHeaders.length; i++) {
            let headerId = uuid();
            let headerName = colHeaders[i];
            newHeaders.push({ __CELL_ID__: headerId , name: headerName });
            nameToIdObj[headerName] = headerId;
        }
    }

    return [newHeaders, nameToIdObj];
}

function getRowData(type, rows, nameToIdObj) {
    let newRows = [...rows];
    if (type === "import") {
        newRows.forEach(row => {
            row['__CELL_ID__'] = uuid();
        })
    }
    else {
        newRows.forEach(row => {
            Object.keys(nameToIdObj)
            .forEach(headerName => {
                let colValue = row[headerName];
                delete row[headerName];
                row[nameToIdObj[headerName]] = colValue;
            })
            row['__CELL_ID__'] = uuid();
        })
    }

    return newRows;
}

function prepareSaveData (tableName, headers, data){
    let errorFlag = { isTrue: false, value: "" };
    const name = tableName.trim();
    const headerArray = headers.map(header => {
        if (!header.name) errorFlag = { isTrue: true, value: "emptyHeader" }
        return header.name;
    });
    const uniqueHeaders = [...new Set(headerArray)];

    if (uniqueHeaders.length !== headerArray.length && !errorFlag.isTrue) 
        errorFlag = { isTrue: true, value: "duplicateHeaders" };

    let valuesArray = [];
    if (!errorFlag.isTrue) {
        errorFlag = { isTrue: true, value: "emptyData" };
        valuesArray = data.map(row => {
            let filteredObject = {};
            headers.forEach(header => {
                filteredObject[header.name] = row[header.__CELL_ID__] || "";
                if (errorFlag.isTrue && filteredObject[header.name].trim()) errorFlag = { isTrue: false, value: "" };
            })
            return filteredObject;
        })
    }

    return {
        tableName: name,
        headers: headerArray,
        data: errorFlag.isTrue ? errorFlag.value : valuesArray
    }
}

function prepareCopyData (headers, data, checklist) {
    let result = { isEmpty: true, copiedData: [] }
    let resp = [];
    
    if (checklist.type === 'row') 
        resp = checkRows(headers, data, checklist);
    else if (checklist.type === 'col')
        resp = checkColumns(headers, data, checklist);
    
    if (typeof resp === 'object') result = { isEmpty: false, copiedData: resp };

    return result;
}

function checkColumns (headers, data, checklist) {
    let isEmpty = true;
    let copiedCols = [];
    let tempCols = [];

    for (let hdrIdx=0; hdrIdx<headers.length; hdrIdx++) {
        if (checklist.list.includes(`sel||col||${headers[hdrIdx].__CELL_ID__}`)) {
            isEmpty = true;
            tempCols = [headers[hdrIdx].name];
            for (let rowIdx=0; rowIdx<data.length; rowIdx++) {
                let cellValue = data[rowIdx][headers[hdrIdx].__CELL_ID__] || "";
                tempCols.push(cellValue);
                if (cellValue) {
                    isEmpty = false;
                }
            }
            if (isEmpty) break;
            else copiedCols.push(tempCols);
        }
    }

    return isEmpty || { type: 'cols', cells: copiedCols };
}

function checkRows (headers, data, checklist) {
    let isEmpty = true;
    let checkData = true;
    let copiedRows = [];
    let tempRow = [];
    if (checklist.list.includes("sel||row||subheader")){
        tempRow = [];
        for (let hdrIdx=0; hdrIdx<headers.length; hdrIdx++) {
            let headerName = headers[hdrIdx].name || "";
            tempRow.push(headerName);
            if (headerName) {
                isEmpty = false;
            }
        }
        if (isEmpty) checkData=false;
        copiedRows.push(tempRow);
    }

    if (checkData) {
        for (let rowIdx=0; rowIdx<data.length; rowIdx++) {
            if (checklist.list.includes(`sel||row||${data[rowIdx].__CELL_ID__}`)) {
                isEmpty = true;
                tempRow = [];
                for (let hdrIdx=0; hdrIdx<headers.length; hdrIdx++) {
                    let cellValue = data[rowIdx][headers[hdrIdx].__CELL_ID__] || "";
                    tempRow.push(cellValue);
                    if (cellValue) {
                        isEmpty = false;
                    }
                }
                if (isEmpty) break;
                else copiedRows.push(tempRow);
            }
        }
    }
    return isEmpty || { type: 'rows', cells: copiedRows};
}

function pasteCells (copiedCells, headers, data, pasteIndex) {
    let newHeaders = [...headers];
    let newData = [...data];
    if (copiedCells.type === 'cols') {
        [newHeaders, newData] = pasteColumns(copiedCells, headers, data, pasteIndex);
    }
    else if (copiedCells.type === 'rows') {
        [newHeaders, newData] = pasteRows(copiedCells, headers, data, pasteIndex);
    }
    return [newHeaders, newData]
}

function pasteRows (copiedCells, newHeaders, newData, pasteIndex) {
    let createdRows = [];
    let rowsToPaste = [...copiedCells.cells];

    if (pasteIndex === 0) {
        let oldHeaderNames = newHeaders.map(header => header.name);
        rowsToPaste.push(oldHeaderNames);
        
        let trimEmptyCells = copiedCells.cells[0].join("%$%").replace(/(%\$%)+$/).split("%$%");
        let headerlength = newHeaders.length;
        let newHeadersRequired = trimEmptyCells.length-headerlength;
        
        if (newHeadersRequired>0) {
            for (let j=0; j<newHeadersRequired; j++) 
                newHeaders.push({__CELL_ID__: uuid(), name: `C${headerlength+j+1}`})
        }

        for (let i=0; i<newHeaders.length; i++){
            newHeaders[i].name = copiedCells.cells[0][i] || "";
        }

        rowsToPaste = rowsToPaste.slice(1);
    }

    for (let i=0; i<rowsToPaste.length; i++){
        let tempRow = { __CELL_ID__ : uuid() };
        
        let trimEmptyCells = rowsToPaste[i].join("%$%").replace(/(%\$%)+$/).split("%$%");
        let headerlength = newHeaders.length;
        let newHeadersRequired = trimEmptyCells.length-headerlength;
        
        if (newHeadersRequired>0) {
            for (let j=0; j<newHeadersRequired; j++) 
                newHeaders.push({__CELL_ID__: uuid(), name: `C${headerlength+j+1 }`})
        }

        for (let j=0; j<trimEmptyCells.length; j++){
            tempRow[newHeaders[j].__CELL_ID__] = rowsToPaste[i][j];
        }

        createdRows.push(tempRow);
    }

    let dataPasteIndex = pasteIndex-1<=0 ? 0 : pasteIndex-1;
    newData.splice(dataPasteIndex, 0, ...createdRows)

    return [newHeaders, newData];
}

function pasteColumns (copiedCells, newHeaders, newData, pasteIndex) {
    let createdHeaders = [];
    let newRowData = [];
    for (let i=0; i<copiedCells.cells.length; i++) {
        let tempRowData = [];
        let newHeaderId = uuid();
        let newHeader = { __CELL_ID__: newHeaderId, name: copiedCells.cells[i][0] };
        createdHeaders.push(newHeader);

        let trimEmptyCells = copiedCells.cells[i].join("%$%").replace(/(%\$%)+$/).split("%$%");
        let newRowsRequired = trimEmptyCells.length-1-newData.length;
        if (newRowsRequired>0) {
            for (let j=0; j<newRowsRequired; j++) 
                newData.push({__CELL_ID__: uuid()})
        }

        for (let k=1; k<copiedCells.cells[i].length; k++) {
            tempRowData.push({ [newHeaderId]: copiedCells.cells[i][k] });
        }
        newRowData.push(tempRowData);
    }
    newHeaders.splice(pasteIndex, 0, ...createdHeaders);
    for (let i=0; i<newData.length; i++) {
        for(let j=0; j<newRowData.length; j++){
            newData[i] = { ...newData[i], ...newRowData[j][i] };
        }
    }
    
    return [newHeaders, newData];
}

function validateData (tableName, tableData) {
    let validation = "saveData";
    if (!tableName.trim() || !ValidationExpression(tableName, "validName"))
        validation = "tableName";
    else if (tableData === "emptyData")
        validation = "emptyData";
    else if (tableData === "duplicateHeaders")
        validation = "duplicateHeaders";
    else if (tableData === "emptyHeader")
        validation = "emptyHeader";

    return validation;
}


function deleteData (dataOne, dataTwo, checkList) {
    let arrayOne = [...dataOne];
    let arrayTwo = [...dataTwo];
    let shouldBreak = !arrayTwo.length;
    for (let listItem of checkList){
        let dataId = listItem.split('||').pop();
        
        for (let i=0; i<arrayOne.length; i++){
            if (dataId === arrayOne[i].__CELL_ID__) {
                arrayTwo.forEach(row => {
                    delete row[arrayOne[i].__CELL_ID__]
                })
                arrayOne.splice(i, 1);
                if (shouldBreak) break;
            }
        }
    }

    return [arrayOne, arrayTwo];
}

function getPreviousData(data) {
    let result = "EMPTY_STACK";
    if (undoStack.length){
        let previousData = undoStack.pop();
        pushToRedo(data);
        result = JSON.parse(previousData);
    }
    return result;
}

function getNextData(data) {
    let result = "EMPTY_STACK";
    if (redoStack.length){
        let nextData = redoStack.pop();
        pushToHistory(data);
        result = JSON.parse(nextData);
    }
    return result;
}

function pushToHistory(data) {
    undoStack.push(JSON.stringify(data))
    if (undoStack.length > 5) undoStack.splice(0, 1);
    return;
}

function pushToRedo(data) {
    redoStack.push(JSON.stringify(data));
    if (redoStack.length > 5) redoStack.splice(0, 1);
    return;
}

function resetHistory () {
    undoStack = [];
    redoStack = [];
    return;
}

export {
    parseTableData,
    prepareCopyData,
    pasteCells,
    prepareSaveData,
    validateData,
    deleteData,
    getPreviousData,
    getNextData,
    resetHistory,
    pushToHistory
}
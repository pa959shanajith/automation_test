import { v4 as uuid } from 'uuid';

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

const updateData = (data, headers, lastEntry) => {
    let columnId = null;
    let newData = [...data];
    let foundCell = false;
    let foundCol = false;
    let currValue = {};

    for (let header of headers) {
        if (header.__CELL_ID__ === lastEntry.colId) {
            columnId = header.__CELL_ID__;
            currValue['colId'] = header.__CELL_ID__;
            foundCol = true;
            break;
        }
    }

    if (foundCol) {
        for (let row of newData) {
            if (row.__CELL_ID__ === lastEntry.rowId && columnId in row) {
                currValue['value'] = row[columnId];
                currValue['rowId'] = row.__CELL_ID__;
                row[columnId] = lastEntry.value;
                foundCell = true;
                break;
            }
        }
    }

    return [currValue, newData, foundCell];
}


function prepareSaveData (tableName, headers, data){
    let errorFlag = { isTrue: false, value: "" };
    const name = tableName.trim();
    const headerArray = headers.map(header => header.name);
    const uniqueHeaders = [...new Set(headerArray)];

    if (uniqueHeaders.length !== headerArray.length) 
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

function validateData (tableName, tableData) {
    let validation = "saveData";
    if (!tableName.trim())
        validation = "tableName";
    else if (tableData === "emptyData")
        validation = "emptyData";
    else if (tableData === "duplicateHeaders")
        validation = "duplicateHeaders";

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
    updateData,
    prepareSaveData,
    validateData,
    deleteData,
    getPreviousData,
    getNextData,
    resetHistory,
    pushToHistory
}
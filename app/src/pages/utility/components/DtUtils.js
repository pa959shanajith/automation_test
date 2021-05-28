import { v4 as uuid } from 'uuid';

const parseTableData = table => {
    // NAME
    let dataTableName = table.datatablename;

    let newData = JSON.parse(JSON.stringify([...table.datatable]))
    
    newData.forEach(row => {
        row['__CELL_ID__'] = uuid();
    })
    
    // SETTING UP COLUMN HEADERS
    let colHeaders = [...table.dtheaders];
    let newHeaders = [];
    for(let i=0; i<colHeaders.length; i++) {
        newHeaders.push({
            __CELL_ID__: uuid(),
            name: colHeaders[i],
        })
    }
    
    return [dataTableName, newData, newHeaders]
}

const updateData = (data, headers, lastEntry) => {
    let columnName = null;
    let newData = [...data];
    let foundCell = false;
    let foundCol = false;
    let currValue = {};

    for (let header of headers) {
        if (header.__CELL_ID__ === lastEntry.colId) {
            columnName = header.name;
            currValue['colId'] = header.__CELL_ID__;
            foundCol = true;
            break;
        }
    }

    if (foundCol) {
        for (let row of newData) {
            if (row.__CELL_ID__ === lastEntry.rowId && columnName in row) {
                currValue['value'] = row[columnName];
                currValue['rowId'] = row.__CELL_ID__;
                row[columnName] = lastEntry.value;
                foundCell = true;
                break;
            }
        }
    }

    return [currValue, newData, foundCell];
}


function prepareSaveData (tableName, headers, data){
    const dataTableName = tableName;
    const headerArray = headers.map(header => header.name);
    const valuesArray = data.map(row => {
        let filteredObject = {};
        headerArray.forEach(headerName => {
            filteredObject[headerName] = row[headerName] || "";
        })
        return filteredObject;
    })

    return {
        tableName: dataTableName,
        headers: headerArray,
        data: valuesArray
    }
}

function validateData (tableName) {
    let error = false;
    let invalidReg = /[\/:^?<>|\\&'"]/g;

    if (!tableName.trim() || invalidReg.test(tableName))
        error = {tableName: true};
    return error;
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
                    delete row[arrayOne[i].name]
                })
                arrayOne.splice(i, 1);
                if (shouldBreak) break;
            }
        }
    }

    return [arrayOne, arrayTwo];
}

export {
    parseTableData,
    updateData,
    prepareSaveData,
    validateData,
    deleteData
}
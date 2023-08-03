import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getUserDetails } from '../api';
import '../styles/UserList.scss';
import { Button } from 'primereact/button';


const UserList = () => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editingRows, setEditingRows] = useState({});


    useEffect(() => {
        console.log("Object.keys(columnHeaders)", Object.keys(columnHeaders));
        (async () => {
            try {
                const UserList = await getUserDetails("user");
                const filteredUserList = UserList.map((user) => {
                    const dataObject = {
                        useName: user[0],
                        firstName: user[4],
                        lastName: user[5],
                        email: user[6],
                        role: user[3]
                    };
                    return dataObject;
                });
                console.log(UserList);
                setData(filteredUserList);
            } catch (error) {
                console.error('Error fetching User list:', error);
            }
        })();
    }, []);


    const onEditorValueChange = (rowData, field, value) => {
        let updatedData = [...data];
        updatedData[rowData.index][field] = value;
        setData(updatedData);
    };

    const editorForRow = (rowData, field) => {
        return (
            <input
                type="text"
                value={rowData[field]}
                onChange={(e) => onEditorValueChange(rowData, field, e.target.value)}
            />
        );
    };

    const rowEditor = (props) => {
        return (
            <td>
                <button
                    className="p-row-editor-init p-link"
                    onClick={() => props.edit()}>
                </button>
            </td>
        );
    };

    const deleteSelectedRows = () => {

    };

    const rowDelete = (props) => {
        return (
            <td>
                <button
                    className="p-row-editor-init p-link"
                    onClick={() => setEditingRows({ ...editingRows, [props.rowIndex]: true })}>
                </button>
            </td>
        );
    };

    const columnHeaders = {
        useName: 'Username',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email ID',
        role: 'Primary Role',
    }

    // const renderActionsCell = (rowData) => {
    //     return (
    //         <div >

    //             <Tooltip target=".delete__icon" position="left" content=" Delete the element." />
    //             <img

    //                 src="static/imgs/ic-delete-bin.png"
    //                 style={{ height: "20px", width: "20px" }}
    //                 className="delete__icon" onClick={() => handleDelete(rowData)} />


    //             <Tooltip target=".edit__icon" position="right" content=" Edit the properties of elements." />
    //             <img src="static/imgs/ic-edit.png"

    //                 style={{ height: "20px", width: "20px" }}
    //                 className="edit__icon" onClick={() => openElementProperties(rowData)} />

    //         </div>
    //     )



const actionBodyTemplate = (rowData) => {
    return (
        <React.Fragment>
            <Button icon="pi pi-pencil" rounded outlined className="mr-2"  />
            <Button icon="pi pi-trash" rounded outlined severity="danger"  />
        </React.Fragment>
    );
}
    return (<>
        <div className="UserList card p-fluid" style={{ width: '69rem', padding: '1rem' }}>
            {/* <div className="card p-fluid"> rowEditor={true} body={rowEditor}  editor={(props) => editorForRow(props.rowData, field)}*/}
            {data.length > 0 ? (
                <DataTable value={data} editMode="row" className='ellipsis-table'>
                    {/* {Object.keys(columnHeaders).map((field) => (
                        <Column key={field} header={columnHeaders[field]} field={field}

                        />
                    ))} */}
                    <Column field="useName" header="User Name"  style={{ width: '20%' }}></Column>
                    <Column field="firstName" header="First Name"  style={{ width: '20%' }}></Column>
                    <Column field="lastName" header="Last Name"  style={{ width: '20%' }}></Column>
                    <Column field="email" header="Email"  style={{ width: '20%' }}></Column>
                    <Column field="role" header="Role"  style={{ width: '20%' }}></Column>
                    <Column rowEditor={true} headerStyle={{ width: '10%', minWidth: '8rem' }} ></Column>
                </DataTable>)
                : (
                    <div>
                        Loading data...........
                    </div>
                )}
            {/* </div> */}
        </div>
    </>)
}
export default UserList;
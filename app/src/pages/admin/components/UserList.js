import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getUserDetails } from '../api';
import EditLanding from './EditLanding';
import '../styles/UserList.scss';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Footer } from '../../global';



const UserList = (props) => {
    let emptyProduct = {
        id: null,
        name: '',
        image: null,
        description: '',
        category: null,
        price: 0,
        quantity: 0,
        rating: 0,
        inventoryStatus: 'INSTOCK'
    };

    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editingRows, setEditingRows] = useState({});
    const [rowEditor, setRowEditor] = useState(false);
    const [rowEditDialog, setRowEditDialog] = useState([]);
    const [editableRowData, setEditableRowData] = useState('');
    const [globalFilter, setGlobalFilter] = useState('');

    useEffect(() => {
        // console.log("Object.keys(columnHeaders)", Object.keys(columnHeaders));
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

    const header = (
        <div className='User_header'>
            <p>User List</p>
            <InputText
                className='User_Inp'
                type="search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search User Field"
            />
        </div>
    );

    const editorForRow = (rowData, field) => {
        return (
            <input
                type="text"
                value={rowData[field]}
                onChange={(e) => onEditorValueChange(rowData, field, e.target.value)}
            />
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

    const editRowData = (rowData) => {
        setRowEditDialog(true);
        setEditableRowData({ rowData });
    }
    const textEditor = (options) => {
        return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                {/* <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editRowData(rowData)} /> */}
                <img src="static/imgs/ic-edit.png"

          style={{ height: "20px", width: "20px" }}
          className="edit__usericon" onClick={() => editRowData(rowData)} />
          <img

src="static/imgs/ic-delete-bin.png"
style={{ height: "20px", width: "20px", marginLeft:"0.5rem"}}
className="delete__usericon" />
                {/* <Button icon="pi pi-trash" rounded outlined severity="danger"  /> */}
            </React.Fragment>
        );
    }


    return (<>

        {/* <EditLanding   rowEditDialog={rowEditDialog}/> */}
        <div className="UserList card p-fluid" style={{ width: '69rem', padding: '1rem' }}>
            {/* <div className="card p-fluid"> rowEditor={true} body={rowEditor}  editor={(props) => editorForRow(props.rowData, field)}*/}
            {data.length > 0 ? (
                <DataTable value={data} editMode="row"
                    globalFilter={globalFilter}
                    header={header}
                    emptyMessage="No users found"
                    scrollable
                    scrollHeight='28rem'>
                    <Column field="useName" header="User Name" style={{ width: '20%' }}></Column>
                    <Column field="firstName" header="First Name" style={{ width: '20%' }}></Column>
                    <Column field="lastName" header="Last Name" style={{ width: '20%' }}></Column>
                    <Column field="email" header="Email" style={{ width: '20%' }}></Column>
                    <Column field="role" header="Role" style={{ width: '20%' }}></Column>
                    <Column header="Actions" body={actionBodyTemplate} headerStyle={{ width: '10%', minWidth: '8rem' }} ></Column>
                </DataTable>)
                : (
                    <div>
                        Loading data...........
                    </div>
                )}
            {/* </div> */}


            {/* <Dialog visible={rowEditDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Product Details" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="name" className="font-bold">
                        Name
                    </label>
                    <InputText className={classNames({ 'p-invalid': submitted && !product.name })} />
                </div>
                <div className="field">
                    <label htmlFor="description" className="font-bold">
                        Description
                    </label>
                </div>

            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {product && (
                        <span>
                            Are you sure you want to delete <b>{product.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog> */}
        </div>
        
{/* 
{showDeleteModal?
                <Dialog header="Delete User"  visible={setshowDeleteModal(true)}  footer={<Footer {...submitModalButtons(props.manage, setshowDeleteModal)}/>} onHide={()=>{setshowDeleteModal(false);}} content= {"Are you sure you want to delete ? \nAll task assignment information and ICE provisions will be deleted for this user."} />
            :null} */}
    </>)
}

export default UserList;
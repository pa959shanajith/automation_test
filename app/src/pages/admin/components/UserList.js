import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getUserDetails } from '../api';
import EditLanding from './EditLanding';
import '../styles/UserList.scss';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Footer, ModalContainer } from '../../global';
import CreateUser from './CreateUser';
import { AdminActions } from '../adminSlice';
import { useDispatch, useSelector } from 'react-redux';



const UserList = (props) => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [editUserDialog, setEditUserDialog] = useState(false);
    const [editUserData, setEditUserData] = useState('')
    const allUserList = useSelector(state => state.admin.allUsersList);
    const [showDeleteConfirmPopUp, setShowDeleteConfirmPopUp] = useState(false);


    useEffect(() => {
        (async () => {
            try {
                const UserList = await getUserDetails("user");
                let filteredUserList = [];
                UserList.map((user) => {
                    if (user[3] !== "Admin") {
                        const dataObject = {
                            userName: user[0],
                            userId: user[1],
                            firstName: user[4],
                            lastName: user[5],
                            email: user[6],
                            role: user[3]
                        };
                        filteredUserList.push(dataObject);
                    }
                });
                setData(filteredUserList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching User list:', error);
            }
        })();
    }, [props.refreshUserList]);

    const reloadData = async () => {
        const UserList = await getUserDetails("user");
        let filteredUserList = [];
        UserList.map((user) => {
            if (user[3] !== "Admin") {
                const dataObject = {
                    userName: user[0],
                    userId: user[1],
                    firstName: user[4],
                    lastName: user[5],
                    email: user[6],
                    role: user[3]
                };
                filteredUserList.push(dataObject);
            }
        });
        setData(filteredUserList);
    }

    const header = (
        <div className='User_header'>
            <p>User List</p>
            <i className="pi pi-search user_search" />
            <InputText
                className='User_Inp'
                type="search"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search"
            />
        </div>
    );


    const editRowData = (rowData) => {
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(rowData.userName));
        dispatch(AdminActions.UPDATE_INPUT_LASTNAME(rowData.lastName));
        dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(rowData.firstName));
        dispatch(AdminActions.UPDATE_USERID(rowData.userId));
        dispatch(AdminActions.UPDATE_USERIDNAME(rowData.userId + ";" + rowData.userName));
        dispatch(AdminActions.UPDATE_INPUT_EMAIL(rowData.email));
        dispatch(AdminActions.UPDATE_USERROLE(rowData.role));
        setEditUserData(rowData);
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className='flex flex-row' style={{justifyContent:"center", gap:"0.5rem"}}>
                <img src="static/imgs/ic-edit.png" alt="editUserIcon"
                    style={{ height: "20px", width: "20px" }}
                    className="edit__usericon" onClick={() => { editRowData(rowData); dispatch(AdminActions.EDIT_USER(true)); setEditUserDialog(true) }}
                />
                <img
                    src="static/imgs/ic-delete-bin.png" alt="deleteUserIcon"
                    style={{ height: "20px", width: "20px", marginLeft: "0.5rem" }}
                    className="delete__usericon"
                    onClick={() => { editRowData(rowData); setShowDeleteConfirmPopUp(true); dispatch(AdminActions.EDIT_USER(false)); }}
                />
            </div>
        );
    }


    return (<>

        <div className="UserList card p-fluid surface-100" style={{ width: '100%', padding: '1rem' }}>
            <ModalContainer
                title="Please Confirm"
                show={showDeleteConfirmPopUp}
                content={"Are you sure, you want to delete the user"}
                close={() => setShowDeleteConfirmPopUp(false)}
                footer={
                    <>
                        <Button outlined label="No" size='small' onClick={() => setShowDeleteConfirmPopUp(false)}></Button>
                        <Button label="Yes" size='small' onClick={() => { props.manage({ action: "delete" }); setShowDeleteConfirmPopUp(false); }}></Button>
                    </>}
                width={{ width: "5rem" }}
            />
            <DataTable value={data} editMode="row" size='normal'
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No users found"
                scrollable
                scrollHeight='60vh'
                showGridlines>
                <Column field="userName" header="User Name" style={{ width: '20%' }}></Column>
                <Column field="firstName" header="First Name" style={{ width: '20%' }}></Column>
                <Column field="lastName" header="Last Name" style={{ width: '20%' }}></Column>
                <Column field="email" header="Email" className='table_email'></Column>
                <Column field="role" header="Role" style={{ width: '20%' }}></Column>
                <Column header="Actions" body={actionBodyTemplate} headerStyle={{ width: '10%', minWidth: '8rem' }} ></Column>
            </DataTable>

            {editUserDialog && <CreateUser createUserDialog={editUserDialog}
                reloadData={reloadData}
                refreshUserList={props.refreshUserList}
                setRefreshUserList={props.setRefreshUserList}
                setCreateUserDialog={setEditUserDialog}
                setEditUserData={setEditUserData}
                editUserData={editUserData} 
                toastSuccess={props.toastSuccess}
                toastError={props.toastError}
                toastWarn={props.toastWarn}
                toast={props.toast} />}
        </div>
    </>)
}

export default UserList;
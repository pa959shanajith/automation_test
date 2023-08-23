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
    const [editUser,setEditUser]=useState('')
    const allUserList = useSelector(state => state.admin.allUsersList);
    const [showDeleteConfirmPopUp, setShowDeleteConfirmPopUp] = useState(false);


    useEffect(() => {
        (async () => {
            if (allUserList.length === 0) {
                try {
                    const UserList = await getUserDetails("user");
                    const filteredUserList = UserList.map((user) => {
                        const dataObject = {
                            userName: user[0],
                            userId: user[1],
                            firstName: user[4],
                            lastName: user[5],
                            email: user[6],
                            role: user[3]
                        };
                        return dataObject;
                    });
                    setData(filteredUserList);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching User list:', error);
                }
            }
            else setData(allUserList);
        })();
    }, []);

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


    const editRowData = (rowData) => {
        setEditUser(rowData);
        dispatch(AdminActions.EDIT_USER(true));
        dispatch(AdminActions.UPDATE_INPUT_USERNAME(rowData.userName));
        dispatch(AdminActions.UPDATE_INPUT_LASTNAME(rowData.lastName));
        dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(rowData.firstName));
        dispatch(AdminActions.UPDATE_USERID(rowData.userId));
        dispatch(AdminActions.UPDATE_USERIDNAME(rowData.userId + ";" + rowData.userName));
        dispatch(AdminActions.UPDATE_INPUT_EMAIL(rowData.email));
        dispatch(AdminActions.UPDATE_USERROLE(rowData.role));
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <img src="static/imgs/ic-edit.png"
                    style={{ height: "20px", width: "20px" }}
                    className="edit__usericon" onClick={() => { editRowData(rowData); setEditUserDialog(true); }}
                />
                <img
                    src="static/imgs/ic-delete-bin.png"
                    style={{ height: "20px", width: "20px", marginLeft: "0.5rem" }}
                    className="delete__usericon"
                    onClick={() => { editRowData(rowData); setShowDeleteConfirmPopUp(true) }}
                />
            </React.Fragment>
        );
    }


    return (<>

        <div className="UserList card p-fluid" style={{ width: '69rem', padding: '1rem' }}>
            <ModalContainer
                title="Please Confirm"
                show={showDeleteConfirmPopUp}
                content={"Are you sure, you want to delete the user"}
                close={() => setShowDeleteConfirmPopUp(false)}
                footer={
                    <>
                        <Button outlined size='small' label="No" onClick={() => setShowDeleteConfirmPopUp(false)}></Button>
                        <Button label="Yes" size='small' onClick={() => props.manage({ action: "delete" })}></Button>
                    </>}
                width={{ width: "5rem" }}
            />
            <DataTable value={data} editMode="row" size='normal' 
            loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No users found"
                scrollable
                scrollHeight='28rem'>
                <Column field="userName" header="User Name" style={{ width: '20%' }}></Column>
                <Column field="firstName" header="First Name" style={{ width: '20%' }}></Column>
                <Column field="lastName" header="Last Name" style={{ width:'20%' }}></Column>
                <Column field="email" header="Email" className='table_email'></Column>
                <Column field="role" header="Role" style={{ width: '20%' }}></Column>
                <Column header="Actions" body={actionBodyTemplate} headerStyle={{ width: '10%', minWidth: '8rem' }} ></Column>
            </DataTable>

            {editUserDialog && <CreateUser createUserDialog={editUserDialog} setCreateUserDialog={setEditUserDialog} setEditUser={setEditUser} editUser={editUser}/>}
        </div>
    </>)
}

export default UserList;
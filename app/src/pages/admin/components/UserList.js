import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import '../styles/UserList.scss';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Footer, ModalContainer, Messages as MSG } from '../../global';
import CreateUser from './CreateUser';
import { AdminActions } from '../adminSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'primereact/tooltip';
import { getLDAPConfig, getSAMLConfig, getOIDCConfig, getUserDetails } from '../api';




const UserList = (props) => {
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [editUserDialog, setEditUserDialog] = useState(false);
    const [editUserData, setEditUserData] = useState('')
    const allUserList = useSelector(state => state.admin.allUsersList);
    const [showDeleteConfirmPopUp, setShowDeleteConfirmPopUp] = useState(false);
    let userInfo = JSON.parse(localStorage.getItem('userInfo'));

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
                            role: user[3],
                            roleId: user[2],
                            isAdmin: user[8]

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
                    role: user[3],
                    roleId: user[2],
                    isAdmin: user[8]
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

    const editRowData = (userId) => {
        (async () => {
            // setLoading("Fetching User details...");
        try{
            const data = await getUserDetails("userid", userId);
            if(data.error){props.toastError(data.error);return;}
            else {
                setLoading(false);
                const uType = data.type;
                setEditUserData(data);
                dispatch(AdminActions.UPDATE_DATA(data));
                dispatch(AdminActions.UPDATE_TYPE(uType));
                dispatch(AdminActions.UPDATE_INPUT_USERNAME(data.username));
                dispatch(AdminActions.UPDATE_INPUT_LASTNAME(data.lastname));
                dispatch(AdminActions.UPDATE_INPUT_FIRSTNAME(data.firstname));
                dispatch(AdminActions.UPDATE_USERID(data.userid));
                dispatch(AdminActions.UPDATE_USERIDNAME(data.userid + ";" + data.username));
                dispatch(AdminActions.UPDATE_INPUT_EMAIL(data.email));
                dispatch(AdminActions.UPDATE_USERROLE(data.role));
                
                data.addrole.forEach((e) => dispatch(AdminActions.ADD_ADDROLE, e));

                if (data.type !== "inhouse") {
                    var confserver = data.server;
                    dispatch(AdminActions.UPDATE_SERVER(""));
                    dispatch(AdminActions.UPDATE_CONF_SERVER_LIST([]));
                    let serverNameList = [];
                    dispatch(AdminActions.UPDATE_NO_CREATE(false));
                    // data.map(data => serverNameList.push(data.name))

                    if (data.type === "ldap") {
                        dispatch(AdminActions.UPDATE_LDAP({fetch: "map", user: ''}))
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching LDAP Server configurations...");
                        var data1 = await getLDAPConfig("server");
                        if(data1.error){props.toastError(data1.error);return;}
                        setLoading(false);
                        if (data1 === "empty") {
                            props.toastWarn(MSG.ADMIN.WARN_LDAP_CONFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false))
                            data1.map(data => serverNameList.push(data.name))
                        }
                    }
                    else if (data.type === "saml"){
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching SAML Server configurations...");
                        data1 = await getSAMLConfig();
                        if(data1.error){props.toastError(data1.error);return;}
                        setLoading(false);
                        if (data === "empty") {
                            props.toastWarn(MSG.ADMIN.WARN_SAML_CINFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false))
                            data1.map(data => serverNameList.push(data.name))
                        }
                    }
                    else if (data.type === "oidc"){ 
                        dispatch(AdminActions.UPDATE_NO_CREATE(true))
                        setLoading("Fetching OpenID Server configurations...");
                        data1 = await getOIDCConfig();
                        if(data1.error){props.toastError(data1.error);return;}
                        setLoading(false);
                        if(data1 === "empty" ){
                            props.toastWarn(MSG.ADMIN.WARN_OPENID_CONFIGURE);
                        } else {
                            dispatch(AdminActions.UPDATE_NO_CREATE(false))
                            data1.map(data => serverNameList.push(data.name))
                        }
                    }
                    if (!data1.some(function(e) { return e.name === confserver;})) {
                        dispatch(AdminActions.UPDATE_CONF_SERVER_LIST_PUSH( {_id: '', name: confserver}));
                        dispatch(AdminActions.UPDATE_CONF_EXP(confserver));
                    }
                    dispatch(AdminActions.UPDATE_CONF_SERVER_LIST(serverNameList.sort()));
                    dispatch(AdminActions.UPDATE_SERVER(data.server));
                    dispatch(AdminActions.UPDATE_LDAP_USER(data.ldapuser || ''));
                }
            }  
        }catch(error){
            setLoading(false);
            props.toastError(MSG.ADMIN.ERR_FETCH_USER_DETAILS);
        }
        })();
    }
    const editHandler = (event, rowData) => {
        if(rowData.userId !== userInfo?.user_id){
            editRowData(rowData.userId);
            setShowDeleteConfirmPopUp(true);
            dispatch(AdminActions.EDIT_USER(false));
        }
        else event.preventDefault();
    }
    

    const actionBodyTemplate = (rowData) => {
        return (
            <div className='flex flex-row' style={{justifyContent:"center", gap:"0.5rem"}}>
                <img src="static/imgs/ic-edit.png" alt="editUserIcon"
                    style={{ height: "20px", width: "20px" }}
                    className="edit__usericon" onClick={() => { editRowData(rowData.userId); dispatch(AdminActions.EDIT_USER(true)); setEditUserDialog(true) }}
                />
                {rowData.userId === userInfo?.user_id && <Tooltip target=".edit__usericon__disabled" content='Action not allowed' position='bottom'></Tooltip>}
                <img
                    src="static/imgs/ic-delete-bin.png" alt="deleteUserIcon"
                    style={{ height: "20px", width: "20px", marginLeft: "0.5rem" }}
                    className={`${rowData.userId === userInfo?.user_id ? "edit__usericon__disabled" :"edit__usericon"}`}
                    onClick={(e) => { editHandler(e, rowData) }}
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
                <Column field="userName" header="User Name" style={{ width: '20%' }} bodyClassName={"ellipsis-column"}></Column>
                <Column field="firstName" header="First Name" style={{ width: '20%' }} bodyClassName={"ellipsis-column"}></Column>
                <Column field="lastName" header="Last Name" style={{ width: '20%' }} bodyClassName={"ellipsis-column"}></Column>
                <Column field="email" header="Email" className='table_email' bodyClassName={"ellipsis-column"}></Column>
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
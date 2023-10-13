import React, { useRef, useState } from "react";
import CreateUser from "../components/CreateUser";
import { fetchICE, manageSessionData, manageUserDetails } from '../api';
import { Toast } from 'primereact/toast';
import UserList from "../components/UserList";
import { ScreenOverlay, VARIANT, Messages as MSG } from '../../global'
import { useSelector } from 'react-redux';


const UserHome = (props) => {
    const toast = useRef();
    const [refreshUserList, setRefreshUserList] = useState(false);
    const [loading, setLoading] = useState(false);
    const type = useSelector(state => state.admin.type);
    const allRoles = useSelector(state => state.admin.allRoles);
    const userId = useSelector(state => state.admin.userId);
    const userName = useSelector(state => state.admin.userName);
    const passWord = useSelector(state => state.admin.passWord);
    const firstname = useSelector(state => state.admin.firstname);
    const lastname = useSelector(state => state.admin.lastname);
    const email = useSelector(state => state.admin.email);
    const role = useSelector(state => state.admin.role);
    const server = useSelector(state => state.admin.server);

    const manage = (props) => {
        toast.current.clear();
        const action = props.action;
        const uType = type;
        const addRole = [];
        for (let role in addRole) {
            if (addRole[role]) addRole.push(role);
        }
        const createdbyrole = allRoles.filter((e) => (e[0].toLowerCase() === "admin"));;
        var userObj = {
            userid: userId,
            username: userName,
            password: passWord,
            firstname: firstname,
            lastname: lastname,
            email: email,
            role: role,
            addRole: addRole,
            type: uType,
            createdbyrole: createdbyrole,
            server: server,
        };
        (async () => {
            try {
                var data = await manageUserDetails(action, userObj);
                if (data.error) { toastError(data.error); return; }
                setLoading(false);
                if (data === "success") {
                    if (action === "delete") {
                        toastSuccess(MSG.CUSTOM("User " + action + "d successfully!", VARIANT.SUCCESS));
                        setRefreshUserList(!refreshUserList);
                        const data0 = await manageSessionData('logout', userObj.username, '?', 'dereg')
                        if (data0.error) { toastError(data0.error); return; }
                        var data1 = await fetchICE(userObj.userid)
                        if (data1.error) { toastError(data1.error); return; }
                        else if (data1.length === 0) return false;
                        const icename = data1[0].icename;
                        var data2 = await manageSessionData('disconnect', icename, '?', 'dereg')
                        if (data2.error) { toastError(data2.error); return; }
                    }
                }
            }
            catch (error) {
                toastError(MSG.CUSTOM("Failed to " + action + " user.", VARIANT.ERROR));
            }
        })()
    }


    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }

    return (
        <>
            {loading ? <ScreenOverlay content={loading} /> : null}
            <Toast ref={toast} position={"bottom-center"} style={{ maxWidth: "50rem" }} baseZIndex={2000} />
            <UserList
                manage={manage}
                refreshUserList={refreshUserList}
                setRefreshUserList={setRefreshUserList}
                toastSuccess={toastSuccess}
                toastError={toastError}
                toastWarn={toastWarn}
                toast={toast} />
            <CreateUser
                createUserDialog={props.createUserDialog}
                setCreateUserDialog={props.setCreateUserDialog}
                refreshUserList={refreshUserList}
                setRefreshUserList={setRefreshUserList}
                toastSuccess={toastSuccess}
                toastError={toastError}
                toastWarn={toastWarn}
                toast={toast} />
        </>
    )
}

export default UserHome;
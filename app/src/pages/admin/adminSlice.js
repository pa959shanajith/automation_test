import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    header: '',
    screen: '',
    userId: '',
    userName: '',
    userIdName: '',
    firstname: '',
    lastname: '',
    passWord: '',
    confirmPassword: '',
    email: '',
    role: '',
    addRole: {},
    nocreate: false,
    confExpired: false,
    ldapUserFilter: '',
    allUserFilter: '',
    type: "inhouse",
    allRoles: [],
    allAddRoles: [],
    server: "",
    ldap: { fetch: "map", user: '' },
    confServerList: [],
    ldapAllUserList: [],
    allUsersList: [],
    fType: "Default",
    rolename: "",
    editUser: false
}

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        Header: (state, action) => {
            state.header = action.payload
        },
        SetScreen: (state, action) => {
            state.screen = action.payload
        },
        UPDATE_INPUT_USERNAME: (state, action) => {
            state.userName = action.payload
        },
        UPDATE_ROLENAME: (state, action) => {
            state.rolename = action.payload
        },
        UPDATE_FTYPE: (state, action) => {
            state.fType = action.payload
        },
        UPDATE_ALL_USERS_LIST: (state, action) => {
            state.allUsersList = action.payload
        },
        UPDATE_INPUT_FIRSTNAME: (state, action) => {
            state.firstname = action.payload
        },
        UPDATE_USERID: (state, action) => {
            state.userId = action.payload
        },
        UPDATE_INPUT_LASTNAME: (state, action) => {
            state.lastname = action.payload
        },
        UPDATE_INPUT_PASSWORD: (state, action) => {
            state.passWord = action.payload
        },
        UPDATE_INPUT_CONFIRMPASSWORD: (state, action) => {
            state.confirmPassword = action.payload
        },
        UPDATE_INPUT_EMAIL: (state, action) => {
            state.email = action.payload
        },
        UPDATE_ALLROLES: (state, action) => {
            state.allRoles = action.payload
        },
        UPDATE_ALLADDROLES: (state, action) => {
            state.allAddRoles = action.payload
        },
        UPDATE_ADDROLES: (state, action) => {
            state.addRole = action.payload
        },
        UPDATE_USERROLE: (state, action) => {
            state.role = action.payload
        },
        UPDATE_TYPE: (state, action) => {
            state.type = action.payload
        },
        UPDATE_CONF_SERVER_LIST_PUSH: (state, action) => {
            state.confServerList = action.payload
        },
        UPDATE_USERIDNAME: (state, action) => {
            state.userIdName = action.payload
        },

        UPDATE_NO_CREATE: (state, action) => {
            state.nocreate = action.payload
        },
        UPDATE_LDAP_USER_FILTER: (state, action) => {
            state.ldapUserFilter = action.payload
        },
        UPDATE_CONF_EXP: (state, action) => {
            state.confExpired = action.payload
        },
        UPDATE_ALL_USER_FILTER: (state, action) => {
            state.allUserFilter = action.payload
        },
        UPDATE_SERVER: (state, action) => {
            state.server = action.payload
        },
        UPDATE_LDAP: (state, action) => {
            state.ldap = action.payload
        },
        UPDATE_CONF_SERVER_LIST: (state, action) => {
            state.confServerList = action.payload
        },
        UPDATE_LDAP_ALLUSER_LIST: (state, action) => {
            state.ldapAllUserList = action.payload
        },
        UPDATE_LDAP_USER: (state, action) => {
            state.ldap = { fetch: state.ldap.fetch, user: action.payload }
        },
        UPDATE_LDAP_FETCH: (state, action) => {
            state.ldap = { fetch: state.ldap.user, fetch: action.payload }
        },
        ADD_ADDROLE: (state, action) => {
            state.addRole[action.payload] = true;
        },
        EDIT_USER: (state, action) => {
            state.editUser = action.payload;
        },
        EDIT_ADDROLES: (state, action) => {
            if (state.addRole[action.payload] === undefined) state.addRole[action.payload] = true;
            else state.addRole[action.payload] = !state.addRole[action.payload];
        },
        RESET_VALUES: (state, action) => {
            state.userId = "";
            state.userName = "";
            state.userIdName = "";
            state.firstname = "";
            state.lastname = "";
            state.passWord = "";
            state.confirmPassword = "";
            state.email = "";
            state.role = "";
            state.allRoles = [];
            state.nocreate = false;
            state.confExpired = false;
            state.ldapUserFilter = "";
            state.ldapAllUserList = "";
            state.allUserFilter = "";
        },
        UPDATE_DATA: (state, action) => {
            state.userId = action.payload.userid;
            state.userName = action.payload.username;
            state.userIdName = action.payload.userid + ";" + action.payload.username;
            state.firstname = action.payload.firstname;
            state.lastname = action.payload.lastname;
            state.passWord = "";
            state.confirmPassword = "";
            state.rolename = action.payload.rolename;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.type = action.payload.type;
            state.confExpired = false;
        },
        UPDATE_LDAP_DATA: (state, action) => {
            state.userName = action.payload.username;
            state.firstname = action.payload.firstname;
            state.lastname = action.payload.lastname;
            state.email = action.payload.email;
            state.ldap = { fetch:state.ldap.fetch, user: action.payload.ldapname };
            state.nocreate = false;
        }

    }
})


export const AdminActions = adminSlice.actions

export default adminSlice.reducer
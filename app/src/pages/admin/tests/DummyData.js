const userConf = {
        userId : '',
		userName : '',
		userIdName : '',
		firstname : '',
		lastname : '',
		passWord : '',
		confirmPassword : '',
		email : '',
		role : '',
		addRole : {},
		nocreate : false,
		confExpired : false,
		ldapUserFilter : '',
        allUserFilter : '',
        type : "inhouse",
        allRoles : [],
        allAddRoles : [],
        server : "",
        ldap : {fetch: "map", user: ''},
        confServerList : [],
        ldapAllUserList : [],
        allUsersList : [],
        fType : "Default",
        rolename : ""
};

const getUserRolesApiResponse = [
    [
        "Admin",
        "5db0022cf87fdec084ae49a9"
    ],
    [
        "Test Lead",
        "5db0022cf87fdec084ae49aa"
    ],
    [
        "Test Manager",
        "5db0022cf87fdec084ae49ab"
    ],
    [
        "Test Engineer",
        "5db0022cf87fdec084ae49ac"
    ]
]

const getSAMLConfigResponse = [
    {
        "_id": "602a2f23979af3abed9c8207",
        "name": "samlServer"
    }
]

const getOIDCConfigResponse = [
    {
        "_id": "602a2f56979af3abed9c8208",
        "name": "testoidcserver"
    },
    {
        "_id": "603dfbd04a113689a09316c8",
        "name": "testoi"
    }
]

const getLDAPConfigResponse = [
    {
        "_id": "602ce3d3428de2cbc4666d7d",
        "name": "ldapserver"
    }
]

const EditLandingProps = {
    resetMiddleScreen : jest.fn(),
    showEditUser : false,
    firstnameAddClass: true,
    lastnameAddClass: true,
    confServerAddClass: false,
    ldapGetUser: jest.fn(),
    ldapDirectoryAddClass: false,
    clearForm: jest.fn(),
    allUserFilList: [],
    manage: false, 
    searchFunctionUser: jest.fn(),
    click: jest.fn(),
    setShowDropdownEdit: jest.fn(),
    showDropdownEdit: jest.fn(),
    getUserData: jest.fn(),
}

const TokenMgmtProps = {
    "showList": true,
    "allTokens": [
        {
            "_id": "5fe1f8453ab69388058237ec",
            "deactivated": "active",
            "expireson": "Thu, 28 Oct 2021 19:14:00 GMT",
            "generatedon": "Tue, 22 Dec 2020 19:14:37 GMT",
            "icetype": "normal",
            "name": "token",
            "projects": [],
            "type": "TOKENS",
            "userid": "5f2d658f29ab779aceb37586",
            "expiry": ""
        }
    ],
    "targetid": "5f2d658f29ab779aceb37586"
}

const SessionData = {
    "sessionData":
    [
        {
            "username":"admin",
            "id":"QktMYUtGbm5LcldyaWdJQzMtdjExUGdxS1BVbDZiWW8=",
            "role":"Admin",
            "loggedin":"4/15/2021, 1:05:29 PM"
        }
    ],
    "clientData":[]
}


module.exports={
    userConf:userConf,
    getUserRolesApiResponse:getUserRolesApiResponse,
    getSAMLConfigResponse:getSAMLConfigResponse,
    getOIDCConfigResponse:getOIDCConfigResponse,
    getLDAPConfigResponse:getLDAPConfigResponse,
    EditLandingProps:EditLandingProps,
    TokenMgmgProps: TokenMgmtProps,
    SessionData: SessionData
}
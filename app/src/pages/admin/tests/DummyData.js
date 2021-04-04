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

module.exports={
    userConf:userConf,
    getUserRolesApiResponse:getUserRolesApiResponse,
    getSAMLConfigResponse:getSAMLConfigResponse,
    getOIDCConfigResponse:getOIDCConfigResponse,
    getLDAPConfigResponse:getLDAPConfigResponse,
    EditLandingProps:EditLandingProps
}
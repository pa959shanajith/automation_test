import * as actionTypes from './action.js';

const initialState = {
    userConf : {
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
    }
};

const reducer = (state = initialState , action) => {
    
    switch (action.type) {
        case actionTypes.UPDATE_INPUT_USERNAME:
            return{
                ...state,
                userConf : {...state.userConf,userName :action.payload}
            }
        case actionTypes.UPDATE_ROLENAME:
            return{
                ...state,
                userConf : {...state.userConf,rolename :action.payload}
            }
        case actionTypes.UPDATE_FTYPE:
            return{
                ...state,
                userConf : {...state.userConf,fType :action.payload}
            }
        case actionTypes.UPDATE_ALL_USERS_LIST:
            return{
                ...state,
                userConf : {...state.userConf,allUsersList :action.payload}
            }
        case actionTypes.UPDATE_INPUT_FIRSTNAME:
            return{
                ...state,
                userConf : {...state.userConf,firstname :action.payload}
            }
        case actionTypes.UPDATE_USERID:
            return{
                ...state,
                userConf : {...state.userConf,userId :action.payload}
            }    
        case actionTypes.UPDATE_INPUT_LASTNAME:
            return{
                ...state,
                userConf : {...state.userConf,lastname :action.payload}
            }
        case actionTypes.UPDATE_INPUT_PASSWORD:
            return{
                ...state,
                userConf : {...state.userConf,passWord :action.payload}
            }
        case actionTypes.UPDATE_INPUT_CONFIRMPASSWORD:
            return{
                ...state,
                userConf : {...state.userConf,confirmPassword :action.payload}
            }
        case actionTypes.UPDATE_INPUT_EMAIL:
            return{
                ...state,
                userConf : {...state.userConf,email :action.payload}
            }
        case actionTypes.UPDATE_ALLROLES:
            return{
                ...state,
                userConf : {...state.userConf,allRoles :action.payload}
            }
        case actionTypes.UPDATE_ALLADDROLES:
            return{
                ...state,
                userConf : {...state.userConf,allAddRoles :action.payload}
            } 
        case actionTypes.UPDATE_ADDROLES:
            return{
                ...state,
                userConf : {...state.userConf,addRole :action.payload}
            } 
        case actionTypes.UPDATE_USERROLE:
            return{
                ...state,
                userConf : {...state.userConf,role :action.payload}
            }   
        case actionTypes.UPDATE_TYPE:
            return{
                ...state,
                userConf : {...state.userConf,type :action.payload}
            }     
        case actionTypes.UPDATE_CONF_SERVER_LIST_PUSH:
            state.userConf.confServerList.push(action.payload);
            return{
                ...state,
                userConf : {...state.userConf,confServerList :state.userConf.confServerList}
            } 
        case actionTypes.UPDATE_USERIDNAME:
            return{
                ...state,
                userConf : {...state.userConf,userIdName :action.payload}
            }    
        
        case actionTypes.UPDATE_NO_CREATE:
            return{
                ...state,
                userConf : {...state.userConf,nocreate :action.payload}
            } 
        case actionTypes.UPDATE_LDAP_USER_FILTER:
            return{
                ...state,
                userConf : {...state.userConf,ldapUserFilter :action.payload}
            }  
        case actionTypes.UPDATE_CONF_EXP:
            return{
                ...state,
                userConf : {...state.userConf,confExpired :action.payload}
            } 
        case actionTypes.UPDATE_ALL_USER_FILTER:
            return{
                ...state,
                userConf : {...state.userConf,allUserFilter :action.payload}
            }
        case actionTypes.UPDATE_SERVER:
            return{
                ...state,
                userConf : {...state.userConf,server :action.payload}
            } 
        case actionTypes.UPDATE_LDAP:
            return{
                ...state,
                userConf : {...state.userConf,ldap :action.payload}
            } 
        case actionTypes.UPDATE_CONF_SERVER_LIST:
            return{
                ...state,
                userConf : {...state.userConf,confServerList :action.payload}
            } 
        case actionTypes.UPDATE_LDAP_ALLUSER_LIST:
            return{
                ...state,
                userConf : {...state.userConf,ldapAllUserList :action.payload}
            } 
        case actionTypes.UPDATE_LDAP_USER:
            return{
                ...state,
                userConf : {...state.userConf,ldap:{...state.userConf.ldap,user:action.payload}}
            } 
        case actionTypes.UPDATE_LDAP_FETCH:
            return{
                ...state,
                userConf : {...state.userConf,ldap:{...state.userConf.ldap,fetch:action.payload}}
            }  
        case actionTypes.ADD_ADDROLE:
            state.userConf.addRole[action.payload]=true;
            return{
                ...state,
                userConf : {...state.userConf,addRole:state.userConf.addRole}
            }   
        case actionTypes.EDIT_ADDROLES:
            if(state.userConf.addRole[action.payload]===undefined)state.userConf.addRole[action.payload]=true;
            else state.userConf.addRole[action.payload]=!state.userConf.addRole[action.payload];
            return{
                ...state,
                userConf : {...state.userConf,addRole:state.userConf.addRole}
            }                                
        default: return state     
    }
}

export default reducer;
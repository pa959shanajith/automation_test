const ValidationExpression = (value,id) =>{
    
    var regex;

    switch(id) {
        case 'userName': regex = /[\\\~`|;:"',<>?/%*()+=]/g; break;
        case 'optimazationInput': regex = /[^0-9]/g; break;
        case 'password': regex = /\s/g; break;
        case 'email': regex = /[^a-zA-Z0-9@._-]/g; break;
        case 'dataTableName': regex = /[^a-zA-Z0-9\s_-]/g; break;
        case 'ldapServerName':       /* FALLTHROUGH */
        case 'samlServerName':       /* FALLTHROUGH */
        case 'oidcServerName':       /* FALLTHROUGH */
        case 'poolName':             /* FALLTHROUGH */
        case 'emailName':             /* FALLTHROUGH */
        case 'GitToken': regex = /[^a-zA-Z0-9]/g; break;
        case 'iceName':             /* FALLTHROUGH */
        case 'tokenName':           /* FALLTHROUGH */
        case 'emailServerName': regex = /[^a-zA-Z0-9 \n]/g; break;
        case 'projectName':         /* FALLTHROUGH */
        case 'releaseTxt':          /* FALLTHROUGH */
        case 'cycleTxt': regex = /[~`%*()+=|:;"'?><,\/\\]/g; break;
        case 'validName': regex = /[^a-zA-Z0-9]/g; break;
        default: return value;
    }
        
    var replacedValue = value.replace(regex, ""); 
    return replacedValue;
}

export default ValidationExpression;
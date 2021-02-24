const ValidationExpression = (value,id) =>{
    
    var regex;
    if (id == 'userName')
        regex = /[\\\~`|;:"',<>?/%*()+=]/g;
    else if (['ldapServerName', 'samlServerName', 'oidcServerName', 'poolName'].includes(id))
        regex = /[^a-zA-Z0-9]/g;
    else if (['iceName', 'tokenName', 'emailServerName'].includes(id))
        regex = /[^a-zA-Z0-9 \n]/g;
    else if (id == "password")
        regex = /\s/g;
    else if (id == "email")
        regex = /[^a-zA-Z0-9@._-]/g;
    else if (['projectName', 'releaseTxt', 'cycleTxt'].includes(id))
        regex = /[~`%*()+=|:;"'?/><,]/g;
    else
        return value;
    var replacedValue = value.replace(regex, "");
    return replacedValue;
}

export default ValidationExpression;
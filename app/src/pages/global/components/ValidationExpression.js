const ValidationExpression = (value,id) =>{
    
    var regex;
    if (id == 'userName')
        regex = /[\\\~`|;:"',<>?/]/g;
    else if (id == 'tokenName')
        regex = /[^a-zA-Z0-9 ]/g;
    else if (id == 'iceName')
        regex = /[^a-zA-Z0-9 ]/g;
    else if (['ldapServerName', 'samlServerName', 'oidcServerName'].includes(id))
        regex = /[^a-zA-Z0-9]/g;
    else if (id == "password")
        regex = /\s/g;
    else if (id == "email")
        regex = /[^a-zA-Z0-9@._-]/g;
    else
        regex = /[-\\0-9[\]\~`!@#$%^&*()-+={}|;:"',.<>?/\s_]/g;
        // regex = /^[a-zA-Z0-9\_]+$/;
    var replacedValue = value.replace(regex, "");
    return replacedValue;
}

export default ValidationExpression;
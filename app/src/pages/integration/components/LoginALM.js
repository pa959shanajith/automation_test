import React from 'react';

const LoginALM = props => {
    return (
        <div className="leftAlign">
            <p >
                <input  style={{ borderBottom:props.loginError ==="URL"? "2px solid red" : null}}
                        type="text" ref={props.urlRef} 
                        className="launchPopupInput  form-control" 
                        placeholder="Enter ALM URL "
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="UNAME"? "2px solid red" : null}}
                        type="text" ref={props.userNameRef} 
                        className="launchPopupInput form-control " 
                        
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="PASS"? "2px solid red" : null}}
                        type="password"ref={props.passwordRef} 
                        className="launchPopupInput form-control"
                        placeholder="Enter Password " 
                        value="nupoor"
                />
            </p>
        </div>
    )
}

export default LoginALM;

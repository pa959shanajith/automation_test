import React from 'react';

const LoginQTest = props => {
    return (
        <div className="leftAlign">
            <p>
                <input 
                    style={{ borderBottom:props.logerror ==="URL"? "1px solid red" : null}} 
                    type="text" ref={props.urlRef}
                    className="launchPopupInput  form-control" 
                    placeholder="Enter qTest URL "
                />
            </p>
            <p>
                <input 
                    style={{ borderBottom:props.logerror ==="UNAME"? "1px solid red" : null}}
                    type="text" ref={props.userNameRef}
                    className="launchPopupInput form-control " 
                    placeholder="Enter User Name "
                />
            </p>
            <p>
                <input 
                    style={{ borderBottom:props.logerror ==="PASS"? "1px solid red" : null}}
                    type="password"ref={props.passwordRef}
                    className="launchPopupInput form-control" 
                    placeholder="Enter Password "
                />
            </p>
            
        </div>
    )
}

export default LoginQTest;

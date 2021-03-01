import React from 'react';

const LoginZephyr = props => {
    return (
        <div className="leftAlign">
            <p >
                <input  style={{ borderBottom:props.loginError ==="ACCID"? "2px solid red" : null}}
                        type="text" ref={props.accountidRef} 
                        className="launchPopupInput  form-control" 
                        placeholder="Enter Zephyr Account ID " 
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="ZAKEY"? "2px solid red" : null}}
                        type="text" ref={props.accessKeyRef} 
                        className="launchPopupInput form-control " 
                        placeholder="Enter Zephyr Access Key" 
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="ZSKEY"? "2px solid red" : null}}
                        type="password"ref={props.secretKeyRef} 
                        className="launchPopupInput form-control" 
                        placeholder="Enter Zephyr Secret Key" 
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="JURL"? "2px solid red" : null}}
                        type="text"ref={props.jiraUrlRef} 
                        className="launchPopupInput form-control" 
                        placeholder="Enter Jira URL"
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="JUNAME"? "2px solid red" : null}}
                        type="text"ref={props.jiraUserNameRef} 
                        className="launchPopupInput form-control" 
                        placeholder="Enter Jira Username" 
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="JATOKN"? "2px solid red" : null}}
                        type="password"ref={props.jiraAcessToken} 
                        className="launchPopupInput form-control" 
                        placeholder="Enter Jira Access Token"
                />    
            </p>
            <p style={{color:"red",marginLeft:"10px"}}>
                {props.failMSg}
            </p>
            
        </div>
    )
}

export default LoginZephyr;

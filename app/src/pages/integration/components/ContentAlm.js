import React ,{useRef} from 'react';


const  ContentAlm=(props)=> {
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
                        placeholder="Enter User Name " 
                />
            </p>
            <p >
                <input  style={{ borderBottom:props.loginError ==="PASS"? "2px solid red" : null}}
                        type="password"ref={props.passwordRef} 
                        className="launchPopupInput form-control" 
                        placeholder="Enter Password " />
            </p>
            <p style={{color:"red",marginLeft:"10px"}}>
                {props.failMSg}
            </p>
            
        </div>
    )
}

export default ContentAlm;

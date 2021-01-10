import React ,{useRef} from 'react';


const  Content=(props)=> {
    return (
        <div className="leftAlign">
            <p style={{ border:props.logerror ==="URL"? "1px solid red" : null}}>
                <input  type="text" ref={props.urlRef} className="launchPopupInput  form-control" placeholder="Enter qTest URL " ></input>
            </p>
            <p style={{ border:props.logerror ==="UNAME"? "1px solid red" : null}}>
                <input type="text" ref={props.userNameRef} className="launchPopupInput form-control " placeholder="Enter User Name "></input>
            </p>
            <p style={{ border:props.logerror ==="PASS"? "1px solid red" : null}}>
                <input type="password"ref={props.passwordRef} className="launchPopupInput form-control" placeholder="Enter Password "></input>
            </p>
            <p style={{color:"red"}}>
                {props.failMSg}
            </p>
        </div>
    )
}

export default Content

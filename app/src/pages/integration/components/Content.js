import React ,{useRef} from 'react';


const  Content=(props)=> {
    return (
        <div className="leftAlign">
            <p>
                <input type="text" ref={props.urlRef} className="launchPopupInput  form-control" placeholder="Enter qTest URL " ></input>
            </p>
            <p>
                <input type="text" ref={props.userNameRef} className="launchPopupInput form-control " placeholder="Enter User Name "></input>
            </p>
            <p>
                <input type="password"ref={props.passwordRef} className="launchPopupInput form-control" placeholder="Enter Password "></input>
            </p>
            <p style={{color:"red"}}>
                {props.failMSg}
            </p>
            <span>
                <button onClick={()=>props.callLogin_ICE() }>Submit</button>
            </span>
        </div>
    )
}

export default Content

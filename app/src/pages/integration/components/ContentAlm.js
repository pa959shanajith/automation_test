import React ,{useRef} from 'react';


const  ContentAlm=(props)=> {
    return (
        <div className="leftAlign">
            <p>
                <input type="text" ref={props.urlRef} className="launchPopupInput  form-control" placeholder="Enter ALM URL " ></input>
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
                <button onClick={()=>props.callLogin_ALM() }>Submit</button>
            </span>
        </div>
    )
}

export default ContentAlm;

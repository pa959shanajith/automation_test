import React , {useState ,  useRef } from 'react';
import '../styles/ProfJ.scss';
import {ScrollBar} from '../../global';
import {getTopMatches_ProfJ } from '../api';

const  ProfJ = (props) => {
    const queryref = useRef();
    const [chatBox , setChatBox] = useState(false);
    const [userquery , setUserQuery] = useState(null);
    const [apiReturn , setApiReturn] = useState([]);
    //const userQuery = userquery;

    const callqueryRaised=(e)=>{
        if(e.key === 'Enter'){
            console.log(queryref.current.value)
            const userQuery = queryref.current.value;
            setUserQuery(queryref.current.value)
            callProfJ(userQuery)
        }
    }
    const callsendbutton=()=>{
        const userQuery= queryref.current.value;
        console.log("semd was cliked")
        callProfJ(userQuery)
    }
    const callProfJ =async(userQuery)=>{
        const chatReturn = await getTopMatches_ProfJ(userQuery);
        setApiReturn(chatReturn);
        
    }
    return (
        <div id="assistWrap" className="filter_pop" style={{bottom:"0px"}}>
            <h4 className="pop_header">
                <img className="assist-image" src="static/imgs/ic-message.png"/>
                <span className="pop_title">Prof J</span>
                <span onClick={()=>setChatBox(!chatBox)}><img className="down-arrow-img" src={chatBox ? "static/imgs/ic-down.png": "static/imgs/ic-up.png" }/></span>
                <img onClick={()=>props.setshowProfJ(false)} className="down-close-img" src="static/imgs/ic-close.png"/>
            </h4>
            {
                chatBox ?
                
                <div id="assistContent">
                    
                    <div className="chatArea">
                    <ScrollBar>
                        <div id="specialdiv" >
                        <span className="defautMssg">
                            Hello, I'm Prof J. I try to be helpful. (But I'm still just a bot. Sorry!) *Type keywords* and hit _enter_ to send your message.
                        </span>
                        <div>
                            <span className="userQuerymessage">
                                {userquery}
                            </span>
                        </div><br/>
                        <div>
                            <div >
                            {apiReturn.map((e,i)=>(
                                <div className="defautMssg" >{e[1]}</div>
                            ))}
                            </div>
                        </div>
                        </div>
                        </ScrollBar>
                    </div>
                    <input ref={queryref} onKeyPress={(e)=>callqueryRaised(e)} className="profJinpt" type="text" placeholder="Ask Prof.J"/>
                    <div className="projBtns_container">
                        <button className="projBtns" >Clear</button>
                        <button  onClick={()=>callsendbutton()}className="projBtns" >Send</button>
                    </div>
                    
                </div> 
                
                :null
            }
        </div>
        
    )
}

export default ProfJ;

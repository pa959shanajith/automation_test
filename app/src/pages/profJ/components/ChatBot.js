import React , {useState ,  useRef , Fragment, useEffect } from 'react';
import '../styles/ProfJ.scss';
import {ScrollBar , PopupMsg} from '../../global';
import {getTopMatches_ProfJ } from '../api';

const  ChatBot = (props) => {
    const queryref = useRef(); //ref for query input tag to acess the current value of usermessage onClick.
    const uMsgRef = useRef(); //to check the status of last printed user message for auto-scroll enable
    const bMsgRef = useRef(); //to check the status of last printed bot message for auto-scroll enable
    const lMsgRef = useRef();
    const [chatBox , setChatBox] = useState(false); //State for chat aree open close 
    const [chat , setChat] = useState([])//State stores all the list of chat objects.
    const [linkMsgArr , setLinkMsgArr]= useState([])//stores all the links clicked on the Bot Message
    const [popup ,setPopup]= useState({show:false});

    useEffect(()=>{
        lMsgRef.current && lMsgRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'})
    }, [linkMsgArr])

    const displayError = (error) =>{ //the default display error funtion used in each component
        setPopup({
          title:'ERROR',
          content:error,
          submitText:'Ok',
          show:true
        })
      }
    const callqueryRaised=(e)=>{ //Function to be hit on enter after entering the userQuery
        if(e.key === 'Enter'){
            callsendbutton()
        }
    }
    
    const callsendbutton=()=>{ //stores a object containing Query from user
        let chatArr = [...chat]
        if(queryref.current.value){
            const userQuery = queryref.current.value;
        chatArr.push({message: queryref.current.value , from: "user"})
        callProfJ(userQuery, chatArr)
        queryref.current.value = null;
        setLinkMsgArr([]);
        }
    }
    
    const callClearbtn=()=>{ //clears chat input field
        queryref.current.value = null;
    }

    const callProfJ =async(userQuery, chatArr)=>{ //API call and fetch Response from BOT
        const chatReturn = await getTopMatches_ProfJ(userQuery);
        if(chatReturn.error){displayError(chatReturn.error);return;}
        chatArr.push({message: chatReturn , from: "Bot"})
        setChat(chatArr) 
        uMsgRef.current && uMsgRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
        bMsgRef.current && bMsgRef.current.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    }

    const callLinkClick=(idx)=>{ //if any of the links are clicked on te BOT message
        const linkIdx = idx;
        const linkMsg_Arr = [...linkMsgArr]
        linkMsg_Arr.push(linkIdx)
        setLinkMsgArr(linkMsg_Arr)
    }
    return (
        <Fragment>
        {(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
        <div id="assistWrap" className="filter__pop" >
            <h4 className="pop_header">
                <img className="assist-image" alt="message" src="static/imgs/ic-message.png"/>
                <span className="pop_title">Prof J</span>
                <span onClick={()=>setChatBox(!chatBox)}><img className="down-arrow-img" alt="message_arrow" src={chatBox ? "static/imgs/ic-down.png": "static/imgs/ic-up.png" }/></span>
                <img onClick={()=>props.onCloseClick()} className="down-close-img" alt="message_close" src="static/imgs/ic-close.png"/>
            </h4>
            {chatBox ? 
            <div id="assistContent">
                
                <div id="chatBot_Scroll" className="chatArea">
                    <ScrollBar scrollId="chatBot_Scroll" thumbColor="#321e4f">
                        <div id="specialdiv" >
                            <span className="defautMssg">
                                Hello, I'm Prof J. I try to be helpful. (But I'm still just a bot. Sorry!) *Type keywords* and hit _enter_ to send your message.
                            </span>
                            {
                            chat.map((e,i)=>(
                                (e.from === "user")? 
                                    <span ref={uMsgRef} className="userQuerymessage" key={i} >
                                        {e.message}
                                    </span>
                                : 
                                    <div ref={bMsgRef} className="defautMssg">
                                        {e.message && e.message.map((mes , i ) => ((mes[0] ===-1)?  mes[1] :
                                        i === 0 ?
                                            <>Did you mean to ask about one of these? 
                                            Please click any of the links below or 
                                            type more keywords if you don't see the right option.<br/>
                                                
                                        <p style={{display:"inline",marginBottom:"5px"}}><u onClick={()=>callLinkClick(mes[2])} style={{cursor:"pointer"}}>[{i+1}]{mes[1]}</u><br/></p></> 
                                        : 
                                        <p style={{display:"inline",marginBottom:"5px"}}><u onClick={()=>callLinkClick(mes[2])} style={{cursor:"pointer"}}>[{i+1}]{mes[1]}</u><br/></p>
                                        ))}
                                    </div>
                                ))
                            }
                            {
                                linkMsgArr  && 
                                linkMsgArr.map((e,i)=>(
                                    <><span ref={lMsgRef} className="defautMssg">{e}
                                    </span>
                                    <br/></>
                                ))
                            }
                        </div>
                    </ScrollBar>
                </div>
                
                <input ref={queryref} onKeyPress={(e)=>callqueryRaised(e)} className="profJinpt" type="text" placeholder="Ask Prof.J"/>
                <div className="projBtns_container">
                    <button onClick ={()=>callClearbtn()}className="projBtns" >Clear</button>
                    <button  onClick={()=>callsendbutton()}className="projBtns" >Send</button>
                </div>
                    
            </div> 
            :null
            }
        </div>
        </Fragment> 
    )
}

export default ChatBot;


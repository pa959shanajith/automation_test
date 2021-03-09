import React, { useEffect, useState, Fragment} from 'react';
import socketIOClient from "socket.io-client";
import {useDispatch, useSelector} from 'react-redux';
import { useHistory } from 'react-router-dom';
import { ModalContainer, PopupMsg } from './pages/global';
import {v4 as uuid} from 'uuid';
import { UPDATE_REPORTDATA } from './pages/plugin/state/action';
import * as actionTypes from './pages/login/state/action';

/*Component SocketFactory
  use: creates/updates socket connection
  1 : notify -> used in mindmap screen assign notification updates header header notify
  2 : result_ExecutionDataInfo -> execution completion popups
*/

const SocketFactory = () => {
    const [showAfterExecution,setShowAfterExecution] = useState({show:false})
    const [reportData,setReportData] = useState(undefined)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})
    const userInfo = useSelector(state=>state.login.userinfo);
    const socket = useSelector(state=>state.login.socket);
    const EndPoint = "https://"+window.location.hostname+":8443";
    const dispatch = useDispatch()
    const history = useHistory();
    useEffect(()=>{
      if(socket){
        socket.on('notify',(value)=> {
          if (value.count === 0 && 'notifyMsg' in value) {
            dispatch({type: actionTypes.UPDATE_NOTIFY, payload: value});
          }
        });
        socket.on("result_ExecutionDataInfo",(result)=> {
            executionDATA(result)
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[socket])
    useEffect(()=>{
        var userName = Buffer.from((userInfo && userInfo.username)?userInfo.username:uuid()).toString('base64')
        var socket = socketIOClient(EndPoint, { forceNew: true, reconnect: true, query: {check: 'notify', key: userName}});
        dispatch({type:actionTypes.SET_SOCKET,payload:socket})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userInfo])

    const PostExecution = () =>{
     return(
        <div className="afterExecution-modal">
            <ModalContainer 
                title={"Execute Test Suite"}
                content={
                    <p style={{cursor:'default'}}>{showAfterExecution.content} <br />
                    <p> Go to <span onClick={()=>{redirectToReports();setShowAfterExecution({show:false})}} style={{color:'#643693',cursor:'pointer',fontWeight:'bold'}}>Reports</span></p></p>
                }
                close={()=>setShowAfterExecution({show:false})}
                footer={
                    <button onClick={()=>setShowAfterExecution({show:false})}>Ok</button>
                }
            />
        </div>
    )
};
    
    const redirectToReports = () =>{
        dispatch({type: UPDATE_REPORTDATA, payload: reportData});
        setPopupState({show:false})
        window.localStorage['navigateScreen'] = "reports";
        history.replace("/reports");
    }

    const executionDATA = (result) => {
        var data = result.status
        var testSuiteIds = result.testSuiteDetails;
        var msg = "";
        testSuiteIds[0]["projectidts"] = testSuiteIds[0]["projectid"];
        msg = testSuiteIds[0]["testsuitename"]
        setReportData(result)
        
        if (data === "Terminate") {
            setShowAfterExecution({show:true, title:msg,content: "Execution terminated - By Program." })
        } 
        else if (data === "UserTerminate") {
            setShowAfterExecution({show:true, title:msg,content:"Execution terminated - By User." })
        } 
        else if (data === "unavailableLocalServer") {
            setPopupState({'title': 'Execute Test Suite', 'content': "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server."});
        } 
        else if (data === "success") {
            setShowAfterExecution({show:true,title:msg,content:"Execution completed successfully." })
           
        } else if(data === "Completed"){
            setPopupState({'title': 'Scheduled Execution Complete', 'content':msg});
        }
        else setPopupState({'title': "Execute Test Suite", 'content':"Failed to execute."});
    }
    return(
        <Fragment>
            {popupState.show && <PopupMsg content={popupState.content} title={popupState.title} submit={()=>setPopupState({show:false})} close={()=>setPopupState({show:false})} submitText={"Ok"} />}
            { showAfterExecution.show && <PostExecution/> }
        </Fragment>
    )
}

export default SocketFactory;
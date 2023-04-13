import React, { useEffect, useState, Fragment} from 'react';
import socketIOClient from "socket.io-client";
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ModalContainer, VARIANT, RedirectPage, Messages as MSG, setMsg } from './pages/global';
import {v4 as uuid} from 'uuid';
import { UPDATE_REPORTDATA } from './pages/plugin/state/action';
import * as actionTypes from './pages/login/state/action';
import {url} from './App'

/*Component SocketFactory
  use: creates/updates socket connection
  1 : notify -> used in mindmap screen assign notification updates header header notify
  2 : result_ExecutionDataInfo -> execution completion popups
*/

const SocketFactory = () => {
    const [showAfterExecution,setShowAfterExecution] = useState({show:false})
    const [reportData,setReportData] = useState(undefined)
    const userInfo = useSelector(state=>state.login.userinfo);
    const socket = useSelector(state=>state.login.socket);
    const dispatch = useDispatch()
    const history = useNavigate();
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
        socket.on('display_execution_popup', (value) => {
            displayExecutionPopup(value);		
        });
        socket.on('killSession', (by, reason) => {
            return RedirectPage(history, { by: by, reason: reason })
        })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[socket])
    useEffect(()=>{
        var userName = Buffer.from((userInfo && userInfo.username)?userInfo.username:uuid()).toString('base64')
        var socket = socketIOClient(url, { forceNew: true, reconnect: true, query: {check: 'notify', key: userName}});
        dispatch({type:actionTypes.SET_SOCKET,payload:socket})
        return(() => {
            socket.close();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userInfo])

    const PostExecution = () =>{
        return(
            <div className="afterExecution-modal">
                <ModalContainer 
                    title={"Execution Status"}
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
        setMsg(false)
        window.localStorage['navigateScreen'] = "reports";
        window.localStorage['Reduxbackup'] = window.localStorage['persist:login'];
        window.localStorage['popupRedirect'] = "true";
        window.localStorage['reportData'] = JSON.stringify(reportData);
        window.location.href = "/reports";
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
            setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER);
        } 
        else if (data === "success") {
            setShowAfterExecution({show:true,title:msg,content:"Execution completed successfully." })
        } else if(data === "Completed"){
            setMsg(MSG.CUSTOM(msg,VARIANT.SUCCESS));
        } else if(data === 'accessibilityTestingSuccess') {
            setMsg(MSG.CUSTOM(msg + ": Accessibility Testing completed Successfully.",VARIANT.SUCCESS));
        } else if(data === 'accessibilityTestingTerminate'){
            setMsg(MSG.CUSTOM("Accessibility Testing Terminated.",VARIANT.ERROR));
        }
        else setMsg(MSG.CUSTOM("Failed to execute.",VARIANT.ERROR));
    }



    return(
        <Fragment>
            { showAfterExecution.show && <PostExecution/> }
        </Fragment>
    )
}

const displayExecutionPopup = (value) =>{
    var msg = "";
    var val,executionVariant=VARIANT.WARNING;
    for(val in value){
        var data = value[val].status;
        var testSuite = value[val].testSuiteIds;
        var exec = testSuite[0].testsuitename + ": "
        if (data == "begin") continue;
        if (data == "unavailableLocalServer"){ data = exec + "No Intelligent Core Engine (ICE) connection found with the Avo Assure logged in username. Please run the ICE batch file once again and connect to Server.";executionVariant = VARIANT.ERROR;}
        else if (data == "NotApproved"){ data = exec + "All the dependent tasks (design, scrape) needs to be approved before execution";executionVariant = VARIANT.ERROR;}
        else if (data == "NoTask"){ data = exec + "Task does not exist for child node";executionVariant = VARIANT.ERROR;}
        else if (data == "Modified"){ data = exec +"Task has been modified, Please approve the task";executionVariant = VARIANT.ERROR;}
        else if (data == "Completed"){ data = exec +"Execution Complete";executionVariant = VARIANT.SUCCESS;}
        else if (data == "Terminate"){ data = exec + "Terminated";executionVariant = VARIANT.ERROR;}
        else if (data == "UserTerminate"){ data = exec +"Terminated by User";executionVariant = VARIANT.ERROR;}
        else if (data == "success"){ data = exec +"success";executionVariant = VARIANT.SUCCESS;}
        else if (data == "API Execution Completed"){ data = exec + "API Execution Completed";executionVariant = VARIANT.SUCCESS;}
        else if (data == "API Execution Fail"){ data = exec + "API Execution Failed";executionVariant = VARIANT.ERROR;}
        else{ data = exec + "Failed to execute.";executionVariant = VARIANT.ERROR;}
        msg = msg + "\n" + data;
    }
    if(msg && msg.trim() != ""){
        setMsg(MSG.CUSTOM(msg,executionVariant));
    }
}

export default SocketFactory;
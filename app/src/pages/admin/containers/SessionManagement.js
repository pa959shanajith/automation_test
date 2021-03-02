import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {manageSessionData, fetchLockedUsers, unlockUser} from '../api';
import '../styles/SessionManagement.scss'

/*Component SessionManagement
  use: defines Admin middle Section for Session Management
  ToDo:
*/

const SessionManagement = (props) => {

    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""})
    const [sessions,setSessions] = useState([])
    const [clients,setClients] = useState([])
    const [showSessions,setShowSessions] = useState(true)
    const [showClients,setShowClients] = useState(true)
    const [showLockedUsers,setShowLockedUsers] = useState(true)
    const [lockedusers,setLockedusers] = useState([]);

    useEffect(()=>{
        refreshSessMgmt();
        // eslint-disable-next-line
    },[props.resetMiddleScreen["sessionTab"],props.MiddleScreen])

    const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    const refreshSessMgmt = async () =>{
        setLoading("Retrieving session data...");
		const data = await manageSessionData("get");
        if(data.error){displayError(data.error);return;}
        if( data === "fail") setPopupState({show:true,title:"Error",content:"Failed to manage session Data."});
        data.sessionData.sort(function(a,b) { return a.username > b.username; });
        data.clientData.sort(function(a,b) { return a.username > b.username; });
        setSessions(data.sessionData);
        setClients(data.clientData);
        fetchLocked();
        setLoading(false);
    }

    const fetchLocked = async () => {
		const data = await fetchLockedUsers()
		if(data.error){displayError(data.error);return;}
        setLockedusers(data);
	}

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const unlock = async (event) =>{
        var id = parseInt(event.target.dataset.id);
		var msg, obj;
		msg = "Unlocking User Account ";
		obj = lockedusers[id];
		var user = obj.username;
		setLoading(msg+user+"...");
		const data = await unlockUser(user);
		if(data.error){displayError(data.error);return;}
        setPopupState({show:true,title:"Session Management",content:msg+"successful!"});
        let lockedusersData = lockedusers;
        lockedusersData.splice(id,1);
        setLockedusers(lockedusersData);
        setLoading(false);
    }

    // Session Management: Logoff/Disconnect User
    const disconnectLogoff = async (event) =>{
        var action = event.target.innerHTML.trim().toLowerCase();
		var id = parseInt(event.target.dataset.id);
        var msg, rootObj, key, obj;
        var temp = 0;
		if (action === "logout") {
			msg = "Logging out ";
			rootObj = sessions;
			obj = rootObj[id];
            key = obj.id;
            temp = 1;
		} else {
			msg = "Disconnecting ";
			rootObj = clients;
			obj = rootObj[id];
            key = obj.mode;
            temp = 2;
		}
		var user = obj.username;
        setLoading(msg+user+"...");
        const data = await manageSessionData(action,user,key,"session");
        if(data.error){displayError(data.error);return;}
        if (data === "fail") {
            setPopupState({show:true,title:"Session Management",content:msg+"failed!"});
        } else {
            rootObj.splice(id,1);
            if(temp === 1) setSessions(rootObj);
            if(temp === 2) setClients(rootObj);
        }
        setLoading(false);
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div id="page-taskName"><span>Session Management</span></div>
            <div className="adminActionBtn-sess-mgmt">
                 <button className="btn-md pull-right adminBtn" onClick={()=>{refreshSessMgmt()}} >Refresh</button>
            </div> 
            <div className="content_wrapper-sess-mgmt">
                <div className="col-xs-9 form-group__conv-Sess-mgmt adminForm" style={{height:"88%"}}>
                    <div className="containerWrap sessionItemWrap">
                        <div onClick={()=>{setShowSessions(!showSessions)}} className="sessionHeading" data-toggle="collapse" data-target="#activeUsers-x">
                            <h4>Active Users</h4>
                        </div>
                        {showSessions?
                        <div id="activeUsers" className="wrap-sess-mgmt wrap-sess-mgmt-cust " >
                            <ScrollBar scrollId='clientUsers' thumbColor="#929397" >
                            <table className = "table table-hover sessionTable">
                            <tbody >
                                <tr>
                                    <th> Username </th>
                                    <th> Role </th>
                                    <th> Logged in </th>
                                    <th> IP </th>
                                    <th> </th>
                                </tr>
                                {sessions.map((user,index)=>(
                                    <tr >
                                        <td> {user.username} </td>
                                        <td> {user.role} </td>
                                        <td> {user.loggedin} </td>
                                        <td> {user.ip} </td>
                                        <td><button className="btn btn-table-cust" data-id={index} onClick={(event)=>{disconnectLogoff(event)}}> Logout </button></td>
                                    </tr> 
                                ))}
                                </tbody>
                            </table>
                            </ScrollBar>
                        </div>
                        :null}
                    </div> 
                    <div className="containerWrap sessionItemWrap clientUsers-height" style={!showSessions?{top:"110px"}:{top:"420px"}}>
                        <div onClick={()=>{setShowClients(!showClients)}} className="sessionHeading" >
                            <h4>ICE Engine Clients</h4>
                        </div>
                        {showClients?
                        <div id="clientUsers" className="wrap-sess-mgmt wrap-sess-mgmt-custom " >
                            <ScrollBar scrollId='clientUsers' thumbColor="#929397" >
                            <table className = "table table-hover sessionTable">
                            <tbody>
                                <tr>
                                    <th> Username </th>
                                    <th> Connection Mode </th>
                                    <th> IP </th>
                                    <th> </th>
                                </tr>
                                {clients.map((user,index)=>(
                                    <tr>
                                        <td> {user.username} </td>
                                        <td> {user.mode} </td>
                                        <td > {user.ip} </td>
                                        <td><button className="btn btn-table-cust" data-id={index} onClick={(event)=>{disconnectLogoff(event)}} > Disconnect </button></td>
                                    </tr> 
                                ))}
                            </tbody> 
                            </table>
                            </ScrollBar>
                        </div>
                        :null}
                    </div>
                    <div className="containerWrap sessionItemWrap clientUsers-height" style={!showSessions?{top:"110px"}:{top:"420px"}}>
                        <div onClick={()=>{setShowLockedUsers(!showLockedUsers)}} className="sessionHeading" >
                            <h4>Locked Users</h4>
                        </div>
                        {showLockedUsers?
                        <div id="clientUsers" className="wrap-sess-mgmt wrap-sess-mgmt-custom " >
                            <ScrollBar scrollId='clientUsers' thumbColor="#929397" >
                            <table className = "table table-hover sessionTable">
                            <tbody>
                                <tr>
                                    <th> Username </th>
                                    <th> </th>
                                </tr>
                                {lockedusers.map((user,index)=>(
                                    <tr>
                                        <td> {user.username} </td>
                                        <td><button className="btn btn-table-cust" data-id={index} onClick={(event)=>{unlock(event)}} > Unlock </button></td>
                                    </tr> 
                                ))}
                            </tbody> 
                            </table>
                            </ScrollBar>
                        </div>
                        :null}
                    </div>       
                </div>
            </div>
        </Fragment>
  );
}

export default SessionManagement;
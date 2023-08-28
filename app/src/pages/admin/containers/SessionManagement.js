import React, { useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar, Messages as MSG, VARIANT, setMsg} from '../../global';
import { useSelector } from 'react-redux';
import {manageSessionData, fetchLockedUsers, unlockUser} from '../api';
import '../styles/SessionManagement.scss'

/*Component SessionManagement
  use: defines Admin middle Section for Session Management
  ToDo:
*/

const SessionManagement = (props) => {
    const dateFormat = useSelector(state=>state.landing.dateformat);
    const [loading,setLoading] = useState(false)
    const [sessions,setSessions] = useState([])
    const [clients,setClients] = useState([])
    const [showSessions,setShowSessions] = useState(true)
    const [showClients,setShowClients] = useState(true)
    const [showLockedUsers,setShowLockedUsers] = useState(true)
    const [lockedusers,setLockedusers] = useState([]);

    useEffect(()=>{
        refreshSessMgmt();
        // eslint-disable-next-line
    },[])

    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }

    const refreshSessMgmt = async () =>{
        setLoading("Retrieving session data...");
		const data = await manageSessionData("get");
        if(data.error){displayError(data.error);return;}
        if( data === "fail") displayError(MSG.ADMIN.ERR_MANAGE_SESSION);
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

    const unlock = async (event) =>{
        var id = parseInt(event.target.dataset.id);
		var msg, obj;
		msg = "Unlocking User Account ";
		obj = lockedusers[id];
		var user = obj.username;
		setLoading(msg+user+"...");
		const data = await unlockUser(user);
		if(data.error){displayError(data.error);return;}
        setMsg(MSG.CUSTOM(msg+"successful!",VARIANT.SUCCESS));
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
            setMsg(MSG.CUSTOM(msg+"failed!",VARIANT.ERROR));
        } else {
            rootObj.splice(id,1);
            if(temp === 1) setSessions(rootObj);
            if(temp === 2) setClients(rootObj);
        }
        setLoading(false);
    }
    const formatDate = (date) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear(),
            hour = '' + d.getHours(),
            minute = '' + d.getMinutes();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        if (hour.length < 2)
            hour = '0' + hour
        if (minute.length < 2)
            minute = '0' + minute 

        let map = {"MM":month,"YYYY": year, "DD": day};
        let def = [day,month,year];
        let format = dateFormat.split("-");
        let arr = []
        let used = {}
        for (let index in format){
            if (!(format[index] in map) || format[index] in used){
                return def.join('-') + " " + [hour,minute].join(':');
            }
            arr.push(map[format[index]]) 
            used[format[index]] = 1
        }

        return arr.join('-') + " " + [hour,minute].join(':');
    }
    

    return (
        <div className='mainContainer'>
        <div className="sess-mgmt_container">
            {loading?<ScreenOverlay content={loading}/>:null}
            
            <div id="page-taskName"><span>Session Management</span></div>
            <div className="adminActionBtn">
                 <button className="a__btn pull-right " onClick={()=>{refreshSessMgmt()}} >Refresh</button>
            </div> 
            <div className="content_wrapper-sess-mgmt.">
                {/* <ScrollBar thumbColor="#929397"> */}
                <div className="col-xs-9 form-group__conv-Sess-mgmt" style={{height:"88%"}}>
                    <div className="containerWrap sessionItemWrap">
                        <div onClick={()=>{setShowSessions(!showSessions)}} className="sessionHeading" data-toggle="collapse" data-target="#activeUsers-x">
                            <h4>Active Users</h4>
                        </div>
                        {showSessions?
                        <div id="activeUsers" className="wrap-sess-mgmt wrap-sess-mgmt-cust " >
                            {/* <ScrollBar scrollId='clientUsers' thumbColor="#929397" > */}
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
                                        <td data-test="login_date_time"> {formatDate(user.loggedin)} </td>
                                        <td> {user.ip} </td>
                                        <td><button className="btn btn-table-cust" data-id={index} onClick={(event)=>{disconnectLogoff(event)}}> Logout </button></td>
                                    </tr> 
                                ))}
                                </tbody>
                            </table>
                            {/* </ScrollBar> */}
                        </div>
                        :null}
                    </div> 
                    <div className="containerWrap sessionItemWrap clientUsers-height" style={!showSessions?{top:"110px"}:{top:"420px"}}>
                        <div onClick={()=>{setShowClients(!showClients)}} className="sessionHeading" >
                            <h4>ICE Engine Clients</h4>
                        </div>
                        {showClients?
                        <div id="clientUsers" className="wrap-sess-mgmt wrap-sess-mgmt-custom " >
                            {/* <ScrollBar scrollId='clientUsers' thumbColor="#929397" > */}
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
                            {/* </ScrollBar> */}
                        </div>
                        :null}
                    </div>
                    <div className="containerWrap sessionItemWrap clientUsers-height" style={!showSessions?{top:"110px"}:{top:"420px"}}>
                        <div onClick={()=>{setShowLockedUsers(!showLockedUsers)}} className="sessionHeading" >
                            <h4>Locked Users</h4>
                        </div>
                        {showLockedUsers?
                        <div id="clientUsers" className="wrap-sess-mgmt wrap-sess-mgmt-custom " >
                            {/* <ScrollBar scrollId='clientUsers' thumbColor="#929397" > */}
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
                            {/* </ScrollBar> */}
                        </div>
                        :null}
                    </div>       
                </div>
                {/* </ScrollBar> */}
            </div>
        </div>
        </div>
  );
}

export default SessionManagement;
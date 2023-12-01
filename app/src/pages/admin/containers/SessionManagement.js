import React, { useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar, Messages as MSG, VARIANT, setMsg} from '../../global';
import { useSelector } from 'react-redux';
import {manageSessionData, fetchLockedUsers, unlockUser} from '../api';
import '../styles/SessionManagement.scss'
import { Card } from 'primereact/card';
import {Button} from 'primereact/button';
/*Component SessionManagement
  use: defines Admin middle Section for Session Management
  ToDo:
*/

const SessionManagement = (props) => {
    const currentTab = useSelector(state => state.admin.screen);
    const dateFormat = useSelector(state=>state.landing.dateformat);
    const [loading,setLoading] = useState(false)
    const [sessions,setSessions] = useState([])
    const [clients,setClients] = useState([])
    const [lockedusers,setLockedusers] = useState([]);
    const [actions,setActions] = useState('');
    const [indexForClient,setIndexForClient] = useState();
    const [indexForSession,setIndexForSession] = useState();

    useEffect(()=>{
        refreshSessMgmt();
        // eslint-disable-next-line
    },[currentTab])

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
//         var retrivedText = event.target.innerHTML.trim(); // Get the innerHTML
// var tempElement = document.createElement("div"); // Create a temporary element
// tempElement.innerHTML = retrivedText; // Set the innerHTML of the temporary element
// var action = tempElement.textContent || tempElement.innerText; // Extract the text content
// console.log(action); // This will give you "Logout"
const action = event.currentTarget.innerText
		// var id = parseInt(event.target.value);
        var msg, rootObj, key, obj;
        var temp = 0;
		if (action === "logout") {
            var id = parseInt(event.currentTarget.getAttribute("data-id"))
			msg = "Logging out";
			rootObj = sessions;
			obj = rootObj[id];
            // console.log("rootObj[id]",rootObj[id])
            key = obj.id;
            temp = 1;
		} else {
            var id = parseInt(event.currentTarget.getAttribute("data-id"))
			msg = "Disconnecting";
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
        <>
            <div className='mainSessionManagement'>
            {loading?<ScreenOverlay content={loading}/>:null}
                <div className='headerOfSession'>
                    <div className='headingBut'>
                  <h2>Session Management</h2>
                  <Button className='but' label='Refresh' onClick={()=>{refreshSessMgmt()}}/>
                  </div>
                </div>
                <div className='grid'>
                    <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12  ">
                        <div className='Card card1'>
                            
                            <Card title="Active Users">
                            {sessions.map((user,index,arr)=>(
                            <div className='innerCard'>
                                <Card className='userCard'>
                                <div className='userBut'>
                                    <div className='user'>
                                  <span className='userTitle fontTag fontT'>Username</span><span className='semicolanU'>:</span><h4 className='userName fontResults fontR'>{user.username}</h4>
                                  </div>
                                  <Button data-id={index} onClick={(event)=>{setActions('logout'); setIndexForSession(index);disconnectLogoff(event);}}  outlined  label='logout'/>
                                </div>
                                <div className='role'>
                                  <span className='fontTag fontT'>Role</span><span className='semicolanR'>:</span><h4 className='roleName fontResults fontR'>{user.role}</h4>
                                </div>
                                <div className='lastLogged'>
                                  <span className='fontTag fontT'>Last Logged In</span><span className='semicolanL'>:</span><h4 className='fontResults fontR'>{formatDate(user.loggedin)}</h4>
                                </div>
                              </Card>
                              
                            </div>
                             ))}
                            
                            </Card>

                        </div>
                    </div>
                    <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12  ">
                        <div className='Card card2'>
                       
                            <Card title="Active Avo Assure Client">
                            {clients.map((user,index)=>(
                            <div className='innerCard'>
                                <Card className='userCard'>
                                <div className='userBut'>
                                    <div className='user'>
                                  <span className='fontTag fontT'>Avo Client Name</span><span className='semicolanU'>:</span><h4 className='userName fontResults fontR'>{user.username}</h4>
                                  </div>
                                  <Button data-id={index}  onClick={(event)=>{setActions('disconnect');setIndexForClient(index);disconnectLogoff(event);}} outlined  label='disconnect'/>
                                </div>
                                <div className='ipContainer'>
                                  <span className='IP fontTag fontT'>IP</span><span className='semicolan'>:</span><h4 className='fontResults fontR'>{user.ip}</h4>
                                </div>
                              </Card>
                            </div>
                            ))}
                            </Card>
                             
                             
                        </div>
                    </div>
                    <div className="col-12 lg:col-4 xl:col-4 md:col-6 sm:col-12  ">
                        <div className='Card card3'>
                            <Card title="Locked Users">
                            {lockedusers.map((user,index)=>(
                            <div className='innerCard'>
                                <Card className='userCard'>
                                <div className='userBut'>
                                    <div className='user'>
                                  <span className='fontTag fontT'>User Name</span><span className='semicolanU'>:</span><h4 className='userName fontResults fontR'>{user.username}</h4>
                                  </div>
                                  <Button data-id={index} onClick={(event)=>{unlock(event)}}  outlined  label='Unlock'/>
                                </div>
                                <div className='ipContainer'>
                                  <span className='IP fontTag fontT'>Role</span><span className='semicolan'>:</span><h4 className='fontResults fontR'>{user.rolename}</h4>
                                </div>
                              </Card>
                            </div>
                             ))}
                            </Card>
                        </div>
                    </div>


                </div>
            </div>

        </>
  );
}

export default SessionManagement;

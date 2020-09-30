import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, RedirectPage, ScrollBar} from '../../global' 
import {fetchICE, provisions, manageSessionData} from '../api';
import { useHistory } from 'react-router-dom';
import '../styles/IceProvisionList.scss'


/*Component IceProvisionList
  use: Display ICE Provision Table
  ToDo:
*/

const IceProvisionList = (props) => {

    const history = useHistory();
    const [loading,setLoading] = useState(false)
	const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [searchTasks,setSearchTasks] = useState("")
	const [icelistModify,setIcelistModify] = useState(props.icelist)
	const [showList,setShowList] = useState(true)
    
    useEffect(()=>{
		refreshIceList();
		setipRefresh(!ipRefresh);
		// eslint-disable-next-line
    },[props.selectProvisionType,props.refreshIceList])

    const refreshIceList = async () => {
        setLoading("Loading...");
		setSearchTasks("");
		try{
            const data = await fetchICE();
			setLoading(false);
			if (data === "Invalid Session") RedirectPage(history);
            else if (data === 'fail') setPopupState({show:true,title:"ICE Provisions",content:"Failed to load ICE Provisions"});
			else {
				data.sort((a,b)=>a.icename.localeCompare(b.icename));
				var data1 = data.filter(e => e.provisionedto !== "--Deleted--");
				props.setIcelist(data1);
				setIcelistModify(data1);
				
			}
		}catch(error) {
			setLoading(false);
			console.log("Error:::::::::::::", error);
		}
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
	}
	
	const searchIceList = (val) =>{
		const items = props.icelist.filter((e)=>e.icename.toUpperCase().indexOf(val.toUpperCase())!==-1)
        setIcelistModify(items);
	}

    const reregister = async (entry,eventName) =>{
        const provisionDetails = entry
		const icename = provisionDetails.icename;
		const event=eventName.trim();
		const tokeninfo = {
			icename: icename,
			userid: provisionDetails.provisionedto,
			icetype: provisionDetails.icetype,
			action: "reregister"
		};
		setLoading(event+"ing...");
		try{
            const data = await provisions(tokeninfo);
			setLoading(false);
			if (data === "Invalid Session") return RedirectPage(history);
            else if (data === 'fail') setPopupState({show:true,title:"ICE Provisions",content:"ICE "+event+" Failed"});
			else {
				try{const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
					if (data1 === "Invalid Session") return RedirectPage(history);
				}catch (error) { }
                props.setTokeninfoIcename(icename);
                props.setIcename(icename);
				props.setTokeninfoToken(data);
				props.setToken(data);
				props.setOp(provisionDetails.icetype);
				props.setUserid(provisionDetails.provisionedto || ' ');
				setPopupState({show:true,title:"ICE Provision Success",content:"ICE "+event+"ed Successfully: '"+icename+"'!!  Copy or Download the token"});
                refreshIceList();
			}
		}catch(error) {
			setLoading(false);
			console.log("Error:::::::::::::", error);
		}
    }
	
	const deregister = async (entry) =>{
        const provisionDetails = entry;
		const icename = provisionDetails.icename;
		const tokeninfo = {
			icename: icename,
			userid: provisionDetails.provisionedto,
			icetype: provisionDetails.icetype,
			action: "deregister"
		};
        setLoading("Deregistering...");
		try{
            const data = await provisions(tokeninfo);
			setLoading(false);
			if (data === "Invalid Session") return RedirectPage(history);
            else if (data === 'fail') setPopupState({show:true,title:"ICE Provisions",content:"ICE Deregister Failed"});
			else {
				try{const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
					if (data1 === "Invalid Session") return RedirectPage(history);
				}catch(error) { }
                setPopupState({show:true,title:"ICE Provisions",content:"ICE Deregistered Successfully"});
				props.setSelectProvisionType(!props.selectProvisionType);
			}
		}catch(error) {
			setLoading(false);
			console.log("Error:::::::::::::", error);
		}
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
            {loading?<ScreenOverlay content={loading}/>:null}

            <div className="col-xs-9 form-group-ip adminForm-ip" style={{paddingTop:"0",width:"83%"}}>
                <div className="containerWrap">
                    <div className="sessionHeading-ip" data-toggle="collapse" data-target="#activeUsersToken-x">
						<h4 onClick={()=>{setShowList(!showList);}}>ICE Provisions</h4>
						<div className="search-ip">
							<span className="searchIcon-provision search-icon-ip">
								<img src={"static/imgs/ic-search-icon.png"} className="search-img-ip" alt="search icon"/>
							</span>
							<input value={searchTasks} onChange={(event)=>{ setSearchTasks(event.target.value);searchIceList(event.target.value)}} autoComplete="off" type="text" id="searchTasks" className="searchInput-list-ip searchInput-cust-ip" />
						</div>
					</div>
					{showList ?
                    <div id="activeUsersToken" className="wrap wrap-cust-ip">
					<ScrollBar scrollId='activeUsersToken-ip' thumbColor="#929397" >
                    	<table className = "table table-hover sessionTable" id="tokensDetail">
                            <tbody >
                            <tr>
								<th> ICE Name </th>
								<th> ICE Type</th>
								<th> Status </th>
								<th> Username </th>
								<th> Hostname </th>
								<th>  </th>
								<th>  </th>
							</tr>
                            {icelistModify.map((entry,index)=>(
                                <tr key={index} className='provisionTokens'>
                                    <td> {entry.icename} </td>
                                    <td> {entry.icetype} </td>
                                    <td> {entry.status} </td>
                                    <td> {entry.username} </td>
                                    <td> {entry.hostname} </td>
                                    {entry.status === 'provisioned'? <td><button className="btn btn-cust-ip" onClick={()=>{reregister(entry,"Reprovision")}} > Reprovision </button></td>
                                    :null}
                                    {entry.status === 'registered' || entry.status === 'deregistered '?<td ><button className="btn btn-cust-ip" onClick={()=>{reregister(entry,"Reregister")}}> Reregister </button></td>
                                    :null}
                                    {entry.status === 'deregistered'?<td></td>:null}
                                    {entry.status !== 'deregistered'?<td ><button className="btn btn-cust-ip" onClick={()=>{deregister(entry)}}> Deregister </button></td>
                                    :null}
                                </tr> 
                            ))}
                            </tbody>
						</table>
						</ScrollBar>
					</div>
					:null}
                </div>

            </div>
        </Fragment>
  );
}

export default IceProvisionList;
import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, ScrollBar} from '../../global' 
import {fetchICE, provisions, manageSessionData} from '../api';
import '../styles/IceProvisionList.scss'


/*Component IceProvisionList
  use: Display ICE Provision Table
  ToDo:
*/

const IceProvisionList = (props) => {

    const [loading,setLoading] = useState(false)
	const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [searchTasks,setSearchTasks] = useState("")
	const [icelistModify,setIcelistModify] = useState(props.icelist)
	const [showList,setShowList] = useState(false)
    
    useEffect(()=>{
		refreshIceList();
		// eslint-disable-next-line
    },[props.selectProvisionType,props.refreshIceList])

    const refreshIceList = async () => {
        setLoading("Loading...");
		setSearchTasks("");
		const data = await fetchICE();
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		data.sort((a,b)=>a.icename.localeCompare(b.icename));
		var data1 = data.filter(e => e.provisionedto !== "--Deleted--");
		props.setIcelist(data1);
		setIcelistModify(data1);
		setShowList(true);
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
	}

	const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
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
		const data = await provisions(tokeninfo);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data === 'fail') setPopupState({show:true,title:"ICE Provisions",content:"ICE "+event+" Failed"});
		else {
			const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
			if(data1.error){displayError(data1.error);return;}
			props.setTokeninfoIcename(icename);
			props.setIcename(icename);
			props.setTokeninfoToken(data);
			props.setToken(data);
			props.setOp(provisionDetails.icetype);
			props.setUserid(provisionDetails.provisionedto || ' ');
			setPopupState({show:true,title:"ICE Provision Success",content:"ICE "+event+"ed Successfully: '"+icename+"'!!  Copy or Download the token"});
			refreshIceList();
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
		const data = await provisions(tokeninfo);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data === 'fail') setPopupState({show:true,title:"ICE Provisions",content:"ICE Deregister Failed"});
		else {
			const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
			if(data1.error){displayError(data1.error);return;}
			setPopupState({show:true,title:"ICE Provisions",content:"ICE Deregistered Successfully"});
			props.setSelectProvisionType(!props.selectProvisionType);
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
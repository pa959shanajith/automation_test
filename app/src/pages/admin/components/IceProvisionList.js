import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, ScrollBar, VARIANT, Messages, setMsg} from '../../global' 
import {fetchICE, provisions, manageSessionData} from '../api';
import { getUserICE, setDefaultUserICE } from '../../global/api';
import '../styles/IceProvisionList.scss'


/*Component IceProvisionList
  use: Display ICE Provision Table
  ToDo:
*/

const IceProvisionList = (props) => {

	const [loading, setLoading] = useState(false)
	const [searchTasks, setSearchTasks] = useState("")
	const [icelistModify, setIcelistModify] = useState(props.icelist)
	const [showList, setShowList] = useState(false)
	const [allActiveIce, setAllActiveIce] = useState([])
	const [doFetchICE, setDoFetchICE] = useState(false);
	const isUsrSetting = props.userConfig //for user settings
	const defaultICE = props.defaultICE
	const setDefaultICE = props.setDefaultICE
    
	useEffect(() => {
		setDoFetchICE(true);
		refreshIceList();
		// eslint-disable-next-line
	}, [props.selectProvisionType,props.refreshIceList])

	//Used to fetchActiveIce
	const fetchActiveIce = async () => {
		setLoading("Fetching ICE ...");
		try {
			const data = await getUserICE();
			setLoading(false);
			if (data === 'fail') {
				setMsg(Messages.GENERIC.UNAVAILABLE_LOCAL_SERVER);
			}
			else if (!data.ice_list || data.ice_list.length < 1) {
				setAllActiveIce([]);
				setDefaultICE("");
				return;
			}
			else {
				setAllActiveIce(data.ice_list);
				setDefaultICE(data.ice_list[0]);
			}
		} catch (error) {
			setLoading(false)
			console.error(error)
			setMsg(Messages.GENERIC.UNAVAILABLE_LOCAL_SERVER);
		}
	};


    const refreshIceList = async () => {
        setLoading("Loading...");
		setSearchTasks("");
		const data = await fetchICE(props.userID);
		if (data.error) { displayError(data.error); return; }
		setLoading(false);
		data.sort((a, b) => a.icename.localeCompare(b.icename));
		var data1 = data.filter(e => e.provisionedto !== "--Deleted--");
		if (isUsrSetting && doFetchICE) {
			//fetching active ICE
			await fetchActiveIce();
			setDoFetchICE(false);
		}
		props.setIcelist(data1);
		setIcelistModify(data1);
		setShowList(true);
    }

	const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
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
		try {
			setLoading(event + "ing...");
		const data = await provisions(tokeninfo);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data === 'fail') setMsg(Messages.CUSTOM("ICE "+event+" Failed",VARIANT.ERROR));
		else {
			const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
			if(data1.error){displayError(data1.error);return;}
			props.setTokeninfoIcename(icename);
			props.setIcename(icename);
			props.setTokeninfoToken(data);
			props.setToken(data);
			props.setOp(provisionDetails.icetype);
			props.setUserid(provisionDetails.provisionedto || ' ');
			setMsg(Messages.CUSTOM("ICE "+event+"ed Successfully: '"+icename+"'!!  Copy or Download the token",VARIANT.SUCCESS));
			refreshIceList();
		}
    }
		catch(e){
			setLoading(false);
			setMsg(Messages.CUSTOM(`ICE ${event} Failed`, VARIANT.ERROR));
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
		try {
        setLoading("Deregistering...");
		const data = await provisions(tokeninfo);
		setLoading(false);
			if (data.error) { displayError(data.error); return; }
		if (data === 'fail') displayError(Messages.ADMIN.ERR_ICE_DEREGISTER);
		else {
			const data1 = await manageSessionData('disconnect', icename, "?", "dereg");
			if(data1.error){displayError(data1.error);return;}
			displayError(Messages.ADMIN.SUCC_ICE_DEREGISTER);
			props.setSelectProvisionType(!props.selectProvisionType);
				refreshIceList();
		}
		} catch (e) {
			setLoading(false)
			setMsg(Messages.ADMIN.ERR_ICE_DEREGISTER);
    }
	}

	const defaultChangeHandler = async (event) => {
		const found = allActiveIce.find((element) => event.target.value === element);
		if (!found) {//prevent defaut event
			event.preventDefault();
			setMsg(Messages.ADMIN.ERR_SELECTED_ICE_NOT_ACTIVE);
			return;
		}
		else {
			var ice = event.target.value;
			try {
				setLoading("Setting Default ICE ...")
				const data = await setDefaultUserICE(ice);
				setLoading(false);
				if (data == 'success') {
					setDefaultICE(ice);
					setMsg(Messages.GLOBAL.SUCC_CHANGE_DEFAULT_ICE);
				} else {
					event.preventDefault();
					setMsg(Messages.GLOBAL.ERR_CHANGE_DEFAULT_ICE);
				}
			} catch (error) {
				event.preventDefault();
				setLoading(false)
				console.error(error)
				setMsg(Messages.GLOBAL.ERR_CHANGE_DEFAULT_ICE);
		}
    }
    }

    return (
        <Fragment>
			{loading ? <ScreenOverlay content={loading} /> : null}
			
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
								{isUsrSetting === true && <th data-test="table-heading-test">Default ICE</th>}
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
									{isUsrSetting === true && <td data-test="radio-token-test"><input name="default" type="radio" value={entry.icename} checked={entry.icename === defaultICE ? true : false} onChange={defaultChangeHandler} /></td>}
                                    <td> {entry.icename} </td>
                                    <td> {entry.icetype} </td>
                                    <td> {entry.status} </td>
                                    <td> {entry.username} </td>
                                    <td> {entry.hostname} </td>
												{entry.status === 'provisioned' ? <td><button className="btn btn-cust-ip" onClick={() => { reregister(entry, "Reprovision") }} > Reprovision </button></td>
													: null}
												{entry.status === 'registered' || entry.status === 'deregistered' ? <td ><button className="btn btn-cust-ip" onClick={() => { reregister(entry, "Reregister") }}> Reregister </button></td>
													: null}
												{entry.status === 'deregistered' ? <td></td> : null}
												{entry.status !== 'deregistered' ? <td ><button className="btn btn-cust-ip" onClick={() => { deregister(entry) }}> Deregister </button></td>
													: null}
                                </tr> 
                            ))}
                            </tbody>
						</table>
						</ScrollBar>
					</div>
						: null}
                </div>

            </div>
        </Fragment>
  );
}

export default IceProvisionList;
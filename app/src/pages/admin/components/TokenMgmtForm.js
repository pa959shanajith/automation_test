import React, { Fragment, useState, useEffect, useRef } from 'react';
import {ScreenOverlay, PopupMsg } from '../../global' 
import {getUserDetails, getCIUsersDetails, fetchICE} from '../api';
import ValidationExpression from '../../global/components/ValidationExpression';
import ReactTooltip from 'react-tooltip';
import Datetime from "react-datetime";
import moment from "moment";
import '../styles/TokenMgmtForm.scss'


/*Component TokenMgmtForm
  use: Token Mgmt Form Fields and Generates Token
  ToDo:
*/

const TokenMgmtForm = (props) => {
	const dateRef = useRef()
	const timeRef = useRef()
	const dateVal = props.dateVal;
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
    const [allUsers,setAllUsers] = useState([['Select User',' ','','']])
	const [firstStop,setFirstStop] = useState(false)
	const [inputProps1Disable,setInputProps1Disable] = useState(true)
    const [copyToolTip,setCopyToolTip] = useState("Click To Copy")
	const [downloadToolTip,setDownloadToolTip] = useState("Download Token")
	
	let inputProps = {
		placeholder: "Select Date",
		readOnly:"readonly" ,
		className:"fc-datePicker"
    };

    let inputProps1 = {
		placeholder: "Select Time",
		readOnly:"readonly" ,
		disabled : inputProps1Disable,
        className:"fc-timePicker"
	};

	const displayError = (error) =>{
        setLoading(false)
        setPopupState({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    useEffect(()=>{
		repopulateEntries('normal');
		// eslint-disable-next-line
    },[props.refresh])

    useEffect(()=>{
        if(firstStop) setFirstStop(!firstStop);
		else loadData(props.targetid);
		// eslint-disable-next-line
    },[props.runLoadData])

    function valid(current) {
		const yesterday = moment().subtract(1, "day");
        return current.isAfter(yesterday);
    }

    const repopulateEntries = async (tokenOp) =>{
		setInputProps1Disable(true);
        props.setName("");
		props.setToken("");
        setAllUsers([['Select User',' ','','']]);
        props.setAllICE( [{'_id':' ', 'icename':'Select ICE', 'icetype':'ci-cd'}]);
		props.setAllTokens([]);
		props.setShowList(true);
		props.setTargetid(" "); 
		props.setdateVal("");
		props.setTimeVal("");
        setLoading("Loading...");
		if (tokenOp === 'normal') {
			const data = await getUserDetails("user");
			if(data.error){displayError(data.error);return;}
			setLoading(false);
			data.sort((a,b)=>a[0].localeCompare(b[0]));
			data.splice(0, 0, ['Select User',' ','','']);
			setAllUsers(data.filter((e)=> (e[3] !== "Admin")));
		} else {
			const data = await fetchICE();
			if(data.error){displayError(data.error);return;}
			setLoading(false);
			data.sort((a,b)=>a.icename.localeCompare(b.icename));
			data.splice(0, 0, {'_id':' ', 'icename':'Select ICE', 'icetype':'ci-cd'});
			const data1 = data.filter(e => (e.provisionedto !== "--Deleted--" && e.icetype==='ci-cd'));
			props.setAllICE(data1);
		}
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
    }

    const loadData = async (targetid,clearFields) => {
        const generatetoken = { 'userId': targetid };
		if (generatetoken.userId === ' ') return false;
        setLoading("Fetching Token data. Please wait...")
		const data = await getCIUsersDetails(generatetoken);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data.length === 0) {
			setPopupState({show:true,title:"Token Management",content:"No tokens have been issued"});
			props.setAllTokens(data);
		}else {
			data.sort((a,b)=>a.deactivated.localeCompare(b.deactivated));
			data.forEach(e=>e.expiry=new Date(e.expiry).toString().slice(0,-22))
			props.setAllTokens(data);
			if (clearFields) {
				props.setName("");
				props.setToken("");
				props.setdateVal("");
				props.setTimeVal("");
			}
		}
		props.setShowList(true);
    }

    const verifyName =(name) =>{
		const tknlist = props.allTokens.map(e => e.name);
		if (tknlist.indexOf(name) > -1)props.setNameErrBorder(true);
		else props.setNameErrBorder(false);
	}
	
	const updateTokenName = (value) => {
		value = ValidationExpression(value,"tokenName")
		props.setName(value);
		verifyName(value)
	}

    const copyTokenFunc = () =>{
		const data = props.token;
		if (!data) {
			setCopyToolTip("Nothing to Copy!");
			setTimeout(()=>{
				setCopyToolTip("Click to Copy");
			}, 1500);
			return;
		}
		const x = document.getElementById('ciToken');
		x.select();
		document.execCommand('copy');
		setCopyToolTip("Copied!");
		setTimeout(()=>{
			setCopyToolTip("Click to Copy");
		}, 1500);
	}

	const downloadToken = () =>{
		const data = props.token;
		if (!data) {
			setDownloadToolTip("Nothing to Download!");
			setTimeout(()=>{
				setDownloadToolTip("Download Token");
			}, 1500);
			return;
		}
		const filename = "token.txt";
		var blob = new Blob([data], { type: 'text/json' });
		var e = document.createEvent('MouseEvents');
		var a = document.createElement('a');
		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
		e.initMouseEvent('click', true, true, window,
		0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	
		setDownloadToolTip("Downloaded!");
		setTimeout(()=>{
			setDownloadToolTip("Download Token");
		}, 1500);
	}

	const openTime = ()=> {
        if(inputProps1Disable)return;
        timeRef.current._onInputClick()
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
			{loading?<ScreenOverlay content={loading}/>:null}
			
            <div className="col-xs-9" style={{width:"83%"}}>
                <div className='adminControl-tkn-mgmt ice-type-tkn-mgmt'><div>
                    <span className="leftControl-tkn-mgmt" title="ICE Type">ICE Type</span>
					<label className="adminFormRadio">
						<input type="radio" checked={props.op==="normal"} value="normal" name="provisionType" onChange={()=>{props.setOp("normal");repopulateEntries('normal')}} />
						<span>Normal</span>
					</label>
					<label className="adminFormRadio">
						<input type="radio" checked={props.op==="ci-cd"} value="ci-cd" name="provisionType" onChange={()=>{props.setOp("ci-cd");repopulateEntries("ci-cd")}} />
						<span>CI/CD</span>
					</label>
				</div></div>
                <div className='userForm-tkn-mgmt adminControl-tkn-mgmt'>
					{props.op==="normal"?
                        <div >
                            <span className="leftControl-tkn-mgmt" title="User">Username</span>
                            <select  value={props.targetid} id="selAssignUser1" onChange={(event)=>{loadData(event.target.value,true);props.setTargetid(event.target.value);props.setSelAssignUser2ErrBorder(false)}} className={props.selAssignUser2ErrBorder?'selectErrorBorder adminSelect-tkn-mgmt form-control-tkn-mgmt':'adminSelect-tkn-mgmt form-control-tkn-mgmt'}>
                                {allUsers.map((entry,index) => (
									<option key={index} value={entry[1]} disabled={entry[0]==='Select User'?true:false}>{entry[0]}</option>
                                ))}
                            </select>
                        </div>
                    :null}  
                    {props.op==="ci-cd"?  
                        <div >
                            <span className="leftControl-tkn-mgmt" title="ICE">ICE Name</span>
                            <select  value={props.targetid} id="selAssignUser1"  onChange={(event)=>{loadData(event.target.value,true);props.setTargetid(event.target.value);props.setSelAssignUser2ErrBorder(false)}} className={props.selAssignUser2ErrBorder?'selectErrorBorder adminSelect-tkn-mgmt form-control-tkn-mgmt':'adminSelect-tkn-mgmt form-control-tkn-mgmt'}>
                                {props.allICE.map((entry,index) => (
                                    <option key={index} value={entry._id}>{entry.icename}</option>
                                ))}
                            </select>
                        </div>
                    :null}
				</div>
                <div className='adminControl-tkn-mgmt'><div>
					<span className="leftControl-tkn-mgmt" title="Token Name">Token Name</span>
					<input type="text" autoComplete="off" id="tokenName" name="tokenName" onChange={(event)=>{updateTokenName(event.target.value)}} value={props.name} maxLength="100" className={props.nameErrBorder?"inputErrorBorder border_input-tkn-mgmt form-control-tkn-mgmt form-control-custom-tkn-mgmt":"border_input-tkn-mgmt form-control-tkn-mgmt form-control-custom-tkn-mgmt"} placeholder="Token Name"/>
				</div></div>
                <div className='adminControl-tkn-mgmt1'><div>
					<span className="adminControl-tkn-mgmt1__title leftControl-tkn-mgmt" title="Token Expiry">Token Expiry</span>
                    <div className="tokenSuite">
						<span className="datePicContainer datePic-cust" >
							<Datetime 
								ref={dateRef} 
								isValidDate={valid} 
								value={dateVal} 
								onChange={(event)=>{props.setdateVal(event.format("DD-MM-YYYY"));setInputProps1Disable(false);props.setTimeVal(new Date().getHours() + ':' + (parseInt(new Date().getMinutes()+5)))}} 
								dateFormat="DD-MM-YYYY" 
								closeOnSelect={true} 
								inputProps={inputProps} 
								timeFormat={false} 
								id="data-token"
								renderInput={(props) => {
									return <input {...props} value={ dateVal ? props.value : ''} />
								}}
							/> 
                            <img onClick={()=>{dateRef.current._onInputClick()}} className="datepickerIconToken" src={"static/imgs/ic-datepicker.png"} alt="datepicker" />
						</span>
						<span className="timePicContainer">
							<Datetime 
								ref={timeRef} 
								value={props.timeVal} 
								onChange={(event)=>{props.setTimeVal(event.format("HH:mm"))}} 
								inputProps={inputProps1} 
								dateFormat={false} 
								timeFormat="HH:mm" 
							/> 
                            <img onClick={openTime} className="timepickerIconToken" src={"static/imgs/ic-timepicker.png"} alt="timepicker" />
						</span>
					</div>
                </div></div>

                <div className='adminControl-tkn-mgmt' id="tokenarea"><div>
					<span className=" leftControl-tkn-mgmt" title="Generated Token">Token</span>
					<textarea type="text" className="token-tkn-mgmt token-tkn-mgmt-cust" autoComplete="off" id="ciToken" name="ciToken" value={props.token} placeholder="Click on Generate to generate token" readOnly="readonly" />
                    <label  className='tip-tkn-mgmt'>
						<ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip },0]} />
						<ReactTooltip id="download" effect="solid" backgroundColor="black" getContent={[() => { return downloadToolTip },0]} />
						<span className="fa fa-files-o action-form-mgmt" data-for="copy" data-tip={copyToolTip} onClick={()=>{copyTokenFunc()}} ></span>
						<span className="fa fa-download action-form-mgmt" data-for="download" data-tip={downloadToolTip} onClick={()=>{downloadToken()}}></span>
					</label>
                </div></div>
            </div>
        </Fragment>
    );
}

export default TokenMgmtForm;
import React, { Fragment, useState, useEffect } from 'react';
import {ScreenOverlay, PopupMsg, RedirectPage} from '../../global' 
import {getUserDetails, provisions} from '../api';
import ReactTooltip from 'react-tooltip';
import { useHistory } from 'react-router-dom';
import '../styles/IceProvisionForm.scss'


/*Component IceProvisionForm
  use: 
  ToDo:
*/

const IceProvisionForm = (props) => {

    const history = useHistory();
    const [loading,setLoading] = useState(false)
    const [popupState,setPopupState] = useState({show:false,title:"",content:""}) 
	const [firstStop,setFirstStop] = useState(false)
	const [copyToolTip,setCopyToolTip] = useState("Click To Copy")
	const [downloadToolTip,setDownloadToolTip] = useState("Download Token")
    const [icenameErrBorder,setIcenameErrBorder] = useState(false)
    const [selAssignUser2ErrBorder,setSelAssignUser2ErrBorder] = useState(false)
	const [users,setUsers] = useState([['Select User',' ','','']])
    const [popup,setPopup] = useState({show:false})

    useEffect(()=>{
		setUsers([['Select User',' ','','']]);
		props.setTokeninfoIcename("");
		props.setTokeninfoToken("");
		refreshForm();
		// eslint-disable-next-line
    },[props.selectProvisionType])

    useEffect(()=>{
        if( firstStop === false) setFirstStop(true);
		else provisionsIce();
		// eslint-disable-next-line
    },[props.runProvisionsIce])

    const provisionsIce = async () => {
        setIcenameErrBorder(false);
		setSelAssignUser2ErrBorder(false);
		const icetype = props.op;
		props.setToken("");
		if (props.icename === "") {
			setIcenameErrBorder(true);
			return false;
		}
		if (icetype === "normal"  && (!props.userid || props.userid.trim() === "")) {
			setSelAssignUser2ErrBorder(true);
			return false;
		}

		var tokeninfo = {
			userid: props.userid,
			icename: props.icename,
			icetype: icetype,
			action: "provision"
		};
        setLoading("Provisioning Token...");
		const data = await provisions(tokeninfo);
		if(data.error){displayError(data.error);return;}
		setLoading(false);
		if (data === "Invalid Session") return RedirectPage(history);
		else if (data === 'fail') setPopupState({show:true,title:"ICE Provision Error",content:"ICE Provisioned Failed"});
		else if (data==='DuplicateIceName') setPopupState({show:true,title:"ICE Provision Error",content:"ICE Provisioned Failed!!  ICE name or User already exists"});else {
			props.setIcename(props.icename);
			props.setTokeninfoToken(data);
			props.setToken(data);
			props.setRefreshIceList(!props.refreshIceList);
			setPopupState({show:true,title:"ICE Provision Success",content:"Token generated Successfully for ICE '"+props.icename+"'!!  Copy or Download the token"});
		}
    }

    const refreshForm = async () =>{
        setIcenameErrBorder(false);
        setSelAssignUser2ErrBorder(false);
		props.setToken("Click on Provision/Reregister to generate token");
		props.setIcename("");
		props.setUserid(" ");
		if (props.op === "normal") {
			const data = await getUserDetails("user");
			if(data.error){displayError(data.error);return;}
			data.sort((a,b)=>a[0].localeCompare(b[0]));
			data.splice(0, 0, ['Select User',' ','','']);
			setUsers(data.filter((e)=> (e[3] !== "Admin")));
		}
    }

    const closePopup = () =>{
        setPopupState({show:false,title:"",content:""});
	}

	
	const copyTokenFunc = () =>{
		const data = props.tokeninfoToken;
		if (!data) {
			setCopyToolTip("Nothing to Copy!");
			setTimeout(()=>{
				setCopyToolTip("Click to Copy");
			}, 1500);
			return;
		}
		const x = document.getElementById('iceToken');
		x.select();
		document.execCommand('copy');
		setCopyToolTip("Copied!");
		setTimeout(()=>{
			setCopyToolTip("Click to Copy");
		}, 1500);
	}

	const downloadToken = () =>{
		const data = props.tokeninfoToken;
		if (!data) {
			setDownloadToolTip("Nothing to Download!");
			setTimeout(()=>{
				setDownloadToolTip("Download Token");
			}, 1500);
			return;
		}
		const filename = props.icename + "_icetoken.txt";
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

    const verifyName = (iceName) =>{
        const name = iceName;
		const icelist1 = props.icelist.map(e => e.icename);
		if (icelist1.indexOf(name) > -1) setIcenameErrBorder(true);
		else setIcenameErrBorder(false);
	}
	
	const displayError = (error) =>{
        setLoading(false)
        setPopup({
            title:'ERROR',
            content:error,
            submitText:'Ok',
            show:true
        })
    }

    return (
        <Fragment>
            {popupState.show?<PopupMsg content={popupState.content} title={popupState.title} submit={closePopup} close={closePopup} submitText={"Ok"} />:null}
			{loading?<ScreenOverlay content={loading}/>:null}
			{(popup.show)?<PopupMsg submit={()=>setPopup({show:false})} close={()=>setPopup({show:false})} title={popup.title} content={popup.content} submitText={popup.submitText}/>:null}
            
            <div className="col-xs-9" style={{width: "83%"}}>
				<div className='adminControl-ip adminControl-ip-cust'><div>
                <span className="leftControl-ip" title="ICE Type">ICE Type</span>
					<label className="adminFormRadio">
						<input type="radio" checked={props.op==="normal"}  value="normal" name="provisionType" onChange={()=>{props.setOp("normal");props.setSelectProvisionType(!props.selectProvisionType);refreshForm()}} />
						<span>Normal</span>
					</label>
					<label className="adminFormRadio">
						<input type="radio" checked={props.op==="ci-cd"} value="ci-cd" name="provisionType" onChange={()=>{props.setRefreshIceList(!props.refreshIceList);props.setOp("ci-cd");refreshForm()}} />
						<span>CI/CD</span>
					</label>
				</div></div>
                <div className='adminControl-ip'><div>
					<span className="leftControl-ip" title="ICE Name">ICE Name</span>
					<input type="text" autoComplete="off" id="icename" name="icename" value={props.icename} onChange={(event)=>{props.setIcename(event.target.value);verifyName(event.target.value)}} maxLength="100" className={icenameErrBorder?"inputErrorBorder border_input-ip form-control-ip form-control-custom-ip":"border_input-ip form-control-ip form-control-custom-ip"} placeholder="ICE Name"/>
				</div></div>
                <div className='userForm adminControl-ip'><div>
					<span className="leftControl-ip" title="User">User</span>
                    <select value={props.userid} onChange={(event)=>props.setUserid(event.target.value)} disabled={props.op!=='normal'}  id="selAssignUser2" className={selAssignUser2ErrBorder?'selectErrorBorder adminSelect-ip form-control-ip':'adminSelect-ip form-control-ip'}>
                        {users.map((entry,index) => (
                            <option key={index} value={entry[1]}>{entry[0]}</option>
                        ))}
                    </select>
                </div></div>
                <div className='adminControl-ip' id="icetokenarea"><div>
					<span className="leftControl-ip" title="Token">Token</span>
					<textarea autoComplete="off" id="iceToken" value={props.token} name="iceToken" readOnly="readonly"></textarea>
					<label className="lable-cust-ip" >
						<ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip },0]} />
						<ReactTooltip id="download" effect="solid" backgroundColor="black" getContent={[() => { return downloadToolTip },0]} />
						<span className="fa fa-files-o action-cust-ip"  data-for="copy" data-tip={copyToolTip} onClick={()=>{copyTokenFunc()}} /*ng-click="copyToken($event)"*/></span>
						<span className="fa fa-download action-cust-ip" data-for="download" data-tip={downloadToolTip} onClick={()=>{downloadToken()}} /*ng-click="downloadToken($event)"*/ ></span>
					</label>
				</div></div>
            </div>
            </Fragment>
  );
}

export default IceProvisionForm;